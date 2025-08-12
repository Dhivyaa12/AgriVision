
'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface MarketWatchTableProps {
    data: MarketData[];
}

const texts = {
    filterCommodities: "Filter commodities...",
    filterDistrict: "Filter by district...",
    allDistricts: "All Districts",
    noResults: "No results.",
    previous: "Previous",
    next: "Next",
    commodity: "Commodity",
    variety: "Variety",
    market: "Market",
    district: "District",
    state: "State",
    modalPrice: "Modal Price (₹)"
};

export function MarketWatchTable({ data }: MarketWatchTableProps) {
  const { t, currentLanguage } = useTranslation(texts);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const columns: ColumnDef<MarketData>[] = React.useMemo(() => [
    {
      accessorKey: 'commodity',
      header: t('commodity'),
      cell: info => info.getValue() || 'N/A',
    },
    {
      accessorKey: 'variety',
      header: t('variety'),
      cell: info => info.getValue() || 'N/A',
    },
    {
      accessorKey: 'market',
      header: t('market'),
      cell: info => info.getValue() || 'N/A',
    },
    {
      accessorKey: 'district',
      header: t('district'),
      cell: info => info.getValue() || 'N/A',
    },
    {
      accessorKey: 'state',
      header: t('state'),
      cell: info => info.getValue() || 'N/A',
    },
    {
      accessorKey: 'modal_price',
      header: () => <div className="text-right">{t('modalPrice')}</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('modal_price') || '0');
        const formatted = new Intl.NumberFormat('en-IN').format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
  ], [t, currentLanguage]);


  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 50,
      }
    }
  });

  const districts = React.useMemo(() => {
    const uniqueDistricts = [...new Set(data.map(item => item.district).filter(Boolean) as string[])];
    return uniqueDistricts.sort();
  }, [data]);

  return (
    <div>
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder={t('filterCommodities')}
          value={(table.getColumn('commodity')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('commodity')?.setFilterValue(event.target.value)}
          className="max-w-xs"
        />
        <Select
          value={(table.getColumn('district')?.getFilterValue() as string) ?? ''}
          onValueChange={(value) => table.getColumn('district')?.setFilterValue(value === 'all' ? '' : value)}
        >
          <SelectTrigger className="max-w-xs w-full">
            <SelectValue placeholder={t('filterDistrict')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allDistricts')}</SelectItem>
            {districts.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          {t('previous')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          {t('next')}
        </Button>
      </div>
    </div>
  );
}
