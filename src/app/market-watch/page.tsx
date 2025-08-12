
'use client';
import { useEffect, useState } from 'react';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { MarketWatchTable } from '@/components/market-watch-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { getAllMarketData } from '@/ai/flows/market-data';

// Define the MarketData type locally as it's not exported from the flow
type MarketData = {
  state: string | null;
  district: string | null;
  market: string | null;
  commodity: string | null;
  variety: string | null;
  arrival_date: string | null;
  min_price: string | null;
  max_price: string | null;
  modal_price: string | null;
};

const texts = {
  title: "Market Watch",
  description: "Daily Mandi prices for vegetables, grains, and other crops across all states.",
  fetchError: "Failed to fetch market data. The external API might be temporarily unavailable or has returned an empty list. Please try again later.",
  timeoutError: "The request to the market data API timed out. This may be due to high load on the external server. Please try again in a few moments."
};

export default function MarketWatchPage() {
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation(texts);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const allData = await getAllMarketData();
        if (allData && allData.length > 0) {
            setData(allData);
        } else {
            setError(t('fetchError'));
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes('timed out')) {
            setError(t('timeoutError'));
          } else {
            setError(`${t('fetchError')} Error: ${err.message}`);
          }
        } else {
          setError('An unknown error occurred.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [t]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <PageHeader>
        <PageHeaderHeading className="font-headline">{t('title')}</PageHeaderHeading>
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
          <div className="text-destructive text-center p-4 border border-destructive/50 rounded-md bg-destructive/10">{error}</div>
        ) : (
          <MarketWatchTable data={data} />
        )}
      </div>
    </div>
  );
}
