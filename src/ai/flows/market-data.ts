
'use server';
/**
 * @fileOverview A flow for fetching market data.
 *
 * - getMarketData - A function that fetches market data for a given state.
 * - GetMarketDataInput - The input type for the getMarketData function.
 * - MarketData - The type for a single market data record.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const MarketDataSchema = z.object({
  state: z.string(),
  district: z.string(),
  market: z.string(),
  commodity: z.string(),
  variety: z.string(),
  arrival_date: z.string(),
  min_price: z.string(),
  max_price: z.string(),
  modal_price: z.string(),
});
export type MarketData = z.infer<typeof MarketDataSchema>;

const GetMarketDataInputSchema = z.object({
  state: z.string().describe('The state to fetch market data for.'),
});
export type GetMarketDataInput = z.infer<typeof GetMarketDataInputSchema>;


async function fetchWithTimeout(url: string, options: any = {}, timeout = 15000) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch market data. Status: ${response.status}. Body: ${errorText}`);
    }
    
    return response.json();

  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request to market data API timed out.');
    }
    if (error.message.includes('fetch failed')) {
        throw new Error('A network error occurred. This may be due to restrictions in the development environment that block outbound API calls. Consider using a proxy or serverless function to access the external API.');
    }
    console.error("Fetch error:", error);
    throw new Error(`A network error occurred: ${error.message}`);
  }
}

async function fetchMarketDataByState(state: string, limit: number = 2000): Promise<MarketData[]> {
  const apiKey = process.env.MARKET_DATA_API_KEY || '579b464db66ec23bdd0000018dbacdbba277486960fe9772d8ab4efb';
  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=${limit}&filters[state]=${encodeURIComponent(state)}`;
  
  const result = await fetchWithTimeout(url);
  return (result as any).records;
}


export async function getMarketData(
  input: GetMarketDataInput
): Promise<MarketData[]> {
  return getMarketDataFlow(input);
}


const getMarketDataFlow = ai.defineFlow(
  {
    name: 'getMarketDataFlow',
    inputSchema: GetMarketDataInputSchema,
    outputSchema: z.array(MarketDataSchema),
  },
  async ({ state }) => {
    const marketData = await fetchMarketDataByState(state);
    return marketData;
  }
);
