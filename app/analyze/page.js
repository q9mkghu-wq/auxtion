"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [sent, setSent] = useState(false);

  const itemInfo = {
    사건번호: searchParams.get("사건번호") || "",
    소재지: searchParams.get("소재지") || "",
    감정가: searchParams.get("감정가") || "",
    최저가: searchParams.get("최저가") || "",
    비율: searchParams.get("비율") || "",
    유찰수: searchParams.get("유찰수") || "",
    매각기일: searchParams.get("매각기일") || "",
    용도: searchParams.get("용도") || "",
    비고: searchParams.get("비고") || "",
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        fetch(`/api/alert?userId=${u.uid}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.ok && data.telegramChatId) {
              setTelegramChatId(data.telegramChatId);
            }
          });
      }
    });
    return () => unsub();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPdfs((prev) => [...prev, ...files]);
  };

  const removeFile = (idx) => {
    setPdfs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAnalyze = async (sendTelegram = false) => {
    if (pdfs.length === 0) {
      alert("PDF 파일을 먼저 업로드해주세요.");
      return;
    }
    setAnalyzing(true);
    setAnalysis("");

    const formData = new FormData();
    formData.append("itemInfo", JSON.stringify(itemInfo));
    if (sendTelegram && telegramChatId) {
      formData.append("telegramChatId", telegramChatId);
    }
    for (const pdf of pdfs) {
      formData.append("pdfs", pdf);
    }

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (data.ok) {
        setAnalysis(data.analysis);
        if (sendTelegram) setSent(true);
      } else {
        alert("분석 실패: " + data.error);
      }
    } catch (err) {
      alert("오류: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const gamjungaNum = Number(itemInfo.감정가.replace(/,/g, ""));
  const choejeoaNum = Number(itemInfo.최저가.replace(/,/g, ""));
  const ratio = gamjungaNum ? Math.round((choejeoaNum / gamjungaNum) * 100) : 0;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px", fontFamily: "sans-serif" }}>
      <a href="/court" style={{ color: "#1976D2", fontSize: 14, textDecoration: "none" }}>← 목록으로</a>

      {/* 물건 기본 정보 */}
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)", borderRadius: 16, padding: 24, marginTop: 16, color: "#fff" }}>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>사건번호</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{itemInfo.사건번호}</div>
        <div style={{ fontSize: 16, marginBottom: 16, opacity: 0.9 }}>📍 {itemInfo.소재지}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>감정가</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{itemInfo.감정가}원</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>최저가</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fbbf24" }}>{itemInfo.최저가}원</div>
            <div style={{ fontSize: 12, color: "#fbbf24" }}>감정가의 {ratio}%</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>유찰수</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{itemInfo.유찰수}회</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>매각기일</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{itemInfo.매각기일}</div>
          </div>
        </div>
        {itemInfo.용도 && (
          <div style={{ marginTop: 12, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 12 }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>용도: </span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{itemInfo.용도}</span>
          </div>
        )}
        {itemInfo.비고 && (
          <div style={{ marginTop: 12, background: "rgba(255,100,100,0.2)", borderRadius: 10, padding: 12 }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>비고: </span>
            <span style={{ fontSize: 14 }}>{itemInfo.비고}</span>
          </div>
        )}
      </div>

      {/* PDF 업로드 */}
      <div style={{ background: "#f8f8f8", borderRadius: 16, padding: 20, marginTop: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>📄 문서 업로드</h2>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>매각물건명세서, 현황조사서, 감정평가서 PDF를 업로드하면 AI가 분석해드려요.</p>

        <label style={{
          display: "block", border: "2px dashed #ccc", borderRadius: 12,
          padding: "24px", textAlign: "center", cursor: "pointer", color: "#888"
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>PDF 파일 선택</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>여러 파일 동시 선택 가능</div>
          <input type="file" accept=".pdf" multiple onChange={handleFileChange} style={{ display: "none" }} />
        </label>

        {pdfs.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {pdfs.map((pdf, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderRadius: 8, padding: "10px 14px", marginBottom: 8, border: "1px solid #eee" }}>
                <span style={{ fontSize: 14 }}>📄 {pdf.name}</span>
                <button onClick={() => removeFile(idx)} style={{ background: "none", border: "none", color: "#e53935", cursor: "pointer", fontSize: 18 }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 텔레그램 Chat ID */}
      <div style={{ background: "#f0f4ff", borderRadius: 16, padding: 20, marginTop: 16 }}>
        <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 8 }}>📱 텔레그램 Chat ID (분석 결과 전송용)</label>
        <input
          value={telegramChatId}
          onChange={(e) => setTelegramChatId(e.target.value)}
          placeholder="예: 7974741043"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }}
        />
      </div>

      {/* 버튼 */}
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button
          onClick={() => handleAnalyze(false)}
          disabled={analyzing || pdfs.length === 0}
          style={{
            flex: 1, padding: 16, background: analyzing ? "#ccc" : "#1976D2",
            color: "#fff", border: "none", borderRadius: 12, fontSize: 16,
            fontWeight: 700, cursor: analyzing ? "not-allowed" : "pointer"
          }}
        >
          {analyzing ? "⏳ AI 분석 중..." : "🤖 AI 분석하기"}
        </button>
        <button
          onClick={() => handleAnalyze(true)}
          disabled={analyzing || pdfs.length === 0 || !telegramChatId}
          style={{
            flex: 1, padding: 16, background: analyzing || !telegramChatId ? "#ccc" : "#00897B",
            color: "#fff", border: "none", borderRadius: 12, fontSize: 16,
            fontWeight: 700, cursor: "pointer"
          }}
        >
          📨 분석 후 텔레그램 전송
        </button>
      </div>

      {sent && (
        <div style={{ background: "#e8f5e9", borderRadius: 12, padding: 14, marginTop: 16, color: "#2e7d32", fontWeight: 600, textAlign: "center" }}>
          ✅ 텔레그램으로 전송 완료!
        </div>
      )}

      {/* AI 분석 결과 */}
      {analysis && (
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: 24, marginTop: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🤖 AI 분석 결과</h2>
          <div style={{ fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-wrap", color: "#333" }}>
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>로딩 중...</div>}>
      <AnalyzeContent />
    </Suspense>
  );
}
