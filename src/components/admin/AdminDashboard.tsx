'use client';

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/Logo";
import ClassManager from "./ClassManager";
import AnnouncementManager from "./AnnouncementManager";
import type { Announcement, GymClass } from "@/lib/types";

interface AdminDashboardProps {
    initialClasses: GymClass[];
    initialAnnouncements: Announcement[];
}

export default function AdminDashboard({ initialClasses, initialAnnouncements }: AdminDashboardProps) {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('flexfit-admin-auth');
        router.push('/login');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="flex items-center justify-between pb-6 border-b">
                <div>
                    <Logo />
                    <p className="text-muted-foreground mt-1">Gym Management Dashboard</p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </header>

            <main className="mt-8">
                <Tabs defaultValue="classes">
                    <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                        <TabsTrigger value="classes">Manage Classes</TabsTrigger>
                        <TabsTrigger value="announcements">Manage Announcements</TabsTrigger>
                    </TabsList>
                    <TabsContent value="classes">
                        <ClassManager initialClasses={initialClasses} />
                    </TabsContent>
                    <TabsContent value="announcements">
                        <AnnouncementManager initialAnnouncements={initialAnnouncements} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
