
import { auth } from '@/lib/firebase';
import MemberDashboard from '@/components/account/MemberDashboard';
import { getUserBookings } from '@/lib/actions';
import type { Booking, GymClass } from '@/lib/types';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getMemberData() {
    // This is a dynamic page, so we can check auth state on the server.
    const user = auth.currentUser;

    // This check might be too early if the client state hasn't propagated.
    // The layout handles the definitive auth check. We'll proceed assuming layout works.
    if (!user || !user.email) {
       // Let the layout handle the redirect for cleaner server component logic.
       // It's possible to redirect here, but layout is more robust.
       return { bookings: [] };
    }
    const bookings = await getUserBookings(user.email);
    return { bookings };
}

export default async function MemberDashboardPage() {
    const { bookings } = await getMemberData();

    // Re-check auth state as a safeguard, redirect if necessary.
    // The layout should handle this, but this adds an extra layer of protection.
    if (!auth.currentUser) {
        return redirect('/login');
    }

    return (
        <div className="min-h-screen bg-muted/40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
           <MemberDashboard initialBookings={bookings} />
        </div>
    );
}
