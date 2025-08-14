
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, getDoc, doc, runTransaction, addDoc, serverTimestamp } from 'firebase/firestore';
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

  // Placeholder for discount logic
  if (membershipId) {
    // In a real app, you would look up the membershipId in your database
    // to verify it's valid and determine the discount.
    // For example:
    // const membership = await getMembership(membershipId);
    // if (membership.type === 'premium') { /* apply discount */ }
    console.log(`Membership ID ${membershipId} provided. Discount logic would apply here.`);
  }

  try {
    const classRef = doc(db, 'classes', classId);
    
    const newBookingId = await runTransaction(db, async (transaction) => {
      const classDoc = await transaction.get(classRef);
      if (!classDoc.exists()) {
        throw new Error('Class not found.');
      }

      const gymClass = classDoc.data() as GymClass;
      const availableSpots = gymClass.maxSpots - gymClass.bookedSpots;
      
      if (spots > availableSpots) {
        throw new Error(`Only ${availableSpots} spots remaining.`);
      }

      const updatedBookedSpots = gymClass.bookedSpots + spots;
      transaction.update(classRef, { bookedSpots: updatedBookedSpots });
      
      const bookingsCol = collection(db, 'bookings');
      const newBookingRef = await addDoc(bookingsCol, {
        classId,
        name,
        email,
        spots,
        membershipId: membershipId || null,
        bookingDate: serverTimestamp(),
      });
      return newBookingRef.id;
    });

    revalidatePath('/schedule');
    revalidatePath('/');
    redirect(`/confirmation/${newBookingId}?classId=${classId}`);

  } catch (error: any) {
    return {
      message: error.message || 'An unexpected error occurred during booking.',
    }
  }
}
