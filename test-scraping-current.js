// Test current scraping functionality
// Run with: node test-scraping-current.js

async function testScrapingAPI() {
    console.log('🧪 Testing Scraping API...');
    
    try {
        // Test the scraping API endpoint
        const response = await fetch('http://localhost:9002/api/scrape/html', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                html: `
                <html>
                <body>
                    <div class="property">
                        <h1>Beautiful 2BR Apartment</h1>
                        <div class="price">$2,500/month</div>
                        <div class="location">Downtown, Dubai</div>
                        <div class="details">2 bed, 1 bath, 900 sqft</div>
                        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400" alt="Property" />
                    </div>
                </body>
                </html>
                `
            })
        });

        const result = await response.json();
        
        console.log('\n📊 API Response:');
        console.log('Success:', result.success);
        
        if (result.success && result.data) {
            console.log('Properties found:', result.data.length);
            if (result.data.length > 0) {
                console.log('First property title:', result.data[0].title);
                console.log('First property price:', result.data[0].price);
                console.log('✅ Scraping is working!');
            }
        } else {
            console.log('❌ Error:', result.error);
            console.log('❌ Scraping failed');
        }
        
    } catch (error) {
        console.log('❌ Network error:', error.message);
    }
}

// Only run if called directly
if (require.main === module) {
    testScrapingAPI().catch(console.error);
}

module.exports = { testScrapingAPI };
