
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, getDoc, doc, runTransaction, addDoc, serverTimestamp, setDoc, query, where, getDocs } from 'firebase/firestore';
import type { GymClass, Booking } from './types';


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
  let newBookingId: string;
  
  try {
    const classDoc = await getDoc(classRef);
    if (!classDoc.exists()) {
        throw new Error('Class not found.');
    }
    const gymClass = classDoc.data() as GymClass;
    
    // We can check spot availability early for a better user experience
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
        // If the class is free, it's confirmed immediately. Otherwise, it's pending.
        status: (!gymClass.price || gymClass.price <= 0) ? 'confirmed' : 'pending'
    };

    // The status is set, but we don't write to the database until we know the next step
    
    if (newBookingData.status === 'confirmed') {
        // For free classes, we write the booking and update the count in one transaction
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
            // Note: bookedSpots are now updated via a Cloud Function trigger for consistency
        });
        
        revalidatePath('/schedule');
        revalidatePath('/');
        redirect(`/confirmation/${newBookingId}?classId=${classId}`);
    } else {
       // For paid classes, just create the 'pending' booking, then redirect to checkout
       await setDoc(newBookingRef, {
            ...newBookingData,
            bookingDate: serverTimestamp(),
       });
       return { redirectUrl: `/book/checkout?bookingId=${newBookingId}` };
    }

  } catch (error: any) {
    return {
      message: error.message || 'An unexpected error occurred during booking.',
    }
  }
}


export async function confirmBookingPayment(bookingId: string) {
    const bookingRef = doc(db, 'bookings', bookingId);

    try {
        await runTransaction(db, async (transaction) => {
            const bookingDoc = await transaction.get(bookingRef);
            if (!bookingDoc.exists() || bookingDoc.data().status !== 'pending') {
                throw new Error("Booking not found or already processed.");
            }
            
            // The Cloud Function will handle spot counting when the status changes.
            transaction.update(bookingRef, { status: 'confirmed' });
        });
        
        revalidatePath('/schedule');
        revalidatePath('/');
        revalidatePath('/account/dashboard');

    } catch (error) {
        console.error("Payment confirmation failed: ", error);
        // Handle failed transaction (e.g. update booking status to 'failed')
        throw error;
    }
}


export async function getUserBookings(email: string): Promise<(Booking & { gymClass?: GymClass })[]> {
    if (!email) return [];

    const bookingsQuery = query(collection(db, 'bookings'), where('email', '==', email));
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
