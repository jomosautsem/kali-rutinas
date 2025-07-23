
"use client"

import { useState, useEffect } from "react";
import type { User, UserPlan, ProgressData } from "@/lib/types";
import { WeeklyVolumeChart } from "@/components/progress/weekly-volume-chart";
import { ExerciseProgressChart } from "@/components/progress/exercise-progress-chart";
import { PersonalRecords } from "@/components/progress/personal-records";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, ArrowLeft, Trophy, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProgressPage() {
    const [user, setUser] = useState<User | null>(null);
    const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
    const [allProgressData, setAllProgressData] = useState<ProgressData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const loggedInUserEmail = sessionStorage.getItem("loggedInUser");
            if (loggedInUserEmail) {
                const storedUsers = localStorage.getItem("registeredUsers");
                const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
                const currentUser = users.find(u => u.email === loggedInUserEmail);
                setUser(currentUser || null);

                // Try to load an active plan first
                let planToUse: UserPlan | null = null;
                const activePlanString = localStorage.getItem(`userPlan_${loggedInUserEmail}`);
                if (activePlanString) {
                    planToUse = JSON.parse(activePlanString);
                } else {
                    // If no active plan, check for a recently completed plan
                    const lastPlanString = localStorage.getItem(`lastCompletedPlan_${loggedInUserEmail}`);
                    if (lastPlanString) {
                        planToUse = JSON.parse(lastPlanString);
                    }
                }
                setUserPlan(planToUse);
                
                const progressHistory: ProgressData[] = [];
                for (let i = 1; i <= 4; i++) {
                    const storedProgress = localStorage.getItem(`progress_week${i}_${loggedInUserEmail}`);
                    if (storedProgress) {
                        try {
                           progressHistory.push(JSON.parse(storedProgress));
                        } catch (e) {
                            console.error(`Failed to parse progress for week ${i}`, e);
                        }
                    }
                }
                setAllProgressData(progressHistory);
            }
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-10 w-36" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                   <Skeleton className="h-40 rounded-lg" />
                   <Skeleton className="h-40 rounded-lg" />
                   <Skeleton className="h-40 rounded-lg" />
                </div>
                 <Skeleton className="h-96 rounded-lg" />
                 <Skeleton className="h-96 rounded-lg" />
            </div>
        );
    }
    
    if (allProgressData.length === 0) {
        return (
             <Alert>
                <BarChart className="h-4 w-4" />
                <AlertTitle>No hay datos de progreso</AlertTitle>
                <AlertDescription>
                   Aún no has registrado ningún entrenamiento. Una vez que completes una sesión y guardes tus avances, tus estadísticas aparecerán aquí.
                   <Button asChild variant="link" className="px-1">
                        <Link href="/dashboard">Volver a mi plan</Link>
                   </Button>
                </AlertDescription>
            </Alert>
        )
    }

    // A mock plan for structure if no active plan exists but progress data does
    const planForAnalysis: UserPlan = userPlan || {
        warmup: "",
        recommendations: "",
        weeklyPlan: allProgressData.flatMap((weekProgress) =>
            Object.keys(weekProgress).map(day => ({
                day: day,
                focus: "Análisis de Progreso",
                exercises: Object.keys(weekProgress[day]).map(ex => ({
                    name: ex,
                    series: '',
                    reps: '',
                    rest: '',
                    mediaUrl: '',
                })),
            }))
        ),
    };

    const combinedProgress = allProgressData.reduce((acc, current, weekIndex) => {
        for (const day in current) {
            const dateKey = `W${weekIndex + 1} ${day.substring(0, 3)}`;
            if (!acc[dateKey]) acc[dateKey] = {};
            for (const exercise in current[day]) {
                if (!acc[dateKey][exercise]) acc[dateKey][exercise] = {};
                Object.assign(acc[dateKey][exercise], current[day][exercise]);
            }
        }
        return acc;
    }, {} as ProgressData);
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Tu Progreso General</h1>
                    <p className="text-muted-foreground">Analiza tus datos para seguir mejorando.</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Panel
                    </Link>
                </Button>
            </div>
            
             <Alert className="bg-amber-900/10 border-amber-500/20">
                <Trophy className="h-5 w-5 text-amber-400" />
                <AlertTitle className="font-headline text-amber-300">¿Qué es el 1RM Estimado?</AlertTitle>
                <AlertDescription className="text-foreground/80">
                   El "1RM" o "Máximo de una Repetición" es el peso máximo que teóricamente podrías levantar una sola vez. Usamos una fórmula estándar (Epley) para estimar este valor basado en el peso y las repeticiones que registras. ¡Es una excelente manera de medir tu aumento de fuerza máxima!
                </AlertDescription>
            </Alert>


            <PersonalRecords plan={planForAnalysis} progress={combinedProgress} />

            <WeeklyVolumeChart plan={planForAnalysis} allProgress={allProgressData} />

            <ExerciseProgressChart plan={planForAnalysis} progress={combinedProgress} />
            
        </div>
    )
}

    