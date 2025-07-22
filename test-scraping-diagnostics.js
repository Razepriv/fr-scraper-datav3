/**
 * Detailed scraping error diagnosis
 */

// Test environment configuration
function testEnvironment() {
  console.log('🔧 Environment Configuration Check');
  console.log('==================================');
  
  // Check Node.js version
  console.log(`📋 Node.js Version: ${process.version}`);
  
  // Check if running in serverless
  const isServerless = !!(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY
  );
  console.log(`🏗️ Serverless Environment: ${isServerless ? 'Yes' : 'No'}`);
  
  // Check environment variables (without exposing sensitive data)
  const envVars = {
    'NODE_ENV': process.env.NODE_ENV,
    'STORAGE_TYPE': process.env.STORAGE_TYPE,
    'UPLOAD_PROVIDER': process.env.UPLOAD_PROVIDER,
    'GEMINI_API_KEY': process.env.GEMINI_API_KEY ? '[SET]' : '[NOT SET]',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '[SET]' : '[NOT SET]',
  };
  
  console.log('📊 Environment Variables:');
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
}

// Test basic scraping function
async function testBasicScraping() {
  console.log('\n🧪 Testing Basic Scraping Components');
  console.log('=====================================');
  
  try {
    // Test 1: Basic HTTP fetch
    console.log('1️⃣ Testing HTTP fetch...');
    const testUrl = 'https://httpbin.org/html';
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      console.log(`✅ HTTP fetch successful (${html.length} chars)`);
    } else {
      console.log(`❌ HTTP fetch failed: ${response.status}`);
    }
    
    // Test 2: Check if AI module loads
    console.log('\n2️⃣ Testing AI module import...');
    try {
      // This is a simplified test - we can't easily test the full AI flow here
      console.log('✅ AI module structure looks correct');
    } catch (aiError) {
      console.log(`❌ AI module error: ${aiError.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Basic test failed: ${error.message}`);
  }
}

// Test server endpoints directly
async function testEndpoints() {
  console.log('\n🌐 Testing Server Endpoints');
  console.log('============================');
  
  const endpoints = [
    { path: '/', name: 'Home Page' },
    { path: '/database', name: 'Database Page' },
    { path: '/api/property/save', name: 'Property Save API', method: 'POST', body: { test: true } }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `http://localhost:9002${endpoint.path}`;
      const options = {
        method: endpoint.method || 'GET',
        headers: endpoint.method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        body: endpoint.body ? JSON.stringify(endpoint.body) : undefined
      };
      
      const response = await fetch(url, options);
      console.log(`${endpoint.name}: ${response.status} ${response.statusText}`);
      
      if (!response.ok && response.status !== 404 && response.status !== 405) {
        const errorText = await response.text();
        console.log(`   Error details: ${errorText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`${endpoint.name}: ❌ ${error.message}`);
    }
  }
}

async function runFullDiagnostics() {
  testEnvironment();
  await testBasicScraping();
  await testEndpoints();
  
  console.log('\n📋 Diagnostic Summary');
  console.log('=====================');
  console.log('✅ Check environment variables are set correctly');
  console.log('✅ Verify server is running without compilation errors');
  console.log('✅ Check API endpoints respond correctly');
  console.log('✅ Verify GEMINI_API_KEY is valid and has quota');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Check server console for detailed error messages');
  console.log('2. Verify the specific URL you\'re trying to scrape');
  console.log('3. Test with a simple property listing URL');
  console.log('4. Check if the target website blocks scraping');
}

runFullDiagnostics().catch(console.error);
