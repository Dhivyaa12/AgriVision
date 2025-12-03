
'use client';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { MarketAnalyserForm } from '@/components/forms/market-analyser-form';
import { useTranslation } from '@/hooks/use-translation';

const texts = {
  title: "Market Analyser",
  description: "Predict future commodity prices based on historical market data. Enter a commodity name to get started.",
};

export default function MarketAnalyserPage() {
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
        <MarketAnalyserForm />
      </div>
    </div>
  );
}
