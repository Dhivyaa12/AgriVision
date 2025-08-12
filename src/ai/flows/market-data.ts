
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

let marketDataCache = {
  data: null as MarketData[] | null,
  lastUpdated: 0
};
const CACHE_TTL = 60 * 1000; // 1 minute

async function fetchWithRetry(url: string, retries = 3, delay = 2000, timeout = 30000) {
  const fetch = (await import('node-fetch')).default;
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      console.log(`Fetching market data from: ${url}`);
      const response = await fetch(url, {
        signal: controller.signal as any,
      });
      clearTimeout(id);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch market data. Status: ${response.status}. Body: ${errorText}`);
      }
      
      const result = await response.json();
      return result;

    } catch (error: any) {
      clearTimeout(id);
      if (i === retries - 1) {
        if (error.name === 'AbortError') {
          throw new Error('Request to market data API timed out after multiple retries.');
        }
        if (error.message.includes('fetch failed')) {
            throw new Error('A network error occurred. This may be due to restrictions in the development environment that block outbound API calls. Consider using a proxy or serverless function to access the external API.');
        }
        console.error("Fetch error after all retries:", error);
        throw new Error(`A network error occurred: ${error.message}`);
      }
      console.warn(`Retrying fetch... attempt ${i + 2}`);
      await new Promise(r => setTimeout(r, delay * (i + 1))); // exponential backoff
    }
  }
}

async function fetchAllMarketData(limit: number = 2000): Promise<MarketData[]> {
  const now = Date.now();
  if (marketDataCache.data && now - marketDataCache.lastUpdated < CACHE_TTL) {
    console.log("Serving market data from cache.");
    return marketDataCache.data;
  }
  
  const apiKey = process.env.MARKET_DATA_API_KEY;
  if (!apiKey) {
      throw new Error("MARKET_DATA_API_KEY is not set in the environment variables.");
  }
  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=${limit}`;
  
  const result = await fetchWithRetry(url);

  if (!result || !Array.isArray((result as any).records)) {
    console.warn("Market data API returned an unexpected response format:", result);
    return [];
  }
  
  marketDataCache = {
    data: (result as any).records,
    lastUpdated: now
  };
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
