
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AuthCard } from "@/components/auth-card"
import { MultiSelect } from "@/components/ui/multi-select"

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


export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
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


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: [],
      currentFitnessLevel: "principiante",
      trainingDays: [],
      preferredWorkoutStyle: "fuerza",
      otherWorkoutStyle: "",
      age: 18,
      weight: 70,
      height: 175,
      goalTerm: "mediano",
    },
  })

  const watchedWorkoutStyle = form.watch("preferredWorkoutStyle");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const email = sessionStorage.getItem("onboardingUserEmail");
    if (!email) {
      toast({ variant: "destructive", title: "Error fatal", description: "Se perdió la sesión de usuario." });
      setIsLoading(false);
      return;
    }

    try {
      // Prepare data for saving. If 'otro' is selected, use the custom value.
      const finalWorkoutStyle = values.preferredWorkoutStyle === 'otro' 
        ? values.otherWorkoutStyle
        : values.preferredWorkoutStyle;

      const dataToSave = {
        ...values,
        preferredWorkoutStyle: finalWorkoutStyle,
      };
      // remove otherWorkoutStyle from the object to save
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
       <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metas de Fitness</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={fitnessGoalsOptions}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Selecciona una o más metas..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="currentFitnessLevel"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nivel de Condición Física</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu nivel de condición física" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="principiante">Principiante</SelectItem>
                        <SelectItem value="intermedio">Intermedio</SelectItem>
                        <SelectItem value="avanzado">Avanzado</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                  control={form.control}
                  name="trainingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Días de Entrenamiento</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={trainingDaysOptions}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Selecciona los días..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <FormField
              control={form.control}
              name="preferredWorkoutStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estilo de Entrenamiento Preferido</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estilo de entrenamiento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workoutStyleOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedWorkoutStyle === 'otro' && (
              <FormField
                control={form.control}
                name="otherWorkoutStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especifica tu estilo de entrenamiento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. CrossFit, Powerlifting, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Edad</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Estatura (cm)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
                control={form.control}
                name="goalTerm"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Plazo de la Meta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecciona un plazo" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="corto">Corto Plazo</SelectItem>
                        <SelectItem value="mediano">Mediano Plazo</SelectItem>
                        <SelectItem value="largo">Largo Plazo</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar Información y Finalizar"}
            </Button>
            </form>
        </Form>
    </AuthCard>
  )
}

    