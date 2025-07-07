/**
 * Test CSV export functionality directly through API
 */
const fs = require('fs');
const path = require('path');

function createCsvFromData(properties, filename) {
  // CSV headers
  const headers = [
    'id', 'title', 'price', 'location', 'city', 'property_type', 
    'bedrooms', 'bathrooms', 'area', 'scraped_at'
  ];
  
  // Convert properties to CSV rows
  const rows = properties.map(prop => [
    prop.id,
    `"${prop.title.replace(/"/g, '""')}"`, // Escape quotes
    `"${prop.price}"`,
    `"${prop.location}"`,
    `"${prop.city}"`,
    `"${prop.property_type}"`,
    prop.bedrooms,
    prop.bathrooms,
    `"${prop.area}"`,
    prop.scraped_at
  ]);
  
  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  
  // Write to file
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, csvContent);
  
  return filePath;
}

function getFilteredProperties(filter = {}) {
  const propertiesPath = path.join(__dirname, 'data', 'properties.json');
  const properties = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));
  
  if (!filter) {
    return properties;
  }

  return properties.filter(property => {
    // Date filtering based on scraped_at
    if (filter.startDate) {
      const propertyDate = new Date(property.scraped_at);
      const startDate = new Date(filter.startDate);
      if (propertyDate < startDate) return false;
    }
    
    if (filter.endDate) {
      const propertyDate = new Date(property.scraped_at);
      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (propertyDate > endDate) return false;
    }

    if (filter.propertyType && property.property_type.toLowerCase() !== filter.propertyType.toLowerCase()) {
      return false;
    }

    if (filter.location) {
      const searchLocation = filter.location.toLowerCase();
      const locationMatch = 
        property.location.toLowerCase().includes(searchLocation) ||
        property.city.toLowerCase().includes(searchLocation) ||
        property.county.toLowerCase().includes(searchLocation) ||
        property.neighborhood.toLowerCase().includes(searchLocation);
      if (!locationMatch) return false;
    }

    return true;
  });
}

async function testCsvExport() {
  console.log('🧪 Testing CSV export functionality...\n');
  
  // Test 1: Export all properties
  const allProperties = getFilteredProperties();
  const allPropsFile = createCsvFromData(allProperties, 'test-export-all.csv');
  console.log(`📄 Exported all ${allProperties.length} properties to: ${allPropsFile}`);
  
  // Test 2: Export today's properties
  const today = new Date().toISOString().split('T')[0];
  const todayProperties = getFilteredProperties({ startDate: today });
  if (todayProperties.length > 0) {
    const todayFile = createCsvFromData(todayProperties, 'test-export-today.csv');
    console.log(`📅 Exported ${todayProperties.length} today's properties to: ${todayFile}`);
  } else {
    console.log(`📅 No properties found for today (${today})`);
  }
  
  // Test 3: Export last week's properties
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekStr = lastWeek.toISOString().split('T')[0];
  const weekProperties = getFilteredProperties({ 
    startDate: lastWeekStr, 
    endDate: today 
  });
  const weekFile = createCsvFromData(weekProperties, 'test-export-week.csv');
  console.log(`📈 Exported ${weekProperties.length} properties from last 7 days to: ${weekFile}`);
  
  // Test 4: Export apartments only
  const apartmentProperties = getFilteredProperties({ propertyType: 'apartments' });
  if (apartmentProperties.length > 0) {
    const apartmentFile = createCsvFromData(apartmentProperties, 'test-export-apartments.csv');
    console.log(`🏠 Exported ${apartmentProperties.length} apartment properties to: ${apartmentFile}`);
  }
  
  // Test 5: Export Dubai properties from this week
  const dubaiWeekProperties = getFilteredProperties({ 
    location: 'Dubai',
    startDate: lastWeekStr,
    endDate: today
  });
  const dubaiFile = createCsvFromData(dubaiWeekProperties, 'test-export-dubai-week.csv');
  console.log(`🌆 Exported ${dubaiWeekProperties.length} Dubai properties from this week to: ${dubaiFile}`);
  
  console.log('\n✅ CSV export test completed!');
  console.log('📁 Check the exported CSV files to verify the filtering worked correctly.');
}

testCsvExport().catch(console.error);
