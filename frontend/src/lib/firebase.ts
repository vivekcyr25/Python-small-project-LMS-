import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

/**
 * Firebase is initialised lazily — only when getFirebaseAuth() is first called.
 * This prevents the app from crashing at startup if VITE_FIREBASE_* env vars
 * are not yet configured.
 */

const PLACEHOLDER_API_KEYS = new Set([
  '',
  'replace-with-api-key',
  'dummy-api-key',
  'your-api-key',
]);

/** True when VITE_FIREBASE_USE_MOCK=true or API key is missing/placeholder. */
export function isFirebaseMockMode(): boolean {
  if (import.meta.env.VITE_FIREBASE_USE_MOCK === 'true') return true;
  const apiKey = (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined)?.trim();
  return !apiKey || PLACEHOLDER_API_KEYS.has(apiKey);
}

/** True when real Firebase client SDK should be used (Google popup, Phone OTP). */
export function isFirebaseConfigured(): boolean {
  return !isFirebaseMockMode();
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _googleProvider: GoogleAuthProvider | null = null;

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;

  if (isFirebaseMockMode()) {
    throw new Error(
      'Firebase client is in mock mode. Set real VITE_FIREBASE_* values in frontend/.env ' +
        'and set VITE_FIREBASE_USE_MOCK=false, or keep mock mode for local dev.'
    );
  }

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!apiKey || PLACEHOLDER_API_KEYS.has(apiKey)) {
    throw new Error(
      'Firebase is not configured. Add VITE_FIREBASE_* variables to your frontend/.env file.'
    );
  }

  const firebaseConfig = {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  // Prevent duplicate initialisation on HMR.
  _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

export function getGoogleProvider(): GoogleAuthProvider {
  if (!_googleProvider) {
    _googleProvider = new GoogleAuthProvider();
  }
  return _googleProvider;
}
