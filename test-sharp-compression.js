// Quick test to verify Sharp compression is working
async function testSharpCompression() {
  try {
    console.log('🧪 Testing Sharp compression...');
    
    // Test with a sample image buffer (simulated)
    const testBuffer = Buffer.alloc(200000, 'A'); // 200KB buffer
    console.log(`📏 Original buffer size: ${testBuffer.length} bytes`);
    
    // Import Sharp
    const sharp = await import('sharp');
    console.log('✅ Sharp imported successfully');
    
    // Create a simple test image
    const testImageBuffer = await sharp.default({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 255, g: 100, b: 100 }
      }
    })
    .jpeg({ quality: 90 })
    .toBuffer();
    
    console.log(`📏 Test image size: ${testImageBuffer.length} bytes`);
    
    // Test compression
    const compressedBuffer = await sharp.default(testImageBuffer)
      .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 60, progressive: true })
      .toBuffer();
    
    console.log(`📏 Compressed image size: ${compressedBuffer.length} bytes`);
    console.log(`📊 Compression ratio: ${(compressedBuffer.length / testImageBuffer.length * 100).toFixed(1)}%`);
    
    if (compressedBuffer.length < testImageBuffer.length) {
      console.log('✅ Sharp compression is working correctly!');
    } else {
      console.log('⚠️ No compression achieved');
    }
    
  } catch (error) {
    console.error('❌ Sharp test failed:', error);
  }
}

// Only run this in Node.js environment
if (typeof window === 'undefined') {
  testSharpCompression();
}
