
"use client"

import { useState, useEffect } from "react";
import type { User, UserPlan, ProgressData } from "@/lib/types";
import { WeeklyVolumeChart } from "@/components/progress/weekly-volume-chart";
import { ExerciseProgressChart } from "@/components/progress/exercise-progress-chart";
import { PersonalRecords } from "@/components/progress/personal-records";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProgressPage() {
    const [user, setUser] = useState<User | null>(null);
    const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
    const [progressData, setProgressData] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const loggedInUserEmail = sessionStorage.getItem("loggedInUser");
            if (loggedInUserEmail) {
                const storedUsers = localStorage.getItem("registeredUsers");
                const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
                const currentUser = users.find(u => u.email === loggedInUserEmail);
                setUser(currentUser || null);

                const storedPlan = localStorage.getItem(`userPlan_${loggedInUserEmail}`);
                setUserPlan(storedPlan ? JSON.parse(storedPlan) : null);

                const storedProgress = localStorage.getItem(`progress_${loggedInUserEmail}`);
                setProgressData(storedProgress ? JSON.parse(storedProgress) : null);
            }
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-9 w-64" />
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
    
    if (!userPlan || !progressData) {
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
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Tu Progreso General</h1>
                <p className="text-muted-foreground">Analiza tus datos para seguir mejorando.</p>
            </div>

            <PersonalRecords plan={userPlan} progress={progressData} />

            <WeeklyVolumeChart plan={userPlan} progress={progressData} />

            <ExerciseProgressChart plan={userPlan} progress={progressData} />
            
        </div>
    )
}
