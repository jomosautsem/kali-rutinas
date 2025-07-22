
"use client"

import { useState } from "react"
import { generatePersonalizedTrainingPlan } from "@/ai/flows/generate-personalized-training-plan";
import type { User, UserPlan, GeneratePersonalizedTrainingPlanInput } from "@/lib/types";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, Lightbulb, ClipboardCopy, Save, User as UserIcon, AlertCircle, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";

type TemplateGeneratorAIProps = {
  users: User[];
  onSaveTemplate: (plan: UserPlan, description: string) => void;
};


export function TemplateGeneratorAI({ users, onSaveTemplate }: TemplateGeneratorAIProps) {
  const [generatedPlan, setGeneratedPlan] = useState<UserPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { toast } = useToast();

  const activeUsers = users.filter(u => u.status === 'activo' && u.role === 'client');

  async function handleGenerate() {
    if (!selectedUserId) {
        toast({ variant: "destructive", title: "Selecciona un usuario" });
        return;
    }
    
    const user = users.find(u => u.id === selectedUserId);
    if (!user) {
        toast({ variant: "destructive", title: "Usuario no encontrado" });
        return;
    }

    const onboardingDataString = localStorage.getItem(`onboardingData_${user.email}`);
    if (!onboardingDataString) {
        toast({
            variant: "destructive",
            title: "Datos no encontrados",
            description: `El usuario ${user.name} no tiene datos de onboarding para generar un plan.`
        });
        return;
    }

    const onboardingData = JSON.parse(onboardingDataString);
    // Add a default exercisesPerDay if not present
    const generationInput: GeneratePersonalizedTrainingPlanInput = {
      ...onboardingData,
      exercisesPerDay: onboardingData.exercisesPerDay || 8, 
    };

    setIsLoading(true);
    setGeneratedPlan(null);
    setIsDialogOpen(false); // Close the dialog to show loading state on the main page

    try {
      const result = await generatePersonalizedTrainingPlan(generationInput);
      setGeneratedPlan(result);
      setSelectedUser(user);
      toast({
        title: "¡Plantilla Generada!",
        description: `Plan creado basado en el perfil de ${user.name}.`,
      });
    } catch (error) {
      console.error("Error generating template:", error);
      toast({
        variant: "destructive",
        title: "Error en la Generación",
        description: "No se pudo generar la plantilla. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
      setSelectedUserId('');
    }
  }

  const handleCopyToClipboard = () => {
    if (!generatedPlan) return;
    navigator.clipboard.writeText(JSON.stringify(generatedPlan, null, 2));
    toast({
        title: "Copiado al Portapapeles",
        description: "El JSON de la plantilla ha sido copiado.",
    })
  }

  const handleSave = () => {
    if (generatedPlan && selectedUser) {
      onSaveTemplate(generatedPlan, `Plantilla de ${selectedUser.name}`);
      setGeneratedPlan(null); // Clear the generated plan after saving
      setSelectedUser(null);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div>
        <CardHeader className="px-0 pt-0">
          <CardTitle className="font-headline">Generar con IA desde Perfil</CardTitle>
          <CardDescription>Crea plantillas basadas en los datos reales de tus clientes. Selecciona un usuario para generar un plan de entrenamiento adaptado a sus metas y características.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar Plantilla desde Usuario
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Seleccionar Usuario</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="user-select">Usuario Activo</Label>
                            <Select onValueChange={setSelectedUserId}>
                                <SelectTrigger id="user-select">
                                    <SelectValue placeholder="Selecciona un cliente..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeUsers.length > 0 ? (
                                        activeUsers.map(user => (
                                            <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-muted-foreground">No hay usuarios activos.</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                         <Button onClick={handleGenerate} disabled={!selectedUserId || isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                            Generar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CardContent>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Resultado Generado</CardTitle>
           {selectedUser && <CardDescription>Basado en el perfil de: <span className="font-semibold text-primary">{selectedUser.name}</span></CardDescription>}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ) : generatedPlan ? (
            <div className="space-y-4">
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={handleCopyToClipboard}>
                        <ClipboardCopy className="mr-2"/>
                        Copiar JSON
                    </Button>
                </div>
              {generatedPlan.warmup && (
                <div className="p-3 rounded-md bg-secondary/50 border">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Sparkles className="text-primary"/>
                        Calentamiento
                    </h4>
                    <p className="text-sm text-muted-foreground">{generatedPlan.warmup}</p>
                </div>
              )}
              {generatedPlan.recommendations && (
                <div className="p-3 rounded-md bg-secondary/50 border">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Lightbulb className="text-primary"/>
                    Recomendaciones
                  </h4>
                  <p className="text-sm text-muted-foreground">{generatedPlan.recommendations}</p>
                </div>
              )}
              <div className="space-y-3">
                {generatedPlan.weeklyPlan.map((day, index) => (
                    <div key={index} className="p-3 rounded-md border">
                        <p className="font-semibold">{day.day}: <span className="font-normal text-muted-foreground">{day.focus}</span></p>
                    </div>
                ))}
              </div>
              <Button className="w-full" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Guardar como Plantilla
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              El resultado de la plantilla generada aparecerá aquí.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
