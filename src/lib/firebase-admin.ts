
'use server';

import * as admin from 'firebase-admin';

let adminApp: admin.app.App | undefined;

if (!admin.apps.length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    console.error(
      'CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.'
    );
  } else {
    try {
      let serviceAccount;
      // The key can be a JSON string or a Base64 encoded JSON string.
      // We try to parse it as JSON directly first.
      try {
        serviceAccount = JSON.parse(serviceAccountKey);
      } catch (e) {
        // If parsing fails, assume it's Base64 encoded.
        const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
        serviceAccount = JSON.parse(decodedKey);
      }

      // Validate the parsed service account object.
      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
          throw new Error("Service account object is missing required fields (project_id, private_key, client_email).");
      }

      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

    } catch (error: any) {
      console.error(
        'CRITICAL: Firebase Admin SDK initialization failed. The service account key is likely malformed. Error:',
        error.message
      );
    }
  }
} else {
  adminApp = admin.app();
}

export { adminApp };
