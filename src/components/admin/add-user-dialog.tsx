
"use client"

import { useState } from "react";
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
  DialogTrigger,
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
import { PlusCircle, Loader2 } from "lucide-react";
import type { User } from "@/lib/types";
import { AvatarSelector } from "./avatar-selector";
import { createUser } from "@/services/user.service";

const formSchema = z.object({
  firstName: z.string().min(2, "El nombre es requerido."),
  paternalLastName: z.string().min(2, "El apellido paterno es requerido."),
  maternalLastName: z.string().min(2, "El apellido materno es requerido."),
  email: z.string().email("Por favor, ingresa un correo electrónico válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  avatarUrl: z.string().optional().or(z.literal("")),
});

type AddUserDialogProps = {
  onUserAdded: () => void; // Callback to refresh the user list
};

export function AddUserDialog({ onUserAdded }: AddUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      paternalLastName: "",
      maternalLastName: "",
      email: "",
      password: "",
      avatarUrl: "/images/avatars/avatar-01.png",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // This is a simplified flow. In a real app, you'd create the
      // user in Supabase Auth, get the ID, then create the profile.
      // For now, we call our service that's supposed to do that.
      await createUser(values);
      
      const fullName = `${values.firstName} ${values.paternalLastName}`.trim();
      toast({
        title: "Usuario Añadido",
        description: `El usuario ${fullName} ha sido creado exitosamente.`,
      });
      onUserAdded(); // Refresh the parent component's user list
      setIsOpen(false);
      form.reset();
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo añadir el usuario.",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Completa los detalles para crear una nueva cuenta de cliente.
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
                    <Input type="email" placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Añadiendo..." : "Añadir Usuario"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
