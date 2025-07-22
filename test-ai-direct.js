// Test AI extraction directly
// Run with: node test-ai-direct.js

async function testAIExtraction() {
    console.log('🤖 Testing AI Extraction...');
    
    try {
        // Import the AI extraction function
        const { extractPropertyInfo } = await import('./src/ai/flows/extract-property-info.ts');
        
        const testHTML = `
        <html>
        <body>
            <div class="property-listing">
                <h1>Beautiful 2BR Apartment in Downtown Dubai</h1>
                <div class="price">AED 150,000 per year</div>
                <div class="location">Business Bay, Dubai</div>
                <div class="details">2 bedrooms, 2 bathrooms, 1200 sq ft</div>
                <div class="description">Stunning apartment with modern amenities</div>
                <img src="https://example.com/image1.jpg" alt="Property Image" />
                <div class="contact">
                    <p>Contact: John Doe</p>
                    <p>Phone: +971 50 123 4567</p>
                    <p>Email: john@realestate.com</p>
                </div>
            </div>
        </body>
        </html>
        `;
        
        console.log('📄 Testing with sample property HTML...');
        
        const result = await extractPropertyInfo({ htmlContent: testHTML });
        
        console.log('\n📊 AI Extraction Result:');
        console.log('Type:', typeof result);
        console.log('Has properties:', result && result.properties);
        console.log('Properties count:', result?.properties?.length || 0);
        
        if (result && result.properties && result.properties.length > 0) {
            console.log('\n✅ AI Extraction Working!');
            console.log('First property:');
            console.log('- Title:', result.properties[0].title);
            console.log('- Price:', result.properties[0].price);
            console.log('- Location:', result.properties[0].location);
        } else {
            console.log('\n❌ AI Extraction Failed - No properties returned');
            console.log('Full result:', JSON.stringify(result, null, 2));
        }
        
    } catch (error) {
        console.log('❌ Error testing AI extraction:', error.message);
        console.log('Stack:', error.stack);
    }
}

testAIExtraction().catch(console.error);
