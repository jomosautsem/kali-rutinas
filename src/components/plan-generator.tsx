
"use client"

import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"

import { generatePersonalizedTrainingPlan } from "@/ai/flows/generate-personalized-training-plan"
import { GeneratePersonalizedTrainingPlanInputSchema, type GeneratePersonalizedTrainingPlanInput, type UserPlan } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Sparkles, CheckCircle, Loader2, AlertTriangle, Send } from "lucide-react"

type PlanGeneratorProps = {
  onPlanGenerated: (newPlan: UserPlan) => void;
};

// --- Main Component ---

export function PlanGenerator({ onPlanGenerated }: PlanGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { toast } = useToast();
    const router = useRouter();
    
    const handleGenerateClick = () => {
        if (typeof window !== 'undefined') {
            const email = sessionStorage.getItem("loggedInUser");
            if (email) {
                // Set a flag to indicate the user is generating a new plan, not registering
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
    }
    
    return (
        <Button onClick={handleGenerateClick}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generar Plan con IA
        </Button>
    )
}
