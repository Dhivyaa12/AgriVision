'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TestTube, ChevronsRight } from 'lucide-react';
import { analyzeSensorData, type SensorAnalysisOutput } from '@/ai/flows/sensor-analysis';
import { useTranslation } from '@/hooks/use-translation';

const formSchema = z.object({
  state: z.string().min(1, 'Please select a state.'),
  soilType: z.string().min(1, 'Please select a soil type.'),
  phValue: z.coerce.number().min(0).max(14, 'pH must be between 0 and 14.'),
  moistureLevel: z.string().min(1, 'Please select a moisture level.'),
  temperature: z.coerce.number(),
  sunlightLevel: z.string().min(1, 'Please select a sunlight level.'),
  season: z.string().min(1, 'Please select a season.'),
});

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const texts = {
    formTitle: "Analyze Sensor Data",
    formDescription: "Fill in the details from your farm sensors to get an AI analysis.",
    stateLabel: "State",
    statePlaceholder: "Select your state",
    soilTypeLabel: "Soil Type",
    soilTypePlaceholder: "Select soil type",
    phLabel: "Soil pH Value",
    phPlaceholder: "e.g., 6.5",
    moistureLabel: "Moisture Level",
    moisturePlaceholder: "Select moisture level",
    tempLabel: "Temperature (°C)",
    tempPlaceholder: "e.g., 28",
    sunlightLabel: "Sunlight Level",
    sunlightPlaceholder: "Select sunlight level",
    seasonLabel: "Season",
    seasonPlaceholder: "Select season",
    analyzeButton: "Analyze Data",
    resultTitle: "Sensor Data Analysis",
    resultDescription: "AI-powered insights based on your sensor readings.",
    analysis: "Analysis",
    recommendations: "Recommendations",
    resultsPlaceholder: "Your analysis results will appear here.",
    quotaError: "You have exceeded your API quota. Please try again later or check your billing plan.",
};

export function SensorAnalysisForm() {
  const [result, setResult] = useState<SensorAnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation(texts);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        phValue: 7,
        temperature: 25,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await analyzeSensorData(values);
      setResult(response);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('429')) {
          setError(t('quotaError'));
      } else {
          setError('An error occurred during analysis.');
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
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('stateLabel')}</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder={t('statePlaceholder')} /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('seasonLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder={t('seasonPlaceholder')} /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                        <SelectItem value="Autumn">Autumn</SelectItem>
                        <SelectItem value="Winter">Winter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="soilType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('soilTypeLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder={t('soilTypePlaceholder')} /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Alluvial">Alluvial</SelectItem>
                        <SelectItem value="Black Cotton">Black Cotton</SelectItem>
                        <SelectItem value="Red Soil">Red Soil</SelectItem>
                        <SelectItem value="Laterite">Laterite</SelectItem>
                        <SelectItem value="Desert Soil">Desert Soil</SelectItem>
                        <SelectItem value="Mountain Soil">Mountain Soil</SelectItem>
                        <SelectItem value="Saline Soil">Saline Soil</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('phLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder={t('phPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="moistureLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('moistureLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder={t('moisturePlaceholder')} /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('tempLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t('tempPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sunlightLevel"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('sunlightLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder={t('sunlightPlaceholder')} /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('analyzeButton')}
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
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full mt-1">
                        <TestTube className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{t('analysis')}</h3>
                        <p className="text-sm text-muted-foreground">{result.analysis}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-accent/10 rounded-full mt-1">
                        <ChevronsRight className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{t('recommendations')}</h3>
                        <p className="text-sm text-muted-foreground">{result.recommendations}</p>
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
