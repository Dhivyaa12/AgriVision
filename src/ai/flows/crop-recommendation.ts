
'use server';

/**
 * @fileOverview This file contains the Genkit flow for recommending the best crops to plant based on soil and location information.
 *
 * - recommendBestCrops - A function that handles the crop recommendation process.
 * - CropRecommendationInput - The input type for the recommendBestCrops function.
 * - CropRecommendationOutput - The return type for the recommendBestCrops function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropRecommendationInputSchema = z.object({
  soilNature: z
    .string()
    .describe('The nature of the soil, e.g., sandy, clay, loamy.'),
  weatherConditions: z
    .string()
    .describe('The current weather conditions, e.g., sunny, rainy, cloudy.'),
  state: z.string().describe('The state in which the farm is located.'),
  phValue: z.number().describe('The pH value of the soil.'),
});
export type CropRecommendationInput = z.infer<typeof CropRecommendationInputSchema>;

const CropRecommendationOutputSchema = z.object({
  recommendedCrops: z
    .array(z.string())
    .describe('An array of recommended crops based on the input data.'),
  reasons: z
    .array(z.string())
    .describe('Reasons for recommending each crop, e.g., drought resistance, high yield.'),
});
export type CropRecommendationOutput = z.infer<typeof CropRecommendationOutputSchema>;

export async function recommendBestCrops(
  input: CropRecommendationInput
): Promise<CropRecommendationOutput> {
  return recommendBestCropsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cropRecommendationPrompt',
  input: {schema: CropRecommendationInputSchema},
  output: {schema: CropRecommendationOutputSchema},
  prompt: `You are an expert agricultural advisor. Based on the soil nature, pH value, weather conditions, and state provided by the user, recommend the best crops to plant.

Soil Nature: {{{soilNature}}}
Soil pH: {{{phValue}}}
Weather Conditions: {{{weatherConditions}}}
State: {{{state}}}

Crucially, only recommend crops that are suitable for the given soil pH value. Consider the local climate, soil composition, and typical crop yields in the given state. Provide a list of recommended crops and a brief explanation for each recommendation, explicitly mentioning why it's suitable for the pH level.

Output the data as JSON in the following format:
\n{\n  "recommendedCrops": ["crop1", "crop2", ...],\n  "reasons": ["reason1", "reason2", ...]
}`,
});

const recommendBestCropsFlow = ai.defineFlow(
  {
    name: 'recommendBestCropsFlow',
    inputSchema: CropRecommendationInputSchema,
    outputSchema: CropRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
