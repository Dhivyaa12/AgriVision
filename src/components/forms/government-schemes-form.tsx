'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Landmark, Building, PersonStanding } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { recommendGovSchemes, type RecommendGovSchemesOutput } from '@/ai/flows/government-scheme-recommendation';

const formSchema = z.object({
  state: z.string().min(1, 'Please select a state.'),
  requirements: z.string().min(10, 'Please describe your requirements.'),
});

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export function GovernmentSchemesForm() {
  const [result, setResult] = useState<RecommendGovSchemesOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      const response = await recommendGovSchemes(values);
      setResult(response);
    } catch (e) {
      console.error(e);
      setError('An error occurred while fetching schemes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Find Government Schemes</CardTitle>
          <CardDescription>Tell us your location and needs to find relevant schemes.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
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
              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Requirements</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., I need a subsidy for irrigation equipment, or I am a woman farmer looking for financial support." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Find Schemes
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recommended Schemes</CardTitle>
          <CardDescription>AI-curated list of schemes for you.</CardDescription>
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
                    Central Government Schemes
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    {result.centralSchemes.map((scheme, index) => <li key={index}>{scheme}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="state">
                <AccordionTrigger>
                   <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    State Government Schemes
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    {result.stateSchemes.map((scheme, index) => <li key={index}>{scheme}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="women">
                <AccordionTrigger>
                   <div className="flex items-center gap-2">
                    <PersonStanding className="h-5 w-5 text-primary" />
                    Women-Specific Schemes
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                     {result.womenSchemes.length > 0 ? result.womenSchemes.map((scheme, index) => <li key={index}>{scheme}</li>) : <li>No specific schemes found based on your requirements.</li>}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          {!loading && !result && !error && (
            <div className="text-center text-muted-foreground py-10">
              Your scheme recommendations will appear here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
