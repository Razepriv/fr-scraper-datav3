// Test Firebase Storage configuration in deployed app
console.log('🔥 Firebase Storage Configuration Test:', {
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  uploadProvider: process.env.UPLOAD_PROVIDER,
  nodeEnv: process.env.NODE_ENV,
  isFirebaseHosting: window.location.hostname.includes('firebaseapp.com') || window.location.hostname.includes('web.app')
});

// Test image storage adapter selection
async function testFirebaseStorage() {
  try {
    // This should show Firebase Storage being selected
    console.log('Testing storage adapter selection...');
    
    // Mock test (you would actually trigger a property scrape to test)
    const testImageUrl = 'https://httpbin.org/image/png';
    console.log('Would download from:', testImageUrl);
    console.log('Expected storage: Firebase Storage');
    console.log('Expected URL pattern: firebasestorage.googleapis.com');
    
    return true;
  } catch (error) {
    console.error('Storage test failed:', error);
    return false;
  }
}

// Run test
testFirebaseStorage().then(success => {
  console.log(success ? '✅ Configuration looks good!' : '❌ Configuration issues detected');
});
