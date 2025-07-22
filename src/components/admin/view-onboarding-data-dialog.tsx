
"use client"

import type { User, GeneratePersonalizedTrainingPlanInput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle, FileText } from "lucide-react";

type ViewOnboardingDataDialogProps = {
  user: User | null;
  data: GeneratePersonalizedTrainingPlanInput | null;
  isOpen: boolean;
  onClose: () => void;
};

const DataRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-start border-b py-2">
        <dt className="font-semibold text-muted-foreground">{label}</dt>
        <dd className="text-right text-foreground">{value}</dd>
    </div>
);

export function ViewOnboardingDataDialog({ user, data, isOpen, onClose }: ViewOnboardingDataDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <FileText />
            Datos de Onboarding de {user.name}
          </DialogTitle>
          <DialogDescription>
            Información proporcionada por el usuario durante su registro inicial.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {data ? (
            <dl className="space-y-2">
              <DataRow label="Metas" value={data.goals.join(", ")} />
              <DataRow label="Plazo" value={data.goalTerm} />
              <DataRow label="Nivel Físico" value={data.currentFitnessLevel} />
              <DataRow label="Días de Entrenamiento" value={data.trainingDays.join(", ")} />
              <DataRow label="Estilo Preferido" value={data.preferredWorkoutStyle} />
              {data.muscleFocus && data.muscleFocus.length > 0 && (
                <DataRow label="Enfoque Muscular" value={data.muscleFocus.join(", ")} />
              )}
              <DataRow label="Edad" value={`${data.age} años`} />
              <DataRow label="Peso" value={`${data.weight} kg`} />
              <DataRow label="Altura" value={`${data.height} cm`} />
              <DataRow label="Lesiones/Condiciones" value={data.injuriesOrConditions || "Ninguna"} />
            </dl>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-full">
              <AlertCircle className="h-10 w-10 mb-4" />
              <p className="font-semibold">Sin Datos de Onboarding</p>
              <p className="text-sm">Este usuario no ha completado el formulario de onboarding inicial.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
