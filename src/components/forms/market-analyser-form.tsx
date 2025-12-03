
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, TrendingUp, LineChart, Lightbulb, Volume2 } from 'lucide-react';
import { predictMarketPrice, type MarketPricePredictionOutput } from '@/ai/flows/market-price-prediction';
import { useTranslation } from '@/hooks/use-translation';
import { CartesianGrid, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, LineChart as RechartsLineChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { useLanguage } from '@/hooks/use-language';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { translateText } from '@/ai/flows/translate-text';
import { textToSpeech } from '@/ai/flows/text-to-speech';

const formSchema = z.object({
  description: z.string().min(3, 'Please enter a more detailed description.'),
});

const languages = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'Tamil' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'te', label: 'Telugu' },
  { value: 'kn', label: 'Kannada' },
];

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
    networkError: "A network error occurred. This may be due to restrictions in the development environment that block outbound API calls. Consider using a proxy or serverless function to access the external API.",
    language: "Language",
    listenButton: "Listen to analysis",
};

export function MarketAnalyserForm() {
  const [result, setResult] = useState<MarketPricePredictionOutput | null>(null);
  const [translatedResult, setTranslatedResult] = useState<MarketPricePredictionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  
  const { t } = useTranslation(texts);
  const { language } = useLanguage();
  const [ttsLanguage, setTtsLanguage] = useState(language);

  useEffect(() => {
    setTtsLanguage(language);
  }, [language]);

  useEffect(() => {
    if (result && ttsLanguage) {
      translateResults(ttsLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ttsLanguage, result]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setResult(null);
    setTranslatedResult(null);
    setError(null);
    setAudioDataUri(null);

    try {
      const response = await predictMarketPrice({ commodity: values.description });
      setResult(response);
      setTranslatedResult(response);
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

  const translateResults = async (targetLanguage: string) => {
    if (!result) return;

    if (targetLanguage === 'en') {
        setTranslatedResult(result);
        return;
    }

    setTranslationLoading(true);
    try {
        const textsToTranslate = [
            result.analysis,
            result.suggestion,
            ...result.weeklyForecast.map(f => f.week),
        ];
        const combinedText = textsToTranslate.join('\n---\n');
        const translationResponse = await translateText({ text: combinedText, targetLanguage });
        const translatedParts = translationResponse.translatedText.split('\n---\n');

        const translatedForecast = result.weeklyForecast.map((forecast, index) => ({
            ...forecast,
            week: translatedParts[index + 2] || forecast.week
        }));

        setTranslatedResult({
            analysis: translatedParts[0] || result.analysis,
            suggestion: translatedParts[1] || result.suggestion,
            weeklyForecast: translatedForecast,
        });

    } catch (e: any) {
        console.error(e);
        if (e.message?.includes('429')) {
            setError(t('quotaError'));
        } else {
            setError('An error occurred during translation.');
        }
        setTranslatedResult(result); // Fallback to original
    } finally {
        setTranslationLoading(false);
    }
  };

   const handleListen = async () => {
    if (!translatedResult) return;
    setAudioLoading(true);
    setAudioDataUri(null);
    setError(null);
    try {
      const textToRead = `
        Market Analysis: ${translatedResult.analysis}.
        Suggestion: ${translatedResult.suggestion}.
      `;
      const response = await textToSpeech({ text: textToRead, language: ttsLanguage });
      setAudioDataUri(response.audioDataUri);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('429')) {
          setError(t('quotaError'));
      } else {
          setError('An error occurred during audio generation.');
      }
    } finally {
      setAudioLoading(false);
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
           <div className="flex flex-row items-start justify-between">
            <div>
                <CardTitle className="font-headline">{t('resultTitle')}</CardTitle>
                <CardDescription>{t('resultDescription')}</CardDescription>
            </div>
             {result && (
              <div className="flex items-center gap-2">
                <Select value={ttsLanguage} onValueChange={setTtsLanguage}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder={t('language')} />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={handleListen} disabled={audioLoading || translationLoading} title={t('listenButton')}>
                  {audioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                  <span className="sr-only">{t('listenButton')}</span>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {(loading || translationLoading) && (
            <div className="flex justify-center items-center h-full min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          
          {audioDataUri && (
            <div className="mb-4">
               <audio controls autoPlay className="w-full">
                <source src={audioDataUri} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          
          {translatedResult && !loading && !translationLoading && (
            <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('priceForecast')}</h3>
                   <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <RechartsLineChart data={translatedResult.weeklyForecast} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                    <p className="text-sm text-muted-foreground">{translatedResult.analysis}</p>

                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-full mt-1">
                    <Lightbulb className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{t('suggestion')}</h3>
                    <div className="mt-2 bg-accent/10 border-l-4 border-accent p-4 rounded-r-lg">
                      <p className="font-semibold text-accent-foreground">{translatedResult.suggestion}</p>
                    </div>
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

    

    

