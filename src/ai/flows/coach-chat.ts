'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CoachChatInputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'coach']),
      content: z.string(),
    })
  ),
  persona: z.enum(['gentle', 'no-bs']),
});
export type CoachChatInput = z.infer<typeof CoachChatInputSchema>;

const CoachChatOutputSchema = z.object({
  response: z.string().describe('The coach response in the selected persona style.'),
});
export type CoachChatOutput = z.infer<typeof CoachChatOutputSchema>;

export async function coachChat(input: CoachChatInput): Promise<CoachChatOutput> {
  return coachChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'coachChatPrompt',
  input: { schema: CoachChatInputSchema },
  output: { schema: CoachChatOutputSchema },
  prompt: `You are acting as a coach in a chat. Your persona is: {{persona}}.

If persona is 'gentle', you are empathetic, supportive, validating, and suggest small, manageable steps. If persona is 'no-bs', you are direct, blunt, and give actionable, no-nonsense advice.

Here is the chat history:
{{#each messages}}
{{role}}: {{content}}
{{/each}}

Reply as the {{persona}} coach, continuing the conversation. Only output your message, no extra commentary.`,
});

const coachChatFlow = ai.defineFlow(
  {
    name: 'coachChatFlow',
    inputSchema: CoachChatInputSchema,
    outputSchema: CoachChatOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
); 