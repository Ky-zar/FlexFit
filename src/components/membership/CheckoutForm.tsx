
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile } from '@/lib/actions';

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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match.',
      });
      return;
    }
     if (password.length < 6) {
        toast({
            variant: 'destructive',
            title: 'Password must be at least 6 characters.',
        });
        return;
    }

    setIsLoading(true);

    try {
      // 1. Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 2. Create user with client-side SDK
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Save user profile to Firestore via a simple server action
      await createUserProfile({
        uid: user.uid,
        email,
        name,
        tierId: tier.id,
        tierName: tier.name,
        isAnnual,
      });

      toast({
        title: 'Account Created!',
        description: `Welcome to the ${tier.name} plan. Redirecting to your dashboard...`,
      });

      router.push('/account/dashboard');

    } catch (error: any) {
      let description = 'An unexpected error occurred.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email is already associated with an account. Please log in.';
      } else if (error.code === 'auth/weak-password') {
        description = 'The password is too weak. Please choose a stronger password.';
      }
      toast({
        variant: 'destructive',
        title: 'Account Creation Failed',
        description,
      });
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

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
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
                Pay Securely & Create Account
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
