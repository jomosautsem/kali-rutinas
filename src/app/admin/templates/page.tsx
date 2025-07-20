
"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TemplateGeneratorAI } from "@/components/admin/template-generator-ai";
import { TemplateEditor } from "@/components/admin/template-editor";
import { PlusCircle, Dumbbell, Calendar, Trash2 } from "lucide-react";
import type { UserPlan } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// The full template object type
export type Template = {
    id: string;
    title: string;
    description: string;
    level: "Principiante" | "Intermedio" | "Avanzado";
    days: number;
    plan: UserPlan;
};

const initialTemplates: Template[] = [
    {
        id: "template-1",
        title: "HIIT de Cuerpo Completo",
        description: "Entrenamiento de intervalos de alta intensidad para todos los grupos musculares.",
        level: "Avanzado",
        days: 5,
        plan: {
            warmup: "Comienza con 5 minutos de cardio ligero (saltar la cuerda o trotar). Sigue con círculos de brazos, rotaciones de torso y sentadillas sin peso para activar las articulaciones principales.",
            recommendations: "Asegúrate de calentar bien antes de cada sesión y mantenerte hidratado. Realiza estiramientos suaves al finalizar.",
            weeklyPlan: [
                { day: "Día 1: HIIT Total", focus: "Cardio y Resistencia", exercises: [{ name: "Burpees", series: "5", reps: "20", rest: "30s", mediaUrl: "" }] },
                { day: "Día 2: Piernas y Glúteos", focus: "Fuerza y Potencia", exercises: [{ name: "Sentadillas con Salto", series: "4", reps: "15", rest: "45s", mediaUrl: "" }] },
                { day: "Día 3: Core y Abdomen", focus: "Estabilidad y Fuerza", exercises: [{ name: "Plancha", series: "4", reps: "60s", rest: "30s", mediaUrl: "" }] },
                { day: "Día 4: Tren Superior", focus: "Fuerza y Resistencia", exercises: [{ name: "Flexiones", series: "4", reps: "15", rest: "45s", mediaUrl: "" }] },
                { day: "Día 5: Cardio Intenso", focus: "Resistencia Cardiovascular", exercises: [{ name: "Sprints", series: "8", reps: "30s", rest: "60s", mediaUrl: "" }] },
            ]
        }
    },
    {
        id: "template-2",
        title: "Fuerza para Principiantes",
        description: "Una rutina de 3 días para quienes se inician en el levantamiento de pesas.",
        level: "Principiante",
        days: 3,
        plan: {
            warmup: "5-10 minutos en la caminadora o bicicleta estática. Realiza 2 series de 15 repeticiones de bisagras de cadera, band pull-aparts y rotaciones de hombros con poco peso.",
            recommendations: "Concéntrate en la técnica correcta antes de aumentar el peso. El descanso es clave para la recuperación y el crecimiento.",
            weeklyPlan: [
                { day: "Día 1: Empuje", focus: "Pecho, Hombros, Tríceps", exercises: [{ name: "Press de Banca", series: "3", reps: "8-10", rest: "90s", mediaUrl: "" }] },
                { day: "Día 2: Tirón", focus: "Espalda, Bíceps", exercises: [{ name: "Remo con Barra", series: "3", reps: "8-10", rest: "90s", mediaUrl: "" }] },
                { day: "Día 3: Pierna", focus: "Cuádriceps, Isquios, Glúteos", exercises: [{ name: "Sentadilla", series: "3", reps: "8-10", rest: "90s", mediaUrl: "" }] },
            ]
        }
    },
    {
        id: "template-3",
        title: "Calistenia Intermedia",
        description: "Domina tu peso corporal con progresiones para nivel intermedio.",
        level: "Intermedio",
        days: 4,
        plan: {
             warmup: "Movilidad de muñecas y hombros es crucial. Haz círculos, flexiones y extensiones. Activa el core con planchas y hollow body holds (2 series de 30s).",
             recommendations: "La consistencia es clave en la calistenia. Trabaja en la calidad de cada repetición y no te saltes los días de descanso.",
             weeklyPlan: [
                { day: "Día 1: Tren Superior A", focus: "Flexiones y Dips", exercises: [{ name: "Flexiones Diamante", series: "4", reps: "Al fallo", rest: "120s", mediaUrl: "" }] },
                { day: "Día 2: Tren Inferior", focus: "Sentadillas y Zancadas", exercises: [{ name: "Sentadilla Búlgara", series: "4", reps: "12-15 por pierna", rest: "90s", mediaUrl: "" }] },
                { day: "Día 3: Tren Superior B", focus: "Dominadas y Remos", exercises: [{ name: "Dominadas", series: "5", reps: "Al fallo", rest: "120s", mediaUrl: "" }] },
                { day: "Día 4: Habilidades y Core", focus: "Handstand y L-Sit", exercises: [{ name: "Práctica de L-Sit", series: "5", reps: "30s", rest: "60s", mediaUrl: "" }] },
             ]
        }
    }
];


export default function AdminTemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>(initialTemplates);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const { toast } = useToast();

    const handleCreateClick = () => {
        setSelectedTemplate(null); // No template is selected, so we are creating a new one
        setIsEditorOpen(true);
    };

    const handleEditClick = (template: Template) => {
        setSelectedTemplate(template);
        setIsEditorOpen(true);
    };

    const handleSaveTemplate = (templateData: Template) => {
        if (selectedTemplate) {
            // Editing existing template
            const updatedTemplates = templates.map(t =>
                t.id === templateData.id ? { ...templateData, days: templateData.plan.weeklyPlan.length } : t
            );
            setTemplates(updatedTemplates);
            toast({ title: "Plantilla Actualizada", description: `Se guardaron los cambios para "${templateData.title}".` });
        } else {
            // Creating a new template
            const newTemplate: Template = {
                ...templateData,
                id: `template-${Date.now()}`,
                days: templateData.plan.weeklyPlan.length,
            };
            setTemplates(prev => [...prev, newTemplate]);
            toast({ title: "Plantilla Creada", description: "La nueva plantilla manual ha sido añadida." });
        }
        setIsEditorOpen(false);
        setSelectedTemplate(null);
    }
    
    const handleDeleteTemplate = (templateId: string) => {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        toast({
            variant: "destructive",
            title: "Plantilla Eliminada",
            description: "La plantilla ha sido eliminada correctamente."
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Gestión de Plantillas</h1>
                    <p className="text-muted-foreground">Revisa las plantillas existentes, crea nuevas manualmente o genéralas con IA.</p>
                </div>
                <Button onClick={handleCreateClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Plantilla Manualmente
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <Card key={template.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Dumbbell className="h-6 w-6 text-primary" />
                                </div>
                                <Badge variant="outline" className={cn(
                                    template.level === "Principiante" && "border-blue-500 text-blue-500",
                                    template.level === "Intermedio" && "border-yellow-500 text-yellow-500",
                                    template.level === "Avanzado" && "border-red-500 text-red-500",
                                )}>{template.level}</Badge>
                            </div>
                            <CardTitle className="pt-4">{template.title}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                             <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>{template.plan.weeklyPlan.length} días por semana</span>
                            </div>
                        </CardContent>
                        <CardFooter className="gap-2">
                            <Button className="w-full" onClick={() => handleEditClick(template)}>Editar</Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Eliminar</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro de que quieres eliminar esta plantilla?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente la plantilla
                                        <span className="font-bold"> "{template.title}"</span>.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteTemplate(template.id)}>Eliminar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Card>
                 <CardHeader>
                    <CardTitle className="font-headline">Generador de Plantillas con IA</CardTitle>
                </CardHeader>
                <CardContent>
                    <TemplateGeneratorAI />
                </CardContent>
            </Card>

            <TemplateEditor
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSaveTemplate}
                initialData={selectedTemplate}
            />
        </div>
    )
}
