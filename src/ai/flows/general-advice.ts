// src/ai/flows/general-advice.ts
'use server';
/**
 * @fileOverview Provides two distinct perspectives, 'Gentle Coach' and 'No-BS Coach', on general life dilemmas.
 *
 * - generalAdvice - A function that accepts a life dilemma and returns advice from two perspectives.
 * - GeneralAdviceInput - The input type for the generalAdvice function.
 * - GeneralAdviceOutput - The return type for the generalAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneralAdviceInputSchema = z.object({
  dilemma: z
    .string()
    .describe('A description of the life dilemma the user is facing.'),
});
export type GeneralAdviceInput = z.infer<typeof GeneralAdviceInputSchema>;

const GeneralAdviceOutputSchema = z.object({
  gentleCoachAdvice: z
    .string()
    .describe('Empathetic and supportive guidance for the dilemma.'),
  noBsCoachAdvice: z
    .string()
    .describe('Direct and actionable advice with concrete steps for the dilemma.'),
});
export type GeneralAdviceOutput = z.infer<typeof GeneralAdviceOutputSchema>;

export async function generalAdvice(input: GeneralAdviceInput): Promise<GeneralAdviceOutput> {
  return generalAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generalAdvicePrompt',
  input: {schema: GeneralAdviceInputSchema},
  output: {schema: GeneralAdviceOutputSchema},
  prompt: `You are a dual AI agent providing advice from two distinct perspectives on the user's life dilemma.

The user's dilemma is described below:

{{dilemma}}

You will provide advice from two perspectives:

1. Gentle Coach: Offer empathetic, supportive guidance. Validate feelings and suggest small, manageable steps.
2. No-BS Coach: Provide direct, blunt advice with concrete steps. Identify potential cognitive traps and offer actionable strategies.

Format each perspective as a short paragraph.
`,
});

const generalAdviceFlow = ai.defineFlow(
  {
    name: 'generalAdviceFlow',
    inputSchema: GeneralAdviceInputSchema,
    outputSchema: GeneralAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
