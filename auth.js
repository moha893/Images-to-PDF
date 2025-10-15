// =================================================================
//  منطق تسجيل الدخول باستخدام Firebase (مع جلب الإعدادات بأمان)
// =================================================================

// دالة مساعدة للحصول على العناصر
const el = id => document.getElementById(id);

// تحديد العناصر
const loginBtn = el('loginWithGoogleBtn');
const termsCheckbox = el('termsCheckbox');
const authStatus = el('authStatus');

let firebaseInitialized = false;

/**
 * دالة لجلب إعدادات Firebase من الخادم وتهيئتها.
 */
async function initializeFirebase() {
  if (firebaseInitialized) return; // لا تقم بالتهيئة مرة أخرى

  try {
    // 1. اطلب الإعدادات من الدالة الآمنة على Vercel
    const response = await fetch('/api/firebase-config');
    const firebaseConfig = await response.json();

    // 2. تأكد من أن الإعدادات سليمة
    if (!firebaseConfig.apiKey) {
      throw new Error('Firebase configuration is missing.');
    }
    
    // 3. قم بتهيئة Firebase باستخدام الإعدادات التي تم جلبها
    firebase.initializeApp(firebaseConfig);
    firebaseInitialized = true;
    
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    authStatus.textContent = '❌ فشل في تحميل إعدادات التطبيق. يرجى المحاولة مرة أخرى.';
  }
}

/**
 * دالة التعامل مع ضغطة زر تسجيل الدخول
 */
async function handleGoogleLogin() {
  // التحقق من الموافقة على الشروط
  if (!termsCheckbox.checked) {
    authStatus.textContent = '⚠️ يجب الموافقة على شروط الخدمة والخصوصية أولاً.';
    return;
  }

  // قم بتهيئة Firebase أولاً
  await initializeFirebase();
  if (!firebaseInitialized) return; // توقف إذا فشلت التهيئة

  const auth = firebase.auth();
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  
  // تعطيل الزر وتغيير النص
  loginBtn.disabled = true;
  authStatus.textContent = '⏳ جاري فتح نافذة جوجل...';

  try {
    const result = await auth.signInWithPopup(googleProvider);
    const user = result.user;
    authStatus.textContent = `✅ تم تسجيل الدخول بنجاح! مرحباً ${user.displayName}.`;

    const userData = {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      plan: "free",
      crystals: 20
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));

    setTimeout(() => {
      window.location.href = 'upload.html';
    }, 1500);

  } catch (error) {
    authStatus.textContent = `❌ فشلت عملية تسجيل الدخول. (${error.message})`;
    console.error("Login Error:", error);
    loginBtn.disabled = false;
  }
}

// ربط الدالة بالزر
loginBtn.addEventListener('click', handleGoogleLogin);