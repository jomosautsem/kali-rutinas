
"use client"

import { useMemo } from "react";
import type { UserPlan, ProgressData } from "@/lib/types";
import { calculatePersonalRecords } from "@/lib/progress-utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

type PersonalRecordsProps = {
  plan: UserPlan;
  progress: ProgressData;
};

export function PersonalRecords({ plan, progress }: PersonalRecordsProps) {
  const records = useMemo(() => {
    return calculatePersonalRecords(plan, progress);
  }, [plan, progress]);

  return (
    <div>
        <h2 className="text-2xl font-semibold font-headline mb-4">Récords Personales (1RM Estimado)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(records).map(([exercise, record]) => (
            <Card key={exercise} className="bg-gradient-to-br from-card to-secondary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{exercise}</CardTitle>
                <Trophy className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">
                    {record.oneRm.toFixed(1)} kg
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Basado en {record.reps} reps con {record.weight} kg
                </p>
            </CardContent>
            </Card>
        ))}
        {Object.keys(records).length === 0 && (
            <p className="text-muted-foreground md:col-span-3 text-sm">
                Aún no hay suficientes datos para calcular tus récords personales. ¡Sigue entrenando!
            </p>
        )}
        </div>
    </div>
  );
}
