
'use client';

import { useState, useMemo } from 'react';
import { getDay, parseISO } from 'date-fns';
import type { GymClass } from '@/lib/types';
import ClassCard from '@/components/ClassCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ClassListProps {
  initialClasses: GymClass[];
}

const daysOfWeek = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function ClassList({ initialClasses }: ClassListProps) {
  const [selectedDay, setSelectedDay] = useState('all');

  const filteredClasses = useMemo(() => {
    if (selectedDay === 'all') {
      return initialClasses;
    }
    return initialClasses.filter(c => {
        // Date from firestore is a string 'YYYY-MM-DD'
        const classDate = new Date(c.date);
        // Adjust for timezone offset to prevent day shifts
        const userTimezoneOffset = classDate.getTimezoneOffset() * 60000;
        return getDay(new Date(classDate.getTime() + userTimezoneOffset)).toString() === selectedDay
    });
  }, [initialClasses, selectedDay]);

  return (
    <div className="mt-12">
      <div className="flex justify-end">
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Days</SelectItem>
            {daysOfWeek.map((day, index) => (
              <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredClasses.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((gymClass) => (
            <ClassCard key={gymClass.id} gymClass={gymClass} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-xl text-muted-foreground">
            No classes available for the selected day.
          </p>
        </div>
      )}
    </div>
  );
}
