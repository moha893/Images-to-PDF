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
  if (firebaseInitialized) return true; // تمت التهيئة بنجاح من قبل

  try {
    // 1. اطلب الإعدادات من الدالة الآمنة على Vercel
    const response = await fetch('/api/firebase-config');
    if (!response.ok) {
        // إذا كان هناك خطأ في الخادم (مثل 500)، اعرضه
        throw new Error(`Server responded with status: ${response.status}`);
    }
    const firebaseConfig = await response.json();

    // 2. تأكد من أن الإعدادات سليمة (تحتوي على مفتاح)
    if (!firebaseConfig.apiKey) {
      throw new Error('Firebase configuration from server is incomplete.');
    }
    
    // 3. قم بتهيئة Firebase باستخدام الإعدادات التي تم جلبها
    firebase.initializeApp(firebaseConfig);
    firebaseInitialized = true;
    return true;
    
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    authStatus.textContent = '❌ فشل في تحميل إعدادات التطبيق. تأكد من متغيرات البيئة.';
    return false;
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

  // قم بتهيئة Firebase أولاً وانتظر النتيجة
  const isInitialized = await initializeFirebase();
  if (!isInitialized) {
      authStatus.textContent = '❌ لا يمكن المتابعة، فشلت تهيئة التطبيق.';
      return; // توقف إذا فشلت التهيئة
  }

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
      // قم بتوجيه المستخدم إلى صفحة الرفع
      window.location.href = 'upload.html';
    }, 1500);

  } catch (error) {
    authStatus.textContent = `❌ فشلت عملية تسجيل الدخول. (Error: ${error.code})`;
    console.error("Login Error:", error);
    loginBtn.disabled = false;
  }
}

// ربط الدالة بالزر
if (loginBtn) {
    loginBtn.addEventListener('click', handleGoogleLogin);
}
