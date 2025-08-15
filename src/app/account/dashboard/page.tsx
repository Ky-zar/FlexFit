
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseAuthUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import MemberDashboard from '@/components/account/MemberDashboard';
import { getUserBookings, getUser } from '@/lib/actions';
import type { Booking, GymClass, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { redirect, useRouter } from 'next/navigation';


export default function MemberDashboardPage() {
    const [bookings, setBookings] = useState<(Booking & { gymClass?: GymClass })[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
    const router = useRouter();
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser && currentUser.email) {
                setFirebaseUser(currentUser);
                const [userBookings, userData] = await Promise.all([
                    getUserBookings(currentUser.email),
                    getUser(currentUser.email)
                ]);
                setBookings(userBookings);
                setUser(userData);
                setLoading(false);
            } else {
                 // If no user, redirect to login
                 router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="flex flex-col h-screen p-8">
                <div className="flex items-center justify-between pb-6 border-b">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-[250px]" />
                        <Skeleton className="h-4 w-[300px]" />
                    </div>
                    <Skeleton className="h-10 w-[120px]" />
                </div>
                 <div className="mt-8 space-y-4">
                    <Skeleton className="h-10 w-[300px]" />
                    <Skeleton className="h-[200px] w-full" />
                </div>
            </div>
        );
    }
    
    if (!firebaseUser) {
        // This case should be handled by the redirect, but as a fallback.
        return null;
    }

    return (
        <div className="min-h-screen bg-muted/40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
           <MemberDashboard initialBookings={bookings} user={user} />
        </div>
    );
}
