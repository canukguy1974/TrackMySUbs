import * as admin from 'firebase-admin';

let app: admin.app.App;

try {
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!serviceAccountBase64) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_BASE64 in env');

  const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
  const serviceAccount = JSON.parse(serviceAccountJson);

  if (!admin.apps.length) {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized');
  } else {
    app = admin.app();
  }
} catch (error) {
  console.error('❌ Firebase Admin init failed:', error);
}

// 🔥 ADD THIS:
export const adminAuth = admin.auth();

export default admin;
