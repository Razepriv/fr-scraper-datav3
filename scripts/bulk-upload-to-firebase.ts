#!/usr/bin/env node

/**
 * Bulk Upload Images to Firebase Storage
 * 
 * This script uploads all existing images from the local uploads directory
 * to Firebase Storage and updates the property data with the new URLs.
 */ 

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

interface Property {
  id: string;
  images: string[];
  [key: string]: any;
}

interface UploadResult {
  localPath: string;
  firebaseUrl: string | null;
  success: boolean;
  error?: string;
}

class FirebaseBulkUploader {
  private uploadedCount = 0;
  private failedCount = 0;
  private results: UploadResult[] = [];

  async uploadAllImages(): Promise<void> {
    try {
      console.log('🚀 Starting bulk upload to Firebase Storage...');
      
      // Validate Firebase configuration
      await this.validateFirebaseConfig();
      
      // Get all property directories
      const propertiesDir = join(process.cwd(), 'public', 'uploads', 'properties');
      const propertyDirs = await readdir(propertiesDir);
      
      console.log(`📁 Found ${propertyDirs.length} property directories`);
      
      // Load existing properties data
      const properties = await this.loadProperties();
      console.log(`📊 Loaded ${properties.length} properties from data file`);
      
      // Process each property directory
      for (const propertyDir of propertyDirs) {
        if (propertyDir === 'test-property') continue; // Skip test directory
        
        await this.processPropertyDirectory(propertyDir, properties);
      }
      
      // Update properties data with new URLs
      await this.updatePropertiesData(properties);
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Bulk upload failed:', error);
      throw error;
    }
  }

  private async validateFirebaseConfig(): Promise<void> {
    const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missing = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
    
    if (missing.length > 0) {
      throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
    }
    
    console.log('✅ Firebase configuration validated');
  }

  private async loadProperties(): Promise<Property[]> {
    try {
      const dataFile = join(process.cwd(), 'data', 'properties.json');
      const data = await readFile(dataFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('⚠️ Could not load properties data file, continuing without property data update');
      return [];
    }
  }

  private async processPropertyDirectory(propertyDir: string, properties: Property[]): Promise<void> {
    const propertyPath = join(process.cwd(), 'public', 'uploads', 'properties', propertyDir);
    
    try {
      const imageFiles = await readdir(propertyPath);
      const validImages = imageFiles.filter(file => 
        /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(file)
      );
      
      if (validImages.length === 0) {
        console.log(`⏭️  No images found in ${propertyDir}`);
        return;
      }
      
      console.log(`📷 Processing ${validImages.length} images in ${propertyDir}`);
      
      const uploadPromises = validImages.map(async (imageFile, index) => {
        const localPath = join(propertyPath, imageFile);
        const firebaseUrl = await this.uploadSingleImage(localPath, propertyDir, index);
        
        return {
          localPath: `/uploads/properties/${propertyDir}/${imageFile}`,
          firebaseUrl,
          success: !!firebaseUrl,
          error: firebaseUrl ? undefined : 'Upload failed'
        };
      });
      
      const results = await Promise.all(uploadPromises);
      this.results.push(...results);
      
      // Update property data if available
      const property = properties.find(p => p.id === propertyDir);
      if (property) {
        const successfulUploads = results.filter(r => r.success && r.firebaseUrl);
        property.images = successfulUploads.map(r => r.firebaseUrl!);
        console.log(`✅ Updated property ${propertyDir} with ${successfulUploads.length} Firebase URLs`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing property ${propertyDir}:`, error);
      this.failedCount++;
    }
  }

  private async uploadSingleImage(localPath: string, propertyId: string, index: number): Promise<string | null> {
    try {
      const imageBuffer = await readFile(localPath);
      const fileName = `${index}-${Date.now()}.${this.getFileExtension(localPath)}`;
      const storagePath = `properties/${propertyId}/${fileName}`;
      
      const storageRef = ref(storage, storagePath);
      const metadata = {
        contentType: this.getContentType(localPath),
        customMetadata: {
          originalPath: localPath,
          uploadedAt: new Date().toISOString(),
        }
      };
      
      const snapshot = await uploadBytes(storageRef, imageBuffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      this.uploadedCount++;
      console.log(`  ✅ Uploaded: ${fileName} -> ${downloadURL}`);
      return downloadURL;
      
    } catch (error) {
      this.failedCount++;
      console.error(`  ❌ Failed to upload ${localPath}:`, error);
      return null;
    }
  }

  private getFileExtension(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    return ext || 'jpg';
  }

  private getContentType(filePath: string): string {
    const ext = this.getFileExtension(filePath);
    const contentTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'bmp': 'image/bmp',
      'tiff': 'image/tiff',
    };
    return contentTypes[ext] || 'image/jpeg';
  }

  private async updatePropertiesData(properties: Property[]): Promise<void> {
    if (properties.length === 0) return;
    
    try {
      const dataFile = join(process.cwd(), 'data', 'properties.json');
      const backupFile = join(process.cwd(), 'data', `properties_backup_${Date.now()}.json`);
      
      // Create backup
      const originalData = await readFile(dataFile, 'utf-8');
      await writeFile(backupFile, originalData);
      console.log(`💾 Created backup at ${backupFile}`);
      
      // Write updated data
      await writeFile(dataFile, JSON.stringify(properties, null, 2));
      console.log('✅ Updated properties data with Firebase URLs');
      
    } catch (error) {
      console.error('❌ Error updating properties data:', error);
    }
  }

  private generateReport(): void {
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    
    console.log('\n📊 BULK UPLOAD REPORT');
    console.log('========================');
    console.log(`✅ Successfully uploaded: ${successful} images`);
    console.log(`❌ Failed uploads: ${failed} images`);
    console.log(`📈 Success rate: ${((successful / this.results.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed uploads:');
      this.results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.localPath}: ${r.error}`);
      });
    }
    
    // Save detailed report
    const reportFile = join(process.cwd(), 'data', `upload_report_${Date.now()}.json`);
    writeFile(reportFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        successful,
        failed,
        successRate: (successful / this.results.length) * 100
      },
      details: this.results
    }, null, 2)).catch(console.error);
    
    console.log(`📋 Detailed report saved to: ${reportFile}`);
  }
}

// Main execution
async function main() {
  const uploader = new FirebaseBulkUploader();
  await uploader.uploadAllImages();
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

export default FirebaseBulkUploader;
