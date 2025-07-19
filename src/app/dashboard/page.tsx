
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanGenerator } from "@/components/plan-generator"
import { Clock, Dumbbell, Youtube, Image as ImageIcon, Lightbulb, Check, Expand } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { User, UserPlan, Exercise } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SetbackReporter } from "@/components/setback-reporter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const isVideo = (url: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov'];
    const lowercasedUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowercasedUrl.includes(ext));
};

const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

const MediaDisplay = ({ url, alt }: { url: string, alt: string }) => {
    if (!url) {
        return (
            <div className="w-full h-full bg-secondary rounded-md flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
            </div>
        )
    };
    
    const youtubeId = getYoutubeVideoId(url);
    if (youtubeId) {
        return (
            <div className="aspect-video w-full">
                <iframe
                    className="w-full h-full rounded-md"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        )
    }

    if (isVideo(url)) {
        return <video src={url} controls className="w-full max-h-[80vh] rounded-md" />
    }

    return <Image src={url} alt={alt} width={800} height={600} className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-md" data-ai-hint="fitness exercise"/>
};


const MediaPreview = ({ url, alt, onPreviewClick }: { url: string, alt: string, onPreviewClick: () => void }) => {
    if (!url) {
        return (
            <div className="w-full h-32 bg-secondary rounded-md flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
        )
    };
    
    const youtubeId = getYoutubeVideoId(url);

    return (
        <div onClick={onPreviewClick} className="relative group w-full h-32 bg-secondary rounded-md flex items-center justify-center cursor-pointer overflow-hidden">
            {youtubeId ? (
                <Image 
                    src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`} 
                    alt={alt} 
                    fill 
                    className="object-cover" 
                    data-ai-hint="fitness exercise"
                />
            ) : isVideo(url) ? (
                <div className="w-full h-full flex items-center justify-center bg-black">
                    <Youtube className="h-10 w-10 text-white" />
                </div>
            ) : (
                <Image src={url} alt={alt} fill className="object-cover" data-ai-hint="fitness exercise"/>
            )}
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Expand className="h-8 w-8 text-white" />
            </div>
        </div>
    )
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

const PlanAprobado = ({ plan, completedDays, onToggleDay }: { plan: UserPlan; completedDays: string[]; onToggleDay: (day: string) => void; }) => {
    const [activeDayIndex, setActiveDayIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ url: string; name: string } | null>(null);

    const handlePreviewClick = (exercise: Exercise) => {
        setSelectedMedia({ url: exercise.mediaUrl, name: exercise.name });
        setIsModalOpen(true);
    };


    return (
        <>
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
                                            : "bg-gray-600/50 hover:bg-gray-600",
                                         completedDays.includes(dayPlan.day) && "ring-2 ring-offset-2 ring-offset-background ring-green-400"
                                    )}
                                >
                                    {completedDays.includes(dayPlan.day) && <Check className="mr-2 h-5 w-5" />}
                                    {dayPlan.day}
                                </Button>
                            ))}
                        </div>

                        {plan.weeklyPlan.map((dayPlan, index) => (
                           <div key={index} className={cn(activeDayIndex === index ? "block" : "hidden")}>
                               <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex-1">
                                        <h3 className="font-bold text-lg">{dayPlan.day}</h3>
                                        <p className="text-base text-muted-foreground">{dayPlan.focus}</p>
                                      </div>
                                      <div className="flex items-center space-x-2 bg-card p-3 rounded-lg">
                                        <Checkbox 
                                          id={`complete-${dayPlan.day}`} 
                                          checked={completedDays.includes(dayPlan.day)}
                                          onCheckedChange={() => onToggleDay(dayPlan.day)}
                                        />
                                        <Label htmlFor={`complete-${dayPlan.day}`} className="text-sm font-medium leading-none cursor-pointer">
                                          Marcar como completado
                                        </Label>
                                      </div>
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
                                                    <MediaPreview 
                                                        url={exercise.mediaUrl} 
                                                        alt={`Visual de ${exercise.name}`}
                                                        onPreviewClick={() => handlePreviewClick(exercise)}
                                                    />
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

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{selectedMedia?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center items-center py-4">
                        {selectedMedia && <MediaDisplay url={selectedMedia.url} alt={selectedMedia.name} />}
                    </div>
                </DialogContent>
            </Dialog>
        </>
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

const ProgressSummary = ({ totalDays, completedDays }: { totalDays: number; completedDays: number; }) => {
    const progressPercentage = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
    const allDaysCompleted = totalDays > 0 && completedDays === totalDays;

    return (
        <div className="flex flex-col items-center justify-between h-full p-6 text-center space-y-4">
            <div className="relative h-40 w-40">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                    <path
                        className="text-secondary"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    <path
                        className={cn(allDaysCompleted ? "text-green-500" : "text-primary")}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${progressPercentage}, 100`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-headline">{completedDays}</span>
                    <span className="text-sm text-muted-foreground">de {totalDays}</span>
                </div>
            </div>
            <div>
              <p className="font-semibold">Días Completados</p>
              <p className="text-xs text-muted-foreground mt-1">
                  {allDaysCompleted ? "¡Felicidades, completaste la semana!" : "¡Sigue así para alcanzar tus metas!"}
              </p>
            </div>
            
            {!allDaysCompleted && totalDays > 0 && (
                <SetbackReporter />
            )}
        </div>
    );
};


export default function DashboardPage() {
  const [planStatus, setPlanStatus] = useState<'aprobado' | 'pendiente' | 'sin-plan' | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [completedDays, setCompletedDays] = useState<string[]>([]);

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
              const storedCompletedDays = localStorage.getItem(`completedDays_${currentUser.email}`);
              if(storedCompletedDays) {
                  setCompletedDays(JSON.parse(storedCompletedDays));
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
        // Reset progress when a new plan is generated
        localStorage.removeItem(`completedDays_${loggedInUserEmail}`);
        setCompletedDays([]);
      }
    }
  };

  const handleToggleDay = (day: string) => {
      const newCompletedDays = completedDays.includes(day)
          ? completedDays.filter(d => d !== day)
          : [...completedDays, day];
      setCompletedDays(newCompletedDays);
      const loggedInUserEmail = sessionStorage.getItem("loggedInUser");
      if (loggedInUserEmail) {
          localStorage.setItem(`completedDays_${loggedInUserEmail}`, JSON.stringify(newCompletedDays));
      }
  }


  const renderPlanContent = () => {
    if (planStatus === null) {
        return <p>Cargando estado del plan...</p>; // Or a skeleton loader
    }
    switch(planStatus) {
      case 'aprobado':
        return userPlan ? <PlanAprobado plan={userPlan} completedDays={completedDays} onToggleDay={handleToggleDay} /> : <p>Cargando plan...</p>;
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
        {planStatus !== 'pendiente' && (
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
          <CardContent className="h-[calc(100%_-_4rem)]">
              {planStatus === 'aprobado' && userPlan ? (
                <ProgressSummary 
                    totalDays={userPlan.weeklyPlan.length} 
                    completedDays={completedDays.length}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-muted-foreground">Tu progreso aparecerá aquí una vez que empieces a entrenar.</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

    