
"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { generatePersonalizedTrainingPlan } from "@/ai/flows/generate-personalized-training-plan"
import { GeneratePersonalizedTrainingPlanInputSchema, type UserPlan } from "@/lib/types"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Sparkles, Dumbbell, HeartPulse, Shield, User as UserIcon, Trophy, Scale, Ruler, Clock, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { StepsIndicator } from "@/components/onboarding/steps-indicator"
import { FormNavigation } from "@/components/onboarding/form-navigation"
import { Step } from "@/components/onboarding/step"
import { MultiToggleButtonGroup } from "@/components/ui/multi-toggle"

const formSchema = GeneratePersonalizedTrainingPlanInputSchema.extend({
    otherWorkoutStyle: z.string().optional()
}).superRefine((data, ctx) => {
    if (data.preferredWorkoutStyle === 'otro' && (!data.otherWorkoutStyle || data.otherWorkoutStyle.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['otherWorkoutStyle'],
            message: 'Por favor, especifica el estilo de entrenamiento.',
        });
    }
});

type OnboardingFormValues = z.infer<typeof formSchema>;

const fitnessGoalsOptions = [
    { value: "perder peso/definicion", label: "Perder peso/Definición" },
    { value: "ganar masa muscular", label: "Ganar masa muscular" },
    { value: "recomposicion corporal", label: "Recomposición corporal" },
    { value: "ganar fuerza", label: "Ganar fuerza" },
    { value: "mejorar salud general", label: "Mejorar salud general" },
    { value: "rendimiento deportivo", label: "Rendimiento deportivo" },
];

const trainingDaysOptions = [
    { value: "lunes", label: "Lunes" },
    { value: "martes", label: "Martes" },
    { value: "miercoles", label: "Miércoles" },
    { value: "jueves", label: "Jueves" },
    { value: "viernes", label: "Viernes" },
    { value: "sabado", label: "Sábado" },
    { value: "domingo", label: "Domingo" },
];

const workoutStyleOptions = [
    { value: "definicion muscular", label: "Definición Muscular" },
    { value: "heavy duty", label: "Heavy Duty" },
    { value: "fuerza", label: "Fuerza" },
    { value: "hipertrofia", label: "Hipertrofia" },
    { value: "resistencia", label: "Resistencia" },
    { value: "cardio", label: "Cardio" },
    { value: "hiit", label: "HIIT" },
    { value: "nucleus overload", label: "Nucleus Overload" },
    { value: "otro", label: "Otro (especificar)" },
]

const muscleFocusOptions = [
    { value: "pecho", label: "Pecho" },
    { value: "espalda", label: "Espalda" },
    { value: "pierna", label: "Pierna (Completa)" },
    { value: "gluteos y esquiotibiales", label: "Glúteos e Isquios" },
    { value: "hombros", label: "Hombros" },
    { value: "brazos", label: "Brazos (Completo)" },
    { value: "abdomen", label: "Abdomen" },
]

const steps = [
    { id: "step-1", title: "Metas", fields: ["goals"], icon: Trophy },
    { id: "step-2", title: "Plazo", fields: ["goalTerm"], icon: Clock },
    { id: "step-3", title: "Duración", fields: ["planDuration"], icon: Calendar },
    { id: "step-4", title: "Tu Nivel", fields: ["currentFitnessLevel", "trainingDays", "trainingTimePerDay"], icon: HeartPulse },
    { id: "step-5", title: "Tu Estilo", fields: ["preferredWorkoutStyle", "otherWorkoutStyle", "muscleFocus"], icon: Dumbbell },
    { id: "step-6", title: "Tus Datos", fields: ["age", "weight", "height"], icon: UserIcon },
    { id: "step-7", title: "Salud", fields: ["injuriesOrConditions"], icon: Shield }
];


type PlanGeneratorProps = {
  onPlanGenerated: (newPlan: UserPlan) => void;
};

export function PlanGenerator({ onPlanGenerated }: PlanGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();
    
    const form = useForm<OnboardingFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            goals: [],
            currentFitnessLevel: "principiante",
            trainingDays: [],
            trainingTimePerDay: "60 minutos",
            preferredWorkoutStyle: "fuerza",
            muscleFocus: [],
            otherWorkoutStyle: "",
            age: undefined,
            weight: undefined,
            height: undefined,
            goalTerm: "mediano",
            planDuration: 4,
            injuriesOrConditions: "",
            exercisesPerDay: 8,
            history: [],
        },
        mode: "onChange",
    });

    const watchedWorkoutStyle = form.watch("preferredWorkoutStyle");

    const processStep = async () => {
        if (currentStep === steps.length - 1) {
            await form.handleSubmit(onSubmit)();
            return;
        }
        
        const fieldsToValidate = steps[currentStep].fields as (keyof OnboardingFormValues)[];
        const isValid = await form.trigger(fieldsToValidate, { shouldFocus: true });
        
        if (isValid) {
            setCurrentStep(currentStep + 1);
        }
    }
  
    const prevStep = () => {
        if(currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }
    
    async function onSubmit(values: OnboardingFormValues) {
        setIsGenerating(true);
        try {
            const finalWorkoutStyle = values.preferredWorkoutStyle === 'otro' 
                ? values.otherWorkoutStyle
                : values.preferredWorkoutStyle;
            
            const generationInput: GeneratePersonalizedTrainingPlanInput = {
                ...values,
                preferredWorkoutStyle: finalWorkoutStyle!,
            };
            delete (generationInput as any).otherWorkoutStyle;

            const planHistoryString = typeof window !== 'undefined' ? localStorage.getItem(`planHistory_${sessionStorage.getItem('loggedInUser')}`) : null;
            generationInput.history = planHistoryString ? JSON.parse(planHistoryString) : [];

            const newPlan = await generatePersonalizedTrainingPlan(generationInput);
            onPlanGenerated(newPlan);
            toast({
                title: "¡Plan de IA Generado!",
                description: "Tu nuevo plan está listo y ha sido aprobado automáticamente."
            });
            handleClose();

        } catch (error) {
             toast({
                variant: "destructive",
                title: "Error al generar el plan",
                description: "No se pudo crear el plan con IA. Por favor, inténtalo de nuevo.",
            });
        } finally {
            setIsGenerating(false);
        }
    }

    const handleClose = () => {
        setIsOpen(false);
        // Reset form after a delay to allow dialog to close smoothly
        setTimeout(() => {
            form.reset();
            setCurrentStep(0);
        }, 300);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                handleClose();
            } else {
                setIsOpen(true);
            }
        }}>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar Plan con IA
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Advertencia de Responsabilidad</AlertDialogTitle>
                        <AlertDialogDescription>
                            El plan que estás a punto de generar será creado exclusivamente por Inteligencia Artificial (IA) y no será revisado por ningún entrenador de Kali Gym. Al continuar, aceptas que es tu responsabilidad ejecutar los ejercicios con la técnica adecuada y entrenar de forma segura.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <DialogTrigger asChild>
                             <AlertDialogAction onClick={() => setIsOpen(true)}>Entendido, generar plan</AlertDialogAction>
                        </DialogTrigger>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <DialogContent className="sm:max-w-2xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-headline">Generador de Plan Personalizado con IA</DialogTitle>
                    <DialogDescription>
                        Completa tus datos para que la inteligencia artificial cree el plan perfecto para ti.
                    </DialogDescription>
                </DialogHeader>

                <FormProvider {...form}>
                    <form onSubmit={(e) => { e.preventDefault(); processStep(); }} className="space-y-4 flex flex-col flex-grow overflow-hidden">
                        <StepsIndicator steps={steps} currentStep={currentStep} />
                        <div className="flex-grow overflow-y-auto pr-6 -mr-6">
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={currentStep} 
                                    initial={{ opacity: 0, x: 50 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, x: -50 }} 
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col flex-grow"
                                >
                                    <div className="flex-grow">
                                    {currentStep === 0 && (
                                        <Step title={steps[0].title} icon={steps[0].icon}>
                                            <FormField control={form.control} name="goals" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Metas Principales</FormLabel>
                                                    <FormControl>
                                                    <MultiToggleButtonGroup
                                                        options={fitnessGoalsOptions}
                                                        selected={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </Step>
                                    )}
                                    {currentStep === 1 && (
                                        <Step title={steps[1].title} icon={steps[1].icon}>
                                            <FormField control={form.control} name="goalTerm" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Plazo de la Meta</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un plazo" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="corto">Corto Plazo (1-3 meses)</SelectItem>
                                                            <SelectItem value="mediano">Mediano Plazo (3-6 meses)</SelectItem>
                                                            <SelectItem value="largo">Largo Plazo (6+ meses)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </Step>
                                    )}
                                    {currentStep === 2 && (
                                        <Step title={steps[2].title} icon={steps[2].icon}>
                                            <FormField
                                                control={form.control}
                                                name="planDuration"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Duración del Ciclo de Entrenamiento</FormLabel>
                                                        <Select
                                                            onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                                            defaultValue={String(field.value)}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Selecciona la duración" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="4">4 Semanas (Estándar)</SelectItem>
                                                                <SelectItem value="6">6 Semanas</SelectItem>
                                                                <SelectItem value="8">8 Semanas</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </Step>
                                    )}
                                    {currentStep === 3 && (
                                        <Step title={steps[3].title} icon={steps[3].icon}>
                                        <FormField control={form.control} name="currentFitnessLevel" render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Nivel de Condición Física</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona tu nivel" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                <SelectItem value="principiante">Principiante</SelectItem>
                                                <SelectItem value="intermedio">Intermedio</SelectItem>
                                                <SelectItem value="avanzado">Avanzado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="trainingDays" render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Días de Entrenamiento</FormLabel>
                                            <FormControl>
                                                <MultiToggleButtonGroup
                                                    options={trainingDaysOptions}
                                                    selected={field.value}
                                                    onChange={field.onChange}
                                                />
                                                </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="trainingTimePerDay" render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Tiempo de Entrenamiento por Día</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona tu tiempo disponible" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                <SelectItem value="40 minutos">40 minutos</SelectItem>
                                                <SelectItem value="60 minutos">60 minutos</SelectItem>
                                                <SelectItem value="90 minutos">90 minutos</SelectItem>
                                                <SelectItem value="120 minutos">120 minutos</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )} />
                                        </Step>
                                    )}
                                    {currentStep === 4 && (
                                        <Step title={steps[4].title} icon={steps[4].icon}>
                                            <FormField control={form.control} name="preferredWorkoutStyle" render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Estilo de Entrenamiento Preferido</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un estilo" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                    {workoutStyleOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                                </FormItem>
                                            )} />
                                            {watchedWorkoutStyle === 'otro' && (
                                                <FormField control={form.control} name="otherWorkoutStyle" render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel>Especifica tu estilo</FormLabel>
                                                    <FormControl><Input placeholder="Ej. CrossFit, Powerlifting" {...field} /></FormControl>
                                                    <FormMessage />
                                                    </FormItem>
                                                )} />
                                            )}
                                            <FormField control={form.control} name="muscleFocus" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Enfoque Muscular (Opcional)</FormLabel>
                                                    <FormControl>
                                                    <MultiToggleButtonGroup
                                                        options={muscleFocusOptions}
                                                        selected={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </Step>
                                    )}
                                    {currentStep === 5 && (
                                        <Step title={steps[5].title} icon={steps[5].icon}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField control={form.control} name="age" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Edad</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                <Input 
                                                                    type="number" 
                                                                    placeholder="Tu edad" 
                                                                    className="pl-10"
                                                                    {...field} 
                                                                    value={field.value ?? ''}
                                                                    onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} 
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="weight" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Peso (kg)</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                <Input 
                                                                    type="number" 
                                                                    placeholder="Tu peso en kg"
                                                                    className="pl-10" 
                                                                    {...field} 
                                                                    value={field.value ?? ''}
                                                                    onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} 
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                            <FormField control={form.control} name="height" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Estatura (cm)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input 
                                                                type="number" 
                                                                placeholder="Tu altura en cm"
                                                                className="pl-10"
                                                                {...field} 
                                                                value={field.value ?? ''}
                                                                onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} 
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </Step>
                                    )}
                                    {currentStep === 6 && (
                                        <Step title={steps[6].title} icon={steps[6].icon}>
                                            <FormField control={form.control} name="injuriesOrConditions" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Lesiones o Condiciones Médicas (Opcional)</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Ej. Dolor lumbar crónico, tendinitis en el hombro derecho..." {...field} rows={6} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </Step>
                                    )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <div className="mt-auto pt-4 flex-shrink-0">
                            <FormNavigation 
                                currentStep={currentStep}
                                totalSteps={steps.length}
                                isLoading={isGenerating}
                                onBack={prevStep}
                            />
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    )
}
