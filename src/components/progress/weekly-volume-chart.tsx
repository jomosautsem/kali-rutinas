
"use client"

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { UserPlan, ProgressData } from "@/lib/types";
import { calculateWeeklyVolume } from "@/lib/progress-utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

type WeeklyVolumeChartProps = {
  plan: UserPlan;
  allProgress: ProgressData[];
};

export function WeeklyVolumeChart({ plan, allProgress }: WeeklyVolumeChartProps) {
  const chartData = useMemo(() => {
    return allProgress.map((weeklyProgress, index) => ({
        name: `Sem ${index + 1}`,
        ...calculateWeeklyVolume(plan, weeklyProgress)
    }));
  }, [plan, allProgress]);

  const hasData = useMemo(() => chartData.some(week => Object.values(week).some(val => typeof val === 'number' && val > 0)), [chartData]);
  
  const days = plan.weeklyPlan.map(d => d.day.substring(0,3));
  const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];


  return (
    <Card>
      <CardHeader>
        <CardTitle>Volumen Semanal Total</CardTitle>
        <CardDescription>
          Visualización del volumen de entrenamiento total (peso x reps) completado por día a lo largo de las semanas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-blue-900/10 border-blue-500/20">
            <Info className="h-5 w-5 text-blue-400" />
            <AlertTitle className="font-headline text-blue-300">¿Qué es el Volumen de Entrenamiento?</AlertTitle>
            <AlertDescription className="text-foreground/80">
                Esta métrica representa el trabajo total que has realizado. Se calcula multiplicando
                <span className="font-semibold text-primary/80"> (Peso x Repeticiones x Series) </span> 
                para cada ejercicio. ¡Es normal ver números altos! Un mayor volumen a lo largo del tiempo indica que estás progresando.
            </AlertDescription>
        </Alert>

        {hasData ? (
            <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value} kg`}
                />
                <Tooltip
                    cursor={{ fill: 'hsla(var(--muted))' }}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend />
                 {days.map((day, i) => (
                    <Bar key={day} dataKey={day} stackId="a" fill={colors[i % colors.length]} name={day} radius={[4, 4, 0, 0]} />
                 ))}
                </BarChart>
            </ResponsiveContainer>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-[300px]">
                <AlertCircle className="h-10 w-10 mb-4" />
                <p className="font-semibold">Sin Datos de Volumen</p>
                <p className="text-sm">Completa un día de entrenamiento y guarda tus avances para ver el volumen aquí.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}


    