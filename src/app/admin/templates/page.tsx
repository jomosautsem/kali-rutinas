
"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TemplateGeneratorAI } from "@/components/admin/template-generator-ai";
import { TemplateEditor } from "@/components/admin/template-editor";
import { PlusCircle } from "lucide-react";
import type { UserPlan } from "@/lib/types";

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
        <div className="space-y-6">
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

            <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>HIIT de Cuerpo Completo</CardTitle>
                        <CardDescription>Entrenamiento de intervalos de alta intensidad para todos los grupos musculares principales.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary" className="w-full">Editar</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Fuerza para Principiantes</CardTitle>
                        <CardDescription>Una rutina de 3 días para quienes se inician en el levantamiento de pesas.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <Button variant="secondary" className="w-full">Editar</Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Calistenia Avanzada</CardTitle>
                        <CardDescription>Domina tu peso corporal con progresiones avanzadas.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <Button variant="secondary" className="w-full">Editar</Button>
                    </CardContent>
                </Card>
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
