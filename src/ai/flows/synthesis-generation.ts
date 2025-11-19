'use server';

/**
 * @fileOverview Generates a synthesis of two opposing perspectives.
 *
 * - generateSynthesis - A function that accepts two perspectives and returns a synthesis.
 * - SynthesisInput - The input type for the generateSynthesis function.
 * - SynthesisOutput - The return type for the generateSynthesis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SynthesisInputSchema = z.object({
    perspectiveA: z.string().describe('The first perspective (e.g., Idealist).'),
    perspectiveB: z.string().describe('The second perspective (e.g., Realist).'),
});
export type SynthesisInput = z.infer<typeof SynthesisInputSchema>;

const SynthesisOutputSchema = z.object({
    synthesis: z.string().describe('A balanced synthesis of the two perspectives.'),
});
export type SynthesisOutput = z.infer<typeof SynthesisOutputSchema>;

export async function generateSynthesis(input: SynthesisInput): Promise<SynthesisOutput> {
    return synthesisFlow(input);
}

const prompt = ai.definePrompt({
    name: 'synthesisPrompt',
    input: { schema: SynthesisInputSchema },
    output: { schema: SynthesisOutputSchema },
    prompt: `You are a wise mediator capable of finding the middle ground between two opposing viewpoints.

Perspective A (Idealist): {{perspectiveA}}

Perspective B (Realist): {{perspectiveB}}

Your task is to synthesize these two perspectives into a balanced, actionable conclusion. Acknowledge the validity of both sides and find a path forward that integrates the optimism of the idealist with the pragmatism of the realist.

Output a single paragraph of synthesis.`,
});

const synthesisFlow = ai.defineFlow(
    {
        name: 'synthesisFlow',
        inputSchema: SynthesisInputSchema,
        outputSchema: SynthesisOutputSchema,
    },
    async input => {
        const { output } = await prompt(input);
        return output!;
    }
);
