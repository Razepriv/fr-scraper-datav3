// Diagnostic script to check if dummy data issue is from scraping or database
console.log('🔍 Diagnosing dummy data issue...');

// Check environment variables
console.log('\n📋 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('STORAGE_TYPE:', process.env.STORAGE_TYPE);
console.log('UPLOAD_PROVIDER:', process.env.UPLOAD_PROVIDER);
console.log('ENABLE_AI_FEATURES:', process.env.ENABLE_AI_FEATURES);
console.log('GEMINI_API_KEY present:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');

// Check AI configuration
console.log('\n🤖 AI Configuration:');
try {
  console.log('Checking if AI module loads...');
  // This will fail in Node.js but we can see the error
  const fs = require('fs');
  
  // Check if AI flow files exist
  const extractPath = './src/ai/flows/extract-property-info.ts';
  const enhancePath = './src/ai/flows/enhance-property-description.ts';
  
  if (fs.existsSync(extractPath)) {
    console.log('✅ Extract property info flow exists');
    const extractContent = fs.readFileSync(extractPath, 'utf8');
    if (extractContent.includes('properties: []')) {
      console.log('⚠️ Found empty properties fallback in extract flow');
    }
  } else {
    console.log('❌ Extract property info flow missing');
  }
  
  if (fs.existsSync(enhancePath)) {
    console.log('✅ Enhance property flow exists');
  } else {
    console.log('❌ Enhance property flow missing');
  }
  
} catch (error) {
  console.log('⚠️ Could not check AI files:', error.message);
}

// Check database configuration
console.log('\n🗄️ Database Configuration:');
try {
  const dbPath = './src/lib/db.ts';
  const fs = require('fs');
  
  if (fs.existsSync(dbPath)) {
    console.log('✅ Database module exists');
    const dbContent = fs.readFileSync(dbPath, 'utf8');
    
    // Check for test/dummy data
    if (dbContent.includes('dummy') || dbContent.includes('test data') || dbContent.includes('placeholder')) {
      console.log('⚠️ Found references to dummy/test data in database module');
    } else {
      console.log('✅ No obvious dummy data references in database module');
    }
    
    // Check for database adapter
    if (dbContent.includes('getDatabase()')) {
      console.log('✅ Uses database adapter pattern');
    }
  }
} catch (error) {
  console.log('⚠️ Could not check database files:', error.message);
}

// Check actions.ts for scraping logic
console.log('\n🕷️ Scraping Configuration:');
try {
  const actionsPath = './src/app/actions.ts';
  const fs = require('fs');
  
  if (fs.existsSync(actionsPath)) {
    console.log('✅ Actions module exists');
    const actionsContent = fs.readFileSync(actionsPath, 'utf8');
    
    // Check for auto-enhancement and auto-save
    if (actionsContent.includes('AUTO_ENHANCE_ENABLED')) {
      console.log('✅ Auto-enhancement feature present');
    }
    if (actionsContent.includes('AUTO_SAVE_ENABLED')) {
      console.log('✅ Auto-save feature present');
    }
    
    // Check for proper AI integration
    if (actionsContent.includes('extractPropertyInfo')) {
      console.log('✅ AI extraction integrated');
    } else {
      console.log('❌ AI extraction not found - this could cause dummy data');
    }
    
    // Check for fallback data
    if (actionsContent.includes('dummy') || actionsContent.includes('fallback') || actionsContent.includes('test')) {
      console.log('⚠️ Found references to dummy/fallback data in actions');
    }
  }
} catch (error) {
  console.log('⚠️ Could not check actions file:', error.message);
}

console.log('\n💡 Possible Causes of Dummy Data:');
console.log('1. AI extraction failing and returning empty results');
console.log('2. Network issues preventing real scraping');
console.log('3. Incorrect API keys or configuration');
console.log('4. Viewing old cached data instead of fresh scraping');
console.log('5. Development mode using test data instead of production scraping');

console.log('\n🔧 Quick Fixes to Try:');
console.log('1. Clear browser cache and database');
console.log('2. Verify GEMINI_API_KEY is working');
console.log('3. Test with a simple, well-structured property URL');
console.log('4. Check browser network tab for failed API calls');
console.log('5. Enable NODE_ENV=production if not already set');
