
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { generatePersonalizedTrainingPlan } from "@/ai/flows/generate-personalized-training-plan";
import type { GeneratePersonalizedTrainingPlanInput, User, UserPlan } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Trash2, PlusCircle, Sparkles, Loader2, Save, Youtube, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { Label } from "../ui/label";
import Link from "next/link";

type PlanEditorProps = {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveAndApprove: (userId: string, plan: UserPlan) => void;
};

const isVideo = (url: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov'];
    const lowercasedUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowercasedUrl.endsWith(ext));
};

const isYoutubeUrl = (url: string) => {
    if (!url) return false;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
}


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
        try {
          form.reset(JSON.parse(storedPlan));
        } catch (error) {
           console.error("Failed to parse stored plan:", error);
           form.reset({ weeklyPlan: [] });
        }
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
                 <div className="flex justify-end sticky top-0 py-2 bg-card z-10">
                    <Button type="button" onClick={handleGeneratePlan} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isGenerating ? "Generando..." : "Regenerar Plan con IA"}
                    </Button>
                </div>
                {fields.length === 0 && !isGenerating && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">Este usuario aún no tiene un plan.</p>
                        <Button type="button" onClick={handleGeneratePlan} disabled={isGenerating}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generar Plan con IA
                        </Button>
                    </div>
                )}

                {isGenerating && fields.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Generando plan, por favor espera...</p>
                    </div>
                )}
                
                <Accordion type="multiple" defaultValue={fields.map((_, index) => `day-${index}`)} className="w-full">
                    {fields.map((field, dayIndex) => (
                        <AccordionItem key={field.id} value={`day-${dayIndex}`}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-4 w-full">
                                     <Input
                                        {...form.register(`weeklyPlan.${dayIndex}.day`)}
                                        className="w-32 font-bold"
                                        placeholder="Día"
                                     />
                                     <Input
                                        {...form.register(`weeklyPlan.${dayIndex}.focus`)}
                                        className="text-base flex-1"
                                        placeholder="Enfoque del día"
                                     />
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ExercisesFieldArray dayIndex={dayIndex} form={form} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                 <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ day: "Nuevo Día", focus: "Enfoque", exercises: [] })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Día
                </Button>
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


function ExercisesFieldArray({ dayIndex, form }: { dayIndex: number, form: any }) {
    const { control, register } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: `weeklyPlan.${dayIndex}.exercises`
    });
    
    const MediaPreview = ({ exerciseIndex }: { exerciseIndex: number }) => {
        const mediaUrl = useWatch({
            control,
            name: `weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.mediaUrl`
        });

        if (!mediaUrl) {
            return (
                <div className="w-full h-32 bg-secondary rounded-md flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
            )
        };

        if (isYoutubeUrl(mediaUrl)) {
            return (
                <Button asChild variant="secondary" className="w-full">
                     <Link href={mediaUrl} target="_blank" rel="noopener noreferrer">
                        <Youtube className="mr-2 h-5 w-5" />
                        Ver en YouTube
                    </Link>
                </Button>
            )
        }

        if (isVideo(mediaUrl)) {
            return <video src={mediaUrl} controls className="w-full aspect-video rounded-md" />
        }

        return <Image src={mediaUrl} alt="Vista previa del ejercicio" width={200} height={150} className="w-full h-auto object-cover rounded-md" />
    };

    return (
        <div className="space-y-4 pl-4">
            {fields.map((field, exerciseIndex) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-3 rounded-lg bg-secondary/50">
                    <div className="md:col-span-8 space-y-2">
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
                         <div className="space-y-1">
                            <Label htmlFor={`mediaUrl-${dayIndex}-${exerciseIndex}`}>URL de Imagen/Video</Label>
                             <Input
                                id={`mediaUrl-${dayIndex}-${exerciseIndex}`}
                                {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.mediaUrl`)}
                                placeholder="https://example.com/exercise.mp4"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-3 self-center">
                         <MediaPreview exerciseIndex={exerciseIndex} />
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(exerciseIndex)}
                        className="md:col-span-1 text-destructive hover:bg-destructive/10 justify-self-center md:justify-self-end"
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
