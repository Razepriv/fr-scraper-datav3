
import { getDatabase } from '@/lib/database-adapter';
import { DatabasePage } from './database-page';

export async function PropertiesLoader() {
    const db = getDatabase();
    const allProperties = await db.getAllProperties();

    // Sort by scraped_at date (most recent first) and take first 50
    const sortedProperties = allProperties.sort((a, b) => {
        const dateA = new Date(a.scraped_at || 0).getTime();
        const dateB = new Date(b.scraped_at || 0).getTime();
        return dateB - dateA; // Most recent first
    });

    const properties = sortedProperties.slice(0, 50);

    return <DatabasePage initialProperties={properties} />;
}
