
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanGenerator } from "@/components/plan-generator"
import { Clock, Dumbbell } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { User, UserPlan } from "@/lib/types";

const isVideo = (url: string) => {
    return url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".webm");
}

const PlanAprobado = ({ plan }: { plan: UserPlan }) => (
    <div className="space-y-6">
      {plan.weeklyPlan.map((dayPlan, index) => (
         <div key={index} className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <span className="font-bold">{dayPlan.day.charAt(0)}</span>
                </div>
                {index < plan.weeklyPlan.length - 1 && <div className="h-full w-px bg-border" />}
            </div>
            <div>
                <h3 className="font-semibold">{dayPlan.focus}</h3>
                <p className="text-sm text-muted-foreground">Día {index + 1}: {dayPlan.day}</p>
                <ul className="mt-2 list-none pl-0 text-sm space-y-4">
                    {dayPlan.exercises.map((exercise, exIndex) => (
                        <li key={exIndex} className="p-3 rounded-lg bg-secondary/50">
                            <p className="font-medium">{exercise.name}: <span className="font-normal text-muted-foreground">{exercise.series} de {exercise.reps} reps, {exercise.rest} de descanso.</span></p>
                            {exercise.mediaUrl && (
                                <div className="mt-2">
                                    {isVideo(exercise.mediaUrl) ? (
                                        <video src={exercise.mediaUrl} controls className="w-full rounded-md max-w-sm" />
                                    ) : (
                                        <Image 
                                            src={exercise.mediaUrl} 
                                            alt={`Visual de ${exercise.name}`} 
                                            width={400} 
                                            height={300} 
                                            className="rounded-md object-cover"
                                        />
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      ))}
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
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);

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
          if (currentUser.planStatus === 'aprobado') {
              const storedPlan = localStorage.getItem(`userPlan_${currentUser.email}`);
              if (storedPlan) {
                  setUserPlan(JSON.parse(storedPlan));
              }
          }
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
        return userPlan ? <PlanAprobado plan={userPlan} /> : <p>Cargando plan...</p>;
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
        {planStatus !== 'pendiente' && planStatus !== 'aprobado' && (
          <PlanGenerator onPlanGenerated={handlePlanGenerated} />
        )}
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
