"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const USAGE_LIST = ["전체", "아파트", "다세대", "단독주택", "토지", "상가", "오피스텔", "공장", "임야", "근린주택", "다가구"];

export default function CourtPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [usage, setUsage] = useState("전체");
  const [appliedRegion, setAppliedRegion] = useState("");
  const [appliedUsage, setAppliedUsage] = useState("");
  const [data, setData] = useState({ totalCount: 0, count: 0, items: [] });

  const fetchData = async (nextPage, nextRegion, nextUsage) => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(nextPage), size: "10" });
      if (nextRegion && nextRegion.trim()) params.set("region", nextRegion.trim());
      if (nextUsage && nextUsage !== "전체") params.set("usage", nextUsage);
      const res = await fetch("/api/court?" + params.toString(), { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "법원 데이터를 불러오지 못했어요.");
      setData({ totalCount: json.totalCount || 0, count: json.count || 0, items: Array.isArray(json.items) ? json.items : [] });
      setPage(json.page || nextPage);
      setAppliedRegion(json.region || "");
      setAppliedUsage(json.usage || "");
    } catch (err) {
      setError(err.message || "알 수 없는 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(1, "", "전체"); }, []);

  const handleSearch = () => fetchData(1, keyword, usage);

  const goToAnalyze = (item) => {
    const g = Number(String(item.감정가).replace(/,/g, ""));
    const m = Number(String(item.최저가).replace(/,/g, ""));
    const ratio = g ? Math.round((m / g) * 100) : 0;
    const params = new URLSearchParams({
      사건번호: item.사건번호 || "",
      소재지: item.소재지 || "",
      감정가: item.감정가 || "",
      최저가: item.최저가 || "",
      비율: String(ratio),
      유찰수: item.유찰수 || "0",
      매각기일: item.매각기일 || "",
      용도: item.용도 || "",
      비고: item.비고 || "",
    });
    router.push("/analyze?" + params.toString());
  };

  const s = {
    card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 18, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" },
    label: { fontSize: 12, color: "#64748b", marginBottom: 4 },
    value: { fontSize: 15, color: "#111827", fontWeight: 700, wordBreak: "break-word" },
    btn: { border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 700, cursor: "pointer" },
    input: { flex: 1, minWidth: "180px", padding: "12px 14px", borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box" },
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <section style={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)", color: "#fff", borderRadius: 20, padding: 28, marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>법원경매 검색</h1>
          <p style={{ marginTop: 10, fontSize: 15, lineHeight: 1.6, opacity: 0.95 }}>지역과 용도로 필터링하고 AI로 물건을 분석하세요.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }} placeholder="지역 검색 (예: 서울, 경기)" style={s.input} />
            <select value={usage} onChange={(e) => setUsage(e.target.value)} style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 14, background: "#fff", cursor: "pointer" }}>
              {USAGE_LIST.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <button onClick={handleSearch} style={{ ...s.btn, background: "#fff", color: "#0f172a" }}>검색</button>
            <button onClick={() => { setKeyword(""); setUsage("전체"); fetchData(1, "", "전체"); }} style={{ ...s.btn, background: "#111827", color: "#fff" }}>전체 보기</button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            {USAGE_LIST.filter((u) => u !== "전체").map((u) => (
              <button key={u} onClick={() => { setUsage(u); fetchData(1, keyword, u); }} style={{ padding: "6px 14px", borderRadius: 999, border: "none", fontSize: 13, cursor: "pointer", fontWeight: 600, background: usage === u ? "#fff" : "rgba(255,255,255,0.2)", color: usage === u ? "#0f172a" : "#fff" }}>{u}</button>
            ))}
          </div>
        </section>

        <section style={{ ...s.card, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div><div style={s.label}>적용 지역</div><div style={s.value}>{appliedRegion || "전체"}</div></div>
            <div><div style={s.label}>적용 용도</div><div style={s.value}>{appliedUsage || "전체"}</div></div>
            <div><div style={s.label}>현재 페이지</div><div style={s.value}>{page}</div></div>
            <div><div style={s.label}>표시 건수</div><div style={s.value}>{data.count}건</div></div>
          </div>
        </section>

        {loading ? (
          <div style={s.card}>불러오는 중...</div>
        ) : error ? (
          <div style={{ ...s.card, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>{error}</div>
        ) : data.items.length === 0 ? (
          <div style={s.card}>조건에 맞는 데이터가 없어요.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            {data.items.map((item, index) => {
              const g = Number(String(item.감정가).replace(/,/g, ""));
              const m = Number(String(item.최저가).replace(/,/g, ""));
              const ratio = g ? Math.round((m / g) * 100) : 0;
              const isLow = ratio > 0 && ratio < 50;
              const highYuchal = Number(item.유찰수) >= 3;

              return (
                <article key={item.docid + "-" + index} style={s.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={s.label}>사건번호</div>
                      <div style={s.value}>{item.사건번호 || "-"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {item.용도 && <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{item.용도}</span>}
                      {isLow && <span style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>저가</span>}
                      {highYuchal && <span style={{ background: "#fce7f3", color: "#9d174d", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{item.유찰수}회 유찰</span>}
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div style={s.label}>소재지</div>
                    <div style={{ ...s.value, lineHeight: 1.5 }}>{item.소재지 || "-"}</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: 10 }}>
                      <div style={s.label}>감정가</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{item.감정가 ? item.감정가 + "원" : "-"}</div>
                    </div>
                    <div style={{ background: isLow ? "#fef3c7" : "#f8fafc", borderRadius: 8, padding: 10 }}>
                      <div style={s.label}>최저가</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isLow ? "#92400e" : "#111" }}>{item.최저가 ? item.최저가 + "원" : "-"}</div>
                      {ratio > 0 && <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>감정가의 {ratio}%</div>}
                    </div>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: 10 }}>
                      <div style={s.label}>유찰수</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: highYuchal ? "#dc2626" : "#111" }}>{item.유찰수 || "0"}회</div>
                    </div>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: 10 }}>
                      <div style={s.label}>매각기일</div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{item.매각기일 || "-"}</div>
                    </div>
                  </div>

                  {item.비고 && (
                    <div style={{ background: "#fef2f2", borderRadius: 8, padding: 10, marginBottom: 10 }}>
                      <div style={s.label}>비고</div>
                      <div style={{ fontSize: 13, color: "#991b1b" }}>{item.비고}</div>
                    </div>
                  )}

                  <button
                    onClick={() => goToAnalyze(item)}
                    style={{ width: "100%", padding: 13, background: "linear-gradient(135deg, #1976D2, #1e3a8a)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer" }}
                  >
                    🤖 AI 분석하기
                  </button>
                </article>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <button onClick={() => { if (page > 1) fetchData(page - 1, appliedRegion, appliedUsage); }} disabled={loading || page <= 1} style={{ ...s.btn, background: page <= 1 ? "#cbd5e1" : "#e5e7eb", color: "#111827", cursor: page <= 1 ? "not-allowed" : "pointer" }}>이전 페이지</button>
          <button onClick={() => fetchData(page + 1, appliedRegion, appliedUsage)} disabled={loading} style={{ ...s.btn, background: "#4f46e5", color: "#fff" }}>다음 페이지</button>
        </div>
      </div>
    </main>
  );
}
