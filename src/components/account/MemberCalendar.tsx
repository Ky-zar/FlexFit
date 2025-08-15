
'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Booking, GymClass } from '@/lib/types';
import { format, parseISO, isSameDay } from 'date-fns';
import Link from 'next/link';
import { Badge } from '../ui/badge';

interface MemberCalendarProps {
  bookings: (Booking & { gymClass?: GymClass })[];
}

export default function MemberCalendar({ bookings }: MemberCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const validBookings = bookings.filter(b => b.gymClass);

  const classesForSelectedDay = date 
    ? validBookings.filter(b => isSameDay(parseISO(b.gymClass!.date), date))
    : [];

  const bookedDays = validBookings.map(b => parseISO(b.gymClass!.date));

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Class Calendar</CardTitle>
        <CardDescription>Here are your upcoming classes at a glance.</CardDescription>
      </CardHeader>
       <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{ booked: bookedDays }}
            modifiersStyles={{ 
              booked: { 
                fontWeight: 'bold',
                color: 'hsl(var(--primary-foreground))',
                backgroundColor: 'hsl(var(--primary))' 
              } 
            }}
          />
        </div>
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">
            Bookings for {date ? format(date, 'MMMM do, yyyy') : '...'}
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {classesForSelectedDay.length > 0 ? (
              classesForSelectedDay.map(b => (
                <Link href={`/book/${b.classId}`} key={b.id} className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{b.gymClass?.title}</p>
                      <p className="text-sm text-muted-foreground">{b.gymClass?.time} with {b.gymClass?.trainer}</p>
                    </div>
                     <Badge variant="secondary" className="capitalize">{b.status}</Badge>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground italic">No classes booked for this day.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
