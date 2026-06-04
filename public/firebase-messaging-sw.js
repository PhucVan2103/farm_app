importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

// Khởi tạo lại Firebase trong Service Worker (Sử dụng config giống hệt file firebase.js)
firebase.initializeApp({
  apiKey: "AIzaSyCAUs1-MFHiRFTSYb3HbWZrJna_jGMqFSs",
  authDomain: "farm-app-cb7e0.firebaseapp.com",
  projectId: "farm-app-cb7e0",
  storageBucket: "farm-app-cb7e0.firebasestorage.app",
  messagingSenderId: "314343662236",
  appId: "1:314343662236:web:1d0eb2811400a59c054359"
});

// [HACK FIX] NGĂN HIỂN THỊ 2 THÔNG BÁO TRÊN iOS
// iOS 16.4+ tự động hiển thị thông báo gốc. Ta cần chặn Firebase cố tình gọi thêm 1 lần nữa.
const isIos = /iPad|iPhone|iPod/i.test(navigator.userAgent || '');
if (isIos) {
  self.registration.showNotification = () => {
    console.log('Đã chặn Firebase tự hiển thị thông báo thứ 2 trên iOS');
    return Promise.resolve();
  };
}

const messaging = firebase.messaging();

// Xử lý khi nhận được thông báo lúc ứng dụng đang chạy ngầm hoặc đã đóng
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Nhận được tin báo ngầm: ', payload);
  // CHÚ Ý: KHÔNG gọi showNotification thủ công ở đây nữa!
  // Firebase SDK sẽ tự động hiển thị thông báo để tránh xung đột và lỗi trên iOS.
});