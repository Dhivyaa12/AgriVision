
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TestTube, ChevronsRight, Thermometer, Droplets, Sun, MapPin, Calendar, Cloudy } from 'lucide-react';
import { analyzeSensorData, type SensorAnalysisOutput } from '@/ai/flows/sensor-analysis';
import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';

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
    resultTitle: "Sensor Data Analysis",
    resultDescription: "AI-powered insights based on the sensor readings.",
    analysis: "Analysis",
    recommendations: "Recommendations",
    resultsPlaceholder: "Click 'Analyze Data' to see the AI-powered analysis.",
    quotaError: "You have exceeded your API quota. Please try again later or check your billing plan.",
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

  const handleAnalyze = async () => {
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
  };

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
