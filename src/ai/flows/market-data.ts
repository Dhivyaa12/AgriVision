'use server';
/**
 * @fileOverview A flow for fetching market data.
 *
 * - getAllMarketData - A function that fetches market data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import marketData from '@/lib/market-data.json';

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

export async function getAllMarketData(): Promise<MarketData[]> {
    return getAllMarketDataFlow();
}

const getAllMarketDataFlow = ai.defineFlow(
  {
    name: 'getAllMarketDataFlow',
    outputSchema: z.array(MarketDataSchema),
  },
  async () => {
    // Return data from the local JSON file
    return marketData as MarketData[];
  }
);
