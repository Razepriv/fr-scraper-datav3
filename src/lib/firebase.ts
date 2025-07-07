// Firebase Client Configuration
// Initializes Firebase app with the configuration from environment variables

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate configuration
function validateFirebaseConfig() {
  const requiredFields = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  for (const field of requiredFields) {
    if (!firebaseConfig[field as keyof typeof firebaseConfig]) {
      throw new Error(`Firebase configuration missing: NEXT_PUBLIC_FIREBASE_${field.toUpperCase()}`);
    }
  }
}

// Initialize Firebase app (singleton)
let app: FirebaseApp;
let storage: FirebaseStorage;
let firestore: Firestore;

export function initializeFirebase() {
  // Only initialize if not already done
  if (getApps().length === 0) {
    try {
      validateFirebaseConfig();
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase app initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      throw error;
    }
  } else {
    app = getApps()[0];
  }

  return app;
}

// Get Firebase Storage instance
export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    const app = initializeFirebase();
    storage = getStorage(app);
  }
  return storage;
}

// Get Firestore instance
export function getFirebaseFirestore(): Firestore {
  if (!firestore) {
    const app = initializeFirebase();
    firestore = getFirestore(app);
  }
  return firestore;
}

// Get Firebase app instance
export function getFirebaseApp(): FirebaseApp {
  return initializeFirebase();
}

// Export configuration for debugging
export { firebaseConfig };
