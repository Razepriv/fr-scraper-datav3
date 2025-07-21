import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize Firebase Admin (if not already initialized)
if (!getApps().length) {
  try {
    // Try to initialize with service account key if available
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log('✅ Firebase Admin initialized with service account');
  } catch (error) {
    console.log('⚠️  Service account not available, skipping admin initialization');
    console.log('   This is normal if you don\'t have service account credentials');
    process.exit(0);
  }
}

async function makeImagesBatchPublic() {
  console.log('🚀 Making Firebase Storage images public (Admin SDK)...');
  
  try {
    const storage = getStorage();
    const bucket = storage.bucket();
    
    // Get first 10 images for testing
    const [files] = await bucket.getFiles({
      prefix: 'properties/',
      maxResults: 10
    });
    
    console.log(`📋 Found ${files.length} files to make public`);
    
    for (const file of files) {
      const fileName = file.name;
      const isImage = /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(fileName);
      
      if (isImage) {
        try {
          await file.makePublic();
          console.log(`✅ Made public: ${fileName}`);
        } catch (error) {
          console.log(`❌ Failed to make public: ${fileName}`, error);
        }
      }
    }
    
    console.log('✅ Batch public access update completed!');
    
  } catch (error) {
    console.error('❌ Error making images public:', error);
    console.log('\n💡 Alternative approaches:');
    console.log('1. Use Firebase Console to manually make files public');
    console.log('2. Set up service account credentials');
    console.log('3. Use Firebase CLI: firebase storage:rules:release');
  }
}

// Run the function
makeImagesBatchPublic();
