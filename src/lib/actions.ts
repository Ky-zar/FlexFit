
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, getDoc, doc, runTransaction, addDoc, serverTimestamp, setDoc, query, where, getDocs, updateDoc, writeBatch, Timestamp, orderBy } from 'firebase/firestore';
import type { GymClass, Booking, User, BookingState } from './types';

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
            transaction.update(classRef, { bookedSpots: currentBookedSpots + spots });
            return `/confirmation/${newBookingId}?classId=${classId}`;
        } else {
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
        } as Booking;
        
        const classRef = doc(db, 'classes', booking.classId);
        const classSnap = await getDoc(classRef);

        if (classSnap.exists()) {
            booking.gymClass = { id: classSnap.id, ...classSnap.data() } as GymClass;
        }
        
        bookings.push(booking);
    }
    
    bookings.sort((a, b) => new Date(b.gymClass?.date ?? 0).getTime() - new Date(a.gymClass?.date ?? 0).getTime());

    return bookings;
}

const createUserProfileSchema = z.object({
    uid: z.string(),
    email: z.string().email(),
    name: z.string(),
    tierId: z.string(),
    tierName: z.string(),
    isAnnual: z.boolean(),
});

export async function createUserProfile(input: z.infer<typeof createUserProfileSchema>) {
    const validated = createUserProfileSchema.safeParse(input);
    if(!validated.success) {
        // This should not happen if called from the client with correct data
        throw new Error("Invalid user profile data.");
    }

    const { uid, email, name, tierId, tierName, isAnnual } = validated.data;
    
    const userRef = doc(db, 'users', uid);
    const membershipId = `MEM-${uid.slice(0, 6).toUpperCase()}`;

    const newUser: User = {
        uid,
        email,
        name,
        membershipId,
        membershipTierId: tierId,
        membershipTierName: tierName,
        membershipIsAnnual: isAnnual,
        joinDate: new Date().toISOString(),
    };

    try {
        await setDoc(userRef, newUser);
        return { success: true };
    } catch(error) {
        // Log the error for debugging
        console.error("Failed to create user profile in Firestore:", error);
        // We might want to handle this case, e.g., by deleting the auth user
        // to allow them to try again, but for now, we'll just re-throw.
        throw new Error("Failed to save user details.");
    }
}


export async function getUser(email: string): Promise<User | null> {
    if (!email) return null;
    
    const userQuery = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(userQuery);
    
    if (querySnapshot.empty) return null;
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    const joinDate = userData.joinDate;
    
    const user: User = {
        uid: userDoc.id,
        email: userData.email,
        name: userData.name,
        membershipId: userData.membershipId,
        membershipTierId: userData.membershipTierId,
        membershipTierName: userData.membershipTierName,
        membershipIsAnnual: userData.membershipIsAnnual,
        joinDate: joinDate,
    };
    
    return user;
}


export async function getAllUsers(): Promise<User[]> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, orderBy('joinDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            uid: doc.id
        } as User;
    });
}
