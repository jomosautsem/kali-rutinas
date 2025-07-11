'use server';
/**
 * @fileOverview AI agent that generates personalized training plans based on user input.
 *
 * - generatePersonalizedTrainingPlan - A function that generates a personalized training plan.
 * - GeneratePersonalizedTrainingPlanInput - The input type for the generatePersonalizedTrainingPlan function.
 * - GeneratePersonalizedTrainingPlanOutput - The return type for the generatePersonalizedTrainingPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const ExerciseSchema = z.object({
  name: z.string().describe('El nombre del ejercicio.'),
  series: z.string().describe('El número de series a realizar.'),
  reps: z.string().describe('El rango de repeticiones a realizar.'),
  rest: z.string().describe('El tiempo de descanso entre series, ej., "60s".'),
  mediaUrl: z.string().describe('Un campo vacío para la URL de una imagen o video del ejercicio. Déjalo como una cadena vacía.'),
});

const DayPlanSchema = z.object({
  day: z.string().describe('El día de la semana para el entrenamiento (ej. "Lunes", "Martes").'),
  focus: z.string().describe('El enfoque principal del entrenamiento para el día (ej. "Empuje (Pecho, Hombro, Tríceps)").'),
  exercises: z.array(ExerciseSchema).describe('Una lista de los ejercicios a realizar en este día.'),
});

const GeneratePersonalizedTrainingPlanOutputSchema = z.object({
  weeklyPlan: z.array(DayPlanSchema).describe('Un plan de entrenamiento semanal completo, dividido por días.'),
});

export type GeneratePersonalizedTrainingPlanOutput = z.infer<typeof GeneratePersonalizedTrainingPlanOutputSchema>;

export async function generatePersonalizedTrainingPlan(
  input: GeneratePersonalizedTrainingPlanInput
): Promise<GeneratePersonalizedTrainingPlanOutput> {
  return generatePersonalizedTrainingPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedTrainingPlanPrompt',
  input: {schema: GeneratePersonalizedTrainingPlanInputSchema},
  output: {schema: GeneratePersonalizedTrainingPlanOutputSchema},
  prompt: `Eres un entrenador personal que se especializa en crear planes de entrenamiento personalizados y detallados.

  Basado en los objetivos del usuario, nivel de condición física actual, días de entrenamiento disponibles por semana y estilo de entrenamiento preferido, crea un plan de entrenamiento detallado con el formato JSON solicitado.

  Crea un plan para el número de días especificado por el usuario. No crees más días de los solicitados.
  
  Deja el campo 'mediaUrl' como una cadena vacía para cada ejercicio.

  Objetivos: {{{goals}}}
  Nivel de Condición Física Actual: {{{currentFitnessLevel}}}
  Días por Semana: {{{daysPerWeek}}}
  Estilo de Entrenamiento Preferido: {{{preferredWorkoutStyle}}}
  Edad: {{{age}}}
  Peso (kg): {{{weight}}}
  Estatura (cm): {{{height}}}
  Plazo de la Meta: {{{goalTerm}}}
  `,
});

const generatePersonalizedTrainingPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedTrainingPlanFlow',
    inputSchema: GeneratePersonalizedTrainingPlanInputSchema,
    outputSchema: GeneratePersonalizedTrainingPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
