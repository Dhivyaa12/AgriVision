
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, TrendingUp, LineChart } from 'lucide-react';
import { predictMarketPrice, type MarketPricePredictionOutput } from '@/ai/flows/market-price-prediction';
import { useTranslation } from '@/hooks/use-translation';

const formSchema = z.object({
  description: z.string().min(10, 'Please enter a more detailed description.'),
});

const texts = {
    formTitle: "Predict Commodity Price",
    formDescription: "Describe the commodity you want a price prediction for.",
    commodityLabel: "Product Description",
    commodityPlaceholder: "e.g., 'I want to know the price for long-staple cotton from Gujarat.'",
    predictButton: "Predict Price",
    resultTitle: "Price Prediction Analysis",
    resultDescription: "AI-powered market analysis and price forecast.",
    analysis: "Analysis",
    predictedPrice: "Predicted Price Range",
    resultsPlaceholder: "Your price prediction will appear here.",
    quotaError: "You have exceeded your API quota. Please try again later or check your billing plan.",
    noDataError: "No market data found for this commodity. Please try a different one."
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
      } else {
        setError('An error occurred while predicting the price.');
      }
    } finally {
      setLoading(false);
    }
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
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          
          {result && !loading && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <LineChart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{t('analysis')}</h3>
                  <p className="text-sm text-muted-foreground">{result.analysis}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">{t('predictedPrice')}</h3>
                  <p className="text-lg font-bold text-accent-foreground">{result.predictedPriceRange}</p>
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
