
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, PlusCircle, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { GymClass, Booking } from '@/lib/types';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { deleteClass } from '@/lib/actions';

interface ClassManagerProps {
    initialClasses: GymClass[];
}

const ClassForm = ({ gymClass, onSave }: { gymClass?: GymClass, onSave: () => void }) => {
    const { toast } = useToast();
    const [formState, setFormState] = useState({
        title: gymClass?.title || '',
        date: gymClass?.date || '',
        time: gymClass?.time || '',
        trainer: gymClass?.trainer || '',
        maxSpots: gymClass?.maxSpots || 10,
        description: gymClass?.description || '',
        price: gymClass?.price || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: id === 'maxSpots' || id === 'price' ? Number(value) : value }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (gymClass) {
                await updateDoc(doc(db, 'classes', gymClass.id), formState );
                toast({ title: "Class updated successfully!" });
            } else {
                await addDoc(collection(db, 'classes'), { ...formState, bookedSpots: 0 });
                toast({ title: "Class created successfully!" });
            }
            onSave();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "An error occurred." });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div><Label htmlFor="title">Class Title</Label><Input id="title" value={formState.title} onChange={handleChange}/></div>
             <div><Label htmlFor="description">Description</Label><Input id="description" value={formState.description} onChange={handleChange}/></div>
             <div><Label htmlFor="date">Date</Label><Input type="date" id="date" value={formState.date} onChange={handleChange} /></div>
             <div><Label htmlFor="time">Time</Label><Input type="time" id="time" value={formState.time} onChange={handleChange} /></div>
             <div><Label htmlFor="trainer">Trainer</Label><Input id="trainer" value={formState.trainer} onChange={handleChange} /></div>
             <div><Label htmlFor="maxSpots">Max Spots</Label><Input type="number" id="maxSpots" value={formState.maxSpots} onChange={handleChange} /></div>
             <div><Label htmlFor="price">Price ($)</Label><Input type="number" id="price" value={formState.price} onChange={handleChange} step="0.01" /></div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button type="submit">Save Class</Button>
            </DialogFooter>
        </form>
    );
}

const ViewBookingsDialog = ({ classId, classTitle }: { classId: string, classTitle: string }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!classId) return;
            setLoading(true);
            const q = query(collection(db, "bookings"), where("classId", "==", classId));
            const querySnapshot = await getDocs(q);
            const classBookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
            setBookings(classBookings);
            setLoading(false);
        };
        fetchBookings();
    }, [classId]);

    const getStatusIcon = (status: Booking['status']) => {
        switch (status) {
            case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
            default: return null;
        }
    };

     return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Bookings for {classTitle}</DialogTitle>
                <DialogDescription>List of all user bookings for this class.</DialogDescription>
            </DialogHeader>
            <div className="mt-4 max-h-[400px] overflow-y-auto">
                {loading ? <p>Loading...</p> : bookings.length > 0 ? (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Spots</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.map(b => (
                                <TableRow key={b.id}>
                                    <TableCell>{b.name}</TableCell>
                                    <TableCell>{b.email}</TableCell>
                                    <TableCell>{b.spots}</TableCell>
                                    <TableCell>
                                        <Badge variant={b.status === 'confirmed' ? 'default' : b.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize flex items-center gap-1 w-fit">
                                            {getStatusIcon(b.status)}
                                            {b.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : <p className="text-sm text-muted-foreground text-center py-8">No bookings for this class yet.</p>}
            </div>
        </DialogContent>
    )

}

export default function ClassManager({ initialClasses }: ClassManagerProps) {
    const [classes, setClasses] = useState<GymClass[]>(initialClasses);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isBookingsOpen, setIsBookingsOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<GymClass | undefined>(undefined);
    const { toast } = useToast();

    const refreshClasses = () => {
        setIsFormOpen(false);
        window.location.reload(); // Simple way to refresh data
    };
    
    const handleDelete = async (id: string) => {
        if(window.confirm('Are you sure? This will delete the class and all associated bookings.')) {
            const result = await deleteClass(id);
            if (result?.success) {
                toast({ title: 'Class and all its bookings have been deleted.'});
                setClasses(classes.filter(c => c.id !== id));
            } else {
                 toast({ variant: 'destructive', title: result.error || 'Failed to delete class.'});
            }
        }
    }
    
    const openFormDialog = (gymClass?: GymClass) => {
        setSelectedClass(gymClass);
        setIsFormOpen(true);
    }
    
    const openBookingsDialog = (gymClass: GymClass) => {
        setSelectedClass(gymClass);
        setIsBookingsOpen(true);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Classes</CardTitle>
                        <CardDescription>Manage your gym classes here.</CardDescription>
                    </div>
                     <Button size="sm" className="gap-1" onClick={() => openFormDialog()}>
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Class</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Class</TableHead>
                            <TableHead>Trainer</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Price</TableHead>
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
                                 <TableCell>{c.price && c.price > 0 ? `$${c.price.toFixed(2)}` : 'Free'}</TableCell>
                                <TableCell>{c.bookedSpots || 0} / {c.maxSpots}</TableCell>
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
                                            <DropdownMenuItem onSelect={() => openBookingsDialog(c)}><Users className="mr-2 h-4 w-4"/>View Bookings</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => openFormDialog(c)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onSelect={() => handleDelete(c.id)}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedClass ? 'Edit' : 'Add New'} Class</DialogTitle>
                        <DialogDescription>{selectedClass ? 'Update the' : 'Fill in the'} details for the class.</DialogDescription>
                    </DialogHeader>
                    <ClassForm gymClass={selectedClass} onSave={refreshClasses} />
                </DialogContent>
            </Dialog>
            <Dialog open={isBookingsOpen} onOpenChange={setIsBookingsOpen}>
                {selectedClass && <ViewBookingsDialog classId={selectedClass.id} classTitle={selectedClass.title} />}
            </Dialog>
        </Card>
    );
}

    