'use server';
/**
 * @fileOverview A flow for fetching market data with caching and retries.
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


let marketDataCache: {
  data: MarketData[] | null;
  lastUpdated: number;
} = {
  data: null,
  lastUpdated: 0,
};

const CACHE_TTL = 1000 * 60; // 60 seconds

async function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 20000 } = options; // 20-second timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}

async function fetchWithRetry(url: string, retries = 3, delay = 2000): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Fetching market data... Attempt ${i + 1}`);
            const response = await fetchWithTimeout(url);
            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }
             try {
                const result = await response.json();
                return result;
            } catch (e) {
                // If parsing fails, the body is not valid JSON.
                const rawText = await response.text();
                console.error("Failed to parse JSON response. Raw body:", rawText);
                throw new Error("An unexpected response was received from the server (not valid JSON).");
            }
        } catch (error: any) {
            console.warn(`Fetch attempt ${i + 1} failed: ${error.message}`);
            if (i === retries - 1) {
                console.error("All fetch attempts failed.");
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1))); // Exponential backoff
        }
    }
}


async function fetchAllMarketData(limit: number = 2000): Promise<MarketData[]> {
  const now = Date.now();
  if (marketDataCache.data && (now - marketDataCache.lastUpdated) < CACHE_TTL) {
      console.log("Returning market data from cache.");
      return marketDataCache.data;
  }

  const apiKey = process.env.MARKET_DATA_API_KEY || '579b464db66ec23bdd0000018dbacdbba277486960fe9772d8ab4efb';
  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=${limit}`;

  try {
    const result = await fetchWithRetry(url);

    if (!result || !Array.isArray((result as any).records)) {
      console.warn("Market data API returned an unexpected response format:", result);
      return [];
    }
    
    marketDataCache = {
        data: (result as any).records,
        lastUpdated: Date.now()
    };
    
    return (result as any).records;
  } catch (error: any) {
    console.error("Error fetching market data after all retries:", error);
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
