// Test AI property extraction to debug dummy data issue
const { extractPropertyInfo } = require('./src/ai/flows/extract-property-info.ts');

async function testAIExtraction() {
  console.log('🧪 Testing AI Property Extraction...');
  
  // Sample HTML from a real property listing
  const testHtml = `
  <html>
  <head><title>3 Bedroom Apartment for Rent in Dubai Marina</title></head>
  <body>
    <div class="property-details">
      <h1>Luxury 3BR Apartment in Dubai Marina</h1>
      <div class="price">AED 120,000/year</div>
      <div class="location">Dubai Marina, Dubai</div>
      <div class="details">
        <span class="bedrooms">3 Bedrooms</span>
        <span class="bathrooms">2 Bathrooms</span>
        <span class="area">1,500 sq ft</span>
      </div>
      <div class="description">
        Beautiful waterfront apartment with stunning marina views. 
        Features include modern kitchen, spacious living area, and balcony.
      </div>
      <div class="images">
        <img src="https://example.com/images/property1.jpg" alt="Property 1" />
        <img src="https://example.com/images/property2.jpg" alt="Property 2" />
      </div>
      <div class="contact">
        <span class="agent-name">John Smith</span>
        <span class="agent-phone">+971-50-123-4567</span>
        <span class="agent-email">john@realestate.com</span>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    console.log('📝 Testing with sample HTML...');
    const result = await extractPropertyInfo({ htmlContent: testHtml });
    
    if (result && result.properties && result.properties.length > 0) {
      console.log('✅ AI extraction successful!');
      console.log('📊 Extracted data:', JSON.stringify(result.properties[0], null, 2));
      
      // Check if data looks real vs dummy
      const prop = result.properties[0];
      if (prop.title && prop.title !== '' && !prop.title.includes('placeholder')) {
        console.log('✅ Real data extracted - titles look authentic');
      } else {
        console.log('⚠️ Potentially dummy data - check AI model response');
      }
      
      if (prop.image_urls && prop.image_urls.length > 0) {
        console.log('✅ Images extracted:', prop.image_urls);
      } else {
        console.log('⚠️ No images extracted');
      }
    } else {
      console.log('❌ AI extraction returned no properties');
      console.log('Raw result:', result);
    }
  } catch (error) {
    console.error('❌ AI extraction failed:', error);
    
    // Check if it's an API key issue
    if (error.message && error.message.includes('API key')) {
      console.log('🔑 This might be an API key issue');
      console.log('💡 Check your GEMINI_API_KEY environment variable');
    }
    
    // Check if it's a network issue
    if (error.message && error.message.includes('network')) {
      console.log('🌐 This might be a network connectivity issue');
    }
  }
}

// Run the test
testAIExtraction().catch(console.error);
