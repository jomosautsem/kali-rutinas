
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanGenerator } from "@/components/plan-generator"
import { CheckCircle, Dumbbell, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { User } from "@/components/admin/user-table-client";

// MOCK: In a real app, this would come from the user's data.
// const planStatus: 'aprobado' | 'pendiente' | 'sin-plan' = 'pendiente'; 
// const planStatus: 'aprobado' | 'pendiente' | 'sin-plan' = 'aprobado'; 
// const planStatus: 'aprobado' | 'pendiente' | 'sin-plan' = 'sin-plan'; 

const PlanAprobado = () => (
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-muted-foreground border">
            <CheckCircle className="h-5 w-5" />
          </div>
        <div>
          <h3 className="font-semibold">Día 3: Descanso y Recuperación</h3>
          <p className="text-sm text-muted-foreground">Recuperación activa y estiramientos.</p>
        </div>
      </div>
    </div>
)

const PlanPendiente = () => (
    <Alert className="border-yellow-500/50 text-yellow-700 bg-yellow-500/10">
        <Clock className="h-4 w-4 !text-yellow-600" />
        <AlertTitle>¡Tu Plan Está Casi Listo!</AlertTitle>
        <AlertDescription>
        Tu plan de entrenamiento ha sido generado y enviado a un administrador para su revisión. Recibirás una notificación tan pronto como sea aprobado.
        </AlertDescription>
    </Alert>
)

const SinPlan = () => (
     <Alert>
        <Dumbbell className="h-4 w-4" />
        <AlertTitle>¡Es Hora de Empezar!</AlertTitle>
        <AlertDescription>
        Parece que aún no tienes un plan de entrenamiento. ¡Genera uno nuevo para comenzar tu viaje de fitness!
        </AlertDescription>
    </Alert>
)

export default function DashboardPage() {
  const [planStatus, setPlanStatus] = useState<'aprobado' | 'pendiente' | 'sin-plan' | null>(null);

  useEffect(() => {
    // This simulates fetching the current user's plan status after they log in.
    if (typeof window !== 'undefined') {
      const loggedInUserEmail = sessionStorage.getItem("loggedInUser");
      const storedUsers = localStorage.getItem("registeredUsers");
      if (loggedInUserEmail && storedUsers) {
        const users: User[] = JSON.parse(storedUsers);
        const currentUser = users.find(u => u.email === loggedInUserEmail);
        if (currentUser) {
          setPlanStatus(currentUser.planStatus as any);
        } else {
          setPlanStatus('sin-plan');
        }
      } else {
        setPlanStatus('sin-plan'); // Default for users not found
      }
    }
  }, []);


  const handlePlanGenerated = () => {
    // When a plan is generated, it should be set to 'pending'
    if (typeof window !== 'undefined') {
      const loggedInUserEmail = sessionStorage.getItem("loggedInUser");
      const storedUsers = localStorage.getItem("registeredUsers");
      if (loggedInUserEmail && storedUsers) {
        let users: User[] = JSON.parse(storedUsers);
        users = users.map(u => u.email === loggedInUserEmail ? { ...u, planStatus: 'pendiente' } : u);
        localStorage.setItem("registeredUsers", JSON.stringify(users));
        setPlanStatus('pendiente');
      }
    }
  };


  const renderPlanContent = () => {
    if (planStatus === null) {
        return <p>Cargando estado del plan...</p>; // Or a skeleton loader
    }
    switch(planStatus) {
      case 'aprobado':
        return <PlanAprobado />;
      case 'pendiente':
        return <PlanPendiente />;
      case 'sin-plan':
        return <SinPlan />;
      default:
        return <SinPlan />;
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold font-headline">Tu Panel</h1>
        <PlanGenerator onPlanGenerated={handlePlanGenerated} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Tu Plan Semanal</CardTitle>
            <CardDescription>
                {planStatus === 'aprobado' 
                    ? "Este es tu horario de entrenamiento personalizado para la semana."
                    : "Tu plan de entrenamiento aparecerá aquí una vez que sea aprobado."
                }
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {renderPlanContent()}
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

    