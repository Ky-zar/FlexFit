
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
        if (serviceAccountKey.startsWith('{')) {
            serviceAccount = JSON.parse(serviceAccountKey);
        } else {
            const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
            serviceAccount = JSON.parse(decodedKey);
        }

        adminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
        console.error('CRITICAL: Firebase Admin SDK initialization failed.', error.message);
        throw new Error('Server configuration error: Could not initialize Firebase Admin SDK.');
    }
}

// Initialize on module load
initializeAdminApp();

export { adminApp };
