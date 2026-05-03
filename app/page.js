"use client";

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
} from "firebase/firestore";
import { db, getFirebaseMessaging } from "../lib/firebase";

export default function HomePage() {
  const [pushStatus, setPushStatus] = useState("확인중");
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [watchConditions, setWatchConditions] = useState([]);

  const [form, setForm] = useState({
    name: "",
    regionKeyword: "",
    minPrice: "",
    maxPrice: "",
    platforms: [],
    propertyTypes: [],
  });

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushStatus(Notification.permission);
      const savedToken = localStorage.getItem("fcm_token");
      if (savedToken) setToken(savedToken);
    } else {
      setPushStatus("unsupported");
    }
  }, []);

  useEffect(() => {
    const q = query(collection(db, "watchConditions"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        items.sort((a, b) => {
          const aSec = a.createdAt?.seconds || 0;
          const bSec = b.createdAt?.seconds || 0;
          return bSec - aSec;
        });

        setWatchConditions(items);
        setLoadingList(false);
      },
      (error) => {
        console.error(error);
        setLoadingList(false);
        alert("관심조건 목록을 불러오는 중 오류가 발생했어요.");
      }
    );

    return () => unsubscribe();
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

  const toggleCheckbox = (field, value) => {
    setForm((prev) => {
      const exists = prev[field].includes(value);
      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((item) => item !== value)
          : [...prev[field], value],
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("관심조건 이름을 입력하세요.");
      return;
    }

    if (form.platforms.length === 0) {
      alert("플랫폼을 1개 이상 선택하세요.");
      return;
    }

    if (form.propertyTypes.length === 0) {
      alert("물건 유형을 1개 이상 선택하세요.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "watchConditions"), {
        name: form.name,
        regionKeyword: form.regionKeyword,
        minPrice: form.minPrice ? Number(form.minPrice) : null,
        maxPrice: form.maxPrice ? Number(form.maxPrice) : null,
        platforms: form.platforms,
        propertyTypes: form.propertyTypes,
        pushToken: token || null,
        createdAt: serverTimestamp(),
      });

      alert("관심조건이 저장됐어요.");

      setForm({
        name: "",
        regionKeyword: "",
        minPrice: "",
        maxPrice: "",
        platforms: [],
        propertyTypes: [],
      });
    } catch (error) {
      console.error(error);
      alert("저장 중 오류가 발생했어요. Firestore 규칙도 확인하세요.");
    } finally {
      setSaving(false);
    }
  };

  const cardStyle = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    marginTop: "8px",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: 700,
    marginTop: "14px",
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
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
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
            관심 조건을 등록하고, 조건에 맞는 경매 물건이 올라오면 푸시 알림을 받는 화면입니다.
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
              푸시 상태: <strong>{pushStatus}</strong>
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
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>관심조건 등록</h2>

            <form onSubmit={handleSave}>
              <label style={labelStyle}>관심조건 이름</label>
              <input
                style={inputStyle}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="예: 서울 아파트 알림"
              />

              <label style={labelStyle}>플랫폼</label>
              <div style={{ marginTop: "10px", display: "grid", gap: "8px" }}>
                {["법원경매", "온비드 공매"].map((item) => (
                  <label key={item} style={{ fontSize: "14px" }}>
                    <input
                      type="checkbox"
                      checked={form.platforms.includes(item)}
                      onChange={() => toggleCheckbox("platforms", item)}
                      style={{ marginRight: "8px" }}
                    />
                    {item}
                  </label>
                ))}
              </div>

              <label style={labelStyle}>물건 유형</label>
              <div style={{ marginTop: "10px", display: "grid", gap: "8px" }}>
                {["아파트·주택", "상가·오피스", "토지", "기타"].map((item) => (
                  <label key={item} style={{ fontSize: "14px" }}>
                    <input
                      type="checkbox"
                      checked={form.propertyTypes.includes(item)}
                      onChange={() => toggleCheckbox("propertyTypes", item)}
                      style={{ marginRight: "8px" }}
                    />
                    {item}
                  </label>
                ))}
              </div>

              <label style={labelStyle}>지역 키워드</label>
              <input
                style={inputStyle}
                name="regionKeyword"
                value={form.regionKeyword}
                onChange={handleChange}
                placeholder="예: 서울, 강남, 수원"
              />

              <label style={labelStyle}>최소 가격</label>
              <input
                style={inputStyle}
                type="number"
                name="minPrice"
                value={form.minPrice}
                onChange={handleChange}
                placeholder="예: 100000000"
              />

              <label style={labelStyle}>최대 가격</label>
              <input
                style={inputStyle}
                type="number"
                name="maxPrice"
                value={form.maxPrice}
                onChange={handleChange}
                placeholder="예: 500000000"
              />

              <button
                type="submit"
                disabled={saving}
                style={{
                  marginTop: "20px",
                  border: "none",
                  background: saving ? "#94a3b8" : "#4f46e5",
                  color: "white",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                {saving ? "저장 중..." : "관심조건 저장하기"}
              </button>
            </form>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}><span class="cursor">█</span>
