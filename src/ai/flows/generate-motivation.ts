
'use server';

/**
 * @fileOverview AI agent that generates motivation and recommendations for workout setbacks.
 *
 * - generateMotivation - A function that handles the motivation generation process.
 */

import { ai } from '@/ai/genkit';
import type { GenerateMotivationInput, GenerateMotivationOutput } from '@/lib/types';
import { GenerateMotivationInputSchema, GenerateMotivationOutputSchema } from '@/lib/types';


export async function generateMotivation(input: GenerateMotivationInput): Promise<GenerateMotivationOutput> {
  return generateMotivationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMotivationPrompt',
  input: { schema: GenerateMotivationInputSchema },
  output: { schema: GenerateMotivationOutputSchema },
  prompt: `Eres un entrenador personal y coach motivacional empático y positivo. Un usuario no pudo completar su entrenamiento y necesita un consejo y una dosis de motivación.

Basado en el motivo proporcionado, genera una recomendación breve y accionable y una frase motivacional inspiradora.

El tono debe ser comprensivo, no crítico. El objetivo es animar al usuario a volver a su rutina sin sentirse culpable.

Motivo del contratiempo: {{{reason}}}

Responde en el formato JSON solicitado.
`,
});


const generateMotivationFlow = ai.defineFlow(
  {
    name: 'generateMotivationFlow',
    inputSchema: GenerateMotivationInputSchema,
    outputSchema: GenerateMotivationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
