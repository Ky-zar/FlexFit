
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, getDoc, doc, runTransaction, addDoc, serverTimestamp, setDoc, query, where, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import type { GymClass, Booking, User } from './types';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from './firebase-admin';


const bookingSchema = z.object({
  classId: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  spots: z.coerce.number().int().min(1, 'You must book at least 1 spot.'),
  membershipId: z.string().optional(),
});

type BookingState = {
    errors?: {
        classId?: string[];
        name?: string[];
        email?: string[];
        spots?: string[];
        membershipId?: string[];
    };
    message?: string | null;
    redirectUrl?: string | null;
}

export async function createBooking(prevState: BookingState, formData: FormData): Promise<BookingState> {
  const validatedFields = bookingSchema.safeParse({
    classId: formData.get('classId'),
    name: formData.get('name'),
    email: formData.get('email'),
    spots: formData.get('spots'),
    membershipId: formData.get('membershipId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check your input.',
    };
  }
  
  const { classId, name, email, spots, membershipId } = validatedFields.data;

  const classRef = doc(db, 'classes', classId);
  
  try {
    let newBookingId: string;
    const classDoc = await getDoc(classRef);
    if (!classDoc.exists()) {
        throw new Error('Class not found.');
    }
    const gymClass = classDoc.data() as GymClass;
    
    const availableSpots = gymClass.maxSpots - (gymClass.bookedSpots || 0);
    if (spots > availableSpots) {
        return { message: `Booking failed: Only ${availableSpots} spots remaining.` };
    }

    const newBookingRef = doc(collection(db, 'bookings'));
    newBookingId = newBookingRef.id;

    const newBookingData: Omit<Booking, 'id' | 'bookingDate'> = {
        classId,
        name,
        email,
        spots,
        membershipId: membershipId || null,
        status: (!gymClass.price || gymClass.price <= 0) ? 'confirmed' : 'pending'
    };
    
    if (newBookingData.status === 'confirmed') {
        await runTransaction(db, async (transaction) => {
            const freshClassDoc = await transaction.get(classRef);
            if (!freshClassDoc.exists()) throw new Error("Class does not exist!");

            const currentClassData = freshClassDoc.data() as GymClass;
            const currentBookedSpots = currentClassData.bookedSpots || 0;
             if (spots > (currentClassData.maxSpots - currentBookedSpots)) {
                throw new Error(`Only ${currentClassData.maxSpots - currentBookedSpots} spots remaining.`);
            }

            transaction.set(newBookingRef, {
                ...newBookingData,
                bookingDate: serverTimestamp(),
            });
        });
        
        revalidatePath('/schedule');
        revalidatePath('/');
        redirect(`/confirmation/${newBookingId}?classId=${classId}`);

    } else {
       await setDoc(newBookingRef, {
            ...newBookingData,
            bookingDate: serverTimestamp(),
       });
       redirect(`/book/checkout?bookingId=${newBookingId}`);
    }

  } catch (error: any) {
    if (error.name === 'NEXT_REDIRECT') {
        throw error;
    }
    return {
      message: error.message || 'An unexpected error occurred during booking.',
    }
  }
}


export async function confirmBookingPayment(bookingId: string) {
    'use server';
    if (!bookingId) {
        throw new Error("Booking ID is required.");
    }

    const bookingRef = doc(db, 'bookings', bookingId);

    try {
        await updateDoc(bookingRef, { status: 'confirmed' });
        
        revalidatePath('/schedule');
        revalidatePath('/');
        revalidatePath('/account/dashboard');

    } catch (error) {
        console.error("Payment confirmation failed: ", error);
        throw new Error("Failed to confirm payment and update booking.");
    }
}


export async function getUserBookings(email: string): Promise<(Booking & { gymClass?: GymClass })[]> {
    if (!email) return [];

    const bookingsQuery = query(collection(db, 'bookings'), where('email', '==', email), where('status', '==', 'confirmed'));
    const bookingSnapshots = await getDocs(bookingsQuery);
    
    const bookings: (Booking & { gymClass?: GymClass })[] = [];

    for (const bookingDoc of bookingSnapshots.docs) {
        const booking = { id: bookingDoc.id, ...bookingDoc.data() } as Booking;
        
        const classRef = doc(db, 'classes', booking.classId);
        const classSnap = await getDoc(classRef);

        if (classSnap.exists()) {
            booking.gymClass = { id: classSnap.id, ...classSnap.data() } as GymClass;
        }
        
        bookings.push(booking);
    }
    
    // Sort by class date, most recent first
    bookings.sort((a, b) => new Date(b.gymClass?.date ?? 0).getTime() - new Date(a.gymClass?.date ?? 0).getTime());

    return bookings;
}

const purchaseMembershipSchema = z.object({
    tierId: z.string(),
    isAnnual: z.boolean(),
    email: z.string().email(),
    name: z.string().min(2),
});

export async function purchaseMembership(input: z.infer<typeof purchaseMembershipSchema>) {
    const validated = purchaseMembershipSchema.safeParse(input);
    if(!validated.success) return { error: "Invalid input." };
    if (!adminApp) return { error: "Admin SDK not initialized." };

    const { tierId, isAnnual, email, name } = validated.data;
    const auth = getAuth(adminApp);

    try {
        // 1. Create user in Firebase Auth
        let userRecord = await auth.createUser({
            email,
            displayName: name,
            emailVerified: true,
        });
        
        // 2. Create user document in Firestore
        const membershipId = `MEM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const userRef = doc(db, 'users', userRecord.uid);
        
        await setDoc(userRef, {
            uid: userRecord.uid,
            email,
            name,
            membershipId,
            membershipTierId: tierId,
            membershipIsAnnual: isAnnual,
            joinDate: serverTimestamp(),
        });
        
        return { uid: userRecord.uid };

    } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
            return { error: 'An account with this email already exists.' };
        }
        console.error(error);
        return { error: 'Failed to create account.' };
    }
}

const setPasswordSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters.')
});

export async function setInitialPassword(input: z.infer<typeof setPasswordSchema>) {
    const validated = setPasswordSchema.safeParse(input);
    if (!validated.success) {
        return { error: validated.error.flatten().fieldErrors.password?.[0] || "Invalid input" };
    }
    if (!adminApp) return { error: "Admin SDK not initialized." };
    
    const { email, password } = validated.data;
    const auth = getAuth(adminApp);
    
    try {
        const user = await auth.getUserByEmail(email);
        await auth.updateUser(user.uid, { password });
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Could not set password.' };
    }
}

export async function getUser(email: string): Promise<User | null> {
    if (!email) return null;
    const userQuery = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(userQuery);
    if(querySnapshot.empty) return null;
    const userData = querySnapshot.docs[0].data();
    // Convert Firestore Timestamp to ISO string
    if (userData.joinDate && userData.joinDate.toDate) {
        userData.joinDate = userData.joinDate.toDate().toISOString();
    }
    return userData as User;
}
