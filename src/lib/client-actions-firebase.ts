"use client";

import { Property } from './types';
import { getFirebaseFirestore, getFirebaseStorage } from './firebase';
import { collection, addDoc, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface ScrapeResult {
  data: Property[] | null;
  error?: string;
}

// Auto-enhancement function (simplified for client-side)
async function enhanceProperty(property: Property): Promise<Property> {
  // For static export, we'll do basic enhancement
  // In a full implementation, this would call your AI enhancement APIs
  console.log('Auto-enhancing property:', property.title);
  
  return {
    ...property,
    enhanced_title: property.title || property.original_title || 'Enhanced Property',
    enhanced_description: property.description || property.original_description || 'This property has been automatically enhanced.',
  };
}

// Check for duplicates using Firestore
async function checkForDuplicates(property: Property): Promise<boolean> {
  try {
    const db = getFirebaseFirestore();
    const propertiesRef = collection(db, 'properties');
    
    // Check by URL first
    if (property.original_url && property.original_url !== 'scraped-from-html') {
      const urlQuery = query(propertiesRef, where('original_url', '==', property.original_url));
      const urlSnapshot = await getDocs(urlQuery);
      if (!urlSnapshot.empty) {
        console.log('Duplicate found by URL:', property.original_url);
        return true;
      }
    }
    
    // Check by location + price + bedrooms combination
    if (property.location && property.price && property.bedrooms) {
      const locationQuery = query(
        propertiesRef, 
        where('location', '==', property.location),
        where('price', '==', property.price),
        where('bedrooms', '==', property.bedrooms)
      );
      const locationSnapshot = await getDocs(locationQuery);
      if (!locationSnapshot.empty) {
        console.log('Duplicate found by location+price+bedrooms');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return false; // If we can't check, allow the save
  }
}

// Auto-save to Firestore with enhancement and deduplication
async function autoSaveProperty(property: Property): Promise<{ success: boolean; message: string }> {
  try {
    // Check for duplicates first
    const isDuplicate = await checkForDuplicates(property);
    if (isDuplicate) {
      return { success: false, message: "This property already exists in the database" };
    }
    
    // Auto-enhance the property
    const enhancedProperty = await enhanceProperty(property);
    
    // Save to Firestore
    const db = getFirebaseFirestore();
    const propertiesRef = collection(db, 'properties');
    
    await addDoc(propertiesRef, {
      ...enhancedProperty,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Save to history
    const historyRef = collection(db, 'history');
    await addDoc(historyRef, {
      action: 'created',
      propertyId: enhancedProperty.id,
      url: enhancedProperty.original_url,
      details: `Property "${enhancedProperty.title}" was auto-enhanced and saved to the database`,
      timestamp: new Date()
    });
    
    console.log('Property auto-enhanced and saved:', enhancedProperty.id);
    return { success: true, message: "Property auto-enhanced and saved successfully" };
  } catch (error) {
    console.error('Error auto-saving property:', error);
    return { success: false, message: "Failed to save property to database" };
  }
}

// Simplified mock data that matches the actual Property type
const createMockProperty = (id: string, url: string, title: string): Property => ({
  id,
  original_url: url,
  title,
  original_title: title,
  description: "Mock property for demonstration with auto-enhancement enabled",
  original_description: "Mock property for demonstration",
  enhanced_title: title,
  enhanced_description: "This property has been automatically enhanced with AI-powered descriptions.",
  price: (Math.floor(Math.random() * 500000) + 100000).toString(),
  location: "Sample Location, City, State",
  bedrooms: Math.floor(Math.random() * 5) + 1,
  bathrooms: Math.floor(Math.random() * 3) + 1,
  area: (Math.floor(Math.random() * 2000) + 800).toString() + " sqft",
  property_type: "Single Family Home",
  image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
  image_urls: [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400"
  ],
  scraped_at: new Date().toISOString(),
  mortgage: "",
  neighborhood: "Sample Neighborhood",
  what_do: "",
  city: "Sample City",
  county: "Sample County",
  tenant_type: "",
  rental_timing: "",
  furnish_type: "",
  floor_number: 1,
  features: ["Modern Kitchen", "Hardwood Floors", "Garden", "Auto-Enhanced"],
  terms_and_condition: "",
  page_link: url,
  matterportLink: "",
  validated_information: "",
  building_information: "",
  permit_number: "",
  ded_license_number: "",
  rera_registration_number: "",
  reference_id: "",
  dld_brn: "",
  listed_by_name: "Sample Agent",
  listed_by_phone: "(555) 123-4567",
  listed_by_email: "agent@example.com"
});

// Mock scraping functions with auto-enhancement and auto-save
export async function scrapeUrl(url: string): Promise<Property[] | null> {
  try {
    console.log('Scraping URL with auto-enhancement:', url);
    const mockProperty = createMockProperty(
      Date.now().toString(),
      url,
      "Auto-Enhanced Property from " + new URL(url).hostname
    );
    
    // Auto-save each property
    const result = await autoSaveProperty(mockProperty);
    if (result.success) {
      console.log('Property auto-saved successfully');
    } else {
      console.log('Auto-save result:', result.message);
    }
    
    return [mockProperty];
  } catch (error) {
    console.error('Error scraping URL:', error);
    return null;
  }
}

export async function scrapeHtml(html: string): Promise<Property[] | null> {
  try {
    console.log('Scraping HTML with auto-enhancement, length:', html.length);
    const mockProperty = createMockProperty(
      Date.now().toString(),
      "scraped-from-html",
      "Auto-Enhanced Property from HTML Content"
    );
    
    // Auto-save the property
    const result = await autoSaveProperty(mockProperty);
    if (result.success) {
      console.log('Property auto-saved successfully');
    } else {
      console.log('Auto-save result:', result.message);
    }
    
    return [mockProperty];
  } catch (error) {
    console.error('Error scraping HTML:', error);
    return null;
  }
}

export async function scrapeBulk(urls: string[]): Promise<Property[] | null> {
  try {
    console.log('Bulk scraping with auto-enhancement:', urls.length, 'URLs');
    const properties: Property[] = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      if (url.trim()) {
        const mockProperty = createMockProperty(
          (Date.now() + i).toString(),
          url.trim(),
          `Auto-Enhanced Bulk Property ${i + 1}`
        );
        
        // Auto-save each property
        const result = await autoSaveProperty(mockProperty);
        if (result.success) {
          console.log(`Bulk property ${i + 1} auto-saved successfully`);
        } else {
          console.log(`Bulk property ${i + 1} auto-save result:`, result.message);
        }
        
        properties.push(mockProperty);
      }
    }

    return properties;
  } catch (error) {
    console.error('Error bulk scraping:', error);
    return null;
  }
}

export async function saveProperty(property: Property): Promise<{ success: boolean; message: string }> {
  try {
    // This function is called manually, so we still do the auto-enhancement and deduplication
    return await autoSaveProperty(property);
  } catch (error) {
    console.error('Error saving property:', error);
    return { success: false, message: "Failed to save property to database" };
  }
}

export async function uploadImage(file: File, propertyId: string): Promise<string | null> {
  try {
    const storage = getFirebaseStorage();
    const timestamp = Date.now();
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.jpg`;
    const imagePath = `properties/${filename}`;
    
    const imageRef = ref(storage, imagePath);
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('Image uploaded to Firebase Storage:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error);
    return null;
  }
}
