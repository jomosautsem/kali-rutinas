

"use client"

import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Sparkles, X } from "lucide-react"

type FormNavigationProps = {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  onBack: () => void;
  onCancel: () => void;
};

export function FormNavigation({
  currentStep,
  totalSteps,
  isLoading,
  onBack,
  onCancel,
}: FormNavigationProps) {
  return (
    <div className="flex justify-between items-center pt-4 border-t border-border/20">
      <div className="flex gap-2">
        {currentStep > 0 && (
          <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
        )}
         <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
      </div>
      <div className="text-sm text-muted-foreground">
        Paso {currentStep + 1} de {totalSteps}
      </div>
      <div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : currentStep === totalSteps - 1 ? (
             <Sparkles className="mr-2 h-4 w-4" />
          ) : null}
          {isLoading ? "Generando..." : currentStep === totalSteps - 1 ? "Generar Plan" : "Siguiente"}
        </Button>
      </div>
    </div>
  );
}
