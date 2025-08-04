

"use client"

import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Sparkles, X, ArrowRight } from "lucide-react"

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
      {/* Left-side buttons */}
      <div className="flex gap-2 justify-start items-center">
        {currentStep > 0 && (
          <Button type="button" variant="outline" onClick={onBack} disabled={isLoading} className="hidden sm:inline-flex">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
        )}
         <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
      </div>
      
      {/* Center text - This will now be centered in the remaining space */}
      <div className="text-sm text-muted-foreground text-center px-2 flex-grow">
        Paso {currentStep + 1} de {totalSteps}
      </div>
      
      {/* Right-side button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : currentStep === totalSteps - 1 ? (
             <Sparkles className="mr-2 h-4 w-4" />
          ) : null}
          {isLoading ? "Enviando..." : currentStep === totalSteps - 1 ? "Enviar Solicitud" : "Siguiente"}
           {currentStep < totalSteps - 1 && !isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
