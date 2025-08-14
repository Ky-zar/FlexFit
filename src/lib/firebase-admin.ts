
import * as admin from 'firebase-admin';

let adminApp: admin.app.App | undefined;

try {
  // Check if the app is already initialized to prevent re-initialization
  if (admin.apps.length > 0) {
    adminApp = admin.apps[0]!;
  } else {
    // Attempt to parse the service account key from environment variables
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      console.error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Firebase Admin features will be disabled.");
    } else {
      const serviceAccount = JSON.parse(serviceAccountKey);
      
      // Initialize the Firebase Admin SDK
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }
} catch (error: any) {
  console.error("Firebase Admin SDK initialization failed:", error.message);
  // Ensure adminApp is undefined if initialization fails
  adminApp = undefined;
}

export { adminApp };
export const adminDb = adminApp ? admin.firestore() : undefined;
