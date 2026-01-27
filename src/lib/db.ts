'use server';

import { type Property, type HistoryEntry } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { getDatabase } from '@/lib/database-adapter';

// Get database instance
const database = getDatabase();

export async function getDb(): Promise<Property[]> {
    return await database.getAllProperties();
}

export async function getHistory(): Promise<HistoryEntry[]> {
    return await database.getAllHistory();
}

export async function savePropertiesToDb(newProperties: Property[]): Promise<void> {
    console.log(`🔄 Starting EFFICIENT save process for ${newProperties.length} properties`);

    // EFFICIENT APPROACH: Save each property individually using updateProperty
    // This avoids loading and re-saving all existing properties

    const results = [];
    for (const property of newProperties) {
        try {
            console.log(`💾 Saving individual property: ${property.original_title || property.title}`);
            await database.updateProperty(property);
            results.push({ success: true, id: property.id });
        } catch (error) {
            console.error(`❌ Error saving property ${property.id}:`, error);
            results.push({ success: false, id: property.id, error });
        }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Successfully saved ${successCount}/${newProperties.length} properties using efficient method`);

    revalidatePath('/database');
}


export async function updatePropertyInDb(updatedProperty: Property): Promise<void> {
    await database.updateProperty(updatedProperty);
    revalidatePath('/database');
}


export async function deletePropertyFromDb(propertyId: string): Promise<void> {
    await database.deleteProperty(propertyId);
    revalidatePath('/database');
}

export async function bulkDeleteProperties(propertyIds: string[]): Promise<{ deletedCount: number; notFoundCount: number }> {
    return await database.bulkDeleteProperties(propertyIds);
}

export async function deleteAllProperties(): Promise<number> {
    const properties = await database.getAllProperties();
    const count = properties.length;

    await database.saveProperties([]);
    revalidatePath('/database');

    return count;
}

export async function deleteFilteredProperties(filter: ExportFilter): Promise<{ deletedCount: number; remainingCount: number }> {
    const allProperties = await database.getAllProperties();
    const filteredProperties = await getFilteredProperties(filter);
    const filteredIds = new Set(filteredProperties.map(p => p.id));

    const remainingProperties = allProperties.filter(p => !filteredIds.has(p.id));
    const deletedCount = allProperties.length - remainingProperties.length;

    await database.saveProperties(remainingProperties);
    revalidatePath('/database');

    return { deletedCount, remainingCount: remainingProperties.length };
}

export async function saveHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'date'>): Promise<void> {
    await database.saveHistoryEntry(entry);
    revalidatePath('/history');
}

export async function clearDb(): Promise<void> {
    await database.saveProperties([]);
    revalidatePath('/database');
}

export async function clearHistory(): Promise<void> {
    await database.clearHistory();
    revalidatePath('/history');
}

// Export functionality with date filtering

export interface ExportFilter {
    startDate?: string; // ISO date string
    endDate?: string;   // ISO date string
    propertyType?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
}

export async function getFilteredProperties(filter?: ExportFilter): Promise<Property[]> {
    const properties = await database.getAllProperties();

    if (!filter) {
        return properties;
    }

    const filteredResults = properties.filter(property => {
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
        if (filter.propertyType && property.property_type?.toLowerCase() !== filter.propertyType.toLowerCase()) {
            return false;
        }

        // Location filtering (city, county, or location field)
        if (filter.location) {
            const searchLocation = filter.location.toLowerCase();
            const locationMatch =
                (property.location?.toLowerCase() || '').includes(searchLocation) ||
                (property.city?.toLowerCase() || '').includes(searchLocation) ||
                (property.county?.toLowerCase() || '').includes(searchLocation) ||
                (property.neighborhood?.toLowerCase() || '').includes(searchLocation);
            if (!locationMatch) return false;
        }

        // Price filtering
        if (filter.minPrice || filter.maxPrice) {
            // Extract numeric value from price string
            const priceMatch = property.price?.match(/[\d,]+/);
            if (priceMatch) {
                const price = parseInt(priceMatch[0].replace(/,/g, ''));
                if (filter.minPrice && price < filter.minPrice) return false;
                if (filter.maxPrice && price > filter.maxPrice) return false;
            }
        }

        return true;
    });

    return filteredResults;
}

export async function getFilteredHistory(filter?: { startDate?: string; endDate?: string; type?: string }): Promise<HistoryEntry[]> {
    const history = await database.getAllHistory();

    if (!filter) {
        return history;
    }

    return history.filter(entry => {
        // Date filtering
        if (filter.startDate) {
            const entryDate = new Date(entry.date);
            const startDate = new Date(filter.startDate);
            if (entryDate < startDate) return false;
        }

        if (filter.endDate) {
            const entryDate = new Date(entry.date);
            const endDate = new Date(filter.endDate);
            endDate.setHours(23, 59, 59, 999);
            if (entryDate > endDate) return false;
        }

        // Type filtering
        if (filter.type && entry.type !== filter.type) {
            return false;
        }

        return true;
    });
}

// Export statistics function
export async function getExportStats(filter?: ExportFilter): Promise<{
    totalProperties: number;
    filteredProperties: number;
    dateRange: { earliest: string; latest: string } | null;
    propertyTypes: { [key: string]: number };
    locations: { [key: string]: number };
}> {
    const allProperties = await database.getAllProperties();
    const filteredProperties = await getFilteredProperties(filter);

    // Calculate date range
    let dateRange = null;
    if (allProperties.length > 0) {
        const dates = allProperties.map(p => new Date(p.scraped_at)).sort((a, b) => a.getTime() - b.getTime());
        dateRange = {
            earliest: dates[0].toISOString(),
            latest: dates[dates.length - 1].toISOString()
        };
    }

    // Calculate property types distribution
    const propertyTypes: { [key: string]: number } = {};
    filteredProperties.forEach(p => {
        const type = p.property_type || 'Unknown';
        propertyTypes[type] = (propertyTypes[type] || 0) + 1;
    });

    // Calculate locations distribution
    const locations: { [key: string]: number } = {};
    filteredProperties.forEach(p => {
        const location = p.city || p.location || 'Unknown';
        locations[location] = (locations[location] || 0) + 1;
    });

    return {
        totalProperties: allProperties.length,
        filteredProperties: filteredProperties.length,
        dateRange,
        propertyTypes,
        locations
    };
}
