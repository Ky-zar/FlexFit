
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createBooking } from '@/lib/actions';
import type { GymClass } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  gymClass: GymClass;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || (gymClass.maxSpots - gymClass.bookedSpots) <= 0} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? 'Booking...' : 'Confirm Booking'}
    </Button>
  );
}

export default function BookingForm({ gymClass }: BookingFormProps) {
  const initialState = { message: null, errors: {}, redirectUrl: null };
  const [state, dispatch] = useFormState(createBooking, initialState);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.message) {
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Enter Your Details</CardTitle>
        <CardDescription>Complete the form to reserve your spot.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="space-y-6">
          <input type="hidden" name="classId" value={gymClass.id} />
          
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required />
            {state?.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="spots">Number of Spots</Label>
            <Input id="spots" name="spots" type="number" defaultValue="1" min="1" max={gymClass.maxSpots - gymClass.bookedSpots} required />
             {state?.errors?.spots && <p className="text-sm font-medium text-destructive">{state.errors.spots[0]}</p>}
          </div>

           <div className="space-y-2">
            <Label htmlFor="membershipId">Membership ID (Optional)</Label>
            <Input id="membershipId" name="membershipId" placeholder="MEM12345" />
            {state?.errors?.membershipId && <p className="text-sm font-medium text-destructive">{state.errors.membershipId[0]}</p>}
          </div>
          
          {state?.message && !state.errors && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {state.message}
                </AlertDescription>
            </Alert>
          )}

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
