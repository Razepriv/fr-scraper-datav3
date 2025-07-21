import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Try multiple possible environment variable names for the API key
const apiKey = process.env.GEMINI_API_KEY || 
               process.env.GOOGLE_GENAI_API_KEY || 
               process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error('❌ No API key found! Please set GEMINI_API_KEY, GOOGLE_GENAI_API_KEY, or GOOGLE_API_KEY');
}

export const ai = genkit({
  plugins: [googleAI({
    apiKey: apiKey,
  })],
  model: 'googleai/gemini-2.0-flash',
});
