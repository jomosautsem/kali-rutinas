
"use client"

import { useEffect, useState } from "react";
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
import { Loader2, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import type { User } from "@/lib/types";
import { AvatarSelector } from "./avatar-selector";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  firstName: z.string().min(2, "El nombre es requerido."),
  paternalLastName: z.string().min(2, "El apellido paterno es requerido."),
  maternalLastName: z.string().min(2, "El apellido materno es requerido."),
  email: z.string().email("Por favor, ingresa un correo electrónico válido."),
  avatarUrl: z.string().optional().or(z.literal("")),
  planStartDate: z.date().optional(),
  planEndDate: z.date().optional(),
  currentWeek: z.number().optional(),
  planDurationInWeeks: z.number().optional(),
});

type EditUserDialogProps = {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEditUser: (user: User) => void;
};

const steps = [
    { id: 1, name: "Información Personal", fields: ["firstName", "paternalLastName", "maternalLastName", "email", "avatarUrl"] },
    { id: 2, name: "Ciclo de Entrenamiento", fields: ["planDurationInWeeks", "planStartDate", "planEndDate", "currentWeek"] },
];

export function EditUserDialog({ user, isOpen, onClose, onEditUser }: EditUserDialogProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      paternalLastName: "",
      maternalLastName: "",
      email: "",
      avatarUrl: "",
      planStartDate: undefined,
      planEndDate: undefined,
      currentWeek: 1,
      planDurationInWeeks: 4,
    },
  });
  
  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        firstName: user.firstName,
        paternalLastName: user.paternalLastName,
        maternalLastName: user.maternalLastName,
        email: user.email,
        avatarUrl: user.avatarUrl || "",
        planStartDate: user.planStartDate ? new Date(user.planStartDate) : undefined,
        planEndDate: user.planEndDate ? new Date(user.planEndDate) : undefined,
        currentWeek: user.currentWeek || 1,
        planDurationInWeeks: user.planDurationInWeeks || 4,
      });
      setCurrentStep(0);
    }
  }, [user, form, isOpen]);

  const { isSubmitting } = form.formState;

  const nextStep = async () => {
    const fields = steps[currentStep].fields;
    const output = await form.trigger(fields as any, { shouldFocus: true });
    if (output) {
      setCurrentStep(step => step + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(step => step - 1);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    
    try {
      const updatedUserData: User = {
        ...user,
        ...values,
        planStartDate: values.planStartDate?.toISOString(),
        planEndDate: values.planEndDate?.toISOString(),
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
      <DialogContent className="sm:max-w-md h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Usuario - Paso {currentStep + 1} de {steps.length}</DialogTitle>
          <DialogDescription>
            Actualiza la información de <span className="font-bold">{user.name}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col flex-grow overflow-hidden">
                <div className="flex-grow overflow-y-auto pr-6 -mr-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                        {currentStep === 0 && (
                            <div className="space-y-4">
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
                            </div>
                        )}
                        {currentStep === 1 && (
                             <div className="space-y-2 rounded-md border p-4">
                                <h4 className="font-medium text-sm text-center mb-4">Ciclo de Entrenamiento</h4>
                                <FormField
                                    control={form.control}
                                    name="planDurationInWeeks"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Duración del Ciclo</FormLabel>
                                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona duración" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="4">4 Semanas</SelectItem>
                                                <SelectItem value="6">6 Semanas</SelectItem>
                                                <SelectItem value="8">8 Semanas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                <FormField
                                control={form.control}
                                name="planStartDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Fecha de Inicio del Plan</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Elige una fecha</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date("1900-01-01")}
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />

                                <FormField
                                control={form.control}
                                name="planEndDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Fecha de Fin del Plan</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Elige una fecha</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date("1900-01-01")}
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />

                                <FormField
                                    control={form.control}
                                    name="currentWeek"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Semana Actual</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                min="1" 
                                                max="8" 
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={e => field.onChange(parseInt(e.target.value, 10))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                        </motion.div>
                    </AnimatePresence>
                </div>
              
                <DialogFooter className="flex-shrink-0 pt-4 border-t">
                    {currentStep > 0 && (
                        <Button type="button" variant="ghost" onClick={prevStep}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                        </Button>
                    )}
                    <div className="flex-grow" />
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    {currentStep < steps.length - 1 && (
                        <Button type="button" onClick={nextStep}>
                            Siguiente
                        </Button>
                    )}
                    {currentStep === steps.length - 1 && (
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    )}
                </DialogFooter>
            </form>
          </Form>
      </DialogContent>
    </Dialog>
  );
}

    