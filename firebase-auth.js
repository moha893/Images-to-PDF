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

// --- إعدادات Firebase (مؤقتة ومباشرة للتجربة فقط) ---
const firebaseConfig = {
    apiKey: "AIzaSyCEPxngpX_mvDihM36sunp5vx91assVfaM",
    authDomain: "image-pro-211be.firebaseapp.com",
    databaseURL: "https://image-pro-211be-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "image-pro-211be",
    // === السطر الذي تم تصحيحه ===
    storageBucket: "image-pro-211be.appspot.com", 
    // ============================
    messagingSenderId: "413133647533",
    appId: "1:413133647533:web:c146f3e43066d53f3c2024",
    measurementId: "G-YY819DHZ1W"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ----------------------------------------------------
// ---- الكود الخاص بصفحة تسجيل الدخول (login.html) ----
// ----------------------------------------------------
if (document.getElementById('google-signin-btn')) {
    const signInBtn = document.getElementById('google-signin-btn');
    const termsCheck = document.getElementById('terms-checkbox');
    const messageEl = document.getElementById('message');

    let isHCaptchaVerified = false;

    function updateButtonState() {
        if (termsCheck.checked && isHCaptchaVerified) {
            signInBtn.disabled = false;
            messageEl.textContent = "";
        } else {
            signInBtn.disabled = true;
        }
    }

    window.onHCaptchaSuccess = function() {
        isHCaptchaVerified = true;
        updateButtonState();
    };

    window.onHCaptchaExpired = function() {
        isHCaptchaVerified = false;
        updateButtonState();
        messageEl.textContent = "انتهت صلاحية التحقق، يرجى المحاولة مرة أخرى.";
    };
    
    window.onHCaptchaError = function() {
        isHCaptchaVerified = false;
        updateButtonState();
        messageEl.textContent = "حدث خطأ في التحقق، يرجى تحديث الصفحة.";
    };

    termsCheck.addEventListener('change', updateButtonState);

    signInBtn.addEventListener('click', async () => {
        messageEl.textContent = 'جاري تسجيل الدخول...';

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    displayName: user.displayName, email: user.email,
                    photoURL: user.photoURL, plan: "free", crystals: 20,
                    createdAt: new Date()
                });
            }
            
            window.location.href = 'upload.html';

        } catch (error) {
            console.error("Authentication Error:", error);
            messageEl.textContent = `حدث خطأ: ${error.code}`;
            if (window.hcaptcha) { window.hcaptcha.reset(); }
        }
    });
}

// ----------------------------------------------------
// ---- الكود الخاص بصفحة الرفع (upload.html) ----
// ----------------------------------------------------
if (document.getElementById('user-auth-section')) {
    const userAuthSection = document.getElementById('user-auth-section');
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                userAuthSection.innerHTML = `
                    <div class="user-profile">
                        <img src="${userData.photoURL}" alt="Profile Picture" class="profile-pic" referrerpolicy="no-referrer">
                        <span class="user-name">${userData.displayName}</span>
                        <div class="crystal-balance">
                            <img src="https://i.ibb.co/FjbHMVk/5a35b404eb18.png" alt="Crystal">
                            <span class="crystal-count">${userData.crystals}</span>
                        </div>
                        <a href="pro.html" class="upgrade-btn">الترقية إلى Pro</a>
                        <button id="logout-btn" class="logout-btn">تسجيل الخروج</button>
                    </div>`;
                document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));
            } else {
                userAuthSection.innerHTML = `<a href="login.html" class="login-btn">خطأ في البيانات، سجل الدخول مجدداً</a>`;
            }
        } else {
            userAuthSection.innerHTML = `<a href="login.html" class="login-btn">تسجيل الدخول عبر جوجل</a>`;
        }
    });
}