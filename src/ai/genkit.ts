import { genkit } from 'genkit';
import { openAI, gpt4o, gpt4oMini } from 'genkitx-openai';

// Get OpenAI API key from environment
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ No OpenAI API key found! Please set OPENAI_API_KEY in your environment variables');
}

export const ai = genkit({
  plugins: [
    openAI({
      apiKey: apiKey,
    })
  ],
  model: gpt4oMini,
});
