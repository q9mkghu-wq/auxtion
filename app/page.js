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
          .filter((item) => item.uid === user.uid)
          .sort((a, b) => {
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
      if (typeof window === "undefined" || !("Notification" in window)) {
        alert("이 브라우저는 푸시 알림을 지원하지 않아요.");
        return;
      }

      const permission = await Notification.requestPermission();
      setPushStatus(permission);

      if (permission !== "granted") {
        alert("알림 권한이 허용되지 않았어요.");
        return;
      }

      const messaging = await getFirebaseMessaging();

      if (!messaging) {
        alert("메시징을 사용할 수 없어요.");
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

      const currentToken = await getToken(messaging, {
        vapidKey,
      });

      if (!currentToken) {
        alert("푸시 토큰을 가져오지 못했어요.");
        return;
      }

      localStorage.setItem("fcm_token", currentToken);
      setToken(currentToken);
      alert("푸시 알림이 연결됐어요.");
    } catch (error) {
      console.error(error);
      alert("푸시 설정 중 오류가 발생했어요.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("로그아웃됐어요.");
      window.location.href = "/login";
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
      alert("로그인 후 저장할 수 있어요.");
      return;
    }

    if (!form.name.trim()) {
      alert("관심조건 이름을 입력하세요.");
      return;
    }

    if (form.platforms.length === 0) {
      alert("플랫폼을 하나 이상 선택하세요.");
      return;
    }

    if (form.propertyTypes.length === 0) {
      alert("물건 유형을 하나 이상 선택하세요.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "watchConditions"), {
        uid: user.uid,
        email: user.email || "",
        name: form.name.trim(),
        regionKeyword: form.regionKeyword.trim(),
        minPrice: form.minPrice.trim(),
        maxPrice: form.maxPrice.trim(),
        platforms: form.platforms,
        propertyTypes: form.propertyTypes,
        pushToken: token || "",
        createdAt: serverTimestamp(),
      });

      setForm({
        name: "",
        regionKeyword: "",
        minPrice: "",
        maxPrice: "",
        platforms: [],
        propertyTypes: [],
      });

      alert("관심조건이 저장됐어요.");
    } catch (error) {
      console.error(error);
      alert("저장 중 오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
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
    if (value === null || value === undefined || value === "") return "-";
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return `${num.toLocaleString("ko-KR")}원`;
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
    fontWeight: 700,
    marginTop: "14px",
    color: "#111827",
  };

  const checkboxWrapStyle = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "10px",
  };

  const checkboxButtonStyle = (active) => ({
    padding: "10px 14px",
    borderRadius: "999px",
    border: "1px solid",
    borderColor: active ? "#4f46e5" : "#d1d5db",
    background: active ? "#eef2ff" : "#ffffff",
    color: active ? "#4338ca" : "#111827",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
  });

  const badgeStyle = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#eef2ff",
    color: "#4338ca",
    fontSize: "12px",
    fontWeight: 700,
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
              <>
                <button
                  onClick={() => {
                    window.location.href = "/profile";
                  }}
                  style={{
                    border: "none",
                    background: "#0f766e",
                    color: "white",
                    padding: "12px 18px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  내 프로필
                </button>

                <button
                  onClick={() => {
                    window.location.href = "/court";
                  }}
                  style={{
                    border: "none",
                    background: "#2563eb",
                    color: "white",
                    padding: "12px 18px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  법원경매 보기
                </button>

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
              </>
            )}
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: "20px" }}>
          <h2
            style={{
              marginTop: 0,
              marginBottom: "10px",
              fontSize: "24px",
              color: "#111827",
            }}
          >
            현재 사용자
          </h2>

          <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.6 }}>
            {user ? user.email : "로그인하지 않았어요."}
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "20px",
          }}
        >
          <div style={cardStyle}>
            <h2
              style={{
                marginTop: 0,
                marginBottom: "10px",
                fontSize: "24px",
                color: "#111827",
              }}
            >
              관심조건 등록
            </h2>

            <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.6 }}>
              원하는 조건을 저장하면 나중에 자동 알림으로 연결할 수 있어요.
            </p>

            <form onSubmit={handleSave}>
              <label style={labelStyle}>관심조건 이름</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="예: 서울 아파트"
                style={inputStyle}
              />

              <label style={labelStyle}>지역 키워드</label>
              <input
                name="regionKeyword"
                value={form.regionKeyword}
                onChange={handleChange}
                placeholder="예: 서울, 강남, 부산"
                style={inputStyle}
              />

              <label style={labelStyle}>최소 금액</label>
              <input
                name="minPrice"
                value={form.minPrice}
                onChange={handleChange}
                placeholder="예: 100000000"
                style={inputStyle}
              />

              <label style={labelStyle}>최대 금액</label>
              <input
                name="maxPrice"
                value={form.maxPrice}
                onChange={handleChange}
                placeholder="예: 500000000"
                style={inputStyle}
              />

              <label style={labelStyle}>플랫폼</label>
              <div style={checkboxWrapStyle}>
                {["법원경매", "온비드 공매"].map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => toggleCheckbox("platforms", platform)}
                    style={checkboxButtonStyle(
                      form.platforms.includes(platform)
                    )}
                  >
                    {platform}
                  </button>
                ))}
              </div>

              <label style={labelStyle}>물건 유형</label>
              <div style={checkboxWrapStyle}>
                {["아파트·주택", "상가·오피스", "토지", "기타"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleCheckbox("propertyTypes", type)}
                    style={checkboxButtonStyle(
                      form.propertyTypes.includes(type)
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%",
                  marginTop: "20px",
                  border: "none",
                  background: saving ? "#94a3b8" : "#4f46e5",
                  color: "white",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "15px",
                  cursor: "pointer",
                }}
              >
                {saving ? "저장 중..." : "관심조건 저장하기"}
              </button>
            </form>
          </div>

          <div style={cardStyle}>
            <h2
              style={{
                marginTop: 0,
                marginBottom: "10px",
                fontSize: "24px",
                color: "#111827",
              }}
            >
              저장된 관심조건
            </h2>

            <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.6 }}>
              로그인한 사용자 본인 조건만 보여요.
            </p>

            <div style={{ marginTop: "18px" }}>
              {loadingList ? (
                <div style={{ color: "#6b7280" }}>불러오는 중...</div>
              ) : watchConditions.length === 0 ? (
                <div style={{ color: "#6b7280" }}>
                  아직 저장된 관심조건이 없어요.
                </div>
              ) : (
                watchConditions.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "14px",
                      padding: "16px",
                      marginBottom: "14px",
                      background: "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "18px",
                            color: "#111827",
                          }}
                        >
                          {item.name || "-"}
                        </h3>

                        <p
                          style={{
                            marginTop: "8px",
                            marginBottom: 0,
                            color: "#6b7280",
                            fontSize: "14px",
                          }}
                        >
                          지역: {item.regionKeyword || "-"}
                        </p>

                        <p
                          style={{
                            marginTop: "6px",
                            marginBottom: 0,
                            color: "#6b7280",
                            fontSize: "14px",
                          }}
                        >
                          금액: {formatPrice(item.minPrice)} ~{" "}
                          {formatPrice(item.maxPrice)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        style={{
                          border: "none",
                          background:
                            deletingId === item.id ? "#cbd5e1" : "#ef4444",
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

                    <div style={{ marginTop: "14px" }}>
                      {(item.platforms || []).map((platform) => (
                        <span key={platform} style={badgeStyle}>
                          {platform}
                        </span>
                      ))}
                      {(item.propertyTypes || []).map((type) => (
                        <span key={type} style={badgeStyle}>
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
