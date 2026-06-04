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

const messaging = firebase.messaging();

// Xử lý khi nhận được thông báo lúc ứng dụng đang chạy ngầm hoặc đã đóng
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Nhận được tin báo ngầm: ', payload);
  
  // [BẢN VÁ CHO iOS] Gửi tin nhắn tới tất cả các cửa sổ đang mở để hiển thị Toast
  // Vì trên iOS, Firebase đôi khi nhầm lẫn app đang mở thành đang chạy ngầm.
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'FOREGROUND_PUSH',
        payload: payload
      });
    });
  });
});