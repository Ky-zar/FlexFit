'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, PlusCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { GymClass } from '@/lib/types';
import { PLACEHOLDER_BOOKINGS } from '@/lib/placeholder-data';

interface ClassManagerProps {
    initialClasses: GymClass[];
}

// Dummy form for add/edit class. In a real app, this would be a proper form with state management.
const ClassForm = () => (
    <div className="space-y-4">
        <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Class Title</label>
            <input type="text" id="title" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
        </div>
        <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" id="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
        </div>
        <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
            <input type="time" id="time" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
        </div>
        <div>
            <label htmlFor="trainer" className="block text-sm font-medium text-gray-700">Trainer</label>
            <input type="text" id="trainer" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
        </div>
        <div>
            <label htmlFor="maxSpots" className="block text-sm font-medium text-gray-700">Max Spots</label>
            <input type="number" id="maxSpots" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
        </div>
        <Button className="w-full">Save Class</Button>
    </div>
);

export default function ClassManager({ initialClasses }: ClassManagerProps) {
    const [classes, setClasses] = useState<GymClass[]>(initialClasses);
    const bookings = PLACEHOLDER_BOOKINGS;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Classes</CardTitle>
                        <CardDescription>Manage your gym classes here.</CardDescription>
                    </div>
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-1">
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Class</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Class</DialogTitle>
                                <DialogDescription>Fill in the details for the new class.</DialogDescription>
                            </DialogHeader>
                            <ClassForm />
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Class</TableHead>
                            <TableHead>Trainer</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Bookings</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell className="font-medium">{c.title}</TableCell>
                                <TableCell>{c.trainer}</TableCell>
                                <TableCell>{format(new Date(c.date), 'MMM d, yyyy')} at {c.time}</TableCell>
                                <TableCell>{c.bookedSpots} / {c.maxSpots}</TableCell>
                                <TableCell>
                                    <Dialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DialogTrigger asChild>
                                                    <DropdownMenuItem><Users className="mr-2 h-4 w-4"/>View Bookings</DropdownMenuItem>
                                                </DialogTrigger>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Bookings for {c.title}</DialogTitle>
                                            </DialogHeader>
                                            <div className="mt-4">
                                                {bookings.filter(b => b.classId === c.id).length > 0 ? (
                                                     <ul className="space-y-2">
                                                        {bookings.filter(b => b.classId === c.id).map(b => (
                                                            <li key={b.id} className="text-sm p-2 bg-muted rounded-md">{b.name} ({b.email}) - {b.spots} spot(s)</li>
                                                        ))}
                                                    </ul>
                                                ) : <p className="text-sm text-muted-foreground">No bookings for this class yet.</p>}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
