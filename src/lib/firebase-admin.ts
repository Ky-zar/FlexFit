import * as admin from 'firebase-admin';

// This is the server-side Firebase Admin SDK, used in server actions and API routes.

let serviceAccount: admin.ServiceAccount | undefined = undefined;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
    }
} else {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Some admin features may not work.");
}


if (!admin.apps.length) {
    if(serviceAccount) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } catch (e) {
             console.error('Firebase Admin SDK initialization error:', e);
        }
    } else {
         console.error('Firebase Admin SDK could not be initialized because a service account was not provided.');
    }
}

export const adminApp = admin.apps.length > 0 ? admin.apps[0] : undefined;
export const adminDb = adminApp ? admin.firestore() : undefined;
