importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "여기에 Firebase apiKey",
  authDomain: "여기에 Firebase authDomain",
  projectId: "여기에 Firebase projectId",
  storageBucket: "여기에 Firebase storageBucket",
  messagingSenderId: "여기에 Firebase messagingSenderId",
  appId: "여기에 Firebase appId",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || "새 경매 알림";
  const options = {
    body: payload.notification?.body || "새로운 물건이 등록되었습니다.",
    icon: "/icon-192.png",
  };

  self.registration.showNotification(title, options);
});
