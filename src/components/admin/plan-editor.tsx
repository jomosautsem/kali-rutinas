
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm, useFieldArray, useWatch, Control, UseFormRegister } from "react-hook-form";
import { generatePersonalizedTrainingPlan } from "@/ai/flows/generate-personalized-training-plan";
import type { GeneratePersonalizedTrainingPlanInput, User, UserPlan, Exercise } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Trash2, PlusCircle, Sparkles, Loader2, Save, Youtube, Image as ImageIcon, Lightbulb, XCircle, AlertTriangle, ShieldAlert, Expand } from "lucide-react";
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

const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

const isVideo = (url: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov'];
    const lowercasedUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowercasedUrl.includes(ext));
};

const isYoutubeSearchUrl = (url: string) => {
    if (!url) return false;
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('/results');
    } catch (e) {
        return false;
    }
}


const MediaDisplay = ({ url, alt }: { url: string, alt: string }) => {
    if (!url) {
        return (
            <div className="w-full h-full bg-secondary rounded-md flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
            </div>
        )
    };
    
    const youtubeId = getYoutubeVideoId(url);
    if (youtubeId) {
        return (
            <div className="aspect-video w-full">
                <iframe
                    className="w-full h-full rounded-md"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        )
    }

    if (isVideo(url)) {
        return <video src={url} controls className="w-full max-h-[80vh] rounded-md" />
    }

    return <Image src={url} alt={alt} width={800} height={600} className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-md" data-ai-hint="fitness exercise"/>
};


const MediaPreview = ({ url, alt, onPreviewClick }: { url: string, alt: string, onPreviewClick: () => void }) => {
    if (!url) {
        return (
            <div className="w-full h-32 bg-secondary rounded-md flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
        )
    };
    
    const youtubeId = getYoutubeVideoId(url);

    return (
        <div onClick={onPreviewClick} className="relative group w-full h-32 bg-secondary rounded-md flex items-center justify-center cursor-pointer overflow-hidden">
            {youtubeId ? (
                <Image 
                    src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`} 
                    alt={alt} 
                    fill 
                    className="object-cover" 
                    data-ai-hint="fitness exercise"
                />
            ) : isVideo(url) ? (
                <div className="w-full h-full flex items-center justify-center bg-black">
                    <Youtube className="h-10 w-10 text-white" />
                </div>
            ) : isYoutubeSearchUrl(url) ? (
                <div className="w-full h-full flex items-center justify-center bg-red-900/50">
                    <Youtube className="h-10 w-10 text-white" />
                </div>
            ) : (
                <Image src={url} alt={alt} fill className="object-cover" data-ai-hint="fitness exercise"/>
            )}
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Expand className="h-8 w-8 text-white" />
            </div>
        </div>
    )
};


const dayButtonColors = [
    "bg-yellow-500/80 hover:bg-yellow-500",
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; name: string } | null>(null);
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

  const handlePreviewClick = (exercise: Exercise) => {
    if (isYoutubeSearchUrl(exercise.mediaUrl)) {
         window.open(exercise.mediaUrl, '_blank');
         return;
    }
    setSelectedMedia({ url: exercise.mediaUrl, name: exercise.name });
    setIsModalOpen(true);
  };

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
    <>
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
                    <Alert variant="default" className="bg-primary/10 border-primary/20">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <AlertTitle className="text-primary/90 font-semibold">Datos del Cliente</AlertTitle>
                      <AlertDescription>
                        <ul className="text-sm space-y-1 mt-2 text-primary-foreground/80">
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
                                        "text-primary-foreground transition-all",
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
                                            className="font-bold text-lg"
                                            placeholder="Día 1: Tren Inferior (Enfoque Glúteo)"
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
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <ExercisesFieldArray 
                                      dayIndex={index} 
                                      control={form.control} 
                                      register={form.register} 
                                      onPreviewClick={handlePreviewClick} 
                                    />
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
    
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>{selectedMedia?.name}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center items-center py-4">
                {selectedMedia && <MediaDisplay url={selectedMedia.url} alt={selectedMedia.name} />}
            </div>
        </DialogContent>
    </Dialog>
    </>
  );
}


function ExercisesFieldArray({ dayIndex, control, register, onPreviewClick }: { dayIndex: number; control: Control<UserPlan>; register: UseFormRegister<UserPlan>; onPreviewClick: (exercise: Exercise) => void; }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `weeklyPlan.${dayIndex}.exercises`
    });

    const watchedExercises = useWatch({ control, name: `weeklyPlan.${dayIndex}.exercises` });

    return (
        <div className="space-y-4 pt-4">
            {fields.map((field, exerciseIndex) => {
              const exercise = watchedExercises?.[exerciseIndex] || {};
              return (
                <div key={field.id} className="p-4 rounded-lg bg-card/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-2 space-y-4">
                       <Input
                          {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.name`)}
                          placeholder="Nombre del Ejercicio"
                          className="font-semibold text-base"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.series`)}
                          placeholder="Series"
                          className="w-24"
                        />
                        <Input
                          {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.reps`)}
                          placeholder="Reps"
                          className="w-24"
                        />
                        <Input
                          {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.rest`)}
                          placeholder="Descanso"
                          className="w-24"
                        />
                      </div>
                      <Input
                          {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.mediaUrl`)}
                          placeholder="URL de Video/Imagen (YouTube, .mp4, etc.)"
                      />
                    </div>

                    <div className="self-center">
                       <MediaPreview 
                          url={exercise.mediaUrl || ''} 
                          alt={`Visual de ${exercise.name}`}
                          onPreviewClick={() => onPreviewClick(exercise)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(exerciseIndex)}
                      className="text-muted-foreground hover:text-destructive flex-shrink-0"
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
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
    )
}

    
