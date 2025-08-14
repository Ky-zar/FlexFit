'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { GymClass } from '@/lib/types';
import { format, parseISO, isSameDay } from 'date-fns';
import { Badge } from '../ui/badge';
import Link from 'next/link';

interface CalendarViewProps {
  classes: GymClass[];
}

export default function CalendarView({ classes }: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const classesForSelectedDay = date 
    ? classes.filter(c => isSameDay(parseISO(c.date), date))
    : [];

  const classDays = classes.map(c => parseISO(c.date));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Calendar</CardTitle>
        <CardDescription>View your scheduled classes in a calendar format.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{ booked: classDays }}
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
            Classes for {date ? format(date, 'MMMM do, yyyy') : '...'}
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {classesForSelectedDay.length > 0 ? (
              classesForSelectedDay.sort((a,b) => a.time.localeCompare(b.time)).map(c => (
                <Link href={`/book/${c.id}`} key={c.id} className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{c.title}</p>
                      <p className="text-sm text-muted-foreground">{c.time} with {c.trainer}</p>
                    </div>
                    <Badge variant="secondary">{c.bookedSpots} / {c.maxSpots}</Badge>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground italic">No classes scheduled for this day.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
