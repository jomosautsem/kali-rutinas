
"use client"

import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch, Control, UseFormRegister } from "react-hook-form";
import type { UserPlan } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Trash2, PlusCircle, Save, XCircle } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";

type TemplateEditorProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: UserPlan) => void;
  initialData?: UserPlan | null;
};

const dayButtonColors = [
    "bg-red-500/80 hover:bg-red-500",
    "bg-blue-500/80 hover:bg-blue-500",
    "bg-green-500/80 hover:bg-green-500",
    "bg-purple-500/80 hover:bg-purple-500",
    "bg-orange-500/80 hover:bg-orange-500",
    "bg-pink-500/80 hover:bg-pink-500",
    "bg-teal-500/80 hover:bg-teal-500",
];

export function TemplateEditor({ isOpen, onClose, onSave, initialData }: TemplateEditorProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const form = useForm<UserPlan>({
    defaultValues: initialData || {
      recommendations: "",
      weeklyPlan: [{ day: "Día 1", focus: "Enfoque del día", exercises: [] }]
    }
  });
  
  const { control, register, handleSubmit, reset } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "weeklyPlan"
  });

  const weeklyPlanValues = useWatch({ control, name: "weeklyPlan" });

  useEffect(() => {
    if (isOpen) {
      reset(initialData || { recommendations: "", weeklyPlan: [{ day: "Día 1", focus: "Enfoque del día", exercises: [] }] });
      setActiveDayIndex(0);
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: UserPlan) => {
    onSave(data);
    onClose();
  };

  const removeDay = (index: number) => {
    remove(index);
    if (activeDayIndex >= index && activeDayIndex > 0) {
      setActiveDayIndex(prev => prev - 1);
    } else if (fields.length === 1) {
      // If we remove the last day, what to do? Let's just reset active index.
      setActiveDayIndex(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">Editor de Plantilla Manual</DialogTitle>
          <DialogDescription>
            Crea o modifica una plantilla de entrenamiento de forma manual.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-6 pr-4">
            <div className="space-y-2 p-4 rounded-lg border bg-secondary/30">
              <Label htmlFor="recommendations" className="text-base font-semibold">
                Recomendaciones Generales
              </Label>
              <Textarea
                id="recommendations"
                {...register("recommendations")}
                placeholder="Escribe aquí cualquier sugerencia general para esta plantilla..."
                rows={3}
                className="text-sm bg-card"
              />
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
                        "text-white transition-all",
                        activeDayIndex === index
                          ? `${dayButtonColors[index % dayButtonColors.length]} scale-105 shadow-lg`
                          : "bg-gray-600/50 hover:bg-gray-600"
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
                          {...register(`weeklyPlan.${index}.day`)}
                          className="font-bold text-lg"
                          placeholder="Nombre del día"
                        />
                        <Input
                          {...register(`weeklyPlan.${index}.focus`)}
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
      </DialogContent>
    </Dialog>
  );
}

function ExercisesFieldArray({ dayIndex, control, register }: { dayIndex: number; control: Control<UserPlan>; register: UseFormRegister<UserPlan> }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `weeklyPlan.${dayIndex}.exercises`
  });

  return (
    <div className="space-y-2 pt-4">
      {fields.map((field, exerciseIndex) => (
        <div key={field.id} className="flex items-center gap-2 p-2 rounded-md bg-card/50">
          <Input
            {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.name`)}
            placeholder="Ejercicio"
            className="flex-grow"
          />
          <Input
            {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.series`)}
            placeholder="Series"
            className="w-20"
          />
          <Input
            {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.reps`)}
            placeholder="Reps"
            className="w-24"
          />
          <Input
            {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.mediaUrl`)}
            placeholder="URL Video/Imagen"
            className="flex-grow"
          />
          <Input
            {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.rest`)}
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
      ))}
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
