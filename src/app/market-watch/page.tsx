
'use client';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const texts = {
  title: "Market Watch",
  description: "Select a state to view daily Mandi prices for vegetables, grains, and other crops.",
};

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "National Capital Territory of Delhi"
];


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
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {indianStates.map((state) => (
          <Link href={`/market-watch/${encodeURIComponent(state)}`} key={state} passHref>
            <Card className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <span className="font-medium">{state}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
