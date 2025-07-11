#!/usr/bin/env node

/**
 * Test Firebase Storage Configuration
 * 
 * This script tests the Firebase Storage setup and uploads a test image
 */

import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { config } from 'dotenv';

// Load environment variables
config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD2ScfODrkVf0zWaJdsjy_Mw4c09k0oM8Y",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fr-toolv2.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://fr-toolv2-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fr-toolv2",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fr-toolv2.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "540549710523",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:540549710523:web:fadec9af72cdeb9d019f9e",
};

async function testFirebaseStorage() {
  try {
    console.log('🧪 Testing Firebase Storage Configuration...\n');
    
    // Validate configuration
    console.log('1. Validating Firebase configuration...');
    const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missing = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
    
    if (missing.length > 0) {
      console.error('❌ Missing Firebase configuration:', missing.join(', '));
      console.error('Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set.');
      return false;
    }
    
    console.log('✅ Firebase configuration is complete');
    
    // Initialize Firebase
    console.log('\n2. Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    console.log('✅ Firebase initialized successfully');
    
    // Create a test image (1x1 pixel PNG)
    console.log('\n3. Creating test image...');
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    );
    console.log('✅ Test image created (1x1 pixel PNG)');
    
    // Upload test image
    console.log('\n4. Uploading test image to Firebase Storage...');
    const testPath = `test/test-image-${Date.now()}.png`;
    const storageRef = ref(storage, testPath);
    
    const metadata = {
      contentType: 'image/png',
      customMetadata: {
        test: 'true',
        uploadedAt: new Date().toISOString(),
      }
    };
    
    const snapshot = await uploadBytes(storageRef, testImageBuffer, metadata);
    console.log('✅ Test image uploaded successfully');
    
    // Get download URL
    console.log('\n5. Getting download URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ Download URL generated:', downloadURL);
    
    // Test download
    console.log('\n6. Testing download...');
    const response = await fetch(downloadURL);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    const downloadedSize = parseInt(response.headers.get('content-length') || '0');
    console.log(`✅ Download successful (${downloadedSize} bytes)`);
    
    console.log('\n🎉 Firebase Storage test completed successfully!');
    console.log('📊 Test Results:');
    console.log(`   - Configuration: ✅ Valid`);
    console.log(`   - Connection: ✅ Working`);
    console.log(`   - Upload: ✅ Successful`);
    console.log(`   - Download: ✅ Successful`);
    console.log(`   - Test image URL: ${downloadURL}`);
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Firebase Storage test failed:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'storage/unauthorized') {
      console.error('\n💡 This might be due to Firebase Storage rules.');
      console.error('Please check your Firebase Storage rules and ensure they allow uploads.');
    }
    
    return false;
  }
}

// Run the test
if (require.main === module) {
  testFirebaseStorage().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default testFirebaseStorage;
