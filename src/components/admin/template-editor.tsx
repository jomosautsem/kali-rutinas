
"use client"

import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch, Control, UseFormRegister, FormProvider } from "react-hook-form";
import type { UserPlan } from "@/lib/types";
import type { Template } from "@/app/admin/templates/page"; // Import Template type
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Trash2, PlusCircle, Save, XCircle } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


const templateSchema = z.object({
    id: z.string(),
    title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
    level: z.enum(["Principiante", "Intermedio", "Avanzado"]),
    days: z.number(),
    plan: z.object({
        warmup: z.string().optional(),
        recommendations: z.string().optional(),
        weeklyPlan: z.array(z.object({
            day: z.string().min(1, "El nombre del día es requerido."),
            focus: z.string().min(1, "El enfoque es requerido."),
            exercises: z.array(z.object({
                name: z.string().min(1, "El nombre del ejercicio es requerido."),
                series: z.string(),
                reps: z.string(),
                rest: z.string(),
                mediaUrl: z.string().optional(),
            }))
        }))
    })
});


type TemplateEditorProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Template) => void;
  initialData?: Template | null;
};

const dayButtonColors = [
    "bg-yellow-500/80 hover:bg-yellow-500 text-yellow-950",
    "bg-yellow-600/80 hover:bg-yellow-600 text-yellow-950",
    "bg-amber-500/80 hover:bg-amber-500 text-amber-950",
    "bg-amber-600/80 hover:bg-amber-600 text-amber-950",
    "bg-orange-500/80 hover:bg-orange-500 text-orange-950",
    "bg-orange-600/80 hover:bg-orange-600 text-orange-950",
];

export function TemplateEditor({ isOpen, onClose, onSave, initialData }: TemplateEditorProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const form = useForm<Template>({
    resolver: zodResolver(templateSchema),
    defaultValues: initialData || {
      id: "new",
      title: "",
      description: "",
      level: "Principiante",
      days: 1,
      plan: {
        warmup: "",
        recommendations: "",
        weeklyPlan: [{ day: "Día 1", focus: "Enfoque del día", exercises: [] }]
      }
    }
  });
  
  const { control, register, handleSubmit, reset } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "plan.weeklyPlan"
  });

  const weeklyPlanValues = useWatch({ control, name: "plan.weeklyPlan" });

  useEffect(() => {
    if (isOpen) {
      reset(initialData || {
          id: `new-${Date.now()}`,
          title: "",
          description: "",
          level: "Principiante",
          days: 1,
          plan: {
              warmup: "",
              recommendations: "",
              weeklyPlan: [{ day: "Día 1", focus: "Enfoque del día", exercises: [] }]
          }
      });
      setActiveDayIndex(0);
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: Template) => {
    onSave(data);
    onClose();
  };

  const removeDay = (index: number) => {
    remove(index);
    if (activeDayIndex >= index && activeDayIndex > 0) {
      setActiveDayIndex(prev => prev - 1);
    } else if (fields.length === 1) {
      setActiveDayIndex(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {initialData ? "Editar Plantilla" : "Crear Nueva Plantilla Manual"}
          </DialogTitle>
          <DialogDescription>
            {initialData 
                ? "Modifica los detalles de la plantilla existente." 
                : "Crea una plantilla de entrenamiento completa desde cero."
            }
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-6 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Título de la Plantilla</FormLabel><FormControl><Input placeholder="Ej. Fuerza y Potencia 5x5" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name="level" render={({ field }) => (
                    <FormItem><FormLabel>Nivel de Dificultad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un nivel" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Principiante">Principiante</SelectItem>
                                <SelectItem value="Intermedio">Intermedio</SelectItem>
                                <SelectItem value="Avanzado">Avanzado</SelectItem>
                            </SelectContent>
                        </Select>
                    <FormMessage /></FormItem>
                )} />
                 <div className="md:col-span-2">
                    <FormField control={control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Describe brevemente el objetivo y la estructura de esta plantilla..." {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 p-4 rounded-lg border bg-secondary/30">
                  <FormLabel htmlFor="warmup" className="text-base font-semibold">
                    Calentamiento y activación de músculo
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="warmup"
                      {...register("plan.warmup")}
                      placeholder="Escribe aquí las instrucciones de calentamiento..."
                      rows={3}
                      className="text-sm bg-card"
                    />
                  </FormControl>
                </div>

                <div className="space-y-2 p-4 rounded-lg border bg-secondary/30">
                  <FormLabel htmlFor="recommendations" className="text-base font-semibold">
                    Recomendaciones Generales
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="recommendations"
                      {...register("plan.recommendations")}
                      placeholder="Escribe aquí cualquier sugerencia general para esta plantilla..."
                      rows={3}
                      className="text-sm bg-card"
                    />
                  </FormControl>
                </div>
              </div>


              {fields.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 border-b pb-4">
                    {fields.map((field, index) => (
                      <Button
                        key={field.id}
                        type="button"
                        onClick={() => setActiveDayIndex(index)}
                        className={cn(
                          "transition-all",
                          activeDayIndex === index
                            ? `${dayButtonColors[index % dayButtonColors.length]} scale-105 shadow-lg`
                            : "bg-gray-600/50 hover:bg-gray-600 text-white"
                        )}
                      >
                        {weeklyPlanValues?.[index]?.day || `Día ${index + 1}`}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({ day: `Día ${fields.length + 1}`, focus: "Enfoque", exercises: [] })}
                      className="ml-auto"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Añadir Día
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className={cn(activeDayIndex === index ? "block" : "hidden")}>
                      <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
                        <div className="flex items-center gap-4">
                          <Input
                            {...register(`plan.weeklyPlan.${index}.day`)}
                            className="font-bold text-lg"
                            placeholder="Nombre del día"
                          />
                          <Input
                            {...register(`plan.weeklyPlan.${index}.focus`)}
                            className="text-base flex-1"
                            placeholder="Enfoque del día"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDay(index)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                        <ExercisesFieldArray dayIndex={index} control={control} register={register} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                   <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground mb-4">La plantilla está vacía.</p>
                      <Button
                          type="button"
                          variant="outline"
                          onClick={() => append({ day: `Día 1`, focus: "Enfoque", exercises: [] })}
                      >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Añadir Primer Día
                      </Button>
                  </div>
              )}

              <DialogFooter className="pt-4 border-t mt-auto sticky bottom-0 bg-card">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Plantilla
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

function ExercisesFieldArray({ dayIndex, control, register }: { dayIndex: number; control: Control<Template>; register: UseFormRegister<Template> }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `plan.weeklyPlan.${dayIndex}.exercises`
  });

  const watchedExercises = useWatch({
      control,
      name: `plan.weeklyPlan.${dayIndex}.exercises`
  });

  return (
    <div className="space-y-2 pt-4">
      {fields.map((field, exerciseIndex) => {
        const exerciseName = watchedExercises?.[exerciseIndex]?.name;
        const generatedUrl = exerciseName 
            ? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exerciseName} ejercicio tutorial`)}`
            : "";
        
        return (
            <div key={field.id} className="flex items-center gap-2 p-2 rounded-md bg-card/50">
            <Input
                {...register(`plan.weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.name`)}
                placeholder="Ejercicio"
                className="flex-grow"
            />
            <Input
                {...register(`plan.weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.series`)}
                placeholder="Series"
                className="w-20"
            />
            <Input
                {...register(`plan.weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.reps`)}
                placeholder="Reps"
                className="w-24"
            />
            <Input
                {...register(`plan.weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.mediaUrl`)}
                value={generatedUrl}
                placeholder="URL Video/Imagen"
                className="flex-grow bg-muted/50"
                readOnly
            />
            <Input
                {...register(`plan.weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.rest`)}
                placeholder="Descanso"
                className="w-24"
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(exerciseIndex)}
                className="text-muted-foreground hover:text-destructive flex-shrink-0"
            >
                <XCircle className="h-4 w-4" />
            </Button>
            </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ name: "", series: "4", reps: "8-12", rest: "60s", mediaUrl: "" })}
        className="mt-2"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Añadir Ejercicio
      </Button>
    </div>
  );
}
