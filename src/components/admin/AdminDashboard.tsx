'use client';

import { useRouter } from "next/navigation";
import { LogOut, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClassManager from "./ClassManager";
import AnnouncementManager from "./AnnouncementManager";
import CalendarView from "./CalendarView";
import MembershipManager from "./MembershipManager";
import type { Announcement, GymClass, MembershipTier } from "@/lib/types";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";


interface AdminDashboardProps {
    initialClasses: GymClass[];
    initialAnnouncements: Announcement[];
    initialTiers: MembershipTier[];
}

export default function AdminDashboard({ initialClasses, initialAnnouncements, initialTiers }: AdminDashboardProps) {
    const router = useRouter();
    const { toast } = useToast();

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
                <h1 className="text-2xl font-bold text-foreground">
                    Dashboard
                </h1>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </header>

            <main className="mt-8">
                <Tabs defaultValue="classes">
                    <TabsList className="flex flex-wrap h-auto">
                        <TabsTrigger value="classes">Manage Classes</TabsTrigger>
                        <TabsTrigger value="announcements">Manage Announcements</TabsTrigger>
                        <TabsTrigger value="memberships">
                            <Star className="mr-2 h-4 w-4" />
                            Manage Memberships
                        </TabsTrigger>
                        <TabsTrigger value="calendar">
                            <Calendar className="mr-2 h-4 w-4" />
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="classes">
                        <ClassManager initialClasses={initialClasses} />
                    </TabsContent>
                    <TabsContent value="announcements">
                        <AnnouncementManager initialAnnouncements={initialAnnouncements} />
                    </TabsContent>
                    <TabsContent value="memberships">
                        <MembershipManager initialTiers={initialTiers} />
                    </TabsContent>
                    <TabsContent value="calendar">
                        <CalendarView classes={initialClasses} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
