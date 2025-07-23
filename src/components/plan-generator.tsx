
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import type { UserPlan } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

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
import { Sparkles, AlertTriangle } from "lucide-react"

type PlanGeneratorProps = {
  onPlanGenerated: (newPlan: UserPlan) => void;
};

export function PlanGenerator({ onPlanGenerated }: PlanGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { toast } = useToast();
    const router = useRouter();
    
    const handleContinue = () => {
        if (typeof window !== 'undefined') {
            const email = sessionStorage.getItem("loggedInUser");
            if (email) {
                sessionStorage.setItem("onboardingUserEmail", email);
                router.push('/onboarding');
            } else {
                toast({
                    variant: "destructive",
                    title: "Error de Sesión",
                    description: "No se pudo encontrar tu sesión. Por favor, inicia sesión de nuevo.",
                });
            }
        }
        setIsOpen(false);
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
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button onClick={handleContinue}>Entendido, continuar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
