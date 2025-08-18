
'use server';
/**
 * @fileOverview A market price prediction AI agent.
 *
 * - predictMarketPrice - A function that handles the price prediction process.
 * - MarketPricePredictionInput - The input type for the predictMarketPrice function.
 * - MarketPricePredictionOutput - The return type for the predict_price function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getAllMarketData } from './market-data';

const MarketPricePredictionInputSchema = z.object({
  commodity: z.string().describe('A description from the user about the commodity they want a price prediction for. This could be a simple name like "Paddy" or a more descriptive sentence like "I want to know the price for high-quality wheat in Punjab".'),
});
export type MarketPricePredictionInput = z.infer<typeof MarketPricePredictionInputSchema>;

const WeeklyForecastSchema = z.object({
  week: z.string().describe('The week of the forecast (e.g., "Week 1", "Week 2").'),
  price: z.number().describe('The predicted modal price for that week.'),
});

const MarketPricePredictionOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis of the price trend based on historical data.'),
  weeklyForecast: z.array(WeeklyForecastSchema).describe('A 4-week price forecast for the commodity.'),
  suggestion: z.string().describe('An actionable suggestion for the user based on the forecast (e.g., whether to sell or hold).'),
});
export type MarketPricePredictionOutput = z.infer<typeof MarketPricePredictionOutputSchema>;


export async function predictMarketPrice(
  input: MarketPricePredictionInput
): Promise<MarketPricePredictionOutput> {
  return predictMarketPriceFlow(input);
}


const predictMarketPricePrompt = ai.definePrompt({
  name: 'predictMarketPricePrompt',
  input: {schema: z.object({
    commodity: z.string(),
    marketData: z.string(),
  })},
  output: { format: 'text' }, // Ask for simple text output
  prompt: `You are an expert market analyst specializing in Indian agricultural commodities.
  
You have been provided with a JSON dataset of recent market prices for a specific commodity. Your task is to analyze this historical data, predict the future price trend for the next 4 weeks, and provide a suggestion to the farmer.

Commodity to Analyze: {{{commodity}}}

Historical Market Data (JSON):
\`\`\`json
{{{marketData}}}
\`\`\`

1.  **Analysis**: Analyze the provided data to identify price trends, volatility, and any recurring patterns. Consider the 'arrival_date', 'min_price', 'max_price', and 'modal_price'. Write a brief report summarizing your findings.
2.  **4-Week Price Forecast**: Based on your analysis, provide a week-by-week predicted modal price for the commodity for the upcoming four weeks. The price should be a single number (e.g., 1500), not a range.
3.  **Suggestion**: Based on your forecast, provide a short, actionable suggestion to the farmer (e.g., "Prices are trending up, consider holding your stock for a couple of weeks for a better return." or "Market seems stable, selling now would be a safe choice.").

Respond in a clear, narrative format. Do not use JSON.`,
});

const jsonOutputFormatterPrompt = ai.definePrompt({
    name: 'jsonOutputFormatterPrompt',
    input: { schema: z.object({ text: z.string() }) },
    output: { schema: MarketPricePredictionOutputSchema },
    prompt: `Convert the following text into a structured JSON object.

The JSON object must have three keys: 'analysis', 'weeklyForecast', and 'suggestion'.
- 'analysis' should be a string containing the market analysis.
- 'weeklyForecast' should be an array of objects. Each object must have a 'week' (string) and a 'price' (number).
- 'suggestion' should be a string containing the actionable suggestion.

Example JSON output:
{
  "analysis": "The analysis of the market...",
  "weeklyForecast": [
    { "week": "Week 1", "price": 1500 },
    { "week": "Week 2", "price": 1550 },
    { "week": "Week 3", "price": 1520 },
    { "week": "Week 4", "price": 1580 }
  ],
  "suggestion": "It is a good time to sell."
}

Text to convert:
---
{{{text}}}
---
`,
});


const commodityIdentifierPrompt = ai.definePrompt({
    name: 'commodityIdentifierPrompt',
    input: { schema: z.object({
        description: z.string(),
        commoditiesList: z.array(z.string()),
    })},
    output: { schema: z.object({ commodity: z.string() }) },
    prompt: `From the user's description, identify the single most likely commodity they are asking about.
The commodity MUST be one of the items from the provided list.
    
User Description: "{{{description}}}"

Here is a list of available commodities from the market data. Find the best match:
{{#each commoditiesList}}
- {{{this}}}
{{/each}}
    
Respond with only the name of the most relevant commodity from the list. If you cannot find a clear match, respond with "Unknown".`,
});

const predictMarketPriceFlow = ai.defineFlow(
  {
    name: 'predictMarketPriceFlow',
    inputSchema: MarketPricePredictionInputSchema,
    outputSchema: MarketPricePredictionOutputSchema,
  },
  async ({ commodity: description }) => {
    const allData = await getAllMarketData();
    const uniqueCommodities = [...new Set(allData.map(item => item.commodity).filter(c => c) as string[])];

    const { output: identifiedCommodity } = await commodityIdentifierPrompt({
        description,
        commoditiesList: uniqueCommodities,
    });

    if (!identifiedCommodity || !identifiedCommodity.commodity || identifiedCommodity.commodity === 'Unknown') {
        throw new Error(`Could not identify a valid commodity from the description: "${description}"`);
    }
    
    const commodityToAnalyze = identifiedCommodity.commodity;

    const commodityData = allData.filter(item => item.commodity && item.commodity.toLowerCase() === commodityToAnalyze.toLowerCase());

    if (commodityData.length === 0) {
      throw new Error(`No market data found for commodity: ${commodityToAnalyze}. It might be a rare commodity or the data is not available in the recent records.`);
    }
    
    const dataSample = commodityData.slice(0, 100);

    // Step 1: Get the analysis as plain text.
    const { text } = await predictMarketPricePrompt({
        commodity: commodityToAnalyze,
        marketData: JSON.stringify(dataSample, null, 2),
    });

    // Step 2: Convert the text to structured JSON.
    const { output: structuredOutput } = await jsonOutputFormatterPrompt({ text });
    
    return structuredOutput!;
  }
);
