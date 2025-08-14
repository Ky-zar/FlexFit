
import * as admin from 'firebase-admin';

let adminApp: admin.app.App | undefined;

function initializeAdminApp() {
  // If the app is already initialized, don't do it again.
  if (admin.apps.length > 0) {
    adminApp = admin.app();
    return;
  }

  // This variable is set in the App Hosting environment.
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  // If the key is not available, we can't initialize the admin app.
  // This is a critical error for server-side functions.
  if (!serviceAccountKey) {
    console.error(
      'CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Firebase Admin features will be disabled.'
    );
    return;
  }

  try {
    // The key might be a base64 encoded string or a direct JSON string.
    // We try to parse it first as a direct JSON, and if that fails,
    // we assume it's base64 encoded.
    let serviceAccount;
    try {
        serviceAccount = JSON.parse(serviceAccountKey);
    } catch (e) {
        try {
            const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
            serviceAccount = JSON.parse(decodedKey);
        } catch (decodeError) {
             throw new Error("Failed to parse service account key as both direct JSON and Base64-encoded JSON.");
        }
    }

    if (typeof serviceAccount !== 'object' || serviceAccount === null) {
      throw new Error('Parsed service account is not a valid object.');
    }
    
    // Initialize the app with the service account credential.
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

  } catch (e: any) {
    // Log a more descriptive error to help with debugging.
    console.error('CRITICAL: Failed to initialize Firebase Admin SDK. Error: ', e.message);
  }
}

// Initialize the app when this module is first loaded.
initializeAdminApp();

// Export the initialized app.
// If initialization failed, this will be undefined, and dependent functions should handle it.
export { adminApp };
export const adminDb = adminApp ? admin.firestore() : undefined;
