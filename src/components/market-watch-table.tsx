
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllMarketData } from '@/ai/flows/market-data';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from './ui/button';

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

interface MarketWatchTableProps {
  selectedState: string | null;
}

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
  noDataForState: "No market data available for the selected state.",
  page: "Page",
  previous: "Previous",
  next: "Next"
};


const MarketWatchTable: React.FC<MarketWatchTableProps> = ({ selectedState }) => {
  const [allMarketData, setAllMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const { t } = useTranslation(texts);


  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllMarketData();
        setAllMarketData(data);
      } catch (err: any) {
        console.error("Error fetching market data:", err);
        setError(err.message || "An unknown error occurred while fetching market data.");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  const filteredData = useMemo(() => {
    if (!selectedState) {
      return allMarketData;
    }
    return allMarketData.filter(item => item.state === selectedState);
  }, [allMarketData, selectedState]);
  
  useEffect(() => {
      // Reset to first page whenever filter changes
      setCurrentPage(1);
  }, [selectedState]);


  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

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
            <p className="text-xs mt-2 font-mono bg-destructive/10 p-2 rounded">{error}</p>
          </AlertDescription>
        </Alert>
    );
  }

  if (allMarketData.length === 0) {
    return <p>{t('noData')}</p>;
  }

  if (currentData.length === 0) {
      return (
          <div className="text-center text-muted-foreground py-10">
              {t('noDataForState')}
          </div>
      )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableCaption>{t('caption')}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>{t('commodity')}</TableHead>
              <TableHead>{t('state')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('district')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('market')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('variety')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('arrivalDate')}</TableHead>
              <TableHead>{t('minPrice')}</TableHead>
              <TableHead>{t('maxPrice')}</TableHead>
              <TableHead>{t('modalPrice')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((data, index) => (
              <TableRow key={`${data.state}-${data.market}-${data.commodity}-${index}`}>
                <TableCell className="font-medium">{data.commodity || '-'}</TableCell>
                <TableCell>{data.state || '-'}</TableCell>
                <TableCell className="hidden md:table-cell">{data.district || '-'}</TableCell>
                <TableCell className="hidden lg:table-cell">{data.market || '-'}</TableCell>
                <TableCell className="hidden lg:table-cell">{data.variety || '-'}</TableCell>
                <TableCell className="hidden md:table-cell">{data.arrival_date || '-'}</TableCell>
                <TableCell>{data.min_price || '-'}</TableCell>
                <TableCell>{data.max_price || '-'}</TableCell>
                <TableCell>{data.modal_price || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
            {t('page')} {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('previous')}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
            >
                {t('next')}
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            </div>
        </div>
      )}
    </>
  );
};

export default MarketWatchTable;
