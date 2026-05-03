importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCJq0VWDJyMJTueC0lO854Sqy1PGsGrCvc",
  authDomain: "auxtion-c2014.firebaseapp.com",
  projectId: "auxtion-c2014",
  storageBucket: "auxtion-c2014.firebasestorage.app",
  messagingSenderId: "746991555998",
  appId: "1:746991555998:web:b1068764df1f61f583328f"

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
