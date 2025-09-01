
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UploadCloud, Leaf, Bug, FlaskConical, ShieldCheck, Volume2, Mic, MicOff } from 'lucide-react';
import { diagnoseCrop, type DiagnoseCropOutput } from '@/ai/flows/crop-diagnosis';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { speechToText } from '@/ai/flows/speech-to-text';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import { translateText } from '@/ai/flows/translate-text';


const formSchema = z.object({
  photo: z.any().refine((file) => file?.[0], 'Please upload an image.'),
  description: z.string().optional(),
});

const languages = [
  { value: 'en', label: 'English', code: 'en-US' },
  { value: 'ta', label: 'Tamil', code: 'ta-IN' },
  { value: 'hi', label: 'Hindi', code: 'hi-IN' },
  { value: 'ml', label: 'Malayalam', code: 'ml-IN' },
  { value: 'te', label: 'Telugu', code: 'te-IN' },
  { value: 'kn', label: 'Kannada', code: 'kn-IN' },
];

const texts = {
    submitTitle: "Submit for Diagnosis",
    submitDescription: "Upload an image and describe the issue.",
    cropPhoto: "Crop Photo",
    uploadPrompt: "Click to upload",
    uploadOrDrag: "or drag and drop",
    fileTypes: "PNG, JPG or JPEG",
    symptomsLabel: "Description of Symptoms (Optional)",
    symptomsPlaceholder: "e.g., Yellow spots on leaves, wilting stems, etc. You can also use the microphone to record your description.",
    diagnoseButton: "Diagnose",
    resultTitle: "Diagnosis Result",
    resultDescription: "AI-powered analysis and recommendations.",
    language: "Language",
    listenButton: "Listen to diagnosis",
    disease: "Identified Disease",
    causes: "Possible Causes",
    remedies: "Recommended Remedies",
    prevention: "Preventive Measures",
    resultsPlaceholder: "Your diagnosis results will appear here.",
    quotaError: "You have exceeded your API quota. Please try again later or check your billing plan.",
};

export function CropDiagnosisForm() {
  const [result, setResult] = useState<DiagnoseCropOutput | null>(null);
  const [translatedResult, setTranslatedResult] = useState<DiagnoseCropOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingLoading, setRecordingLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
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
      description: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setResult(null);
    setTranslatedResult(null);
    setError(null);
    setAudioDataUri(null);

    try {
      const file = values.photo[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
            const photoDataUri = reader.result as string;
            const response = await diagnoseCrop({
              photoDataUri,
              description: values.description,
            });
            setResult(response);
            setTranslatedResult(response);
        } catch(e: any) {
            if (e.message?.includes('429')) {
                setError(t('quotaError'));
            } else {
                setError('An error occurred during diagnosis.');
            }
            console.error(e);
        } finally {
            setLoading(false);
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        setError('Failed to read the image file.');
        setLoading(false);
      };
    } catch (e) {
      console.error(e);
      setError('An error occurred during diagnosis.');
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
            result.diseaseName,
            result.possibleCauses,
            result.recommendedRemedies,
            result.preventiveMeasures,
        ];
        const combinedText = textsToTranslate.join('\n---\n');
        const translationResponse = await translateText({ text: combinedText, targetLanguage });
        const translatedParts = translationResponse.translatedText.split('\n---\n');

        setTranslatedResult({
            diseaseName: translatedParts[0] || result.diseaseName,
            possibleCauses: translatedParts[1] || result.possibleCauses,
            recommendedRemedies: translatedParts[2] || result.recommendedRemedies,
            preventiveMeasures: translatedParts[3] || result.preventiveMeasures,
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
        Disease: ${translatedResult.diseaseName}.
        Possible Causes: ${translatedResult.possibleCauses}.
        Recommended Remedies: ${translatedResult.recommendedRemedies}.
        Preventive Measures: ${translatedResult.preventiveMeasures}.
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
            const currentLangCode = languages.find(l => l.value === language)?.code || 'en-US';
            const { text } = await speechToText({ audioDataUri, language: currentLangCode });
            form.setValue('description', text);
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
          <CardTitle className="font-headline">{t('submitTitle')}</CardTitle>
          <CardDescription>{t('submitDescription')}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('cropPhoto')}</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50">
                          {preview ? (
                            <Image src={preview} alt="Preview" width={256} height={256} className="object-contain h-full w-full rounded-lg" />
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">{t('uploadPrompt')}</span> {t('uploadOrDrag')}</p>
                              <p className="text-xs text-muted-foreground">{t('fileTypes')}</p>
                            </div>
                          )}
                          <Input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/jpg"
                            onChange={(e) => {
                              field.onChange(e.target.files);
                              handleFileChange(e);
                            }}
                          />
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('symptomsLabel')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Textarea placeholder={t('symptomsPlaceholder')} {...field} />
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
                {t('diagnoseButton')}
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
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{translatedResult.diseaseName}</h3>
                  <p className="text-sm text-muted-foreground">{t('disease')}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Bug className="h-5 w-5 mt-1 text-accent flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">{t('causes')}</h4>
                    <p className="text-muted-foreground">{translatedResult.possibleCauses}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <FlaskConical className="h-5 w-5 mt-1 text-accent flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">{t('remedies')}</h4>
                    <p className="text-muted-foreground">{translatedResult.recommendedRemedies}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <ShieldCheck className="h-5 w-5 mt-1 text-accent flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">{t('prevention')}</h4>
                    <p className="text-muted-foreground">{translatedResult.preventiveMeasures}</p>
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

    

    