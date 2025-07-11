
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanGenerator } from "@/components/plan-generator"
import { Clock, Dumbbell, Video, Image as ImageIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import type { User, UserPlan } from "@/lib/types";

const isVideo = (url: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov'];
    const lowercasedUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowercasedUrl.includes(ext));
};

const MediaPreview = ({ url, alt }: { url: string, alt: string }) => {
    if (!url) {
        return (
            <div className="w-full h-32 bg-secondary rounded-md flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
        )
    };

    if (isVideo(url)) {
        return <video src={url} controls className="w-full aspect-video rounded-md" />
    }

    return <Image src={url} alt={alt} width={200} height={150} className="w-full h-auto object-cover rounded-md" data-ai-hint="fitness exercise"/>
};

const PlanAprobado = ({ plan }: { plan: UserPlan }) => (
    <Accordion type="multiple" defaultValue={plan.weeklyPlan.map((_, index) => `day-${index}`)} className="w-full">
        {plan.weeklyPlan.map((dayPlan, dayIndex) => (
            <AccordionItem key={dayIndex} value={`day-${dayIndex}`}>
                <AccordionTrigger>
                    <div className="flex items-center gap-4 w-full">
                        <span className="font-bold w-32 text-left">{dayPlan.day}</span>
                        <span className="text-base flex-1 text-left text-muted-foreground">{dayPlan.focus}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-4 pl-4">
                        {dayPlan.exercises.map((exercise, exerciseIndex) => (
                            <div key={exerciseIndex} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-3 rounded-lg bg-secondary/50">
                                <div className="md:col-span-8 space-y-2">
                                    <p className="font-semibold text-base">{exercise.name}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                        <span>Series: <span className="font-medium text-foreground">{exercise.series}</span></span>
                                        <span>Reps: <span className="font-medium text-foreground">{exercise.reps}</span></span>
                                        <span>Descanso: <span className="font-medium text-foreground">{exercise.rest}</span></span>
                                    </div>
                                </div>
                                <div className="md:col-span-4">
                                     <MediaPreview url={exercise.mediaUrl} alt={`Visual de ${exercise.name}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        ))}
    </Accordion>
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
          <CardContent className="px-2 md:px-6">
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
