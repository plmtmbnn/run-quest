// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

/**
 * db is null when Firebase env vars are not configured.
 * All service functions must guard against a null db.
 */
let db: Firestore | null = null;

if (apiKey) {
  const firebaseConfig = {
    apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Prevent duplicate app initialization (e.g. in Next.js hot reload)
  const app =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  console.log(
    `[Firebase] Connected to Firestore (Project: ${firebaseConfig.projectId})`
  );
} else {
  console.warn(
    "[Firebase] API Key missing in environment. Firestore features are disabled."
  );
}

export { db };
