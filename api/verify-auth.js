// استيراد Firebase Admin SDK
const admin = require('firebase-admin');

// المتغير البيئي الذي يحتوي على معلومات الحساب الخدمي
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

// تهيئة Firebase Admin
// يجب أن تتم التهيئة مرة واحدة فقط
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    // إذا فشلت التهيئة، يجب إيقاف العملية
    // هذا يعني أن المفتاح البيئي لم يتم إعداده بشكل صحيح
    // سيؤدي الفشل هنا إلى منع أي طلبات لاحقة
  }
}

// دالة Serverless Function الرئيسية (Module Export)
module.exports = async (req, res) => {
  // 1. السماح فقط بطلبات GET (يمكنك تغييرها حسب الحاجة)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. استخراج التوكن من الـ Authorization Header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
  }
  
  // التوكن هو الجزء الذي يأتي بعد "Bearer "
  const idToken = authHeader.split('Bearer ')[1];

  try {
    // 3. التحقق من صحة التوكن باستخدام Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // 4. إذا كان التحقق ناجحاً: أرسل معلومات المستخدم التي تحتاجها إلى الواجهة الأمامية
    // لا ترسل معلومات حساسة هنا
    res.status(200).json({ 
        isAuthenticated: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name
        // يمكنك إضافة أي معلومات أخرى تم التحقق منها
    });
  } catch (error) {
    // 5. إذا كان التوكن غير صالح، منتهية صلاحيته، أو حدث خطأ
    console.error("Token verification failed:", error);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};
