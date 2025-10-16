/*
 * Supabase Google Auth Module
 * File: auth.js
 * Purpose: Handles user authentication using Supabase, specifically Google Sign-In.
 */

// ===============================================
// ⚠️ 1. الإعداد - يجب التعديل ⚠️
// ===============================================

// استبدل هذه القيم بـ URL ومفتاح 'anon' الخاص بمشروعك في Supabase
const SUPABASE_URL = 'https://vayuuzbcgemrlgvmktzl.supabase.co'; // مثال: 'https://xyzabcd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheXV1emJjZ2Vtcmxndm1rdHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDA4MDQsImV4cCI6MjA3NjAxNjgwNH0.yQIuNEb8QRBOaSGW0cKB8cQvPpZMWG7T_0gnufjVa0g'; // مثال: 'eyJhbGciOiJIUzI1Ni...'

// ===============================================
// 2. التهيئة والوظائف الأساسية
// ===============================================

// تهيئة عميل Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * @async
 * @function signInWithGoogle
 * @description يبدأ عملية تسجيل الدخول عبر Google OAuth.
 * يتم تخزين الجلسة تلقائيًا بواسطة Supabase.
 */
async function signInWithGoogle() {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // عنوان URL الذي سيتم إعادة توجيه المستخدم إليه بعد تسجيل الدخول
                // يجب أن يكون ضمن قائمة عناوين URL المسموح بها في إعدادات Supabase
                redirectTo: window.location.origin + '/upload.html', 
            },
        });

        if (error) {
            console.error('Error signing in with Google:', error.message);
            alert(`فشل تسجيل الدخول: ${error.message}`);
        }
    } catch (err) {
        console.error('An unexpected error occurred during sign-in:', err);
        alert('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    }
}

/**
 * @async
 * @function handleAuthStateChange
 * @description تتبع حالة مصادقة المستخدم.
 * @param {string} event - نوع الحدث (SIGNED_IN, SIGNED_OUT, الخ).
 * @param {object} session - بيانات جلسة المستخدم.
 */
async function handleAuthStateChange(event, session) {
    if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user);
        // إعادة توجيه المستخدم إلى صفحة الرفع (Upload) بعد تسجيل الدخول بنجاح
        window.location.href = '/upload.html'; 
    }
}

/**
 * @function setupEventListeners
 * @description يربط وظيفة تسجيل الدخول بزر HTML.
 */
function setupEventListeners() {
    const signInButton = document.getElementById('google-sign-in-btn');
    if (signInButton) {
        // عند النقر على الزر، قم بتشغيل وظيفة تسجيل الدخول
        signInButton.addEventListener('click', signInWithGoogle);
    }
}

// ===============================================
// 3. التنفيذ
// ===============================================

// عند تحميل الصفحة بالكامل، قم بإعداد مستمعي الأحداث
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();

    // إعداد مستمع لتغييرات حالة المصادقة لإعادة التوجيه
    supabase.auth.onAuthStateChange(handleAuthStateChange);
});

// يمكنك إضافة وظيفة تسجيل الخروج هنا لاستخدامها في upload.html لاحقًا
async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        // إعادة توجيه إلى صفحة تسجيل الدخول أو الرئيسية بعد تسجيل الخروج
        window.location.href = '/login.html'; 
    } else {
        console.error('Error signing out:', error.message);
        alert('فشل تسجيل الخروج. يرجى المحاولة مرة أخرى.');
    }
}

// تصدير الدالة لتكون متاحة لملفات JavaScript الأخرى (مثل upload.js)
// إذا كنت ستستخدمها في ملفات أخرى غير login.html
window.signOut = signOut;