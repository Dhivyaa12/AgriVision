
'use server';

/**
 * @fileOverview This file contains the Genkit flow for analyzing sensor data from a farm,
 * and integrating crop and government scheme recommendations.
 *
 * - analyzeSensorData - A function that handles the sensor data analysis process.
 * - SensorAnalysisInput - The input type for the analyzeSensorData function.
 * - SensorAnalysisOutput - The return type for the analyzeSensorData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { recommendBestCrops } from './crop-recommendation';
import { recommendGovSchemes } from './government-scheme-recommendation';


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


const SchemeSchema = z.object({
    name: z.string().describe('The full name of the government scheme.'),
    url: z.string().describe('The official government URL for the scheme.'),
});

const SensorAnalysisOutputSchema = z.object({
    analysis: z.string().describe("A short, summarized analysis of the provided soil and environmental conditions."),
    recommendedCrops: z.object({
        crops: z.array(z.string()).describe('An array of recommended crops based on the input data.'),
        reasons: z.array(z.string()).describe('Reasons for recommending each crop.'),
    }),
    governmentSchemes: z.object({
        centralSchemes: z.array(SchemeSchema).describe('Relevant Central Government Schemes.'),
        stateSchemes: z.array(SchemeSchema).describe('Applicable State Government Schemes.'),
        womenSchemes: z.array(SchemeSchema).describe('Women-specific agricultural schemes.'),
    }),
});
export type SensorAnalysisOutput = z.infer<typeof SensorAnalysisOutputSchema>;

export async function analyzeSensorData(
  input: SensorAnalysisInput
): Promise<SensorAnalysisOutput> {
  return sensorAnalysisFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'sensorAnalysisPrompt',
  input: {schema: SensorAnalysisInputSchema},
  output: {schema: z.object({ analysis: z.string() })},
  prompt: `You are an expert agricultural scientist. Analyze the following sensor data from a farm and provide a short, summarized analysis of the soil and environmental conditions.

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

Provide a brief, one or two sentence summary of the conditions. For example: "The soil is slightly alkaline with high moisture, which is suitable for monsoon crops."`,
});

const sensorAnalysisFlow = ai.defineFlow(
  {
    name: 'sensorAnalysisFlow',
    inputSchema: SensorAnalysisInputSchema,
    outputSchema: SensorAnalysisOutputSchema,
  },
  async (input) => {
    // 1. Get soil analysis
    const { output: analysisResult } = await analysisPrompt(input);
    
    // 2. Get crop recommendations
    const cropRecs = await recommendBestCrops({
        soilNature: input.soilType,
        phValue: input.phValue,
        weatherConditions: `${input.sunlightLevel} sunlight, ${input.temperature}°C, ${input.season} season.`,
        state: input.state,
    });

    // 3. Get government schemes
    const govSchemes = await recommendGovSchemes({
        state: input.state,
        // Using a general requirement to fetch broad schemes relevant to the analysis
        requirements: `Schemes for a farmer with ${input.soilType} soil, dealing with ${input.moistureLevel} moisture.`
    });

    return {
      analysis: analysisResult!.analysis,
      recommendedCrops: {
        crops: cropRecs.recommendedCrops,
        reasons: cropRecs.reasons,
      },
      governmentSchemes: {
        centralSchemes: govSchemes.centralSchemes,
        stateSchemes: govSchemes.stateSchemes,
        womenSchemes: govSchemes.womenSchemes,
      },
    };
  }
);
