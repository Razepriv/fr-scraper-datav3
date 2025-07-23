/**
 * Test script to verify Firebase image sync functionality
 */
const { syncPropertyImagesToFirebase } = require('./src/lib/image-sync.ts');

// Sample property with mixed image URLs
const testProperty = {
  id: 'test-property-firebase-sync',
  title: 'Test Property for Firebase Sync',
  image_urls: [
    'https://example.com/external-image1.jpg',
    'https://storage.googleapis.com/fr-toolv2.firebasestorage.app/properties/existing/image.jpg',
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    'https://another-external-site.com/image2.png'
  ],
  scraped_at: new Date().toISOString()
};

async function testImageSync() {
  console.log('🧪 Testing Firebase Image Sync functionality...\n');
  
  console.log('📊 Test Property:');
  console.log(`   ID: ${testProperty.id}`);
  console.log(`   Original Image URLs: ${testProperty.image_urls.length}`);
  testProperty.image_urls.forEach((url, index) => {
    const type = url.startsWith('data:') ? 'Data URL' : 
                 url.includes('storage.googleapis.com') ? 'Firebase Storage' : 'External URL';
    console.log(`     ${index + 1}. ${type}: ${url.substring(0, 60)}...`);
  });
  console.log('');
  
  try {
    console.log('🔄 Starting image sync to Firebase Storage...');
    const result = await syncPropertyImagesToFirebase(testProperty);
    
    console.log('✅ Sync completed!');
    console.log(`   Success: ${result.success}`);
    console.log(`   Original Images: ${result.originalImageCount}`);
    console.log(`   Synced Images: ${result.syncedImageCount}`);
    console.log(`   Errors: ${result.errors.length}`);
    
    if (result.firebaseUrls.length > 0) {
      console.log('\n📷 Firebase Storage URLs:');
      result.firebaseUrls.forEach((url, index) => {
        console.log(`   ${index + 1}. ${url}`);
      });
    }
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n🎯 Expected behavior:');
    console.log('   • External URLs should be downloaded and uploaded to Firebase');
    console.log('   • Existing Firebase URLs should be preserved');
    console.log('   • Data URLs should be skipped (already embedded)');
    console.log('   • All Firebase URLs should start with storage.googleapis.com');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testImageSync().catch(console.error);
