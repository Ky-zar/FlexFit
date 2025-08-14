
'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Booking, GymClass } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock } from 'lucide-react';
import { useState } from 'react';
import { confirmBookingPayment } from '@/lib/actions';


interface CheckoutFormProps {
  booking: Booking;
  gymClass: GymClass;
}

export default function CheckoutForm({ booking, gymClass }: CheckoutFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        // 1. Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 2. Confirm booking in database
        await confirmBookingPayment(booking.id, gymClass.id, booking.spots);

        toast({
            title: 'Payment Successful!',
            description: `Your booking for ${gymClass.title} is confirmed.`,
        });
        
        router.push(`/confirmation/${booking.id}?classId=${gymClass.id}`);

    } catch (error) {
        setIsLoading(false);
        toast({
            variant: "destructive",
            title: 'Payment Failed',
            description: error instanceof Error ? error.message : "An unknown error occurred.",
        });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <CreditCard />
            Payment Information
        </CardTitle>
        <CardDescription>
            Enter your payment details to confirm your spot.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name on Card</Label>
            <Input id="name" placeholder="John Doe" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue={booking.email} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input id="cardNumber" placeholder="•••• •••• •••• ••••" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="•••" required />
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
            {isLoading ? 'Processing...' : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Pay & Confirm Booking
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
