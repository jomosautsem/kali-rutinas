
import { z } from "zod";

// This type is now deprecated for plan generation, but kept for client-side progress tracking.
export const SetSchema = z.object({
  id: z.string(),
  reps: z.string().describe('El número objetivo de repeticiones para esta serie.'),
  weight: z.string().describe('El peso levantado en esta serie (llenado por el usuario).').optional(),
  completed: z.boolean().describe('Si el usuario completó esta serie.').optional(),
});
export type Set = z.infer<typeof SetSchema>;

export const ExerciseSchema = z.object({
  name: z.string().describe('El nombre del ejercicio.'),
  series: z.string().describe('El número de series a realizar, ej., "4".'),
  reps: z.string().describe('El rango de repeticiones objetivo, ej., "8-12".'),
  rest: z.string().describe('El tiempo de descanso entre series, ej., "60s".'),
  description: z.string().optional().describe('Una breve descripción de los músculos principales que trabaja el ejercicio.'),
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
  planJustification: z.string().optional().describe('Una breve explicación de por qué el plan es adecuado para el estilo de entrenamiento elegido por el usuario.'),
  warmup: z.string().optional().describe('Instrucciones de calentamiento y activación muscular antes del entrenamiento.'),
  recommendations: z.string().optional().describe('Sugerencias generales o recomendaciones para el plan.'),
  weeklyPlan: z.array(DayPlanSchema).describe('Un plan de entrenamiento semanal completo, dividido por días.'),
});
export type UserPlan = z.infer<typeof UserPlanSchema>;

export type User = {
  id: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  name: string; // Full name, derived from the other three
  email: string;
  role: "admin" | "client";
  status: "activo" | "pendiente" | "inactivo";
  registeredAt: string;
  planStatus: "aprobado" | "pendiente" | "sin-plan" | "n/a";
  inviteCode?: string;
  avatarUrl?: string;
  password?: string;
  customPlanRequest?: 'requested' | 'none';
  planStartDate?: string;
  planEndDate?: string;
  currentWeek?: number;
  planDurationInWeeks?: number;
};

export type ProgressData = {
    [day: string]: {
        [exerciseName: string]: {
            [setIndex: number]: {
                weight: string;
                reps: string;
                completed: boolean;
            }
        }
    }
}

// This schema defines the data required to generate a personalized training plan.
export const GeneratePersonalizedTrainingPlanInputSchema = z.object({
  goals: z.array(z.string()).min(1, "Debes seleccionar al menos una meta.").describe('Los objetivos de fitness del usuario.'),
  currentFitnessLevel: z.string().min(1, "Debes seleccionar tu nivel.").describe('El nivel de fitness actual del usuario, ej., principiante, intermedio, avanzado.'),
  trainingDays: z.array(z.string()).min(1, "Debes seleccionar al menos un día.").describe('Los días específicos de la semana que el usuario puede dedicar al entrenamiento.'),
  trainingTimePerDay: z.string().min(1, "Debes seleccionar el tiempo disponible.").describe('El tiempo aproximado que el usuario tiene para entrenar por día.'),
  preferredWorkoutStyle: z.string().min(1, "Debes seleccionar un estilo.").describe('El estilo de entrenamiento preferido por el usuario, ej., levantamiento de pesas, cardio, HIIT, yoga.'),
  muscleFocus: z.array(z.string()).optional().describe('Los grupos musculares específicos en los que el usuario quiere enfocarse.'),
  age: z.number({ required_error: "La edad es requerida."}).min(12, "Debes ser mayor de 12 años.").describe('La edad del usuario.'),
  weight: z.number({ required_error: "El peso es requerido."}).min(30, "El peso debe ser realista.").describe('El peso del usuario en kilogramos.'),
  height: z.number({ required_error: "La estatura es requerida."}).min(100, "La estatura debe ser realista.").describe('La estatura del usuario en centímetros.'),
  goalTerm: z.string().min(1, "Debes seleccionar un plazo.").describe('El plazo en el que el usuario espera alcanzar sus metas, ej., corto, mediano, largo plazo.'),
  planDuration: z.number().describe("La duración del ciclo de entrenamiento en semanas (4, 6 u 8)."),
  injuriesOrConditions: z.string().optional().describe('Cualquier lesión o condición médica que el entrenador deba conocer.'),
  exercisesPerDay: z.number().describe('El número de ejercicios que el usuario desea realizar por día de entrenamiento.'),
  history: z.array(UserPlanSchema).optional().describe("Un historial de los últimos 3 planes generados para este usuario, para garantizar la variedad.")
});
export type GeneratePersonalizedTrainingPlanInput = z.infer<typeof GeneratePersonalizedTrainingPlanInputSchema>;

export const GeneratePersonalizedTrainingPlanOutputSchema = UserPlanSchema;
export type GeneratePersonalizedTrainingPlanOutput = z.infer<typeof GeneratePersonalizedTrainingPlanOutputSchema>;


export const GenerateMotivationInputSchema = z.object({
  reason: z.string().describe("The reason the user missed their workout. Can be 'no_time', 'too_tired', 'not_motivated', 'injury_concern', or 'other'."),
});
export type GenerateMotivationInput = z.infer<typeof GenerateMotivationInputSchema>;

export const GenerateMotivationOutputSchema = z.object({
  recommendation: z.string().describe("Una recomendación concisa y útil para ayudar al usuario a volver a la normalidad."),
  motivation: z.string().describe("Una frase motivacional corta e inspiradora relacionada con el motivo del contratiempo."),
});
export type GenerateMotivationOutput = z.infer<typeof GenerateMotivationOutputSchema>;


export const GenerateTrainingTemplateInputSchema = z.object({
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres.").describe("Una descripción detallada de la plantilla de entrenamiento deseada."),
});
export type GenerateTrainingTemplateInput = z.infer<typeof GenerateTrainingTemplateInputSchema>;
