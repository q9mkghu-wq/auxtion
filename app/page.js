"use client";

import { useState } from "react";
import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "../lib/firebase";

export default function HomePage() {
  const [token, setToken] = useState("");

  const handleEnablePush = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        alert("알림 허용을 눌러야 해요.");
        return;
      }

      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        alert("이 브라우저는 푸시를 지원하지 않아요.");
        return;
      }

      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (!currentToken) {
        alert("토큰을 못 가져왔어요.");
        return;
      }

      setToken(currentToken);
      console.log("FCM TOKEN:", currentToken);
      alert("성공! 아래에 토큰이 보입니다.");
    } catch (e) {
      console.error(e);
      alert("오류가 났어요.");
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>푸시 알림 테스트</h1>
      <button onClick={handleEnablePush}>알림 허용하기</button>
      <p style={{ marginTop: 20, wordBreak: "break-all" }}>{token}</p>
    </main>
  );
}
