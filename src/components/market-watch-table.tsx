
"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllMarketData } from '@/ai/flows/market-data';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useTranslation } from '@/hooks/use-translation';

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
  caption: "Daily Price Updates of Crops",
  commodity: "Commodity",
  state: "State",
  district: "District",
  market: "Market",
  variety: "Variety",
  arrivalDate: "Arrival Date",
  minPrice: "Min Price (₹)",
  maxPrice: "Max Price (₹)",
  modalPrice: "Modal Price (₹)",
  errorTitle: "Error Fetching Data",
  errorDescription: "Could not retrieve market data at this time. Please try again later.",
  noData: "No market data available.",
};


const MarketWatchTable: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation(texts);


  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllMarketData();
        setMarketData(data);
      } catch (err: any) {
        console.error("Error fetching market data:", err);
        setError(err.message || "An unknown error occurred while fetching market data.");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive">
          <AlertTitle>{t('errorTitle')}</AlertTitle>
          <AlertDescription>
            {t('errorDescription')}
            <p className="text-xs mt-2 font-mono">{error}</p>
          </AlertDescription>
        </Alert>
    );
  }

  if (marketData.length === 0) {
    return <p>{t('noData')}</p>;
  }

  return (
    <Table>
      <TableCaption>{t('caption')}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{t('commodity')}</TableHead>
          <TableHead>{t('state')}</TableHead>
          <TableHead>{t('district')}</TableHead>
          <TableHead>{t('market')}</TableHead>
          <TableHead>{t('variety')}</TableHead>
          <TableHead>{t('arrivalDate')}</TableHead>
          <TableHead>{t('minPrice')}</TableHead>
          <TableHead>{t('maxPrice')}</TableHead>
          <TableHead>{t('modalPrice')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {marketData.map((data, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{data.commodity || '-'}</TableCell>
            <TableCell>{data.state || '-'}</TableCell>
            <TableCell>{data.district || '-'}</TableCell>
            <TableCell>{data.market || '-'}</TableCell>
            <TableCell>{data.variety || '-'}</TableCell>
            <TableCell>{data.arrival_date || '-'}</TableCell>
            <TableCell>{data.min_price || '-'}</TableCell>
            <TableCell>{data.max_price || '-'}</TableCell>
            <TableCell>{data.modal_price || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MarketWatchTable;
