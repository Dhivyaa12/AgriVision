
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/crop-diagnosis.ts';
import '@/ai/flows/government-scheme-recommendation.ts';
import '@/ai/flows/crop-recommendation.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/speech-to-text.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/market-price-prediction.ts';
import '@/ai/flows/sensor-analysis.ts';
import '@/ai/flows/market-data.ts';
import '@/ai/flows/auth.ts';
