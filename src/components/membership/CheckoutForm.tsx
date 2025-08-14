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
import { purchaseMembership } from '@/lib/actions';

interface CheckoutFormProps {
  tier: MembershipTier;
  isAnnual: boolean;
}

export default function CheckoutForm({ tier, isAnnual }: CheckoutFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        const result = await purchaseMembership({
            tierId: tier.id,
            isAnnual,
            email,
            name
        });

        if (result.error) {
            throw new Error(result.error);
        }
        
        toast({
          title: 'Payment Successful!',
          description: `Welcome to the ${tier.name} plan.`,
        });
        
        router.push(`/account/create-password?email=${encodeURIComponent(email)}`);

    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'An error occurred',
            description: error instanceof Error ? error.message : "Could not create membership."
        })
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <CreditCard />
            Account & Payment
        </CardTitle>
        <CardDescription>
            Enter your details below to create your account and complete the purchase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
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
          
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || !name || !email}>
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
