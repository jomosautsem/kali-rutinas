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

const GeneratePersonalizedTrainingPlanInputSchema = z.object({
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

const GeneratePersonalizedTrainingPlanOutputSchema = z.string().describe('Un plan de entrenamiento personalizado basado en la entrada del usuario.');

export type GeneratePersonalizedTrainingPlanOutput = z.infer<typeof GeneratePersonalizedTrainingPlanOutputSchema>;

export async function generatePersonalizedTrainingPlan(
  input: GeneratePersonalizedTrainingPlanInput
): Promise<GeneratePersonalizedTrainingPlanOutput> {
  return generatePersonalizedTrainingPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedTrainingPlanPrompt',
  input: {schema: GeneratePersonalizedTrainingPlanInputSchema},
  output: {schema: GeneratePersonalizedTrainingPlanOutputSchema, format: 'text'},
  prompt: `Eres un entrenador personal que se especializa en crear planes de entrenamiento personalizados.

  Basado en los objetivos del usuario, nivel de condición física actual, días de entrenamiento disponibles por semana y estilo de entrenamiento preferido, crea un plan de entrenamiento detallado.

  Objetivos: {{{goals}}}
  Nivel de Condición Física Actual: {{{currentFitnessLevel}}}
  Días por Semana: {{{daysPerWeek}}}
  Estilo de Entrenamiento Preferido: {{{preferredWorkoutStyle}}}
  Edad: {{{age}}}
  Peso (kg): {{{weight}}}
  Estatura (cm): {{{height}}}
  Plazo de la Meta: {{{goalTerm}}}

  Plan de Entrenamiento:`,
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
