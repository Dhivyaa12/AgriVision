
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

const SchemeSchema = z.object({
    name: z.string().describe('The full name of the government scheme.'),
    url: z.string().describe('The official government URL for the scheme.'),
});

const RecommendGovSchemesInputSchema = z.object({
  state: z.string().describe('The state for which to find government schemes.'),
  requirements: z
    .string()
    .optional()
    .describe(
      'The requirements of the user, such as women-focused schemes or irrigation support. If not provided, general schemes should be recommended.'
    ),
});
export type RecommendGovSchemesInput = z.infer<typeof RecommendGovSchemesInputSchema>;

const RecommendGovSchemesOutputSchema = z.object({
  centralSchemes: z.array(SchemeSchema).describe('Relevant Central Government Schemes with their names and URLs.'),
  stateSchemes: z.array(SchemeSchema).describe('Applicable State Government Schemes with their names and URLs.'),
  womenSchemes: z
    .array(SchemeSchema)
    .describe('Women-specific agricultural schemes with their names and URLs.'),
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

You will use the state and requirements provided to recommend relevant schemes. For each scheme, you MUST provide the official government website URL.

State: {{{state}}}
{{#if requirements}}
Requirements: {{{requirements}}}
{{/if}}

Recommend relevant Central Government Schemes, applicable State Government Schemes, and Women-specific agricultural schemes. If no specific requirements are given, provide a list of general, popular, and impactful schemes for the given state.

Format your output as a JSON object with keys for centralSchemes, stateSchemes, and womenSchemes. Each key should contain an array of objects, with each object having a 'name' and 'url' for the scheme.`,
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
