#!/usr/bin/env node

/**
 * Debug Image Scraping
 * Tests the complete flow of property scraping including image download
 */

async function debugImageScraping() {
  console.log('🔍 Debug Image Scraping Process');
  console.log('================================');

  // Test URLs with known image content
  const testUrls = [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400',
    'https://placehold.co/600x400.png'
  ];

  console.log('\n📥 Testing image download functionality...');

  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    console.log(`\nTesting URL ${i + 1}: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        redirect: 'follow',
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`  ✅ Success: ${buffer.length} bytes, ${contentType}`);
      } else {
        console.log(`  ❌ Failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n🏠 Testing property data structure...');

  // Simulate property data that would come from AI extraction
  const mockProperty = {
    title: 'Test Property',
    description: 'A test property for debugging',
    price: '50,000 AED',
    image_urls: testUrls,
    location: 'Business Bay, Dubai',
    bedrooms: '0',
    bathrooms: '1',
    area: '480 sqft'
  };

  console.log('Mock property data:');
  console.log(JSON.stringify(mockProperty, null, 2));

  console.log(`\n📊 Found ${mockProperty.image_urls.length} image URLs to process`);

  // Test the image processing logic
  const imagePromises = mockProperty.image_urls.map(async (url, index) => {
    console.log(`Processing image ${index + 1}: ${url.substring(0, 60)}...`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        redirect: 'follow',
      });

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        console.log(`  ✅ Image ${index + 1} downloaded: ${Buffer.from(buffer).length} bytes`);
        return `/uploads/properties/test-prop-${Date.now()}/image-${index}.jpg`;
      } else {
        console.log(`  ❌ Image ${index + 1} failed: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.log(`  ❌ Image ${index + 1} error: ${error.message}`);
      return null;
    }
  });

  const results = await Promise.all(imagePromises);
  const successfulDownloads = results.filter(url => url !== null);

  console.log(`\n📈 Results: ${successfulDownloads.length}/${mockProperty.image_urls.length} images processed successfully`);
  console.log('Processed URLs:');
  successfulDownloads.forEach(url => console.log(`  - ${url}`));

  console.log('\n🎯 Image scraping test complete!');
}

// Run the debug function
if (require.main === module) {
  debugImageScraping().catch(console.error);
}

module.exports = { debugImageScraping };
