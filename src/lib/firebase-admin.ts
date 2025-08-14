
'use server';

import * as admin from 'firebase-admin';

let adminApp: admin.app.App;

function initializeAdminApp() {
    if (admin.apps.length > 0) {
        adminApp = admin.app();
        return;
    }

    // Check for the new, individual environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // The private key often has newline characters which need to be replaced.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        console.error('CRITICAL: One or more Firebase Admin environment variables are missing (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).');
        throw new Error('Server configuration error: Firebase Admin credentials are not set correctly.');
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
        console.error('CRITICAL: Firebase Admin SDK initialization failed.', error.message);
        throw new Error('Server configuration error: Could not initialize Firebase Admin SDK. Please check the values of your Firebase environment variables.');
    }
}

// Initialize on module load
initializeAdminApp();

export { adminApp };
