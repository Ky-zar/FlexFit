'use client';

import type { Booking, GymClass } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import Link from 'next/link';

interface UpcomingClassesProps {
    bookings: (Booking & { gymClass?: GymClass })[];
}

export default function UpcomingClasses({ bookings }: UpcomingClassesProps) {
    const upcomingBookings = bookings.filter(b => new Date(b.gymClass?.date ?? 0) >= new Date());

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Upcoming Classes</CardTitle>
                <CardDescription>Here are your reserved spots. See you there!</CardDescription>
            </CardHeader>
            <CardContent>
                {upcomingBookings.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Class</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Trainer</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {upcomingBookings.map((b) => (
                                <TableRow key={b.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/book/${b.classId}`} className="hover:underline text-primary">
                                            {b.gymClass?.title || 'Unknown Class'}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {b.gymClass ? `${format(new Date(b.gymClass.date), 'MMM d, yyyy')} at ${b.gymClass.time}` : ''}
                                    </TableCell>
                                    <TableCell>{b.gymClass?.trainer}</TableCell>
                                    <TableCell>
                                        <Badge variant={b.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize">
                                            {b.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">You have no upcoming classes booked.</p>
                        <Link href="/schedule">
                             <Button>Book a Class</Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
