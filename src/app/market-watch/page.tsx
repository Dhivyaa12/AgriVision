'use client';
import { useEffect, useState } from 'react';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { MarketWatchTable } from '@/components/market-watch-table';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function MarketWatchPage() {
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const apiKey = '579b464db66ec23bdd0000018dbacdbba277486960fe9772d8ab4efb';
        const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch market data.');
        }
        const result = await response.json();
        setData(result.records);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <PageHeader>
        <PageHeaderHeading className="font-headline">Market Watch</PageHeaderHeading>
        <PageHeaderDescription>
          Daily Mandi prices for vegetables, grains, and other crops across various markets.
        </PageHeaderDescription>
      </PageHeader>
      <div className="mt-8">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : (
          <MarketWatchTable data={data} />
        )}
      </div>
    </div>
  );
}
