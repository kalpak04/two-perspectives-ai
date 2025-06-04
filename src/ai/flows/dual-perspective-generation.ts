'use server';

/**
 * @fileOverview Dual Perspective Generation AI agent.
 *
 * - generateDualPerspectives - A function that generates two distinct perspectives on a given input.
 * - DualPerspectivesInput - The input type for the generateDualPerspectives function.
 * - DualPerspectivesOutput - The return type for the generateDualPerspectives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DualPerspectivesInputSchema = z.object({
  input: z.string().describe('The user input to generate perspectives for.'),
});
export type DualPerspectivesInput = z.infer<typeof DualPerspectivesInputSchema>;

const DualPerspectivesOutputSchema = z.object({
  gentleCoach: z.string().describe('The perspective from a gentle coach.'),
  noBsCoach: z.string().describe('The perspective from a no-BS coach.'),
});
export type DualPerspectivesOutput = z.infer<typeof DualPerspectivesOutputSchema>;

export async function generateDualPerspectives(input: DualPerspectivesInput): Promise<DualPerspectivesOutput> {
  return dualPerspectivesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dualPerspectivesPrompt',
  input: {schema: DualPerspectivesInputSchema},
  output: {schema: DualPerspectivesOutputSchema},
  prompt: `You are an AI assistant that provides two different perspectives on a given input. The two perspectives are:

1.  Gentle Coach: Empathetic, supportive guidance.
2.  No-BS Coach: Direct, actionable advice.

Input: {{{input}}}

Output:
Gentle Coach: {{gentleCoach}}
No-BS Coach: {{noBsCoach}}`,
});

const dualPerspectivesFlow = ai.defineFlow(
  {
    name: 'dualPerspectivesFlow',
    inputSchema: DualPerspectivesInputSchema,
    outputSchema: DualPerspectivesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
