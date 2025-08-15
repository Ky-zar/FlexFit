'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
        <div className="flex flex-col h-screen p-8">
            <div className="flex items-center space-x-4 mb-8">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
            <div className="space-y-4">
                <Skeleton className="h-10 w-[150px]" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        </div>
    );
  }

  if (!user) {
    return null; 
  }

  return <>{children}</>;
}
