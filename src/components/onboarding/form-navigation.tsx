
"use client"

import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Send } from "lucide-react"

type FormNavigationProps = {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  onBack: () => void;
};

export function FormNavigation({
  currentStep,
  totalSteps,
  isLoading,
  onBack,
}: FormNavigationProps) {
  return (
    <div className="flex justify-between items-center pt-4 border-t border-border/20">
      <div>
        {currentStep > 0 && (
          <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        Paso {currentStep + 1} de {totalSteps}
      </div>
      <div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : currentStep === totalSteps - 1 ? (
             <Send className="mr-2 h-4 w-4" />
          ) : null}
          {isLoading ? "Procesando..." : currentStep === totalSteps - 1 ? "Enviar Solicitud" : "Siguiente"}
        </Button>
      </div>
    </div>
  );
}
