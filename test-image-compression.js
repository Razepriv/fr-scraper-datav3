const fs = require('fs');
const path = require('path');

// Import our image storage module
async function testImageCompression() {
  try {
    console.log('🧪 Testing Image Compression and Storage...\n');
    
    // Import the image storage functionality
    const { createImageStorage } = await import('./src/lib/image-storage.ts');
    
    console.log('✅ Image storage module imported successfully');
    
    // Create storage adapter
    const storage = createImageStorage();
    console.log('✅ Storage adapter created:', storage.constructor.name);
    
    // Test with a sample image URL
    const testImageUrl = 'https://images.dubizzle.com/v1/files/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmbiI6InY4OXF2djNlaGV1aDItQUUiLCJ3IjpbeyJmbiI6IjI4YnY4bWsxcDN5MDItQUUiLCJzIjo1MDAsImMiOiJjZW50ZXIiLCJpIjp0cnVlfV19.-VDtg26jNdxIrNgOoN1oy8t2r4ckI0m97aq1FaO1-lE/image;s=1080x1920;q=80;f=webp';
    
    console.log('🌐 Testing image download and compression...');
    console.log('📷 Test URL:', testImageUrl.substring(0, 100) + '...');
    
    // Download the image
    const response = await fetch(testImageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`📁 Downloaded image size: ${(buffer.length / 1024).toFixed(2)} KB`);
    
    // Test the upload with compression
    const result = await storage.uploadImage(buffer, 'test-property-123', 0, 'image/jpeg');
    
    console.log('🎯 Upload result:', result);
    console.log('📏 Result type:', result.startsWith('data:') ? 'Data URL' : 'Remote URL');
    
    if (result.startsWith('data:')) {
      // Calculate data URL size
      const base64Data = result.split(',')[1];
      const sizeKB = (base64Data.length * 0.75 / 1024).toFixed(2); // Base64 is ~33% larger
      console.log(`📊 Data URL size: ${sizeKB} KB`);
      
      // Check if it's under the limits
      if (parseFloat(sizeKB) < 200) {
        console.log('✅ SUCCESS: Image compressed to under 200KB for data URL');
      } else {
        console.log('⚠️ WARNING: Data URL still large, may cause document size issues');
      }
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testImageCompression();
