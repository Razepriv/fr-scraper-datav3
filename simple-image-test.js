#!/usr/bin/env node

// Simple test of the image download function
async function testImageDownload() {
    console.log('🧪 Testing Image Download Function');
    
    // Test with a working image URL
    const testUrl = 'https://httpbin.org/image/png';
    console.log(`Testing URL: ${testUrl}`);
    
    try {
        console.log('Starting fetch...');
        const response = await fetch(testUrl);
        console.log(`Response received with status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        
        if (response.ok) {
            console.log('Converting to buffer...');
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            console.log(`✅ Downloaded ${buffer.length} bytes`);
            
            // Test saving to filesystem
            console.log('Testing filesystem save...');
            const fs = require('fs').promises;
            const path = require('path');
            
            const testDir = path.join(__dirname, 'public', 'uploads', 'test');
            console.log(`Creating directory: ${testDir}`);
            await fs.mkdir(testDir, { recursive: true });
            
            const testFile = path.join(testDir, 'test-image.png');
            console.log(`Saving to: ${testFile}`);
            await fs.writeFile(testFile, buffer);
            
            console.log(`✅ Saved to: ${testFile}`);
            
            // Clean up
            await fs.unlink(testFile);
            console.log('✅ Cleanup complete');
            
        } else {
            console.log(`❌ Failed to download: ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        console.log(`Error stack: ${error.stack}`);
    }
}

testImageDownload().catch(console.error);
