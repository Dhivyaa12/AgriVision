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

async function fetchAllMarketData(limit: number = 2000): Promise<MarketData[]> {
  const apiKey = '579b464db66ec23bdd0000018dbacdbba277486960fe9772d8ab4efb';
  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=${limit}`;

  try {
    console.log(`Fetching market data from: ${url}`);
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch market data. Status: ${response.status}. Body: ${errorText}`);
    }

    const result = await response.json();

    if (!result || !Array.isArray((result as any).records)) {
      console.warn("Market data API returned an unexpected response format:", result);
      return [];
    }
    
    return (result as any).records;
  } catch (error: any) {
    console.error("Error fetching market data:", error);
    if (error.message.includes('invalid json')) {
        throw new Error('An unexpected response was received from the server. It was not valid JSON.');
    }
    throw new Error(`A network error occurred while fetching market data: ${error.message}`);
  }
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
