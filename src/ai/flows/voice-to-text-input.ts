'use server';
/**
 * @fileOverview An AI agent that transcribes voice input and provides two perspectives (Gentle Coach and No-BS Coach).
 *
 * - voiceToTextInput - A function that handles the voice transcription and perspective generation process.
 * - VoiceToTextInputInput - The input type for the voiceToTextInput function.
 * - VoiceToTextInputOutput - The return type for the voiceToTextInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceToTextInputInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'Audio data URI of the user dilemma.  Must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type VoiceToTextInputInput = z.infer<typeof VoiceToTextInputInputSchema>;

const VoiceToTextInputOutputSchema = z.object({
  gentleCoachPerspective: z
    .string()
    .describe('The Gentle Coach perspective on the user dilemma.'),
  noBSCoachPerspective: z
    .string()
    .describe('The No-BS Coach perspective on the user dilemma.'),
});
export type VoiceToTextInputOutput = z.infer<typeof VoiceToTextInputOutputSchema>;

export async function voiceToTextInput(input: VoiceToTextInputInput): Promise<VoiceToTextInputOutput> {
  return voiceToTextInputFlow(input);
}

const transcribeAudio = ai.defineTool({
  name: 'transcribeAudio',
  description: 'Transcribes audio data to text.',
  inputSchema: z.object({
    audioDataUri: z
      .string()
      .describe(
        'The audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
      ),
  }),
  outputSchema: z.string(),
},
async (input) => {
  const {text} = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: [
      {media: {url: input.audioDataUri}},
      {text: 'Transcribe the audio to text.'},
    ],
    config: {
      responseModalities: ['TEXT'],
    },
  });
  return text!;
});

const dualPerspectivePrompt = ai.definePrompt({
  name: 'dualPerspectivePrompt',
  input: {
    schema: z.object({
      transcription: z.string().describe('The transcription of the user audio.'),
    }),
  },
  output: {
    schema: VoiceToTextInputOutputSchema,
  },
  prompt: `You are a dual coach, providing two distinct perspectives on user dilemmas.  The transcription of the user\'s audio is: {{{transcription}}}.  Provide two perspectives:

1.  Gentle Coach: Empathetic, supportive guidance. Validates feelings, offers micro-steps, and is compassionate.
2.  No-BS Coach: Direct, actionable advice. Identifies cognitive traps and gives blunt, actionable advice.

Output should be structured as follows:
{
  gentleCoachPerspective: string // The Gentle Coach perspective
  noBSCoachPerspective: string // The No-BS Coach perspective
}
`,tools: [transcribeAudio]
});

const voiceToTextInputFlow = ai.defineFlow(
  {
    name: 'voiceToTextInputFlow',
    inputSchema: VoiceToTextInputInputSchema,
    outputSchema: VoiceToTextInputOutputSchema,
  },
  async input => {
    const transcription = await transcribeAudio({audioDataUri: input.audioDataUri});
    const {output} = await dualPerspectivePrompt({transcription});
    return output!;
  }
);
