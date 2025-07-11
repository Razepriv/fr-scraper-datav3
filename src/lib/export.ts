"use client";

import { saveAs } from 'file-saver';
import { utils, write } from 'xlsx';
import type { Property } from '@/lib/types';

// Helper function to extract numeric value from price (remove AED, commas, etc.)
const extractPriceNumber = (priceString: string): string => {
  if (!priceString) return '';
  // Remove AED, commas, spaces, and any non-numeric characters except decimal points
  const numericPrice = priceString.replace(/[^0-9.]/g, '');
  return numericPrice || '';
};

// Helper function to extract numeric value from area (remove sq ft, sqft, etc.)
const extractAreaNumber = (areaString: string): string => {
  if (!areaString) return '';
  // Remove sq ft, sqft, square feet, commas, spaces, and any non-numeric characters except decimal points
  const numericArea = areaString.replace(/sq\s*ft|sqft|square\s*feet|[^0-9.]/gi, '');
  return numericArea || '';
};

// Helper function to normalize city names to standard categories
const normalizeCityName = (cityString: string): string => {
  if (!cityString) return '';
  
  const city = cityString.toLowerCase().trim();
  
  // Check for specific emirate names first (most specific matches)
  if (city.includes('ajman') || 
      city.includes('ajman marina') ||
      city.includes('al nuaimiya') || 
      city.includes('al rashidiya') || 
      city.includes('al jurf') || 
      city.includes('al rumailah') || 
      city.includes('corniche ajman')) {
    return 'ajman';
  }
  
  if (city.includes('sharjah') || 
      city.includes('al nahda') || 
      city.includes('al majaz') || 
      city.includes('al qasba') || 
      city.includes('al taawun') || 
      city.includes('al khan') || 
      city.includes('rolla') || 
      city.includes('al nud') || 
      city.includes('muwaileh') || 
      city.includes('university city')) {
    return 'sharjah';
  }
  
  if (city.includes('abu dhabi') || 
      city.includes('abudhabi') || 
      city.includes('khalifa city') || 
      city.includes('al reem') || 
      city.includes('yas island') || 
      city.includes('saadiyat') || 
      city.includes('corniche') || 
      city.includes('marina village') || 
      city.includes('al raha') || 
      city.includes('masdar') || 
      city.includes('al reef') || 
      city.includes('mohammed bin zayed') || 
      city.includes('mbz') || 
      city.includes('al shamkha') || 
      city.includes('al bahia')) {
    return 'abu dhabi';
  }
  
  // Define city mappings - Dubai areas (most general, checked last)
  if (city.includes('dubai') || 
      city.includes('business bay') || 
      city.includes('downtown') || 
      (city.includes('marina') && city.includes('dubai')) ||
      city.includes('dubai marina') ||
      city.includes('jlt') || 
      city.includes('jumeirah') || 
      city.includes('deira') || 
      city.includes('bur dubai') || 
      city.includes('jbr') || 
      city.includes('palm') || 
      city.includes('silicon oasis') || 
      city.includes('motor city') || 
      city.includes('sports city') || 
      city.includes('international city') || 
      city.includes('dragon mart') || 
      city.includes('discovery gardens') || 
      city.includes('jvc') || 
      city.includes('dubailand') || 
      city.includes('mirdif') || 
      city.includes('festival city') || 
      city.includes('creek') || 
      city.includes('karama') || 
      city.includes('satwa') || 
      city.includes('al barsha') || 
      city.includes('green community') || 
      city.includes('the springs') || 
      city.includes('the meadows') || 
      city.includes('emirates hills') || 
      city.includes('arabian ranches')) {
    return 'dubai';
  }
  
  // Default to Dubai if no match found (since most properties are likely in Dubai)
  return 'dubai';
};

const getAbsoluteUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) {
    return url;
  }
  // This function is client-side, so window should be available.
  if (typeof window !== 'undefined') {
    try {
        return new URL(url, window.location.origin).href;
    } catch (e) {
        return url; // Return original if it's not a valid partial URL
    }
  }
  // Fallback for any edge cases (e.g. server-side rendering context)
  return url; 
};

const createNestedObject = (prop: Property) => {
  return {
    main: {
        id: prop.id,
        title: prop.enhanced_title || prop.title || '', // Use enhanced title as primary
        description: prop.enhanced_description || prop.description || '', // Use enhanced description as primary
        price: extractPriceNumber(prop.price || ''), // Extract only numeric value
        property_type: prop.property_type || '',
        what_do: prop.what_do || '',
        furnish_type: prop.furnish_type || '',
        rental_timing: prop.rental_timing || '',
        tenant_type: prop.tenant_type || '',
        scraped_at: prop.scraped_at || '',
        original_url: prop.original_url || '',
    },
    location: {
        location: prop.location || '',
        city: normalizeCityName(prop.city || ''), // Use normalized city name
        county: prop.county || '',
        neighborhood: prop.neighborhood || '',
    },
    property_details: {
        bedrooms: prop.bedrooms || 0,
        bathrooms: prop.bathrooms || 0,
        area: extractAreaNumber(prop.area || ''), // Extract only numeric value
        floor_number: prop.floor_number || 0,
        building_information: prop.building_information || '',
    },
    features: {
        features: prop.features || [],
    },
    images: {
        image_url: getAbsoluteUrl(prop.image_url || ''),
        image_urls: (prop.image_urls || []).map(getAbsoluteUrl),
    },
    legal: {
        validated_information: prop.validated_information || '',
        permit_number: prop.permit_number || '',
        ded_license_number: prop.ded_license_number || '',
        rera_registration_number: prop.rera_registration_number || '',
        dld_brn: prop.dld_brn || '',
        reference_id: prop.reference_id || '',
        terms_and_condition: prop.terms_and_condition || '',
        mortgage: prop.mortgage || '',
    },
    agent: {
        listed_by_name: prop.listed_by_name || '',
        listed_by_phone: prop.listed_by_phone || '',
        listed_by_email: prop.listed_by_email || '',
    },
    ai_enhancements: {
        enhanced_title: prop.enhanced_title || '',
        enhanced_description: prop.enhanced_description || '',
        original_title: prop.original_title || '',
        original_description: prop.original_description || '',
    },
    matterport: {
      matterportLink: prop.matterportLink || ''
    }
  };
};

const flattenObject = (obj: any, parentKey = '', result: { [key: string]: any } = {}) => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
        flattenObject(obj[key], newKey, result);
      } else if (Array.isArray(obj[key])) {
        result[newKey] = obj[key].join(' | ');
      }
      else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
};


// Function to download data as a JSON file
export const downloadJson = (data: Property[], filename: string) => {
  const preparedData = data.map(createNestedObject);
  const jsonString = JSON.stringify(preparedData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveAs(blob, `${filename}.json`);
};

// Function to download data as a CSV file with all required headers
export const downloadCsv = (data: Property[], filename: string) => {
    if (data.length === 0) {
        alert("No data to export.");
        return;
    }
    
    // All required headers as specified
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

    const csvData = data.map(prop => ({
        'Title': prop.enhanced_title || prop.title || '',
        'City': normalizeCityName(prop.city || ''),
        'Property Price': extractPriceNumber(prop.price || ''),
        'Property Size': extractAreaNumber(prop.area || ''),
        'Property Address': prop.location || '',
        'Image': (prop.image_urls || []).map(getAbsoluteUrl).join(' | '),
        'Landlord Name': prop.listed_by_name || '',
        'Landlord Email': prop.listed_by_email || '',
        'Landlord Phone': prop.listed_by_phone || '',
        'Property Country': 'UAE', // Default for UAE properties
        'Neighborhood / Area': prop.neighborhood || prop.county || '',
        'property_agent': prop.listed_by_name || '',
        'Nationality': '', // Not available in current data
        'Religion': '', // Not available in current data
        'Tenant Type': prop.tenant_type || '',
        'Property Display Status': 'Active', // Default status
        'Property Gender Preference': '', // Not available in current data
        'Property Living Room': '', // Not available in current data
        'Property Approval Status': 'Approved', // Default status
        'Property Furnishing Status': prop.furnish_type || '',
        'Property Minimum Stay': '', // Not available in current data
        'Property Maximum Stay': '', // Not available in current data
        'Property Minimum Notice': '', // Not available in current data
        'Property Bathroom': prop.bathrooms || 0,
        'Property Bed': prop.bedrooms || 0,
        'Property Room': prop.bedrooms || 0, // Using bedrooms as room count
        'Property Latitude': '', // Not available in current data
        'Property Longitude': '', // Not available in current data
        'Property Building': prop.building_information || '',
        'Property Owner Details': prop.listed_by_name || '',
        'Content': prop.enhanced_description || prop.description || '',
        'Matterport Link': prop.matterportLink || '',
        'Categories': prop.property_type || '',
        'What do you rent ?': prop.what_do || prop.property_type || '',
        'Property Discount': '', // Not available in current data
        'Property Deposit': '', // Not available in current data
        'Property Tax': '', // Not available in current data
        'Featured Property': 'No', // Default value
        'Platinum Property': 'No', // Default value
        'Premium Property': 'No', // Default value
        'Feature and Ammenties': (prop.features || []).join(' | '),
        'Term and Condition': prop.terms_and_condition || '',
    }));

    const worksheet = utils.json_to_sheet(csvData, { header: csvHeaders, skipHeader: false });
    
    // Add description row with field explanations
    const descriptionRow = {
        'Title': 'Property Title',
        'City': 'City Name',
        'Property Price': 'Price (numbers only)',
        'Property Size': 'Size in sqft (numbers only)',
        'Property Address': 'Full Address',
        'Image': 'Image URLs separated by |',
        'Landlord Name': 'Owner/Agent Name',
        'Landlord Email': 'Contact Email',
        'Landlord Phone': 'Contact Phone',
        'Property Country': 'Country (UAE)',
        'Neighborhood / Area': 'Area/Neighborhood',
        'property_agent': 'Agent Name',
        'Nationality': 'Owner Nationality',
        'Religion': 'Religion Preference',
        'Tenant Type': 'Tenant Type Preference',
        'Property Display Status': 'Display Status',
        'Property Gender Preference': 'Gender Preference',
        'Property Living Room': 'Living Room Count',
        'Property Approval Status': 'Approval Status',
        'Property Furnishing Status': 'Furnishing Type',
        'Property Minimum Stay': 'Minimum Stay Period',
        'Property Maximum Stay': 'Maximum Stay Period',
        'Property Minimum Notice': 'Notice Period',
        'Property Bathroom': 'Bathroom Count',
        'Property Bed': 'Bedroom Count',
        'Property Room': 'Room Count',
        'Property Latitude': 'GPS Latitude',
        'Property Longitude': 'GPS Longitude',
        'Property Building': 'Building Information',
        'Property Owner Details': 'Owner Details',
        'Content': 'Property Description',
        'Matterport Link': 'Virtual Tour Link',
        'Categories': 'Property Category',
        'What do you rent ?': 'Rental Type',
        'Property Discount': 'Discount Amount',
        'Property Deposit': 'Security Deposit',
        'Property Tax': 'Tax Information',
        'Featured Property': 'Featured Status',
        'Platinum Property': 'Platinum Status',
        'Premium Property': 'Premium Status',
        'Feature and Ammenties': 'Features and Amenities',
        'Term and Condition': 'Terms and Conditions',
    };
    const descriptionRowArray = csvHeaders.map(header => descriptionRow[header as keyof typeof descriptionRow] || '');
    utils.sheet_add_aoa(worksheet, [descriptionRowArray], { origin: 'A2' });

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Properties');

    // Generate CSV output
    const csvOutput = write(workbook, { bookType: 'csv', type: 'string' });
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
};

// Function to download data as an Excel file with complete headers
export const downloadExcel = (data: Property[], filename: string) => {
    if (data.length === 0) {
        alert("No data to export.");
        return;
    }

    // Complete headers as specified
    const excelHeaders = [
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

    const excelData = data.map(prop => ({
        'Title': prop.enhanced_title || prop.title || '',
        'City': normalizeCityName(prop.city || ''),
        'Property Price': extractPriceNumber(prop.price || ''),
        'Property Size': extractAreaNumber(prop.area || ''),
        'Property Address': prop.location || '',
        'Image': (prop.image_urls || []).map(getAbsoluteUrl).join(' | '),
        'Landlord Name': prop.listed_by_name || '',
        'Landlord Email': prop.listed_by_email || '',
        'Landlord Phone': prop.listed_by_phone || '',
        'Property Country': 'UAE',
        'Neighborhood / Area': prop.neighborhood || prop.county || '',
        'property_agent': prop.listed_by_name || '',
        'Nationality': '',
        'Religion': '',
        'Tenant Type': prop.tenant_type || '',
        'Property Display Status': 'Active',
        'Property Gender Preference': '',
        'Property Living Room': '',
        'Property Approval Status': 'Approved',
        'Property Furnishing Status': prop.furnish_type || '',
        'Property Minimum Stay': '',
        'Property Maximum Stay': '',
        'Property Minimum Notice': '',
        'Property Bathroom': prop.bathrooms || 0,
        'Property Bed': prop.bedrooms || 0,
        'Property Room': prop.bedrooms || 0,
        'Property Latitude': '',
        'Property Longitude': '',
        'Property Building': prop.building_information || '',
        'Property Owner Details': prop.listed_by_name || '',
        'Content': prop.enhanced_description || prop.description || '',
        'Matterport Link': prop.matterportLink || '',
        'Categories': prop.property_type || '',
        'What do you rent ?': prop.what_do || prop.property_type || '',
        'Property Discount': '',
        'Property Deposit': '',
        'Property Tax': '',
        'Featured Property': 'No',
        'Platinum Property': 'No',
        'Premium Property': 'No',
        'Feature and Ammenties': (prop.features || []).join(' | '),
        'Term and Condition': prop.terms_and_condition || '',
    }));
  
    const worksheet = utils.json_to_sheet(excelData, { header: excelHeaders });
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Properties');

    // Generate XLSX output
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `${filename}.xlsx`);
};

// Enhanced export functions with filtering metadata
export const downloadFilteredJson = (data: Property[], filename: string, filterInfo?: string) => {
  const metadata = {
    exportDate: new Date().toISOString(),
    totalRecords: data.length,
    filterApplied: filterInfo || 'No filter applied',
    data: data.map(createNestedObject)
  };
  
  const jsonString = JSON.stringify(metadata, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveAs(blob, `${filename}.json`);
};

export const downloadFilteredCsv = (data: Property[], filename: string, filterInfo?: string) => {
    if (data.length === 0) {
        alert("No data to export.");
        return;
    }
    
    // Complete headers as specified
    const csvHeaders = [
        'Export Info', 'Title', 'City', 'Property Price', 'Property Size', 'Property Address', 'Image',
        'Landlord Name', 'Landlord Email', 'Landlord Phone', 'Property Country', 'Neighborhood / Area',
        'property_agent', 'Nationality', 'Religion', 'Tenant Type', 'Property Display Status',
        'Property Gender Preference', 'Property Living Room', 'Property Approval Status',
        'Property Furnishing Status', 'Property Minimum Stay', 'Property Maximum Stay',
        'Property Minimum Notice', 'Property Bathroom', 'Property Bed', 'Property Room',
        'Property Latitude', 'Property Longitude', 'Property Building', 'Property Owner Details',
        'Content', 'Matterport Link', 'Categories', 'What do you rent ?', 'Property Discount',
        'Property Deposit', 'Property Tax', 'Featured Property', 'Platinum Property',
        'Premium Property', 'Feature and Ammenties', 'Term and Condition', 'Scraped Date'
    ];

    // Add metadata row
    const metadataRow = [
        `Export Date: ${new Date().toLocaleDateString()}, Records: ${data.length}, Filter: ${filterInfo || 'None'}`,
        ...Array(csvHeaders.length - 1).fill('')
    ];

    const csvData = data.map(prop => ({
        'Export Info': '', // Empty for data rows
        'Title': prop.enhanced_title || prop.title || '',
        'City': normalizeCityName(prop.city || ''),
        'Property Price': extractPriceNumber(prop.price || ''),
        'Property Size': extractAreaNumber(prop.area || ''),
        'Property Address': prop.location || '',
        'Image': (prop.image_urls || []).map(getAbsoluteUrl).join(' | '),
        'Landlord Name': prop.listed_by_name || '',
        'Landlord Email': prop.listed_by_email || '',
        'Landlord Phone': prop.listed_by_phone || '',
        'Property Country': 'UAE',
        'Neighborhood / Area': prop.neighborhood || prop.county || '',
        'property_agent': prop.listed_by_name || '',
        'Nationality': '',
        'Religion': '',
        'Tenant Type': prop.tenant_type || '',
        'Property Display Status': 'Active',
        'Property Gender Preference': '',
        'Property Living Room': '',
        'Property Approval Status': 'Approved',
        'Property Furnishing Status': prop.furnish_type || '',
        'Property Minimum Stay': '',
        'Property Maximum Stay': '',
        'Property Minimum Notice': '',
        'Property Bathroom': prop.bathrooms || 0,
        'Property Bed': prop.bedrooms || 0,
        'Property Room': prop.bedrooms || 0,
        'Property Latitude': '',
        'Property Longitude': '',
        'Property Building': prop.building_information || '',
        'Property Owner Details': prop.listed_by_name || '',
        'Content': prop.enhanced_description || prop.description || '',
        'Matterport Link': prop.matterportLink || '',
        'Categories': prop.property_type || '',
        'What do you rent ?': prop.what_do || prop.property_type || '',
        'Property Discount': '',
        'Property Deposit': '',
        'Property Tax': '',
        'Featured Property': 'No',
        'Platinum Property': 'No',
        'Premium Property': 'No',
        'Feature and Ammenties': (prop.features || []).join(' | '),
        'Term and Condition': prop.terms_and_condition || '',
        'Scraped Date': new Date(prop.scraped_at || new Date()).toLocaleDateString(),
    }));

    const worksheet = utils.json_to_sheet([]);
    
    // Add metadata row
    utils.sheet_add_aoa(worksheet, [metadataRow], { origin: 'A1' });
    
    // Add headers
    utils.sheet_add_aoa(worksheet, [csvHeaders], { origin: 'A2' });
    
    // Add description row
    const descriptionRow = [
        'Filter/Export Info',
        'Property Id',
        'Description',
        'image URL 1 | image URL 2 | ...',
        'Matterport',
        'Rental type',
        'Price (numbers only)',
        'City (ajman/sharjah/dubai/abu dhabi)',
        'Beds property',
        'Baths property',
        'Sqft property (numbers only)',
        'Tenant Type',
        'Rental Period',
        'Furnish type',
        'Floor number',
        'DLD permit number',
        'DED license number',
        'Rera registration number',
        'DLD BRN',
        'Reference Id',
        'Take them with the | pipe SEPERATED',
        'Term and Condition (Check on website and update)',
        'Date when property was scraped'
    ];
    utils.sheet_add_aoa(worksheet, [descriptionRow], { origin: 'A3' });

    // Add data starting from row 4
    const dataArray = csvData.map(row => csvHeaders.map(header => row[header as keyof typeof row] || ''));
    utils.sheet_add_aoa(worksheet, dataArray, { origin: 'A4' });

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Properties');

    // Generate CSV output
    const csvOutput = write(workbook, { bookType: 'csv', type: 'string' });
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
};

export const downloadFilteredExcel = (data: Property[], filename: string, filterInfo?: string) => {
    if (data.length === 0) {
        alert("No data to export.");
        return;
    }

    // Complete headers as specified
    const excelHeaders = [
        'Export Info', 'Title', 'City', 'Property Price', 'Property Size', 'Property Address', 'Image',
        'Landlord Name', 'Landlord Email', 'Landlord Phone', 'Property Country', 'Neighborhood / Area',
        'property_agent', 'Nationality', 'Religion', 'Tenant Type', 'Property Display Status',
        'Property Gender Preference', 'Property Living Room', 'Property Approval Status',
        'Property Furnishing Status', 'Property Minimum Stay', 'Property Maximum Stay',
        'Property Minimum Notice', 'Property Bathroom', 'Property Bed', 'Property Room',
        'Property Latitude', 'Property Longitude', 'Property Building', 'Property Owner Details',
        'Content', 'Matterport Link', 'Categories', 'What do you rent ?', 'Property Discount',
        'Property Deposit', 'Property Tax', 'Featured Property', 'Platinum Property',
        'Premium Property', 'Feature and Ammenties', 'Term and Condition', 'Scraped Date'
    ];

    // Add metadata to each row
    const enhancedData = data.map((prop, index) => ({
        'Export Info': index === 0 ? `Export Date: ${new Date().toLocaleDateString()}, Records: ${data.length}, Filter: ${filterInfo || 'None'}` : '',
        'Title': prop.enhanced_title || prop.title || '',
        'City': normalizeCityName(prop.city || ''),
        'Property Price': extractPriceNumber(prop.price || ''),
        'Property Size': extractAreaNumber(prop.area || ''),
        'Property Address': prop.location || '',
        'Image': (prop.image_urls || []).map(getAbsoluteUrl).join(' | '),
        'Landlord Name': prop.listed_by_name || '',
        'Landlord Email': prop.listed_by_email || '',
        'Landlord Phone': prop.listed_by_phone || '',
        'Property Country': 'UAE',
        'Neighborhood / Area': prop.neighborhood || prop.county || '',
        'property_agent': prop.listed_by_name || '',
        'Nationality': '',
        'Religion': '',
        'Tenant Type': prop.tenant_type || '',
        'Property Display Status': 'Active',
        'Property Gender Preference': '',
        'Property Living Room': '',
        'Property Approval Status': 'Approved',
        'Property Furnishing Status': prop.furnish_type || '',
        'Property Minimum Stay': '',
        'Property Maximum Stay': '',
        'Property Minimum Notice': '',
        'Property Bathroom': prop.bathrooms || 0,
        'Property Bed': prop.bedrooms || 0,
        'Property Room': prop.bedrooms || 0,
        'Property Latitude': '',
        'Property Longitude': '',
        'Property Building': prop.building_information || '',
        'Property Owner Details': prop.listed_by_name || '',
        'Content': prop.enhanced_description || prop.description || '',
        'Matterport Link': prop.matterportLink || '',
        'Categories': prop.property_type || '',
        'What do you rent ?': prop.what_do || prop.property_type || '',
        'Property Discount': '',
        'Property Deposit': '',
        'Property Tax': '',
        'Featured Property': 'No',
        'Platinum Property': 'No',
        'Premium Property': 'No',
        'Feature and Ammenties': (prop.features || []).join(' | '),
        'Term and Condition': prop.terms_and_condition || '',
        'Scraped Date': new Date(prop.scraped_at || new Date()).toLocaleDateString(),
    }));
  
    const worksheet = utils.json_to_sheet(enhancedData, { header: excelHeaders });
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Properties');

  // Generate XLSX output
  const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `${filename}.xlsx`);
};

// Utility function to generate filename with date range
export const generateFilteredFilename = (baseFilename: string, startDate?: string, endDate?: string, additionalFilter?: string): string => {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  let filename = `${baseFilename}_${timestamp}`;
  
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate).toISOString().split('T')[0] : 'all';
    const end = endDate ? new Date(endDate).toISOString().split('T')[0] : 'all';
    filename += `_${start}_to_${end}`;
  }
  
  if (additionalFilter) {
    filename += `_${additionalFilter.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
  
  return filename;
};
