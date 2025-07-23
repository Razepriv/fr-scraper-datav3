"use server";

import { v4 as uuidv4 } from 'uuid';
import { enhancePropertyContent } from '@/ai/flows/enhance-property-description';
import { extractPropertyInfo } from '@/ai/flows/extract-property-info';
import { savePropertiesToDb, saveHistoryEntry, updatePropertyInDb, deletePropertyFromDb } from '@/lib/db';
import { getDatabase } from '@/lib/database-adapter';
import { getImageStorage, downloadImageFromUrl } from '@/lib/image-storage';
import { syncPropertyImagesToFirebase, syncPropertiesImagesToFirebase } from '@/lib/image-sync';
import { ENV_CONFIG } from '@/lib/config';
import { revalidatePath } from 'next/cache';
import { type Property, type HistoryEntry } from '@/lib/types';

// Configuration for auto-enhancement
const AUTO_ENHANCE_ENABLED = process.env.AUTO_ENHANCE_ENABLED !== 'false'; // Default to true
const AUTO_SAVE_ENABLED = true; // Re-enabled to test compression functionality


// Helper function to download an image from a URL and save it using the image storage adapter
async function downloadImage(url: string, propertyId: string, imageIndex: number, forcePlaceholder: boolean = false, preferDataUrl: boolean = true): Promise<string | null> {
    try {
        // If forced to use placeholder, return placeholder immediately
        if (forcePlaceholder) {
            console.log(`🔄 Using placeholder for image ${imageIndex + 1} (document size optimization)`);
            return `https://placehold.co/600x400/e2e8f0/64748b?text=Property+Image+${imageIndex + 1}`;
        }
        
        const imageData = await downloadImageFromUrl(url);
        if (!imageData) {
            // If download fails, try to preserve the original URL for external display
            console.log(`⚠️ Image download failed, using original URL: ${url}`);
            return url;
        }

        const imageStorage = getImageStorage();
        
        // Try to upload to storage first
        try {
            const imageUrl = await imageStorage.uploadImage(
                imageData.buffer, 
                propertyId, 
                imageIndex, 
                imageData.contentType,
                preferDataUrl
            );
            return imageUrl;
        } catch (uploadError) {
            // If upload fails but we prefer data URL, try external fallback
            if (!preferDataUrl) {
                console.log(`⚠️ Upload failed for image ${imageIndex + 1}, using original URL: ${url}`);
                return url;
            }
            throw uploadError;
        }
    } catch (error) {
        console.error(`❌ Error processing image ${url}:`, error);
        // Return original URL instead of null to avoid losing the image reference
        console.log(`🔗 Falling back to original URL: ${url}`);
        return url;
    }
}


async function getHtml(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error fetching URL ${url}:`, error);
        if (error instanceof Error) {
            throw new Error(`Could not retrieve content from ${url}. Reason: ${error.message}`);
        }
        throw new Error(`Could not retrieve content from ${url}.`);
    }
}

async function processScrapedData(properties: any[], originalUrl: string, historyEntry: Omit<HistoryEntry, 'id' | 'date' | 'propertyCount'>) {
    const processingPromises = properties.map(async (p, index) => {
        const propertyId = `prop-${Date.now()}-${index}`;
        
        const imageUrls = (p.image_urls && Array.isArray(p.image_urls))
            ? p.image_urls.filter((url: string | null): url is string => !!url)
            : [];
        
        console.log(`[Image Processing] Found ${imageUrls.length} image URLs to process for propertyId: ${propertyId}.`);

        // Process ALL images with intelligent storage strategy
        const maxImages = ENV_CONFIG.MAX_IMAGES_PER_PROPERTY;
        const maxDataUrlImages = ENV_CONFIG.MAX_DATA_URL_IMAGES;
        const allImageUrls = imageUrls.slice(0, Math.min(imageUrls.length, maxImages));
        
        console.log(`[Image Processing] Processing ALL ${allImageUrls.length} out of ${imageUrls.length} images with hybrid storage strategy`);

        const downloadPromises = allImageUrls.map((imgUrl: string, i: number) => {
            // Force Firebase Storage for all images instead of data URLs
            const preferDataUrl = false; // Always prefer Firebase Storage
            return downloadImage(imgUrl, propertyId, i, false, preferDataUrl);
        });
        const downloadedUrls = (await Promise.all(downloadPromises)).filter((url): url is string => url !== null);
        
        // Auto-enhance if enabled
        let enhancedContent = { enhancedTitle: p.title, enhancedDescription: p.description };
        if (AUTO_ENHANCE_ENABLED) {
            try {
                console.log(`✨ Auto-enhancing property: "${p.title}"`);
                enhancedContent = await enhancePropertyContent({ title: p.title, description: p.description });
                console.log(`✅ Enhanced property title: "${enhancedContent.enhancedTitle}"`);
            } catch (enhanceError) {
                console.warn(`⚠️ Auto-enhancement failed for property "${p.title}":`, enhanceError);
            }
        }

        return {
            ...p,
            id: propertyId,
            original_url: originalUrl,
            original_title: p.title,
            original_description: p.description,
            title: enhancedContent.enhancedTitle || p.title, // Use enhanced as primary
            description: enhancedContent.enhancedDescription || p.description, // Use enhanced as primary
            enhanced_title: enhancedContent.enhancedTitle,
            enhanced_description: enhancedContent.enhancedDescription,
            scraped_at: new Date().toISOString(),
            image_urls: downloadedUrls,
            image_url: downloadedUrls.length > 0 ? downloadedUrls[0] : 'https://placehold.co/600x400.png',
        };
    });

    const finalProperties = await Promise.all(processingPromises);
    
    console.log('Content processing complete.');
    
    // Auto-save to database if enabled
    if (AUTO_SAVE_ENABLED && finalProperties.length > 0) {
        try {
            console.log(`💾 Auto-saving ${finalProperties.length} processed properties...`);
            await savePropertiesToDb(finalProperties);
            console.log(`✅ Auto-saved ${finalProperties.length} properties to database`);
        } catch (saveError) {
            console.error(`❌ Auto-save failed:`, saveError);
            // Don't throw error, just log it - properties are still returned for manual save
        }
    }
    
    await saveHistoryEntry({
        ...historyEntry,
        propertyCount: finalProperties.length,
    });

    revalidatePath('/history');
    revalidatePath('/database'); // Also revalidate database page

    return finalProperties;
}


// Enhanced property processing with auto-enhancement and auto-save
async function processScrapedProperties(
    properties: Property[], 
    source: string, 
    sourceUrl?: string
): Promise<Property[]> {
    if (!properties || properties.length === 0) {
        return [];
    }

    console.log(`🔄 Processing ${properties.length} scraped properties with auto-enhancement...`);
    
    const processedProperties: Property[] = [];
    
    for (const property of properties) {
        try {
            let enhancedProperty = { ...property };
            
            // Auto-enhance title and description if enabled
            if (AUTO_ENHANCE_ENABLED) {
                try {
                    console.log(`✨ Auto-enhancing property: "${property.title}"`);
                    const enhancement = await enhancePropertyContent({
                        title: property.title || property.original_title || '',
                        description: property.description || property.original_description || ''
                    });
                    
                    enhancedProperty.enhanced_title = enhancement.enhancedTitle;
                    enhancedProperty.enhanced_description = enhancement.enhancedDescription;
                    enhancedProperty.title = enhancement.enhancedTitle; // Use enhanced as primary title
                    enhancedProperty.description = enhancement.enhancedDescription; // Use enhanced as primary description
                    
                    console.log(`✅ Enhanced property title: "${enhancement.enhancedTitle}"`);
                } catch (enhanceError) {
                    console.warn(`⚠️ Auto-enhancement failed for property "${property.title}":`, enhanceError);
                    // Keep original values if enhancement fails
                    enhancedProperty.enhanced_title = property.title || property.original_title || '';
                    enhancedProperty.enhanced_description = property.description || property.original_description || '';
                }
            }
            
            processedProperties.push(enhancedProperty);
            
        } catch (error) {
            console.error(`❌ Error processing property "${property.title}":`, error);
            // Add the property without enhancement if processing fails
            processedProperties.push(property);
        }
    }
    
    // Auto-save to database if enabled
    if (AUTO_SAVE_ENABLED && processedProperties.length > 0) {
        try {
            console.log(`💾 Auto-saving ${processedProperties.length} processed properties...`);
            await savePropertiesToDb(processedProperties);
            
            // Log to history
            await saveHistoryEntry({
                type: 'URL', // Default type, will be overridden by specific scraping methods
                details: `Auto-scraped and saved ${processedProperties.length} properties from ${source}${sourceUrl ? ` (${sourceUrl})` : ''}`,
                propertyCount: processedProperties.length
            });
            
            console.log(`✅ Auto-saved ${processedProperties.length} properties to database`);
        } catch (saveError) {
            console.error(`❌ Auto-save failed:`, saveError);
            // Don't throw error, just log it - properties are still returned for manual save
        }
    }
    
    return processedProperties;
}

export async function scrapeUrl(url: string): Promise<Property[] | null> {
    console.log(`🔍 Scraping URL: ${url}`);

    if (!url || !url.includes('http')) {
        throw new Error('Invalid URL provided.');
    }
    
    console.log(`🌐 Fetching HTML from URL...`);
    const htmlContent = await getHtml(url);
    console.log(`📄 Fetched HTML length: ${htmlContent.length}`);
    
    console.log(`🤖 Calling AI extraction with GEMINI_API_KEY present: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
    
    try {
        const result = await extractPropertyInfo({ htmlContent });
        console.log(`🔬 AI extraction result:`, {
            hasResult: !!result,
            hasProperties: !!(result && result.properties),
            propertiesCount: result?.properties?.length || 0,
            resultType: typeof result
        });
        
        if (!result || !result.properties) {
            console.log("❌ AI extraction returned no properties.");
            console.log("🔍 Full result:", JSON.stringify(result, null, 2));
            console.log("📄 HTML snippet (first 500 chars):", htmlContent.substring(0, 500));
            console.log("🔍 Looking for property keywords in HTML...");
            const keywords = ['property', 'apartment', 'villa', 'house', 'rent', 'sale', 'bedroom', 'bathroom', 'price', 'AED', '$', '€', 'sqft', 'sq ft'];
            const foundKeywords = keywords.filter(keyword => htmlContent.toLowerCase().includes(keyword.toLowerCase()));
            console.log("📋 Found keywords:", foundKeywords);
            return [];
        }
        
        console.log(`✅ AI extracted ${result.properties.length} properties successfully`);
        return processScrapedData(result.properties, url, { type: 'URL', details: url });
    } catch (extractionError) {
        console.error(`❌ AI extraction error:`, extractionError);
        const errorMessage = extractionError instanceof Error ? extractionError.message : 'Unknown AI extraction error';
        throw new Error(`AI extraction failed: ${errorMessage}`);
    }
}

export async function scrapeHtml(html: string, originalUrl: string = 'scraped-from-html'): Promise<Property[] | null> {
    console.log(`🔍 Scraping HTML of length: ${html.length}`);

    if (!html || html.length < 100) {
        throw new Error('Invalid HTML provided.');
    }

    console.log(`🤖 Calling AI extraction with GEMINI_API_KEY present: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
    
    try {
        const result = await extractPropertyInfo({ htmlContent: html });
        console.log(`🔬 AI extraction result:`, {
            hasResult: !!result,
            hasProperties: !!(result && result.properties),
            propertiesCount: result?.properties?.length || 0,
            resultType: typeof result
        });
        
        if (!result || !result.properties) {
            console.log("❌ AI extraction returned no properties.");
            console.log("🔍 Full result:", JSON.stringify(result, null, 2));
            console.log("📄 HTML snippet (first 500 chars):", html.substring(0, 500));
            console.log("🔍 Looking for property keywords in HTML...");
            const keywords = ['property', 'apartment', 'villa', 'house', 'rent', 'sale', 'bedroom', 'bathroom', 'price', 'AED', '$', '€', 'sqft', 'sq ft'];
            const foundKeywords = keywords.filter(keyword => html.toLowerCase().includes(keyword.toLowerCase()));
            console.log("📋 Found keywords:", foundKeywords);
            return [];
        }
        
        console.log(`✅ AI extracted ${result.properties.length} properties successfully`);
        return processScrapedData(result.properties, originalUrl, { type: 'HTML', details: 'Pasted HTML content' });
    } catch (extractionError) {
        console.error(`❌ AI extraction error:`, extractionError);
        const errorMessage = extractionError instanceof Error ? extractionError.message : 'Unknown AI extraction error';
        
        // Provide more specific error messages
        if (errorMessage.includes('Unexpected token') || errorMessage.includes('JSON')) {
            throw new Error(`AI service returned invalid response. This might be due to API quota limits or configuration issues. Please try again later.`);
        } else if (errorMessage.includes('API key')) {
            throw new Error(`AI service configuration error. Please check the API settings.`);
        } else {
            throw new Error(`AI extraction failed: ${errorMessage}`);
        }
    }
}

export async function scrapeBulk(urls: string): Promise<Property[] | null> {
    const urlList = urls.split('\n').map(u => u.trim()).filter(Boolean);
    console.log(`Bulk scraping ${urlList.length} URLs.`);

    if (urlList.length === 0) {
        throw new Error('No valid URLs found in bulk input.');
    }
    
    const allResults: Property[] = [];
    for (const url of urlList) {
        try {
            console.log(`Scraping ${url} in bulk...`);
            const htmlContent = await getHtml(url);
            const result = await extractPropertyInfo({ htmlContent });
            if (result && result.properties) {
                const processed = await processScrapedData(result.properties, url, {type: 'BULK', details: `Bulk operation included: ${url}`});
                allResults.push(...processed);
            }
        } catch (error) {
            console.error(`Failed to scrape ${url} during bulk operation:`, error);
        }
    }
    
    return allResults;
}


export async function saveProperty(property: Property) {
    try {
        console.log(`🔍 Attempting to save property: "${property.original_title}"`);
        console.log(`📍 Property URL: ${property.original_url}`);
        
        // Add a timestamp ID if one doesn't exist
        if (!property.id) {
            property.id = `prop-${Date.now()}-${Math.floor(Math.random() * 100)}`;
        }

        // Get database adapter
        const database = getDatabase();
        
        // DUPLICATION CHECK DISABLED - Allow all saves
        console.log(`⚠️ Duplicate detection disabled - proceeding with save`);
        
        // EFFICIENT SAVE: Save only the new property using updateProperty
        try {
            await database.updateProperty(property);
            
            console.log(`💾 Successfully saved property: ${property.original_title}`);
            
            // Revalidate the database page to show the new property
            const { revalidatePath } = await import('next/cache');
            revalidatePath('/database');
            
            return { success: true, message: "Property saved successfully" };
        } catch (saveError) {
            console.error(`❌ Error during database save:`, saveError);
            return { 
                success: false, 
                message: saveError instanceof Error 
                    ? `Database error: ${saveError.message}` 
                    : "Failed to save property to database"
            };
        }
    } catch (error) {
        console.error("❌ Unexpected error in saveProperty:", error);
        return { 
            success: false, 
            message: error instanceof Error 
                ? `Error: ${error.message}` 
                : "Failed to save property to database"
        };
    }
}

export async function updateProperty(property: Property) {
    await updatePropertyInDb(property);
}

export async function deleteProperty(propertyId: string) {
    await deletePropertyFromDb(propertyId);
}

export async function bulkDeleteProperties(propertyIds: string[]) {
    const { bulkDeleteProperties: bulkDelete } = await import('@/lib/db');
    return await bulkDelete(propertyIds);
}

export async function deleteAllProperties() {
    const { deleteAllProperties: deleteAll } = await import('@/lib/db');
    return await deleteAll();
}

export async function deleteFilteredProperties(filter: import('@/lib/db').ExportFilter) {
    const { deleteFilteredProperties: deleteFiltered } = await import('@/lib/db');
    return await deleteFiltered(filter);
}

// Export-related server actions
export async function getFilteredPropertiesAction(filter: import('@/lib/db').ExportFilter) {
    const { getFilteredProperties } = await import('@/lib/db');
    return await getFilteredProperties(filter);
}

export async function getExportStatsAction(filter?: import('@/lib/db').ExportFilter) {
    const { getExportStats } = await import('@/lib/db');
    return await getExportStats(filter);
}

export async function getFilteredHistoryAction(filter?: { startDate?: string; endDate?: string; type?: string }) {
    const { getFilteredHistory } = await import('@/lib/db');
    return await getFilteredHistory(filter);
}

// Contact extraction actions
export async function extractContactsFromAllPropertiesAction() {
    const { extractContactsFromAllPropertiesServer } = await import('@/lib/contact-extraction');
    return await extractContactsFromAllPropertiesServer();
}

export async function updatePropertyWithExtractedContactsAction(propertyId: string) {
    const { updatePropertyWithExtractedContactsServer } = await import('@/lib/contact-extraction');
    return await updatePropertyWithExtractedContactsServer(propertyId);
}

// Image sync actions for Firebase Storage
export async function syncPropertyImagesToFirebaseAction(property: Property) {
    try {
        console.log(`🔄 Syncing images for property ${property.id} to Firebase Storage...`);
        const result = await syncPropertyImagesToFirebase(property);
        
        if (result.success && result.firebaseUrls.length > 0) {
            // Update the property in database with Firebase URLs
            const database = getDatabase();
            const updatedProperty: Property = {
                ...property,
                image_urls: result.firebaseUrls,
                image_url: result.firebaseUrls[0]
            };
            
            await database.updateProperty(updatedProperty);
            console.log(`✅ Successfully synced and updated property ${property.id} with ${result.firebaseUrls.length} Firebase Storage URLs`);
            
            // Revalidate to show updated images
            revalidatePath('/database');
            
            return { 
                success: true, 
                message: `Successfully synced ${result.syncedImageCount}/${result.originalImageCount} images to Firebase Storage`,
                firebaseUrls: result.firebaseUrls
            };
        } else {
            return { 
                success: false, 
                message: `Failed to sync images: ${result.errors.join(', ')}`,
                firebaseUrls: []
            };
        }
    } catch (error) {
        console.error(`❌ Error syncing property images:`, error);
        return { 
            success: false, 
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            firebaseUrls: []
        };
    }
}

export async function syncAllPropertiesImagesToFirebaseAction() {
    try {
        console.log(`🚀 Starting bulk sync of all property images to Firebase Storage...`);
        
        // Get all properties from database
        const database = getDatabase();
        const allProperties = await database.getAllProperties();
        
        console.log(`📊 Found ${allProperties.length} properties to sync`);
        
        if (allProperties.length === 0) {
            return {
                success: true,
                message: 'No properties found to sync',
                stats: {
                    totalProperties: 0,
                    successfulProperties: 0,
                    totalImages: 0,
                    syncedImages: 0
                }
            };
        }
        
        // Sync images for all properties
        const result = await syncPropertiesImagesToFirebase(allProperties);
        
        // Revalidate to show updated images
        revalidatePath('/database');
        
        return {
            success: result.errors.length === 0,
            message: result.errors.length === 0 
                ? `Successfully synced images for ${result.successfulProperties}/${result.totalProperties} properties`
                : `Synced with ${result.errors.length} errors. Check console for details.`,
            stats: {
                totalProperties: result.totalProperties,
                successfulProperties: result.successfulProperties,
                totalImages: result.totalImages,
                syncedImages: result.syncedImages
            },
            errors: result.errors
        };
        
    } catch (error) {
        console.error(`❌ Error syncing all property images:`, error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            stats: {
                totalProperties: 0,
                successfulProperties: 0,
                totalImages: 0,
                syncedImages: 0
            }
        };
    }
}

// Refresh database action
export async function refreshDatabase(): Promise<{ success: boolean; message: string; count: number }> {
    try {
        console.log('🔄 Refreshing database data...');
        
        // Revalidate the database page to force fresh data fetch
        revalidatePath('/database');
        
        // Get fresh count for feedback
        const db = getDatabase();
        const properties = await db.getAllProperties();
        
        console.log(`✅ Database refreshed - ${properties.length} properties loaded`);
        
        return {
            success: true,
            message: `Database refreshed successfully. ${properties.length} properties loaded.`,
            count: properties.length
        };
    } catch (error) {
        console.error('❌ Failed to refresh database:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to refresh database',
            count: 0
        };
    }
}
