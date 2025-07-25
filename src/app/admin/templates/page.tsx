
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TemplateGeneratorAI } from "@/components/admin/template-generator-ai";
import { TemplateEditor } from "@/components/admin/template-editor";
import { PlusCircle, Dumbbell, Calendar, Trash2 } from "lucide-react";
import type { User, UserPlan } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { TemplateGenerator } from "@/components/template-generator";

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
                { day: "Día 1: HIIT Total", focus: "Cardio y Resistencia", exercises: [{ name: "Burpees", series: "5", reps: "20", rest: "30s", mediaUrl: "https://www.youtube.com/results?search_query=Burpees+ejercicio+tutorial" }] },
                { day: "Día 2: Piernas y Glúteos", focus: "Fuerza y Potencia", exercises: [{ name: "Sentadillas con Salto", series: "4", reps: "15", rest: "45s", mediaUrl: "https://www.youtube.com/results?search_query=Sentadillas+con+Salto+ejercicio+tutorial" }] },
                { day: "Día 3: Core y Abdomen", focus: "Estabilidad y Fuerza", exercises: [{ name: "Plancha", series: "4", reps: "60s", rest: "30s", mediaUrl: "https://www.youtube.com/results?search_query=Plancha+ejercicio+tutorial" }] },
                { day: "Día 4: Tren Superior", focus: "Fuerza y Resistencia", exercises: [{ name: "Flexiones", series: "4", reps: "15", rest: "45s", mediaUrl: "https://www.youtube.com/results?search_query=Flexiones+ejercicio+tutorial" }] },
                { day: "Día 5: Cardio Intenso", focus: "Resistencia Cardiovascular", exercises: [{ name: "Sprints", series: "8", reps: "30s", rest: "60s", mediaUrl: "https://www.youtube.com/results?search_query=Sprints+ejercicio+tutorial" }] },
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
                { day: "Día 1: Empuje", focus: "Pecho, Hombros, Tríceps", exercises: [{ name: "Press de Banca", series: "3", reps: "8-10", rest: "90s", mediaUrl: "https://www.youtube.com/results?search_query=Press+de+Banca+ejercicio+tutorial" }] },
                { day: "Día 2: Tirón", focus: "Espalda, Bíceps", exercises: [{ name: "Remo con Barra", series: "3", reps: "8-10", rest: "90s", mediaUrl: "https://www.youtube.com/results?search_query=Remo+con+Barra+ejercicio+tutorial" }] },
                { day: "Día 3: Pierna", focus: "Cuádriceps, Isquios, Glúteos", exercises: [{ name: "Sentadilla", series: "3", reps: "8-10", rest: "90s", mediaUrl: "https://www.youtube.com/results?search_query=Sentadilla+ejercicio+tutorial" }] },
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
                { day: "Día 1: Tren Superior A", focus: "Flexiones y Dips", exercises: [{ name: "Flexiones Diamante", series: "4", reps: "Al fallo", rest: "120s", mediaUrl: "https://www.youtube.com/results?search_query=Flexiones+Diamante+ejercicio+tutorial" }] },
                { day: "Día 2: Tren Inferior", focus: "Sentadillas y Zancadas", exercises: [{ name: "Sentadilla Búlgara", series: "4", reps: "12-15 por pierna", rest: "90s", mediaUrl: "https://www.youtube.com/results?search_query=Sentadilla+Búlgara+ejercicio+tutorial" }] },
                { day: "Día 3: Tren Superior B", focus: "Dominadas y Remos", exercises: [{ name: "Dominadas", series: "5", reps: "Al fallo", rest: "120s", mediaUrl: "https://www.youtube.com/results?search_query=Dominadas+ejercicio+tutorial" }] },
                { day: "Día 4: Habilidades y Core", focus: "Handstand y L-Sit", exercises: [{ name: "Práctica de L-Sit", series: "5", reps: "30s", rest: "60s", mediaUrl: "https://www.youtube.com/results?search_query=Práctica+de+L-Sit+ejercicio+tutorial" }] },
             ]
        }
    }
];

const TEMPLATES_STORAGE_KEY = "trainingTemplates";

export default function AdminTemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                // Load templates
                const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
                if (storedTemplates) {
                    setTemplates(JSON.parse(storedTemplates));
                } else {
                    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(initialTemplates));
                    setTemplates(initialTemplates);
                }
                
                // Load users
                 const storedUsers = localStorage.getItem("registeredUsers");
                if (storedUsers) {
                    setUsers(JSON.parse(storedUsers));
                }

            } catch (error) {
                console.error("Failed to parse data from localStorage", error);
                setTemplates(initialTemplates);
                setUsers([]);
            }
        }
    }, []);

    const updateAndStoreTemplates = (newTemplates: Template[]) => {
        setTemplates(newTemplates);
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(newTemplates));
    };

    const handleCreateClick = () => {
        setSelectedTemplate(null);
        setIsEditorOpen(true);
    };

    const handleEditClick = (template: Template) => {
        setSelectedTemplate(template);
        setIsEditorOpen(true);
    };

    const handleSaveTemplate = (templateData: Template) => {
        // Automatically add mediaUrl to each exercise
        const planWithMedia = {
            ...templateData.plan,
            weeklyPlan: templateData.plan.weeklyPlan.map(day => ({
                ...day,
                exercises: day.exercises.map(exercise => {
                    if (exercise.mediaUrl) return exercise; // Don't override if it already exists
                    const query = encodeURIComponent(`${exercise.name} ejercicio tutorial`);
                    const mediaUrl = `https://www.youtube.com/results?search_query=${query}`;
                    return { ...exercise, mediaUrl };
                })
            }))
        };
        
        const finalTemplateData = { 
            ...templateData, 
            plan: planWithMedia,
            days: planWithMedia.weeklyPlan.length,
        };

        let updatedTemplates;
        if (selectedTemplate) {
            updatedTemplates = templates.map(t =>
                t.id === finalTemplateData.id ? finalTemplateData : t
            );
            toast({ title: "Plantilla Actualizada", description: `Se guardaron los cambios para "${finalTemplateData.title}".` });
        } else {
            const newTemplate = {
                ...finalTemplateData,
                id: `template-${Date.now()}`,
            };
            updatedTemplates = [...templates, newTemplate];
            toast({ title: "Plantilla Creada", description: "La nueva plantilla manual ha sido añadida." });
        }
        updateAndStoreTemplates(updatedTemplates);
        setIsEditorOpen(false);
        setSelectedTemplate(null);
    }
    
    const handleDeleteTemplate = (templateId: string) => {
        const newTemplates = templates.filter(t => t.id !== templateId);
        updateAndStoreTemplates(newTemplates);
        toast({
            variant: "destructive",
            title: "Plantilla Eliminada",
            description: "La plantilla ha sido eliminada correctamente."
        });
    };

    const handleSaveAITemplate = (plan: UserPlan, title: string, description: string) => {
        const newTemplate: Template = {
            id: `template-ai-${Date.now()}`,
            title: title,
            description: description,
            level: "Intermedio", // Default level for AI generated templates
            days: plan.weeklyPlan.length,
            plan: {
                ...plan,
                weeklyPlan: plan.weeklyPlan.map(day => ({
                    ...day,
                    exercises: day.exercises.map(exercise => {
                        if (exercise.mediaUrl) return exercise;
                        const query = encodeURIComponent(`${exercise.name} ejercicio tutorial`);
                        return {
                            ...exercise,
                            mediaUrl: `https://www.youtube.com/results?search_query=${query}`
                        };
                    })
                }))
            }
        };

        const updatedTemplates = [...templates, newTemplate];
        updateAndStoreTemplates(updatedTemplates);
        toast({
            title: "Plantilla de IA Guardada",
            description: "La nueva plantilla generada por IA ha sido añadida a tu lista."
        });
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Gestión de Plantillas</h1>
                    <p className="text-muted-foreground">Revisa las plantillas existentes, créalas manualmente o usa IA.</p>
                </div>
                <Button onClick={handleCreateClick} className="w-full sm:w-auto">
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
                            <CardDescription className="line-clamp-3">{template.description}</CardDescription>
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
                    <CardTitle className="font-headline">Generador de Plantillas con IA (Desde Texto)</CardTitle>
                </CardHeader>
                <CardContent>
                    <TemplateGenerator onSaveTemplate={handleSaveAITemplate} />
                </CardContent>
            </Card>
            
            <Card>
                 <CardHeader>
                    <CardTitle className="font-headline">Generador de Plantillas con IA (Desde Perfil de Usuario)</CardTitle>
                </CardHeader>
                <CardContent>
                    <TemplateGeneratorAI users={users} onSaveTemplate={(plan, desc) => handleSaveAITemplate(plan, `Perfil: ${desc}`, `Generado por IA para el perfil de ${desc}`)} />
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
