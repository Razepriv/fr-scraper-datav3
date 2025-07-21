const fs = require('fs');
const path = require('path');

// Test the public URL generation
function testPublicUrlGeneration() {
    console.log('🔍 Testing Firebase Storage Public URL Generation...\n');
    
    // Test cases for different URL formats
    const testUrls = [
        'properties/prop-1750839148648-0/image1.jpg',
        'properties/prop-1750843374013-0/image2.png',
        'https://firebasestorage.googleapis.com/v0/b/fr-toolv2.firebasestorage.app/o/properties%2Fprop-1750839148648-0%2Fimage1.jpg?alt=media&token=abc123',
        'https://storage.googleapis.com/fr-toolv2.firebasestorage.app/properties/prop-1750839148648-0/image1.jpg',
        'https://example.com/image.jpg',
        ''
    ];
    
    // FIXED getAbsoluteUrl function with PROPER token removal
    const getAbsoluteUrl = (url) => {
        if (!url) return '';
        
        // STEP 1: Remove any query parameters (tokens, etc.) FIRST
        const cleanUrl = url.split('?')[0];
        
        // STEP 2: Handle Firebase Storage URLs with different prefixes
        if (cleanUrl.includes('firebasestorage.googleapis.com')) {
            // Extract the path from encoded Firebase URL
            const pathMatch = cleanUrl.match(/firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\/(.+?)(?:\?|$)/);
            if (pathMatch) {
                const bucketName = 'fr-toolv2.firebasestorage.app';
                const decodedPath = decodeURIComponent(pathMatch[1]);
                return `https://storage.googleapis.com/${bucketName}/${decodedPath}`;
            }
        }
        
        // STEP 3: If already a complete HTTP/HTTPS URL, return CLEANED version
        if (cleanUrl.startsWith('http')) {
            return cleanUrl;
        }
        
        // STEP 4: For Firebase Storage paths, convert to public URLs
        if (cleanUrl.startsWith('properties/')) {
            const bucketName = 'fr-toolv2.firebasestorage.app';
            return `https://storage.googleapis.com/${bucketName}/${cleanUrl}`;
        }
        
        // Handle Firebase Storage URLs that might have different prefixes
        if (cleanUrl.includes('firebasestorage.googleapis.com') || cleanUrl.includes('firebasestorage.app')) {
            // Extract the path and convert to public URL
            const pathMatch = url.match(/(?:firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\/|firebasestorage\.app\/)(.+?)(?:\?|$)/);
            if (pathMatch) {
                const bucketName = 'fr-toolv2.firebasestorage.app';
                const decodedPath = decodeURIComponent(pathMatch[1]);
                return `https://storage.googleapis.com/${bucketName}/${decodedPath}`;
            }
        }
        
        return cleanUrl;
    };
    
    console.log('Input URL → Public URL (No Tokens)');
    console.log('═'.repeat(80));
    
    testUrls.forEach((url, index) => {
        const publicUrl = getAbsoluteUrl(url);
        const hasToken = publicUrl.includes('token=') || publicUrl.includes('alt=media') || publicUrl.includes('?');
        const hasValidExtension = /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(publicUrl) || publicUrl === '';
        
        console.log(`${index + 1}. ${url || '(empty)'}`);
        console.log(`   → ${publicUrl}`);
        console.log(`   ${!hasToken ? '✅' : '❌'} Token-free: ${!hasToken}`);
        console.log(`   ${hasValidExtension ? '✅' : '❌'} Valid extension: ${hasValidExtension}`);
        console.log('');
    });
}

// Test with actual properties data if available
function testWithPropertiesData() {
    console.log('\n📊 Testing with Properties Data...\n');
    
    const propertiesPath = path.join(__dirname, 'data', 'properties.json');
    
    if (fs.existsSync(propertiesPath)) {
        try {
            const propertiesData = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));
            
            if (Array.isArray(propertiesData) && propertiesData.length > 0) {
                console.log(`Found ${propertiesData.length} properties in database`);
                
                // Test first 5 properties
                const testProperties = propertiesData.slice(0, 5);
                
                testProperties.forEach((prop, index) => {
                    console.log(`\nProperty ${index + 1}: ${prop.title || 'No title'}`);
                    console.log(`Property ID: ${prop.id || 'No ID'}`);
                    
                    if (prop.image_urls && prop.image_urls.length > 0) {
                        console.log(`Images (${prop.image_urls.length}):`);
                        prop.image_urls.forEach((url, imgIndex) => {
                            const publicUrl = getAbsoluteUrl(url);
                            console.log(`  ${imgIndex + 1}. ${publicUrl}`);
                        });
                    } else {
                        console.log('  No images found');
                    }
                });
            } else {
                console.log('❌ Properties data is empty or not an array');
            }
        } catch (error) {
            console.log('❌ Error reading properties data:', error.message);
        }
    } else {
        console.log('❌ Properties file not found at:', propertiesPath);
    }
}

// Helper function to simulate getAbsoluteUrl for testing
function getAbsoluteUrl(url) {
    if (!url) return '';
    
    // If already a complete HTTP/HTTPS URL, return as-is
    if (url.startsWith('http')) {
        return url;
    }
    
    // For Firebase Storage paths, convert to public URLs (no tokens)
    if (url.startsWith('properties/')) {
        const bucketName = 'fr-toolv2.firebasestorage.app';
        return `https://storage.googleapis.com/${bucketName}/${url}`;
    }
    
    // Handle Firebase Storage URLs that might have different prefixes
    if (url.includes('firebasestorage.googleapis.com') || url.includes('firebasestorage.app')) {
        // Extract the path and convert to public URL
        const pathMatch = url.match(/(?:firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\/|firebasestorage\.app\/)(.+?)(?:\?|$)/);
        if (pathMatch) {
            const bucketName = 'fr-toolv2.firebasestorage.app';
            const decodedPath = decodeURIComponent(pathMatch[1]);
            return `https://storage.googleapis.com/${bucketName}/${decodedPath}`;
        }
    }
    
    return url;
}

// Run the tests
console.log('🔥 Firebase Storage Public URL Test Suite');
console.log('=' .repeat(50));

testPublicUrlGeneration();
testWithPropertiesData();

console.log('\n✅ Test completed!');
console.log('\nPublic URL Format: https://storage.googleapis.com/fr-toolv2.firebasestorage.app/properties/{path}');
console.log('This format provides direct access to Firebase Storage files without authentication tokens.');
