
"use client"

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LibraryExerciseSchema, muscleGroups } from "@/lib/types";
import type { LibraryExercise } from "@/lib/types";
import { z } from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type ExerciseEditorDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exerciseData: Omit<LibraryExercise, 'id'>) => void;
  exercise: LibraryExercise | null;
};

// We don't need the ID for form validation
const formSchema = LibraryExerciseSchema.omit({ id: true });
type FormValues = z.infer<typeof formSchema>;

export function ExerciseEditorDialog({ isOpen, onClose, onSave, exercise }: ExerciseEditorDialogProps) {

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      muscleGroup: "Otro",
      mediaUrl: "",
    },
  });

  useEffect(() => {
    if (exercise) {
      form.reset(exercise);
    } else {
      form.reset({
        name: "",
        description: "",
        muscleGroup: "Otro",
        mediaUrl: "",
      });
    }
  }, [exercise, form, isOpen]);

  const { isSubmitting } = form.formState;

  function onSubmit(values: FormValues) {
    onSave(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {exercise ? "Editar Ejercicio" : "Añadir Nuevo Ejercicio"}
          </DialogTitle>
          <DialogDescription>
            {exercise 
                ? "Modifica los detalles de este ejercicio." 
                : "Añade un nuevo ejercicio a la biblioteca central."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Ejercicio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Press de Banca" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="muscleGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupo Muscular Principal</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un grupo muscular" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {muscleGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Una breve descripción de la técnica o los músculos trabajados..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
             <FormField
              control={form.control}
              name="mediaUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Video/Imagen</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Guardando..." : "Guardar Ejercicio"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
