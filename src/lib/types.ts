
import { z } from "zod";

export const ExerciseSchema = z.object({
  name: z.string().describe('El nombre del ejercicio.'),
  series: z.string().describe('El número de series a realizar.'),
  reps: z.string().describe('El rango de repeticiones a realizar.'),
  rest: z.string().describe('El tiempo de descanso entre series, ej., "60s".'),
  mediaUrl: z.string().describe('URL a una imagen o video del ejercicio. Puede ser una cadena vacía.'),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

export const DayPlanSchema = z.object({
  day: z.string().describe('El día de la semana para el entrenamiento (ej. "Lunes", "Martes").'),
  focus: z.string().describe('El enfoque principal del entrenamiento para el día (ej. "Empuje (Pecho, Hombro, Tríceps)").'),
  exercises: z.array(ExerciseSchema).describe('Una lista de los ejercicios a realizar en este día.'),
});
export type DayPlan = z.infer<typeof DayPlanSchema>;

export const UserPlanSchema = z.object({
  recommendations: z.string().optional().describe('Sugerencias generales o recomendaciones para el plan.'),
  weeklyPlan: z.array(DayPlanSchema).describe('Un plan de entrenamiento semanal completo, dividido por días.'),
});
export type UserPlan = z.infer<typeof UserPlanSchema>;

export type User = {
  id: string
  name: string
  email: string
  role: "admin" | "client"
  status: "activo" | "pendiente"
  registeredAt: string
  planStatus: "aprobado" | "pendiente" | "sin-plan" | "n/a"
}

export const GeneratePersonalizedTrainingPlanInputSchema = z.object({
  goals: z
    .string()
    .describe('Los objetivos de fitness del usuario, ej., pérdida de peso, ganancia muscular, mejora de la resistencia.'),
  currentFitnessLevel: z
    .string()
    .describe('El nivel de fitness actual del usuario, ej., principiante, intermedio, avanzado.'),
  daysPerWeek: z
    .number()
    .describe('El número de días a la semana que el usuario puede dedicar al entrenamiento.'),
  preferredWorkoutStyle: z
    .string()
    .describe('El estilo de entrenamiento preferido del usuario, ej., levantamiento de pesas, cardio, calistenia.'),
  age: z.number().describe('La edad del usuario.'),
  weight: z.number().describe('El peso del usuario en kilogramos.'),
  height: z.number().describe('La estatura del usuario en centímetros.'),
  goalTerm: z.string().describe('El plazo para alcanzar la meta: corto, mediano o largo plazo.'),
});
export type GeneratePersonalizedTrainingPlanInput = z.infer<typeof GeneratePersonalizedTrainingPlanInputSchema>;

export const GeneratePersonalizedTrainingPlanOutputSchema = UserPlanSchema;
export type GeneratePersonalizedTrainingPlanOutput = z.infer<typeof GeneratePersonalizedTrainingPlanOutputSchema>;
