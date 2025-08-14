
import type { ServiceAccount } from 'firebase-admin';

export function getFirebaseAdminConfig(): ServiceAccount | undefined {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    console.error(
      'CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.'
    );
    return undefined;
  }

  try {
    let serviceAccountJson;
    // First, try to parse it as a direct JSON string.
    try {
        serviceAccountJson = JSON.parse(serviceAccountKey);
    } catch (e) {
        // If that fails, assume it's a Base64-encoded string.
        const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
        serviceAccountJson = JSON.parse(decodedKey);
    }
    
    // Basic validation to ensure it looks like a service account
    if (
      !serviceAccountJson.project_id ||
      !serviceAccountJson.private_key ||
      !serviceAccountJson.client_email
    ) {
      throw new Error('Parsed service account does not have required fields.');
    }

    return serviceAccountJson as ServiceAccount;
  } catch (error: any) {
    console.error(
      'CRITICAL: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY.',
      error.message
    );
    return undefined;
  }
}
