
'use server';

/**
 * @fileOverview AI agent that generates a full training plan template.
 *
 * - generateTrainingTemplate - A function that generates a training plan template.
 */

import { ai } from '@/ai/genkit';
import { UserPlanSchema, GenerateTrainingTemplateInputSchema } from '@/lib/types';
import type { GenerateTrainingTemplateInput, UserPlan } from '@/lib/types';


export async function generateTrainingTemplate(input: GenerateTrainingTemplateInput): Promise<UserPlan> {
  return generateTrainingTemplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrainingTemplatePrompt',
  model: 'googleai/gemini-2.0-flash',
  input: { schema: GenerateTrainingTemplateInputSchema },
  output: { schema: UserPlanSchema },
  prompt: `Actúa como un entrenador personal profesional con décadas de experiencia, y también como fisioterapeuta con un profundo conocimiento de la anatomía humana. Tu tarea es crear una plantilla de plan de entrenamiento genérico pero efectivo que pueda ser usado por múltiples personas.

  Basado en la descripción proporcionada, crea un plan de entrenamiento completo con el formato JSON solicitado. El plan debe ser detallado, bien estructurado y listo para ser usado como una plantilla. Interpreta el texto para extraer los días, los ejercicios, las series, las repeticiones y cualquier otra información relevante.

  Asegúrate de que los nombres de los días y los enfoques sean claros y descriptivos. El número de días debe ser lógico según la descripción (ej., si se pide una rutina de '3 días', genera 3 días de entrenamiento).

  MUY IMPORTANTE: Para cada día en 'weeklyPlan', asegúrate de que el campo 'focus' contenga ÚNICAMENTE los grupos musculares o el tipo de entrenamiento para ESE DÍA en específico. No debe incluir información general de la plantilla como el nivel (principiante, etc.) o enfoques de otros días. Por ejemplo: 'Pecho y Hombros' o 'Cardio y Resistencia'.

  Además del plan, proporciona dos secciones de texto importantes:
  1. En el campo 'warmup', escribe una rutina de calentamiento y activación general (3-4 frases) apropiada para el tipo de plantilla descrita.
  2. En el campo 'recommendations', proporciona una recomendación general (2-3 frases) sobre consejos de post-entrenamiento, como enfriamiento, hidratación o nutrición.

  Para cada ejercicio, debes buscar un video en YouTube y agregar la URL de búsqueda en el campo 'mediaUrl'. Por ejemplo, para "Press de Banca", la URL sería "https://www.youtube.com/results?search_query=Press+de+Banca+ejercicio+tutorial".

  Descripción de la Plantilla Solicitada: {{{description}}}
  `,
});


const generateTrainingTemplateFlow = ai.defineFlow(
  {
    name: 'generateTrainingTemplateFlow',
    inputSchema: GenerateTrainingTemplateInputSchema,
    outputSchema: UserPlanSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error("La IA no pudo generar una plantilla.");
    }
    
    // Keywords generales a eliminar del campo 'focus'
    const generalKeywords = [
        "principiante", "intermedio", "avanzado", "hipertrofia", 
        "fuerza", "resistencia", "definición", "intensivo", "en", "glúteos", 
        "cardio", "hiit"
    ];

    // Post-procesamiento para limpiar el campo 'focus'
    const sanitizedPlan: UserPlan = {
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
                series: exercise.series || "3",
                reps: exercise.reps || "10-12",
                description: exercise.description || "Descripción no disponible.",
                mediaUrl: exercise.mediaUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name)}+ejercicio+tutorial`,
            })),
        };
      }),
    };

    return sanitizedPlan;
  }
);
