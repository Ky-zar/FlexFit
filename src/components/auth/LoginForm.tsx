'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    // In a real app, you would use Firebase Auth to sign in.
    // For this demo, we'll simulate a successful login.
    setTimeout(() => {
      try {
        // Simulate successful login
        localStorage.setItem('flexfit-admin-auth', 'true');
        toast({
          title: 'Login Successful',
          description: 'Redirecting to the dashboard...',
        });
        router.push('/admin/dashboard');
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'An unexpected error occurred.',
        });
        setIsLoading(false);
      }
    }, 1000);
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
              placeholder="admin@flexfit.com"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              defaultValue="admin@flexfit.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" disabled={isLoading} defaultValue="password" />
          </div>
          <Button disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </div>
      </form>
    </div>
  );
}
