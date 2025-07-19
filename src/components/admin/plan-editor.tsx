
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm, useFieldArray, useWatch, Control, UseFormRegister } from "react-hook-form";
import { generatePersonalizedTrainingPlan } from "@/ai/flows/generate-personalized-training-plan";
import type { GeneratePersonalizedTrainingPlanInput, User, UserPlan, DayPlan, Exercise, Set as SetType } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Trash2, PlusCircle, Sparkles, Loader2, Save, Youtube, Image as ImageIcon, Lightbulb, XCircle, AlertTriangle, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { Label } from "../ui/label";
import Link from "next/link";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

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

const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
};

const dayButtonColors = [
    "bg-red-500/80 hover:bg-red-500",
    "bg-blue-500/80 hover:bg-blue-500",
    "bg-green-500/80 hover:bg-green-500",
    "bg-purple-500/80 hover:bg-purple-500",
    "bg-orange-500/80 hover:bg-orange-500",
    "bg-pink-500/80 hover:bg-pink-500",
    "bg-teal-500/80 hover:bg-teal-500",
]


export function PlanEditor({ user, isOpen, onClose, onSaveAndApprove }: PlanEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [onboardingData, setOnboardingData] = useState<GeneratePersonalizedTrainingPlanInput | null>(null);
  const { toast } = useToast();

  const form = useForm<UserPlan>({
    defaultValues: {
      recommendations: "",
      weeklyPlan: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "weeklyPlan"
  });
  
  const weeklyPlanValues = useWatch({
    control: form.control,
    name: "weeklyPlan",
  });

  useEffect(() => {
    if (user && isOpen) {
      setIsLoading(true);
      setActiveDayIndex(0);
      
      const storedPlan = localStorage.getItem(`userPlan_${user.email}`);
      if (storedPlan) {
        try {
          form.reset(JSON.parse(storedPlan));
        } catch (error) {
           console.error("Failed to parse stored plan:", error);
           form.reset({ recommendations: "", weeklyPlan: [] });
        }
      } else {
        form.reset({ recommendations: "", weeklyPlan: [] });
      }

      const storedOnboardingData = localStorage.getItem(`onboardingData_${user.email}`);
      if (storedOnboardingData) {
        try {
          setOnboardingData(JSON.parse(storedOnboardingData));
        } catch (error) {
           console.error("Failed to parse onboarding data:", error);
           setOnboardingData(null);
        }
      } else {
        setOnboardingData(null);
      }

      setIsLoading(false);
    }
  }, [user, isOpen, form]);

  const handleGeneratePlan = async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
        const generationInput: GeneratePersonalizedTrainingPlanInput = onboardingData || {
            goals: ["ganar masa muscular", "ganar fuerza"],
            currentFitnessLevel: "intermedio",
            trainingDays: ["lunes", "martes", "jueves", "viernes"],
            preferredWorkoutStyle: "Levantamiento de pesas",
            age: 28,
            weight: 80,
            height: 180,
            goalTerm: "mediano"
        };
        const newPlan = await generatePersonalizedTrainingPlan(generationInput);
        
        // Post-process to add unique IDs to sets
        const planWithSetIds = {
            ...newPlan,
            weeklyPlan: newPlan.weeklyPlan.map(day => ({
                ...day,
                exercises: day.exercises.map(exercise => ({
                    ...exercise,
                    sets: exercise.sets.map(set => ({
                        ...set,
                        id: `set-${Math.random().toString(36).substr(2, 9)}`
                    }))
                }))
            }))
        };

        form.reset(planWithSetIds);
        setActiveDayIndex(0);
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
        onClose();
    }
  };

  const removeDay = (index: number) => {
    remove(index);
    if (activeDayIndex >= index) {
      setActiveDayIndex(prev => Math.max(0, prev - 1));
    }
  }

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {onboardingData && (
                    <Alert variant="default" className="bg-blue-500/10 border-blue-500/20">
                      <Lightbulb className="h-5 w-5 text-blue-500" />
                      <AlertTitle className="text-blue-600 font-semibold">Datos del Cliente</AlertTitle>
                      <AlertDescription>
                        <ul className="text-sm space-y-1 mt-2 text-blue-700/80">
                          <li><strong>Metas:</strong> {onboardingData.goals.join(', ')}</li>
                          <li><strong>Nivel:</strong> {onboardingData.currentFitnessLevel}</li>
                          <li><strong>Días:</strong> {onboardingData.trainingDays.join(', ')}</li>
                          <li><strong>Estilo:</strong> {onboardingData.preferredWorkoutStyle}</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  {onboardingData?.injuriesOrConditions && (
                      <Alert variant="destructive" className="bg-orange-500/10 border-orange-500/20 text-orange-700">
                          <ShieldAlert className="h-5 w-5 text-orange-500" />
                          <AlertTitle className="text-orange-600 font-semibold">Lesiones/Condiciones Reportadas</AlertTitle>
                          <AlertDescription className="text-sm mt-2 text-orange-700/80">
                            {onboardingData.injuriesOrConditions}
                          </AlertDescription>
                      </Alert>
                  )}
                </div>

                <div className="space-y-2 p-4 rounded-lg border bg-secondary/30">
                  <Label htmlFor="recommendations" className="flex items-center gap-2 text-base font-semibold">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Recomendaciones Generales
                  </Label>
                  <Textarea
                    id="recommendations"
                    {...form.register(`recommendations`)}
                    placeholder="Escribe aquí cualquier sugerencia, nota nutricional o recomendación general para el cliente..."
                    rows={3}
                    className="text-sm bg-card"
                  />
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
                
                {fields.length > 0 && (
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
                                            {...form.register(`weeklyPlan.${index}.day`)}
                                            className="w-40 font-bold"
                                            placeholder="Día"
                                        />
                                        <Input
                                            {...form.register(`weeklyPlan.${index}.focus`)}
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
                                            <XCircle className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <ExercisesFieldArray dayIndex={index} control={form.control} register={form.register} getValues={form.getValues} setValue={form.setValue} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}


                 <DialogFooter className="pt-4 border-t mt-auto sticky bottom-0 bg-card">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Guardar y Aprobar Plan
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}


function ExercisesFieldArray({ dayIndex, control, register, getValues, setValue }: { dayIndex: number; control: Control<UserPlan>; register: UseFormRegister<UserPlan>; getValues: any, setValue: any }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `weeklyPlan.${dayIndex}.exercises`
    });

    const handleSetCountChange = (exerciseIndex: number, count: number) => {
        const currentSets = getValues(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.sets`);
        const newSets = Array.from({ length: count }, (_, i) => {
            return currentSets[i] || { id: `set-${Math.random().toString(36).substr(2, 9)}`, reps: "8-12", weight: "", completed: false };
        });
        setValue(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.sets`, newSets, { shouldValidate: true });
    };

    return (
        <div className="space-y-4 pt-4">
            {fields.map((field, exerciseIndex) => {
                const sets = getValues(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.sets`) || [];
                return (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-3 rounded-lg bg-card/50">
                        <div className="md:col-span-8 space-y-4">
                            <div className="flex items-center gap-2">
                                <Input
                                    {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.name`)}
                                    placeholder="Nombre del Ejercicio"
                                    className="font-semibold text-lg flex-1 bg-secondary/30 border-secondary"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(exerciseIndex)}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-3 p-3 bg-secondary/30 rounded-md">
                                <div className="flex items-center gap-4">
                                    <Label className="font-semibold">Series</Label>
                                    <div className="flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5, 6].map(num => (
                                            <Button
                                                key={num}
                                                type="button"
                                                variant={sets.length === num ? 'default' : 'outline'}
                                                size="sm"
                                                className="w-10"
                                                onClick={() => handleSetCountChange(exerciseIndex, num)}
                                            >
                                                {num}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Reps Objetivo</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {sets.map((set: SetType, setIndex: number) => (
                                            <div key={set.id} className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-muted-foreground">{setIndex + 1}.</span>
                                                <Input
                                                    {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.sets.${setIndex}.reps`)}
                                                    placeholder="Ej. 8-12"
                                                    className="h-9"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 items-end">
                                <div className="space-y-1">
                                    <Label htmlFor={`rest-${dayIndex}-${exerciseIndex}`} className="text-xs">Descanso</Label>
                                    <Input
                                        id={`rest-${dayIndex}-${exerciseIndex}`}
                                        {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.rest`)}
                                        placeholder="Ej. 60s"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`mediaUrl-${dayIndex}-${exerciseIndex}`} className="text-xs">URL de Imagen/Video</Label>
                                    <Input
                                        id={`mediaUrl-${dayIndex}-${exerciseIndex}`}
                                        {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.mediaUrl`)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-4 self-center">
                            <MediaPreview dayIndex={dayIndex} exerciseIndex={exerciseIndex} control={control} />
                        </div>
                    </div>
                )
            })}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", sets: [{ id: `set-${Math.random().toString(36).substr(2, 9)}`, reps: "8-12", weight: "", completed: false }], rest: "60s", mediaUrl: "" })}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Ejercicio
            </Button>
        </div>
    )
}

const MediaPreview = ({ dayIndex, exerciseIndex, control }: { dayIndex: number, exerciseIndex: number, control: Control<UserPlan> }) => {
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
            <Button asChild variant="secondary" className="w-full h-32">
                 <Link href={mediaUrl} target="_blank" rel="noopener noreferrer" className="flex-col gap-2">
                    <Youtube className="h-8 w-8" />
                    <span className="text-xs">Ver en YouTube</span>
                </Link>
            </Button>
        )
    }

    if (isVideo(mediaUrl)) {
        return <video src={mediaUrl} controls className="w-full aspect-video rounded-md" />
    }

    if (!isValidUrl(mediaUrl)) {
         return (
            <div className="w-full h-32 bg-destructive/10 rounded-md flex flex-col items-center justify-center text-center p-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <p className="text-xs text-destructive font-semibold mt-1">URL Inválida</p>
            </div>
        )
    }

    return <Image src={mediaUrl} alt="Vista previa del ejercicio" width={200} height={150} className="w-full h-32 object-cover rounded-md" data-ai-hint="fitness exercise"/>
};

    

    