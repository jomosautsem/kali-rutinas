
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanGenerator } from "@/components/plan-generator"
import { Clock, Dumbbell, Youtube, Image as ImageIcon, Lightbulb } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { User, UserPlan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const isVideo = (url: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov'];
    const lowercasedUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowercasedUrl.includes(ext));
};

const isYoutubeUrl = (url: string) => {
    if (!url) return false;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
}

const MediaPreview = ({ url, alt }: { url: string, alt: string }) => {
    if (!url) {
        return (
            <div className="w-full h-32 bg-secondary rounded-md flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
        )
    };

    if (isYoutubeUrl(url)) {
        return (
            <Button asChild variant="secondary" className="w-full">
                <Link href={url} target="_blank" rel="noopener noreferrer">
                    <Youtube className="mr-2 h-5 w-5" />
                    Ver Video en YouTube
                </Link>
            </Button>
        )
    }

    if (isVideo(url)) {
        return <video src={url} controls className="w-full aspect-video rounded-md" />
    }

    return <Image src={url} alt={alt} width={200} height={150} className="w-full h-auto object-cover rounded-md" data-ai-hint="fitness exercise"/>
};


const dayButtonColors = [
    "bg-red-500/80 hover:bg-red-500",
    "bg-blue-500/80 hover:bg-blue-500",
    "bg-green-500/80 hover:bg-green-500",
    "bg-purple-500/80 hover:bg-purple-500",
    "bg-orange-500/80 hover:bg-orange-500",
    "bg-pink-500/80 hover:bg-pink-500",
    "bg-teal-500/80 hover:bg-teal-500",
]

const PlanAprobado = ({ plan }: { plan: UserPlan }) => {
    const [activeDayIndex, setActiveDayIndex] = useState(0);

    return (
        <div className="space-y-6">
            {plan.recommendations && (
                <Alert className="bg-primary/5 border-primary/20">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <AlertTitle className="font-headline text-primary">Recomendaciones del Entrenador</AlertTitle>
                    <AlertDescription className="text-foreground/80">
                        {plan.recommendations}
                    </AlertDescription>
                </Alert>
            )}

            {plan.weeklyPlan.length > 0 && (
                 <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 border-b pb-4">
                        {plan.weeklyPlan.map((dayPlan, index) => (
                            <Button
                                key={index}
                                type="button"
                                onClick={() => setActiveDayIndex(index)}
                                className={cn(
                                    "text-white transition-all",
                                    activeDayIndex === index 
                                        ? `${dayButtonColors[index % dayButtonColors.length]} scale-105 shadow-lg`
                                        : "bg-gray-600/50 hover:bg-gray-600"
                                )}
                            >
                                {dayPlan.day}
                            </Button>
                        ))}
                    </div>

                    {plan.weeklyPlan.map((dayPlan, index) => (
                       <div key={index} className={cn(activeDayIndex === index ? "block" : "hidden")}>
                           <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
                                <div className="flex items-center gap-4">
                                    <span className="w-40 font-bold text-lg">{dayPlan.day}</span>
                                    <span className="text-base flex-1 text-muted-foreground">{dayPlan.focus}</span>
                                </div>
                                <div className="space-y-4 pt-4">
                                    {dayPlan.exercises.map((exercise, exerciseIndex) => (
                                        <div key={exerciseIndex} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-3 rounded-lg bg-card/50">
                                            <div className="md:col-span-8 space-y-2">
                                                <p className="font-semibold text-base">{exercise.name}</p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                    <span>Series: <span className="font-medium text-foreground">{exercise.series}</span></span>
                                                    <span>Reps: <span className="font-medium text-foreground">{exercise.reps}</span></span>
                                                    <span>Descanso: <span className="font-medium text-foreground">{exercise.rest}</span></span>
                                                </div>
                                            </div>
                                            <div className="md:col-span-4 self-center">
                                                <MediaPreview url={exercise.mediaUrl} alt={`Visual de ${exercise.name}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

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
