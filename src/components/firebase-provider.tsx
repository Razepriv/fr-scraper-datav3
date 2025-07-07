'use client';

import { useEffect } from 'react';
import { initializeFirebase } from '@/lib/firebase';

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      initializeFirebase();
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  }, []);

  return <>{children}</>;
}
