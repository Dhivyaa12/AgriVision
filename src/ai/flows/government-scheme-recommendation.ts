'use server';
/**
 * @fileOverview A government scheme recommendation AI agent.
 *
 * - recommendGovSchemes - A function that handles the scheme recommendation process.
 * - RecommendGovSchemesInput - The input type for the recommendGovSchemes function.
 * - RecommendGovSchemesOutput - The return type for the recommendGovSchemes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendGovSchemesInputSchema = z.object({
  state: z.string().describe('The state for which to find government schemes.'),
  requirements: z
    .string()
    .describe(
      'The requirements of the user, such as women-focused schemes or irrigation support.'
    ),
});
export type RecommendGovSchemesInput = z.infer<typeof RecommendGovSchemesInputSchema>;

const RecommendGovSchemesOutputSchema = z.object({
  centralSchemes: z.array(z.string()).describe('Relevant Central Government Schemes.'),
  stateSchemes: z.array(z.string()).describe('Applicable State Government Schemes.'),
  womenSchemes: z
    .array(z.string())
    .describe('Women-specific agricultural schemes.'),
});
export type RecommendGovSchemesOutput = z.infer<typeof RecommendGovSchemesOutputSchema>;

export async function recommendGovSchemes(
  input: RecommendGovSchemesInput
): Promise<RecommendGovSchemesOutput> {
  return recommendGovSchemesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendGovSchemesPrompt',
  input: {schema: RecommendGovSchemesInputSchema},
  output: {schema: RecommendGovSchemesOutputSchema},
  prompt: `You are an expert in Indian government agricultural schemes.

You will use the state and requirements provided to recommend relevant schemes.

State: {{{state}}}
Requirements: {{{requirements}}}

Recommend relevant Central Government Schemes, applicable State Government Schemes, and Women-specific agricultural schemes.

Format your output as a JSON object with keys for centralSchemes, stateSchemes, and womenSchemes. Each key should contain a list of schemes.`,
});

const recommendGovSchemesFlow = ai.defineFlow(
  {
    name: 'recommendGovSchemesFlow',
    inputSchema: RecommendGovSchemesInputSchema,
    outputSchema: RecommendGovSchemesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
