import * as admin from 'firebase-admin';

// This is the server-side Firebase Admin SDK, used in server actions and API routes.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminApp = admin.apps[0];
export const adminDb = admin.firestore();
