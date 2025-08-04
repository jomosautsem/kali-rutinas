
"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { GeneratePersonalizedTrainingPlanInputSchema, type User, type GeneratePersonalizedTrainingPlanInput } from "@/lib/types"

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
import { Loader2, UserCheck, Dumbbell, HeartPulse, Shield, User as UserIcon, Trophy, Scale, Ruler, Clock, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { MultiToggleButtonGroup } from "@/components/ui/multi-toggle"
import { saveOnboardingData } from "@/services/user.service"

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
    { value: "lunes", label: "L" },
    { value: "martes", label: "M" },
    { value: "miercoles", label: "X" },
    { value: "jueves", label: "J" },
    { value: "viernes", label: "V" },
    { value: "sabado", label: "S" },
    { value: "domingo", label: "D" },
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
    { value: "pierna", label: "Pierna" },
    { value: "gluteos y esquiotibiales", label: "Glúteos/Isquios" },
    { value: "hombros", label: "Hombros" },
    { value: "brazos", label: "Brazos" },
    { value: "abdomen", label: "Abdomen" },
]

type CustomPlanRequestFormProps = {
  onDataSubmitted: () => void;
  user: User | null;
};

export function CustomPlanRequestForm({ onDataSubmitted, user }: CustomPlanRequestFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    async function onSubmit(values: OnboardingFormValues) {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const { otherWorkoutStyle, ...dataToSave } = values;
            const finalWorkoutStyle = dataToSave.preferredWorkoutStyle === 'otro' 
                ? otherWorkoutStyle
                : dataToSave.preferredWorkoutStyle;
            
            const finalData = {
                ...dataToSave,
                preferredWorkoutStyle: finalWorkoutStyle!,
            };

            await saveOnboardingData(user.id, finalData);
            onDataSubmitted(); // This will update the user state in dashboard page
            
            toast({
                title: "¡Solicitud Enviada!",
                description: "Tus datos han sido enviados a un entrenador. Nos pondremos en contacto pronto."
            });

            handleClose();
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Error al enviar la solicitud",
                description: "No se pudieron guardar tus datos. Por favor, inténtalo de nuevo.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => {
            form.reset();
        }, 300);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) handleClose();
            else setIsOpen(true);
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" disabled={user?.customPlanRequest === 'requested'}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    {user?.customPlanRequest === 'requested' ? "Solicitud Enviada" : "Solicitar Plan Personalizado"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Solicitud de Plan Personalizado</DialogTitle>
                    <DialogDescription>
                        Completa tus datos para que un entrenador cree el plan perfecto para ti.
                    </DialogDescription>
                </DialogHeader>

                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 overflow-y-auto pr-6 -mr-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Goals */}
                            <div className="md:col-span-2">
                                <FormField control={form.control} name="goals" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-base">Tus Metas</FormLabel>
                                        <FormControl><MultiToggleButtonGroup options={fitnessGoalsOptions} selected={field.value} onChange={field.onChange} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            {/* Biometrics */}
                             <FormField control={form.control} name="age" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Edad</FormLabel>
                                    <FormControl><Input type="number" placeholder="Tu edad" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="weight" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Peso (kg)</FormLabel>
                                    <FormControl><Input type="number" placeholder="Tu peso en kg" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="height" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estatura (cm)</FormLabel>
                                    <FormControl><Input type="number" placeholder="Tu altura en cm" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Training Schedule */}
                             <FormField control={form.control} name="currentFitnessLevel" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nivel Físico</FormLabel>
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
                            <div className="md:col-span-2">
                                <FormField control={form.control} name="trainingDays" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Días de Entrenamiento</FormLabel>
                                    <FormControl><MultiToggleButtonGroup options={trainingDaysOptions} selected={field.value} onChange={field.onChange} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                             <FormField control={form.control} name="trainingTimePerDay" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Tiempo por Sesión</FormLabel>
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
                            
                             {/* Style */}
                             <FormField control={form.control} name="preferredWorkoutStyle" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Estilo de Entrenamiento</FormLabel>
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
                             <div className="md:col-span-2">
                                <FormField control={form.control} name="muscleFocus" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Enfoque Muscular (Opcional)</FormLabel>
                                        <FormControl><MultiToggleButtonGroup options={muscleFocusOptions} selected={field.value} onChange={field.onChange} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                             </div>

                             {/* Health */}
                             <div className="md:col-span-2">
                                 <FormField control={form.control} name="injuriesOrConditions" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lesiones o Condiciones Médicas (Opcional)</FormLabel>
                                        <FormControl><Textarea placeholder="Ej. Dolor lumbar crónico, tendinitis en el hombro derecho..." {...field} rows={4} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                             <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                             <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    )
}
