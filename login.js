// api/login.js
// Vercel Serverless Function لضمان الأمان الكامل

// استيراد المكتبات الضرورية
import fetch from 'node-fetch'; 
import * as admin from 'firebase-admin'; 

// ==========================================================
// 1. تهيئة Firebase Admin SDK (يتم مرة واحدة فقط)
// ==========================================================
if (!admin.apps.length) {
    // قراءة المفتاح السري لحساب الخدمة من متغيرات بيئة Vercel
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const databaseURL = process.env.FIREBASE_DATABASE_URL; // استخدم المفتاح الذي وضعته في Vercel

    try {
        if (!serviceAccountString) {
            throw new Error("متغير البيئة FIREBASE_SERVICE_ACCOUNT_KEY غير موجود.");
        }
        
        // تحويل النص (String) المخزن في Vercel إلى كائن JSON
        const serviceAccount = JSON.parse(serviceAccountString);

        // تهيئة Firebase Admin SDK باستخدام بيانات حساب الخدمة (الأكثر أماناً)
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: databaseURL
        });
        
    } catch (error) {
        console.error("❌ فشل في تهيئة Firebase Admin SDK:", error.message);
        // عند حدوث خطأ في التهيئة، سيتم إيقاف المعالجة لاحقاً.
        // يمكننا هنا فقط طباعة الخطأ للسجل.
    }
}

// ==========================================================
// 2. دالة معالجة الطلبات (Export Default)
// (هذا يحل مشكلة "No exports found")
// ==========================================================
export default async function (req, res) {
    
    // التحقق من نوع الطلب
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'هذه النقطة لا تدعم إلا طلبات POST.' });
    }

    const { recaptchaToken } = req.body;
    const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY; // قراءة المفتاح السري من Vercel

    if (!recaptchaToken) {
        return res.status(400).json({ success: false, message: 'يجب توفير توكن reCAPTCHA.' });
    }

    // 3. التحقق من reCAPTCHA باستخدام المفتاح السري (Backend Check)
    const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;

    try {
        const captchaResponse = await fetch(googleVerifyUrl, { method: 'POST' });
        const captchaResult = await captchaResponse.json();

        if (!captchaResult.success) {
            console.warn("فشل reCAPTCHA:", captchaResult['error-codes']);
            return res.status(401).json({ success: false, message: 'فشل التحقق من reCAPTCHA. حاول مجدداً.' });
        }

        // 4. منطق مصادقة Firebase (بعد نجاح التحقق الأمني)
        // ملاحظة: المصادقة الفعلية لـ Google Sign-In تتم على الواجهة الأمامية عادةً.
        // بما أننا هنا على الخادم، نفترض أن هذه الدالة تقوم بإرجاع بيانات مستخدم وهمية 
        // أو توكن جلسة بعد التحقق الأمني.
        
        // **للتطبيق الحقيقي:** هنا يجب أن يتم استخدام Firebase Admin SDK للتحقق من مصادقة المستخدم
        // وإرجاع توكن جلسة مخصص.
        
        // **لأغراض العرض والتجريب الآمن:** سنقوم بإرجاع بيانات مستخدم افتراضية
        // بعد التأكد من أن reCAPTCHA سليم، للسماح للواجهة الأمامية بحفظ بياناته الافتراضية.
        
        const dummyUser = {
            email: "test.user@example.com", 
            displayName: "Test User",
            photoURL: "https://via.placeholder.com/100" // يجب استبدالها بصورة حقيقية من Firebase لاحقاً
        };
        
        // إرسال البيانات إلى الواجهة الأمامية لحفظها في Local Storage
        return res.status(200).json({ 
            success: true, 
            message: 'تم التحقق الأمني بنجاح.', 
            user: dummyUser
        });

    } catch (error) {
        console.error("خطأ عام في دالة الخادم:", error);
        return res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم.' });
    }
}