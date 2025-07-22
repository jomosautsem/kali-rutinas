
"use client"

import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { generatePersonalizedTrainingPlan } from "@/ai/flows/generate-personalized-training-plan"
import { GeneratePersonalizedTrainingPlanInputSchema, type GeneratePersonalizedTrainingPlanInput } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { Sparkles, CheckCircle, Loader2, AlertTriangle, Send } from "lucide-react"

type PlanGeneratorProps = {
  onPlanGenerated: () => void;
};

const formSchema = z.object({
  exercisesPerDay: z
    .number({ required_error: "El número de ejercicios es requerido." })
    .int("Debe ser un número entero.")
    .min(3, "Como mínimo 3 ejercicios por día.")
    .max(10, "Como máximo 10 ejercicios por día."),
});

type FormData = z.infer<typeof formSchema>;


// --- Sub-components for the multi-step form ---
const WarningView = ({ onAccept, onCancel }: { onAccept: () => void; onCancel: () => void; }) => (
    <div className="flex flex-col items-center justify-center text-center p-4 space-y-6 h-full">
        <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Antes de Continuar</DialogTitle>
        </DialogHeader>
        <Alert variant="destructive" className="text-left">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-bold">Advertencia Importante</AlertTitle>
            <AlertDescription>
                Este generador creará un plan de entrenamiento basado únicamente en la información que proporcionaste al registrate. El plan generado por la IA (Inteligencia Artificial) no será revisado por un coach o administrador de Kali Gym. Eres responsable de entrenar de forma segura.
            </AlertDescription>
        </Alert>
        <div className="flex w-full gap-4">
            <Button onClick={onCancel} variant="outline" className="w-full">Cancelar</Button>
            <Button onClick={onAccept} className="w-full">
                Entiendo y acepto, deseo continuar
            </Button>
        </div>
    </div>
);


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


// --- Main Component ---

export function PlanGenerator({ onPlanGenerated }: PlanGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [view, setView] = useState<'warning' | 'form' | 'success'>('warning');
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast();
    const [onboardingData, setOnboardingData] = useState<Omit<GeneratePersonalizedTrainingPlanInput, 'exercisesPerDay'> | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            exercisesPerDay: 5,
        },
        mode: "onChange",
    });
    
    // Load user data from localStorage when the dialog opens
    useEffect(() => {
        if (isOpen && typeof window !== 'undefined') {
            const loggedInUserEmail = sessionStorage.getItem("loggedInUser");
            if (loggedInUserEmail) {
                const data = localStorage.getItem(`onboardingData_${loggedInUserEmail}`);
                if (data) {
                    try {
                        const parsedData = JSON.parse(data);
                        setOnboardingData(parsedData);
                    } catch (e) {
                        console.error("Failed to parse onboarding data:", e);
                        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar tus datos. Por favor, completa tu perfil de nuevo."});
                        setIsOpen(false);
                    }
                } else {
                    toast({ variant: "destructive", title: "Datos no encontrados", description: "Completa tu perfil en la sección de registro antes de generar un plan."});
                    setIsOpen(false);
                }
            }
        }
    }, [isOpen, toast]);

    async function onSubmit(values: FormData) {
        setIsLoading(true);
        const email = sessionStorage.getItem("loggedInUser");
        if (!email || !onboardingData) {
            toast({ variant: "destructive", title: "Error", description: "No se encontró sesión de usuario o datos de perfil." });
            setIsLoading(false);
            return;
        }

        try {
            const finalInput: GeneratePersonalizedTrainingPlanInput = {
                ...onboardingData,
                ...values,
            };

            const plan = await generatePersonalizedTrainingPlan(finalInput);
            localStorage.setItem(`userPlan_${email}`, JSON.stringify(plan));
            
            toast({
                title: "Plan Enviado para Aprobación",
                description: "Tu plan actualizado se ha guardado y está pendiente de revisión.",
            });

            onPlanGenerated();
            setView('success');

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
        setIsOpen(open);
        if (!open) {
            setTimeout(() => {
                setView('warning');
                setIsLoading(false);
                form.reset();
            }, 300);
        }
    }

    const renderContent = () => {
        switch(view) {
            case 'warning':
                return <WarningView onAccept={() => setView('form')} onCancel={() => handleOpenChange(false)} />;
            case 'success':
                return <PlanGeneratedConfirmation onClose={() => handleOpenChange(false)} />;
            case 'form':
                return (
                     <>
                        <DialogHeader>
                            <DialogTitle className="font-headline">Ajusta tu Plan</DialogTitle>
                            <DialogDescription>
                                Tus preferencias están guardadas. Solo dinos cuántos ejercicios quieres por día y generaremos tu nuevo plan.
                            </DialogDescription>
                        </DialogHeader>
                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden space-y-6 pt-4">
                                <FormField
                                  control={form.control}
                                  name="exercisesPerDay"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Ejercicios por Día de Entrenamiento</FormLabel>
                                      <FormControl>
                                        <Input 
                                            type="number"
                                            placeholder="Ej. 5"
                                            {...field}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex justify-end gap-2 mt-auto pt-4 border-t">
                                     <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                        {isLoading ? "Generando..." : "Generar Plan"}
                                    </Button>
                                </div>
                            </form>
                        </FormProvider>
                    </>
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar/Actualizar Plan
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                {renderContent()}
            </DialogContent>
        </Dialog>
    )
}
