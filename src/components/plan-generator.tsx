
"use client"

import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"

import { generatePersonalizedTrainingPlan } from "@/ai/flows/generate-personalized-training-plan"
import { GeneratePersonalizedTrainingPlanInputSchema, type GeneratePersonalizedTrainingPlanInput } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MultiToggleButtonGroup } from "@/components/ui/multi-toggle"
import { StepsIndicator } from "@/components/onboarding/steps-indicator"
import { Step } from "@/components/onboarding/step"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { Sparkles, CheckCircle, Loader2, Dumbbell, HeartPulse, Shield, User, Trophy, Clock, ArrowLeft, Send, AlertTriangle } from "lucide-react"

type PlanGeneratorProps = {
  onPlanGenerated: () => void;
};

// --- Sub-components for the multi-step form ---

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
    { value: "fuerza", label: "Fuerza" },
    { value: "resistencia", label: "Resistencia" },
    { value: "hipertrofia", label: "Hipertrofia" },
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
    { id: "step-1", title: "Metas", fields: ["goals", "goalTerm"], icon: Trophy },
    { id: "step-2", title: "Tu Nivel", fields: ["currentFitnessLevel", "trainingDays"], icon: HeartPulse },
    { id: "step-3", title: "Tu Estilo", fields: ["preferredWorkoutStyle", "otherWorkoutStyle", "muscleFocus"], icon: Dumbbell },
    { id: "step-4", title: "Salud", fields: ["injuriesOrConditions"], icon: Shield }
];

const WarningView = ({ onAccept }: { onAccept: () => void }) => (
    <div className="flex flex-col items-center justify-center text-center p-4 space-y-6 h-full">
        <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Antes de Continuar</DialogTitle>
        </DialogHeader>
        <Alert variant="destructive" className="text-left">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-bold">Advertencia Importante</AlertTitle>
            <AlertDescription>
                Este generador creará un plan de entrenamiento basado <span className="font-bold">únicamente en la información que proporciones</span>.
                El plan generado por la IA <span className="font-bold">no será revisado</span> por un coach o administrador de Kali Gym.
                Eres responsable de entrenar de forma segura.
            </AlertDescription>
        </Alert>
        <Button onClick={onAccept} className="w-full">
            Entiendo y acepto, deseo continuar
        </Button>
    </div>
);


const PlanGeneratedConfirmation = ({ onClose }: { onClose: () => void }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 h-full">
        <CheckCircle className="h-16 w-16 text-green-500 animate-pulse" />
        <h3 className="text-xl font-bold font-headline">¡Plan Enviado para Revisión!</h3>
        <p className="text-muted-foreground">
            Tu plan personalizado ha sido creado y enviado a Kali Gym.
            Recibirás una notificación cuando sea aprobado.
        </p>
        <Button onClick={onClose} className="mt-4">
            Entendido
        </Button>
    </div>
);


const FormNavigation = ({ currentStep, totalSteps, isLoading, onBack, isDirty }: { currentStep: number; totalSteps: number; isLoading: boolean; onBack: () => void; isDirty: boolean; }) => {
    const isLastStep = currentStep === totalSteps - 1;
    return (
        <div className="flex justify-between items-center pt-4 mt-auto border-t">
            <div>
                {currentStep > 0 && (
                    <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Anterior
                    </Button>
                )}
            </div>
            <div className="text-sm text-muted-foreground">
                Paso {currentStep + 1} de {totalSteps}
            </div>
            <div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLastStep ? (isDirty ? "Generar Plan" : "Re-Generar Plan") : "Siguiente"}
                    {!isLoading && <Send className="ml-2 h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
};


// --- Main Component ---

export function PlanGenerator({ onPlanGenerated }: PlanGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [hasAcceptedWarning, setHasAcceptedWarning] = useState(false);
    const [isPlanSuccessfullyGenerated, setIsPlanSuccessfullyGenerated] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(0);
    const { toast } = useToast();

    const form = useForm<OnboardingFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            goals: [],
            currentFitnessLevel: "principiante",
            trainingDays: [],
            preferredWorkoutStyle: "fuerza",
            muscleFocus: [],
            otherWorkoutStyle: "",
            age: 25, // Default age
            weight: 70, // Default weight
            height: 175, // Default height
            goalTerm: "mediano",
            injuriesOrConditions: "",
        },
        mode: "onChange",
    });
    
    const { formState: { isDirty } } = form;
    const watchedWorkoutStyle = form.watch("preferredWorkoutStyle");

    // Load user data from localStorage when the dialog opens
    useEffect(() => {
        if (isOpen && typeof window !== 'undefined') {
            const loggedInUserEmail = sessionStorage.getItem("loggedInUser");
            if (loggedInUserEmail) {
                const data = localStorage.getItem(`onboardingData_${loggedInUserEmail}`);
                if (data) {
                    try {
                        const parsedData = JSON.parse(data);
                        form.reset(parsedData); // Populate form with stored data
                    } catch (e) {
                        console.error("Failed to parse onboarding data:", e);
                    }
                }
            }
        }
    }, [isOpen, form]);

    async function processStep() {
        const fieldsToValidate = steps[currentStep].fields as (keyof OnboardingFormValues)[];
        const isValid = await form.trigger(fieldsToValidate, { shouldFocus: true });
        
        if (!isValid) return;

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            await form.handleSubmit(onSubmit)();
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }

    async function onSubmit(values: OnboardingFormValues) {
        setIsLoading(true);
        setIsPlanSuccessfullyGenerated(false);
        const email = sessionStorage.getItem("loggedInUser");
        if (!email) {
            toast({ variant: "destructive", title: "Error", description: "No se encontró sesión de usuario." });
            setIsLoading(false);
            return;
        }

        try {
            const finalWorkoutStyle = values.preferredWorkoutStyle === 'otro' 
                ? values.otherWorkoutStyle
                : values.preferredWorkoutStyle;

            const dataToSave: GeneratePersonalizedTrainingPlanInput = {
                ...values,
                preferredWorkoutStyle: finalWorkoutStyle!,
            };
            delete (dataToSave as any).otherWorkoutStyle;

            // Save the updated data back to localStorage
            localStorage.setItem(`onboardingData_${email}`, JSON.stringify(dataToSave));

            const plan = await generatePersonalizedTrainingPlan(dataToSave);
            localStorage.setItem(`userPlan_${email}`, JSON.stringify(plan));
            
            toast({
                title: "Plan Enviado para Aprobación",
                description: "Tu plan actualizado se ha guardado y está pendiente de revisión.",
            });

            onPlanGenerated();
            setIsPlanSuccessfullyGenerated(true);

        } catch (error) {
            console.error("Error al generar el plan:", error)
            toast({
                variant: "destructive",
                title: "Falló la Generación",
                description: "No se pudo generar un plan. Por favor, inténtalo de nuevo.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setTimeout(() => {
                setHasAcceptedWarning(false);
                setIsPlanSuccessfullyGenerated(false);
                setIsLoading(false);
                setCurrentStep(0);
                form.reset();
            }, 300);
        }
    }

    const renderContent = () => {
        if (isPlanSuccessfullyGenerated) {
            return <PlanGeneratedConfirmation onClose={() => handleOpenChange(false)} />;
        }

        if (!hasAcceptedWarning) {
            return <WarningView onAccept={() => setHasAcceptedWarning(true)} />;
        }

        return (
            <>
                <DialogHeader>
                    <DialogTitle className="font-headline">Tu Plan, a tu Manera</DialogTitle>
                    <DialogDescription>
                        Ajusta tus preferencias para que la IA cree el plan perfecto para ti.
                    </DialogDescription>
                </DialogHeader>
                <FormProvider {...form}>
                    <form onSubmit={(e) => { e.preventDefault(); processStep(); }} className="flex-1 flex flex-col overflow-hidden space-y-4">
                        <StepsIndicator steps={steps} currentStep={currentStep} />
                        
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                className="flex-grow overflow-y-auto pr-4 -mr-4"
                            >
                                {currentStep === 0 && (
                                    <Step title={steps[0].title} icon={steps[0].icon}>
                                        <FormField control={form.control} name="goals" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Metas Principales</FormLabel>
                                                <FormControl><MultiToggleButtonGroup options={fitnessGoalsOptions} selected={field.value} onChange={field.onChange} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="goalTerm" render={({ field }) => (
                                            <FormItem><FormLabel>Plazo de la Meta</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                {currentStep === 1 && (
                                    <Step title={steps[1].title} icon={steps[1].icon}>
                                        <FormField control={form.control} name="currentFitnessLevel" render={({ field }) => (
                                            <FormItem><FormLabel>Nivel de Condición Física</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                            <FormItem><FormLabel>Días de Entrenamiento</FormLabel>
                                                <FormControl><MultiToggleButtonGroup options={trainingDaysOptions} selected={field.value} onChange={field.onChange} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </Step>
                                )}
                                {currentStep === 2 && (
                                    <Step title={steps[2].title} icon={steps[2].icon}>
                                        <FormField control={form.control} name="preferredWorkoutStyle" render={({ field }) => (
                                            <FormItem><FormLabel>Estilo de Entrenamiento Preferido</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un estilo" /></SelectTrigger></FormControl>
                                                    <SelectContent>{workoutStyleOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        {watchedWorkoutStyle === 'otro' && (
                                            <FormField control={form.control} name="otherWorkoutStyle" render={({ field }) => (
                                                <FormItem><FormLabel>Especifica tu estilo</FormLabel>
                                                    <FormControl><Input placeholder="Ej. CrossFit, Powerlifting" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        )}
                                        <FormField control={form.control} name="muscleFocus" render={({ field }) => (
                                            <FormItem><FormLabel>Enfoque Muscular (Opcional)</FormLabel>
                                                <FormControl><MultiToggleButtonGroup options={muscleFocusOptions} selected={field.value} onChange={field.onChange} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </Step>
                                )}
                                {currentStep === 3 && (
                                    <Step title={steps[3].title} icon={steps[3].icon}>
                                        <FormField control={form.control} name="injuriesOrConditions" render={({ field }) => (
                                            <FormItem><FormLabel>Lesiones o Condiciones Médicas (Opcional)</FormLabel>
                                                <FormControl><Textarea placeholder="Ej. Dolor lumbar crónico, tendinitis en el hombro derecho..." {...field} rows={6} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </Step>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <FormNavigation
                            currentStep={currentStep}
                            totalSteps={steps.length}
                            isLoading={isLoading}
                            onBack={prevStep}
                            isDirty={isDirty}
                        />
                    </form>
                </FormProvider>
            </>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar/Actualizar Plan
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                {renderContent()}
            </DialogContent>
        </Dialog>
    )
}
