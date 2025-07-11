
"use client"

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { generatePersonalizedTrainingPlan } from "@/ai/flows/generate-personalized-training-plan";
import type { GeneratePersonalizedTrainingPlanInput, User, UserPlan } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Trash2, PlusCircle, Sparkles, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";

type PlanEditorProps = {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveAndApprove: (userId: string, plan: UserPlan) => void;
};

export function PlanEditor({ user, isOpen, onClose, onSaveAndApprove }: PlanEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<UserPlan>({
    defaultValues: {
      weeklyPlan: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "weeklyPlan"
  });

  useEffect(() => {
    if (user && isOpen) {
      setIsLoading(true);
      const storedPlan = localStorage.getItem(`userPlan_${user.email}`);
      if (storedPlan) {
        form.reset(JSON.parse(storedPlan));
      } else {
        form.reset({ weeklyPlan: [] });
      }
      setIsLoading(false);
    }
  }, [user, isOpen, form]);

  const handleGeneratePlan = async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
        // This is mock data, in a real app you'd get this from the user profile
        const generationInput: GeneratePersonalizedTrainingPlanInput = {
            goals: "Ganancia muscular y fuerza",
            currentFitnessLevel: "intermedio",
            daysPerWeek: 4,
            preferredWorkoutStyle: "Levantamiento de pesas",
            age: 28,
            weight: 80,
            height: 180,
            goalTerm: "mediano"
        };
        const newPlan = await generatePersonalizedTrainingPlan(generationInput);
        form.reset(newPlan);
        toast({
            title: "Plan Generado",
            description: "Se ha generado un nuevo plan. Revísalo y apruébalo."
        });
    } catch (error) {
        console.error("Error generating plan", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo generar el plan."
        });
    } finally {
        setIsGenerating(false);
    }
  };

  const onSubmit = (data: UserPlan) => {
    if (user) {
        onSaveAndApprove(user.id, data);
        toast({
            title: "Plan Aprobado",
            description: `El plan para ${user.name} ha sido guardado y aprobado.`,
            className: "bg-green-500/20 text-green-700 border-green-500/50"
        });
        onClose();
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">Plan de Entrenamiento para {user.name}</DialogTitle>
          <DialogDescription>
            Revisa, modifica y aprueba el plan de entrenamiento. También puedes generar uno nuevo.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? <Skeleton className="w-full h-full" /> : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-6 pr-4">
                {fields.length === 0 && !isGenerating && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">Este usuario aún no tiene un plan.</p>
                        <Button type="button" onClick={handleGeneratePlan} disabled={isGenerating}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generar Plan con IA
                        </Button>
                    </div>
                )}

                {isGenerating && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Generando plan, por favor espera...</p>
                    </div>
                )}
                
                <Accordion type="multiple" defaultValue={fields.map((_, index) => `day-${index}`)} className="w-full">
                    {fields.map((field, dayIndex) => (
                        <AccordionItem key={field.id} value={`day-${dayIndex}`}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-4">
                                     <Input
                                        {...form.register(`weeklyPlan.${dayIndex}.day`)}
                                        className="w-32 font-bold"
                                        placeholder="Día"
                                     />
                                     <Input
                                        {...form.register(`weeklyPlan.${dayIndex}.focus`)}
                                        className="text-base"
                                        placeholder="Enfoque del día"
                                     />
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ExercisesFieldArray dayIndex={dayIndex} control={form.control} register={form.register} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </form>

            <DialogFooter className="pt-4 border-t mt-auto">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar y Aprobar Plan
                </Button>
            </DialogFooter>
            </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ExercisesFieldArray({ dayIndex, control, register }: { dayIndex: number, control: any, register: any }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `weeklyPlan.${dayIndex}.exercises`
    });

    return (
        <div className="space-y-4 pl-4">
            {fields.map((field, exerciseIndex) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-secondary/50">
                    <div className="col-span-11 space-y-2">
                        <Input
                            {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.name`)}
                            placeholder="Nombre del Ejercicio"
                            className="font-semibold"
                        />
                        <div className="grid grid-cols-3 gap-2">
                             <Input
                                {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.series`)}
                                placeholder="Series"
                            />
                             <Input
                                {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.reps`)}
                                placeholder="Reps"
                            />
                             <Input
                                {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.rest`)}
                                placeholder="Descanso"
                            />
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(exerciseIndex)}
                        className="col-span-1 text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", series: "", reps: "", rest: "", mediaUrl: "" })}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Ejercicio
            </Button>
        </div>
    )
}
