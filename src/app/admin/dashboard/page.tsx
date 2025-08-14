import AdminDashboard from "@/components/admin/AdminDashboard";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import type { GymClass, Announcement, MembershipTier } from "@/lib/types";

async function getAdminData() {
    const classesSnapshot = await getDocs(collection(db, "classes"));
    const classes: GymClass[] = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GymClass));

    const announcementsSnapshot = await getDocs(collection(db, "announcements"));
    const announcements: Announcement[] = announcementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
    
    const tiersSnapshot = await getDocs(query(collection(db, "membershipTiers"), orderBy('monthlyPrice')));
    const membershipTiers: MembershipTier[] = tiersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MembershipTier));

    return { classes, announcements, membershipTiers };
}


export default async function AdminDashboardPage() {
    const { classes, announcements, membershipTiers } = await getAdminData();

    return (
        <div className="min-h-screen bg-muted/40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <AdminDashboard 
                initialClasses={classes} 
                initialAnnouncements={announcements}
                initialTiers={membershipTiers}
            />
        </div>
    );
}
