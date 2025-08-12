
'use server';
/**
 * @fileOverview A flow for fetching market data.
 *
 * - getAllMarketData - A function that fetches market data for all states.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketDataSchema = z.object({
  state: z.string().nullable(),
  district: z.string().nullable(),
  market: z.string().nullable(),
  commodity: z.string().nullable(),
  variety: z.string().nullable(),
  arrival_date: z.string().nullable(),
  min_price: z.string().nullable(),
  max_price: z.string().nullable(),
  modal_price: z.string().nullable(),
});
type MarketData = z.infer<typeof MarketDataSchema>;


async function fetchWithTimeout(url: string, options: any = {}, timeout = 15000) {
  const fetch = (await import('node-fetch')).default;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal as any,
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

async function fetchAllMarketData(limit: number = 2000): Promise<MarketData[]> {
  const apiKey = process.env.MARKET_DATA_API_KEY;
  if (!apiKey) {
      throw new Error("MARKET_DATA_API_KEY is not set in the environment variables.");
  }
  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=${limit}`;
  
  const result = await fetchWithTimeout(url);
  if (!result || !Array.isArray((result as any).records)) {
    console.warn("Market data API returned an unexpected response format:", result);
    return [];
  }
  return (result as any).records;
}

export async function getAllMarketData(): Promise<MarketData[]> {
    return getAllMarketDataFlow();
}

const getAllMarketDataFlow = ai.defineFlow(
  {
    name: 'getAllMarketDataFlow',
    outputSchema: z.array(MarketDataSchema),
  },
  async () => {
    const marketData = await fetchAllMarketData(2000);
    return marketData;
  }
);
