
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, getDoc, doc, runTransaction, addDoc, serverTimestamp, setDoc, query, where, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import type { GymClass, Booking, User, BookingState } from './types';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from './firebase-admin';


const bookingSchema = z.object({
  classId: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  spots: z.coerce.number().int().min(1, 'You must book at least 1 spot.'),
  membershipId: z.string().optional(),
});


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

    // Use a transaction to ensure atomicity
    const bookingResultUrl = await runTransaction(db, async (transaction) => {
        const freshClassDoc = await transaction.get(classRef);
        if (!freshClassDoc.exists()) throw new Error("Class does not exist!");

        const currentClassData = freshClassDoc.data() as GymClass;
        const currentBookedSpots = currentClassData.bookedSpots || 0;
        if (spots > (currentClassData.maxSpots - currentBookedSpots)) {
            throw new Error(`Only ${currentClassData.maxSpots - currentBookedSpots} spots remaining.`);
        }

        const isFree = !currentClassData.price || currentClassData.price <= 0;
        const newBookingData: Omit<Booking, 'id' | 'bookingDate'> = {
            classId,
            name,
            email,
            spots,
            membershipId: membershipId || null,
            status: isFree ? 'confirmed' : 'pending'
        };

        transaction.set(newBookingRef, {
            ...newBookingData,
            bookingDate: serverTimestamp(),
        });
        
        if (isFree) {
            // Directly update booked spots for free classes
            transaction.update(classRef, { bookedSpots: currentBookedSpots + spots });
            return `/confirmation/${newBookingId}?classId=${classId}`;
        } else {
            // For paid classes, just create the pending booking
            return `/book/checkout?bookingId=${newBookingId}`;
        }
    });

    revalidatePath('/schedule');
    revalidatePath('/');
    revalidatePath(`/book/${classId}`);
    
    return { success: true, redirectUrl: bookingResultUrl };

  } catch (error: any) {
    return {
      message: error.message || 'An unexpected error occurred during booking.',
    }
  }
}


export async function confirmBookingPayment(bookingId: string) {
    if (!bookingId) {
        return { error: "Booking ID is required." };
    }

    const bookingRef = doc(db, 'bookings', bookingId);
    
    try {
        await runTransaction(db, async (transaction) => {
            const bookingDoc = await transaction.get(bookingRef);
            if (!bookingDoc.exists()) {
                throw new Error("Booking not found.");
            }

            const bookingData = bookingDoc.data() as Booking;
            if (bookingData.status === 'confirmed') {
                // To prevent double-counting if the function is ever called twice
                return; 
            }
            
            const classRef = doc(db, 'classes', bookingData.classId);
            const classDoc = await transaction.get(classRef);
            if (!classDoc.exists()) {
                throw new Error("Associated class not found.");
            }
            
            const classData = classDoc.data() as GymClass;
            const newBookedSpots = (classData.bookedSpots || 0) + bookingData.spots;
            
            if (newBookedSpots > classData.maxSpots) {
                throw new Error("Class is now full. Payment cannot be completed.");
            }

            transaction.update(bookingRef, { status: 'confirmed' });
            transaction.update(classRef, { bookedSpots: newBookedSpots });
        });

        revalidatePath('/schedule');
        revalidatePath('/');
        revalidatePath('/account/dashboard');
        return { success: true };

    } catch (error) {
        console.error("Payment confirmation failed: ", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to confirm payment and update booking.";
        return { error: errorMessage };
    }
}


export async function getUserBookings(email: string): Promise<(Booking & { gymClass?: GymClass })[]> {
    if (!email) return [];

    const bookingsQuery = query(collection(db, 'bookings'), where('email', '==', email), where('status', '==', 'confirmed'));
    const bookingSnapshots = await getDocs(bookingsQuery);
    
    const bookings: (Booking & { gymClass?: GymClass })[] = [];

    for (const bookingDoc of bookingSnapshots.docs) {
        const bookingData = bookingDoc.data();
        const booking = { 
            id: bookingDoc.id, 
            ...bookingData,
            bookingDate: bookingData.bookingDate.toDate().toISOString()
        } as Booking;
        
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
    if (!adminApp) return { error: "Admin SDK not initialized. Please contact support." };

    const { tierId, isAnnual, email, name } = validated.data;
    const auth = getAuth(adminApp);

    try {
        // 1. Create user in Firebase Auth
        let userRecord;
        try {
            userRecord = await auth.createUser({
                email,
                displayName: name,
                emailVerified: true, // Auto-verify email on creation via trusted server action
            });
        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                return { error: 'An account with this email already exists.' };
            }
            throw error; // Rethrow other auth errors
        }
        
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
        
        return { success: true, uid: userRecord.uid };

    } catch (error: any) {
        console.error("Membership Purchase Error:", error);
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
    if (!adminApp) return { error: "Admin SDK not initialized. Please contact support." };
    
    const { email, password } = validated.data;
    const auth = getAuth(adminApp);
    
    try {
        const user = await auth.getUserByEmail(email);
        await auth.updateUser(user.uid, { password });
        return { success: true };
    } catch (error) {
        console.error("Set Password Error:", error);
        return { error: 'Could not set password.' };
    }
}

export async function getUser(email: string): Promise<User | null> {
    if (!email) return null;
    const userQuery = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(userQuery);
    if(querySnapshot.empty) return null;
    
    const userData = querySnapshot.docs[0].data();
    
    // Convert Firestore Timestamp to ISO string for serialization
    if (userData.joinDate && userData.joinDate.toDate) {
        return {
            ...userData,
            joinDate: userData.joinDate.toDate().toISOString(),
        } as User;
    }
    return userData as User;
}
