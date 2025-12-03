
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sprout, CheckCircle, Volume2 } from 'lucide-react';
import { recommendBestCrops, type CropRecommendationOutput } from '@/ai/flows/crop-recommendation';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/hooks/use-language';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { translateText } from '@/ai/flows/translate-text';


const formSchema = z.object({
  soilNature: z.string().min(1, 'Please select a soil type.'),
  phValue: z.coerce.number().min(0).max(14, 'pH must be between 0 and 14.'),
  weatherConditions: z.string().min(1, 'Please describe the weather.'),
  state: z.string().min(2, 'Please enter a state.'),
});

const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];


const languages = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'Tamil' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'te', label: 'Telugu' },
  { value: 'kn', label: 'Kannada' },
];

const texts = {
    formTitle: "Get Crop Recommendations",
    formDescription: "Fill in the details below to get AI-powered crop suggestions.",
    soilLabel: "Soil Nature",
    soilPlaceholder: "Select soil type",
    phLabel: "Soil pH",
    phPlaceholder: "e.g., 6.5",
    weatherLabel: "Current Weather",
    weatherPlaceholder: "e.g., Sunny, 28°C",
    stateLabel: "State",
    statePlaceholder: "Select your state",
    recommendButton: "Recommend Crops",
    resultTitle: "AI Recommendations",
    resultDescription: "Crops best suited for your conditions.",
    recommendedCrops: "Recommended Crops:",
    resultsPlaceholder: "Your crop recommendations will appear here.",
    language: "Language",
    listenButton: "Listen to recommendations",
    quotaError: "You have exceeded your API quota. Please try again later or check your billing plan.",
};

type TranslatedResult = {
    recommendedCrops: string[];
    reasons: string[];
}

export function CropRecommendationForm() {
  const [result, setResult] = useState<CropRecommendationOutput | null>(null);
  const [translatedResult, setTranslatedResult] = useState<TranslatedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [translationLoading, setTranslationLoading] = useState(false);

  const { language } = useLanguage();
  const [ttsLanguage, setTtsLanguage] = useState(language);
  const { t } = useTranslation(texts);


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
      weatherConditions: '',
      state: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setResult(null);
    setTranslatedResult(null);
    setError(null);
    setAudioDataUri(null);
    try {
      const response = await recommendBestCrops(values);
      setResult(response);
      setTranslatedResult(response);
    } catch (e: any) {
      console.error(e);
       if (e.message?.includes('429')) {
          setError(t('quotaError'));
      } else {
          setError('An error occurred while getting recommendations.');
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
      const combinedTexts = [...result.recommendedCrops, ...result.reasons].join('\n---\n');
      const translationResponse = await translateText({ text: combinedTexts, targetLanguage });
      const translatedParts = translationResponse.translatedText.split('\n---\n');
      
      const translatedCrops = translatedParts.slice(0, result.recommendedCrops.length);
      const translatedReasons = translatedParts.slice(result.recommendedCrops.length);

      setTranslatedResult({
        recommendedCrops: translatedCrops,
        reasons: translatedReasons,
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
      let textToRead = `${t('recommendedCrops')}\n`;
      translatedResult.recommendedCrops.forEach((crop, index) => {
          textToRead += `${crop}. ${translatedResult.reasons[index] || ''}\n`;
      });

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


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('formTitle')}</CardTitle>
          <CardDescription>{t('formDescription')}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="soilNature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('soilLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder={t('soilPlaceholder')} /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sandy">Sandy</SelectItem>
                        <SelectItem value="clay">Clay</SelectItem>
                        <SelectItem value="loamy">Loamy</SelectItem>
                        <SelectItem value="silt">Silt</SelectItem>
                        <SelectItem value="peaty">Peaty</SelectItem>
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
                name="weatherConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('weatherLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('weatherPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('recommendButton')}
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
            <div className="flex justify-center items-center h-full">
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
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{t('recommendedCrops')}</h3>
              <ul className="space-y-3">
                {translatedResult.recommendedCrops.map((crop, index) => (
                  <li key={index} className="pb-3 border-b border-border/50 last:border-b-0">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Sprout className="h-5 w-5 text-primary" />
                      </div>
                      <p className="font-medium flex-1">{crop}</p>
                    </div>
                    {translatedResult.reasons[index] && (
                       <div className="flex items-start gap-4 mt-2 pl-4">
                         <CheckCircle className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                         <p className="text-sm text-muted-foreground">{translatedResult.reasons[index]}</p>
                       </div>
                    )}
                  </li>
                ))}
              </ul>
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
