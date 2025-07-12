
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateMotivation } from "@/ai/flows/generate-motivation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LifeBuoy, Sparkles, Loader2, Quote, Lightbulb } from "lucide-react";
import type { GenerateMotivationOutput } from "@/lib/types";


const formSchema = z.object({
  reason: z.string().min(1, "Por favor, selecciona un motivo."),
});

const reasons = {
  no_time: "No tuve tiempo",
  too_tired: "Estaba demasiado cansado/a",
  not_motivated: "No tenía motivación",
  injury_concern: "Molestias o preocupación por lesión",
  other: "Otro motivo",
};

type MotivationResponse = GenerateMotivationOutput;

export function SetbackReporter() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<MotivationResponse | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { reason: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResponse(null);
    try {
      const result = await generateMotivation({ reason: values.reason });
      setResponse(result);
    } catch (error) {
      console.error("Error generating motivation:", error);
      setResponse({
        recommendation: "A veces las cosas no salen como se planean. Lo importante es no rendirse. Inténtalo de nuevo mañana.",
        motivation: "“El éxito es la suma de pequeños esfuerzos repetidos día tras día.” – Robert Collier",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => {
        form.reset();
        setResponse(null);
        setIsLoading(false);
      }, 300);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LifeBuoy className="mr-2 h-4 w-4" />
          ¿Necesitas ayuda?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">A veces pasa, ¡no te preocupes!</DialogTitle>
          <DialogDescription>
            Cuéntanos qué pasó para darte un consejo y una dosis de motivación.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-muted-foreground animate-pulse">Buscando el mejor consejo para ti...</p>
          </div>
        ) : response ? (
           <div className="space-y-6 py-4">
             <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <h4 className="font-semibold flex items-center gap-2 text-primary">
                    <Lightbulb className="h-5 w-5" />
                    Recomendación
                </h4>
                <p className="text-sm text-foreground/80">{response.recommendation}</p>
             </div>
              <div className="space-y-2 rounded-lg border p-4">
                 <h4 className="font-semibold flex items-center gap-2">
                    <Quote className="h-5 w-5" />
                    Frase para ti
                </h4>
                <blockquote className="text-sm italic text-muted-foreground">"{response.motivation}"</blockquote>
             </div>
             <Button onClick={() => handleOpenChange(false)} className="w-full">Entendido, ¡gracias!</Button>
           </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Cuál fue el motivo principal?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una opción..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(reasons).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Obtener Consejo
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
