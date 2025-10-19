// --- 1. إعداد عميل Nhost ---
// استبدل 'YOUR_PROJECT_REGION' بالمنطقة الخاصة بمشروعك
const nhost = new NhostClient({
    subdomain: 'ymxknxxrmlqfjwyyejol', // هذا هو 'subdomain' من الرابط الخاص بك
    region: 'eu-central-1'    //  (مثال: 'eu-central-1')
});

// --- 2. جلب العناصر من الصفحة ---
const googleBtn = document.getElementById('google-signin-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfoDiv = document.getElementById('user-info');

// --- 3. إضافة الأوامر للأزرار ---

// عند الضغط على زر تسجيل دخول جوجل
googleBtn.addEventListener('click', () => {
    console.log('بدء تسجيل الدخول مع جوجل...');
    nhost.auth.signIn({
        provider: 'google'
        // سيقوم Nhost الآن بإعادة توجيه المستخدم إلى صفحة جوجل
    });
});

// عند الضغط على زر تسجيل الخروج
logoutBtn.addEventListener('click', () => {
    console.log('جاري تسجيل الخروج...');
    nhost.auth.signOut();
});

// --- 4. مراقبة حالة المصادقة (الأهم!) ---
// هذه الدالة تعمل عند تحميل الصفحة وعندما يتغير وضع المستخدم (تسجيل دخول/خروج)
nhost.auth.onAuthStateChanged((event, session) => {
    console.log('تغيرت حالة المصادقة:', event);

    if (event === 'SIGNED_IN') {
        // المستخدم قام بتسجيل الدخول بنجاح!
        
        // جلب بيانات المستخدم
        const user = nhost.auth.getUser();
        
        if (user) {
            console.log('بيانات المستخدم:', user);

            // عرض البيانات في الصفحة
            document.getElementById('user-name').textContent = user.displayName;
            document.getElementById('user-email').textContent = user.email;
            document.getElementById('user-avatar').src = user.avatarUrl;

            // إظهار قسم معلومات المستخدم وإخفاء زر تسجيل الدخول
            userInfoDiv.style.display = 'block';
            googleBtn.style.display = 'none';
            
            // !! هنا النقطة المهمة !!
            // في هذه اللحظة، Nhost قام *تلقائياً* بحفظ هذه البيانات
            // (user.displayName, user.email, user.avatarUrl)
            // في قاعدة بياناتك في جدول 'auth.users'.
            // لست بحاجة لفعل أي شيء إضافي!
        }
        
    } else {
        // المستخدم قام بتسجيل الخروج أو ليس مسجلاً دخوله
        
        // إخفاء قسم معلومات المستخدم وإظهار زر تسجيل الدخول
        userInfoDiv.style.display = 'none';
        googleBtn.style.display = 'block';
    }
});
