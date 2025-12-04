
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { GeneratePersonalizedTrainingPlanInputSchema, type User } from "@/lib/types"

import { Button } from "@/components/ui/button"
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
import { Loader2, CheckCircle, Dumbbell, CalendarDays, Zap, HeartPulse, Shield, User as UserIcon, Trophy, Scale, Ruler, Clock, Calendar, Sparkles, ArrowLeft, ListChecks, KeyRound, Lock, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AuthCard } from "@/components/auth-card"
import { Textarea } from "@/components/ui/textarea"
import { StepsIndicator } from "@/components/onboarding/steps-indicator"
import { Step } from "@/components/onboarding/step"
import { MultiToggleButtonGroup } from "@/components/ui/multi-toggle"
import { FormNavigation } from "@/components/onboarding/form-navigation"
import { saveOnboardingData, createUser } from "@/services/user.service"
import Link from "next/link"

const registerSchema = z.object({
  firstName: z.string().min(2, "El nombre es requerido."),
  paternalLastName: z.string().min(2, "El apellido paterno es requerido."),
  maternalLastName: z.string().min(2, "El apellido materno es requerido."),
  email: z.string().email("Por favor, ingresa un correo electrónico válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string()
});

const onboardingSchema = GeneratePersonalizedTrainingPlanInputSchema.extend({
    otherWorkoutStyle: z.string().optional()
});

const combinedSchema = registerSchema.merge(onboardingSchema).superRefine((data, ctx) => {
    if (data.preferredWorkoutStyle === 'otro' && (!data.otherWorkoutStyle || data.otherWorkoutStyle.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['otherWorkoutStyle'],
            message: 'Por favor, especifica el estilo de entrenamiento.',
        });
    }
}).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});


type RegistrationFormValues = z.infer<typeof combinedSchema>;

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
    { id: "step-0", title: "Cuenta", fields: ["firstName", "paternalLastName", "maternalLastName", "email", "password", "confirmPassword"], icon: UserIcon },
    { id: "step-1", title: "Metas", fields: ["goals"], icon: Trophy },
    { id: "step-2", title: "Plazo", fields: ["goalTerm"], icon: Clock },
    { id: "step-3", title: "Duración", fields: ["planDuration"], icon: Calendar },
    { id: "step-4", title: "Tu Nivel", fields: ["currentFitnessLevel", "trainingDays", "trainingTimePerDay", "exercisesPerDay"], icon: HeartPulse },
    { id: "step-5", title: "Tu Estilo", fields: ["preferredWorkoutStyle", "otherWorkoutStyle", "muscleFocus"], icon: Dumbbell },
    { id: "step-6", title: "Tus Datos", fields: ["age", "weight", "height"], icon: UserIcon },
    { id: "step-7", title: "Salud", fields: ["injuriesOrConditions"], icon: Shield }
];

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      firstName: "",
      paternalLastName: "",
      maternalLastName: "",
      email: "",
      password: "",
      confirmPassword: "",
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
    
    const fieldsToValidate = steps[currentStep].fields as (keyof RegistrationFormValues)[];
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

  const handleCancel = () => {
      router.push('/login');
  }

  async function onSubmit(values: RegistrationFormValues) {
    setIsLoading(true);
    
    try {
        const { firstName, paternalLastName, maternalLastName, email, password, otherWorkoutStyle, ...onboardingValues} = values;

        // 1. Create User
        const newUser = await createUser({
            firstName,
            paternalLastName,
            maternalLastName,
            email,
            password: password!, // Password is required by schema
        });

        // 2. Save Onboarding Data (Temporarily disabled for debugging)
        // const finalWorkoutStyle = onboardingValues.preferredWorkoutStyle === 'otro' 
        //     ? otherWorkoutStyle
        //     : onboardingValues.preferredWorkoutStyle;

        // const onboardingDataToSave = {
        //     ...onboardingValues,
        //     preferredWorkoutStyle: finalWorkoutStyle!,
        // };
        
        // await saveOnboardingData(newUser.id, onboardingDataToSave);
        
        console.log("DEBUG: User created, skipping saveOnboardingData. User ID:", newUser.id);

        setIsSuccess(true);
        toast({ title: "¡Registro Completo! (Modo Depuración)", description: "Tu cuenta ha sido creada y está pendiente de aprobación." });
        setTimeout(() => router.push("/login"), 4000); 

    } catch (error: any) {
        console.error("Registration failed:", error);
        toast({ variant: "destructive", title: "Error en el Registro", description: error.message || "No se pudo crear la cuenta. Por favor, inténtalo de nuevo." });
        setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <AuthCard title="¡Registro Exitoso!" description="Gracias por completar tu información." footer={<></>}>
        <div className="text-center space-y-4 py-8">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <p className="text-muted-foreground">Tu cuenta ha sido creada y está pendiente de aprobación por un administrador. Serás redirigido a la página de inicio de sesión.</p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Crea tu Cuenta en Dojo Dynamics"
      description="Completa los siguientes pasos para registrarte y configurar tu perfil de entrenamiento."
      footer={
        <p className="text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline" prefetch={false}>
            Inicia Sesión
          </Link>
        </p>
      }
    >
       <FormProvider {...form}>
        <form onSubmit={(e) => { e.preventDefault(); processStep(); }} className="space-y-6 flex flex-col flex-grow">
            <StepsIndicator steps={steps} currentStep={currentStep} />
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
                      <Step title="Información de la Cuenta" icon={UserIcon}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <FormField control={form.control} name="firstName" render={({ field }) => (
                              <FormItem><FormLabel>Nombre(s)</FormLabel><FormControl><Input placeholder="Juan" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                           <FormField control={form.control} name="paternalLastName" render={({ field }) => (
                              <FormItem><FormLabel>Apellido Paterno</FormLabel><FormControl><Input placeholder="Pérez" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="maternalLastName" render={({ field }) => (
                            <FormItem><FormLabel>Apellido Materno</FormLabel><FormControl><Input placeholder="García" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input type="email" placeholder="m@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="password" render={({ field }) => (
                          <FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                          <FormItem><FormLabel>Confirmar Contraseña</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </Step>
                    )}
                    {currentStep === 1 && (
                     <Step title={steps[1].title} icon={steps[1].icon}>
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
                  {currentStep === 2 && (
                     <Step title={steps[2].title} icon={steps[2].icon}>
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
                  {currentStep === 3 && (
                    <Step title={steps[3].title} icon={steps[3].icon}>
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
                  {currentStep === 4 && (
                    <Step title={steps[4].title} icon={steps[4].icon}>
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
                      <FormField control={form.control} name="exercisesPerDay" render={({ field }) => (
                          <FormItem>
                          <FormLabel>Ejercicios por Día</FormLabel>
                          <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Selecciona cantidad" /></SelectTrigger></FormControl>
                              <SelectContent>
                                  <SelectItem value="4">Pocos (4)</SelectItem>
                                  <SelectItem value="6">Moderados (6)</SelectItem>
                                  <SelectItem value="8">Muchos (8)</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                          </FormItem>
                      )} />
                    </Step>
                  )}
                  {currentStep === 5 && (
                     <Step title={steps[5].title} icon={steps[5].icon}>
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
                  {currentStep === 6 && (
                    <Step title={steps[6].title} icon={steps[6].icon}>
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
                   {currentStep === 7 && (
                    <Step title={steps[7].title} icon={steps[7].icon}>
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
            <div className="mt-auto pt-4">
              <FormNavigation 
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  isLoading={isLoading}
                  onBack={prevStep}
                  onCancel={handleCancel}
              />
            </div>
        </form>
       </FormProvider>
    </AuthCard>
  )
}
