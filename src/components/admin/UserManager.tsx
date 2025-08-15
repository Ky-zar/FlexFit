
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { User } from '@/lib/types';
import { Badge } from '../ui/badge';

interface UserManagerProps {
    initialUsers: User[];
}

export default function UserManager({ initialUsers }: UserManagerProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);

    return (
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
                            <TableHead>Membership ID</TableHead>
                            <TableHead>Membership Plan</TableHead>
                            <TableHead>Join Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.uid}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{user.membershipId}</Badge>
                                </TableCell>
                                <TableCell>
                                    {user.membershipTierName}
                                    {user.membershipIsAnnual && <Badge className="ml-2">Annual</Badge>}
                                </TableCell>
                                <TableCell>{format(new Date(user.joinDate), 'MMM d, yyyy')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
