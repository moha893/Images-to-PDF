/*
 * ملف auth.js - مسؤول عن جميع عمليات المصادقة عبر Supabase
 */

// ===============================================
// ⚠️ 1. الإعداد - يجب التعديل ⚠️
// ===============================================

// 1. استبدل 'YOUR_SUPABASE_PROJECT_URL' بعنوان URL الخاص بمشروعك
const SUPABASE_URL = 'https://vayuuzbcgemrlgvmktzl.supabase.co'; 
// 2. استبدل 'YOUR_SUPABASE_ANON_KEY' بالمفتاح العام (Anon Key) الخاص بمشروعك
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheXV1emJjZ2Vtcmxndm1rdHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDA4MDQsImV4cCI6MjA3NjAxNjgwNH0.yQIuNEb8QRBOaSGW0cKB8cQvPpZMWG7T_0gnufjVa0g'; 

// تهيئة عميل Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===============================================
// 2. وظيفة تسجيل الدخول عبر Google
// ===============================================

/**
 * @async
 * @function signInWithGoogle
 * @description تبدأ عملية تسجيل الدخول عبر Google OAuth.
 */
async function signInWithGoogle() {
    // عرض رسالة حالة للمستخدم
    document.getElementById('auth-status').textContent = 'جاري توجيهك لصفحة جوجل...';
    
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // عنوان URL الذي سيتم إعادة توجيه المستخدم إليه بعد تسجيل الدخول الناجح
                // يجب أن يتطابق هذا مع ما أضفته في الخطوة 1 (Redirect URLs)
                redirectTo: window.location.origin + '/upload.html', 
            },
        });

        if (error) {
            console.error('فشل تسجيل الدخول:', error.message);
            document.getElementById('auth-status').textContent = `فشل: ${error.message}`;
            alert(`فشل تسجيل الدخول. يرجى مراجعة إعدادات Supabase.`);
        }
        // إذا نجح الطلب، سيتم توجيه المستخدم تلقائيًا بواسطة Supabase
    } catch (err) {
        console.error('حدث خطأ غير متوقع:', err);
        document.getElementById('auth-status').textContent = 'حدث خطأ غير متوقع.';
    }
}

// ===============================================
// 3. ربط الدالة بالزر عند تحميل الصفحة
// ===============================================

/**
 * @function setupEventListeners
 * @description يربط وظيفة تسجيل الدخول بزر HTML.
 */
function setupEventListeners() {
    // البحث عن الزر باستخدام الـ ID 'google-sign-in-btn' من ملف login.html
    const signInButton = document.getElementById('google-sign-in-btn');
    if (signInButton) {
        // عند النقر على الزر، قم بتشغيل وظيفة تسجيل الدخول
        signInButton.addEventListener('click', signInWithGoogle);
    } else {
        console.error("لم يتم العثور على زر تسجيل الدخول ('google-sign-in-btn') في الصفحة.");
    }
}

// تشغيل وظيفة ربط الأحداث عند تحميل محتوى الصفحة بالكامل
document.addEventListener('DOMContentLoaded', setupEventListeners);


// ===============================================
// 4. (إضافي) تتبع حالة المصادقة بعد العودة
// ===============================================

// هذه الدالة مهمة لإعادة توجيه المستخدم عند عودته من صفحة Google
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        console.log('User signed in successfully. Redirecting...');
        // تأكد من أن هذا المسار هو صفحة المستخدم الخاصة بك
        window.location.href = '/upload.html'; 
    }
    if (event === 'SIGNED_OUT') {
        document.getElementById('auth-status').textContent = 'تم تسجيل الخروج بنجاح.';
    }
});