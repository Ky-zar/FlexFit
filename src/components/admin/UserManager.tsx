
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { User, Booking, GymClass } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Calendar as CalendarIcon, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getUserBookings } from '@/lib/actions';
import { Calendar } from '@/components/ui/calendar';
import { parseISO, isSameDay } from 'date-fns';
import Link from 'next/link';

interface UserManagerProps {
    initialUsers: User[];
}

const ViewUserBookingsDialog = ({ user }: { user: User }) => {
    const [bookings, setBookings] = useState<(Booking & { gymClass?: GymClass })[]>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState<Date | undefined>(new Date());

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            const userBookings = await getUserBookings(user.email);
            setBookings(userBookings);
            setLoading(false);
        };
        fetchBookings();
    }, [user.email]);

    const validBookings = bookings.filter(b => b.gymClass);
    const bookedDays = validBookings.map(b => parseISO(b.gymClass!.date));

    const classesForSelectedDay = date 
      ? validBookings.filter(b => isSameDay(parseISO(b.gymClass!.date), date))
      : [];

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Bookings for {user.name}</DialogTitle>
                <DialogDescription>A complete history of all confirmed classes for {user.email}.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                 <div>
                    <h3 className="text-lg font-semibold mb-4 text-center">Class Calendar</h3>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                        modifiers={{ booked: bookedDays }}
                        modifiersStyles={{ 
                            booked: { 
                                fontWeight: 'bold',
                                color: 'hsl(var(--primary-foreground))',
                                backgroundColor: 'hsl(var(--primary))' 
                            } 
                        }}
                    />
                </div>
                <div className="md:col-span-2">
                     <h3 className="text-lg font-semibold mb-4">
                        Classes on {date ? format(date, 'MMMM do, yyyy') : '...'}
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                         {loading ? <p>Loading bookings...</p> : classesForSelectedDay.length > 0 ? (
                            classesForSelectedDay.map(b => (
                                <Link href={`/book/${b.classId}`} key={b.id} className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                    <p className="font-bold">{b.gymClass?.title}</p>
                                    <p className="text-sm text-muted-foreground">{b.gymClass?.time} with {b.gymClass?.trainer}</p>
                                    </div>
                                    <Badge variant="secondary" className="capitalize">{b.status}</Badge>
                                </div>
                                </Link>
                            ))
                            ) : (
                            <p className="text-muted-foreground italic">No classes booked for this day.</p>
                            )}
                    </div>
                </div>
            </div>
        </DialogContent>
    );
};


export default function UserManager({ initialUsers }: UserManagerProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const handleViewBookings = (user: User) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>A list of all registered users in your gym.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Membership</TableHead>
                            <TableHead>Join Date</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.uid}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <div>{user.membershipTierName}</div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{user.membershipId}</Badge>
                                        {user.membershipIsAnnual && <Badge>Annual</Badge>}
                                    </div>
                                </TableCell>
                                <TableCell>{format(new Date(user.joinDate), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onSelect={() => handleViewBookings(user)}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                View Bookings
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {selectedUser && <ViewUserBookingsDialog user={selectedUser} />}
        </Dialog>
        </>
    );
}
