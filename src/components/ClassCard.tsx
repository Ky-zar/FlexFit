import Link from 'next/link';
import { Calendar, Clock, User, Users, Tag } from 'lucide-react';
import { format } from 'date-fns';
import type { GymClass } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ClassCardProps {
  gymClass: GymClass;
}

export default function ClassCard({ gymClass }: ClassCardProps) {
  const availableSpots = gymClass.maxSpots - gymClass.bookedSpots;
  const isFull = availableSpots <= 0;
  const spotsPercentage = (gymClass.bookedSpots / gymClass.maxSpots) * 100;

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-primary/20">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-2xl">{gymClass.title}</CardTitle>
            {gymClass.price && gymClass.price > 0 && (
                <Badge variant="secondary" className="text-lg bg-accent text-accent-foreground">
                    ${gymClass.price.toFixed(2)}
                </Badge>
            )}
        </div>
        <CardDescription className="flex items-center gap-2 pt-2">
          <User className="h-4 w-4" />
          <span>{gymClass.trainer}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-muted-foreground">{gymClass.description}</p>
        <div className="flex flex-col space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{format(new Date(gymClass.date), 'EEEE, MMMM do')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>{gymClass.time}</span>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Spots</span>
            </div>
            <span className="font-medium text-foreground">
              {gymClass.bookedSpots} / {gymClass.maxSpots}
            </span>
          </div>
          <Progress value={spotsPercentage} aria-label={`${spotsPercentage}% spots booked`} />
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4">
        <div className="flex justify-between items-center">
          <Badge variant={isFull ? 'destructive' : 'secondary'}>
            {isFull ? 'Class Full' : `${availableSpots} Spots Left`}
          </Badge>
          <Button asChild disabled={isFull} className="bg-accent hover:bg-accent/90 text-accent-foreground disabled:bg-muted disabled:text-muted-foreground">
            <Link href={`/book/${gymClass.id}`}>Book Now</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
