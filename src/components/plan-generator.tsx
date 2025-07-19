
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { generatePersonalizedTrainingPlan } from "@/ai/flows/generate-personalized-training-plan"
import { GeneratePersonalizedTrainingPlanInputSchema } from "@/lib/types"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Sparkles, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MultiSelect } from "./ui/multi-select"


const formSchema = GeneratePersonalizedTrainingPlanInputSchema.omit({
    goals: true,
    trainingDays: true,
}).extend({
    goals: z.string().min(1, "Debes describir al menos una meta."),
    trainingDays: z.string().min(1, "Debes especificar los días de entrenamiento.")
});

type PlanGeneratorProps = {
  onPlanGenerated: () => void;
};

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

export function PlanGenerator({ onPlanGenerated }: PlanGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlanSuccessfullyGenerated, setIsPlanSuccessfullyGenerated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: "",
      currentFitnessLevel: "principiante",
      trainingDays: "",
      preferredWorkoutStyle: "",
      age: 18,
      weight: 70,
      height: 175,
      goalTerm: "mediano",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setIsPlanSuccessfullyGenerated(false)
    try {
      // Adapt the form data to match the AI flow input schema
      const adaptedValues = {
        ...values,
        goals: values.goals.split(',').map(s => s.trim()),
        trainingDays: values.trainingDays.split(',').map(s => s.trim()),
      };

      const plan = await generatePersonalizedTrainingPlan(adaptedValues)
      
      // Save the generated plan to localStorage
      const loggedInUserEmail = sessionStorage.getItem("loggedInUser");
      if (loggedInUserEmail) {
        localStorage.setItem(`userPlan_${loggedInUserEmail}`, JSON.stringify(plan));
        localStorage.setItem(`onboardingData_${loggedInUserEmail}`, JSON.stringify(adaptedValues));
      }

      toast({
        title: "Plan Enviado para Aprobación",
        description: "Tu plan se ha guardado y ahora está pendiente de revisión.",
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
    setIsOpen(open)
    if (!open) {
      // Delay reset to allow fade-out animation to complete
      setTimeout(() => {
        form.reset();
        setIsPlanSuccessfullyGenerated(false);
        setIsLoading(false);
      }, 300);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Sparkles className="mr-2 h-4 w-4" />
          Generar/Actualizar Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        {isPlanSuccessfullyGenerated ? (
            <PlanGeneratedConfirmation onClose={() => handleOpenChange(false)} />
        ) : (
            <>
            <DialogHeader>
              <DialogTitle className="font-headline">Crea Tu Plan Personalizado</DialogTitle>
              <DialogDescription>
                Proporciona tus detalles y deja que nuestra IA cree el plan de entrenamiento perfecto para ti.
              </DialogDescription>
            </DialogHeader>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-center text-muted-foreground animate-pulse">Generando tu plan, por favor espera...</p>
                </div>
            ) : (
                <div className="py-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="goals"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Metas de Fitness</FormLabel>
                            <FormControl>
                            <Input placeholder="ej., perder 5 kilos, ganar músculo" {...field} />
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
                            <FormLabel>Días de entrenamiento</FormLabel>
                            <FormControl>
                                <Input placeholder="ej. Lunes, Miércoles, Viernes" {...field} />
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
                            <FormControl>
                            <Input placeholder="ej., Levantamiento de pesas, Cardio, HIIT" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

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

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? "Generando..." : "Generar Plan y Enviar a Revisión"}
                        </Button>
                    </DialogFooter>
                    </form>
                </Form>
                </div>
            )}
            </>
        )}
      </DialogContent>
    </Dialog>
  )
}
