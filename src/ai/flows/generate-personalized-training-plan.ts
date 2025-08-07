

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
  prompt: `Actúa como un entrenador personal profesional con décadas de experiencia, y también como fisioterapeuta con un profundo conocimiento de la anatomía humana. Tu tarea es crear un plan de entrenamiento personalizado y detallado.

  Basado en los objetivos del usuario, nivel de condición física actual, días de entrenamiento disponibles por semana, tiempo de entrenamiento por día y estilo de entrenamiento preferido, crea un plan de entrenamiento detallado con el formato JSON solicitado.

  Además del plan, proporciona tres secciones de texto importantes:
  1. En el campo 'planJustification', explica en 2-3 frases por qué la estructura del plan (ejercicios, series, repeticiones) es ideal para el 'preferredWorkoutStyle' del usuario (ej., por qué es bueno para hipertrofia, fuerza, etc.).
  2. En el campo 'warmup', escribe una rutina de calentamiento y activación general (3-4 frases). Debe incluir movilidad articular y ejercicios de activación específicos para los principales grupos musculares.
  3. En el campo 'recommendations', proporciona una recomendación general (2-3 frases) sobre consejos de post-entrenamiento, como enfriamiento, hidratación, nutrición o mentalidad.
  
  {{#if injuriesOrConditions}}
  MUY IMPORTANTE: El usuario ha reportado las siguientes lesiones o condiciones: {{{injuriesOrConditions}}}.
  Debes tener esto en cuenta al seleccionar los ejercicios. Adapta el plan para evitar ejercicios que puedan agravar estas condiciones. En el campo 'recommendations', añade una advertencia específica para el usuario sobre cómo abordar su entrenamiento considerando estas limitaciones.
  {{/if}}

  Crea un plan para los días de la semana especificados por el usuario en 'trainingDays'. El número total de días de entrenamiento debe coincidir con la cantidad de días en esa lista.

  Para cada día de entrenamiento, debes incluir exactamente {{{exercisesPerDay}}} ejercicios. Adapta la complejidad y el volumen de los ejercicios para que se ajusten al tiempo de entrenamiento disponible por día.
  
  {{#if history}}
  MUY IMPORTANTE: El usuario ya ha recibido los siguientes planes. Para asegurar la variedad y evitar el aburrimiento, genera un plan que utilice ejercicios DIFERENTES a los que se enumeran a continuación. No repitas los siguientes ejercicios:
  {{#each history}}
    Plan Historial {{@index}}:
    {{#each this.weeklyPlan}}
      {{#each this.exercises}}
      - {{this.name}}
      {{/each}}
    {{/each}}
  {{/each}}
  {{/if}}

  Para cada ejercicio, especifica las series y las repeticiones en los campos 'series' y 'reps' respectivamente. Por ejemplo, series: "4", reps: "8-12".
  
  MUY IMPORTANTE: Para cada ejercicio en el plan, debes usar la herramienta 'searchExerciseVideo' para encontrar un video del ejercicio y agregar la URL en el campo 'mediaUrl'. NO dejes el campo 'mediaUrl' vacío. La URL devuelta será una URL de búsqueda de youtube, está bien.

  IMPORTANTE: Para cada ejercicio, rellena el campo 'description' con una breve descripción de 1-2 frases sobre los principales músculos que trabaja el ejercicio. Por ejemplo: "Este ejercicio se enfoca en el pectoral mayor, deltoides anterior y tríceps.".
  
  CRÍTICO: El campo 'focus' para cada día de entrenamiento debe contener ÚNICAMENTE los grupos musculares o el tipo de entrenamiento para ESE DÍA en específico (ej. "Pecho y Hombros", "Cardio y Resistencia"). NO incluyas información general como el nivel de fitness ("Principiante"), el objetivo ("Hipertrofia") o detalles de otros días en este campo.

  Objetivos: {{#each goals}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Nivel de Condición Física Actual: {{{currentFitnessLevel}}}
  Días de Entrenamiento: {{#each trainingDays}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Tiempo por sesión: {{{trainingTimePerDay}}}
  Número de ejercicios por día: {{{exercisesPerDay}}}
  Estilo de Entrenamiento Preferido: {{{preferredWorkoutStyle}}}
  {{#if muscleFocus}}Enfoque Muscular Específico: {{#each muscleFocus}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.{{/if}}
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
    
    // Keywords generales a eliminar del campo 'focus'
    const generalKeywords = [
        "principiante", "intermedio", "avanzado", "hipertrofia", 
        "fuerza", "resistencia", "definición", "intensivo", "en", "glúteos", 
        "cardio", "hiit"
    ];

    // Post-procesamiento para asegurar que los ejercicios tengan valores por defecto y el 'focus' sea limpio
    const sanitizedPlan: GeneratePersonalizedTrainingPlanOutput = {
      ...output,
      weeklyPlan: output.weeklyPlan.map(day => {
        
        let cleanFocus = day.focus || "";
        // Eliminar keywords generales del campo 'focus'
        generalKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            cleanFocus = cleanFocus.replace(regex, '').replace(/[, -]+/g, ' ').trim();
        });
        
        // Reemplazar múltiples espacios con uno solo y limpiar comas/guiones sobrantes
        cleanFocus = cleanFocus.replace(/\s+/g, ' ').trim();
        cleanFocus = cleanFocus.replace(/ , /g, ', ').replace(/ - /g, ' - ').trim();
        cleanFocus = cleanFocus.replace(/^[, -]+|[, -]+$/g, ''); // Limpiar caracteres sobrantes al inicio/fin

        return {
            ...day,
            focus: cleanFocus || "Entrenamiento General", // Fallback por si queda vacío
            exercises: day.exercises.map(exercise => ({
                ...exercise,
                series: exercise.series || "3", // Valor por defecto para series
                reps: exercise.reps || "10-12", // Valor por defecto para reps
                description: exercise.description || "Descripción no disponible.",
                mediaUrl: exercise.mediaUrl || "",
            })),
        };
      }),
    };

    return sanitizedPlan;
  }
);
