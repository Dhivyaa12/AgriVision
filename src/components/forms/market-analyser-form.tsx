
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, TrendingUp, LineChart, Lightbulb } from 'lucide-react';
import { predictMarketPrice, type MarketPricePredictionOutput } from '@/ai/flows/market-price-prediction';
import { useTranslation } from '@/hooks/use-translation';
import { CartesianGrid, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, LineChart as RechartsLineChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';


const formSchema = z.object({
  description: z.string().min(3, 'Please enter a more detailed description.'),
});

const texts = {
    formTitle: "Predict Commodity Price",
    formDescription: "Describe the commodity you want a price prediction for.",
    commodityLabel: "Product Description",
    commodityPlaceholder: "e.g., 'I want to know the price for long-staple cotton from Gujarat.' or simply 'Paddy'",
    predictButton: "Predict Price",
    resultTitle: "Price Prediction Analysis",
    resultDescription: "AI-powered market analysis and price forecast.",
    analysis: "Analysis",
    priceForecast: "4-Week Price Forecast",
    suggestion: "AI Suggestion",
    resultsPlaceholder: "Your price prediction will appear here.",
    quotaError: "You have exceeded your API quota. Please try again later or check your billing plan.",
    noDataError: "No market data found for this commodity. It might be a rare commodity or the data is not available in the recent records. Please try a different one.",
    identificationError: "Could not identify a valid commodity from your description. Please be more specific.",
    networkError: "A network error occurred. This may be due to restrictions in the development environment that block outbound API calls. Consider using a proxy or serverless function to access the external API."
};

export function MarketAnalyserForm() {
  const [result, setResult] = useState<MarketPricePredictionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation(texts);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await predictMarketPrice({ commodity: values.description });
      setResult(response);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('429')) {
        setError(t('quotaError'));
      } else if (e.message?.includes('No market data found')) {
        setError(t('noDataError'));
      } else if (e.message?.includes('Could not identify a valid commodity')) {
        setError(t('identificationError'));
      } else if (e.message?.includes('network error occurred')) {
        setError(t('networkError'));
      }
       else {
        setError('An error occurred while predicting the price.');
      }
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    price: {
      label: "Price (₹)",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('formTitle')}</CardTitle>
          <CardDescription>{t('formDescription')}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('commodityLabel')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('commodityPlaceholder')} {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('predictButton')}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('resultTitle')}</CardTitle>
          <CardDescription>{t('resultDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center items-center h-full min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          
          {result && !loading && (
            <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('priceForecast')}</h3>
                   <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <RechartsLineChart data={result.weeklyForecast} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis domain={['dataMin - 100', 'dataMax + 100']} tickFormatter={(value) => `₹${value}`} />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line dataKey="price" type="monotone" stroke="var(--color-price)" strokeWidth={2} dot={{ fill: "var(--color-price)" }} activeDot={{ r: 6 }}/>
                    </RechartsLineChart>
                  </ChartContainer>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full mt-1">
                    <LineChart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t('analysis')}</h3>
                    <p className="text-sm text-muted-foreground">{result.analysis}</p>

                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-full mt-1">
                    <Lightbulb className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t('suggestion')}</h3>
                    <p className="text-sm font-bold text-accent-foreground">{result.suggestion}</p>
                  </div>
                </div>
            </div>
          )}
          {!loading && !result && !error && (
            <div className="text-center text-muted-foreground py-10">
              {t('resultsPlaceholder')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    
