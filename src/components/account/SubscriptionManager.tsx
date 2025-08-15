
'use client';

import type { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import Link from 'next/link';

interface SubscriptionManagerProps {
    user: User | null;
}

export default function SubscriptionManager({ user }: SubscriptionManagerProps) {
    if (!user || !user.membershipTierName) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>My Subscription</CardTitle>
                    <CardDescription>Your membership details will appear here.</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                     <p className="text-muted-foreground mb-4">You do not have an active membership.</p>
                     <Button asChild>
                         <Link href="/membership">View Plans</Link>
                     </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Subscription</CardTitle>
                <CardDescription>Details about your current membership plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start p-6 bg-muted/50 rounded-lg">
                    <div>
                        <h3 className="text-xl font-bold text-primary">{user.membershipTierName} Plan</h3>
                        <p className="text-sm text-muted-foreground">Member since: {format(new Date(user.joinDate), 'MMMM d, yyyy')}</p>
                    </div>
                    <Badge className="mt-2 sm:mt-0">{user.membershipIsAnnual ? 'Annual' : 'Monthly'}</Badge>
                </div>
                <div className="space-y-2">
                    <h4 className="font-semibold">Membership Benefits</h4>
                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                        <li>Access to all gym facilities</li>
                        <li>Standard class booking privileges</li>
                        <li>Member-only event invitations</li>
                    </ul>
                </div>
                 <div>
                    <Button variant="outline" disabled>Cancel Subscription</Button>
                    <p className="text-xs text-muted-foreground mt-2">Cancellation feature coming soon.</p>
                 </div>
            </CardContent>
        </Card>
    );
}
