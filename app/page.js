"use client";

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth, db, getFirebaseMessaging } from "../lib/firebase";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [pushStatus, setPushStatus] = useState("확인중");
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState("");
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushStatus(Notification.permission);
      const savedToken = localStorage.getItem("fcm_token");
      if (savedToken) {
        setToken(savedToken);
      }
    } else {
      setPushStatus("unsupported");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "watchConditions"),
      (snapshot) => {
        if (!user) {
          setWatchConditions([]);
          setLoadingList(false);
          return;
        }

        const items = snapshot.docs
          .map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }))
          .filter((item) => item.uid === user.uid);

        items.sort((a, b) => {
          const aSec = a.createdAt?.seconds ?? 0;
          const bSec = b.createdAt?.seconds ?? 0;
          return bSec - aSec;
        });

        setWatchConditions(items);
        setLoadingList(false);
      },
      (error) => {
        console.error(error);
        setLoadingList(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleEnablePush = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setPushStatus(permission);
        alert("알림 허용을 눌러야 푸시를 받을 수 있어요.");
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
      alert("푸시 알림 설정 완료");
    } catch (error) {
      console.error(error);
      alert("알림 설정 중 오류가 발생했어요.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("로그아웃됐어요.");
    } catch (error) {
      console.error(error);
      alert("로그아웃 중 오류가 발생했어요.");
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

    if (!user) {
      alert("먼저 로그인하세요.");
      return;
    }

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
        uid: user.uid,
        email: user.email || "",
        name: form.name,
        regionKeyword: form.regionKeyword,
        minPrice: form.minPrice ? Number(form.minPrice) : null,
        maxPrice: form.maxPrice ? Number(form.maxPrice) : null,
        platforms: form.platforms,
        propertyTypes: form.propertyTypes,
        pushToken: token || null,
        createdAt: serverTimestamp(),
      });

      alert("저장됐어요.");

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
      alert("저장 중 오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!user) {
      alert("먼저 로그인하세요.");
      return;
    }

    const ok = window.confirm("이 관심조건을 삭제할까요?");
    if (!ok) return;

    try {
      setDeletingId(id);
      await deleteDoc(doc(db, "watchConditions", id));
      alert("삭제됐어요.");
    } catch (error) {
      console.error(error);
      alert("삭제 중 오류가 발생했어요.");
    } finally {
      setDeletingId("");
    }
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    return Number(value).toLocaleString("ko-KR") + "원";
  };

  const cardStyle = {
    background: "#ffffff",
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
    fontWeight: "700",
    marginTop: "14px",
  };

  const badgeStyle = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#eef2ff",
    color: "#4338ca",
    fontSize: "12px",
    fontWeight: "700",
    marginRight: "8px",
    marginBottom: "8px",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
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
            로그인한 사용자별로 관심조건을 따로 저장해요.
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

            {!user ? (
              <button
                onClick={() => {
                  window.location.href = "/login";
                }}
                style={{
                  border: "none",
                  background: "#111827",
                  color: "white",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                로그인 / 회원가입
              </button>
            ) : (
              <button
                onClick={handleLogout}
                style={{
                  border: "none",
                  background: "#111827",
                  color: "white",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                로그아웃
              </button>
            )}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>관심조건 등록</h2>

            {!user && (
              <div
                style={{
                  marginBottom: "14px",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#fff7ed",
                  color: "#9a3412",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                먼저 로그인해야 저장할 수 있어요.
              </div>
            )}

            <form onSubmit={handleSave}>
              <label style={labelStyle}>관심조건 이름</label>
              <input
                style={inputStyle}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="예: 서울 아파트"
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
              <h2 style={{ marginTop: 0 }}>로그인 상태</h2>

              <p style={{ margin: "8px 0", color: "#64748b" }}>현재 사용자</p>
              <p style={{ margin: 0, fontWeight: 700 }}>
                {user ? user.email : "로그인 안 됨"}
              </p>

              <p style={{ margin: "16px 0 8px", color: "#64748b" }}>푸시 알림</p>
              <p style={{ margin: 0, fontWeight: 700 }}>{pushStatus}</p>
            </div>

            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>현재 기기 푸시 토큰</h2>

              <div
                style={{
                  marginTop: "12px",
                  background: "#0f172a",
                  color: "#e2e8f0",
                  padding: "16px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  wordBreak: "break-all",
                }}
              >
                {token || "아직 토큰이 없습니다. 알림 허용하기를 눌러주세요."}
              </div>
            </div>
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>내 관심조건 목록</h2>

          {!user ? (
            <p>로그인하면 내 관심조건만 여기 보입니다.</p>
          ) : loadingList ? (
            <p>불러오는 중...</p>
          ) : watchConditions.length === 0 ? (
            <p>아직 저장된 관심조건이 없어요.</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {watchConditions.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "14px",
                    padding: "16px",
                    background: "#f8fafc",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 10px 0" }}>
                        {item.name || "이름 없음"}
                      </h3>

                      <div style={{ marginBottom: "8px" }}>
                        {(item.platforms || []).map((platform) => (
                          <span key={platform} style={badgeStyle}>
                            {platform}
                          </span>
                        ))}
                      </div>

                      <div style={{ marginBottom: "8px" }}>
                        {(item.propertyTypes || []).map((type) => (
                          <span
                            key={type}
                            style={{
                              ...badgeStyle,
                              background: "#ecfeff",
                              color: "#0f766e",
                            }}
                          >
                            {type}
                          </span>
                        ))}
                      </div>

                      <p style={{ margin: "6px 0" }}>
                        <strong>지역:</strong> {item.regionKeyword || "-"}
                      </p>

                      <p style={{ margin: "6px 0" }}>
                        <strong>최소 가격:</strong> {formatPrice(item.minPrice)}
                      </p>

                      <p style={{ margin: "6px 0" }}>
                        <strong>최대 가격:</strong> {formatPrice(item.maxPrice)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      style={{
                        border: "none",
                        background:
                          deletingId === item.id ? "#94a3b8" : "#dc2626",
                        color: "white",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {deletingId === item.id ? "삭제 중..." : "삭제"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
