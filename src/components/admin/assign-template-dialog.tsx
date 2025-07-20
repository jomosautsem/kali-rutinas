
"use client"

import { useState } from "react";
import type { User, UserPlan } from "@/lib/types";
import type { Template } from "@/app/admin/templates/page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilePlus, Dumbbell, Calendar, AlertTriangle } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

type AssignTemplateDialogProps = {
  user: User | null;
  templates: Template[];
  isOpen: boolean;
  onClose: () => void;
  onAssign: (plan: UserPlan) => void;
};

export function AssignTemplateDialog({ user, templates, isOpen, onClose, onAssign }: AssignTemplateDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const handleAssign = () => {
    const template = templates.find(t => t.id === selectedTemplateId);
    if (template) {
      onAssign(template.plan);
      onClose();
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <FilePlus />
            Asignar Plantilla a {user.name}
          </DialogTitle>
          <DialogDescription>
            Selecciona una plantilla de la lista para asignarla como el plan de entrenamiento de este usuario. Esto reemplazará su plan actual.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <label htmlFor="template-select" className="text-sm font-medium">
              Plantillas Disponibles
            </label>
            <Select onValueChange={setSelectedTemplateId} value={selectedTemplateId}>
              <SelectTrigger id="template-select" className="mt-1">
                <SelectValue placeholder="Selecciona una plantilla..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.title} ({template.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <Card className="bg-secondary/50">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{selectedTemplate.title}</CardTitle>
                            <CardDescription>{selectedTemplate.description}</CardDescription>
                        </div>
                        <Badge variant="outline" className={cn(
                            "ml-4 shrink-0",
                            selectedTemplate.level === "Principiante" && "border-blue-500 text-blue-500",
                            selectedTemplate.level === "Intermedio" && "border-yellow-500 text-yellow-500",
                            selectedTemplate.level === "Avanzado" && "border-red-500 text-red-500",
                        )}>{selectedTemplate.level}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                        <div className="flex items-center gap-1.5">
                            <Dumbbell className="h-4 w-4" />
                            <span>{selectedTemplate.plan.weeklyPlan.flatMap(d => d.exercises).length} ejercicios</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>{selectedTemplate.plan.weeklyPlan.length} días</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
          )}

           {user.planStatus === 'aprobado' && (
             <div className="flex items-start gap-2.5 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                <p>
                    <strong>Advertencia:</strong> Este usuario ya tiene un plan aprobado. Asignar una nueva plantilla reemplazará permanentemente el plan existente.
                </p>
             </div>
           )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAssign} disabled={!selectedTemplateId}>
            Asignar Plantilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    