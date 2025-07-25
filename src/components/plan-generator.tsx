
"use client"

import { useState } from "react"
import type { UserPlan, GeneratePersonalizedTrainingPlanInput } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { generatePersonalizedTrainingPlan } from "@/ai/flows/generate-personalized-training-plan"

import { Button } from "@/components/ui/button"
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Sparkles, AlertTriangle, Loader2 } from "lucide-react"

type PlanGeneratorProps = {
  onPlanGenerated: (newPlan: UserPlan) => void;
};

export function PlanGenerator({ onPlanGenerated }: PlanGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();
    
    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
             // Since onboarding is removed, we use a default/demo profile for generation
            const demoInput: GeneratePersonalizedTrainingPlanInput = {
                goals: ["ganar masa muscular", "mejorar salud general"],
                currentFitnessLevel: "principiante",
                trainingDays: ["lunes", "martes", "jueves", "viernes"],
                trainingTimePerDay: "60 minutos",
                preferredWorkoutStyle: "hipertrofia",
                age: 28,
                weight: 70,
                height: 175,
                goalTerm: "mediano",
                planDuration: 4,
                exercisesPerDay: 8,
                injuriesOrConditions: "",
                history: [],
            };
            const newPlan = await generatePersonalizedTrainingPlan(demoInput);
            onPlanGenerated(newPlan);
            toast({
                title: "¡Plan de IA Generado!",
                description: "Tu nuevo plan está listo y ha sido aprobado automáticamente."
            });
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Error al generar el plan",
                description: "No se pudo crear el plan con IA. Por favor, inténtalo de nuevo.",
            });
        } finally {
            setIsGenerating(false);
            setIsOpen(false);
        }
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar Plan con IA
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline flex items-center gap-2">
                        <AlertTriangle className="text-yellow-400" />
                        Advertencia Importante
                    </DialogTitle>
                    <DialogDescription>
                        Estás a punto de generar un plan de entrenamiento usando inteligencia artificial.
                    </DialogDescription>
                </DialogHeader>
                <Alert variant="destructive" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-200">
                    <AlertTriangle className="h-4 w-4 !text-yellow-400" />
                    <AlertTitle>Sin Supervisión Profesional</AlertTitle>
                    <AlertDescription>
                        Este plan será creado automáticamente y <strong>no será revisado, modificado ni aprobado por un coach de Kali Gym.</strong> Serás completamente responsable de tu entrenamiento.
                    </AlertDescription>
                </Alert>
                <p className="text-sm text-muted-foreground">
                    Si prefieres un plan revisado y aprobado por un experto, por favor, solicita una "Rutina Personalizada" desde tu panel.
                </p>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isGenerating}>Cancelar</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isGenerating ? "Generando..." : "Entendido, continuar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
