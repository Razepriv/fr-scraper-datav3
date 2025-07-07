#!/usr/bin/env node

// Quick network and image download test
console.log('🔍 Image Scraping Diagnostic');
console.log('===========================');

async function checkNetwork() {
    console.log('\n1. Testing basic network connectivity...');
    
    try {
        // Test with fetch (if available in this Node version)
        const { default: fetch } = await import('node-fetch').catch(() => {
            console.log('node-fetch not available, using native fetch');
            return { default: global.fetch };
        });
        
        if (!fetch) {
            console.log('❌ Fetch API not available');
            return false;
        }
        
        console.log('✅ Fetch API available');
        return true;
    } catch (error) {
        console.log('❌ Network test failed:', error.message);
        return false;
    }
}

async function testImageSources() {
    console.log('\n2. Testing common image sources...');
    
    const testUrls = [
        'https://httpbin.org/image/jpeg',
        'https://jsonplaceholder.typicode.com/photos/1',
        'https://picsum.photos/600/400'
    ];
    
    for (const url of testUrls) {
        try {
            const { execSync } = require('child_process');
            const result = execSync(`curl -s -I "${url}" | head -1`, { encoding: 'utf8' });
            console.log(`${url}: ${result.trim()}`);
        } catch (error) {
            console.log(`${url}: ❌ ${error.message}`);
        }
    }
}

async function checkEnvironment() {
    console.log('\n3. Checking environment...');
    
    console.log(`Node.js version: ${process.version}`);
    console.log(`Platform: ${process.platform}`);
    console.log(`Working directory: ${process.cwd()}`);
    
    // Check if we can access image storage directories
    const fs = require('fs');
    const path = require('path');
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
    try {
        const files = fs.readdirSync(uploadsDir);
        console.log(`✅ Uploads directory accessible: ${files.length} items`);
    } catch (error) {
        console.log(`❌ Uploads directory issue: ${error.message}`);
    }
}

async function checkImageStorageConfig() {
    console.log('\n4. Checking image storage configuration...');
    
    try {
        // Check environment variables
        const envVars = [
            'NODE_ENV',
            'STORAGE_TYPE', 
            'UPLOAD_PROVIDER',
            'VERCEL',
            'NETLIFY'
        ];
        
        console.log('Environment variables:');
        envVars.forEach(key => {
            const value = process.env[key] || 'undefined';
            console.log(`  ${key}: ${value}`);
        });
        
    } catch (error) {
        console.log(`❌ Config check failed: ${error.message}`);
    }
}

async function main() {
    await checkNetwork();
    await testImageSources();
    await checkEnvironment();
    await checkImageStorageConfig();
    
    console.log('\n🎯 Diagnostic Summary:');
    console.log('- If network tests fail: Check internet connectivity or firewall');
    console.log('- If environment shows "serverless": Using data URLs instead of files');
    console.log('- If uploads directory missing: File system storage may not work');
    console.log('- Check the browser console for frontend image loading errors');
}

main().catch(console.error);
