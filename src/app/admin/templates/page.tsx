import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TemplateGenerator } from "@/components/template-generator";

export default function AdminTemplatesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Gestión de Plantillas</h1>
                    <p className="text-muted-foreground">Revisa las plantillas existentes o genera nuevas ideas con IA.</p>
                </div>
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

            <TemplateGenerator />

        </div>
    )
}
