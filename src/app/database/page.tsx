import { ImageSyncPanel } from '../../components/app/image-sync-panel';
import { Suspense } from 'react';
import { Skeleton } from '../../components/ui/skeleton';
import { PropertiesLoader } from '@/components/app/properties-loader';

export default function Database() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Property Database</h1>
        <p className="text-muted-foreground mt-2">
          View, edit, and manage your saved properties. Showing most recent 50 properties.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
            <PropertiesLoader />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <ImageSyncPanel />
        </div>
      </div>
    </div>
  );
}
