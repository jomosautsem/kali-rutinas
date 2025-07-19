"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { generateTemplateSuggestions } from "@/ai/flows/generate-template-suggestions"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Skeleton } from "./ui/skeleton"

const formSchema = z.object({
  userFeedback: z.string().min(10, "Por favor, proporciona comentarios más detallados."),
  commonRequests: z.string().min(10, "Por favor, proporciona solicitudes más detalladas."),
})

export function TemplateSuggester() {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userFeedback: "Algunos usuarios encuentran los planes para principiantes demasiado fáciles después de unas pocas semanas.",
      commonRequests: "Se solicitan con frecuencia más plantillas de HIIT y solo de peso corporal.",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setSuggestions([])
    try {
      const result = await generateTemplateSuggestions(values)
      setSuggestions(result.templateSuggestions)
    } catch (error) {
      console.error("Error al generar sugerencias:", error)
      toast({
        variant: "destructive",
        title: "Falló la Generación",
        description: "No se pudieron generar sugerencias. Por favor, inténtalo de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
     <Card>
        <CardHeader>
            <CardTitle className="font-headline">Generador de Ideas de Plantillas</CardTitle>
            <CardDescription>Obtén sugerencias de nuevas plantillas basadas en los comentarios de los usuarios.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="userFeedback"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Comentarios de Usuarios</FormLabel>
                            <FormControl>
                            <Textarea placeholder="Ingresa comentarios de usuarios..." {...field} rows={4}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="commonRequests"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Solicitudes Comunes</FormLabel>
                            <FormControl>
                            <Textarea placeholder="Ingresa solicitudes comunes..." {...field} rows={4}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isLoading}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isLoading ? "Generando..." : "Sugerir Ideas"}
                    </Button>
                    </form>
                </Form>
                <div className="rounded-lg border bg-secondary/50 p-6 h-full">
                    <h3 className="font-semibold mb-4">Sugerencias por IA</h3>
                    {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-5/6" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                    ) : suggestions.length > 0 ? (
                    <ul className="space-y-3">
                        {suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <Sparkles className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                            <span>{s}</span>
                        </li>
                        ))}
                    </ul>
                    ) : (
                    <div className="text-sm text-muted-foreground flex items-center justify-center h-full">
                        Las sugerencias aparecerán aquí...
                    </div>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
  )
}
