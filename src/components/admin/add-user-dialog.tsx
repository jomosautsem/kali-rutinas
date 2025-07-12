
"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
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

const formSchema = z.object({
  name: z.string().min(2, "El nombre completo es requerido."),
  email: z.string().email("Por favor, ingresa un correo electrónico válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

type AddUserDialogProps = {
  onAddUser: (user: Omit<User, 'id' | 'role' | 'status' | 'registeredAt' | 'planStatus'>) => void;
};

export function AddUserDialog({ onAddUser }: AddUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const storedUsers = localStorage.getItem("registeredUsers");
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

      if (users.some(user => user.email === values.email)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Este correo electrónico ya está registrado.",
        });
        return;
      }
      
      onAddUser(values);
      toast({
        title: "Usuario Añadido",
        description: `El usuario ${values.name} ha sido creado exitosamente.`,
      });
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo añadir el usuario.",
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
