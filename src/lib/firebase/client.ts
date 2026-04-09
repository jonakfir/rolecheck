import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'placeholder',
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _googleProvider: GoogleAuthProvider | null = null;

function getApp_() {
  if (_app) return _app;
  _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

// Only initialize on the client side
const isBrowser = typeof window !== 'undefined';

export const app = isBrowser ? getApp_() : (null as unknown as FirebaseApp);
export const auth = isBrowser ? (() => { if (!_auth) _auth = getAuth(getApp_()); return _auth; })() : (null as unknown as Auth);
export const db = isBrowser ? (() => { if (!_db) _db = getFirestore(getApp_()); return _db; })() : (null as unknown as Firestore);
export const googleProvider = isBrowser ? (() => { if (!_googleProvider) _googleProvider = new GoogleAuthProvider(); return _googleProvider; })() : (null as unknown as GoogleAuthProvider);
