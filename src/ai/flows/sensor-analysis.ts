'use server';

/**
 * @fileOverview This file contains the Genkit flow for analyzing sensor data from a farm.
 *
 * - analyzeSensorData - A function that handles the sensor data analysis process.
 * - SensorAnalysisInput - The input type for the analyzeSensorData function.
 * - SensorAnalysisOutput - The return type for the analyzeSensorData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SensorAnalysisInputSchema = z.object({
  state: z.string().describe('The state where the farm is located.'),
  soilType: z.string().describe('The type of soil (e.g., Laterite, Red Soil, Black Cotton).'),
  phValue: z.number().describe('The pH value of the soil.'),
  moistureLevel: z.string().describe('The moisture level (e.g., Low, Medium, High).'),
  temperature: z.number().describe('The current temperature in Celsius.'),
  sunlightLevel: z.string().describe('The level of sunlight exposure (e.g., Low, Moderate, High).'),
  season: z.string().describe('The current season (e.g., Spring, Summer, Autumn, Winter).'),
});
export type SensorAnalysisInput = z.infer<typeof SensorAnalysisInputSchema>;

const SensorAnalysisOutputSchema = z.object({
    analysis: z.string().describe("A detailed analysis of the provided sensor data, highlighting any potential issues or positive aspects."),
    recommendations: z.string().describe("Actionable recommendations based on the analysis, such as soil amendments, irrigation adjustments, or crop suitability notes."),
});
export type SensorAnalysisOutput = z.infer<typeof SensorAnalysisOutputSchema>;

export async function analyzeSensorData(
  input: SensorAnalysisInput
): Promise<SensorAnalysisOutput> {
  return sensorAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sensorAnalysisPrompt',
  input: {schema: SensorAnalysisInputSchema},
  output: {schema: SensorAnalysisOutputSchema},
  prompt: `You are an expert agricultural scientist. Analyze the following sensor data from a farm and provide a detailed analysis and actionable recommendations.

Location and Conditions:
- State: {{{state}}}
- Season: {{{season}}}

Soil Analysis:
- Soil Type: {{{soilType}}}
- pH Value: {{{phValue}}}
- Moisture Level: {{{moistureLevel}}}

Environmental Factors:
- Temperature: {{{temperature}}}°C
- Sunlight Level: {{{sunlightLevel}}}

Based on this data, provide:
1.  **Analysis**: A detailed interpretation of these conditions. Are the values within optimal ranges? What are the potential challenges or advantages?
2.  **Recommendations**: Specific, actionable advice. Suggest soil amendments, irrigation adjustments, or note which types of crops would be particularly well-suited or ill-suited to these conditions.`,
});

const sensorAnalysisFlow = ai.defineFlow(
  {
    name: 'sensorAnalysisFlow',
    inputSchema: SensorAnalysisInputSchema,
    outputSchema: SensorAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
