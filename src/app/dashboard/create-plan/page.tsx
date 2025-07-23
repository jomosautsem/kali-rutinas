
"use client"

import { useState } from "react";
import { useForm, useFieldArray, FormProvider, useFormContext } from "react-hook-form";
import type { UserPlan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const dayButtonColors = [
    "bg-blue-500/80 hover:bg-blue-500 text-blue-950",
    "bg-teal-500/80 hover:bg-teal-500 text-teal-950",
    "bg-cyan-500/80 hover:bg-cyan-500 text-cyan-950",
    "bg-sky-500/80 hover:bg-sky-500 text-sky-950",
    "bg-indigo-500/80 hover:bg-indigo-500 text-indigo-950",
]

function ExercisesFieldArray({ dayIndex }: { dayIndex: number; }) {
    const { control, register } = useFormContext<UserPlan>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: `weeklyPlan.${dayIndex}.exercises`
    });

    return (
        <div className="space-y-3 pt-4">
            {fields.map((field, exerciseIndex) => (
                <div key={field.id} className="flex items-center gap-2 p-3 rounded-lg bg-card/80">
                    <Input {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.name`)} placeholder="Nombre del Ejercicio" className="flex-grow"/>
                    <Input {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.series`)} placeholder="Series" className="w-20" />
                    <Input {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.reps`)} placeholder="Reps" className="w-24" />
                    <Input {...register(`weeklyPlan.${dayIndex}.exercises.${exerciseIndex}.rest`)} placeholder="Descanso" className="w-24" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(exerciseIndex)} className="text-muted-foreground hover:text-destructive shrink-0">
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                </div>
            ))}
             <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", series: "", reps: "", rest: "", mediaUrl: "" })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Ejercicio
            </Button>
        </div>
    )
}


export default function CreatePlanPage() {
    const [activeDayIndex, setActiveDayIndex] = useState(0);
    const { toast } = useToast();
    const router = useRouter();

    const formMethods = useForm<UserPlan>({
        defaultValues: {
            planJustification: "Plan personalizado creado por el usuario.",
            warmup: "5-10 minutos de cardio ligero y movilidad articular.",
            recommendations: "Mantente hidratado y enfócate en la técnica.",
            weeklyPlan: [{ day: "Día 1", focus: "", exercises: [] }]
        }
    });

    const { control, watch, handleSubmit } = formMethods;
    const { fields, append, remove } = useFieldArray({ control, name: "weeklyPlan" });

    const weeklyPlanValues = watch("weeklyPlan");

    const removeDay = (index: number) => {
        remove(index);
        setActiveDayIndex(prev => Math.max(0, prev - 1));
    }
    
    const onSubmit = (data: UserPlan) => {
        const email = sessionStorage.getItem("loggedInUser");
        if (!email) {
            toast({ variant: "destructive", title: "Error de Sesión" });
            router.push('/login');
            return;
        }
        
        const storedUsers = localStorage.getItem("registeredUsers");
        let users = storedUsers ? JSON.parse(storedUsers) : [];
        const today = new Date();
        const endDate = new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000);
        
        users = users.map((u: any) => u.email === email ? {
            ...u, 
            planStatus: 'aprobado',
            planStartDate: today.toISOString(),
            planEndDate: endDate.toISOString(),
            currentWeek: 1
        } : u);
        
        localStorage.setItem("registeredUsers", JSON.stringify(users));
        localStorage.setItem(`userPlan_${email}`, JSON.stringify(data));
        
        toast({ title: "¡Plan Guardado!", description: "Tu rutina personalizada está lista en tu panel." });
        router.push("/dashboard");
    }

    return (
        <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Crea tu Propia Rutina</CardTitle>
                        <CardDescription>Diseña tu plan de entrenamiento perfecto día por día. Añade los ejercicios que quieras con tus series, repeticiones y descansos.</CardDescription>
                    </CardHeader>
                </Card>

                 {fields.length > 0 && (
                    <Card>
                        <CardContent className="p-6">
                             <div className="flex flex-wrap items-center gap-2 border-b pb-4">
                                {fields.map((field, index) => (
                                    <Button
                                        key={field.id}
                                        type="button"
                                        onClick={() => setActiveDayIndex(index)}
                                        className={cn(
                                            "transition-all",
                                            activeDayIndex === index 
                                                ? `${dayButtonColors[index % dayButtonColors.length]} scale-105 shadow-lg`
                                                : "bg-gray-600/50 hover:bg-gray-600 text-white"
                                        )}
                                    >
                                        {weeklyPlanValues?.[index]?.day || `Día ${index + 1}`}
                                    </Button>
                                ))}
                                <Button type="button" variant="outline" onClick={() => append({ day: `Día ${fields.length + 1}`, focus: "", exercises: [] })} className="ml-auto">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Añadir Día
                                </Button>
                            </div>

                            <div className="mt-4">
                                {fields.map((field, index) => (
                                <div key={field.id} className={cn("space-y-4", activeDayIndex === index ? "block" : "hidden")}>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-grow space-y-2">
                                            <Label htmlFor={`day-name-${index}`}>Nombre del Día</Label>
                                            <Input id={`day-name-${index}`} {...formMethods.register(`weeklyPlan.${index}.day`)} placeholder="Ej: Lunes - Pecho y Tríceps"/>
                                        </div>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeDay(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <ExercisesFieldArray dayIndex={index} />
                                </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                 )}

                 <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>Cancelar</Button>
                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Guardar y Activar Rutina
                    </Button>
                 </div>
            </form>
        </FormProvider>
    )
}
