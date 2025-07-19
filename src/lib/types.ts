
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
  inviteCode?: string;
}

export const GeneratePersonalizedTrainingPlanInputSchema = z.object({
  goals: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "Debes seleccionar al menos una meta.",
    })
    .describe('Los objetivos de fitness del usuario.'),
  currentFitnessLevel: z
    .string()
    .describe('El nivel de fitness actual del usuario, ej., principiante, intermedio, avanzado.'),
  trainingDays: z
    .array(z.string())
    .refine((value) => value.length > 0, {
        message: "Debes seleccionar al menos un día de entrenamiento.",
    })
    .describe('Los días específicos de la semana que el usuario puede dedicar al entrenamiento.'),
  preferredWorkoutStyle: z
    .string()
    .describe('El estilo de entrenamiento preferido por el usuario, ej., levantamiento de pesas, cardio, HIIT, yoga.'),
  muscleFocus: z
    .array(z.string())
    .optional()
    .describe('Los grupos musculares específicos en los que el usuario quiere enfocarse.'),
  age: z
    .number()
    .describe('La edad del usuario.'),
  weight: z
    .number()
    .describe('El peso del usuario en kilogramos.'),
  height: z
    .number()
    .describe('La estatura del usuario en centímetros.'),
  goalTerm: z
    .string()
    .describe('El plazo en el que el usuario espera alcanzar sus metas, ej., corto, mediano, largo plazo.'),
  injuriesOrConditions: z
    .string()
    .optional()
    .describe('Cualquier lesión o condición médica que el entrenador deba conocer.'),
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
