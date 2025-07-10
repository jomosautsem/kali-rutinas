'use server';
/**
 * @fileOverview AI agent that generates personalized training plans based on user input.
 *
 * - generatePersonalizedTrainingPlan - A function that generates a personalized training plan.
 * - GeneratePersonalizedTrainingPlanInput - The input type for the generatePersonalizedTrainingPlan function.
 * - GeneratePersonalizedTrainingPlanOutput - The return type for the generatePersonalizedTrainingPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedTrainingPlanInputSchema = z.object({
  goals: z
    .string()
    .describe('The fitness goals of the user, e.g., weight loss, muscle gain, improved endurance.'),
  currentFitnessLevel: z
    .string()
    .describe('The current fitness level of the user, e.g., beginner, intermediate, advanced.'),
  daysPerWeek: z
    .number()
    .describe('The number of days per week the user can dedicate to training.'),
  preferredWorkoutStyle: z
    .string()
    .describe('The preferred workout style of the user, e.g., weightlifting, cardio, calisthenics.'),
});
export type GeneratePersonalizedTrainingPlanInput = z.infer<typeof GeneratePersonalizedTrainingPlanInputSchema>;

const GeneratePersonalizedTrainingPlanOutputSchema = z.object({
  plan: z.string().describe('A personalized training plan based on the user input.'),
});
export type GeneratePersonalizedTrainingPlanOutput = z.infer<typeof GeneratePersonalizedTrainingPlanOutputSchema>;

export async function generatePersonalizedTrainingPlan(
  input: GeneratePersonalizedTrainingPlanInput
): Promise<GeneratePersonalizedTrainingPlanOutput> {
  return generatePersonalizedTrainingPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedTrainingPlanPrompt',
  input: {schema: GeneratePersonalizedTrainingPlanInputSchema},
  output: {schema: GeneratePersonalizedTrainingPlanOutputSchema},
  prompt: `You are a personal trainer who specializes in creating personalized training plans.

  Based on the user's goals, current fitness level, available training days per week, and preferred workout style, create a detailed training plan.

  Goals: {{{goals}}}
  Current Fitness Level: {{{currentFitnessLevel}}}
  Days Per Week: {{{daysPerWeek}}}
  Preferred Workout Style: {{{preferredWorkoutStyle}}}

  Training Plan:`,
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
