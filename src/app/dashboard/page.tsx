

"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanGenerator } from "@/components/plan-generator"
import { Clock, Dumbbell, Youtube, Image as ImageIcon, Lightbulb, Check, Expand, Save, TrendingUp, PlusCircle, Wind, Sparkles, AlertTriangle, Calendar, PartyPopper, Info, UserCheck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { User, UserPlan, ProgressData, Exercise } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SetbackReporter } from "@/components/setback-reporter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanDownloader } from "@/components/plan-downloader";
import { motion } from "framer-motion";
import { format } from "date-fns";
import ReactConfetti from "react-confetti";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


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

const isYoutubeSearchUrl = (url: string) => {
    if (!url) return false;
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('/results');
    } catch (e) {
        return false;
    }
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
            ) : isYoutubeSearchUrl(url) ? (
                <div className="w-full h-full flex items-center justify-center bg-red-900/50">
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
    "bg-yellow-500/80 hover:bg-yellow-500 text-yellow-950",
    "bg-yellow-600/80 hover:bg-yellow-600 text-yellow-950",
    "bg-amber-500/80 hover:bg-amber-500 text-amber-950",
    "bg-amber-600/80 hover:bg-amber-600 text-amber-950",
    "bg-orange-500/80 hover:bg-orange-500 text-orange-950",
    "bg-orange-600/80 hover:bg-orange-600 text-orange-950",
]

const PlanAprobado = ({ 
    plan, 
    completedDays, 
    onToggleDay, 
    progress,
    savedProgress,
    onProgressChange, 
    onSaveChanges, 
    user,
    activeDayIndex,
    setActiveDayIndex
}: { 
    plan: UserPlan; 
    completedDays: string[]; 
    onToggleDay: (day: string) => void;
    progress: ProgressData;
    savedProgress: ProgressData;
    onProgressChange: (day: string, exerciseName: string, setIndex: number, field: 'weight' | 'reps' | 'completed', value: string | boolean) => void;
    onSaveChanges: () => void;
    user: User | null;
    activeDayIndex: number;
    setActiveDayIndex: React.Dispatch<React.SetStateAction<number>>;
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ url: string; name: string } | null>(null);
    const [extraSets, setExtraSets] = useState<Record<string, number>>({});

    const handlePreviewClick = (exercise: Exercise) => {
        if (isYoutubeSearchUrl(exercise.mediaUrl)) {
             window.open(exercise.mediaUrl, '_blank');
             return;
        }
        setSelectedMedia({ url: exercise.mediaUrl, name: exercise.name });
        setIsModalOpen(true);
    };

    const handleAddSet = (day: string, exerciseName: string) => {
        const key = `${day}-${exerciseName}`;
        setExtraSets(prev => ({
            ...prev,
            [key]: (prev[key] || 0) + 1
        }));
    }

    const activeDay = plan.weeklyPlan[activeDayIndex]?.day;
    const activeDayProgress = progress[activeDay] || {};
    
    const hasUnsavedChanges = JSON.stringify(progress) !== JSON.stringify(savedProgress);

    return (
        <>
            <div className="space-y-6">
                 {user?.planStartDate && user.planEndDate && (
                    <Card className="bg-card/70 border-primary/20 shadow-lg shadow-primary/10">
                        <CardHeader className="text-center">
                            <CardTitle className="font-headline text-2xl text-primary">Ciclo de Entrenamiento Activo</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row items-center justify-around text-center gap-4 sm:gap-0">
                            <div>
                               <p className="text-sm text-muted-foreground">Semana</p>
                               <p className="text-3xl font-bold">{user.currentWeek || 1} <span className="text-lg text-muted-foreground">/ {user.planDurationInWeeks || 4}</span></p>
                            </div>
                             <div className="h-px w-16 sm:h-16 sm:w-px bg-border"></div>
                            <div>
                               <p className="text-sm text-muted-foreground">Inicio</p>
                               <p className="font-semibold">{format(new Date(user.planStartDate), "PPP")}</p>
                            </div>
                             <div className="h-px w-16 sm:h-16 sm:w-px bg-border"></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Fin</p>
                                <p className="font-semibold">{format(new Date(user.planEndDate), "PPP")}</p>
                            </div>
                        </CardContent>
                    </Card>
                 )}
                 {plan.warmup && (
                    <Alert className="bg-blue-500/5 border-blue-500/20">
                        <Wind className="h-5 w-5 text-blue-400" />
                        <AlertTitle className="font-headline text-blue-400">Calentamiento y Activación</AlertTitle>
                        <AlertDescription className="text-foreground/80">
                            {plan.warmup}
                        </AlertDescription>
                    </Alert>
                )}
                 {plan.planJustification && (
                    <Alert className="bg-purple-500/5 border-purple-500/20">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                        <AlertTitle className="font-headline text-purple-400">¿Por qué este plan?</AlertTitle>
                        <AlertDescription className="text-foreground/80">
                            {plan.planJustification}
                        </AlertDescription>
                    </Alert>
                )}
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
                        <div className="flex flex-wrap items-center gap-2 border-b border-border/50 pb-4">
                            {plan.weeklyPlan.map((dayPlan, index) => (
                                <Button
                                    key={index}
                                    type="button"
                                    variant={activeDayIndex === index ? 'default' : 'secondary'}
                                    onClick={() => setActiveDayIndex(index)}
                                    className={cn(
                                        "transition-all",
                                        activeDayIndex === index && "scale-105",
                                        completedDays.includes(dayPlan.day) && "ring-2 ring-offset-2 ring-offset-background ring-green-400"
                                    )}
                                >
                                    {completedDays.includes(dayPlan.day) && <Check className="mr-2 h-5 w-5" />}
                                    {dayPlan.day}
                                </Button>
                            ))}
                        </div>
                        
                        <div className="pt-2">
                             {user && <PlanDownloader user={user} plan={plan} />}
                        </div>

                        {plan.weeklyPlan.map((dayPlan, index) => {
                           const isDayCompleted = completedDays.includes(dayPlan.day);
                           return (
                           <motion.div 
                              key={index} 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: activeDayIndex === index ? 1 : 0 }}
                              transition={{ duration: 0.3 }}
                              className={cn(activeDayIndex === index ? "block" : "hidden")}
                            >
                               <div className={cn("space-y-4 p-2 sm:p-4 rounded-lg bg-secondary/30", isDayCompleted && "opacity-60 pointer-events-none")}>
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex-1">
                                        <h3 className="font-bold text-lg">{dayPlan.day}</h3>
                                        <p className="text-base text-muted-foreground">{dayPlan.focus}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-8 pt-4">
                                        {(dayPlan.exercises || []).map((exercise, exerciseIndex) => {
                                            const exerciseProgress = activeDayProgress[exercise.name] || {};
                                            const numberOfSets = (parseInt(exercise.series) || 0) + (extraSets[`${dayPlan.day}-${exercise.name}`] || 0);

                                            return (
                                                <div key={exerciseIndex} className="p-2 sm:p-4 rounded-lg bg-card/50">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                                        <div className="md:col-span-2 space-y-2">
                                                            <p className="font-semibold text-lg">{exercise.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                <span className="font-medium text-primary">{exercise.series} x {exercise.reps}</span> | Descanso: {exercise.rest}
                                                            </p>
                                                            {exercise.description && (
                                                                <p className="text-xs text-muted-foreground italic pt-1">
                                                                    Músculos: {exercise.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="self-center">
                                                            <MediaPreview 
                                                                url={exercise.mediaUrl} 
                                                                alt={`Visual de ${exercise.name}`}
                                                                onPreviewClick={() => handlePreviewClick(exercise)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 overflow-x-auto">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="w-16">Serie</TableHead>
                                                                    <TableHead>Peso (kg)</TableHead>
                                                                    <TableHead>Reps Hechas</TableHead>
                                                                    <TableHead className="w-16 text-center">Hecho</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {Array.from({ length: numberOfSets }).map((_, setIndex) => {
                                                                    const setProgress = exerciseProgress[setIndex] || { weight: '', reps: '', completed: false };
                                                                    const isExtraSet = setIndex >= (parseInt(exercise.series) || 0);
                                                                    return (
                                                                        <TableRow key={setIndex}>
                                                                            <TableCell className="font-medium">{setIndex + 1} {isExtraSet && <span className="text-primary text-xs">(Extra)</span>}</TableCell>
                                                                            <TableCell>
                                                                                <Input 
                                                                                    type="number"
                                                                                    placeholder="0"
                                                                                    className="h-8 min-w-[70px]"
                                                                                    value={setProgress.weight}
                                                                                    onChange={(e) => onProgressChange(dayPlan.day, exercise.name, setIndex, 'weight', e.target.value)}
                                                                                    disabled={isDayCompleted}
                                                                                />
                                                                            </TableCell>
                                                                             <TableCell>
                                                                                <Input 
                                                                                    type="number"
                                                                                    placeholder="0"
                                                                                    className="h-8 min-w-[70px]"
                                                                                    value={setProgress.reps}
                                                                                    onChange={(e) => onProgressChange(dayPlan.day, exercise.name, setIndex, 'reps', e.target.value)}
                                                                                    disabled={isDayCompleted}
                                                                                />
                                                                            </TableCell>
                                                                             <TableCell className="text-center">
                                                                                <Checkbox 
                                                                                    checked={setProgress.completed}
                                                                                    onCheckedChange={(checked) => onProgressChange(dayPlan.day, exercise.name, setIndex, 'completed', !!checked)}
                                                                                    disabled={isDayCompleted}
                                                                                />
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                        </div>
                                                        <div className="mt-2">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                onClick={() => handleAddSet(dayPlan.day, exercise.name)}
                                                                disabled={isDayCompleted}>
                                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                                Añadir Serie
                                                            </Button>
                                                        </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6 mt-4 border-t">
                                        <Button onClick={onSaveChanges} disabled={!hasUnsavedChanges || isDayCompleted}>
                                            <Save className="mr-2 h-4 w-4" />
                                            Guardar Avances
                                        </Button>
                                        <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`complete-${dayPlan.day}`} 
                                                        checked={completedDays.includes(dayPlan.day)}
                                                        onCheckedChange={() => onToggleDay(dayPlan.day)}
                                                        disabled={hasUnsavedChanges || isDayCompleted}
                                                    />
                                                    <Label 
                                                      htmlFor={`complete-${dayPlan.day}`} 
                                                      className={cn("text-sm font-medium leading-none", (hasUnsavedChanges || isDayCompleted) ? "cursor-not-allowed text-muted-foreground" : "cursor-pointer")}
                                                    >
                                                        Marcar día como completado
                                                    </Label>
                                                </div>
                                            </TooltipTrigger>
                                            {hasUnsavedChanges && (
                                                <TooltipContent>
                                                    <p>Guarda tu progreso para poder marcar el día como completado.</p>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                            </motion.div>
                        )})}
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

const ProgressSummary = ({ totalDays, completedDays, user }: { totalDays: number; completedDays: string[]; user: User | null }) => {
    const completedDaysCount = completedDays.length;
    const progressPercentage = totalDays > 0 ? (completedDaysCount / totalDays) * 100 : 0;
    const allDaysCompleted = totalDays > 0 && completedDaysCount === totalDays;

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
                    <motion.path
                        className={cn(allDaysCompleted ? "text-green-500" : "text-primary")}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: `0, 100` }}
                        animate={{ strokeDasharray: `${progressPercentage}, 100` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-headline">{completedDaysCount}</span>
                    <span className="text-sm text-muted-foreground">de {totalDays}</span>
                </div>
            </div>
            <div>
              <p className="font-semibold">Días Completados (Semana {user?.currentWeek || 1})</p>
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
  const [user, setUser] = useState<User | null>(null);
  const [completedDays, setCompletedDays] = useState<string[]>([]);
  const [progress, setProgress] = useState<ProgressData>({});
  const [savedProgress, setSavedProgress] = useState<ProgressData>({});
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [cycleModalState, setCycleModalState] = useState<'closed' | 'week_complete' | 'cycle_complete'>('closed');
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInUserEmail = sessionStorage.getItem("loggedInUser");
      setUserEmail(loggedInUserEmail);

      const storedUsers = localStorage.getItem("registeredUsers");
      if (loggedInUserEmail && storedUsers) {
        const users: User[] = JSON.parse(storedUsers);
        const currentUser = users.find(u => u.email === loggedInUserEmail);
        if (currentUser) {
          setUser(currentUser);
          setPlanStatus(currentUser.planStatus as any);
          
          if (currentUser.planStatus === 'aprobado') {
              const storedPlan = localStorage.getItem(`userPlan_${currentUser.email}`);
              if (storedPlan) {
                  setUserPlan(JSON.parse(storedPlan));
              }
              
              const currentWeek = currentUser.currentWeek || 1;
              const storedCompletedDays = localStorage.getItem(`completedDays_week${currentWeek}_${currentUser.email}`);
              
              if (storedCompletedDays) {
                  setCompletedDays(JSON.parse(storedCompletedDays));
              } else {
                  setCompletedDays([]); 
              }

              const storedProgress = localStorage.getItem(`progress_week${currentWeek}_${currentUser.email}`);
              const initialProgress = storedProgress ? JSON.parse(storedProgress) : {};
              setProgress(initialProgress);
              setSavedProgress(initialProgress);
          }
        } else {
          setPlanStatus('sin-plan');
        }
      } else {
        setPlanStatus('sin-plan');
      }
    }
  }, [user?.currentWeek]);


  const handlePlanGenerated = (newPlan: UserPlan) => {
    if (typeof window !== 'undefined' && userEmail && user) {
        const storedUsers = localStorage.getItem("registeredUsers");
        let users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
        const currentUser = users.find(u => u.email === userEmail);
        const planDuration = currentUser?.planDurationInWeeks || 4;
        
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + (planDuration * 7));

        const updatedUser: User = {
            ...user,
            planStatus: 'aprobado',
            planStartDate: today.toISOString(),
            planEndDate: endDate.toISOString(),
            planDurationInWeeks: planDuration,
            currentWeek: 1
        };

        users = users.map(u => u.email === userEmail ? updatedUser : u);
        
        localStorage.setItem("registeredUsers", JSON.stringify(users));
        setUser(updatedUser);
        setUserPlan(newPlan);
        localStorage.setItem(`userPlan_${userEmail}`, JSON.stringify(newPlan));
        
        setPlanStatus('aprobado');
        
        const planHistoryString = localStorage.getItem(`planHistory_${userEmail}`);
        let planHistory: UserPlan[] = planHistoryString ? JSON.parse(planHistoryString) : [];
        planHistory.push(newPlan);
        if (planHistory.length > 3) {
            planHistory.shift(); 
        }
        localStorage.setItem(`planHistory_${userEmail}`, JSON.stringify(planHistory));

        for (let i = 1; i <= planDuration; i++) {
            localStorage.removeItem(`completedDays_week${i}_${userEmail}`);
            localStorage.removeItem(`progress_week${i}_${userEmail}`);
        }
        setCompletedDays([]);
        setProgress({});
        setSavedProgress({});
    }
  };

  const handleToggleDay = (day: string) => {
      if (!user || !userPlan || !userEmail) return;

      const newCompletedDays = completedDays.includes(day)
          ? completedDays.filter(d => d !== day)
          : [...completedDays, day];
      
      setCompletedDays(newCompletedDays);
      const currentWeek = user.currentWeek || 1;
      localStorage.setItem(`completedDays_week${currentWeek}_${userEmail}`, JSON.stringify(newCompletedDays));

      const allDaysInPlan = userPlan.weeklyPlan.map(d => d.day);
      const isWeekComplete = allDaysInPlan.length > 0 && allDaysInPlan.every(d => newCompletedDays.includes(d));

      if (isWeekComplete) {
           const currentWeek = user.currentWeek || 1;
           const totalWeeks = user.planDurationInWeeks || 4;
           if (currentWeek < totalWeeks) {
               setCycleModalState('week_complete');
           } else {
               setConfetti(true);
               setCycleModalState('cycle_complete');
           }
           window.scrollTo(0, 0);
      }
  }

  const handleAdvanceToNextWeek = () => {
      if (!user || !userEmail) return;

      const currentWeek = user.currentWeek || 1;
      const nextWeek = currentWeek + 1;
      const updatedUser = { ...user, currentWeek: nextWeek };

      const storedUsers = localStorage.getItem("registeredUsers");
      let users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      users = users.map(u => u.email === user.email ? updatedUser : u);
      localStorage.setItem("registeredUsers", JSON.stringify(users));
      setUser(updatedUser);

      setCompletedDays([]);
      setProgress({});
      setSavedProgress({});
      setActiveDayIndex(0);
      
      setCycleModalState('closed');
      window.scrollTo(0, 0);
  }

  const handleFinishCycle = () => {
    if (!user || !userEmail || !userPlan) return;

    localStorage.setItem(`lastCompletedPlan_${userEmail}`, JSON.stringify(userPlan));
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    localStorage.setItem(`progressExpiration_${userEmail}`, expirationDate.toISOString());

    const storedUsers = localStorage.getItem("registeredUsers");
    let users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
    
    const updatedUser: User = {
      ...user,
      planStatus: 'sin-plan',
      customPlanRequest: 'none',
      currentWeek: undefined,
      planStartDate: undefined,
      planEndDate: undefined,
      planDurationInWeeks: undefined,
    };
    
    users = users.map(u => u.email === user.email ? updatedUser : u);
    localStorage.setItem("registeredUsers", JSON.stringify(users));

    localStorage.removeItem(`userPlan_${userEmail}`);

    setUser(updatedUser);
    setUserPlan(null);
    setPlanStatus('sin-plan');
    setCompletedDays([]);
    setProgress({});
    setSavedProgress({});
    setActiveDayIndex(0);
    
    setCycleModalState('closed');
  }

  const handleProgressChange = (day: string, exerciseName: string, setIndex: number, field: 'weight' | 'reps' | 'completed', value: string | boolean) => {
    setProgress(prev => {
        const newProgress = JSON.parse(JSON.stringify(prev)); // Deep copy
        if (!newProgress[day]) {
            newProgress[day] = {};
        }
        if (!newProgress[day][exerciseName]) {
            newProgress[day][exerciseName] = {};
        }
        if (!newProgress[day][exerciseName][setIndex]) {
            newProgress[day][exerciseName][setIndex] = { weight: '', reps: '', completed: false };
        }
        (newProgress[day][exerciseName][setIndex] as any)[field] = value;
        return newProgress;
    });
  };

  const handleSaveChanges = () => {
    if (userEmail && user) {
        const currentWeek = user.currentWeek || 1;
        localStorage.setItem(`progress_week${currentWeek}_${userEmail}`, JSON.stringify(progress));
        setSavedProgress(progress);
        toast({
            title: "¡Progreso Guardado!",
            description: "Tus avances han sido registrados correctamente.",
        });
    }
  };

    const handleRequestCustomPlan = () => {
        if (!user || !userEmail) return;

        const onboardingDataString = localStorage.getItem(`onboardingData_${user.email}`);
        if (!onboardingDataString) {
            toast({
                variant: "destructive",
                title: "Faltan datos",
                description: "Por favor, completa tus datos de registro primero para solicitar un plan personalizado.",
            });
            // Optionally, redirect to a form if you want them to fill it now.
            // router.push('/onboarding');
            return;
        }

        const storedUsers = localStorage.getItem("registeredUsers");
        let users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
        const updatedUser: User = { ...user, customPlanRequest: 'requested' };
        
        users = users.map(u => u.email === user.email ? updatedUser : u);
        localStorage.setItem("registeredUsers", JSON.stringify(users));
        setUser(updatedUser);

        toast({
            title: "¡Solicitud Enviada!",
            description: "Un entrenador revisará tu perfil y se pondrá en contacto contigo pronto.",
        });
    };

  const isPlanActive = planStatus === 'aprobado' || planStatus === 'pendiente';

  const renderPlanContent = () => {
    if (planStatus === null) {
        return <p>Cargando estado del plan...</p>; // Or a skeleton loader
    }
    switch(planStatus) {
      case 'aprobado':
        return userPlan ? <PlanAprobado 
            plan={userPlan} 
            user={user} 
            completedDays={completedDays} 
            onToggleDay={handleToggleDay} 
            progress={progress}
            savedProgress={savedProgress}
            onProgressChange={handleProgressChange} 
            onSaveChanges={handleSaveChanges} 
            activeDayIndex={activeDayIndex}
            setActiveDayIndex={setActiveDayIndex}
        /> : <p>Cargando plan...</p>;
      case 'pendiente':
        return <PlanPendiente />;
      case 'sin-plan':
        return <SinPlan />;
      default:
        return <SinPlan />;
    }
  }

  const handleCycleModalChange = (isOpen: boolean) => {
      if (!isOpen) {
          setCycleModalState('closed');
          setConfetti(false);
      }
  }

  return (
    <>
    {confetti && <ReactConfetti recycle={false} onConfettiComplete={() => setConfetti(false)} />}
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-4">
        {user ? (
          <h1 className="text-2xl md:text-3xl font-bold font-headline">
            Bienvenido, <span className="text-primary">{user.firstName}</span>
          </h1>
        ) : (
          <Skeleton className="h-9 w-64" />
        )}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <PlanGenerator onPlanGenerated={handlePlanGenerated} disabled={isPlanActive} />

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg"
                        disabled={user?.customPlanRequest === 'requested'}
                    >
                        <UserCheck className="mr-2 h-4 w-4" />
                        {user?.customPlanRequest === 'requested' ? "Solicitud Enviada" : "Solicitar Plan Personalizado"}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Confirmar Solicitud de Plan Personalizado?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esto notificará a un entrenador para que revise tu perfil y cree una rutina a tu medida. 
                        Este proceso puede tardar de 1 a 2 días hábiles.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRequestCustomPlan}>Sí, solicitar plan</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <Button 
                asChild 
                className="bg-gradient-to-r from-red-600 to-black text-white hover:from-red-700 hover:to-gray-800 shadow-lg"
                disabled={isPlanActive}
            >
                <Link href="/dashboard/create-plan">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear mi propia rutina
                </Link>
            </Button>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="plan" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="plan">Tu Plan Semanal</TabsTrigger>
                <TabsTrigger value="progress">Resumen de Progreso</TabsTrigger>
            </TabsList>
            <TabsContent value="plan">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Tu Plan de Entrenamiento</CardTitle>
                        <CardDescription>
                            {planStatus === 'aprobado' 
                                ? `Este es tu horario de entrenamiento para la semana.`
                                : "Tu plan de entrenamiento aparecerá aquí una vez que esté listo."
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 md:px-6">
                        {renderPlanContent()}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="progress">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Tu Progreso</CardTitle>
                        <CardDescription>
                            Visualiza tus logros y mantente motivado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {planStatus === 'aprobado' && userPlan ? (
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="h-[400px] flex items-center justify-center">
                                    <ProgressSummary 
                                        totalDays={userPlan.weeklyPlan.length} 
                                        completedDays={completedDays}
                                        user={user}
                                    />
                                </div>
                                <div className="md:col-span-1 flex flex-col items-center justify-center p-8 text-center bg-secondary/50 rounded-lg">
                                    <h3 className="text-xl font-semibold">Analiza tu Rendimiento</h3>
                                    <p className="text-muted-foreground mt-2 mb-4 max-w-md">
                                        Explora gráficos detallados y descubre tus récords personales para optimizar tu entrenamiento.
                                    </p>
                                    <Button asChild>
                                        <Link href="/dashboard/progress">
                                            <TrendingUp className="mr-2 h-5 w-5" />
                                            Ver mi Progreso Detallado
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <p className="text-muted-foreground">Tu progreso aparecerá aquí una vez que empieces a entrenar.</p>
                                <Button asChild className="mt-4">
                                     <Link href="/dashboard/progress">
                                        <TrendingUp className="mr-2 h-5 w-5" />
                                        Ver Historial de Progreso
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>

     <Dialog open={cycleModalState !== 'closed'} onOpenChange={handleCycleModalChange}>
        <DialogContent>
            {cycleModalState === 'week_complete' && user && (
                <>
                    <DialogHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <PartyPopper className="h-16 w-16 text-primary p-2 rounded-full bg-primary/20" />
                        </div>
                        <DialogTitle className="text-2xl font-headline">¡Semana {user.currentWeek} Completada!</DialogTitle>
                    </DialogHeader>
                    <div className="text-center text-muted-foreground py-4 space-y-4">
                        <p>¡Excelente trabajo! Has demostrado una gran disciplina. Prepárate para el siguiente desafío.</p>
                    </div>
                    <div className="flex justify-center">
                        <Button onClick={handleAdvanceToNextWeek}>Empezar Semana { (user.currentWeek || 0) + 1}</Button>
                    </div>
                </>
            )}
             {cycleModalState === 'cycle_complete' && (
                 <AlertDialog>
                    <DialogHeader className="text-center px-2 py-4 sm:p-6">
                        <motion.div 
                            className="flex justify-center mb-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: 0.2
                            }}
                        >
                            <Check className="h-12 w-12 sm:h-16 sm:w-16 bg-green-500/20 text-green-500 p-2 rounded-full" />
                        </motion.div>
                        <DialogTitle className="text-xl sm:text-2xl font-headline">¡Has Logrado Completar tus {user?.planDurationInWeeks || 4} Semanas!</DialogTitle>
                    </DialogHeader>
                    <div className="text-center text-muted-foreground px-2 pb-4 sm:px-6 sm:pb-6 space-y-3">
                        <p className="text-sm sm:text-base">Estamos orgullosos de tu esfuerzo y dedicación. Has demostrado una constancia increíble.</p>
                        <blockquote className="text-sm italic border-l-2 border-primary pl-3 text-left">
                            "La disciplina es el puente entre las metas y los logros."
                        </blockquote>
                    </div>
                    <div className="flex justify-center px-2 pb-2 sm:px-6 sm:pb-4">
                        <AlertDialogTrigger asChild>
                            <Button>¡A por el siguiente reto!</Button>
                        </AlertDialogTrigger>
                    </div>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás listo para finalizar?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción archivará tu plan actual y te permitirá generar uno nuevo. Tu progreso será guardado en tu historial.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleFinishCycle}>
                                Sí, finalizar ciclo
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
             )}
        </DialogContent>
    </Dialog>
    </>
  )
}
