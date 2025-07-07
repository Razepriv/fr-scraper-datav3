#!/usr/bin/env node

/**
 * Image Storage Test Script
 * Tests the image storage functionality in different environments
 */

const { getImageStorage, downloadImageFromUrl } = require('./src/lib/image-storage');

async function testImageStorage() {
  console.log('🧪 Testing Image Storage Functionality');
  console.log('======================================');

  try {
    // Test image download
    console.log('\n📥 Testing image download...');
    const testImageUrl = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300';
    
    const imageData = await downloadImageFromUrl(testImageUrl);
    if (imageData) {
      console.log(`✅ Image downloaded successfully: ${imageData.buffer.length} bytes`);
      console.log(`   Content-Type: ${imageData.contentType}`);
      
      // Test image storage
      console.log('\n💾 Testing image storage...');
      const imageStorage = getImageStorage();
      const storedUrl = await imageStorage.uploadImage(
        imageData.buffer,
        'test-property-123',
        0,
        imageData.contentType
      );
      
      console.log(`✅ Image stored successfully: ${storedUrl}`);
      
      // Test getting image URL
      const retrievedUrl = await imageStorage.getImageUrl(storedUrl);
      console.log(`✅ Image URL retrieved: ${retrievedUrl}`);
      
    } else {
      console.log('❌ Failed to download test image');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  testImageStorage();
}

module.exports = { testImageStorage };
