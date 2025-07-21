// Test environment variable loading with dotenv
require('dotenv').config();

console.log('🔍 Testing Environment Variable Loading...');

console.log('\n📋 Environment Check (with dotenv):');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('STORAGE_TYPE:', process.env.STORAGE_TYPE);
console.log('UPLOAD_PROVIDER:', process.env.UPLOAD_PROVIDER);
console.log('ENABLE_AI_FEATURES:', process.env.ENABLE_AI_FEATURES);
console.log('GEMINI_API_KEY present:', process.env.GEMINI_API_KEY ? 'Yes (length: ' + process.env.GEMINI_API_KEY.length + ')' : 'No');

// Test if the key is valid format
if (process.env.GEMINI_API_KEY) {
  const key = process.env.GEMINI_API_KEY;
  if (key.startsWith('AIza')) {
    console.log('✅ GEMINI_API_KEY format looks correct');
  } else {
    console.log('❌ GEMINI_API_KEY format looks incorrect (should start with AIza)');
  }
} else {
  console.log('❌ GEMINI_API_KEY is missing - this is why you get dummy data!');
}

console.log('\n🔧 Solution:');
if (!process.env.GEMINI_API_KEY) {
  console.log('The AI extraction is failing because GEMINI_API_KEY is not loaded.');
  console.log('This causes the extractPropertyInfo function to return empty results.');
  console.log('When no properties are extracted, you see "dummy" or no data.');
  console.log('');
  console.log('Fix: Ensure your .env file is properly configured and loaded.');
} else {
  console.log('Environment variables are loaded correctly.');
}

// Test a simple AI call if possible
console.log('\n🤖 Testing AI Connection...');
try {
  // This will only work if we can import the AI modules
  console.log('Note: Full AI test requires running in Next.js environment');
  console.log('Environment setup is the key issue to fix first');
} catch (error) {
  console.log('Expected: Cannot test AI in pure Node.js environment');
}
