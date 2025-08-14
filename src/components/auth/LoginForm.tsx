'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';


export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Hardcoded admin email
  const ADMIN_EMAIL = 'admin@flexfit.com';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      toast({
        title: 'Login Successful',
        description: 'Redirecting to your dashboard...',
      });

      if(user.email === ADMIN_EMAIL) {
          router.push('/admin/dashboard');
      } else {
          router.push('/account/dashboard');
      }

    } catch (error: any) {
        let description = 'An unexpected error occurred.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = 'Invalid email or password.';
        }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description,
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
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={e => setEmail(e.target.value)}
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
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </div>
      </form>
    </div>
  );
}
