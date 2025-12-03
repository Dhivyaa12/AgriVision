
'use server';

/**
 * @fileOverview A text translation flow using Genkit and Google AI.
 * 
 * - translateText - Translates text to a specified target language.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated. This may contain multiple lines separated by "\\n---\\n".'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "hi", "ta").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text, preserving the "\\n---\\n" separators.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async ({ text, targetLanguage }) => {
    // Handle cases where the text might be empty or just separators
    if (!text.trim() || text.trim() === '---') {
      return { translatedText: text };
    }

    const { text: translatedText } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `Translate the following text to the language with code '${targetLanguage}'. The text may contain multiple distinct entries separated by "\\n---\\n". Maintain this separator in your output. Return only the translated text, preserving the separators exactly as they appear in the input.\n\nText to translate: "${text}"`,
    });
    
    return {
      translatedText,
    };
  }
);
