'use server';

/**
 * @fileOverview A speech-to-text (STT) flow using Genkit and Google AI.
 *
 * - speechToText - Converts speech audio into text.
 * - SpeechToTextInput - The input type for the speechToText function.
 * - SpeechToTextOutput - The return type for the speechToText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SpeechToTextInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The speech audio as a data URI. Expected format: 'data:audio/wav;base64,<encoded_data>'."
    ),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

export const SpeechToTextOutputSchema = z.object({
  text: z.string().describe('The transcribed text.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;

export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
  return speechToTextFlow(input);
}

const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async ({ audioDataUri }) => {
    const { text } = await ai.generate({
      prompt: [{ media: { url: audioDataUri } }],
    });

    return {
      text,
    };
  }
);
