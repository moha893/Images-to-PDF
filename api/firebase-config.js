// This is a Vercel Serverless Function.
// Its purpose is to securely provide the Firebase config to the client.

export default function handler(request, response) {
  // Read the environment variables from Vercel's server-side environment.
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Send the configuration object back to the client as a JSON response.
  // The status code 200 means "OK".
  response.status(200).json(firebaseConfig);
}