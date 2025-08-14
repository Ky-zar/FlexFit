import { auth } from '@/lib/firebase';
import MemberDashboard from '@/components/account/MemberDashboard';
import { getUserBookings } from '@/lib/actions';
import type { Booking, GymClass } from '@/lib/types';
import { onAuthStateChanged } from 'firebase/auth';

async function getMemberData() {
    const user = auth.currentUser;
    if (!user || !user.email) {
        // This case should be handled by the layout, but as a fallback:
        return { bookings: [] };
    }
    const bookings = await getUserBookings(user.email);
    return { bookings };
}

export default async function MemberDashboardPage() {
    const { bookings } = await getMemberData();

    return (
        <div className="min-h-screen bg-muted/40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
           <MemberDashboard initialBookings={bookings} />
        </div>
    );
}
