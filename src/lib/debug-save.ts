// Debug Save Property Function
import { getDatabase } from '@/lib/database-adapter';

export async function debugSaveProperty() {
  try {
    console.log('🚀 Starting debug save property test...');
    
    const database = getDatabase();
    console.log('📊 Database adapter initialized');
    
    // Get current properties count
    const existingProperties = await database.getAllProperties();
    console.log(`📋 Current properties count: ${existingProperties.length}`);
    
    // Create a test property
    const testProperty = {
      id: `test-${Date.now()}`,
      original_title: "Test Property for Debug",
      title: "Test Property for Debug",
      original_description: "This is a test property to debug the save functionality",
      description: "This is a test property to debug the save functionality",
      price: "1000 AED",
      location: "Test Location",
      bedrooms: 2,
      bathrooms: 1,
      area: "1000 sqft",
      property_type: "Apartment",
      image_urls: [],
      image_url: "https://placehold.co/600x400.png",
      original_url: "https://test.com/debug-property",
      scraped_at: new Date().toISOString(),
      city: "Test City",
      county: "Test County",
      neighborhood: "Test Neighborhood",
      what_do: "For Rent",
      tenant_type: "",
      rental_timing: "",
      furnish_type: "",
      floor_number: 0,
      features: [],
      terms_and_condition: "",
      page_link: "",
      validated_information: "",
      building_information: "",
      permit_number: "",
      ded_license_number: "",
      rera_registration_number: "",
      reference_id: "",
      dld_brn: "",
      listed_by_name: "",
      listed_by_phone: "",
      listed_by_email: "",
      matterportLink: "",
      mortgage: "",
      enhanced_title: "",
      enhanced_description: ""
    };
    
    console.log('💾 Attempting to save test property...');
    
    // Save using the same method as the action
    const allProperties = [...existingProperties, testProperty];
    await database.saveProperties(allProperties);
    
    // Verify it was saved
    const updatedProperties = await database.getAllProperties();
    console.log(`📊 Properties count after save: ${updatedProperties.length}`);
    
    const savedProperty = updatedProperties.find(p => p.id === testProperty.id);
    if (savedProperty) {
      console.log('✅ Test property saved successfully!');
      console.log('📄 Saved property:', {
        id: savedProperty.id,
        title: savedProperty.title,
        location: savedProperty.location
      });
      return { success: true, message: "Debug save test passed" };
    } else {
      console.log('❌ Test property not found after save');
      return { success: false, message: "Debug save test failed - property not found" };
    }
    
  } catch (error) {
    console.error('❌ Debug save test error:', error);
    return { 
      success: false, 
      message: `Debug test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}
