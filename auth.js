// =================================================================
//  منطق تسجيل الدخول الآمن (مع التحقق من جانب الخادم)
// =================================================================

// دالة مساعدة للحصول على العناصر
const el = id => document.getElementById(id);

// تحديد العناصر
const loginBtn = el('loginWithGoogleBtn');
const termsCheckbox = el('termsCheckbox');
const authStatus = el('authStatus');
const recaptchaContainer = el('recaptcha-container');

let firebaseInitialized = false;
let recaptchaWidgetId = null;
let recaptchaSiteKey = null;

/**
 * دالة لجلب الإعدادات من الخادم وتهيئة التطبيق.
 */
async function initializeApp() {
  if (firebaseInitialized) return true;

  try {
    const response = await fetch('/api/firebase-config');
    if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
    const config = await response.json();

    if (!config.firebaseConfig.apiKey || !config.recaptchaSiteKey) {
      throw new Error('Configuration from server is incomplete.');
    }
    
    firebase.initializeApp(config.firebaseConfig);
    recaptchaSiteKey = config.recaptchaSiteKey;
    firebaseInitialized = true;
    
    renderRecaptcha(); // اعرض reCAPTCHA بعد الحصول على المفتاح
    return true;
    
  } catch (error) {
    console.error('Failed to initialize App:', error);
    authStatus.textContent = '❌ فشل في تحميل إعدادات التطبيق. تأكد من متغيرات البيئة.';
    return false;
  }
}

/**
 * دالة لعرض أداة reCAPTCHA على الصفحة.
 */
function renderRecaptcha() {
    if (recaptchaWidgetId === null && typeof grecaptcha !== 'undefined' && recaptchaContainer && recaptchaSiteKey) {
        recaptchaWidgetId = grecaptcha.render(recaptchaContainer, {
            'sitekey': recaptchaSiteKey,
            'theme': 'dark'
        });
    }
}

// يتم استدعاؤها تلقائياً عند تحميل سكربت reCAPTCHA
function onRecaptchaLoad() {
    renderRecaptcha();
}

/**
 * دالة لإرسال توكن reCAPTCHA إلى الخادم للتحقق منه
 * @param {string} token - التوكن الذي تم الحصول عليه من reCAPTCHA
 * @returns {Promise<boolean>} - يعود بـ true إذا كان التحقق ناجحًا
 */
async function verifyRecaptchaOnServer(token) {
    try {
        const response = await fetch('/api/verify-recaptcha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });

        if (!response.ok) {
            authStatus.textContent = '❌ فشل التحقق من reCAPTCHA من جانب الخادم.';
            return false;
        }

        const data = await response.json();
        return data.success;

    } catch (error) {
        console.error("Error verifying token on server:", error);
        authStatus.textContent = '❌ حدث خطأ أثناء الاتصال بالخادم للتحقق.';
        return false;
    }
}


/**
 * دالة التعامل مع ضغطة زر تسجيل الدخول (النسخة الآمنة)
 */
async function handleGoogleLogin() {
  // 1. التحقق من الموافقة على الشروط
  if (!termsCheckbox.checked) {
    authStatus.textContent = '⚠️ يجب الموافقة على شروط الخدمة والخصوصية أولاً.';
    return;
  }
  
  // 2. الحصول على توكن reCAPTCHA
  const recaptchaToken = grecaptcha.getResponse(recaptchaWidgetId);
  if (!recaptchaToken) {
    authStatus.textContent = '⚠️ الرجاء التأكيد بأنك لست روبوت.';
    return;
  }

  // تعطيل الزر لمنع الضغطات المتكررة
  loginBtn.disabled = true;
  authStatus.textContent = '⏳ جاري التحقق من reCAPTCHA...';

  // 3. التحقق من التوكن من جانب الخادم (الخطوة الجديدة والآمنة)
  const isHuman = await verifyRecaptchaOnServer(recaptchaToken);
  if (!isHuman) {
      grecaptcha.reset(recaptchaWidgetId); // إعادة تعيين reCAPTCHA
      loginBtn.disabled = false; // إعادة تفعيل الزر
      // الرسالة تم عرضها بالفعل داخل دالة التحقق
      return; 
  }

  // 4. تهيئة Firebase (فقط إذا لم يتم تهيئته من قبل)
  const isInitialized = await initializeApp();
  if (!isInitialized) {
      authStatus.textContent = '❌ لا يمكن المتابعة، فشلت تهيئة التطبيق.';
      loginBtn.disabled = false;
      return;
  }

  // 5. متابعة عملية تسجيل الدخول بجوجل
  authStatus.textContent = '⏳ جاري فتح نافذة جوجل...';
  const auth = firebase.auth();
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  
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
    authStatus.textContent = `❌ فشلت عملية تسجيل الدخول. (Error: ${error.code})`;
    console.error("Login Error:", error);
    loginBtn.disabled = false;
    grecaptcha.reset(recaptchaWidgetId); // إعادة تعيين reCAPTCHA عند الخطأ
  }
}

// ربط الدالة بالزر
if (loginBtn) {
    loginBtn.addEventListener('click', handleGoogleLogin);
}

// تهيئة التطبيق عند تحميل الصفحة
initializeApp();