
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

const mockTemplates = [
    {
        title: "HIIT de Cuerpo Completo",
        description: "Entrenamiento de intervalos de alta intensidad para todos los grupos musculares.",
        level: "Avanzado",
        days: 5,
    },
    {
        title: "Fuerza para Principiantes",
        description: "Una rutina de 3 días para quienes se inician en el levantamiento de pesas.",
        level: "Principiante",
        days: 3,
    },
    {
        title: "Calistenia Intermedia",
        description: "Domina tu peso corporal con progresiones para nivel intermedio.",
        level: "Intermedio",
        days: 4,
    }
];


export default function AdminTemplatesPage() {
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const handleSaveTemplate = (template: UserPlan) => {
        // In a real app, you would save this to your database.
        // For now, we'll just log it and save to local storage for persistence.
        console.log("Saving manual template:", template);
        localStorage.setItem("manualTemplate", JSON.stringify(template));
        setIsEditorOpen(false);
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Gestión de Plantillas</h1>
                    <p className="text-muted-foreground">Revisa las plantillas existentes, crea nuevas manualmente o genéralas con IA.</p>
                </div>
                <Button onClick={() => setIsEditorOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Plantilla Manualmente
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockTemplates.map((template, index) => (
                    <Card key={index} className="flex flex-col">
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
                                <span>{template.days} días por semana</span>
                            </div>
                        </CardContent>
                        <CardFooter className="gap-2">
                            <Button className="w-full">Editar</Button>
                            <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Card>
                 <CardHeader>
                    <CardTitle className="font-headline">Generador de Plantillas</CardTitle>
                </CardHeader>
                <CardContent>
                    <TemplateGeneratorAI />
                </CardContent>
            </Card>

            <TemplateEditor
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSaveTemplate}
            />
        </div>
    )
}
