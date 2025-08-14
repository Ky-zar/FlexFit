'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { LogOut, Calendar, Star, Ticket, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Booking, GymClass, User } from "@/lib/types";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import UpcomingClasses from './UpcomingClasses';
import { getUser } from '@/lib/actions';

interface MemberDashboardProps {
    initialBookings: (Booking & { gymClass?: GymClass })[];
}

export default function MemberDashboard({ initialBookings }: MemberDashboardProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const currentUser = auth.currentUser;

    useEffect(() => {
        if(currentUser?.email) {
            getUser(currentUser.email).then(userData => {
                setUser(userData);
                setLoading(false);
            })
        } else {
            setLoading(false);
        }
    }, [currentUser]);


    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast({ title: 'Logged out successfully.' });
            router.push('/login');
        } catch (error) {
            toast({ variant: "destructive", title: 'Failed to log out.' });
        }
    };

    return (
        <div className="py-8">
            <header className="flex items-center justify-between pb-6 border-b">
                <div>
                     <h1 className="text-2xl font-bold text-foreground">
                        My Account
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        Welcome back, {user?.name || currentUser?.email}!
                        {user?.membershipId && (
                             <span className="font-mono text-xs bg-muted px-2 py-1 rounded-md">{user.membershipId}</span>
                        )}
                    </p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </header>

            <main className="mt-8">
                <Tabs defaultValue="classes">
                    <TabsList>
                        <TabsTrigger value="classes"><Ticket className="mr-2 h-4 w-4" />My Classes</TabsTrigger>
                        <TabsTrigger value="subscription"><Star className="mr-2 h-4 w-4" />My Subscription</TabsTrigger>
                        <TabsTrigger value="calendar"><Calendar className="mr-2 h-4 w-4" />My Calendar</TabsTrigger>
                    </TabsList>
                    <TabsContent value="classes">
                        <UpcomingClasses bookings={initialBookings} />
                    </TabsContent>
                    <TabsContent value="subscription">
                        <p className="p-4 text-center text-muted-foreground">Subscription management coming soon.</p>
                    </TabsContent>
                    <TabsContent value="calendar">
                        <p className="p-4 text-center text-muted-foreground">Personal calendar view coming soon.</p>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
