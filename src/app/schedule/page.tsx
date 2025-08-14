import ClassList from '@/components/schedule/ClassList';
import type { GymClass } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

async function getAllClasses(): Promise<GymClass[]> {
  const classesCol = collection(db, 'classes');
  const q = query(classesCol, orderBy('date'), orderBy('time'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GymClass));
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
