#!/usr/bin/env node

/**
 * Debug script to identify image scraping issues
 */

const { downloadImageFromUrl, getImageStorage } = require('./src/lib/image-storage.ts');

async function testImageDownload() {
    console.log('🔍 Testing image download functionality...\n');
    
    // Test URLs from property sites
    const testUrls = [
        'https://images.example.com/property1.jpg', // Generic test
        'https://via.placeholder.com/600x400.png', // Working placeholder
        'https://placehold.co/600x400.png', // Working placeholder
        'https://httpbin.org/image/jpeg', // Working test image
    ];
    
    for (const url of testUrls) {
        console.log(`Testing: ${url}`);
        try {
            const result = await downloadImageFromUrl(url);
            if (result) {
                console.log(`✅ Success: Downloaded ${result.buffer.length} bytes, type: ${result.contentType}`);
                
                // Test storage
                const storage = getImageStorage();
                const savedUrl = await storage.uploadImage(result.buffer, 'test-prop', 0, result.contentType);
                console.log(`✅ Stored as: ${savedUrl}`);
            } else {
                console.log(`❌ Failed to download`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
        console.log('');
    }
}

async function checkEnvironment() {
    console.log('🔍 Checking environment configuration...\n');
    
    try {
        const config = require('./src/lib/config.ts').default;
        console.log('Environment:');
        console.log(`- NODE_ENV: ${config.NODE_ENV}`);
        console.log(`- STORAGE_TYPE: ${config.STORAGE_TYPE}`);
        console.log(`- UPLOAD_PROVIDER: ${config.UPLOAD_PROVIDER}`);
        console.log(`- Is Serverless: ${config.isServerless()}`);
        console.log(`- Is Production: ${config.isProduction()}`);
        console.log('');
    } catch (error) {
        console.error('❌ Error loading config:', error.message);
    }
}

async function main() {
    console.log('🧪 Image Scraping Debug Tool\n');
    console.log('='.repeat(50));
    
    await checkEnvironment();
    await testImageDownload();
    
    console.log('🔍 Debug complete. Check the output above for issues.');
}

main().catch(console.error);
