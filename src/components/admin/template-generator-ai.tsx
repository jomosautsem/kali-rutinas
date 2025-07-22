
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { generateTrainingTemplate } from "@/ai/flows/generate-training-template"
import { GenerateTrainingTemplateInputSchema } from "@/lib/types"
import type { z } from "zod"
import type { UserPlan } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, Lightbulb, ClipboardCopy, Save } from "lucide-react"

type FormData = z.infer<typeof GenerateTrainingTemplateInputSchema>;

type TemplateGeneratorAIProps = {
  onSaveTemplate: (plan: UserPlan, description: string) => void;
};


export function TemplateGeneratorAI({ onSaveTemplate }: TemplateGeneratorAIProps) {
  const [generatedPlan, setGeneratedPlan] = useState<UserPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(GenerateTrainingTemplateInputSchema),
    defaultValues: {
      description: "Un plan de 4 días enfocado en hipertrofia, dividiendo los grupos musculares en empuje, tirón, pierna y cuerpo completo.",
    },
  });

  const descriptionValue = form.watch("description");

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setGeneratedPlan(null);
    try {
      const result = await generateTrainingTemplate(values);
      setGeneratedPlan(result);
      toast({
        title: "¡Plantilla Generada!",
        description: "Revisa la nueva plantilla y guárdala si te gusta.",
      });
    } catch (error) {
      console.error("Error generating template:", error);
      toast({
        variant: "destructive",
        title: "Error en la Generación",
        description: "No se pudo generar la plantilla. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopyToClipboard = () => {
    if (!generatedPlan) return;
    navigator.clipboard.writeText(JSON.stringify(generatedPlan, null, 2));
    toast({
        title: "Copiado al Portapapeles",
        description: "El JSON de la plantilla ha sido copiado.",
    })
  }

  const handleSave = () => {
    if (generatedPlan) {
      onSaveTemplate(generatedPlan, descriptionValue);
      setGeneratedPlan(null); // Clear the generated plan after saving
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div>
        <CardHeader className="px-0 pt-0">
          <CardTitle className="font-headline">Generar con IA</CardTitle>
          <CardDescription>Describe el tipo de plantilla que necesitas y la IA creará un plan de entrenamiento completo.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de la Plantilla</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ej: Plan de calistenia para principiantes de 3 días..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? "Generando..." : "Generar Plantilla"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Resultado Generado</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ) : generatedPlan ? (
            <div className="space-y-4">
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={handleCopyToClipboard}>
                        <ClipboardCopy className="mr-2"/>
                        Copiar JSON
                    </Button>
                </div>
              {generatedPlan.warmup && (
                <div className="p-3 rounded-md bg-secondary/50 border">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Sparkles className="text-primary"/>
                        Calentamiento
                    </h4>
                    <p className="text-sm text-muted-foreground">{generatedPlan.warmup}</p>
                </div>
              )}
              {generatedPlan.recommendations && (
                <div className="p-3 rounded-md bg-secondary/50 border">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Lightbulb className="text-primary"/>
                    Recomendaciones
                  </h4>
                  <p className="text-sm text-muted-foreground">{generatedPlan.recommendations}</p>
                </div>
              )}
              <div className="space-y-3">
                {generatedPlan.weeklyPlan.map((day, index) => (
                    <div key={index} className="p-3 rounded-md border">
                        <p className="font-semibold">{day.day}: <span className="font-normal text-muted-foreground">{day.focus}</span></p>
                    </div>
                ))}
              </div>
              <Button className="w-full" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Plantilla
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              El resultado de la plantilla generada aparecerá aquí.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
