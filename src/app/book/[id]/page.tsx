import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, Clock, User, Tag } from 'lucide-react';

import type { GymClass } from '@/lib/types';
import BookingForm from '@/components/booking/BookingForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

async function getClassDetails(id: string): Promise<GymClass | undefined> {
  const docRef = doc(db, 'classes', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Ensure date is a string literal for serialization
    return { id: docSnap.id, ...data, date: data.date } as GymClass;
  } else {
    return undefined;
  }
}

export default async function BookClassPage({ params }: { params: { id: string } }) {
  const gymClass = await getClassDetails(params.id);

  if (!gymClass) {
    notFound();
  }
  
  const availableSpots = gymClass.maxSpots - (gymClass.bookedSpots || 0);

  return (
    <div className="bg-muted/40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h1 className="font-headline text-3xl md:text-4xl font-bold">Book Your Spot</h1>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="font-headline text-2xl">{gymClass.title}</CardTitle>
                    {gymClass.price && gymClass.price > 0 && (
                        <div className="text-xl font-bold text-primary">
                            ${gymClass.price.toFixed(2)}
                        </div>
                    )}
                </div>
                <CardDescription className="pt-2">{gymClass.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{format(new Date(gymClass.date), 'EEEE, MMMM do, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{gymClass.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>With {gymClass.trainer}</span>
                </div>
                <div className="!mt-6">
                    <p className="text-lg font-bold text-primary">
                        {availableSpots > 0 ? `${availableSpots} spots available` : 'This class is full'}
                    </p>
                </div>
              </CardContent>
            </Card>
             <div className="relative h-64 w-full rounded-xl shadow-lg">
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="A vibrant gym interior"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-xl"
                  data-ai-hint="gym interior"
                />
            </div>
          </div>
          <div>
            <BookingForm gymClass={gymClass} />
          </div>
        </div>
      </div>
    </div>
  );
}
