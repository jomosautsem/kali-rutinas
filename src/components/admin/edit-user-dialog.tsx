
"use client"

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { User } from "@/lib/types";
import { AvatarSelector } from "./avatar-selector";

const formSchema = z.object({
  firstName: z.string().min(2, "El nombre es requerido."),
  paternalLastName: z.string().min(2, "El apellido paterno es requerido."),
  maternalLastName: z.string().min(2, "El apellido materno es requerido."),
  email: z.string().email("Por favor, ingresa un correo electrónico válido."),
  avatarUrl: z.string().optional().or(z.literal("")),
});

type EditUserDialogProps = {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEditUser: (user: User) => void;
};

export function EditUserDialog({ user, isOpen, onClose, onEditUser }: EditUserDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      paternalLastName: "",
      maternalLastName: "",
      email: "",
      avatarUrl: "",
    },
  });
  
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        paternalLastName: user.paternalLastName,
        maternalLastName: user.maternalLastName,
        email: user.email,
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user, form, isOpen]);

  const { isSubmitting } = form.formState;

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    
    try {
      const updatedUserData = {
        ...user,
        ...values,
      };
      onEditUser(updatedUserData);
      toast({
        title: "Usuario Actualizado",
        description: `La información de ${updatedUserData.name} ha sido guardada.`,
      });
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el usuario.",
      });
    }
  }
  
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Actualiza la información del usuario <span className="font-bold">{user.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre(s)</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paternalLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido Paterno</FormLabel>
                  <FormControl>
                    <Input placeholder="Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maternalLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido Materno</FormLabel>
                  <FormControl>
                    <Input placeholder="García" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="m@example.com" {...field} disabled />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
            <Controller
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                 <FormItem>
                  <FormLabel>Seleccionar Avatar</FormLabel>
                  <FormControl>
                    <AvatarSelector value={field.value || ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
               <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
