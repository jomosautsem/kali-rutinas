import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanGenerator } from "@/components/plan-generator"
import { CheckCircle, Dumbbell } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold font-headline">Tu Panel</h1>
        <PlanGenerator />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Tu Plan Semanal</CardTitle>
            <CardDescription>Este es tu horario de entrenamiento personalizado para la semana.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-6">
              {/* This is mock data. In a real app, you'd fetch this. */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div className="h-full w-px bg-border" />
                </div>
                <div>
                  <h3 className="font-semibold">Día 1: Fuerza de Tren Superior</h3>
                  <p className="text-sm text-muted-foreground">Enfoque en pecho, hombros y tríceps.</p>
                  <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                    <li>Press de Banca: 4 series de 8-12 repeticiones</li>
                    <li>Press Militar: 3 series de 10-15 repeticiones</li>
                    <li>Fondos de Tríceps: 3 series al fallo</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/80 text-primary-foreground">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                   <div className="h-full w-px bg-border" />
                </div>
                <div>
                  <h3 className="font-semibold">Día 2: Tren Inferior y Core</h3>
                  <p className="text-sm text-muted-foreground">Desarrolla potencia en tus piernas y estabiliza tu core.</p>
                   <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                    <li>Sentadillas: 4 series de 8-12 repeticiones</li>
                    <li>Peso Muerto: 3 series de 6-8 repeticiones</li>
                    <li>Plancha: 3 series, 60 segundos de aguante</li>
                  </ul>
                </div>
              </div>
               <div className="flex items-start gap-4">
                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                <div>
                  <h3 className="font-semibold">Día 3: Descanso y Recuperación</h3>
                  <p className="text-sm text-muted-foreground">Recuperación activa y estiramientos.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Resumen de Progreso</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-5/6">
             <img src="https://placehold.co/400x300.png" alt="Gráfico de progreso" data-ai-hint="fitness chart" className="rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
