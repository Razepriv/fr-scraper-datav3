import { getDatabase } from '../../lib/database-adapter';
import { DatabasePage } from '../../components/app/database-page';
import { ImageSyncPanel } from '../../components/app/image-sync-panel';
import { Suspense } from 'react';
import { Skeleton } from '../../components/ui/skeleton';

export default async function Database() {
  // Load properties and show most recent first (last 50 properties)
  const db = getDatabase();
  const allProperties = await db.getAllProperties();
  
  // Sort by scraped_at date (most recent first) and take first 50
  const sortedProperties = allProperties.sort((a, b) => {
    const dateA = new Date(a.scraped_at || 0).getTime();
    const dateB = new Date(b.scraped_at || 0).getTime();
    return dateB - dateA; // Most recent first
  });
  
  const properties = sortedProperties.slice(0, 50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Property Database</h1>
        <p className="text-muted-foreground">
          View, edit, and manage your saved properties. Showing most recent 50 of {allProperties.length} properties. Use the refresh button to load recently scraped data.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <DatabasePage initialProperties={properties} />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <ImageSyncPanel />
        </div>
      </div>
    </div>
  );
}
