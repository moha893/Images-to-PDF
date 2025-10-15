// ///////////////////////////////////////////////////////////////////////////
// ⚠️ ملاحظة مهمة جداً:
// لكي يعمل هذا الكود في بيئة Vercel، يجب عليك استخدام **Vite** أو أي أداة بناء
// تسمح لك باستبدال process.env.VITE_* بمتغيرات البيئة الفعلية.
// بما أنك تستخدم ملفات HTML/JS بسيطة، لا يمكن الوصول لمتغيرات Vercel
// إلا إذا تم إنشاؤها عبر Serverless Function.
// الكود التالي يستخدم القيم التي أعطيتني إياها مباشرةً، مع الإشارة
// إلى أن هذا يقلل الأمان. يجب أن تكون هذه القيم مخزنة في بيئة البناء.
// ///////////////////////////////////////////////////////////////////////////

// استيراد الدوال من Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// تهيئة Firebase (باستخدام القيم الثابتة كما في login.html)
// تهيئة Firebase (باستخدام متغيرات البيئة)
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// دالة لتحديث واجهة المستخدم (UI)
function updateUI(user, userData) {
    const preLoginBtn = document.getElementById('preLoginBtn');
    const userProfileSection = document.getElementById('userProfileSection');
    const upgradeBtn = document.getElementById('upgradeBtn');
    
    // العناصر الخاصة بالملف الشخصي في صفحة الـ upload.html
    const profilePic = document.getElementById('profilePic');
    const userName = document.getElementById('userName');
    const crystalCount = document.getElementById('crystalCount');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user) {
        // المستخدم مسجل دخوله
        if (preLoginBtn) preLoginBtn.classList.add('hidden');
        if (userProfileSection) userProfileSection.classList.remove('hidden');
        if (upgradeBtn) upgradeBtn.classList.remove('hidden');
        
        if (profilePic && userData) profilePic.src = userData.photoURL || user.photoURL;
        if (userName && userData) userName.textContent = userData.name || user.displayName;
        if (crystalCount && userData) crystalCount.textContent = userData.crystals;

        // منطق زر تسجيل الخروج
        if (logoutBtn) {
            logoutBtn.onclick = async () => {
                try {
                    await signOut(auth);
                    localStorage.removeItem('mega_user_uid');
                    window.location.reload(); // إعادة تحميل الصفحة لتحديث الواجهة
                } catch (error) {
                    console.error("Logout Error:", error);
                    alert("فشل تسجيل الخروج: " + error.message);
                }
            };
        }
        
    } else {
        // المستخدم غير مسجل دخوله
        if (preLoginBtn) preLoginBtn.classList.remove('hidden');
        if (userProfileSection) userProfileSection.classList.add('hidden');
        if (upgradeBtn) upgradeBtn.classList.add('hidden');

        // إذا كنا في صفحة login.html، لا نفعل شيئًا
        if (window.location.pathname.includes('login.html')) return;
        
        // إذا كنا في أي صفحة أخرى، يتم تحويلهم إلى الصفحة الرئيسية أو صفحة الـ login.html
        // (يمكنك إزالة هذا الجزء إذا أردت السماح للمستخدمين غير المسجلين بالبقاء في upload.html)
        // window.location.href = 'index.html'; 
    }
}

// مراقبة حالة المصادقة (Authentication State)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // عند تسجيل الدخول، اقرأ بيانات المستخدم من قاعدة البيانات
        const userRef = ref(db, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                updateUI(user, userData);
            } else {
                // حالة نادرة: تم تسجيل الدخول لكن لا يوجد بيانات في DB
                updateUI(user, {
                    name: user.displayName,
                    photoURL: user.photoURL,
                    crystals: 0,
                    plan: 'free'
                }); 
            }
        });
    } else {
        // المستخدم قام بتسجيل الخروج
        updateUI(null, null);
    }
});