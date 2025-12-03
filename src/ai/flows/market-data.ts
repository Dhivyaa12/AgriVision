'use server';
/**
 * @fileOverview A flow for fetching market data.
 *
 * - getAllMarketData - A function that fetches market data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import localMarketData from '@/lib/market-data.json';

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

let cachedData: MarketData[] | null = null;
let lastFetchTime: number | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function fetchAllMarketData(): Promise<MarketData[]> {
  const apiKey = process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
  const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
  const baseUrl = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json`;
  
  let allRecords: MarketData[] = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  while(hasMore) {
    const url = `${baseUrl}&offset=${offset}&limit=${limit}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.records && data.records.length > 0) {
        allRecords = allRecords.concat(data.records.map((record: any) => ({
            state: record.state || null,
            district: record.district || null,
            market: record.market || null,
            commodity: record.commodity || null,
            variety: record.variety || null,
            arrival_date: record.arrival_date || null,
            min_price: record.min_price || null,
            max_price: record.max_price || null,
            modal_price: record.modal_price || null,
        })));
        offset += data.records.length;
    } else {
        hasMore = false;
    }
    
    if (data.records.length < limit) {
        hasMore = false;
    }
  }
  
  return allRecords;
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
    const now = Date.now();
    if (cachedData && lastFetchTime && now - lastFetchTime < CACHE_DURATION) {
      return cachedData;
    }

    try {
      const data = await fetchAllMarketData();
      cachedData = data;
      lastFetchTime = now;
      return data;
    } catch (error: any) {
        console.error("Failed to fetch live data, falling back to local data.", error);
        return localMarketData as MarketData[];
    }
  }
);
