
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
    return output!;
  }
);
