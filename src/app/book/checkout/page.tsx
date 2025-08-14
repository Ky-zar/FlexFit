
import { notFound, redirect } from 'next/navigation';
import { CreditCard, Lock, Check, User, Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';

import { db } from '@/lib/firebase';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import type { MembershipTier, GymClass, Booking } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import CheckoutForm from '@/components/booking/ClassCheckoutForm';

async function getBookingDetails(id: string): Promise<{booking: Booking, gymClass: GymClass} | undefined> {
  if (!id) return undefined;
  const bookingRef = doc(db, 'bookings', id);
  const bookingSnap = await getDoc(bookingRef);

  if (!bookingSnap.exists()) {
    return undefined;
  }
  
  const booking = { id: bookingSnap.id, ...bookingSnap.data() } as Booking;

  const classRef = doc(db, 'classes', booking.classId);
  const classSnap = await getDoc(classRef);
  
  if(!classSnap.exists()){
      return undefined;
  }

  const gymClass = { id: classSnap.id, ...classSnap.data() } as GymClass;
  
  return { booking, gymClass };
}

export default async function ClassCheckoutPage({
  searchParams,
}: {
  searchParams: { bookingId: string };
}) {
  const { bookingId } = searchParams;
  
  if (!bookingId) {
      notFound();
  }

  const details = await getBookingDetails(bookingId);

  if (!details) {
    notFound();
  }

  const { booking, gymClass } = details;
  
  const totalPrice = (gymClass.price || 0) * booking.spots;

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-center mb-12">
          Complete Your Booking
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <CheckoutForm booking={booking} gymClass={gymClass} />

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="font-bold text-lg">{gymClass.title}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(gymClass.date), 'EEEE, MMMM do, yyyy')} at {gymClass.time}</span>
                </div>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>With {gymClass.trainer}</span>
                </div>
                 <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per spot</span>
                  <span className="font-semibold">${(gymClass.price || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number of spots</span>
                  <span className="font-semibold">x {booking.spots}</span>
                </div>
                 {booking.membershipId && <div className="flex justify-between text-green-600"><span>Membership Discount</span><span>- $5.00</span></div> }
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                   <span>${booking.membershipId ? (totalPrice - 5).toFixed(2) : totalPrice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
