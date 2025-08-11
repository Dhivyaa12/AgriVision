
'use client';
import { useEffect, useState } from 'react';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { MarketWatchTable } from '@/components/market-watch-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { getAllMarketData } from '@/ai/flows/market-data';
import type { MarketData } from '@/ai/flows/market-data';

const texts = {
  title: "Market Watch",
  description: "Daily Mandi prices for vegetables, grains, and other crops across all states.",
  fetchError: "Failed to fetch market data. The external API might be temporarily unavailable. Please try again later.",
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
        setData(allData);
      } catch (err) {
        if (err instanceof Error) {
          setError(t('fetchError'));
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
          <div className="text-destructive text-center">{error}</div>
        ) : (
          <MarketWatchTable data={data} />
        )}
      </div>
    </div>
  );
}
