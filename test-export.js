/**
 * Test script to verify date filtering functionality in export
 * Run with: npm run test-export
 */

const fs = require('fs');
const path = require('path');

// Simple date filtering implementation for testing
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
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      if (propertyDate > endDate) return false;
    }

    // Property type filtering
    if (filter.propertyType && property.property_type.toLowerCase() !== filter.propertyType.toLowerCase()) {
      return false;
    }

    // Location filtering
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

async function testDateFiltering() {
  console.log('🧪 Testing date filtering functionality...\n');
  
  // Test 1: Get all properties
  const allProperties = getFilteredProperties();
  console.log(`📊 Total properties: ${allProperties.length}`);
  
  // Test 2: Filter by start date (today)
  const today = new Date().toISOString().split('T')[0];
  const todayProperties = getFilteredProperties({ startDate: today });
  console.log(`📅 Properties from today (${today}): ${todayProperties.length}`);
  
  // Test 3: Filter by date range (last 7 days)
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekStr = lastWeek.toISOString().split('T')[0];
  const weekProperties = getFilteredProperties({ 
    startDate: lastWeekStr, 
    endDate: today 
  });
  console.log(`📈 Properties from last 7 days (${lastWeekStr} to ${today}): ${weekProperties.length}`);
  
  // Test 4: Filter by property type
  const studioProperties = getFilteredProperties({ propertyType: 'Studio' });
  console.log(`🏠 Studio properties: ${studioProperties.length}`);
  
  // Test 5: Filter by location
  const dubaiProperties = getFilteredProperties({ location: 'Dubai' });
  console.log(`🌆 Dubai properties: ${dubaiProperties.length}`);
  
  // Test 6: Combined filters
  const todayStudios = getFilteredProperties({ 
    startDate: today,
    propertyType: 'Studio'
  });
  console.log(`🎯 Today's Studio properties: ${todayStudios.length}`);
  
  // Show property type distribution
  console.log('\n📊 Property Type Distribution:');
  const propertyTypes = {};
  allProperties.forEach(prop => {
    const type = prop.property_type || 'Unknown';
    propertyTypes[type] = (propertyTypes[type] || 0) + 1;
  });
  
  Object.entries(propertyTypes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count} properties`);
    });
  
  // Show sample dates
  console.log('\n🕒 Sample scraped_at dates:');
  allProperties.slice(0, 5).forEach((prop, index) => {
    const date = new Date(prop.scraped_at);
    console.log(`  ${index + 1}: ${prop.scraped_at} (${date.toLocaleDateString()} ${date.toLocaleTimeString()})`);
  });
  
  // Show date range info
  const dates = allProperties.map(p => new Date(p.scraped_at)).sort((a, b) => a - b);
  if (dates.length > 0) {
    console.log('\n📈 Date Range:');
    console.log(`  Earliest: ${dates[0].toLocaleDateString()} ${dates[0].toLocaleTimeString()}`);
    console.log(`  Latest: ${dates[dates.length - 1].toLocaleDateString()} ${dates[dates.length - 1].toLocaleTimeString()}`);
  }
  
  console.log('\n✅ Date filtering test completed!');
}

testDateFiltering().catch(console.error);
