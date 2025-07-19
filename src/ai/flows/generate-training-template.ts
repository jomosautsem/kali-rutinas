
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
  input: { schema: GenerateTrainingTemplateInputSchema },
  output: { schema: UserPlanSchema },
  prompt: `Eres un entrenador personal experto en crear plantillas de planes de entrenamiento genéricos pero efectivos que puedan ser usados por múltiples personas.

  Basado en la descripción proporcionada, crea un plan de entrenamiento completo con el formato JSON solicitado. El plan debe ser detallado, bien estructurado y listo para ser usado como una plantilla.

  Asegúrate de que los nombres de los días y los enfoques sean claros y descriptivos. El número de días debe ser lógico según la descripción (ej., si se pide una rutina de '3 días', genera 3 días de entrenamiento).

  Deja el campo 'mediaUrl' como una cadena vacía para cada ejercicio.

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
