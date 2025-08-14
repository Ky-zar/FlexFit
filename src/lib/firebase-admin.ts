
'use server';

import * as admin from 'firebase-admin';

let adminApp: admin.app.App | undefined;

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    adminApp = admin.app();
    return;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    console.error('CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    return;
  }

  try {
    let serviceAccount;
    // The key can be a JSON string or a Base64 encoded JSON string.
    if (serviceAccountKey.startsWith('{')) {
      // Looks like a JSON object
      serviceAccount = JSON.parse(serviceAccountKey);
    } else {
      // Assume it's Base64 encoded.
      const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decodedKey);
    }

    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error("Service account object is missing required fields (project_id, private_key, client_email).");
    }

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");

  } catch (error: any) {
    console.error(
      'CRITICAL: Firebase Admin SDK initialization failed. The service account key is likely missing or malformed. Error:',
      error.message
    );
  }
}

// Initialize on module load
initializeAdminApp();

export { adminApp };
