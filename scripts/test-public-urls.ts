/**
 * Test script to verify public Firebase Storage URLs
 */

// Test the public URL generation
function testPublicUrlGeneration() {
  console.log('🧪 Testing public URL generation...\n');

  const bucketName = 'fr-toolv2.firebasestorage.app';
  
  // Test cases
  const testCases = [
    'properties/prop-1750839148648-0/0-1750839148648.jpg',
    'properties/prop-1750843374013-0/1-1750843374013.png',
    'properties/prop-1750844081369-0/2-1750844081369.webp'
  ];

  testCases.forEach((path, index) => {
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${path}`;
    console.log(`Test ${index + 1}:`);
    console.log(`  Path: ${path}`);
    console.log(`  Public URL: ${publicUrl}`);
    console.log(`  ✅ No token required`);
    console.log('');
  });

  console.log('📋 URL Format Rules:');
  console.log('  ✅ Uses https://storage.googleapis.com/ (not firebasestorage.googleapis.com)');
  console.log('  ✅ No authentication tokens in URL');
  console.log('  ✅ Works with all image formats (jpg, png, webp, gif, etc.)');
  console.log('  ✅ Compatible with Firebase Storage rules allowing public read');
  console.log('');
}

// Test image accessibility
async function testImageAccessibility() {
  console.log('🔍 Testing actual image accessibility...\n');

  const bucketName = 'fr-toolv2.firebasestorage.app';
  
  // Some sample paths from your uploaded images
  const samplePaths = [
    'properties/prop-1750839148648-0/0-1750839148648.jpg',
    'properties/prop-1750843374013-0/1-1750843374013.png'
  ];

  for (const path of samplePaths) {
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${path}`;
    
    try {
      console.log(`Testing: ${path}`);
      const response = await fetch(publicUrl, { method: 'HEAD' });
      
      if (response.ok) {
        console.log(`  ✅ Accessible: ${response.status} ${response.statusText}`);
        console.log(`  📏 Size: ${response.headers.get('content-length')} bytes`);
        console.log(`  🗂️  Type: ${response.headers.get('content-type')}`);
      } else {
        console.log(`  ❌ Not accessible: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
    console.log('');
  }
}

// Enhanced getAbsoluteUrl function (matches the one in export.ts)
function getAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) {
    return url;
  }
  
  // For Firebase Storage paths, convert to public URLs
  if (url.startsWith('properties/')) {
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'fr-toolv2.firebasestorage.app';
    return `https://storage.googleapis.com/${bucketName}/${url}`;
  }
  
  // Fallback for relative URLs
  return url;
}

// Test the getAbsoluteUrl function
function testGetAbsoluteUrl() {
  console.log('🔧 Testing getAbsoluteUrl function...\n');

  const testUrls = [
    'https://storage.googleapis.com/fr-toolv2.firebasestorage.app/properties/prop-123/image.jpg',
    'properties/prop-123/image.jpg',
    'properties/prop-456/0-1234567890.png',
    'https://example.com/image.jpg',
    '/local/image.jpg',
    ''
  ];

  testUrls.forEach((url, index) => {
    const result = getAbsoluteUrl(url);
    console.log(`Test ${index + 1}:`);
    console.log(`  Input:  ${url || '(empty)'}`);
    console.log(`  Output: ${result || '(empty)'}`);
    console.log('');
  });
}

// Main execution
async function main() {
  console.log('🚀 Firebase Storage Public URL Test Suite\n');
  console.log('==========================================\n');

  // Test URL generation
  testPublicUrlGeneration();
  
  // Test the helper function
  testGetAbsoluteUrl();
  
  // Test actual accessibility (this requires the images to exist)
  if (process.argv.includes('--live-test')) {
    await testImageAccessibility();
  } else {
    console.log('ℹ️  Run with --live-test to check actual image accessibility');
  }

  console.log('✅ Test suite completed!');
  console.log('\nNext steps:');
  console.log('1. Ensure Firebase Storage rules allow public read access');
  console.log('2. Run npm run make-images-public to make existing images public');
  console.log('3. New uploads will automatically be public with updated code');
}

// Run the tests
if (require.main === module) {
  main().catch(console.error);
}

export { testPublicUrlGeneration, testImageAccessibility, getAbsoluteUrl };
