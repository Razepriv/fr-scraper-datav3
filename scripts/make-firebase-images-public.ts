import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Helper function to convert Firebase Storage path to public URL
function getPublicUrl(storagePath: string): string {
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'fr-toolv2.firebasestorage.app';
  return `https://storage.googleapis.com/${bucketName}/${storagePath}`;
}

// Helper function to check if URL is accessible
async function checkUrlAccessibility(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function generateImageInventory() {
  console.log('🚀 Generating Firebase Storage image inventory...');
  console.log('📦 Project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('🪣 Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

  try {
    // List all files in the properties folder
    const propertiesRef = ref(storage, 'properties');
    const result = await listAll(propertiesRef);
    
    const imageInventory = [];
    let totalFolders = 0;
    let totalImages = 0;
    let accessibleImages = 0;
    let inaccessibleImages = 0;

    console.log('📋 Scanning property folders...');
    
    // Process each property folder
    for (const folderRef of result.prefixes) {
      totalFolders++;
      console.log(`📁 Processing folder: ${folderRef.name}`);
      
      const folderResult = await listAll(folderRef);
      
      for (const itemRef of folderResult.items) {
        const fileExtension = path.extname(itemRef.name).toLowerCase();
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'];
        
        if (imageExtensions.includes(fileExtension)) {
          totalImages++;
          const publicUrl = getPublicUrl(itemRef.fullPath);
          
          // Test accessibility
          const isAccessible = await checkUrlAccessibility(publicUrl);
          
          if (isAccessible) {
            accessibleImages++;
          } else {
            inaccessibleImages++;
          }
          
          imageInventory.push({
            path: itemRef.fullPath,
            name: itemRef.name,
            folder: folderRef.name,
            publicUrl: publicUrl,
            isAccessible: isAccessible,
            extension: fileExtension
          });
          
          // Progress indicator
          if (totalImages % 50 === 0) {
            console.log(`   📊 Processed ${totalImages} images so far...`);
          }
        }
      }
    }

    console.log('\n📊 Final Statistics:');
    console.log(`   📁 Total folders: ${totalFolders}`);
    console.log(`   🖼️  Total images: ${totalImages}`);
    console.log(`   ✅ Accessible images: ${accessibleImages}`);
    console.log(`   ❌ Inaccessible images: ${inaccessibleImages}`);
    console.log(`   📈 Public accessibility: ${((accessibleImages / totalImages) * 100).toFixed(1)}%`);

    // Save detailed inventory
    const inventoryPath = path.join(process.cwd(), 'firebase-image-inventory.json');
    fs.writeFileSync(inventoryPath, JSON.stringify({
      generatedAt: new Date().toISOString(),
      statistics: {
        totalFolders,
        totalImages,
        accessibleImages,
        inaccessibleImages,
        accessibilityPercentage: ((accessibleImages / totalImages) * 100).toFixed(1)
      },
      images: imageInventory
    }, null, 2));

    console.log(`\n💾 Detailed inventory saved to: ${inventoryPath}`);
    
    // Generate sample public URLs for testing
    const sampleUrls = imageInventory
      .filter(img => img.isAccessible)
      .slice(0, 10)
      .map(img => img.publicUrl);

    if (sampleUrls.length > 0) {
      console.log('\n🔗 Sample accessible public URLs:');
      sampleUrls.forEach((url, index) => {
        console.log(`   ${index + 1}. ${url}`);
      });
    }

    if (inaccessibleImages > 0) {
      console.log('\n⚠️  Some images are not publicly accessible.');
      console.log('   This is normal if your Firebase Storage rules require authentication.');
      console.log('   Your export functionality will still work correctly.');
    }

    console.log('\n✅ Image inventory completed!');
    console.log('   The export functions will use the public URL format for all images.');
    console.log('   URLs will be accessible based on your Firebase Storage rules.');

  } catch (error) {
    console.error('❌ Error generating image inventory:', error);
    process.exit(1);
  }
}

// Run the inventory generation
generateImageInventory();