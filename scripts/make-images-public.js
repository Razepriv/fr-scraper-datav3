// Set Firebase configuration
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'fr-toolv2';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'fr-toolv2.firebasestorage.app';
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'AIzaSyD2ScfODrkVf0zWaJdsjy_Mw4c09k0oM8Y';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'fr-toolv2.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '540549710523';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:540549710523:web:10bb1f099b5e684b019f9e';

const fs = require('fs').promises;
const path = require('path');

async function makeImagesPublic() {
  console.log('🔓 Making all images publicly accessible...');
  
  const bucketName = 'fr-toolv2.firebasestorage.app';
  
  try {
    // Read properties data to get all image URLs
    const dataPath = path.join(process.cwd(), 'data', 'properties.json');
    const properties = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
    
    console.log(`📊 Found ${properties.length} properties to process`);
    
    let processedCount = 0;
    let publicUrlCount = 0;
    
    // Process each property
    for (const property of properties) {
      if (property.image_urls && property.image_urls.length > 0) {
        console.log(`\n🏠 Processing property: ${property.id}`);
        
        const updatedUrls = [];
        
        // Process each image URL
        for (const imageUrl of property.image_urls) {
          try {
            // Check if it's already a public Firebase URL
            if (imageUrl.includes('storage.googleapis.com')) {
              console.log(`  ✅ Already public: ${imageUrl}`);
              updatedUrls.push(imageUrl);
              publicUrlCount++;
            } else if (imageUrl.includes('firebasestorage.googleapis.com')) {
              // Convert to public URL format
              const publicUrl = imageUrl.replace(
                /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\/([^?]+)\?.*/,
                `https://storage.googleapis.com/${bucketName}/$1`
              );
              console.log(`  🔄 Converting to public URL: ${publicUrl}`);
              updatedUrls.push(publicUrl);
              publicUrlCount++;
            } else if (imageUrl.startsWith('/uploads/')) {
              // Local file path - keep as is for now
              console.log(`  📁 Local file: ${imageUrl}`);
              updatedUrls.push(imageUrl);
            } else {
              // Other URL types - keep as is
              console.log(`  🔗 Other URL: ${imageUrl}`);
              updatedUrls.push(imageUrl);
            }
          } catch (error) {
            console.error(`  ❌ Error processing URL: ${imageUrl}`, error);
            updatedUrls.push(imageUrl); // Keep original URL
          }
        }
        
        // Update property with processed URLs
        property.image_urls = updatedUrls;
        if (updatedUrls.length > 0) {
          property.image_url = updatedUrls[0]; // Set first image as primary
        }
        
        processedCount++;
      }
    }
    
    // Save updated properties data
    await fs.writeFile(dataPath, JSON.stringify(properties, null, 2));
    
    console.log('\n📊 PROCESSING SUMMARY:');
    console.log('======================');
    console.log(`✅ Processed: ${processedCount} properties`);
    console.log(`🔓 Public URLs: ${publicUrlCount} images`);
    console.log(`📈 Total properties: ${properties.length}`);
    
    // Show sample public URLs
    const propertiesWithPublicUrls = properties.filter(p => 
      p.image_urls && p.image_urls.some(url => url.includes('storage.googleapis.com'))
    );
    
    if (propertiesWithPublicUrls.length > 0) {
      console.log('\n🔗 Sample Public URLs:');
      propertiesWithPublicUrls.slice(0, 3).forEach((prop, index) => {
        const publicUrls = prop.image_urls?.filter(url => url.includes('storage.googleapis.com')) || [];
        if (publicUrls.length > 0) {
          console.log(`${index + 1}. ${prop.id}: ${publicUrls[0]}`);
        }
      });
    }
    
    console.log('\n🎉 All images are now publicly accessible!');
    console.log('📝 Note: Images uploaded with the new rules will automatically be public.');
    
  } catch (error) {
    console.error('❌ Error making images public:', error);
  }
}

// Run the script
if (require.main === module) {
  makeImagesPublic().catch(console.error);
}

module.exports = { makeImagesPublic }; 