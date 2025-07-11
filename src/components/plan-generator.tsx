
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { generatePersonalizedTrainingPlan, type GeneratePersonalizedTrainingPlanOutput } from "@/ai/flows/generate-personalized-training-plan"

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
import { Sparkles, Trash2, GripVertical, ImagePlus, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "./ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

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

type PlanGeneratorProps = {
  onPlanGenerated: () => void;
};

export function PlanGenerator({ onPlanGenerated }: PlanGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<GeneratePersonalizedTrainingPlanOutput | null>(null)
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
    setGeneratedPlan(null)
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
      setGeneratedPlan(null)
      setIsLoading(false)
    }
  }
  
  const handleExerciseChange = (dayIndex: number, exerciseIndex: number, field: string, value: string) => {
    if (!generatedPlan) return
    const newPlan = { ...generatedPlan }
    // @ts-ignore
    newPlan.weeklyPlan[dayIndex].exercises[exerciseIndex][field] = value
    setGeneratedPlan(newPlan)
  }

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    if (!generatedPlan) return;
    const newPlan = { ...generatedPlan };
    newPlan.weeklyPlan[dayIndex].exercises.splice(exerciseIndex, 1);
    setGeneratedPlan(newPlan);
  };
  
  const handleSaveChanges = () => {
    // In a real app, you would send the `generatedPlan` object to your backend to save it.
    console.log("Saving changes:", generatedPlan);
    toast({
      title: "Plan Enviado para Aprobación",
      description: "Tu plan se ha guardado y ahora está pendiente de revisión por un administrador.",
    });
    onPlanGenerated();
    handleOpenChange(false); // Close the dialog
  };


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
          <div className="rounded-lg border bg-secondary/50 space-y-2 overflow-hidden max-h-[500px] md:max-h-[600px] flex flex-col">
             <div className="flex justify-between items-center p-4 pb-0">
                <h3 className="font-semibold font-headline">Tu Plan Generado por IA</h3>
                {generatedPlan && (
                    <Button variant="outline" size="sm" onClick={handleSaveChanges}>
                        <Save className="mr-2 h-4 w-4"/>
                        Guardar y Enviar a Revisión
                    </Button>
                )}
             </div>

            {isLoading ? (
               <div className="p-4 space-y-4">
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-24 w-full" />
                 <Skeleton className="h-24 w-full" />
                 <Skeleton className="h-24 w-full" />
               </div>
            ) : generatedPlan && generatedPlan.weeklyPlan ? (
              <Tabs defaultValue={generatedPlan.weeklyPlan[0]?.day} className="w-full flex-1 flex flex-col overflow-auto">
                <div className="px-4">
                  <TabsList className="grid w-full grid-cols-5">
                    {generatedPlan.weeklyPlan.map(dayPlan => (
                      <TabsTrigger key={dayPlan.day} value={dayPlan.day}>{dayPlan.day.substring(0,3)}</TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                {generatedPlan.weeklyPlan.map((dayPlan, dayIndex) => (
                  <TabsContent key={dayPlan.day} value={dayPlan.day} className="flex-1 overflow-auto p-4 space-y-4">
                    <h4 className="font-semibold">{dayPlan.day} - {dayPlan.focus}</h4>
                    {dayPlan.exercises.map((exercise, exerciseIndex) => (
                      <Card key={exerciseIndex} className="bg-background/80">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <Input 
                                    className="text-base font-semibold border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                                    value={exercise.name}
                                    onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'name', e.target.value)}
                                />
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeExercise(dayIndex, exerciseIndex)}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab"/>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div>
                                    <span className="text-foreground font-medium">Series:</span>
                                    <Input className="inline-block w-12 ml-2 h-7" value={exercise.series} onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'series', e.target.value)} />
                                </div>
                                <div>
                                    <span className="text-foreground font-medium">Reps:</span>
                                    <Input className="inline-block w-16 ml-2 h-7" value={exercise.reps} onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'reps', e.target.value)} />
                                </div>
                                <div>
                                    <span className="text-foreground font-medium">Descanso:</span>
                                    <Input className="inline-block w-16 ml-2 h-7" value={exercise.rest} onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'rest', e.target.value)} />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <ImagePlus className="h-4 w-4 text-muted-foreground"/>
                                    <Input 
                                        placeholder="Añadir URL de video/imagen..."
                                        className="h-8 text-sm"
                                        value={exercise.mediaUrl}
                                        onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'mediaUrl', e.target.value)}
                                    />
                                </div>
                                {exercise.mediaUrl && (
                                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                        <Image 
                                            src={exercise.mediaUrl} 
                                            alt={`Vista previa de ${exercise.name}`} 
                                            layout="fill"
                                            objectFit="cover"
                                            className="bg-muted"
                                            unoptimized // Use this if you are using external image URLs not configured in next.config.js
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-sm text-muted-foreground flex items-center justify-center h-full p-4">
                Tu plan aparecerá aquí...
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

    