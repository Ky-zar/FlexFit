
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createBooking } from '@/lib/actions';
import type { GymClass, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, User as UserIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useRouter } from 'next/navigation';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { getUser } from '@/lib/actions';

interface MemberBookingProps {
  gymClass: GymClass;
  user: FirebaseAuthUser;
}

function SubmitButton({ gymClass }: { gymClass: GymClass }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || (gymClass.maxSpots - (gymClass.bookedSpots || 0)) <= 0} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? 'Booking...' : 'Confirm My Spot'}
    </Button>
  );
}

export default function MemberBooking({ gymClass, user }: MemberBookingProps) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createBooking, initialState);
  const [member, setMember] = useState<User | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (user.email) {
      getUser(user.email).then(setMember);
    }
  }, [user.email]);

  useEffect(() => {
    if (state.success && state.redirectUrl) {
      router.push(state.redirectUrl);
    } else if (state.message) {
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: state.message,
      });
    }
  }, [state, toast, router]);
  
  if (!member) {
      return (
          <Card>
              <CardContent className="p-6">
                  <p>Loading your details...</p>
              </CardContent>
          </Card>
      )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Welcome Back, {member.name}!</CardTitle>
        <CardDescription>Ready to book your spot? Confirm the details below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="space-y-6">
          <input type="hidden" name="classId" value={gymClass.id} />
          <input type="hidden" name="name" value={member.name} />
          <input type="hidden" name="email" value={member.email} />
          <input type="hidden" name="membershipId" value={member.membershipId} />
          
           <div className="p-4 border rounded-md bg-muted/50">
                <div className="flex items-center gap-3">
                    <UserIcon className="h-5 w-5 text-primary" />
                    <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                </div>
                {member.membershipId && (
                    <p className="text-sm mt-2 text-muted-foreground">Membership: <span className="font-mono text-xs bg-muted px-2 py-1 rounded-md">{member.membershipId}</span></p>
                )}
           </div>

          <div className="space-y-2">
            <Label htmlFor="spots">Number of Spots</Label>
            <Input id="spots" name="spots" type="number" defaultValue="1" min="1" max={gymClass.maxSpots - (gymClass.bookedSpots || 0)} required />
             {state?.errors?.spots && <p className="text-sm font-medium text-destructive">{state.errors.spots[0]}</p>}
          </div>

          {state?.message && !state.success && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {state.message}
                </AlertDescription>
            </Alert>
          )}

          <SubmitButton gymClass={gymClass} />
        </form>
      </CardContent>
    </Card>
  );
}

