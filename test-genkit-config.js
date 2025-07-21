const { config } = require('dotenv');

// Load environment variables
config();

console.log('=== Genkit Configuration Test ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);

// Test if the googleAI plugin can initialize
try {
  // Simulate the genkit configuration
  console.log('\n=== Testing Google AI Plugin Initialization ===');
  
  // The googleAI plugin looks for GOOGLE_GENAI_API_KEY by default
  console.log('GOOGLE_GENAI_API_KEY present:', !!process.env.GOOGLE_GENAI_API_KEY);
  console.log('GOOGLE_GENAI_API_KEY length:', process.env.GOOGLE_GENAI_API_KEY?.length || 0);
  
  // Check all possible API key environment variables
  console.log('\n=== All Possible API Key Variables ===');
  const possibleKeys = [
    'GEMINI_API_KEY',
    'GOOGLE_GENAI_API_KEY', 
    'GOOGLE_AI_API_KEY',
    'GENAI_API_KEY'
  ];
  
  possibleKeys.forEach(key => {
    console.log(`${key}:`, process.env[key] ? `Present (${process.env[key].length} chars)` : 'Not found');
  });
  
} catch (error) {
  console.error('Error testing genkit config:', error);
}
