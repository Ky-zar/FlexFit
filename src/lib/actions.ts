
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, getDoc, doc, runTransaction, addDoc, serverTimestamp, setDoc } from 'firestore';
import type { GymClass } from './types';


const bookingSchema = z.object({
  classId: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  spots: z.coerce.number().int().min(1, 'You must book at least 1 spot.'),
  membershipId: z.string().optional(),
});

export async function createBooking(prevState: any, formData: FormData) {
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

    const newBookingRef = doc(collection(db, 'bookings'));
    newBookingId = newBookingRef.id;

    await setDoc(newBookingRef, {
        classId,
        name,
        email,
        spots,
        membershipId: membershipId || null,
        bookingDate: serverTimestamp(),
        status: 'pending'
    });

    if (!gymClass.price || gymClass.price <= 0) {
        await runTransaction(db, async (transaction) => {
            const freshClassDoc = await transaction.get(classRef);
            if (!freshClassDoc.exists()) throw new Error("Class does not exist!");

            const currentClassData = freshClassDoc.data() as GymClass;
            const availableSpots = currentClassData.maxSpots - currentClassData.bookedSpots;
            if (spots > availableSpots) {
                throw new Error(`Only ${availableSpots} spots remaining.`);
            }

            transaction.update(classRef, { bookedSpots: currentClassData.bookedSpots + spots });
            transaction.update(newBookingRef, { status: 'confirmed' });
        });
        
        revalidatePath('/schedule');
        revalidatePath('/');
    } else {
       // For paid classes, we redirect to a new checkout page.
       // The booking status remains 'pending' until payment is confirmed there.
       return redirect(`/book/checkout?bookingId=${newBookingId}`);
    }

  } catch (error: any) {
    return {
      message: error.message || 'An unexpected error occurred during booking.',
    }
  }

  // Redirect for free class confirmation
  return redirect(`/confirmation/${newBookingId}?classId=${classId}`);
}
