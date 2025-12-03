
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Landmark, Building, PersonStanding, Mic, MicOff, ExternalLink } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { recommendGovSchemes, type RecommendGovSchemesOutput } from '@/ai/flows/government-scheme-recommendation';
import { useTranslation } from '@/hooks/use-translation';
import { speechToText } from '@/ai/flows/speech-to-text';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  state: z.string().min(1, 'Please select a state.'),
  requirements: z.string().optional(),
});

const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const texts = {
    formTitle: "Find Government Schemes",
    formDescription: "Tell us your location and needs to find relevant schemes.",
    stateLabel: "State",
    statePlaceholder: "Select your state",
    requirementsLabel: "Your Requirements (Optional)",
    requirementsPlaceholder: "e.g., I need a subsidy for irrigation equipment, or I am a woman farmer looking for financial support. Leave blank for general schemes.",
    findSchemesButton: "Find Schemes",
    resultTitle: "Recommended Schemes",
    resultDescription: "AI-curated list of schemes for you.",
    centralSchemes: "Central Government Schemes",
    stateSchemes: "State Government Schemes",
    womenSchemes: "Women-Specific Schemes",
    noSchemes: "No specific schemes found based on your requirements.",
    resultsPlaceholder: "Your scheme recommendations will appear here."
};


export function GovernmentSchemesForm() {
  const [result, setResult] = useState<RecommendGovSchemesOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation(texts);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingLoading, setRecordingLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requirements: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await recommendGovSchemes({
        state: values.state,
        requirements: values.requirements,
      });
      setResult(response);
    } catch (e) {
      console.error(e);
      setError('An error occurred while fetching schemes.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        setRecordingLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const audioDataUri = reader.result as string;
          try {
            const { text } = await speechToText({ audioDataUri });
            form.setValue('requirements', (form.getValues('requirements') || '') + text);
          } catch (e) {
            console.error(e);
            setError('Failed to transcribe audio. Please try again.');
          } finally {
            setRecordingLoading(false);
          }
        };
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
      };
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please ensure you have given permission.");
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
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('requirementsLabel')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Textarea placeholder={t('requirementsPlaceholder')} {...field} />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={handleRecording}
                          disabled={recordingLoading}
                          className={cn(
                            "absolute bottom-2 right-2",
                            isRecording && "text-red-500 hover:text-red-600"
                          )}
                          title={isRecording ? "Stop recording" : "Start recording"}
                        >
                          {recordingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRecording ? <MicOff /> : <Mic />)}
                          <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('findSchemesButton')}
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
          {result && (
            <Accordion type="multiple" className="w-full" defaultValue={['central', 'state', 'women']}>
              <AccordionItem value="central">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-primary" />
                    {t('centralSchemes')}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    {result.centralSchemes.length > 0 ? result.centralSchemes.map((scheme, index) => (
                      <li key={index}>
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
                <AccordionTrigger>
                   <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    {t('stateSchemes')}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    {result.stateSchemes.length > 0 ? result.stateSchemes.map((scheme, index) => (
                      <li key={index}>
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
                <AccordionTrigger>
                   <div className="flex items-center gap-2">
                    <PersonStanding className="h-5 w-5 text-primary" />
                    {t('womenSchemes')}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                     {result.womenSchemes.length > 0 ? result.womenSchemes.map((scheme, index) => (
                      <li key={index}>
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
