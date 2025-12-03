
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TestTube, ChevronsRight, Thermometer, Droplets, Sun, MapPin, Calendar, Cloudy, Sprout, Landmark, Building, PersonStanding, ExternalLink, CheckCircle } from 'lucide-react';
import { analyzeSensorData, type SensorAnalysisOutput } from '@/ai/flows/sensor-analysis';
import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


type SensorData = {
    State: string;
    Soil_Type: string;
    pH_Value: number;
    Moisture_Level: string;
    temperature: string;
    Sunlight_Level: string;
    Season: string;
    rowIndex: number;
}

interface SensorDataCardProps {
    data: SensorData;
}

const texts = {
    sensorReadings: "Current Sensor Readings",
    recordId: "Record ID",
    state: "State",
    season: "Season",
    soilType: "Soil Type",
    phValue: "pH Value",
    moisture: "Moisture",
    temperature: "Temperature",
    sunlight: "Sunlight",
    analyzeButton: "Analyze Data",
    resultTitle: "Comprehensive Analysis",
    resultDescription: "AI-powered insights, recommendations, and schemes.",
    analysis: "Soil Analysis",
    recommendations: "Recommendations",
    resultsPlaceholder: "Click 'Analyze Data' to see the AI-powered analysis.",
    quotaError: "You have exceeded your API quota. Please try again later or check your billing plan.",
    cropRecommendations: "Crop Recommendations",
    recommendedCrops: "Recommended Crops",
    governmentSchemes: "Government Schemes",
    centralSchemes: "Central Government Schemes",
    stateSchemes: "State Government Schemes",
    womenSchemes: "Women-Specific Schemes",
    noSchemes: "No specific schemes found.",
};

export function SensorDataCard({ data }: SensorDataCardProps) {
  const [result, setResult] = useState<SensorAnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation(texts);
  
  const parseTemperature = (tempRange: string) => {
    const numbers = tempRange.match(/\d+/g);
    if (!numbers) return 25; // Default value
    const avg = (parseInt(numbers[0]) + parseInt(numbers[1] || numbers[0])) / 2;
    return Math.round(avg);
  }

  const handleAnalyze = useCallback(async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await analyzeSensorData({
          state: data.State,
          soilType: data.Soil_Type,
          phValue: data.pH_Value,
          moistureLevel: data.Moisture_Level,
          temperature: parseTemperature(data.temperature),
          sunlightLevel: data.Sunlight_Level,
          season: data.Season,
      });
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
  }, [data, t]);

  useEffect(() => {
    handleAnalyze();
  }, [handleAnalyze]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline">{t('sensorReadings')}</CardTitle>
                        <CardDescription>{t('state')}: {data.State} | {t('season')}: {data.Season}</CardDescription>
                    </div>
                    <Badge variant="outline">{t('recordId')}: {data.rowIndex}</Badge>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Cloudy className="h-6 w-6 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">{t('soilType')}</p>
                        <p className="font-semibold">{data.Soil_Type}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <TestTube className="h-6 w-6 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">{t('phValue')}</p>
                        <p className="font-semibold">{data.pH_Value}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Droplets className="h-6 w-6 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">{t('moisture')}</p>
                        <p className="font-semibold">{data.Moisture_Level}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Thermometer className="h-6 w-6 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">{t('temperature')}</p>
                        <p className="font-semibold">{data.temperature}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 col-span-2">
                    <Sun className="h-6 w-6 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">{t('sunlight')}</p>
                        <p className="font-semibold">{data.Sunlight_Level}</p>
                    </div>
                </div>
            </CardContent>
             <CardFooter>
              <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('analyzeButton')}
              </Button>
            </CardFooter>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('resultTitle')}</CardTitle>
          <CardDescription>{t('resultDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[250px]">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          
          {result && !loading && (
             <Accordion type="multiple" className="w-full" defaultValue={['soil-analysis', 'crop-recs', 'gov-schemes']}>
                <AccordionItem value="soil-analysis">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <TestTube className="h-5 w-5 text-primary" />
                            {t('analysis')}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="text-sm text-muted-foreground">{result.analysis}</p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="crop-recs">
                     <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <Sprout className="h-5 w-5 text-primary" />
                            {t('cropRecommendations')}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                         <ul className="space-y-3">
                            {result.recommendedCrops.crops.map((crop, index) => (
                            <li key={index} className="pb-3 border-b border-border/50 last:border-b-0">
                                <p className="font-medium flex-1">{crop}</p>
                                {result.recommendedCrops.reasons[index] && (
                                <div className="flex items-start gap-2 mt-1">
                                    <CheckCircle className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                                    <p className="text-xs text-muted-foreground">{result.recommendedCrops.reasons[index]}</p>
                                </div>
                                )}
                            </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="gov-schemes">
                     <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-primary" />
                            {t('governmentSchemes')}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                       <Accordion type="multiple" className="w-full" defaultValue={['central', 'state', 'women']}>
                            <AccordionItem value="central">
                                <AccordionTrigger className="text-xs py-2">
                                <div className="flex items-center gap-2">
                                    <Landmark className="h-4 w-4" />
                                    {t('centralSchemes')}
                                </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2">
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    {result.governmentSchemes.centralSchemes.length > 0 ? result.governmentSchemes.centralSchemes.map((scheme, index) => (
                                    <li key={`central-${index}`} className="text-xs">
                                        <a href={scheme.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary flex items-center gap-1">
                                        {scheme.name}
                                        <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </li>
                                    )) : <li>{t('noSchemes')}</li>}
                                </ul>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="state">
                                <AccordionTrigger className="text-xs py-2">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    {t('stateSchemes')}
                                </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2">
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    {result.governmentSchemes.stateSchemes.length > 0 ? result.governmentSchemes.stateSchemes.map((scheme, index) => (
                                    <li key={`state-${index}`} className="text-xs">
                                        <a href={scheme.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary flex items-center gap-1">
                                        {scheme.name}
                                        <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </li>
                                    )) : <li>{t('noSchemes')}</li>}
                                </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="women">
                                <AccordionTrigger className="text-xs py-2">
                                <div className="flex items-center gap-2">
                                    <PersonStanding className="h-4 w-4" />
                                    {t('womenSchemes')}
                                </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2">
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    {result.governmentSchemes.womenSchemes.length > 0 ? result.governmentSchemes.womenSchemes.map((scheme, index) => (
                                    <li key={`women-${index}`} className="text-xs">
                                        <a href={scheme.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary flex items-center gap-1">
                                        {scheme.name}
                                        <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </li>
                                    )) : <li>{t('noSchemes')}</li>}
                                </ul>
                                </AccordionContent>
                            </AccordionItem>
                       </Accordion>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
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
