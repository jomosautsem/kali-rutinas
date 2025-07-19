
"use client"

import { useState, useMemo } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { UserPlan, ProgressData } from "@/lib/types";
import { getExerciseHistory } from "@/lib/progress-utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

type ExerciseProgressChartProps = {
  plan: UserPlan;
  progress: ProgressData;
};

export function ExerciseProgressChart({ plan, progress }: ExerciseProgressChartProps) {
  const allExercises = useMemo(() => {
    const exerciseSet = new Set<string>();
    plan.weeklyPlan.forEach(day => {
      day.exercises.forEach(ex => exerciseSet.add(ex.name));
    });
    return Array.from(exerciseSet);
  }, [plan]);

  const [selectedExercise, setSelectedExercise] = useState<string>(allExercises[0] || "");

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];
    return getExerciseHistory(selectedExercise, progress);
  }, [selectedExercise, progress]);

  if (allExercises.length === 0) {
    return null; // Don't render if there are no exercises in the plan
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresión por Ejercicio</CardTitle>
        <CardDescription>
          Selecciona un ejercicio para ver la evolución del peso máximo levantado (para 1 repetición o más) a lo largo del tiempo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Select onValueChange={setSelectedExercise} defaultValue={selectedExercise}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Selecciona un ejercicio..." />
            </SelectTrigger>
            <SelectContent>
              {allExercises.map(ex => (
                <SelectItem key={ex} value={ex}>{ex}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {chartData.length > 1 ? (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="date" 
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
                    domain={['dataMin - 5', 'dataMax + 5']}
                    tickFormatter={(value) => `${value} kg`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend />
                <Line 
                    type="monotone" 
                    dataKey="maxWeight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Peso Máx."
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-[300px]">
            <AlertCircle className="h-10 w-10 mb-4" />
            <p className="font-semibold">Datos Insuficientes</p>
            <p className="text-sm">Necesitas registrar al menos dos sesiones de este ejercicio para ver la progresión.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
