import { Suspense } from 'react';
import { Skeleton } from '../../components/ui/skeleton';
import { HistoryLoader } from '@/components/app/history-loader';

export default function History() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Scraping History</h1>
        <p className="text-muted-foreground mt-2">
          A log of your recent scraping activities.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
        <HistoryLoader />
      </Suspense>
    </div>
  );
}
