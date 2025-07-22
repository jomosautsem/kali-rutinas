
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
    description: 'Busca un video de un ejercicio en YouTube y devuelve la URL del video.',
    inputSchema: z.object({
      exerciseName: z.string().describe('El nombre del ejercicio a buscar (ej. "Press de Banca", "Sentadilla").'),
    }),
    outputSchema: z.string().describe('Una URL al video de YouTube del ejercicio.'),
  },
  async (input) => {
    const query = encodeURIComponent(`${input.exerciseName} ejercicio tutorial`);
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

  Basado en los objetivos del usuario, nivel de condición física actual, días de entrenamiento disponibles por semana, tiempo de entrenamiento por día y estilo de entrenamiento preferido, crea un plan de entrenamiento detallado con el formato JSON solicitado.

  Además del plan, proporciona dos secciones de texto importantes:
  1. En el campo 'warmup', escribe una rutina de calentamiento y activación general (3-4 frases). Debe incluir movilidad articular y ejercicios de activación específicos para los principales grupos musculares.
  2. En el campo 'recommendations', proporciona una recomendación general (2-3 frases) sobre consejos de post-entrenamiento, como enfriamiento, hidratación, nutrición o mentalidad.

  Crea un plan para los días de la semana especificados por el usuario en 'trainingDays'. El número total de días de entrenamiento debe coincidir con la cantidad de días en esa lista.

  Para cada día de entrenamiento, debes incluir exactamente {{{exercisesPerDay}}} ejercicios. Adapta la complejidad y el volumen de los ejercicios para que se ajusten al tiempo de entrenamiento disponible por día.

  Para cada ejercicio, especifica las series y las repeticiones en los campos 'series' y 'reps' respectivamente. Por ejemplo, series: "4", reps: "8-12".
  
  MUY IMPORTANTE: Para cada ejercicio en el plan, debes usar la herramienta 'searchExerciseVideo' para encontrar un video del ejercicio y agregar la URL en el campo 'mediaUrl'. NO dejes el campo 'mediaUrl' vacío. La URL devuelta será una URL de búsqueda de youtube, está bien.
  
  Objetivos: {{#each goals}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Nivel de Condición Física Actual: {{{currentFitnessLevel}}}
  Días de Entrenamiento: {{#each trainingDays}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Tiempo por sesión: {{{trainingTimePerDay}}}
  Número de ejercicios por día: {{{exercisesPerDay}}}
  Estilo de Entrenamiento Preferido: {{{preferredWorkoutStyle}}}
  {{#if muscleFocus}}Enfoque Muscular Específico: {{#each muscleFocus}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.{{/if}}
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
  async (input) => {
    const {output} = await prompt(input);

    if (!output) {
      throw new Error("La IA no pudo generar un plan.");
    }
    
    // Post-procesamiento para asegurar que los ejercicios tengan valores por defecto si faltan
    const sanitizedPlan: GeneratePersonalizedTrainingPlanOutput = {
      ...output,
      weeklyPlan: output.weeklyPlan.map(day => ({
        ...day,
        exercises: day.exercises.map(exercise => ({
          ...exercise,
          series: exercise.series || "3", // Valor por defecto para series
          reps: exercise.reps || "10-12", // Valor por defecto para reps
          mediaUrl: exercise.mediaUrl || "",
        })),
      })),
    };

    return sanitizedPlan;
  }
);

    