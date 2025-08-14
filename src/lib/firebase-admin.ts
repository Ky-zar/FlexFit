
import * as admin from 'firebase-admin';

let adminApp: admin.app.App | undefined;

try {
  // Check if the app is already initialized
  if (admin.apps.length > 0) {
    adminApp = admin.apps[0]!;
  } else {
    // Attempt to parse the service account key from environment variables
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error("The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Server-side Firebase features will be disabled.");
    }
    
    const serviceAccount = JSON.parse(serviceAccountKey);

    // Initialize the Firebase Admin SDK
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error: any) {
  console.error("Firebase Admin SDK initialization failed:", error.message);
  adminApp = undefined;
}

export { adminApp };
export const adminDb = adminApp ? admin.firestore() : undefined;
