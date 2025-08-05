
'use server';
/**
 * @fileOverview A market price prediction AI agent.
 *
 * - predictMarketPrice - A function that handles the price prediction process.
 * - MarketPricePredictionInput - The input type for the predictMarketPrice function.
 * - MarketPricePredictionOutput - The return type for the predictMarketPrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fetch from 'node-fetch';


export type MarketData = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
};

async function fetchAllMarketData(limit: number = 2000): Promise<MarketData[]> {
  const apiKey = '579b464db66ec23bdd0000018dbacdbba277486960fe9772d8ab4efb';
  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=${limit}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch market data.');
  }
  const result = await response.json();
  return (result as any).records;
}

const MarketPricePredictionInputSchema = z.object({
  commodity: z.string().describe('The name of the commodity to predict the price for.'),
});
export type MarketPricePredictionInput = z.infer<typeof MarketPricePredictionInputSchema>;

const MarketPricePredictionOutputSchema = z.object({
  analysis: z.string().describe('A brief analysis of the price trend.'),
  predictedPriceRange: z.string().describe('The predicted future price range for the commodity (e.g., "₹1200 - ₹1500 per quintal").'),
});
export type MarketPricePredictionOutput = z.infer<typeof MarketPricePredictionOutputSchema>;


export async function predictMarketPrice(
  input: MarketPricePredictionInput
): Promise<MarketPricePredictionOutput> {
  return predictMarketPriceFlow(input);
}


const prompt = ai.definePrompt({
  name: 'predictMarketPricePrompt',
  input: {schema: z.object({
    commodity: z.string(),
    marketData: z.string(),
  })},
  output: {schema: MarketPricePredictionOutputSchema},
  prompt: `You are an expert market analyst specializing in Indian agricultural commodities.
  
You have been provided with a JSON dataset of recent market prices for various commodities. Your task is to analyze this data and predict the future price for a specific commodity.

Commodity to Analyze: {{{commodity}}}

Historical Market Data (JSON):
\`\`\`json
{{{marketData}}}
\`\`\`

Based on the provided data, perform a brief analysis of the price trend and then provide a predicted price range for the commodity for the near future (e.g., next few weeks). Consider factors like price volatility, and recent min/max/modal prices in your analysis.`,
});

const predictMarketPriceFlow = ai.defineFlow(
  {
    name: 'predictMarketPriceFlow',
    inputSchema: MarketPricePredictionInputSchema,
    outputSchema: MarketPricePredictionOutputSchema,
  },
  async ({ commodity }) => {
    const allData = await fetchAllMarketData();
    const commodityData = allData.filter(item => item.commodity.toLowerCase() === commodity.toLowerCase());

    if (commodityData.length === 0) {
      throw new Error(`No market data found for commodity: ${commodity}`);
    }
    
    // Provide a sample of the data to the model to avoid exceeding token limits
    const dataSample = commodityData.slice(0, 100);

    const {output} = await prompt({
        commodity,
        marketData: JSON.stringify(dataSample, null, 2),
    });
    return output!;
  }
);
