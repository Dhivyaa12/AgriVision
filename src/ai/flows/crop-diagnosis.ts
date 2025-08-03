'use server';
/**
 * @fileOverview A crop disease diagnosis AI agent.
 *
 * - diagnoseCrop - A function that handles the crop diagnosis process.
 * - DiagnoseCropInput - The input type for the diagnoseCrop function.
 * - DiagnoseCropOutput - The return type for the diagnoseCrop function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseCropInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().optional().describe('An optional description of the crop issue.'),
});
export type DiagnoseCropInput = z.infer<typeof DiagnoseCropInputSchema>;

const DiagnoseCropOutputSchema = z.object({
  diseaseName: z.string().describe('The name of the identified disease.'),
  possibleCauses: z.string().describe('Possible causes of the disease.'),
  recommendedRemedies: z.string().describe('AI-recommended remedies for the disease.'),
  preventiveMeasures: z.string().describe('Preventive measures to avoid the disease in the future.'),
});
export type DiagnoseCropOutput = z.infer<typeof DiagnoseCropOutputSchema>;

export async function diagnoseCrop(input: DiagnoseCropInput): Promise<DiagnoseCropOutput> {
  return diagnoseCropFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseCropPrompt',
  input: {schema: DiagnoseCropInputSchema},
  output: {schema: DiagnoseCropOutputSchema},
  prompt: `You are an expert in diagnosing crop diseases. Analyze the provided information to identify the disease, its possible causes, recommend remedies, and suggest preventive measures.

{{#if description}}Description: {{{description}}}{{/if}}
Photo: {{media url=photoDataUri}}

If no description is provided, rely solely on the image for your analysis.`,
});

const diagnoseCropFlow = ai.defineFlow(
  {
    name: 'diagnoseCropFlow',
    inputSchema: DiagnoseCropInputSchema,
    outputSchema: DiagnoseCropOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
