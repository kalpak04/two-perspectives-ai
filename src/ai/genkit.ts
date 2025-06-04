import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Debug environment variables
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
  hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
});

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
    })
  ],
  model: 'googleai/gemini-2.0-flash',
});
