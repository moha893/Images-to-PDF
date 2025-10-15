import admin from 'firebase-admin';
import { sign } from 'jsonwebtoken';
// ... other imports

export default async function handler(req, res) {
  // --- START DEBUGGING CODE ---
  // هذا الكود سيطبع لنا قيمة المتغير كما يراها Vercel
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  console.log('Raw FIREBASE_SERVICE_ACCOUNT_KEY:', rawServiceAccount);

  if (!rawServiceAccount) {
    return res.status(500).json({ error: 'FIREBASE_SERVICE_ACCOUNT_KEY is not set.' });
  }
  // --- END DEBUGGING CODE ---

  try {
    // استخدم المتغير الخام الذي طبعناه للتأكد
    const serviceAccount = JSON.parse(rawServiceAccount);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    // ... aalqa باقي الكود كما هو
    // ... the rest of your code
  } catch (error) {
    console.error('Error initializing Firebase or during login:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}