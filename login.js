// login.js

// استيراد خدمة المصادقة من ملف التهيئة
import { auth } from './firebase-config.js'; 
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";

// الحصول على عناصر الواجهة
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userStatusDiv = document.getElementById('user-status');

// 1. دالة تسجيل الدخول باستخدام Google
const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
    try {
        // فتح نافذة منبثقة لتسجيل الدخول
        const result = await signInWithPopup(auth, provider);
        // تم تسجيل الدخول بنجاح
        const user = result.user;
        console.log("تم تسجيل الدخول بنجاح!", user);
        // لا نحتاج للتعامل مع الواجهة هنا، لأن onAuthStateChanged ستقوم بذلك
    } catch (error) {
        // التعامل مع الأخطاء
        console.error("خطأ في تسجيل الدخول:", error.code, error.message);
        alert(`فشل تسجيل الدخول: ${error.message}`);
    }
};

// 2. دالة تسجيل الخروج
const signUserOut = async () => {
    try {
        await signOut(auth);
        console.log("تم تسجيل الخروج بنجاح.");
    } catch (error) {
        console.error("خطأ في تسجيل الخروج:", error);
    }
};

// 3. مراقبة حالة المصادقة (مهم جداً!)
// هذه الدالة تعمل بشكل مستمر، وتتغير بناءً على حالة المستخدم (مسجل دخول أم لا).
onAuthStateChanged(auth, (user) => {
    if (user) {
        // المستخدم مسجل دخول
        userStatusDiv.innerHTML = `مرحباً، ${user.displayName || 'مستخدم Firebase'}!`;
        loginBtn.style.display = 'none'; // إخفاء زر تسجيل الدخول
        logoutBtn.style.display = 'block'; // إظهار زر تسجيل الخروج
    } else {
        // المستخدم مسجل خروج
        userStatusDiv.innerHTML = 'الرجاء تسجيل الدخول...';
        loginBtn.style.display = 'block'; // إظهار زر تسجيل الدخول
        logoutBtn.style.display = 'none'; // إخفاء زر تسجيل الخروج
    }
});

// ربط الدوال بأزرار الواجهة
loginBtn.addEventListener('click', signInWithGoogle);
logoutBtn.addEventListener('click', signUserOut);
