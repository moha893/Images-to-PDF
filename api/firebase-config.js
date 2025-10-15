// /api/firebase-config.js

export default function handler(request, response) {
  
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (firebaseConfig.apiKey) {
    response.status(200).json(firebaseConfig);
  } else {
    console.error("ERROR: Firebase environment variables are NOT configured correctly in Vercel.");
    response.status(500).json({ error: "Server configuration error. Firebase environment variables are missing." });
  }
}