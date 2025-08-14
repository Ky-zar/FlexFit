import { Dumbbell } from 'lucide-react';
import React from 'react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Dumbbell className="h-6 w-6 text-primary" />
      <span className="font-headline text-xl font-bold text-gray-800 dark:text-white">FlexFit</span>
    </div>
  );
}
