'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const bookingSchema = z.object({
  classId: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  spots: z.coerce.number().int().min(1, 'You must book at least 1 spot.'),
});

// In a real app, these functions would interact with your database (e.g., Firestore).
// For this example, we'll simulate the interaction.
import { PLACEHOLDER_CLASSES, PLACEHOLDER_BOOKINGS } from './placeholder-data';

export async function createBooking(prevState: any, formData: FormData) {
  const validatedFields = bookingSchema.safeParse({
    classId: formData.get('classId'),
    name: formData.get('name'),
    email: formData.get('email'),
    spots: formData.get('spots'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check your input.',
    };
  }
  
  const { classId, name, email, spots } = validatedFields.data;

  // Simulate checking for available spots
  const gymClass = PLACEHOLDER_CLASSES.find(c => c.id === classId);
  if (!gymClass) {
    return { message: 'Class not found.' };
  }
  const availableSpots = gymClass.maxSpots - gymClass.bookedSpots;
  if (spots > availableSpots) {
    return { message: `Only ${availableSpots} spots remaining.` };
  }

  // Simulate saving the booking
  const newBookingId = `booking${Date.now()}`;
  const newBooking = {
    id: newBookingId,
    classId,
    name,
    email,
    spots,
    bookingDate: new Date().toISOString(),
  };
  
  // In a real app, you would save `newBooking` to Firestore.
  // We'll just log it here.
  console.log('New Booking:', newBooking);

  // Revalidate paths to reflect updated data (e.g., booked spots)
  revalidatePath('/schedule');
  revalidatePath('/');

  // Redirect to confirmation page
  redirect(`/confirmation/${newBookingId}?classId=${classId}`);
}
