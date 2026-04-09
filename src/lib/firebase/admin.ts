import { initializeApp, getApps, cert, getApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApp();
    return _app;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set');
  }

  // Support both JSON string and individual env vars
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : {
        projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      };

  _app = initializeApp({
    credential: cert(serviceAccount),
    projectId,
  });

  return _app;
}

/** Lazy-initialized Firestore admin instance */
export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_, prop) {
    if (!_db) _db = getFirestore(getAdminApp());
    return (_db as any)[prop];
  },
});

/** Lazy-initialized Auth admin instance */
export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_, prop) {
    if (!_auth) _auth = getAuth(getAdminApp());
    return (_auth as any)[prop];
  },
});
