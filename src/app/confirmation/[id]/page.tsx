import { notFound } from 'next/navigation';
import { CheckCircle, Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import type { GymClass } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

async function getClassDetails(id: string): Promise<GymClass | undefined> {
  if (!id) return undefined;
  const docRef = doc(db, 'classes', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as GymClass;
  }
  return undefined;
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: { id: string },
  searchParams: { classId: string };
}) {
  const { classId } = searchParams;
  if (!classId) notFound();
  
  const gymClass = await getClassDetails(classId);

  if (!gymClass) {
    notFound();
  }

  return (
    <div className="py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center shadow-lg">
          <CardHeader className="items-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <CardTitle className="font-headline text-3xl mt-4">Booking Confirmed!</CardTitle>
            <CardDescription className="text-lg">
              Your spot is reserved. We look forward to seeing you!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-left bg-muted/50 p-6 rounded-lg">
              <h3 className="font-headline text-xl font-semibold mb-4">Booking Summary</h3>
              <div className="space-y-3">
                 <p className="font-bold text-primary text-xl">{gymClass.title}</p>
                 <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>With {gymClass.trainer}</span>
                </div>
                 <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(gymClass.date), 'EEEE, MMMM do, yyyy')}</span>
                </div>
                 <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{gymClass.time}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to your address with the booking details. If you have any questions, feel free to contact us.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild>
                <Link href="/schedule">Book Another Class</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
