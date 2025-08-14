import AdminDashboard from "@/components/admin/AdminDashboard";
import { PLACEHOLDER_ANNOUNCEMENTS, PLACEHOLDER_CLASSES } from "@/lib/placeholder-data";

export default function AdminDashboardPage() {
    // In a real app, you'd fetch this data from Firestore
    const classes = PLACEHOLDER_CLASSES;
    const announcements = PLACEHOLDER_ANNOUNCEMENTS;

    return (
        <div className="min-h-screen bg-muted/40">
            <AdminDashboard initialClasses={classes} initialAnnouncements={announcements} />
        </div>
    );
}
