
'use server';

import * as admin from 'firebase-admin';

let adminApp: admin.app.App;

function initializeAdminApp() {
    if (admin.apps.length > 0) {
        adminApp = admin.app();
        return;
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
        console.error('CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
        throw new Error('Server configuration error: Service account key is missing.');
    }

    try {
        let serviceAccount;
        // The key might be a JSON string or a base64 encoded JSON string.
        // Try parsing directly first, which works for many environments.
        try {
            serviceAccount = JSON.parse(serviceAccountKey);
        } catch (e) {
            // If direct parsing fails, assume it's base64 encoded.
            const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
            serviceAccount = JSON.parse(decodedKey);
        }

        adminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
        console.error('CRITICAL: Firebase Admin SDK initialization failed.', error.message);
        throw new Error('Server configuration error: Could not initialize Firebase Admin SDK. Please ensure the service account key is a valid JSON or base64-encoded JSON.');
    }
}

// Initialize on module load
initializeAdminApp();

export { adminApp };
