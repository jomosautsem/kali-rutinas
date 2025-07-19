
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
      
      // Load existing plan
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

      // Load onboarding data
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
            // Default values if no onboarding data is found
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
        form.reset(newPlan);
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
        toast({
            title: "Plan Aprobado",
            description: `El plan para ${user.name} ha sido guardado y aprobado.`,
            className: "bg-green-500/20 text-green-700 border-green-500/50"
        });
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
                                    <ExercisesFieldArray dayIndex={index} form={form} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}


                 <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ day: `Día ${fields.length + 1}`, focus: "Enfoque", exercises: [] })}
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

        if (!isValidUrl(mediaUrl)) {
             return (
                <div className="w-full h-32 bg-destructive/10 rounded-md flex flex-col items-center justify-center text-center p-2">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    <p className="text-xs text-destructive font-semibold mt-1">URL Inválida</p>
                </div>
            )
        }

        return <Image src={mediaUrl} alt="Vista previa del ejercicio" width={200} height={150} className="w-full h-auto object-cover rounded-md" data-ai-hint="fitness exercise"/>
    };

    return (
        <div className="space-y-4 pt-4">
            {fields.map((field, exerciseIndex) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-3 rounded-lg bg-card/50">
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
