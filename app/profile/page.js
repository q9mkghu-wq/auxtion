"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("로그아웃됐어요.");
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("로그아웃 중 오류가 발생했어요.");
    }
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          fontFamily: "Arial, sans-serif",
        }}
      >
        불러오는 중...
      </main>
    );
  }

  if (!user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          fontFamily: "Arial, sans-serif",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <h1 style={{ marginTop: 0, fontSize: "28px" }}>프로필</h1>
          <p style={{ color: "#6b7280", lineHeight: 1.6 }}>
            로그인한 사용자만 볼 수 있어요.
          </p>

          <button
            onClick={() => router.push("/login")}
            style={{
              marginTop: "16px",
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: "#4f46e5",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            로그인하러 가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            내 프로필
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#6b7280",
              lineHeight: 1.6,
            }}
          >
            현재 로그인한 사용자 정보입니다.
          </p>

          <div
            style={{
              marginTop: "24px",
              padding: "18px",
              borderRadius: "14px",
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
            }}
          >
            <p style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "14px" }}>
              이메일
            </p>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>
              {user.email || "-"}
            </p>
          </div>

          <div
            style={{
              marginTop: "16px",
              padding: "18px",
              borderRadius: "14px",
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
            }}
          >
            <p style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "14px" }}>
              사용자 UID
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: 700,
                color: "#111827",
                wordBreak: "break-all",
              }}
            >
              {user.uid}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "24px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "14px 18px",
                borderRadius: "12px",
                border: "none",
                background: "#4f46e5",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              메인으로 가기
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: "14px 18px",
                borderRadius: "12px",
                border: "none",
                background: "#111827",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
