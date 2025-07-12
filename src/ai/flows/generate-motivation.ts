'use server';

/**
 * @fileOverview AI agent that generates motivation and recommendations for workout setbacks.
 *
 * - generateMotivation - A function that handles the motivation generation process.
 * - GenerateMotivationInput - The input type for the generateMotivation function.
 * - GenerateMotivationOutput - The return type for the generateMotivation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateMotivationInputSchema = z.object({
  reason: z.string().describe("The reason the user missed their workout. Can be 'no_time', 'too_tired', 'not_motivated', 'injury_concern', or 'other'."),
});
export type GenerateMotivationInput = z.infer<typeof GenerateMotivationInputSchema>;

export const GenerateMotivationOutputSchema = z.object({
  recommendation: z.string().describe("Una recomendación concisa y útil para ayudar al usuario a volver a la normalidad."),
  motivation: z.string().describe("Una frase motivacional corta e inspiradora relacionada con el motivo del contratiempo."),
});
export type GenerateMotivationOutput = z.infer<typeof GenerateMotivationOutputSchema>;


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
