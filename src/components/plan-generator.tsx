
"use client"

import { useState, useEffect } from "react"
import { generatePersonalizedTrainingPlan } from "@/ai/flows/generate-personalized-training-plan"
import type { GeneratePersonalizedTrainingPlanInput } from "@/lib/types"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Sparkles, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"


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
  const [onboardingData, setOnboardingData] = useState<GeneratePersonalizedTrainingPlanInput | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
        const loggedInUserEmail = sessionStorage.getItem("loggedInUser");
        if (loggedInUserEmail) {
            const data = localStorage.getItem(`onboardingData_${loggedInUserEmail}`);
            if (data) {
                setOnboardingData(JSON.parse(data));
            } else {
                setOnboardingData(null);
            }
        }
    }
  }, [isOpen]);

  async function handleGenerate() {
    if (!onboardingData) {
        toast({
            variant: "destructive",
            title: "Faltan datos",
            description: "No se encontraron tus datos de perfil. Por favor, completa tu registro.",
        });
        // Optionally redirect to onboarding
        // router.push('/onboarding');
        return;
    }
    
    setIsLoading(true)
    setIsPlanSuccessfullyGenerated(false)
    try {
      const plan = await generatePersonalizedTrainingPlan(onboardingData)
      
      const loggedInUserEmail = sessionStorage.getItem("loggedInUser");
      if (loggedInUserEmail) {
        localStorage.setItem(`userPlan_${loggedInUserEmail}`, JSON.stringify(plan));
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
      setTimeout(() => {
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
      <DialogContent className="sm:max-w-md">
        {isPlanSuccessfullyGenerated ? (
            <PlanGeneratedConfirmation onClose={() => handleOpenChange(false)} />
        ) : (
            <>
            <DialogHeader>
              <DialogTitle className="font-headline">Generar Plan con IA</DialogTitle>
              <DialogDescription>
                Usa la información de tu perfil para generar un plan de entrenamiento personalizado.
              </DialogDescription>
            </DialogHeader>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-center text-muted-foreground animate-pulse">Generando tu plan, por favor espera...</p>
                </div>
            ) : (
                <div className="py-4 space-y-6">
                    {onboardingData ? (
                         <Alert>
                            <Sparkles className="h-4 w-4" />
                            <AlertTitle>¡Todo Listo!</AlertTitle>
                            <AlertDescription>
                                Hemos cargado tus datos del perfil. Haz clic en el botón de abajo para que la IA genere tu nuevo plan.
                            </AlertDescription>
                        </Alert>
                    ) : (
                         <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Datos de Perfil No Encontrados</AlertTitle>
                            <AlertDescription>
                                No pudimos encontrar la información de tu perfil necesaria para generar un plan. Por favor, asegúrate de haber completado el registro inicial.
                            </AlertDescription>
                        </Alert>
                    )}
                   
                    <Button onClick={handleGenerate} disabled={isLoading || !onboardingData} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isLoading ? "Generando..." : "Generar Mi Plan Ahora"}
                    </Button>
                </div>
            )}
            </>
        )}
      </DialogContent>
    </Dialog>
  )
}
