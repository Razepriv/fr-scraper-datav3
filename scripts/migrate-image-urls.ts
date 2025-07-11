#!/usr/bin/env node

/**
 * Migrate Image URLs to Firebase
 * 
 * This script ensures all properties use Firebase URLs consistently
 * and removes any remaining local paths.
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface Property {
  id?: string;
  images?: string[];
  image_urls?: string[];
  image_url?: string;
  [key: string]: any;
}

class ImageUrlMigrator {
  private processedCount = 0;
  private migratedCount = 0;
  private errorCount = 0;

  async migrateImageUrls(): Promise<void> {
    try {
      console.log('🔄 Starting image URL migration to Firebase...');
      
      // Load properties data
      const properties = await this.loadProperties();
      console.log(`📊 Loaded ${properties.length} properties`);
      
      // Process each property
      for (const property of properties) {
        await this.processProperty(property);
      }
      
      // Save updated data
      await this.saveProperties(properties);
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  private async loadProperties(): Promise<Property[]> {
    const dataFile = join(process.cwd(), 'data', 'properties.json');
    const data = await readFile(dataFile, 'utf-8');
    return JSON.parse(data);
  }

  private async processProperty(property: Property): Promise<void> {
    this.processedCount++;
    let needsUpdate = false;

    try {
      // If property has Firebase URLs in images array, use those for all image fields
      if (property.images && property.images.length > 0) {
        const firebaseUrls = property.images.filter(url => 
          url && url.includes('firebasestorage.googleapis.com')
        );

        if (firebaseUrls.length > 0) {
          // Update image_urls array if it exists and is different
          if (property.image_urls && !this.arraysEqual(property.image_urls, firebaseUrls)) {
            property.image_urls = [...firebaseUrls];
            needsUpdate = true;
          }

          // Update primary image_url if it exists and is not a Firebase URL
          if (property.image_url && !property.image_url.includes('firebasestorage.googleapis.com')) {
            property.image_url = firebaseUrls[0];
            needsUpdate = true;
          }

          // Ensure images array only contains Firebase URLs
          property.images = firebaseUrls;
          needsUpdate = true;
        }
      }
      // If no Firebase URLs in images but has image_urls with local paths
      else if (property.image_urls && property.image_urls.length > 0) {
        const localUrls = property.image_urls.filter(url => 
          url && url.startsWith('/uploads/')
        );

        if (localUrls.length > 0) {
          console.log(`⚠️  Property has local URLs but no Firebase URLs: ${property.id || 'unknown'}`);
          // Keep as is for now - these would need re-uploading
        }
      }

      if (needsUpdate) {
        this.migratedCount++;
        if (this.migratedCount <= 5) {
          console.log(`✅ Updated property ${property.id || 'unknown'} with ${property.images?.length || 0} Firebase URLs`);
        }
      }

    } catch (error) {
      this.errorCount++;
      console.error(`❌ Error processing property ${property.id || 'unknown'}:`, error);
    }
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  }

  private async saveProperties(properties: Property[]): Promise<void> {
    try {
      const dataFile = join(process.cwd(), 'data', 'properties.json');
      const backupFile = join(process.cwd(), 'data', `properties_backup_migration_${Date.now()}.json`);
      
      // Create backup
      const originalData = await readFile(dataFile, 'utf-8');
      await writeFile(backupFile, originalData);
      console.log(`💾 Created backup at ${backupFile}`);
      
      // Write updated data
      await writeFile(dataFile, JSON.stringify(properties, null, 2));
      console.log('✅ Updated properties data with consistent Firebase URLs');
      
    } catch (error) {
      console.error('❌ Error saving properties data:', error);
      throw error;
    }
  }

  private generateReport(): void {
    console.log('\n📊 IMAGE URL MIGRATION REPORT');
    console.log('==============================');
    console.log(`📋 Total properties processed: ${this.processedCount}`);
    console.log(`✅ Properties migrated: ${this.migratedCount}`);
    console.log(`❌ Properties with errors: ${this.errorCount}`);
    console.log(`📈 Success rate: ${((this.migratedCount / this.processedCount) * 100).toFixed(1)}%`);
    
    if (this.migratedCount > 5) {
      console.log(`... and ${this.migratedCount - 5} more properties updated`);
    }
  }
}

// Main execution
async function main() {
  const migrator = new ImageUrlMigrator();
  await migrator.migrateImageUrls();
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
}

export default ImageUrlMigrator;
