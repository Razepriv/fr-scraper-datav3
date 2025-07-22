/**
 * Test scraping functionality to diagnose failure
 */

console.log('🔍 Testing Scraping Functionality');
console.log('==================================');

// Test basic scraping endpoint
async function testScraping() {
  try {
    console.log('📡 Testing scraping endpoint...');
    
    // Test with a simple URL first
    const testUrl = 'https://httpbin.org/html';
    console.log(`📋 Test URL: ${testUrl}`);
    
    const response = await fetch('http://localhost:9002/api/scrape/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: testUrl,
        autoSave: false
      })
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error Response:`, errorText);
      return;
    }
    
    const result = await response.json();
    console.log(`✅ API Response received:`, {
      success: result.success,
      propertiesCount: result.properties?.length || 0,
      message: result.message
    });
    
    if (result.error) {
      console.error(`❌ Scraping Error:`, result.error);
    }
    
  } catch (error) {
    console.error('❌ Test Failed:', error);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('🚫 Server not running! Please start the dev server:');
      console.log('   npm run dev');
    } else if (error.message.includes('fetch')) {
      console.log('🚫 Network error - check if server is accessible');
    }
  }
}

// Test server connectivity first
async function testServer() {
  try {
    console.log('🌐 Testing server connectivity...');
    const response = await fetch('http://localhost:9002', {
      method: 'HEAD'
    });
    console.log(`✅ Server responding: ${response.status}`);
    return true;
  } catch (error) {
    console.error('❌ Server not accessible:', error.message);
    return false;
  }
}

async function runDiagnostics() {
  const serverOnline = await testServer();
  
  if (serverOnline) {
    await testScraping();
  } else {
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Check if port 9002 is available');
    console.log('3. Verify no compilation errors in the console');
  }
  
  console.log('\n📋 Common Scraping Issues:');
  console.log('• Document size limits (>1MB)');
  console.log('• Image download failures');
  console.log('• Network connectivity issues');
  console.log('• Invalid URL format');
  console.log('• Target website blocking requests');
}

runDiagnostics().catch(console.error);
