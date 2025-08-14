'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { setInitialPassword } from '@/lib/actions';

export default function SetPasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match.',
      });
      return;
    }
    setIsLoading(true);

    try {
      const result = await setInitialPassword({ email, password });
      
      if (result.error) {
          throw new Error(result.error);
      }

      // After setting password, automatically sign the user in
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: 'Account created!',
        description: 'Redirecting to your dashboard...',
      });
      
      router.push('/account/dashboard');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to set password.',
        description: error.message || 'An unexpected error occurred.',
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
                id="password" 
                type="password" 
                disabled={isLoading} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
                id="confirmPassword" 
                type="password" 
                disabled={isLoading} 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Create Account & Login'}
          </Button>
        </div>
      </form>
    </div>
  );
}
