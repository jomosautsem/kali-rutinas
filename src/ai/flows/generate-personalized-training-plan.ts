
'use server';
/**
 * @fileOverview AI agent that generates personalized training plans based on user input.
 *
 * - generatePersonalizedTrainingPlan - A function that generates a personalized training plan.
 */

import {ai} from '@/ai/genkit';
import { GeneratePersonalizedTrainingPlanInput, GeneratePersonalizedTrainingPlanOutput, GeneratePersonalizedTrainingPlanInputSchema, GeneratePersonalizedTrainingPlanOutputSchema } from '@/lib/types';
import { z } from 'zod';


const searchExerciseVideo = ai.defineTool(
  {
    name: 'searchExerciseVideo',
    description: 'Busca un video de un ejercicio en YouTube y devuelve la URL.',
    inputSchema: z.object({
      exerciseName: z.string().describe('El nombre del ejercicio a buscar (ej. "Press de Banca", "Sentadilla").'),
    }),
    outputSchema: z.string().describe('Una URL al video de YouTube del ejercicio.'),
  },
  async (input) => {
    // En una implementación real, esto podría usar la API de YouTube.
    // Por ahora, construiremos una URL de búsqueda para que el admin pueda encontrar videos fácilmente.
    const query = encodeURIComponent(`${input.exerciseName} ejercicio`);
    return `https://www.youtube.com/results?search_query=${query}`;
  }
)

export async function generatePersonalizedTrainingPlan(
  input: GeneratePersonalizedTrainingPlanInput
): Promise<GeneratePersonalizedTrainingPlanOutput> {
  return generatePersonalizedTrainingPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedTrainingPlanPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {schema: GeneratePersonalizedTrainingPlanInputSchema},
  output: {schema: GeneratePersonalizedTrainingPlanOutputSchema},
  tools: [searchExerciseVideo],
  prompt: `Eres un entrenador personal que se especializa en crear planes de entrenamiento personalizados y detallados.

  Basado en los objetivos del usuario, nivel de condición física actual, días de entrenamiento disponibles por semana y estilo de entrenamiento preferido, crea un plan de entrenamiento detallado con el formato JSON solicitado.

  Además del plan de ejercicios, proporciona una recomendación general en el campo 'recommendations'. Esta recomendación debe ser concisa (2-3 frases) y puede incluir consejos sobre calentamiento, hidratación, nutrición general o mentalidad.

  Crea un plan para los días de la semana especificados por el usuario en 'trainingDays'. El número total de días de entrenamiento debe coincidir con la cantidad de días en esa lista.
  
  MUY IMPORTANTE: Para cada ejercicio en el plan, debes usar la herramienta 'searchExerciseVideo' para encontrar un video del ejercicio y agregar la URL en el campo 'mediaUrl'. NO dejes el campo 'mediaUrl' vacío.
  
  Objetivos: {{#each goals}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Nivel de Condición Física Actual: {{{currentFitnessLevel}}}
  Días de Entrenamiento: {{#each trainingDays}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Estilo de Entrenamiento Preferido: {{{preferredWorkoutStyle}}}
  {{#if muscleFocus}}Enfoque Muscular Específico: {{#each muscleFocus}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
  {{#if injuriesOrConditions}}Consideraciones Importantes (lesiones/condiciones): {{{injuriesOrConditions}}}. Adapta el plan para evitar ejercicios que puedan agravar estas condiciones.{{/if}}
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

