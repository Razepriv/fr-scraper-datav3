"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { syncAllPropertiesImagesToFirebaseAction } from '@/app/actions';
import { CloudUpload, Database, Image, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SyncStats {
  totalProperties: number;
  successfulProperties: number;
  totalImages: number;
  syncedImages: number;
}

interface SyncResult {
  success: boolean;
  message: string;
  stats: SyncStats;
  errors?: string[];
}

export function ImageSyncPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  const handleSyncAll = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const syncResult = await syncAllPropertiesImagesToFirebaseAction();
      setResult(syncResult);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        stats: {
          totalProperties: 0,
          successfulProperties: 0,
          totalImages: 0,
          syncedImages: 0
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudUpload className="h-5 w-5" />
          Firebase Image Sync
        </CardTitle>
        <CardDescription>
          Ensure all property images are stored in Firebase Storage for consistent export URLs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              Sync all property images to Firebase Storage
            </span>
          </div>
          <Button 
            onClick={handleSyncAll} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <CloudUpload className="h-4 w-4" />
                Sync All Images
              </>
            )}
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing property images to Firebase Storage...
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                {result.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {result && result.stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Properties</span>
                <Badge variant={result.stats.successfulProperties === result.stats.totalProperties ? "default" : "secondary"}>
                  {result.stats.successfulProperties}/{result.stats.totalProperties}
                </Badge>
              </div>
              {result.stats.totalProperties > 0 && (
                <Progress 
                  value={(result.stats.successfulProperties / result.stats.totalProperties) * 100} 
                  className="w-full"
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Images</span>
                <Badge variant={result.stats.syncedImages === result.stats.totalImages ? "default" : "secondary"}>
                  {result.stats.syncedImages}/{result.stats.totalImages}
                </Badge>
              </div>
              {result.stats.totalImages > 0 && (
                <Progress 
                  value={(result.stats.syncedImages / result.stats.totalImages) * 100} 
                  className="w-full"
                />
              )}
            </div>
          </div>
        )}

        {result && result.errors && result.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-800">Errors:</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {result.errors.slice(0, 5).map((error, index) => (
                <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              ))}
              {result.errors.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  ... and {result.errors.length - 5} more errors
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Why Sync Images?
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Ensures consistent Firebase Storage URLs in CSV exports</p>
            <p>• Improves image loading performance and reliability</p>
            <p>• Removes dependency on external image sources</p>
            <p>• Enables proper image management and backup</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
