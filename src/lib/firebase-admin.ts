
import * as admin from 'firebase-admin';

let adminApp: admin.app.App | undefined;

if (!admin.apps.length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e: any) {
      console.error('Failed to parse Firebase service account key:', e.message);
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Firebase Admin features will be disabled.');
  }
} else {
  adminApp = admin.app();
}

export { adminApp };
export const adminDb = adminApp ? admin.firestore() : undefined;
