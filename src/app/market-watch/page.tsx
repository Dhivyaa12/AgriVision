
'use client';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import MarketWatchTable from '@/components/market-watch-table';
import { useTranslation } from '@/hooks/use-translation';

const texts = {
  title: "Market Watch",
  description: "Live Mandi (market) prices for various agricultural commodities from across the country.",
};

export default function MarketWatchPage() {
  const { t } = useTranslation(texts);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <PageHeader>
        <PageHeaderHeading className="font-headline">{t('title')}</PageHeaderHeading>
        <PageHeaderDescription>
          {t('description')}
        </PageHeaderDescription>
      </PageHeader>
      <div className="mt-8">
        <MarketWatchTable />
      </div>
    </div>
  );
}
