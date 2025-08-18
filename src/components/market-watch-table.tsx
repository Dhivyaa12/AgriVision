
"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllMarketData } from '@/ai/flows/market-data';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

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


const MarketWatchTable: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <AlertTitle>Error Fetching Data</AlertTitle>
          <AlertDescription>
            Could not retrieve market data at this time. Please try again later.
            <p className="text-xs mt-2 font-mono">{error}</p>
          </AlertDescription>
        </Alert>
    );
  }

  if (marketData.length === 0) {
    return <p>No market data available.</p>;
  }

  return (
    <Table>
      <TableCaption>Daily Price Updates of Crops</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Commodity</TableHead>
          <TableHead>State</TableHead>
          <TableHead>District</TableHead>
          <TableHead>Market</TableHead>
          <TableHead>Variety</TableHead>
          <TableHead>Arrival Date</TableHead>
          <TableHead>Min Price (₹)</TableHead>
          <TableHead>Max Price (₹)</TableHead>
          <TableHead>Modal Price (₹)</TableHead>
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
