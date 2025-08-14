
import * as admin from 'firebase-admin';

let adminApp: admin.app.App | undefined;

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    adminApp = admin.app();
    return;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Firebase Admin features will be disabled.'
    );
    return;
  }

  try {
    // The key is often base64 encoded in CI/CD environments, or a direct stringified JSON.
    // We try to handle both.
    const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
    let serviceAccount;
    try {
        serviceAccount = JSON.parse(decodedKey);
    } catch (e) {
        // If base64 decoding fails, try parsing directly.
        serviceAccount = JSON.parse(serviceAccountKey);
    }

    if (typeof serviceAccount !== 'object' || serviceAccount === null) {
      throw new Error('Parsed service account is not a valid object.');
    }

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

  } catch (e: any) {
    console.error('Failed to initialize Firebase Admin SDK:', e.message);
  }
}

// Initialize the app when the module is loaded.
initializeAdminApp();

export { adminApp };
export const adminDb = adminApp ? admin.firestore() : undefined;
