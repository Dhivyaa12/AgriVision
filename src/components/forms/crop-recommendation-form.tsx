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
import { Loader2, Sprout, CheckCircle, Wind, MapPin, Cloudy } from 'lucide-react';
import { recommendBestCrops, type CropRecommendationOutput } from '@/ai/flows/crop-recommendation';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  soilNature: z.string().min(1, 'Please select a soil type.'),
  weatherConditions: z.string().min(1, 'Please describe the weather.'),
  state: z.string().min(2, 'Please enter a state.'),
});

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export function CropRecommendationForm() {
  const [result, setResult] = useState<CropRecommendationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    setError(null);
    try {
      const response = await recommendBestCrops(values);
      setResult(response);
    } catch (e) {
      console.error(e);
      setError('An error occurred while getting recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Get Crop Recommendations</CardTitle>
          <CardDescription>Fill in the details below to get AI-powered crop suggestions.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="soilNature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil Nature</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger>
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
                name="weatherConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Weather</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sunny, 28°C" {...field} />
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
                    <FormLabel>State</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger>
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
                Recommend Crops
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI Recommendations</CardTitle>
          <CardDescription>Crops best suited for your conditions.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          {result && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Recommended Crops:</h3>
              <ul className="space-y-3">
                {result.recommendedCrops.map((crop, index) => (
                  <li key={index} className="pb-3 border-b border-border/50 last:border-b-0">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Sprout className="h-5 w-5 text-primary" />
                      </div>
                      <p className="font-medium flex-1">{crop}</p>
                    </div>
                    {result.reasons[index] && (
                       <div className="flex items-start gap-4 mt-2 pl-4">
                         <CheckCircle className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                         <p className="text-sm text-muted-foreground">{result.reasons[index]}</p>
                       </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!loading && !result && !error && (
            <div className="text-center text-muted-foreground py-10">
              Your crop recommendations will appear here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
