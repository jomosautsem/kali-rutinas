"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { generatePersonalizedTrainingPlan } from "@/ai/flows/generate-personalized-training-plan"

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
import { Textarea } from "@/components/ui/textarea"
import { Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "./ui/skeleton"

const formSchema = z.object({
  goals: z.string().min(10, "Por favor, describe tus objetivos con más detalle."),
  currentFitnessLevel: z.enum(["principiante", "intermedio", "avanzado"]),
  daysPerWeek: z.coerce.number().min(1).max(7),
  preferredWorkoutStyle: z.string().min(3, "Por favor, especifica un estilo de entrenamiento."),
  age: z.coerce.number().min(12, "La edad debe ser al menos 12.").max(100, "La edad no puede ser mayor a 100."),
  weight: z.coerce.number().min(30, "Ingresa un peso válido en kg.").max(300),
  height: z.coerce.number().min(100, "Ingresa una estatura válida en cm.").max(250),
  goalTerm: z.enum(["corto", "mediano", "largo"]),
})

export function PlanGenerator() {
  const [isOpen, setIsOpen] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: "",
      currentFitnessLevel: "principiante",
      daysPerWeek: 3,
      preferredWorkoutStyle: "",
      age: 18,
      weight: 70,
      height: 175,
      goalTerm: "mediano",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setGeneratedPlan("")
    try {
      const result = await generatePersonalizedTrainingPlan(values)
      setGeneratedPlan(result)
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
      form.reset()
      setGeneratedPlan("")
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Sparkles className="mr-2 h-4 w-4" />
          Generar Nuevo Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Crea Tu Plan Personalizado</DialogTitle>
          <DialogDescription>
            Proporciona tus detalles y deja que nuestra IA cree el plan de entrenamiento perfecto para ti.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metas de Fitness</FormLabel>
                    <FormControl>
                      <Textarea placeholder="ej., perder 5 kilos, ganar músculo" {...field} />
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
                  name="daysPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Días por semana</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="7" {...field} />
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
                        <Input type="number" {...field} />
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
                        <Input type="number" {...field} />
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
                        <Input type="number" {...field} />
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
                  {isLoading ? "Generando..." : "Generar Plan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
          <div className="rounded-lg border bg-secondary p-4 space-y-2 overflow-auto max-h-[500px] md:max-h-[600px]">
            <h3 className="font-semibold font-headline">Tu Plan Generado por IA</h3>
            {isLoading ? (
               <div className="space-y-3">
                 <Skeleton className="h-4 w-3/4" />
                 <Skeleton className="h-4 w-1/2" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-5/6" />
                 <Skeleton className="h-4 w-3/4" />
                 <Skeleton className="h-4 w-full" />
               </div>
            ) : generatedPlan ? (
              <div className="text-sm whitespace-pre-wrap">{generatedPlan}</div>
            ) : (
              <div className="text-sm text-muted-foreground flex items-center justify-center h-full">
                Tu plan aparecerá aquí...
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
