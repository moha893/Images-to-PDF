// ==========================================================
// منطق عرض بيانات المستخدم وتسجيل الخروج في صفحة upload.html
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. تحديد العناصر
    const preLoginBtn = document.getElementById('preLoginBtn');
    const userProfileSection = document.getElementById('userProfileSection');
    const profilePic = document.getElementById('profilePic');
    const userName = document.getElementById('userName');
    const crystalCount = document.getElementById('crystalCount');
    const logoutBtn = document.getElementById('logoutBtn');

    // 2. دالة التحقق من حالة تسجيل الدخول وعرض البيانات
    function checkLoginStatus() {
        // محاولة قراءة بيانات المستخدم من التخزين المحلي
        const currentUserData = localStorage.getItem('currentUser');

        if (currentUserData) {
            // إذا وُجدت بيانات
            const user = JSON.parse(currentUserData);
            
            // إخفاء زر تسجيل الدخول وإظهار الملف الشخصي
            if (preLoginBtn) preLoginBtn.classList.add('hidden');
            if (userProfileSection) userProfileSection.classList.remove('hidden');
            
            // تعبئة البيانات
            if (profilePic) profilePic.src = user.photoURL || 'https://via.placeholder.com/36'; 
            if (userName) userName.textContent = user.displayName || 'مستخدم';
            if (crystalCount) crystalCount.textContent = user.crystals;

        } else {
            // إذا لم يسجل الدخول
            if (preLoginBtn) preLoginBtn.classList.remove('hidden');
            if (userProfileSection) userProfileSection.classList.add('hidden');
        }
    }

    // 3. دالة لتسجيل الخروج
    function handleLogout() {
        // حذف بيانات المستخدم من Local Storage
        localStorage.removeItem('currentUser'); 
        
        // إعادة تحميل الصفحة
        window.location.reload(); 
    }

    // 4. تنفيذ الدالة عند تحميل الصفحة
    checkLoginStatus();

    // 5. ربط زر تسجيل الخروج بالدالة
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
});