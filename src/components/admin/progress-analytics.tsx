
"use client"

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { User, UserPlan, ProgressData } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp } from "lucide-react";

type ProgressAnalyticsProps = {
    user: User | null;
    data: { progress: ProgressData, plan: UserPlan } | null;
    isOpen: boolean;
    onClose: () => void;
};

const chartConfig = {
  volume: {
    label: "Volumen (kg)",
    color: "hsl(var(--primary))",
  },
}

export function ProgressAnalytics({ user, data, isOpen, onClose }: ProgressAnalyticsProps) {
    const chartData = useMemo(() => {
        if (!data || !data.progress || !data.plan) return [];

        const { progress, plan } = data;

        return plan.weeklyPlan.map(dayPlan => {
            const dayProgress = progress[dayPlan.day];
            let totalVolume = 0;

            if (dayProgress) {
                Object.values(dayProgress).forEach(exerciseProgress => {
                    Object.values(exerciseProgress).forEach(setProgress => {
                        if (setProgress.completed) {
                            const weight = parseFloat(setProgress.weight) || 0;
                            const reps = parseInt(setProgress.reps, 10) || 0;
                            totalVolume += weight * reps;
                        }
                    });
                });
            }

            return {
                day: dayPlan.day.substring(0, 3), // Abbreviate day name
                volume: totalVolume,
            };
        });
    }, [data]);
    
    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="font-headline flex items-center gap-2">
                        <TrendingUp className="h-6 w-6" />
                        Progreso de {user.name}
                    </DialogTitle>
                    <DialogDescription>
                        Visualización del volumen de entrenamiento semanal completado.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {data && chartData.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Volumen Total por Día</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis 
                                                dataKey="day" 
                                                stroke="#888888" 
                                                fontSize={12} 
                                                tickLine={false} 
                                                axisLine={false}
                                            />
                                            <YAxis 
                                                stroke="#888888" 
                                                fontSize={12} 
                                                tickLine={false} 
                                                axisLine={false} 
                                                tickFormatter={(value) => `${value} kg`}
                                            />
                                            <Tooltip 
                                                cursor={{fill: 'hsla(var(--muted))'}}
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--background))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: 'var(--radius)'
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="volume" fill="hsl(var(--primary))" name="Volumen (kg)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-[300px]">
                            <AlertCircle className="h-10 w-10 mb-4" />
                            <p className="font-semibold">Sin Datos de Progreso</p>
                            <p className="text-sm">El usuario aún no ha registrado ningún progreso o no tiene un plan aprobado.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
