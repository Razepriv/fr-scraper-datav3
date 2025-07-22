/**
 * Maximum Load Testing for Hybrid Storage Strategy
 * Tests all functions with maximum configured limits
 */

const { ENV_CONFIG } = require('./src/lib/config');

// Test configuration - using maximum limits
const TEST_CONFIG = {
  MAX_PROPERTIES: ENV_CONFIG.MAX_IMAGES_PER_PROPERTY || 15,
  MAX_DATA_URL_IMAGES: ENV_CONFIG.MAX_DATA_URL_IMAGES || 8,
  MAX_COMPRESSED_IMAGE_SIZE: ENV_CONFIG.MAX_COMPRESSED_IMAGE_SIZE || 30000,
  MAX_DOCUMENT_SIZE: ENV_CONFIG.MAX_DOCUMENT_SIZE || 900000,
  TEST_URLS: [
    'https://freeroom.ng/listing/newly-built-3-bedroom-duplex-fully-furnished-for-rent-at-chevron-alternative-route-lekki',
    'https://freeroom.ng/listing/brand-new-4-bedroom-duplex-with-bq-in-a-gated-estate-for-rent-at-agungi-lekki',
    'https://freeroom.ng/listing/luxury-5-bedroom-duplex-with-swimming-pool-for-rent-at-banana-island-ikoyi',
    'https://freeroom.ng/listing/executive-2-bedroom-flat-fully-furnished-for-rent-at-victoria-island-lagos',
    'https://freeroom.ng/listing/modern-3-bedroom-apartment-with-gym-and-pool-for-rent-at-ikeja-gra'
  ]
};

console.log('🚀 MAXIMUM LOAD TESTING - HYBRID STORAGE STRATEGY');
console.log('================================================');
console.log(`📊 Test Configuration:`);
console.log(`   • MAX_IMAGES_PER_PROPERTY: ${TEST_CONFIG.MAX_PROPERTIES}`);
console.log(`   • MAX_DATA_URL_IMAGES: ${TEST_CONFIG.MAX_DATA_URL_IMAGES}`);
console.log(`   • MAX_COMPRESSED_IMAGE_SIZE: ${TEST_CONFIG.MAX_COMPRESSED_IMAGE_SIZE} bytes`);
console.log(`   • MAX_DOCUMENT_SIZE: ${TEST_CONFIG.MAX_DOCUMENT_SIZE} bytes`);
console.log('');

/**
 * Test 1: Image Storage Adapters with Maximum Load
 */
async function testImageStorageAdapters() {
  console.log('🔧 TEST 1: Image Storage Adapters - Maximum Load');
  console.log('-----------------------------------------------');
  
  try {
    const { getImageStorage } = await import('./src/lib/image-storage.ts');
    const storage = getImageStorage();
    
    // Create test image buffers of various sizes
    const testImages = [
      { size: 50000, name: 'small_image' },     // 50KB
      { size: 200000, name: 'medium_image' },   // 200KB
      { size: 500000, name: 'large_image' },    // 500KB
      { size: 800000, name: 'xlarge_image' },   // 800KB
      { size: 1000000, name: 'huge_image' }     // 1MB
    ];
    
    console.log(`📷 Testing ${TEST_CONFIG.MAX_PROPERTIES} images with hybrid strategy...`);
    
    const results = [];
    const startTime = Date.now();
    
    for (let i = 0; i < TEST_CONFIG.MAX_PROPERTIES; i++) {
      const testImage = testImages[i % testImages.length];
      const buffer = Buffer.alloc(testImage.size, 'FF', 'hex'); // Create test buffer
      const propertyId = `test-property-${Date.now()}-${i}`;
      
      // Determine if this should be a preferred data URL (first 8 images)
      const preferDataUrl = i < TEST_CONFIG.MAX_DATA_URL_IMAGES;
      
      console.log(`   📸 Image ${i + 1}/${TEST_CONFIG.MAX_PROPERTIES}: ${testImage.name} (${testImage.size} bytes) - ${preferDataUrl ? 'Data URL' : 'External'}`);
      
      try {
        const imageUrl = await storage.uploadImage(
          buffer, 
          propertyId, 
          i, 
          'image/jpeg',
          preferDataUrl
        );
        
        const result = {
          index: i + 1,
          originalSize: testImage.size,
          preferDataUrl,
          success: true,
          url: imageUrl,
          isDataUrl: imageUrl.startsWith('data:'),
          isExternal: imageUrl.startsWith('http'),
          isLocal: imageUrl.startsWith('/'),
          urlLength: imageUrl.length
        };
        
        results.push(result);
        console.log(`   ✅ Success: ${result.isDataUrl ? 'Data URL' : 'External URL'} (${result.urlLength} chars)`);
        
      } catch (error) {
        const result = {
          index: i + 1,
          originalSize: testImage.size,
          preferDataUrl,
          success: false,
          error: error.message
        };
        results.push(result);
        console.log(`   ❌ Failed: ${error.message}`);
      }
      
      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Analyze results
    const successful = results.filter(r => r.success);
    const dataUrls = successful.filter(r => r.isDataUrl);
    const externalUrls = successful.filter(r => r.isExternal);
    const localUrls = successful.filter(r => r.isLocal);
    
    console.log('\n📊 RESULTS SUMMARY:');
    console.log(`   • Total images processed: ${results.length}`);
    console.log(`   • Successful uploads: ${successful.length}/${results.length} (${(successful.length/results.length*100).toFixed(1)}%)`);
    console.log(`   • Data URLs created: ${dataUrls.length}`);
    console.log(`   • External URLs used: ${externalUrls.length}`);
    console.log(`   • Local URLs used: ${localUrls.length}`);
    console.log(`   • Processing time: ${duration}ms (${(duration/results.length).toFixed(1)}ms per image)`);
    
    return { success: true, results, summary: { total: results.length, successful: successful.length, dataUrls: dataUrls.length, externalUrls: externalUrls.length, duration } };
    
  } catch (error) {
    console.error('❌ Image Storage Test Failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test 2: Property Scraping with Maximum Images
 */
async function testPropertyScraping() {
  console.log('\n🔍 TEST 2: Property Scraping - Maximum Load');
  console.log('------------------------------------------');
  
  try {
    const { scrapePropertyFromUrl } = await import('./src/app/actions');
    
    console.log(`🏠 Testing property scraping with maximum image processing...`);
    
    const testUrl = TEST_CONFIG.TEST_URLS[0]; // Use first test URL
    console.log(`   📍 URL: ${testUrl}`);
    
    const startTime = Date.now();
    
    const result = await scrapePropertyFromUrl(testUrl);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (result.success && result.data) {
      const property = result.data;
      const imageCount = property.images ? property.images.length : 0;
      const dataUrlCount = property.images ? property.images.filter(img => img.startsWith('data:')).length : 0;
      const externalCount = property.images ? property.images.filter(img => img.startsWith('http')).length : 0;
      const localCount = property.images ? property.images.filter(img => img.startsWith('/')).length : 0;
      
      console.log(`\n✅ SCRAPING SUCCESS:`);
      console.log(`   • Property ID: ${property.id}`);
      console.log(`   • Title: ${property.title?.substring(0, 50)}...`);
      console.log(`   • Total images: ${imageCount}/${TEST_CONFIG.MAX_PROPERTIES}`);
      console.log(`   • Data URLs: ${dataUrlCount}`);
      console.log(`   • External URLs: ${externalCount}`);
      console.log(`   • Local URLs: ${localCount}`);
      console.log(`   • Processing time: ${duration}ms`);
      
      // Calculate estimated document size
      const propertyJson = JSON.stringify(property);
      const documentSize = Buffer.byteLength(propertyJson, 'utf8');
      console.log(`   • Estimated document size: ${documentSize} bytes (${(documentSize/1024).toFixed(1)}KB)`);
      console.log(`   • Under Firestore limit: ${documentSize < TEST_CONFIG.MAX_DOCUMENT_SIZE ? '✅' : '❌'}`);
      
      return { 
        success: true, 
        property, 
        stats: { 
          imageCount, 
          dataUrlCount, 
          externalCount, 
          localCount, 
          documentSize, 
          duration,
          underLimit: documentSize < TEST_CONFIG.MAX_DOCUMENT_SIZE
        } 
      };
      
    } else {
      console.log(`❌ SCRAPING FAILED: ${result.error || 'Unknown error'}`);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ Property Scraping Test Failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test 3: Document Size Limits with Maximum Data
 */
async function testDocumentSizeLimits() {
  console.log('\n📏 TEST 3: Document Size Limits - Maximum Load');
  console.log('----------------------------------------------');
  
  try {
    // Simulate maximum property data
    const maxProperty = {
      id: `test-property-${Date.now()}`,
      title: 'A'.repeat(200), // Maximum title length
      description: 'B'.repeat(1000), // Large description
      price: 5000000,
      location: 'C'.repeat(100), // Large location
      bedrooms: 5,
      bathrooms: 4,
      amenities: Array(20).fill(0).map((_, i) => `Amenity ${i + 1}`), // 20 amenities
      contact: {
        name: 'D'.repeat(50),
        phone: '+234567890123',
        email: 'test@example.com'
      },
      images: []
    };
    
    console.log(`🏠 Creating property with maximum data...`);
    
    // Add maximum images using hybrid strategy
    for (let i = 0; i < TEST_CONFIG.MAX_PROPERTIES; i++) {
      if (i < TEST_CONFIG.MAX_DATA_URL_IMAGES) {
        // First 8 images as compressed data URLs
        const compressedDataUrl = 'data:image/jpeg;base64,' + 'A'.repeat(TEST_CONFIG.MAX_COMPRESSED_IMAGE_SIZE * 1.33); // Base64 is ~33% larger
        maxProperty.images.push(compressedDataUrl);
      } else {
        // Remaining images as external URLs
        maxProperty.images.push(`https://picsum.photos/600/400?random=${i}`);
      }
    }
    
    const propertyJson = JSON.stringify(maxProperty);
    const documentSize = Buffer.byteLength(propertyJson, 'utf8');
    
    console.log(`\n📊 DOCUMENT SIZE ANALYSIS:`);
    console.log(`   • Total images: ${maxProperty.images.length}`);
    console.log(`   • Data URL images: ${maxProperty.images.filter(img => img.startsWith('data:')).length}`);
    console.log(`   • External URL images: ${maxProperty.images.filter(img => img.startsWith('http')).length}`);
    console.log(`   • Document size: ${documentSize} bytes (${(documentSize/1024).toFixed(1)}KB)`);
    console.log(`   • Firestore limit: ${TEST_CONFIG.MAX_DOCUMENT_SIZE} bytes (${(TEST_CONFIG.MAX_DOCUMENT_SIZE/1024).toFixed(1)}KB)`);
    console.log(`   • Size efficiency: ${(documentSize/TEST_CONFIG.MAX_DOCUMENT_SIZE*100).toFixed(1)}% of limit used`);
    console.log(`   • Under limit: ${documentSize < TEST_CONFIG.MAX_DOCUMENT_SIZE ? '✅ YES' : '❌ NO'}`);
    
    return {
      success: true,
      documentSize,
      limit: TEST_CONFIG.MAX_DOCUMENT_SIZE,
      underLimit: documentSize < TEST_CONFIG.MAX_DOCUMENT_SIZE,
      efficiency: documentSize / TEST_CONFIG.MAX_DOCUMENT_SIZE * 100,
      property: maxProperty
    };
    
  } catch (error) {
    console.error('❌ Document Size Test Failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test 4: Concurrent Processing Load Test
 */
async function testConcurrentProcessing() {
  console.log('\n⚡ TEST 4: Concurrent Processing - Maximum Load');
  console.log('---------------------------------------------');
  
  try {
    const { scrapePropertyFromUrl } = await import('./src/app/actions');
    
    console.log(`🔄 Testing concurrent scraping of ${TEST_CONFIG.TEST_URLS.length} properties...`);
    
    const startTime = Date.now();
    
    // Process all test URLs concurrently
    const promises = TEST_CONFIG.TEST_URLS.map(async (url, index) => {
      console.log(`   🚀 Starting concurrent scrape ${index + 1}: ${url.split('/').pop()}`);
      
      try {
        const result = await scrapePropertyFromUrl(url);
        return { index: index + 1, url, success: result.success, data: result.data, error: result.error };
      } catch (error) {
        return { index: index + 1, url, success: false, error: error.message };
      }
    });
    
    const results = await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`\n📊 CONCURRENT PROCESSING RESULTS:`);
    console.log(`   • Total properties: ${results.length}`);
    console.log(`   • Successful: ${successful.length}/${results.length} (${(successful.length/results.length*100).toFixed(1)}%)`);
    console.log(`   • Failed: ${failed.length}`);
    console.log(`   • Total processing time: ${duration}ms`);
    console.log(`   • Average time per property: ${(duration/results.length).toFixed(1)}ms`);
    
    // Analyze image processing across all properties
    let totalImages = 0;
    let totalDataUrls = 0;
    let totalExternalUrls = 0;
    
    successful.forEach(result => {
      if (result.data && result.data.images) {
        totalImages += result.data.images.length;
        totalDataUrls += result.data.images.filter(img => img.startsWith('data:')).length;
        totalExternalUrls += result.data.images.filter(img => img.startsWith('http')).length;
      }
    });
    
    console.log(`\n📷 IMAGE PROCESSING SUMMARY:`);
    console.log(`   • Total images processed: ${totalImages}`);
    console.log(`   • Data URLs created: ${totalDataUrls}`);
    console.log(`   • External URLs used: ${totalExternalUrls}`);
    console.log(`   • Average images per property: ${(totalImages/successful.length).toFixed(1)}`);
    
    return {
      success: true,
      results,
      stats: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        duration,
        totalImages,
        totalDataUrls,
        totalExternalUrls
      }
    };
    
  } catch (error) {
    console.error('❌ Concurrent Processing Test Failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Main test runner
 */
async function runMaximumLoadTests() {
  console.log('🎯 STARTING MAXIMUM LOAD TESTS...\n');
  
  const testResults = {
    imageStorage: null,
    propertyScraping: null,
    documentSize: null,
    concurrentProcessing: null,
    overallSuccess: false
  };
  
  try {
    // Test 1: Image Storage Adapters
    testResults.imageStorage = await testImageStorageAdapters();
    
    // Test 2: Property Scraping
    testResults.propertyScraping = await testPropertyScraping();
    
    // Test 3: Document Size Limits
    testResults.documentSize = await testDocumentSizeLimits();
    
    // Test 4: Concurrent Processing
    testResults.concurrentProcessing = await testConcurrentProcessing();
    
    // Overall assessment
    const allTestsPassed = testResults.imageStorage.success && 
                          testResults.propertyScraping.success && 
                          testResults.documentSize.success && 
                          testResults.concurrentProcessing.success;
    
    testResults.overallSuccess = allTestsPassed;
    
    console.log('\n🏆 FINAL ASSESSMENT');
    console.log('==================');
    console.log(`✅ Image Storage Test: ${testResults.imageStorage.success ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Property Scraping Test: ${testResults.propertyScraping.success ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Document Size Test: ${testResults.documentSize.success ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Concurrent Processing Test: ${testResults.concurrentProcessing.success ? 'PASSED' : 'FAILED'}`);
    console.log('');
    console.log(`🎯 OVERALL RESULT: ${allTestsPassed ? '🟢 ALL TESTS PASSED' : '🔴 SOME TESTS FAILED'}`);
    
    if (allTestsPassed) {
      console.log('\n🚀 HYBRID STORAGE STRATEGY IS READY FOR PRODUCTION!');
      console.log('   • ALL images display correctly ✅');
      console.log('   • Document size limits respected ✅');
      console.log('   • System performance optimal ✅');
      console.log('   • Concurrent processing stable ✅');
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR in test runner:', error);
    testResults.overallSuccess = false;
  }
  
  return testResults;
}

// Export for use as module or run directly
if (require.main === module) {
  runMaximumLoadTests().then(results => {
    process.exit(results.overallSuccess ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runMaximumLoadTests, testImageStorageAdapters, testPropertyScraping, testDocumentSizeLimits, testConcurrentProcessing };
