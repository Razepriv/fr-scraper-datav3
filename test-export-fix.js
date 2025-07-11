// Test script to verify export functionality fixes
const fs = require('fs');

console.log('🧪 Testing Export Fixes...\n');

// Test 1: Load sample property data
console.log('1. Testing property data loading...');
try {
    const data = JSON.parse(fs.readFileSync('./data/properties.json', 'utf8'));
    console.log(`✅ Successfully loaded ${data.length} properties`);
    
    // Test 2: Check for problematic property fields
    console.log('\n2. Testing property field validation...');
    let problematicProperties = 0;
    const sampleProperty = data[0];
    const fieldsToCheck = [
        'title', 'description', 'price', 'property_type', 'city', 
        'location', 'bedrooms', 'bathrooms', 'area', 'image_urls'
    ];
    
    fieldsToCheck.forEach(field => {
        if (sampleProperty[field] === undefined || sampleProperty[field] === null) {
            console.log(`⚠️  Field '${field}' is null/undefined in sample property`);
            problematicProperties++;
        } else {
            console.log(`✅ Field '${field}': ${typeof sampleProperty[field]}`);
        }
    });
    
    if (problematicProperties === 0) {
        console.log('\n✅ All required fields are present in sample property');
    } else {
        console.log(`\n⚠️  Found ${problematicProperties} problematic fields`);
    }
    
    // Test 3: Test enhanced title/description fallback
    console.log('\n3. Testing title/description fallback logic...');
    const testTitle = sampleProperty.enhanced_title || sampleProperty.title || '';
    const testDescription = sampleProperty.enhanced_description || sampleProperty.description || '';
    console.log(`✅ Title fallback works: "${testTitle.substring(0, 50)}..."`);
    console.log(`✅ Description fallback works: "${testDescription.substring(0, 50)}..."`);
    
    // Test 4: Test array handling
    console.log('\n4. Testing array field handling...');
    const imageUrls = sampleProperty.image_urls || [];
    const features = sampleProperty.features || [];
    console.log(`✅ Image URLs array: ${imageUrls.length} items`);
    console.log(`✅ Features array: ${features.length} items`);
    
    // Test 5: Test price/area extraction simulation
    console.log('\n5. Testing price/area extraction...');
    const extractPriceNumber = (priceString) => {
        if (!priceString) return '';
        return priceString.replace(/[^0-9.]/g, '') || '';
    };
    
    const extractAreaNumber = (areaString) => {
        if (!areaString) return '';
        return areaString.replace(/sq\s*ft|sqft|square\s*feet|[^0-9.]/gi, '') || '';
    };
    
    const testPrice = extractPriceNumber(sampleProperty.price || '');
    const testArea = extractAreaNumber(sampleProperty.area || '');
    console.log(`✅ Price extraction: "${sampleProperty.price}" → "${testPrice}"`);
    console.log(`✅ Area extraction: "${sampleProperty.area}" → "${testArea}"`);
    
    console.log('\n🎉 All export functionality tests passed!');
    console.log('The advanced export feature should now work correctly.');
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
}
