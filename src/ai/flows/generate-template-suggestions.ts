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
    .describe("User feedback and requests regarding training plans."),
  commonRequests: z
    .string()
    .describe("Commonly requested training plan features or types."),
});
export type GenerateTemplateSuggestionsInput = z.infer<typeof GenerateTemplateSuggestionsInputSchema>;

const GenerateTemplateSuggestionsOutputSchema = z.object({
  templateSuggestions: z
    .array(z.string())
    .describe("A list of suggested training plan templates."),
});
export type GenerateTemplateSuggestionsOutput = z.infer<typeof GenerateTemplateSuggestionsOutputSchema>;

export async function generateTemplateSuggestions(input: GenerateTemplateSuggestionsInput): Promise<GenerateTemplateSuggestionsOutput> {
  return generateTemplateSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTemplateSuggestionsPrompt',
  input: {schema: GenerateTemplateSuggestionsInputSchema},
  output: {schema: GenerateTemplateSuggestionsOutputSchema},
  prompt: `You are an expert training plan template generator.

Based on user feedback and common requests, suggest training plan templates.

User Feedback: {{{userFeedback}}}
Common Requests: {{{commonRequests}}}

Suggest training plan templates:
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
