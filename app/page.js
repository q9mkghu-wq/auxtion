"use client";

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "../lib/firebase";

export default function HomePage() {
  const [pushStatus, setPushStatus] = useState("확인중");
  const [token, setToken] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushStatus(Notification.permission);
      const savedToken = localStorage.getItem("fcm_token");
      if (savedToken) setToken(savedToken);
    } else {
      setPushStatus("unsupported");
    }
  }, []);

  const handleEnablePush = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setPushStatus(permission);
        alert("알림 허용을 눌러야 푸시 알림을 받을 수 있어요.");
        return;
      }

      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        setPushStatus("unsupported");
        alert("이 브라우저는 푸시 알림을 지원하지 않아요.");
        return;
      }

      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (!currentToken) {
        alert("토큰을 가져오지 못했어요.");
        return;
      }

      localStorage.setItem("fcm_token", currentToken);
      setToken(currentToken);
      setPushStatus("granted");
      alert("푸시 알림 설정이 완료됐어요.");
    } catch (error) {
      console.error(error);
      alert("알림 설정 중 오류가 발생했어요.");
    }
  };

  const cardStyle = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  };

  const badgeColor =
    pushStatus === "granted"
      ? "#16a34a"
      : pushStatus === "denied"
      ? "#dc2626"
      : "#f59e0b";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <section
          style={{
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            color: "white",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "24px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 700 }}>
            경매 알림 앱
          </h1>
          <p style={{ marginTop: "10px", opacity: 0.95, lineHeight: 1.6 }}>
            관심 조건에 맞는 법원경매·온비드 물건을 확인하고,
            요약·장점·단점·위험성을 빠르게 보는 메인 화면입니다.
          </p>

          <div
            style={{
              marginTop: "18px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span
              style={{
                background: "rgba(255,255,255,0.15)",
                padding: "10px 14px",
                borderRadius: "999px",
                fontSize: "14px",
              }}
            >
              푸시 상태:{" "}
              <strong style={{ color: "#fff" }}>{pushStatus}</strong>
            </span>

            <button
              onClick={handleEnablePush}
              style={{
                border: "none",
                background: "white",
                color: "#4f46e5",
                padding: "12px 18px",
                borderRadius: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              알림 허용하기
            </button>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={cardStyle}>
            <div style={{ fontSize: "14px", color: "#64748b" }}>관심 플랫폼</div>
            <div style={{ marginTop: "8px", fontSize: "20px", fontWeight: 700 }}>
              법원경매 / 온비드
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "14px", color: "#64748b" }}>관심 물건</div>
            <div style={{ marginTop: "8px", fontSize: "20px", fontWeight: 700 }}>
              아파트 · 상가 · 토지
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "14px", color: "#64748b" }}>알림 상태</div>
            <div
              style={{
                marginTop: "8px",
                fontSize: "20px",
                fontWeight: 700,
                color: badgeColor,
              }}
            >
              {pushStatus}
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0, fontSize: "20px" }}>빠른 메뉴</h2>
            <div style={{ display: "grid", gap: "10px" }}>
              <button
                onClick={() => alert("다음 단계에서 관심조건 등록 화면을 붙이면 됩니다.")}
                style={menuButtonStyle}
              >
                관심조건 등록
              </button>
              <button
                onClick={() => alert("다음 단계에서 수집 물건 목록 화면을 붙이면 됩니다.")}
                style={menuButtonStyle}
              >
                신규 물건 보기
              </button>
              <button
                onClick={() => alert("다음 단계에서 알림 목록 화면을 붙이면 됩니다.")}
                style={menuButtonStyle}
              >
                내 알림 확인
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ marginTop: 0, fontSize: "20px" }}>앱 설명</h2>
            <ul style={{ margin: 0, paddingLeft: "18px", lineHeight: 1.8 }}>
              <li>새 경매 물건 감지</li>
              <li>3줄 요약 제공</li>
              <li>장점 / 단점 / 위험성 정리</li>
              <li>입찰 절차 안내</li>
              <li>기본 대출 가능성 확인</li>
            </ul>
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0, fontSize: "20px" }}>현재 기기 푸시 토큰</h2>
          <p style={{ color: "#64748b", marginTop: "8px" }}>
            아래 값이 보이면 이 브라우저는 푸시 알림을 받을 수 있는 상태입니다.
          </p>
          <div
            style={{
              marginTop: "12px",
              background: "#0f172a",
              color: "#e2e8f0",
              padding: "16px",
              borderRadius: "12px",
              fontSize: "13px",
              wordBreak: "break-all",
            }}
          >
            {token || "아직 토큰이 없습니다. '알림 허용하기'를 눌러주세요."}
          </div>
        </section>
      </div>
    </main>
  );
}

const menuButtonStyle = {
  border: "none",
  background: "#eef2ff",
  color: "#3730a3",
  padding: "12px 14px",
  borderRadius: "10px",
  fontWeight: 700,
  cursor: "pointer",
  textAlign: "left",
};
