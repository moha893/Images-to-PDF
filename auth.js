/*
 * Supabase Auth Module (Email/Password & Google)
 * File: auth.js
 * Purpose: Handles user authentication and redirects to home.html on success.
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

const statusEl = document.getElementById('auth-status');

// ===============================================
// 2. وظيفة تسجيل الدخول عبر الإيميل/كلمة المرور
// ===============================================

/**
 * @async
 * @function signInWithEmail
 * @description يتعامل مع تسجيل الدخول عبر البريد الإلكتروني وكلمة المرور.
 */
async function signInWithEmail() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        statusEl.textContent = 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.';
        return;
    }
    
    statusEl.textContent = 'جاري تسجيل الدخول...';

    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        console.error('Email Sign-in Error:', error.message);
        statusEl.textContent = `فشل تسجيل الدخول: ${error.message}`;
        // ملاحظة: لإصدار نهائي، لا يجب أن تظهر رسالة الخطأ للمستخدم لأسباب أمنية.
    }
    // في حالة النجاح، سيتم التعامل مع التوجيه في دالة onAuthStateChange
}

// ===============================================
// 3. وظيفة تسجيل الدخول عبر Google (معدلة قليلاً)
// ===============================================

/**
 * @async
 * @function signInWithGoogle
 * @description يبدأ عملية تسجيل الدخول عبر Google OAuth.
 */
async function signInWithGoogle() {
    statusEl.textContent = 'جاري التوجيه لصفحة جوجل...';
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // عنوان URL الذي سيتم إعادة توجيه المستخدم إليه بعد تسجيل الدخول
                // قمنا بتغييره إلى home.html
                redirectTo: window.location.origin + '/home.html', 
            },
        });

        if (error) {
            console.error('Google Sign-in Error:', error.message);
            statusEl.textContent = `فشل تسجيل الدخول عبر جوجل: ${error.message}`;
        }
    } catch (err) {
        console.error('An unexpected error occurred during sign-in:', err);
        statusEl.textContent = 'حدث خطأ غير متوقع.';
    }
}

// ===============================================
// 4. تتبع حالة المصادقة (التوجيه إلى home.html)
// ===============================================

/**
 * @async
 * @function handleAuthStateChange
 * @description تتبع حالة مصادقة المستخدم وتوجه إلى home.html عند النجاح.
 */
async function handleAuthStateChange(event, session) {
    if (event === 'SIGNED_IN' && session) {
        console.log('User signed in. Redirecting to home.html');
        // ⚠️ التوجيه إلى home.html ⚠️
        window.location.href = '/home.html'; 
    }
}

// ===============================================
// 5. ربط الدوال بالأزرار
// ===============================================

function setupEventListeners() {
    const emailSignInButton = document.getElementById('email-sign-in-btn');
    const googleSignInButton = document.getElementById('google-sign-in-btn');

    // ربط زر الإيميل
    if (emailSignInButton) {
        emailSignInButton.addEventListener('click', signInWithEmail);
    }
    
    // ربط زر جوجل
    if (googleSignInButton) {
        googleSignInButton.addEventListener('click', signInWithGoogle);
    }
}

// عند تحميل الصفحة بالكامل، قم بإعداد مستمعي الأحداث
document.addEventListener('DOMContentLoaded', () => {
    // التأكد من وجود العنصر 'auth-status'
    if (!statusEl) {
        console.warn('Authentication status element (auth-status) not found.');
    }
    setupEventListeners();
    // إعداد مستمع لتغييرات حالة المصادقة لإعادة التوجيه
    supabase.auth.onAuthStateChange(handleAuthStateChange);
});

// يمكنك إضافة وظيفة تسجيل الخروج هنا لاستخدامها لاحقاً
window.signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        window.location.href = '/login.html'; 
    } else {
        console.error('Error signing out:', error.message);
    }
};