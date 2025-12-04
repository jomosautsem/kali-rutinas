
'use client';

import { useState } from 'react';
import type { User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Mail, MoreVertical } from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';


function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function StatusBadge({ status }: { status: User['status'] }) {
    const statusMap = {
        activo: 'green',
        pendiente: 'yellow',
        inactivo: 'red',
    };
    // A simple way to map colors, can be improved with tailwind variants
    const colorClass = {
        green: 'bg-green-500 hover:bg-green-600',
        yellow: 'bg-yellow-500 hover:bg-yellow-600',
        red: 'bg-red-500 hover:bg-red-600',
    }[statusMap[status]];

    return <Badge className={`${colorClass} text-white`}>{status}</Badge>;
}

async function approveUserAction(userId: string) {
    // In a real app, you would call a server action here to update the user's status
    // For now, we simulate the action and show a toast.
    console.log(`Simulating approval for user: ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    // In a real app, you would revalidate the data to show the change.
}

export function UsersTable({ users }: { users: User[] }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

    const handleApprove = async (userId: string) => {
        setIsSubmitting(userId);
        try {
            await approveUserAction(userId);
            toast({ title: 'Usuario Aprobado', description: 'El usuario ahora tiene acceso al sistema.' });
            // Note: To see the change, the page needs to be refreshed manually as we are simulating the action.
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo aprobar al usuario.' });
        }
        setIsSubmitting(null);
    };

    if (users.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No se encontraron usuarios.</div>;
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.avatarUrl} />
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-muted-foreground text-sm">{user.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={user.status} />
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">{user.planStatus}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                         {user.status === 'pendiente' && (
                                            <DropdownMenuItem 
                                                onClick={() => handleApprove(user.id)}
                                                disabled={isSubmitting === user.id}
                                            >
                                                <ShieldCheck className="mr-2 h-4 w-4" />
                                                {isSubmitting === user.id ? 'Aprobando...' : 'Aprobar Usuario'}
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => window.location.href = `mailto:${user.email}`}>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Enviar Correo
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
