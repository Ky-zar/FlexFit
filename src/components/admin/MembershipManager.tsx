'use client';

import { useState } from 'react';
import { MoreHorizontal, CheckCircle, Circle } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { MembershipTier } from '@/lib/types';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

interface MembershipManagerProps {
    initialTiers: MembershipTier[];
}

const MembershipForm = ({ tier, onSave }: { tier: MembershipTier, onSave: () => void }) => {
    const { toast } = useToast();
    const [formState, setFormState] = useState({
        name: tier?.name || '',
        description: tier?.description || '',
        monthlyPrice: tier?.monthlyPrice || 0,
        features: tier?.features.join('\n') || '',
        popular: tier?.popular || false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: id === 'monthlyPrice' ? Number(value) : value }));
    }
    
    const handleSwitchChange = (checked: boolean) => {
        setFormState(prev => ({...prev, popular: checked}));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const annualPrice = parseFloat((formState.monthlyPrice * 12 * 0.8).toFixed(2));
            const featuresArray = formState.features.split('\n').filter(f => f.trim() !== '');
            
            await updateDoc(doc(db, 'membershipTiers', tier.id), { 
                ...formState,
                features: featuresArray,
                annualPrice: annualPrice
            });
            toast({ title: "Membership tier updated successfully!" });
            onSave();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "An error occurred." });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div><Label htmlFor="name">Tier Name</Label><Input id="name" value={formState.name} onChange={handleChange}/></div>
             <div><Label htmlFor="description">Description</Label><Input id="description" value={formState.description} onChange={handleChange}/></div>
             <div><Label htmlFor="monthlyPrice">Monthly Price ($)</Label><Input type="number" id="monthlyPrice" value={formState.monthlyPrice} onChange={handleChange} /></div>
             <div><Label htmlFor="features">Features (one per line)</Label><Textarea id="features" value={formState.features} onChange={handleChange} rows={5} /></div>
             <div className="flex items-center space-x-2">
                <Switch id="popular" checked={formState.popular} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="popular">Mark as Most Popular</Label>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button type="submit">Save Changes</Button>
            </DialogFooter>
        </form>
    );
}

export default function MembershipManager({ initialTiers }: MembershipManagerProps) {
    const [tiers, setTiers] = useState<MembershipTier[]>(initialTiers);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<MembershipTier | undefined>(undefined);
    const { toast } = useToast();

    const refreshTiers = () => {
        setIsFormOpen(false);
        window.location.reload(); // Simple way to refresh data
    };
    
    const openFormDialog = (tier: MembershipTier) => {
        setSelectedTier(tier);
        setIsFormOpen(true);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Membership Tiers</CardTitle>
                        <CardDescription>Edit pricing and features for membership plans.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Monthly Price</TableHead>
                            <TableHead>Annual Price</TableHead>
                            <TableHead>Popular</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tiers.map((t) => (
                            <TableRow key={t.id}>
                                <TableCell className="font-medium">{t.name}</TableCell>
                                <TableCell>${t.monthlyPrice.toFixed(2)}</TableCell>
                                <TableCell>${t.annualPrice.toFixed(2)}</TableCell>
                                <TableCell>{t.popular ? <CheckCircle className="text-green-500"/> : <Circle className="text-muted-foreground"/>}</TableCell>
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
                                            <DropdownMenuItem onSelect={() => openFormDialog(t)}>Edit</DropdownMenuItem>
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
                        <DialogTitle>Edit {selectedTier?.name} Tier</DialogTitle>
                        <DialogDescription>Update the details for this membership plan.</DialogDescription>
                    </DialogHeader>
                    {selectedTier && <MembershipForm tier={selectedTier} onSave={refreshTiers} />}
                </DialogContent>
            </Dialog>
        </Card>
    );
}
