/*
 * Supabase Auth Module (Email/Password ONLY)
 * File: auth.js
 * Purpose: Handles user Sign Up/Sign In and redirects to home.html on success.
 */

// ===============================================
// ⚠️ 1. الإعداد - تأكد من المفاتيح ⚠️
// ===============================================

// 1. عنوان URL الخاص بمشروعك (المفاتيح الخاصة بك)
const SUPABASE_URL = 'https://vayuuzbcgemrlgvmktzl.supabase.co'; 
// 2. المفتاح العام (Anon Key) الخاص بمشروعك (المفاتيح الخاصة بك)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheXV1emJjZ2Vtcmxndm1rdHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDA4MDQsImV4cCI6MjA3NjAxNjgwNH0.yQIuNEb8QRBOaSGW0cKB8cQvPpZMWG7T_0gnufjVa0g'; 

// تهيئة عميل Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const statusEl = document.getElementById('auth-status');

// ===============================================
// 2. وظيفة إنشاء حساب جديد (Sign Up)
// ===============================================

/**
 * @async
 * @function signUpWithEmail
 * @description يتعامل مع إنشاء حساب جديد.
 */
async function signUpWithEmail() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        statusEl.textContent = 'الرجاء إدخال البريد الإلكتروني وكلمة المرور لإنشاء الحساب.';
        return;
    }
    
    statusEl.textContent = 'جاري إنشاء الحساب...';

    // استخدام دالة signUp من Supabase
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        // يمكنك إضافة metadata هنا إذا احتجت
    });

    if (error) {
        console.error('Sign-up Error:', error.message);
        statusEl.textContent = `فشل إنشاء الحساب: ${error.message}`;
        return;
    }
    
    if (data.user) {
         statusEl.textContent = '✅ تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.';
         // في حالة وجود جلسة فورية، يمكنك التوجيه هنا أيضاً
    }
}


// ===============================================
// 3. وظيفة تسجيل الدخول (Sign In)
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
        statusEl.textContent = 'الرجاء إدخال البريد الإلكتروني وكلمة المرور لتسجيل الدخول.';
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
    }
    // في حالة النجاح، سيتم التعامل مع التوجيه في دالة onAuthStateChange
}


// ===============================================
// 4. تتبع حالة المصادقة (التوجيه إلى home.html)
// ===============================================

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
    const signUpButton = document.getElementById('sign-up-btn'); 

    // ربط زر تسجيل الدخول
    if (emailSignInButton) {
        emailSignInButton.addEventListener('click', signInWithEmail);
    }
    
    // ربط زر إنشاء حساب جديد
    if (signUpButton) {
        signUpButton.addEventListener('click', signUpWithEmail);
    }
}

// عند تحميل الصفحة بالكامل، قم بإعداد مستمعي الأحداث
document.addEventListener('DOMContentLoaded', () => {
    if (!statusEl) {
        console.warn('Authentication status element (auth-status) not found.');
    }
    setupEventListeners();
    supabase.auth.onAuthStateChange(handleAuthStateChange);
});

// وظيفة تسجيل الخروج (متاحة للاستخدام في home.html)
window.signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        window.location.href = '/login.html'; 
    } else {
        console.error('Error signing out:', error.message);
    }
};