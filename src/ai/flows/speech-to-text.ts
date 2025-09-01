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

const SpeechToTextInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The speech audio as a data URI. Expected format: 'data:audio/wav;base64,<encoded_data>'."
    ),
  language: z.string().optional().describe('The BCP-47 language code for transcription (e.g., "en-US", "hi-IN").'),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
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
  async ({ audioDataUri, language }) => {
    const languagePrompt = language ? ` The user is speaking in ${language}. Transcribe it accurately in that language.` : '';
    
    const { text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: [{ media: { url: audioDataUri } }, {text: `Transcribe the following audio accurately. The audio contains a description of crop symptoms for agricultural diagnosis.${languagePrompt}`}],
    });

    return {
      text,
    };
  }
);
