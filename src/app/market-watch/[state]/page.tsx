
'use client';
import { useEffect, useState } from 'react';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { MarketWatchTable } from '@/components/market-watch-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';

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

const texts = {
  title: "Market Watch for",
  description: "Daily Mandi prices for vegetables, grains, and other crops.",
  fetchError: "Failed to fetch market data. The external API might be temporarily unavailable. Please try again later.",
};

async function fetchMarketData(limit: number = 1000): Promise<MarketData[]> {
  const apiKey = '579b464db66ec23bdd0000018dbacdbba277486960fe9772d8ab4efb';
  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=${limit}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch market data.');
  }
  const result = await response.json();
  return result.records;
}

export default function StateMarketWatchPage({ params }: { params: { state: string } }) {
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation(texts);
  const stateName = params.state ? decodeURIComponent(params.state) : '';

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      if (!stateName) {
          setError("State not specified.");
          setLoading(false);
          return;
      }
      try {
        const allData = await fetchMarketData(5000); 
        const stateData = allData.filter(record => record.state === stateName);
        setData(stateData);
      } catch (err) {
        if (err instanceof Error) {
          setError(t('fetchError'));
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [stateName, t]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <PageHeader>
        <PageHeaderHeading className="font-headline">{t('title')} {stateName}</PageHeaderHeading>
        <PageHeaderDescription>
          {t('description')}
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
          <div className="text-destructive text-center">{error}</div>
        ) : (
          <MarketWatchTable data={data} />
        )}
      </div>
    </div>
  );
}
