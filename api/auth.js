// ==========================================================
// منطق الواجهة الأمامية (Frontend Logic) لصفحة login.html
// لا توجد مفاتيح API هنا، كل المصادقة تتم عبر الخادم الآمن Vercel
// ==========================================================

// دالة مساعدة للحصول على العناصر بواسطة الـ ID
const el = id => document.getElementById(id);

// حالة reCAPTCHA
let isRecaptchaVerified = false;
let recaptchaToken = null; 

// 1. دالة تُستدعى من مكتبة reCAPTCHA عند اكتمال التحقق بنجاح
window.recaptchaCallback = function(token) {
    isRecaptchaVerified = true;
    recaptchaToken = token;
    el('authStatus').textContent = "";
};

// 2. دالة التعامل مع ضغطة زر تسجيل الدخول
async function handleGoogleLogin() {
    const termsChecked = el('termsCheckbox').checked;
    
    // أ. التحقق من الشروط
    if (!termsChecked) {
        el('authStatus').textContent = '⚠️ يجب الموافقة على شروط الخدمة والخصوصية أولاً.';
        return;
    }

    // ب. التحقق من reCAPTCHA
    if (!isRecaptchaVerified || !recaptchaToken) {
        el('authStatus').textContent = '⚠️ الرجاء التحقق من اختبار reCAPTCHA.';
        return;
    }
    
    el('authStatus').textContent = '⏳ جاري تسجيل الدخول والتحقق الأمني عبر الخادم...';

    try {
        // 3. إرسال طلب إلى دالة الخادم الآمنة (يجب أن تنشئ هذا الملف على Vercel)
        const response = await fetch('/api/login.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recaptchaToken: recaptchaToken,
            })
        });

        const result = await response.json();

        // 4. معالجة استجابة الخادم
        if (response.ok && result.success && result.user) { 
            el('authStatus').textContent = `✅ تم تسجيل الدخول بنجاح! جاري التوجيه...`;
            
            // 🚀 حفظ بيانات المستخدم في Local Storage 🚀
            // نستخدم البيانات التي أرسلها الخادم ونضع قيمنا الافتراضية
            const userData = {
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
                plan: "free",         // الخطة الافتراضية
                crystals: 20          // العدد الافتراضي للكريستال
            };
            localStorage.setItem('currentUser', JSON.stringify(userData));

            // إعادة التوجيه
            setTimeout(() => {
                window.location.href = 'upload.html'; 
            }, 1500);

        } else {
            // المصادقة فاشلة
            el('authStatus').textContent = `❌ فشل في تسجيل الدخول: ${result.message || 'خطأ غير معروف.'}`;
            grecaptcha.reset(); 
        }

    } catch (error) {
        el('authStatus').textContent = '❌ خطأ في الاتصال بالشبكة. تأكد من إعداد الخادم.';
        console.error("Connection Error:", error);
    }
}

// 5. ربط الدالة بالزر
el('loginWithGoogleBtn').addEventListener('click', handleGoogleLogin);