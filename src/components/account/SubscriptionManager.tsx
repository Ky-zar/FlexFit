
'use client';

import type { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cancelSubscription } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface SubscriptionManagerProps {
    user: User | null;
}

export default function SubscriptionManager({ user }: SubscriptionManagerProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancellation = async () => {
        if (!user) return;
        setIsCancelling(true);
        try {
            await cancelSubscription(user.uid);
            toast({
                title: 'Subscription Cancelled',
                description: 'Your membership has been successfully cancelled.',
            });
            // Refresh the page to reflect the change
            router.refresh();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Cancellation Failed',
                description: error instanceof Error ? error.message : "An unexpected error occurred.",
            });
        } finally {
            setIsCancelling(false);
        }
    };


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
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isCancelling}>Cancel Subscription</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                            <AlertDialogDescription>
                                By cancelling your subscription, you will lose access to all membership benefits at the end of your current billing cycle. 
                                Your account will be removed from the gym's member list. You can still book individual classes as a visitor.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                <Button variant="secondary" asChild><Link href="/membership">Change Plan</Link></Button>
                                <AlertDialogAction onClick={handleCancellation} disabled={isCancelling}>
                                    {isCancelling ? 'Cancelling...' : 'Yes, Cancel Subscription'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 </div>
            </CardContent>
        </Card>
    );
}
