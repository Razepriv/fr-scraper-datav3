/**
 * Image sync utility for ensuring all property images are stored in Firebase Storage
 * This addresses the need to have consistent Firebase Storage URLs in exports
 */

import { getImageStorage, downloadImageFromUrl } from '@/lib/image-storage';
import { getDatabase } from '@/lib/database-adapter';
import { ENV_CONFIG } from '@/lib/config';
import type { Property } from '@/lib/types';

export interface ImageSyncResult {
  propertyId: string;
  success: boolean;
  originalImageCount: number;
  syncedImageCount: number;
  firebaseUrls: string[];
  errors: string[];
}

export interface BatchSyncResult {
  totalProperties: number;
  successfulProperties: number;
  totalImages: number;
  syncedImages: number;
  results: ImageSyncResult[];
  errors: string[];
}

/**
 * Ensures a single property's images are synced to Firebase Storage
 * Returns Firebase Storage URLs for all images
 */
export async function syncPropertyImagesToFirebase(property: Property): Promise<ImageSyncResult> {
  const result: ImageSyncResult = {
    propertyId: property.id,
    success: false,
    originalImageCount: 0,
    syncedImageCount: 0,
    firebaseUrls: [],
    errors: []
  };

  try {
    const imageStorage = getImageStorage();
    const imageUrls = property.image_urls || [];
    result.originalImageCount = imageUrls.length;

    console.log(`🔄 Syncing ${imageUrls.length} images for property ${property.id} to Firebase Storage...`);

    if (imageUrls.length === 0) {
      result.success = true;
      return result;
    }

    const syncPromises = imageUrls.map(async (imageUrl, index) => {
      try {
        // Check if it's already a Firebase Storage URL
        if (imageUrl.includes('storage.googleapis.com') && imageUrl.includes('firebasestorage.app')) {
          console.log(`✅ Image ${index + 1} already in Firebase Storage: ${imageUrl}`);
          return imageUrl;
        }

        // Check if it's a data URL (base64) - skip these as they're already embedded
        if (imageUrl.startsWith('data:')) {
          console.log(`ℹ️ Skipping data URL for image ${index + 1} (already embedded)`);
          return imageUrl;
        }

        // Download and re-upload to Firebase Storage
        console.log(`⬇️ Downloading image ${index + 1} from: ${imageUrl}`);
        const imageData = await downloadImageFromUrl(imageUrl);
        
        if (!imageData) {
          throw new Error(`Failed to download image from ${imageUrl}`);
        }

        console.log(`⬆️ Uploading image ${index + 1} to Firebase Storage...`);
        const firebaseUrl = await imageStorage.uploadImage(
          imageData.buffer,
          property.id,
          index,
          imageData.contentType,
          false // Prefer Firebase Storage over data URLs
        );

        console.log(`✅ Image ${index + 1} synced to Firebase: ${firebaseUrl}`);
        return firebaseUrl;

      } catch (error) {
        const errorMsg = `Failed to sync image ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`);
        result.errors.push(errorMsg);
        
        // Return original URL as fallback
        return imageUrl;
      }
    });

    const syncedUrls = await Promise.all(syncPromises);
    result.firebaseUrls = syncedUrls.filter(url => url !== null);
    result.syncedImageCount = result.firebaseUrls.length;
    result.success = result.errors.length === 0;

    console.log(`✅ Completed sync for property ${property.id}: ${result.syncedImageCount}/${result.originalImageCount} images`);
    
    return result;

  } catch (error) {
    const errorMsg = `Failed to sync images for property ${property.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`❌ ${errorMsg}`);
    result.errors.push(errorMsg);
    return result;
  }
}

/**
 * Updates a property's image URLs in the database with Firebase Storage URLs
 */
export async function updatePropertyWithFirebaseImages(property: Property, firebaseUrls: string[]): Promise<boolean> {
  try {
    const database = getDatabase();
    
    const updatedProperty: Property = {
      ...property,
      image_urls: firebaseUrls,
      image_url: firebaseUrls.length > 0 ? firebaseUrls[0] : property.image_url
    };

    await database.updateProperty(updatedProperty);
    console.log(`✅ Updated property ${property.id} with ${firebaseUrls.length} Firebase Storage URLs`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to update property ${property.id} with Firebase URLs:`, error);
    return false;
  }
}

/**
 * Syncs all images for multiple properties to Firebase Storage
 */
export async function syncPropertiesImagesToFirebase(properties: Property[]): Promise<BatchSyncResult> {
  const result: BatchSyncResult = {
    totalProperties: properties.length,
    successfulProperties: 0,
    totalImages: 0,
    syncedImages: 0,
    results: [],
    errors: []
  };

  console.log(`🚀 Starting batch sync of images for ${properties.length} properties...`);

  for (const property of properties) {
    try {
      const syncResult = await syncPropertyImagesToFirebase(property);
      result.results.push(syncResult);
      result.totalImages += syncResult.originalImageCount;
      result.syncedImages += syncResult.syncedImageCount;

      if (syncResult.success) {
        result.successfulProperties++;
        
        // Update property in database with Firebase URLs
        if (syncResult.firebaseUrls.length > 0) {
          await updatePropertyWithFirebaseImages(property, syncResult.firebaseUrls);
        }
      } else {
        result.errors.push(...syncResult.errors);
      }

      // Add small delay to avoid overwhelming Firebase
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      const errorMsg = `Failed to process property ${property.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`❌ ${errorMsg}`);
      result.errors.push(errorMsg);
    }
  }

  console.log(`🏁 Batch sync completed:`);
  console.log(`   Properties: ${result.successfulProperties}/${result.totalProperties} successful`);
  console.log(`   Images: ${result.syncedImages}/${result.totalImages} synced`);
  console.log(`   Errors: ${result.errors.length}`);

  return result;
}

/**
 * Gets Firebase Storage URL for an image URL, converting if necessary
 */
export function getFirebaseStorageUrl(imageUrl: string): string {
  if (!imageUrl) return '';

  // If it's already a Firebase Storage URL, clean it up
  if (imageUrl.includes('firebasestorage.googleapis.com')) {
    // Remove any query parameters/tokens and convert to public URL
    const cleanUrl = imageUrl.split('?')[0];
    const match = cleanUrl.match(/\/o\/(.+)$/);
    if (match) {
      const encodedPath = match[1];
      const decodedPath = decodeURIComponent(encodedPath);
      return `https://storage.googleapis.com/${ENV_CONFIG.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/${decodedPath}`;
    }
  }

  // If it's already a public storage URL, return as-is
  if (imageUrl.includes('storage.googleapis.com') && imageUrl.includes('firebasestorage.app')) {
    return imageUrl;
  }

  // For other URLs (external, data URLs, etc.), return as-is
  return imageUrl;
}

/**
 * Filters and returns only Firebase Storage URLs from an array of image URLs
 */
export function getFirebaseImageUrls(imageUrls: string[]): string[] {
  return imageUrls
    .map(getFirebaseStorageUrl)
    .filter(url => 
      url.includes('storage.googleapis.com') && 
      url.includes('firebasestorage.app')
    );
}
