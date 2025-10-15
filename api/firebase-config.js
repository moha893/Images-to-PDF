// هذه دالة خادم آمنة تعمل على Vercel
// وظيفتها هي قراءة متغيرات البيئة وإرسالها للواجهة الأمامية

export default function handler(request, response) {
  
  // لطباعة المتغيرات في سجلات Vercel والتأكد من أنها موجودة
  console.log("--- Vercel is reading these variables ---");
  console.log("API Key available:", !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  console.log("Auth Domain available:", !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // التأكد من أن المفتاح الأساسي موجود قبل الإرسال
  if (firebaseConfig.apiKey) {
    response.status(200).json(firebaseConfig);
  } else {
    // إذا كانت المتغيرات غير موجودة، أرسل خطأً واضحاً
    console.error("ERROR: Firebase environment variables are NOT configured correctly in Vercel.");
    response.status(500).json({ error: "Server configuration error. Environment variables are missing." });
  }
}
