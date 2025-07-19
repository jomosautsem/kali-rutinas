
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { GeneratePersonalizedTrainingPlanInputSchema } from "@/lib/types"

import { Button } from "@/components/ui/button"
import {
  Form,
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
import { Loader2, CheckCircle, Dumbbell, CalendarDays, Zap, HeartPulse, Shield, User, Trophy, Scale, Ruler } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AuthCard } from "@/components/auth-card"
import { MultiSelect } from "@/components/ui/multi-select"
import { Textarea } from "@/components/ui/textarea"
import { StepsIndicator } from "@/components/onboarding/steps-indicator"
import { FormNavigation } from "@/components/onboarding/form-navigation"
import { Step } from "@/components/onboarding/step"


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
    { value: "hiit", label: "HIIT (Entrenamiento de Intervalos de Alta Intensidad)" },
    { value: "nucleus overload", label: "Nucleus Overload (método no probado)" },
    { value: "otro", label: "Otro (especificar)" },
]

const muscleFocusOptions = [
    { value: "pecho", label: "Pecho" },
    { value: "espalda", label: "Espalda" },
    { value: "pierna", label: "Pierna (Cuádriceps/Femoral/Pantorrilla)" },
    { value: "gluteos y esquiotibiales", label: "Glúteos e Isquiotibiales" },
    { value: "hombros", label: "Hombros" },
    { value: "brazos", label: "Brazos (Bíceps/Tríceps/Antebrazos)" },
    { value: "abdomen", label: "Abdomen" },
]

const steps = [
    { id: "step-1", title: "Tus Metas", fields: ["goals", "goalTerm"], icon: Trophy },
    { id: "step-2", title: "Tu Estilo", fields: ["currentFitnessLevel", "trainingDays", "preferredWorkoutStyle", "otherWorkoutStyle", "muscleFocus"], icon: Dumbbell },
    { id: "step-3", title: "Tus Datos", fields: ["age", "weight", "height"], icon: User },
    { id: "step-4", title: "Salud", fields: ["injuriesOrConditions"], icon: HeartPulse }
];

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  useEffect(() => {
    const email = sessionStorage.getItem("onboardingUserEmail");
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se encontró usuario para el onboarding. Por favor, regístrate primero.",
      });
      router.push("/register");
    }
  }, [router, toast]);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: [],
      currentFitnessLevel: "principiante",
      trainingDays: [],
      preferredWorkoutStyle: "fuerza",
      muscleFocus: [],
      otherWorkoutStyle: "",
      age: 18,
      weight: 70,
      height: 175,
      goalTerm: "mediano",
      injuriesOrConditions: "",
    },
  });

  const watchedWorkoutStyle = form.watch("preferredWorkoutStyle");

  const processStep = async (values: OnboardingFormValues) => {
    const fieldsToValidate = steps[currentStep].fields as (keyof OnboardingFormValues)[];
    const isValid = await form.trigger(fieldsToValidate, { shouldFocus: true });
    
    if (!isValid) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await onSubmit(values);
    }
  }

  const prevStep = () => {
    if(currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function onSubmit(values: OnboardingFormValues) {
    setIsLoading(true);
    const email = sessionStorage.getItem("onboardingUserEmail");
    if (!email) {
      toast({ variant: "destructive", title: "Error fatal", description: "Se perdió la sesión de usuario." });
      setIsLoading(false);
      return;
    }

    try {
      const finalWorkoutStyle = values.preferredWorkoutStyle === 'otro' 
        ? values.otherWorkoutStyle
        : values.preferredWorkoutStyle;

      const dataToSave = {
        ...values,
        preferredWorkoutStyle: finalWorkoutStyle,
      };
      delete (dataToSave as any).otherWorkoutStyle;

      localStorage.setItem(`onboardingData_${email}`, JSON.stringify(dataToSave));
      toast({
        title: "¡Información Guardada!",
        description: "Tus datos han sido enviados al administrador para su revisión.",
      });
      setIsSuccess(true);
      sessionStorage.removeItem("onboardingUserEmail");
      setTimeout(() => router.push("/login"), 3000); 
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron guardar tus datos." });
      setIsLoading(false);
    }
  }
  

  if (isSuccess) {
    return (
      <AuthCard title="¡Todo Listo!" description="Gracias por completar tu información." footer={<></>}>
        <div className="text-center space-y-4 py-8">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <p className="text-muted-foreground">Tu cuenta está ahora pendiente de aprobación. Serás redirigido a la página de inicio de sesión en unos segundos.</p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Casi Hemos Terminado..."
      description="Cuéntanos sobre ti para que podamos crear el plan perfecto."
      footer={<p className="text-xs text-muted-foreground">Esta información será revisada por tu entrenador.</p>}
    >
       <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(processStep)} className="space-y-6">
            <StepsIndicator steps={steps} currentStep={currentStep} />
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                 <div className="min-h-[360px] flex flex-col">
                  {currentStep === 0 && (
                     <Step title={steps[0].title} icon={steps[0].icon}>
                         <FormField control={form.control} name="goals" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Metas Principales</FormLabel>
                                <MultiSelect options={fitnessGoalsOptions} selected={field.value} onChange={field.onChange} placeholder="Selecciona una o más metas..." />
                                <FormMessage />
                            </FormItem>
                        )} />
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
                  {currentStep === 1 && (
                    <Step title={steps[1].title} icon={steps[1].icon}>
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
                          <MultiSelect options={trainingDaysOptions} selected={field.value} onChange={field.onChange} placeholder="Selecciona los días..." />
                          <FormMessage />
                        </FormItem>
                      )} />
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
                                <MultiSelect options={muscleFocusOptions} selected={field.value || []} onChange={field.onChange} placeholder="Selecciona grupos musculares..." />
                                <FormMessage />
                            </FormItem>
                        )} />
                    </Step>
                  )}
                  {currentStep === 2 && (
                    <Step title={steps[2].title} icon={steps[2].icon}>
                         <FormField control={form.control} name="age" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Edad</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="weight" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Peso (kg)</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="height" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estatura (cm)</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </Step>
                  )}
                   {currentStep === 3 && (
                    <Step title={steps[3].title} icon={steps[3].icon}>
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
            <FormNavigation 
                currentStep={currentStep}
                totalSteps={steps.length}
                isLoading={isLoading}
                onBack={prevStep}
            />
        </form>
       </FormProvider>
    </AuthCard>
  )
}
