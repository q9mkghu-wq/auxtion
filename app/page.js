"use client";

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, getFirebaseMessaging } from "../lib/firebase";

export default function HomePage() {
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
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushStatus(Notification.permission);
      const savedToken = localStorage.getItem("fcm_token");
      if (savedToken) setToken(savedToken);
    } else {
      setPushStatus("unsupported");
    }
  }, []);

  useEffect(() => {
    const q = query(collection(db, "watchConditions"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));
        setWatchConditions(items);
        setLoadingList(false);
      },
      (error) => {
        console.error(error);
        setLoadingList(false);
      }
    );

    return () => unsubscribe();
  }, []);

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
    if (value === null || value === undefined || value === "") return "-";
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
            관심조건을 저장하고, 저장된 목록을 바로 아래에서 확인할 수 있어요.
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
                background: "rgba(255,255,255,0.<span class="cursor">█</span>
