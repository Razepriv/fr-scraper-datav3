import { getDatabase } from '../../lib/database-adapter';
import { DatabasePage } from '../../components/app/database-page';
import { Suspense } from 'react';
import { Skeleton } from '../../components/ui/skeleton';

export default async function Database() {
  // Load only first 50 properties to avoid oversized page
  const db = getDatabase();
  const allProperties = await db.getAllProperties();
  const properties = allProperties.slice(0, 50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Property Database</h1>
        <p className="text-muted-foreground">
          View, edit, and manage your saved properties. Showing first 50 of {allProperties.length} properties.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <DatabasePage initialProperties={properties} />
      </Suspense>
    </div>
  );
}
