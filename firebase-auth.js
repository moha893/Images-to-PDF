// استيراد الدوال الأساسية من مكتبات Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- إعدادات Firebase من متغيرات البيئة في Vercel ---
// هذه مجرد أسماء مؤقتة. في الخطوة الأخيرة، سنضع القيم الحقيقية في Vercel
// ويقوم هذا الكود بقراءتها بشكل آمن.
const firebaseConfig = {
    apiKey:             import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:         import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL:        import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId:          import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId:  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:              import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId:      import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// تهيئة Firebase وبدء تشغيل الخدمات
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ----------------------------------------------------
// ---- الكود الخاص بصفحة تسجيل الدخول (login.html) ----
// ----------------------------------------------------
// نتأكد أولاً أننا في صفحة تسجيل الدخول عن طريق التحقق من وجود زر الدخول
if (document.getElementById('google-signin-btn')) {
    const signInBtn = document.getElementById('google-signin-btn');
    const termsCheck = document.getElementById('terms-checkbox');
    const messageEl = document.getElementById('message');

    // تفعيل زر تسجيل الدخول فقط عند الموافقة على الشروط
    termsCheck.addEventListener('change', () => {
        signInBtn.disabled = !termsCheck.checked;
    });

    // ماذا يحدث عند الضغط على زر تسجيل الدخول
    signInBtn.addEventListener('click', async () => {
        // 1. نتأكد مرة أخرى من الموافقة على الشروط
        if (!termsCheck.checked) {
            messageEl.textContent = 'يجب الموافقة على شروط الخدمة أولاً.';
            return;
        }

        // 2. نتأكد أن المستخدم أكمل اختبار hCaptcha
        // ملاحظة: التحقق الكامل يتطلب جزءًا برمجيًا في الخادم (Serverless Function)
        // لكن هذا التحقق المبدئي كافٍ الآن.
        const hcaptchaResponse = document.querySelector('[name="h-captcha-response"]').value;
        if (!hcaptchaResponse) {
            messageEl.textContent = 'الرجاء إكمال اختبار التحقق (hCaptcha).';
            return;
        }

        messageEl.textContent = 'جاري تسجيل الدخول...';

        try {
            // 3. فتح نافذة جوجل لتسجيل الدخول
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // 4. البحث عن المستخدم في قاعدة البيانات Firestore
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            // 5. إذا لم يكن المستخدم موجودًا (أول مرة يسجل)، نقوم بإنشاء بياناته
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    plan: "free",         // الخطة الافتراضية
                    crystals: 20,         // الرصيد الافتراضي
                    createdAt: new Date() // تاريخ إنشاء الحساب
                });
            }
            
            // 6. بعد نجاح كل شيء، ننقل المستخدم إلى صفحة الرفع
            window.location.href = 'upload.html';

        } catch (error) {
            // في حال حدوث أي خطأ، نعرضه للمستخدم
            console.error("Authentication Error:", error);
            messageEl.textContent = `حدث خطأ: ${error.message}`;
            // إعادة hCaptcha في حال الخطأ
            if (window.hcaptcha) {
                window.hcaptcha.reset();
            }
        }
    });
}


// ----------------------------------------------------
// ---- الكود الخاص بصفحة الرفع (upload.html) ----
// ----------------------------------------------------
// سيتم إضافة الكود الخاص بعرض معلومات المستخدم هنا في الخطوات القادمة
if (document.getElementById('user-auth-section')) {
    const userAuthSection = document.getElementById('user-auth-section');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // المستخدم مسجل دخوله
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                
                // عرض صورة المستخدم واسمه ورصيده وزر الترقية
                userAuthSection.innerHTML = `
                    <div class="user-profile">
                        <img src="${userData.photoURL}" alt="Profile Picture" class="profile-pic">
                        <span class="user-name">${userData.displayName}</span>
                        <div class="crystal-balance">
                            <img src="https://i.ibb.co/FjbHMVk/5a35b404eb18.png" alt="Crystal">
                            <span class="crystal-count">${userData.crystals}</span>
                        </div>
                        <a href="pro.html" class="upgrade-btn">الترقية إلى Pro</a>
                        <button id="logout-btn" class="logout-btn">تسجيل الخروج</button>
                    </div>
                `;
                
                // إضافة وظيفة لزر تسجيل الخروج الجديد
                document.getElementById('logout-btn').addEventListener('click', () => {
                    signOut(auth).then(() => {
                        // تم تسجيل الخروج بنجاح
                        console.log('User signed out.');
                    }).catch((error) => {
                        console.error('Sign out error', error);
                    });
                });

            } else {
                // هذا الاحتمال نادر، لكن نعالجه كخطأ
                userAuthSection.innerHTML = `<a href="login.html" class="login-btn">خطأ في البيانات، سجل الدخول مجدداً</a>`;
            }

        } else {
            // المستخدم غير مسجل دخوله، نعرض زر تسجيل الدخول
            userAuthSection.innerHTML = `<a href="login.html" class="login-btn">تسجيل الدخول عبر جوجل</a>`;
        }
    });
}