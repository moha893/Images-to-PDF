// firebase-config.js

// استيراد الدوال اللازمة من حزمة Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// تهيئة Firebase باستخدام متغيرات البيئة
// نستخدم process.env.VITE_... أو process.env.REACT_APP_... حسب إطار عملك.
// لغرض العرض في بيئة ويب عادية قد نحتاج إلى مساعدة من أداة بناء (Bundler) لقراءة .env.local.
// سأستخدم هنا أسماء عامة، وتذكر أن تعدلها حسب طريقة تحميل متغيرات البيئة لديك.

// **ملاحظة:** إذا كنت تستخدم Next.js، يجب أن تبدأ المتغيرات بـ NEXT_PUBLIC_.
// إذا كنت تستخدم Vite، يجب أن تبدأ المتغيرات بـ VITE_.
// لغرض هذا المثال، سأفترض أنك تستطيع قراءة F_... عبر أداة البناء.
const firebaseConfig = {
  // افترض أن طريقة قراءة المتغيرات هي عبر process.env
  apiKey: import.meta.env.F_API_KEY || process.env.F_API_KEY,
  authDomain: import.meta.env.F_AUTH_DOMAIN || process.env.F_AUTH_DOMAIN,
  projectId: import.meta.env.F_PROJECT_ID || process.env.F_PROJECT_ID,
  storageBucket: import.meta.env.F_STORAGE_BUCKET || process.env.F_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.F_MESSAGING_SENDER_ID || process.env.F_MESSAGING_SENDER_ID,
  appId: import.meta.env.F_APP_ID || process.env.F_APP_ID,
  measurementId: import.meta.env.F_MEASUREMENT_ID || process.env.F_MEASUREMENT_ID,
  // ملاحظة: قمت بإزالة databaseURL لعدم استخدامه في المصادقة، يمكنك إضافته إذا كنت بحاجة إليه.
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// تهيئة خدمات Firebase
export const auth = getAuth(app); // للحصول على خدمة المصادقة
export const analytics = getAnalytics(app); // للحصول على خدمة التحليلات

// تصدير التطبيق وخدمة المصادقة للاستخدام في ملف login.js
export default app;
