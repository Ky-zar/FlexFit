'use server';

import * as admin from 'firebase-admin';

let adminApp: admin.app.App;

function initializeAdminApp() {
    if (admin.apps.length > 0) {
        adminApp = admin.app();
        return;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // The private key must be correctly formatted. When pasting from the JSON file,
    // ensure the newline characters `\n` are preserved.
    // The replace function correctly formats the key from the environment variable.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        console.error('CRITICAL: Firebase environment variables are missing or empty (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).');
        throw new Error('Server configuration error: One or more Firebase Admin environment variables are not set.');
    }

    try {
        adminApp = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
        console.error('CRITICAL: Firebase Admin SDK initialization failed.', error);
        throw new Error('Server configuration error: Could not initialize Firebase Admin SDK. Please check the values of your Firebase environment variables.');
    }
}

// Initialize on module load
initializeAdminApp();

export { adminApp };
