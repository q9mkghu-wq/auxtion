"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("이메일을 입력하세요.");
      return;
    }

    if (!password.trim()) {
      alert("비밀번호를 입력하세요.");
      return;
    }

    if (password.length < 6) {
      alert("비밀번호는 6자 이상이어야 해요.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("회원가입이 완료됐어요.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("로그인됐어요.");
      }

      router.push("/");
    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        alert("이미 가입된 이메일이에요.");
      } else if (error.code === "auth/invalid-email") {
        alert("이메일 형식이 올바르지 않아요.");
      } else if (error.code === "auth/user-not-found") {
        alert("가입되지 않은 이메일이에요.");
      } else if (error.code === "auth/wrong-password") {
        alert("비밀번호가 틀렸어요.");
      } else if (error.code === "auth/invalid-credential") {
        alert("이메일 또는 비밀번호를 다시 확인하세요.");
      } else {
        alert("처리 중 오류가 발생했어요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
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
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: 700,
            color: "#111827",
          }}
        >
          {mode === "login" ? "로그인" : "회원가입"}
        </h1>

        <p
          style={{
            marginTop: "10px",
            color: "#6b7280",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          이메일과 비밀번호로 {mode === "login" ? "로그인" : "회원가입"}할 수 있어요.
        </p>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              background: mode === "login" ? "#4f46e5" : "#e5e7eb",
              color: mode === "login" ? "#ffffff" : "#111827",
            }}
          >
            로그인
          </button>

          <button
            type="button"
            onClick={() => setMode("signup")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              background: mode === "signup" ? "#4f46e5" : "#e5e7eb",
              color: mode === "signup" ? "#ffffff" : "#111827",
            }}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 700,
              marginBottom: "8px",
              color: "#111827",
            }}
          >
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              marginBottom: "16px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 700,
              marginBottom: "8px",
              color: "#111827",
            }}
          >
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6자 이상 입력"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              marginBottom: "20px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: loading ? "#94a3b8" : "#4f46e5",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loading
              ? "처리 중..."
              : mode === "login"
              ? "로그인하기"
              : "회원가입하기"}
          </button>
        </form>
      </div>
    </main>
  );
}
