// ==========================================================
// منطق الواجهة الأمامية (Frontend Logic)
// لا توجد مفاتيح Firebase API أو مفاتيح reCAPTCHA السرية هنا!
// ==========================================================

const el = id => document.getElementById(id);

let isRecaptchaVerified = false;
let recaptchaToken = null;

// دالة تُستدعى من مكتبة reCAPTCHA عند اكتمال التحقق
window.recaptchaCallback = function(token) {
    isRecaptchaVerified = true;
    recaptchaToken = token;
    el('authStatus').textContent = "";
};

async function handleGoogleLogin() {
    const termsChecked = el('termsCheckbox').checked;
    
    // 1. التحقق من الشروط
    if (!termsChecked) {
        el('authStatus').textContent = '⚠️ يجب الموافقة على شروط الخدمة والخصوصية أولاً.';
        return;
    }

    // 2. التحقق من reCAPTCHA
    if (!isRecaptchaVerified || !recaptchaToken) {
        el('authStatus').textContent = '⚠️ الرجاء التحقق من اختبار reCAPTCHA.';
        return;
    }
    
    el('authStatus').textContent = '⏳ جاري تسجيل الدخول والتحقق الأمني عبر الخادم...';

    try {
        // 3. إرسال طلب إلى دالة الخادم الآمنة (Vercel Serverless Function)
        const response = await fetch('/api/login.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recaptchaToken: recaptchaToken,
                // يمكنك إرسال بيانات إضافية للتحقق
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // المصادقة ناجحة (الخادم قام بإنشاء الجلسة/التوكن)
            // إذا كنت تستخدم توكن جلسة، يمكنك تخزينه هنا (مثلاً في localStorage)
            
            el('authStatus').textContent = `✅ تم تسجيل الدخول بنجاح! جاري التوجيه...`;
            
            setTimeout(() => {
                window.location.href = 'upload.html'; 
            }, 1500);

        } else {
            // المصادقة فاشلة (سواء فشل reCAPTCHA أو Firebase)
            el('authStatus').textContent = `❌ فشل في تسجيل الدخول: ${result.message || 'خطأ غير معروف.'}`;
            // إعادة تعيين reCAPTCHA لتمكين المستخدم من المحاولة مرة أخرى
            grecaptcha.reset(); 
        }

    } catch (error) {
        el('authStatus').textContent = '❌ خطأ في الاتصال بالخادم. تحقق من اتصالك أو إعدادات Vercel.';
        console.error("Connection Error:", error);
    }
}

// ربط الزر بالدالة
el('loginWithGoogleBtn').addEventListener('click', handleGoogleLogin);