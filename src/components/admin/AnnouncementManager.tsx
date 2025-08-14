'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
import type { Announcement } from '@/lib/types';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Label } from '../ui/label';

interface AnnouncementManagerProps {
    initialAnnouncements: Announcement[];
}

const AnnouncementForm = ({ announcement, onSave }: { announcement?: Announcement, onSave: () => void }) => {
    const { toast } = useToast();
    const [title, setTitle] = useState(announcement?.title || '');
    const [content, setContent] = useState(announcement?.content || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !content) {
            toast({ variant: 'destructive', title: 'All fields are required.' });
            return;
        }

        try {
            if (announcement) {
                await updateDoc(doc(db, 'announcements', announcement.id), { title, content });
                toast({ title: 'Announcement updated!' });
            } else {
                await addDoc(collection(db, 'announcements'), { title, content, date: serverTimestamp() });
                toast({ title: 'Announcement created!' });
            }
            onSave();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'An error occurred.' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows={4} />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button type="submit">Save Announcement</Button>
            </DialogFooter>
        </form>
    );
};

export default function AnnouncementManager({ initialAnnouncements }: AnnouncementManagerProps) {
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | undefined>(undefined);
    const { toast } = useToast();

    const refreshAnnouncements = async () => {
        setIsFormOpen(false);
        window.location.reload(); // Simple way to refresh data
    };
    
    const handleDelete = async (id: string) => {
        if(window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                await deleteDoc(doc(db, 'announcements', id));
                toast({ title: 'Announcement deleted.'});
                setAnnouncements(announcements.filter(a => a.id !== id));
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Failed to delete announcement.'});
            }
        }
    }
    
    const openFormDialog = (announcement?: Announcement) => {
        setSelectedAnnouncement(announcement);
        setIsFormOpen(true);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Announcements</CardTitle>
                        <CardDescription>Create and manage gym announcements.</CardDescription>
                    </div>
                     <Button size="sm" className="gap-1" onClick={() => openFormDialog()}>
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Announcement</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {announcements.map((a) => (
                            <TableRow key={a.id}>
                                <TableCell className="font-medium">{a.title}</TableCell>
                                <TableCell>{format(new Date(a.date), 'MMM d, yyyy')}</TableCell>
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
                                            <DropdownMenuItem onSelect={() => openFormDialog(a)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onSelect={(e) => { e.preventDefault(); handleDelete(a.id); }}>Delete</DropdownMenuItem>
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
                        <DialogTitle>{selectedAnnouncement ? 'Edit' : 'Add New'} Announcement</DialogTitle>
                        <DialogDescription>{selectedAnnouncement ? 'Update the' : 'Write the'} announcement details below.</DialogDescription>
                    </DialogHeader>
                    <AnnouncementForm announcement={selectedAnnouncement} onSave={refreshAnnouncements} />
                </DialogContent>
            </Dialog>
        </Card>
    );
}
