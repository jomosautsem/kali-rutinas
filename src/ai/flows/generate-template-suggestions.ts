'use server';

/**
 * @fileOverview AI agent that suggests training plan templates based on user feedback and common requests.
 *
 * - generateTemplateSuggestions - A function that generates template suggestions.
 * - GenerateTemplateSuggestionsInput - The input type for the generateTemplateSuggestions function.
 * - GenerateTemplateSuggestionsOutput - The return type for the generateTemplateSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTemplateSuggestionsInputSchema = z.object({
  userFeedback: z
    .string()
    .describe("Comentarios y solicitudes de los usuarios sobre los planes de entrenamiento."),
  commonRequests: z
    .string()
    .describe("Funciones o tipos de planes de entrenamiento solicitados con frecuencia."),
});
export type GenerateTemplateSuggestionsInput = z.infer<typeof GenerateTemplateSuggestionsInputSchema>;

const GenerateTemplateSuggestionsOutputSchema = z.object({
  templateSuggestions: z
    .array(z.string())
    .describe("Una lista de plantillas de planes de entrenamiento sugeridas."),
});
export type GenerateTemplateSuggestionsOutput = z.infer<typeof GenerateTemplateSuggestionsOutputSchema>;

export async function generateTemplateSuggestions(input: GenerateTemplateSuggestionsInput): Promise<GenerateTemplateSuggestionsOutput> {
  return generateTemplateSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTemplateSuggestionsPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {schema: GenerateTemplateSuggestionsInputSchema},
  output: {schema: GenerateTemplateSuggestionsOutputSchema},
  prompt: `Eres un generador experto de plantillas de planes de entrenamiento.

Basado en los comentarios de los usuarios y las solicitudes comunes, sugiere plantillas de planes de entrenamiento.

Comentarios de los usuarios: {{{userFeedback}}}
Solicitudes comunes: {{{commonRequests}}}

Sugerir plantillas de planes de entrenamiento:
`,
});

const generateTemplateSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateTemplateSuggestionsFlow',
    inputSchema: GenerateTemplateSuggestionsInputSchema,
    outputSchema: GenerateTemplateSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
