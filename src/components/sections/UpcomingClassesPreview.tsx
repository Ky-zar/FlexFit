import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ClassCard from '@/components/ClassCard';
import type { GymClass } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';


async function getUpcomingClasses(): Promise<GymClass[]> {
  const classesCol = collection(db, 'classes');
  const q = query(classesCol, orderBy('date'), orderBy('time'), limit(3));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GymClass));
}

export default async function UpcomingClassesPreview() {
  const upcomingClasses = await getUpcomingClasses();

  return (
    <section className="py-20 sm:py-24">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Upcoming Classes
          </h2>
          <Button variant="link" asChild className="text-primary">
            <Link href="/schedule">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {upcomingClasses.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {upcomingClasses.map((gymClass) => (
              <ClassCard key={gymClass.id} gymClass={gymClass} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-muted-foreground">
            No upcoming classes. Check back soon!
          </p>
        )}
      </div>
    </section>
  );
}
