// Test Image Scraping Fix
// Run this in the browser console on localhost:9002

async function testImageScraping() {
    console.log('🧪 Testing Image Scraping Fix');
    
    // Test the scraping action directly
    const mockPropertyData = {
        title: 'Test Property',
        description: 'Testing image scraping functionality',
        image_urls: [
            'https://httpbin.org/image/jpeg',
            'https://httpbin.org/image/png'
        ],
        price: '50,000 AED',
        location: 'Business Bay, Dubai'
    };
    
    console.log('Sending test data to scraping endpoint...');
    
    try {
        // This would normally be called through the UI
        // You can test by pasting property data in the app
        console.log('✅ Ready to test - paste property data in the main app');
        console.log('Sample data:', mockPropertyData);
    } catch (error) {
        console.log('❌ Error:', error);
    }
}

testImageScraping();
