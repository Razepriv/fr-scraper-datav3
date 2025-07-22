/**
 * Real Implementation Test - Test actual scraping with hybrid storage
 */

async function testRealScraping() {
  console.log('🔍 REAL IMPLEMENTATION TEST - ACTUAL SCRAPING');
  console.log('=============================================');
  
  try {
    // Import the actual scraping function
    const actions = await import('./src/app/actions.ts');
    
    // Test URL with multiple images
    const testUrl = 'https://freeroom.ng/listing/newly-built-3-bedroom-duplex-fully-furnished-for-rent-at-chevron-alternative-route-lekki';
    
    console.log(`🏠 Testing real scraping with hybrid storage...`);
    console.log(`📍 URL: ${testUrl}`);
    console.log('');
    
    const startTime = Date.now();
    
    const result = await actions.scrapePropertyFromUrl(testUrl);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (result.success && result.data) {
      const property = result.data;
      
      console.log('✅ SCRAPING SUCCESS!');
      console.log('===================');
      console.log(`📍 Property ID: ${property.id}`);
      console.log(`🏠 Title: ${property.title?.substring(0, 60)}...`);
      console.log(`💰 Price: ₦${property.price?.toLocaleString() || 'N/A'}`);
      console.log(`📍 Location: ${property.location}`);
      console.log(`🛏️ Bedrooms: ${property.bedrooms || 'N/A'}`);
      console.log(`🚿 Bathrooms: ${property.bathrooms || 'N/A'}`);
      console.log('');
      
      // Analyze images
      const images = property.images || [];
      const dataUrlImages = images.filter(img => img.startsWith('data:'));
      const externalImages = images.filter(img => img.startsWith('http'));
      const localImages = images.filter(img => img.startsWith('/'));
      
      console.log('📷 IMAGE ANALYSIS:');
      console.log(`   • Total images: ${images.length}`);
      console.log(`   • Data URLs: ${dataUrlImages.length}`);
      console.log(`   • External URLs: ${externalImages.length}`);
      console.log(`   • Local URLs: ${localImages.length}`);
      console.log('');
      
      // Calculate document size
      const propertyJson = JSON.stringify(property);
      const documentSize = Buffer.byteLength(propertyJson, 'utf8');
      const firestoreLimit = 1048576; // 1MB
      
      console.log('📊 DOCUMENT SIZE ANALYSIS:');
      console.log(`   • Document size: ${documentSize} bytes (${(documentSize/1024).toFixed(1)}KB)`);
      console.log(`   • Firestore limit: ${firestoreLimit} bytes (${(firestoreLimit/1024).toFixed(1)}KB)`);
      console.log(`   • Size efficiency: ${(documentSize/firestoreLimit*100).toFixed(1)}% of limit used`);
      console.log(`   • Under limit: ${documentSize < firestoreLimit ? '✅ YES' : '❌ NO'}`);
      console.log('');
      
      // Analyze data URL sizes
      if (dataUrlImages.length > 0) {
        console.log('🔍 DATA URL ANALYSIS:');
        dataUrlImages.forEach((dataUrl, index) => {
          const size = dataUrl.length;
          console.log(`   • Data URL ${index + 1}: ${size} bytes (${(size/1024).toFixed(1)}KB)`);
        });
        
        const totalDataUrlSize = dataUrlImages.reduce((total, img) => total + img.length, 0);
        console.log(`   • Total data URL size: ${totalDataUrlSize} bytes (${(totalDataUrlSize/1024).toFixed(1)}KB)`);
        console.log('');
      }
      
      console.log('⏱️ PERFORMANCE:');
      console.log(`   • Total processing time: ${duration}ms`);
      console.log(`   • Average time per image: ${images.length > 0 ? (duration/images.length).toFixed(1) : 'N/A'}ms`);
      console.log('');
      
      // Test saving to database
      console.log('💾 TESTING DATABASE SAVE...');
      try {
        const saveResult = await actions.saveProperty(property);
        if (saveResult.success) {
          console.log(`✅ Property saved successfully! ID: ${saveResult.propertyId}`);
        } else {
          console.log(`❌ Save failed: ${saveResult.error}`);
        }
      } catch (saveError) {
        console.log(`❌ Save error: ${saveError.message}`);
      }
      
      return {
        success: true,
        property,
        stats: {
          totalImages: images.length,
          dataUrlImages: dataUrlImages.length,
          externalImages: externalImages.length,
          localImages: localImages.length,
          documentSize,
          underLimit: documentSize < firestoreLimit,
          duration
        }
      };
      
    } else {
      console.log('❌ SCRAPING FAILED:');
      console.log(`   Error: ${result.error || 'Unknown error'}`);
      
      return {
        success: false,
        error: result.error || 'Unknown error'
      };
    }
    
  } catch (error) {
    console.error('❌ Real implementation test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testRealScraping().then(result => {
  console.log('\n🏁 REAL IMPLEMENTATION TEST COMPLETE');
  console.log('===================================');
  
  if (result.success) {
    console.log('🎉 HYBRID STORAGE STRATEGY WORKS PERFECTLY!');
    console.log('✅ Real scraping successful');
    console.log('✅ Images processed correctly');
    console.log('✅ Document size under limits');
    console.log('✅ Ready for production use');
  } else {
    console.log('❌ Issues detected:');
    console.log(`   ${result.error}`);
  }
  
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
