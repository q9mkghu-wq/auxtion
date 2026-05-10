"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const REGIONS = ["전국","서울","경기","인천","부산","대구","대전","광주","울산","강원","충북","충남","전북","전남","경북","경남","제주"];
const DEFAULT_ALERT = { name: "", region: "전국", types: ["court"], minPrice: "", maxPrice: "", minYuchal: "", active: true };

export default function AlertPage() {
  const [user, setUser] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [telegramChatId, setTelegramChatId] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULT_ALERT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/alert?userId=${user.uid}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setAlerts(data.alerts || []);
          setTelegramChatId(data.telegramChatId || "");
        }
      });
  }, [user]);

  async function saveAll(newAlerts, newChatId) {
    setSaving(true);
    await fetch("/api/alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.uid, alerts: newAlerts, telegramChatId: newChatId ?? telegramChatId }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addAlert() { setForm({ ...DEFAULT_ALERT }); setEditing("new"); }
  function editAlert(idx) { setForm({ ...alerts[idx] }); setEditing(idx); }
  function deleteAlert(idx) { const next = alerts.filter((_, i) => i !== idx); setAlerts(next); saveAll(next); }
  function toggleAlert(idx) { const next = alerts.map((a, i) => i === idx ? { ...a, active: !a.active } : a); setAlerts(next); saveAll(next); }
  function toggleType(type) { setForm((f) => ({ ...f, types: f.types.includes(type) ? f.types.filter((t) => t !== type) : [...f.types, type] })); }

  function saveForm() {
    const next = editing === "new" ? [...alerts, form] : alerts.map((a, i) => i === editing ? form : a);
    setAlerts(next);
    setEditing(null);
    saveAll(next);
  }

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#888" }}>로그인이 필요해요.</p>
    </div>
  );

  const labelStyle = { fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 };
  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginBottom: 16, boxSizing: "border-box", background: "#fff" };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>🔔 알림 설정</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>매일 오전 9시에 조건에 맞는 경매 물건을 텔레그램으로 보내드려요.</p>

      <div style={{ background: "#f8f8f8", borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 8 }}>📱 텔레그램 Chat ID</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={telegramChatId} onChange={(e) => setTelegramChatId(e.target.value)}
            placeholder="예: 7974741043"
            style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }} />
          <button onClick={() => saveAll(alerts, telegramChatId)}
            style={{ padding: "8px 16px", background: "#2196F3", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
            저장
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#aaa", marginTop: 6 }}>텔레그램에서 @userinfobot 에게 /start 보내면 ID를 알 수 있어요.</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        {alerts.map((alert, idx) => (
          <div key={idx} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 16, marginBottom: 12, opacity: alert.active ? 1 : 0.5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{alert.name || "이름 없음"}</span>
                <span style={{ marginLeft: 8, fontSize: 12, color: "#888" }}>
                  {alert.region} · {alert.types?.map(t => t === "court" ? "법원경매" : "공매").join("+")}
                  {alert.minYuchal ? ` · ${alert.minYuchal}회↑ 유찰` : ""}
                  {alert.maxPrice ? ` · ~${Number(alert.maxPrice).toLocaleString()}만원` : ""}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => toggleAlert(idx)} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #ddd", background: alert.active ? "#e8f5e9" : "#f5f5f5", fontSize: 12, cursor: "pointer" }}>
                  {alert.active ? "ON" : "OFF"}
                </button>
                <button onClick={() => editAlert(idx)} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", fontSize: 12, cursor: "pointer" }}>수정</button>
                <button onClick={() => deleteAlert(idx)} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #fdd", background: "#fff5f5", color: "#e53935", fontSize: 12, cursor: "pointer" }}>삭제</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing === null && (
        <button onClick={addAlert} style={{ width: "100%", padding: 14, background: "#1976D2", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
          + 알림 조건 추가
        </button>
      )}

      {editing !== null && (
        <div style={{ background: "#f0f4ff", borderRadius: 16, padding: 20, marginTop: 8 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{editing === "new" ? "새 알림 추가" : "알림 수정"}</h2>

          <label style={labelStyle}>알림 이름</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="예: 경기 아파트 알림" style={inputStyle} />

          <label style={labelStyle}>경매 유형</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[["court", "법원경매"], ["onbid", "공매(캠코)"]].map(([val, label]) => (
              <button key={val} onClick={() => toggleType(val)} style={{
                padding: "8px 16px", borderRadius: 8, border: "2px solid",
                borderColor: form.types.includes(val) ? "#1976D2" : "#ddd",
                background: form.types.includes(val) ? "#e3f2fd" : "#fff",
                color: form.types.includes(val) ? "#1976D2" : "#888",
                fontWeight: 600, fontSize: 14, cursor: "pointer"
              }}>{label}</button>
            ))}
          </div>

          <label style={labelStyle}>지역</label>
          <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} style={{ ...inputStyle, marginBottom: 16 }}>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <label style={labelStyle}>최저가 범위 (만원)</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={form.minPrice} onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
              placeholder="최소" style={{ ...inputStyle, marginBottom: 0 }} />
            <span style={{ alignSelf: "center", color: "#888" }}>~</span>
            <input value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
              placeholder="최대" style={{ ...inputStyle, marginBottom: 0 }} />
          </div>

          <label style={labelStyle}>최소 유찰 횟수</label>
          <input value={form.minYuchal} onChange={(e) => setForm({ ...form, minYuchal: e.target.value })}
            placeholder="예: 1 (1회 이상 유찰된 물건만)" style={inputStyle} type="number" min="0" />

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={saveForm} style={{ flex: 1, padding: 14, background: "#1976D2", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>저장</button>
            <button onClick={() => setEditing(null)} style={{ flex: 1, padding: 14, background: "#fff", color: "#888", border: "1px solid #ddd", borderRadius: 10, fontSize: 15, cursor: "pointer" }}>취소</button>
          </div>
        </div>
      )}

      {saving && <p style={{ textAlign: "center", color: "#888", marginTop: 16 }}>저장 중...</p>}
      {saved && <p style={{ textAlign: "center", color: "#43a047", marginTop: 16 }}>✅ 저장됐어요!</p>}
    </div>
  );
}
