import AdminDashboard from "@/components/admin/AdminDashboard";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { GymClass, Announcement } from "@/lib/types";

async function getAdminData() {
    const classesSnapshot = await getDocs(collection(db, "classes"));
    const classes: GymClass[] = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GymClass));

    const announcementsSnapshot = await getDocs(collection(db, "announcements"));
    const announcements: Announcement[] = announcementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
    
    return { classes, announcements };
}


export default async function AdminDashboardPage() {
    const { classes, announcements } = await getAdminData();

    return (
        <div className="min-h-screen bg-muted/40">
            <AdminDashboard initialClasses={classes} initialAnnouncements={announcements} />
        </div>
    );
}
