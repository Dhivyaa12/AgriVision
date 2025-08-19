
'use client';
import { useState } from 'react';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import MarketWatchTable from '@/components/market-watch-table';
import { useTranslation } from '@/hooks/use-translation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const texts = {
  title: "Market Watch",
  description: "Live Mandi (market) prices for various agricultural commodities from across the country.",
  filterByState: "Filter by State",
  selectState: "Select a State",
  allStates: "All States",
};

const indianStates = [
    "All States",
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function MarketWatchPage() {
  const { t } = useTranslation(texts);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const handleStateChange = (state: string) => {
    if (state === "All States") {
      setSelectedState(null);
    } else {
      setSelectedState(state);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <PageHeader>
        <PageHeaderHeading className="font-headline">{t('title')}</PageHeaderHeading>
        <PageHeaderDescription>
          {t('description')}
        </PageHeaderDescription>
      </PageHeader>
      <div className="mt-8">
        <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2">
                <Label htmlFor="state-filter" className="text-sm font-medium">{t('filterByState')}</Label>
                <Select onValueChange={handleStateChange} defaultValue="All States">
                    <SelectTrigger id="state-filter" className="w-[200px]">
                        <SelectValue placeholder={t('selectState')} />
                    </SelectTrigger>
                    <SelectContent>
                        {indianStates.map(state => (
                            <SelectItem key={state} value={state}>{state === "All States" ? t('allStates') : state}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <MarketWatchTable selectedState={selectedState} />
      </div>
    </div>
  );
}
