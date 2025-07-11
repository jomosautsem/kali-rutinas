'use server';
/**
 * @fileOverview AI agent that generates personalized training plans based on user input.
 *
 * - generatePersonalizedTrainingPlan - A function that generates a personalized training plan.
 */

import {ai} from '@/ai/genkit';
import { GeneratePersonalizedTrainingPlanInput, GeneratePersonalizedTrainingPlanOutput, GeneratePersonalizedTrainingPlanInputSchema, GeneratePersonalizedTrainingPlanOutputSchema } from '@/lib/types';

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
