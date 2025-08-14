
import * as admin from 'firebase-admin';
import { getFirebaseAdminConfig } from './firebase-admin-config';

let adminApp: admin.app.App;

if (!admin.apps.length) {
  const serviceAccount = getFirebaseAdminConfig();
  if (serviceAccount) {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    console.error(
      'CRITICAL: Firebase Admin SDK initialization failed. Service Account credentials are not available.'
    );
    // You might want to handle this case more gracefully depending on your app's needs
    // For now, we will allow `adminApp` to be undefined, and checks in actions will handle it.
  }
} else {
  adminApp = admin.app();
}

export { adminApp };
export const adminDb = adminApp ? admin.firestore() : undefined;
