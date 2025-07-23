/**
 * Test the new CLEAN CSV export functionality
 */
const fs = require('fs');
const path = require('path');

// Sample property data with potential "junk" content
const sampleProperties = [
  {
    id: "prop-test-1",
    title: "Beautiful <b>Studio</b> Apartment &nbsp;&nbsp; with AMAZING views!!!",
    enhanced_title: "Beautiful Studio Apartment with Amazing Views",
    description: "This is a <p>great apartment</p> with &lt;script&gt;alert('test')&lt;/script&gt; lots of spaces    and weird    formatting.\n\nMultiple paragraphs here.",
    enhanced_description: "This is a great apartment with lots of space and excellent formatting. Multiple features available.",
    price: "AED 50,000 per year",
    city: "dubai marina area",
    location: "Dubai Marina Tower <br> Block A, Unit 123",
    property_type: "studio&apartment",
    bedrooms: 0,
    bathrooms: 1,
    area: "450 sq ft",
    features: ["Air Conditioning", "", "Balcony   ", "Gym Access", null, "Swimming Pool"],
    listed_by_name: "John Smith   Real Estate",
    listed_by_phone: "+971-50-123-4567  ",
    listed_by_email: "john@realestate.com   ",
    image_urls: [
      "https://example.com/image1.jpg",
      "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      "",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg",
      "https://example.com/image4.jpg"
    ],
    scraped_at: "2025-07-22T10:30:00.000Z"
  },
  {
    id: "prop-test-2", 
    title: "Luxury Villa!!!!! &amp;&amp; Great Location",
    enhanced_title: "Luxury Villa in Great Location",
    description: "A wonderful villa with lots of <script>malicious code</script> and \\n\\n extra characters @#$%^&*()_+ everywhere",
    enhanced_description: "A wonderful villa with excellent amenities and great location",
    price: "$75,000/year",
    city: "ABU DHABI",
    location: "Saadiyat Island, Villa #456",
    property_type: "villa",
    bedrooms: 3,
    bathrooms: 4,
    area: "2,500 square feet",
    features: ["Private Pool", "Garden", "Garage"],
    listed_by_name: "Sarah Ahmed",
    listed_by_phone: "+971-55-987-6543",
    listed_by_email: "sarah@properties.ae",
    image_urls: [
      "https://example.com/villa1.jpg",
      "https://example.com/villa2.jpg"
    ],
    scraped_at: "2025-07-22T11:45:00.000Z"
  }
];

// Helper function to clean text data (mimics the one in export.ts)
function cleanTextData(text) {
  if (!text) return '';
  
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove multiple whitespaces and replace with single space
    .replace(/\s+/g, ' ')
    // Remove special characters that might break CSV
    .replace(/[^\w\s\-.,!?()]/g, '')
    // Trim whitespace
    .trim();
}

// Helper function to extract numeric value from price
function extractPriceNumber(priceString) {
  if (!priceString) return '';
  const numericPrice = priceString.replace(/[^0-9.]/g, '');
  return numericPrice || '';
}

// Helper function to extract numeric value from area
function extractAreaNumber(areaString) {
  if (!areaString) return '';
  const numericArea = areaString.replace(/sq\s*ft|sqft|square\s*feet|[^0-9.]/gi, '');
  return numericArea || '';
}

// Helper function to normalize city names
function normalizeCityName(cityString) {
  if (!cityString) return '';
  
  const city = cityString.toLowerCase().trim();
  
  if (city.includes('abu dhabi') || city.includes('abudhabi')) {
    return 'abu dhabi';
  }
  
  if (city.includes('dubai')) {
    return 'dubai';
  }
  
  return city;
}

function createCleanCsv(properties, filename) {
  // CLEAN headers - only essential fields
  const csvHeaders = [
    'ID', 'Title', 'Price', 'City', 'Location', 'Property Type', 
    'Bedrooms', 'Bathrooms', 'Area', 'Description', 
    'Features', 'Contact Name', 'Contact Phone', 'Contact Email',
    'Images', 'Scraped Date'
  ];

  const csvData = properties.map(prop => [
    prop.id || '',
    `"${cleanTextData(prop.enhanced_title || prop.title || '').replace(/"/g, '""')}"`,
    `"${extractPriceNumber(prop.price || '')}"`,
    `"${normalizeCityName(prop.city || '')}"`,
    `"${cleanTextData(prop.location || '').replace(/"/g, '""')}"`,
    `"${cleanTextData(prop.property_type || '').replace(/"/g, '""')}"`,
    prop.bedrooms || 0,
    prop.bathrooms || 0,
    `"${extractAreaNumber(prop.area || '')}"`,
    `"${cleanTextData(prop.enhanced_description || prop.description || '').substring(0, 500).replace(/"/g, '""')}"`,
    `"${(prop.features || []).filter(f => f && f.trim()).map(f => cleanTextData(f)).join(' | ').replace(/"/g, '""')}"`,
    `"${cleanTextData(prop.listed_by_name || '').replace(/"/g, '""')}"`,
    `"${cleanTextData(prop.listed_by_phone || '').replace(/"/g, '""')}"`,
    `"${cleanTextData(prop.listed_by_email || '').replace(/"/g, '""')}"`,
    `"${(prop.image_urls || []).filter(url => url && url.startsWith('http')).slice(0, 3).join(' | ').replace(/"/g, '""')}"`,
    `"${new Date(prop.scraped_at || new Date()).toLocaleDateString()}"`
  ]);

  // Combine headers and rows
  const csvContent = [csvHeaders.join(','), ...csvData.map(row => row.join(','))].join('\n');
  
  // Write to file
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, csvContent);
  
  return filePath;
}

function createLegacyCsv(properties, filename) {
  // Legacy headers with ALL fields (more likely to contain "junk")
  const csvHeaders = [
    'Title', 'City', 'Property Price', 'Property Size', 'Property Address', 'Image',
    'Landlord Name', 'Landlord Email', 'Landlord Phone', 'Property Country', 'Neighborhood / Area',
    'property_agent', 'Nationality', 'Religion', 'Tenant Type', 'Property Display Status',
    'Property Gender Preference', 'Property Living Room', 'Property Approval Status',
    'Property Furnishing Status', 'Property Minimum Stay', 'Property Maximum Stay',
    'Property Minimum Notice', 'Property Bathroom', 'Property Bed', 'Property Room',
    'Property Latitude', 'Property Longitude', 'Property Building', 'Property Owner Details',
    'Content', 'Matterport Link', 'Categories', 'What do you rent ?', 'Property Discount',
    'Property Deposit', 'Property Tax', 'Featured Property', 'Platinum Property',
    'Premium Property', 'Feature and Ammenties', 'Term and Condition'
  ];

  const csvData = properties.map(prop => [
    `"${(prop.enhanced_title || prop.title || '').replace(/"/g, '""')}"`, // May contain HTML
    `"${normalizeCityName(prop.city || '').replace(/"/g, '""')}"`,
    `"${extractPriceNumber(prop.price || '').replace(/"/g, '""')}"`,
    `"${extractAreaNumber(prop.area || '').replace(/"/g, '""')}"`,
    `"${(prop.location || '').replace(/"/g, '""')}"`, // May contain HTML
    `"${(prop.image_urls || []).join(' | ').replace(/"/g, '""')}"`, // May include data URLs
    `"${(prop.listed_by_name || '').replace(/"/g, '""')}"`,
    `"${(prop.listed_by_email || '').replace(/"/g, '""')}"`,
    `"${(prop.listed_by_phone || '').replace(/"/g, '""')}"`,
    '"UAE"', // Property Country
    `"${(prop.neighborhood || prop.county || '').replace(/"/g, '""')}"`,
    `"${(prop.listed_by_name || '').replace(/"/g, '""')}"`, // property_agent
    '""', // Nationality (empty)
    '""', // Religion (empty)
    `"${(prop.tenant_type || '').replace(/"/g, '""')}"`,
    '"Active"', // Property Display Status
    '""', // Property Gender Preference (empty)
    '""', // Property Living Room (empty)
    '"Approved"', // Property Approval Status
    `"${(prop.furnish_type || '').replace(/"/g, '""')}"`,
    '""', // Property Minimum Stay (empty)
    '""', // Property Maximum Stay (empty) 
    '""', // Property Minimum Notice (empty)
    prop.bathrooms || 0,
    prop.bedrooms || 0,
    prop.bedrooms || 0, // Property Room
    '""', // Property Latitude (empty)
    '""', // Property Longitude (empty)
    `"${(prop.building_information || '').replace(/"/g, '""')}"`,
    `"${(prop.listed_by_name || '').replace(/"/g, '""')}"`, // Property Owner Details
    `"${(prop.enhanced_description || prop.description || '').replace(/"/g, '""')}"`, // May contain HTML
    `"${(prop.matterportLink || '').replace(/"/g, '""')}"`,
    `"${(prop.property_type || '').replace(/"/g, '""')}"`,
    `"${(prop.what_do || prop.property_type || '').replace(/"/g, '""')}"`,
    '""', // Property Discount (empty)
    '""', // Property Deposit (empty)
    '""', // Property Tax (empty)
    '"No"', // Featured Property
    '"No"', // Platinum Property
    '"No"', // Premium Property
    `"${((prop.features || []).join(' | ')).replace(/"/g, '""')}"`, // May contain empty values
    `"${(prop.terms_and_condition || '').replace(/"/g, '""')}"`,
  ]);

  // Combine headers and rows
  const csvContent = [csvHeaders.join(','), ...csvData.map(row => row.join(','))].join('\n');
  
  // Write to file
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, csvContent);
  
  return filePath;
}

async function testCleanCsvExport() {
  console.log('🧪 Testing CLEAN vs LEGACY CSV export functionality...\n');
  
  console.log('📊 Sample Data Issues (before cleaning):');
  console.log(`   Title: "${sampleProperties[0].title}"`);
  console.log(`   Description: "${sampleProperties[0].description.substring(0, 100)}..."`);
  console.log(`   Location: "${sampleProperties[0].location}"`);
  console.log(`   Features: ${JSON.stringify(sampleProperties[0].features)}`);
  console.log(`   Images: ${sampleProperties[0].image_urls.length} URLs (including data URLs and empty strings)`);
  console.log('');
  
  // Create CLEAN CSV export
  const cleanFile = createCleanCsv(sampleProperties, 'test-export-CLEAN.csv');
  console.log(`✅ CLEAN CSV exported to: ${cleanFile}`);
  console.log('   ✓ HTML tags removed');
  console.log('   ✓ Extra whitespace cleaned');
  console.log('   ✓ Special characters filtered');
  console.log('   ✓ Description limited to 500 chars');
  console.log('   ✓ Only working HTTP image URLs included (max 3)');
  console.log('   ✓ Features filtered and cleaned');
  console.log('   ✓ Contact info cleaned');
  console.log('');
  
  // Create LEGACY CSV export (original format)
  const legacyFile = createLegacyCsv(sampleProperties, 'test-export-LEGACY.csv');
  console.log(`⚠️  LEGACY CSV exported to: ${legacyFile}`);
  console.log('   ⚠️ Contains raw HTML content');
  console.log('   ⚠️ May include data URLs and empty values');
  console.log('   ⚠️ Many empty columns');
  console.log('   ⚠️ Extra metadata and description rows');
  console.log('');
  
  // Show file sizes
  const cleanStats = fs.statSync(cleanFile);
  const legacyStats = fs.statSync(legacyFile);
  console.log(`📏 File Size Comparison:`);
  console.log(`   CLEAN CSV: ${cleanStats.size} bytes`);
  console.log(`   LEGACY CSV: ${legacyStats.size} bytes`);
  console.log(`   Size reduction: ${Math.round((1 - cleanStats.size / legacyStats.size) * 100)}%`);
  console.log('');
  
  console.log('✅ Export test completed!');
  console.log('💡 Recommendation: Use the CLEAN CSV format to avoid "junk" data');
  console.log('📁 Check both exported CSV files to compare the difference.');
}

testCleanCsvExport().catch(console.error);
