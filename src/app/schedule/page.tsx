import ClassList from '@/components/schedule/ClassList';
import { PLACEHOLDER_CLASSES } from '@/lib/placeholder-data';
import type { GymClass } from '@/lib/types';

async function getAllClasses(): Promise<GymClass[]> {
  // In a real app, you would fetch this from Firestore
  return Promise.resolve(PLACEHOLDER_CLASSES);
}

export default async function SchedulePage() {
  const classes = await getAllClasses();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Class Schedule
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Find your next workout. Filter by day to plan your week.
        </p>
      </div>
      <ClassList initialClasses={classes} />
    </div>
  );
}
