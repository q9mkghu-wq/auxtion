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
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYuchal, setMinYuchal] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [appliedRegion, setAppliedRegion] = useState("");
  const [appliedUsage, setAppliedUsage] = useState("");
  const [data, setData] = useState({ totalCount: 0, count: 0, items: [], matchedTotalCount: 0 });

  const fetchData = async (nextPage, nextRegion, nextUsage, nextMinPrice, nextMaxPrice, nextMinYuchal) => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(nextPage), size: "10" });
      if (nextRegion && nextRegion.trim()) params.set("region", nextRegion.trim());
      if (nextUsage && nextUsage !== "전체") params.set("usage", nextUsage);
      if (nextMinPrice) params.set("minPrice", nextMinPrice);
      if (nextMaxPrice) params.set("maxPrice", nextMaxPrice);
      if (nextMinYuchal) params.set("minYuchal", nextMinYuchal);

      const res = await fetch("/api/court?" + params.toString(), { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "법원 데이터를 불러오지 못했어요.");
      setData({
        totalCount: json.totalCount || 0,
        count: json.count || 0,
        items: Array.isArray(json.items) ? json.items : [],
        matchedTotalCount: json.matchedTotalCount || 0,
      });
      setPage(json.page || nextPage);
      setAppliedRegion(json.region || "");
      setAppliedUsage(json.usage || "");
    } catch (err) {
      setError(err.message || "알 수 없는 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(1, "", "전체", "", "", ""); }, []);

  const handleSearch = () => fetchData(1, keyword, usage, minPrice, maxPrice, minYuchal);

  const handleReset = () => {
    setKeyword(""); setUsage("전체");
    setMinPrice(""); setMaxPrice(""); setMinYuchal("");
    fetchData(1, "", "전체", "", "", "");
  };

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
    input: { padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box", width: "100%" },
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* 검색 헤더 */}
        <section style={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)", color: "#fff", borderRadius: 20, padding: 28, marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>법원경매 검색</h1>
          <p style={{ marginTop: 10, fontSize: 15, lineHeight: 1.6, opacity: 0.95 }}>지역, 용도, 가격으로 필터링하고 AI로 물건을 분석하세요.</p>

          {/* 기본 검색 */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            <select
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ flex: 1, minWidth: 180, padding: "12px 14px", borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 14, background: "#fff", cursor: "pointer" }}
            >
              <option value="">전국</option>
              <option value="서울">서울</option>
              <option value="경기">경기</option>
              <option value="인천">인천</option>
              <option value="부산">부산</option>
              <option value="대구">대구</option>
              <option value="대전">대전</option>
              <option value="광주">광주</option>
              <option value="울산">울산</option>
              <option value="세종">세종</option>
              <option value="강원">강원</option>
              <option value="충북">충북</option>
              <option value="충남">충남</option>
              <option value="전북">전북</option>
              <option value="전남">전남</option>
              <option value="경북">경북</option>
              <option value="경남">경남</option>
              <option value="제주">제주</option>
            </select>
            <select value={usage} onChange={(e) => setUsage(e.target.value)} style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 14, background: "#fff", cursor: "pointer" }}>
              {USAGE_LIST.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <button onClick={handleSearch} style={{ ...s.btn, background: "#fff", color: "#0f172a" }}>검색</button>
            <button onClick={handleReset} style={{ ...s.btn, background: "#111827", color: "#fff" }}>초기화</button>
          </div>

          {/* 상세 필터 토글 */}
          <button
            onClick={() => setShowFilter(!showFilter)}
            style={{ marginTop: 14, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            {showFilter ? "▲ 상세 필터 닫기" : "▼ 상세 필터 (가격, 유찰수)"}
          </button>

          {showFilter && (
            <div style={{ marginTop: 14, background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>최저가 최소</div>
                <select
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{ ...s.input, background: "rgba(255,255,255,0.9)", cursor: "pointer" }}
                >
                  <option value="">제한 없음</option>
                  <option value="1000">1,000만원↑</option>
                  <option value="3000">3,000만원↑</option>
                  <option value="5000">5,000만원↑</option>
                  <option value="10000">1억↑</option>
                  <option value="20000">2억↑</option>
                  <option value="30000">3억↑</option>
                  <option value="50000">5억↑</option>
                  <option value="100000">10억↑</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>최저가 최대</div>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{ ...s.input, background: "rgba(255,255,255,0.9)", cursor: "pointer" }}
                >
                  <option value="">제한 없음</option>
                  <option value="5000">5,000만원↓</option>
                  <option value="10000">1억↓</option>
                  <option value="20000">2억↓</option>
                  <option value="30000">3억↓</option>
                  <option value="50000">5억↓</option>
                  <option value="100000">10억↓</option>
                  <option value="200000">20억↓</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>최소 유찰횟수</div>
                <select
                  value={minYuchal}
                  onChange={(e) => setMinYuchal(e.target.value)}
                  style={{ ...s.input, background: "rgba(255,255,255,0.9)", cursor: "pointer" }}
                >
                  <option value="">제한 없음</option>
                  <option value="1">1회↑</option>
                  <option value="2">2회↑</option>
                  <option value="3">3회↑</option>
                  <option value="4">4회↑</option>
                  <option value="5">5회↑</option>
                  <option value="7">7회↑</option>
                  <option value="10">10회↑</option>
                </select>
              </div>
            </div>
          )}

        </section>

        {/* 검색 결과 요약 */}
        <section style={{ ...s.card, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <div><div style={s.label}>지역</div><div style={s.value}>{appliedRegion || "전체"}</div></div>
            <div><div style={s.label}>용도</div><div style={s.value}>{appliedUsage || "전체"}</div></div>
            {minPrice && <div><div style={s.label}>최저가 최소</div><div style={s.value}>{Number(minPrice).toLocaleString()}만원</div></div>}
            {maxPrice && <div><div style={s.label}>최저가 최대</div><div style={s.value}>{Number(maxPrice).toLocaleString()}만원</div></div>}
            {minYuchal && <div><div style={s.label}>최소 유찰</div><div style={s.value}>{minYuchal}회↑</div></div>}
            <div><div style={s.label}>표시</div><div style={s.value}>{data.count}건 / 총 {data.matchedTotalCount}건</div></div>
          </div>
        </section>

        {/* 물건 목록 */}
        {loading ? (
          <div style={s.card}>불러오는 중...</div>
        ) : error ? (
          <div style={{ ...s.card, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>{error}</div>
        ) : data.items.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, color: "#888" }}>조건에 맞는 물건이 없어요.</div>
            <button onClick={handleReset} style={{ marginTop: 16, ...s.btn, background: "#1976D2", color: "#fff" }}>필터 초기화</button>
          </div>
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
                      {highYuchal && <span style={{ background: "#fce7f3", color: "#9d174d", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{item.유찰수}회↓</span>}
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

                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button
                      onClick={() => goToAnalyze(item)}
                      style={{ flex: 1, padding: 13, background: "linear-gradient(135deg, #1976D2, #1e3a8a)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                    >
                      🤖 AI 분석
                    </button>
                    <button
                      onClick={() => window.open("https://www.courtauction.go.kr/pgj/index.on?w2xPath=/pgj/ui/pgj100/PGJ151F00.xml#", "_blank")}
                      style={{ flex: 1, padding: 13, background: "#fff", color: "#1976D2", border: "2px solid #1976D2", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                    >
                      🏛 법원경매
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <button onClick={() => { if (page > 1) fetchData(page - 1, appliedRegion, appliedUsage, minPrice, maxPrice, minYuchal); }} disabled={loading || page <= 1} style={{ ...s.btn, background: page <= 1 ? "#cbd5e1" : "#e5e7eb", color: "#111827", cursor: page <= 1 ? "not-allowed" : "pointer" }}>이전 페이지</button>
          <button onClick={() => fetchData(page + 1, appliedRegion, appliedUsage, minPrice, maxPrice, minYuchal)} disabled={loading} style={{ ...s.btn, background: "#4f46e5", color: "#fff" }}>다음 페이지</button>
        </div>

      </div>
    </main>
  );
}
