
"use client"

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  digits: z.string().length(4, "Debes ingresar exactamente 4 dígitos numéricos.").regex(/^\d{4}$/, "Solo se permiten números."),
});

type GenerateInviteCodeDialogProps = {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (userId: string, inviteCode: string) => void;
};

function getCodePrefix(firstName: string, paternalLastName: string, maternalLastName: string): string {
    const first = firstName.slice(0, 2).toUpperCase();
    const paternal = paternalLastName.slice(0, 2).toUpperCase();
    const maternal = maternalLastName.slice(0, 2).toUpperCase();
    return `${first}${paternal}${maternal}`;
}


export function GenerateInviteCodeDialog({ user, isOpen, onClose, onApprove }: GenerateInviteCodeDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      digits: "",
    },
  });

  const { isSubmitting } = form.formState;

  const prefix = useMemo(() => (user ? getCodePrefix(user.firstName, user.paternalLastName, user.maternalLastName) : ''), [user]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    const finalInviteCode = `${prefix}${values.digits}`;
    onApprove(user.id, finalInviteCode);
    toast({
      title: "Usuario Aprobado y Código Generado",
      description: `El código de invitación para ${user.name} es: ${finalInviteCode}`,
    });
    onClose();
    form.reset();
  }
  
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aprobar Usuario y Generar Código</DialogTitle>
          <DialogDescription>
            Genera un código de invitación único de 10 caracteres para <span className="font-bold">{user.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <p className="text-sm text-muted-foreground">El código se formará con 6 letras (nombre y apellidos) y 4 dígitos que elijas.</p>
            <div className="mt-2 flex items-center gap-2">
                <div className="flex h-10 w-32 items-center justify-center rounded-md border bg-muted font-mono text-lg">
                    {prefix}
                </div>
                <span className="text-muted-foreground">+</span>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
                        <FormField
                        control={form.control}
                        name="digits"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Input 
                                    className="w-24 text-center font-mono text-lg" 
                                    maxLength={4} 
                                    placeholder="0000" 
                                    {...field} 
                                />
                            </FormControl>
                             <FormMessage className="mt-1" />
                            </FormItem>
                        )}
                        />
                         <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? "Guardando..." : "Guardar Código"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
