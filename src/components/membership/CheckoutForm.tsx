'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { MembershipTier } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock } from 'lucide-react';
import { useState } from 'react';

interface CheckoutFormProps {
  tier: MembershipTier;
  isAnnual: boolean;
}

export default function CheckoutForm({ tier, isAnnual }: CheckoutFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    toast({
      title: 'Payment Successful!',
      description: `Welcome to the ${tier.name} plan.`,
    });
    
    // In a real app, you would redirect to a personalized dashboard.
    // For now, we'll go to the home page.
    router.push('/');
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <CreditCard />
            Payment Information
        </CardTitle>
        <CardDescription>
            Enter your payment details below.
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
            <Input id="email" type="email" placeholder="you@example.com" required />
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
                Pay Securely
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
