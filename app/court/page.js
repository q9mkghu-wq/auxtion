"use client";

import { useEffect, useState } from "react";

export default function CourtPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [appliedRegion, setAppliedRegion] = useState("");
  const [data, setData] = useState({
    totalCount: 0,
    count: 0,
    items: [],
  });

  const fetchData = async (nextPage = 1, nextRegion = "") => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(nextPage),
        size: "10",
      });

      if (nextRegion.trim()) {
        params.set("region", nextRegion.trim());
      }

      const res = await fetch(`/api/court?${params.toString()}`, {
        cache: "no-store",
      });

      const json = await res.json();

      if (!json.ok) {
        throw new Error(json.error || "법원 데이터를 불러오지 못했어요.");
      }

      setData({
        totalCount: json.totalCount || 0,
        count: json.count || 0,
        items: Array.isArray(json.items) ? json.items : [],
      });

      setPage(json.page || nextPage);
      setAppliedRegion(json.region || "");
    } catch (err) {
      console.error(err);
      setError(err.message || "알 수 없는 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, "");
  }, []);

  const handleSearch = () => {
    fetchData(1, keyword);
  };

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  };

  const labelStyle = {
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "6px",
  };

  const valueStyle = {
    fontSize: "15px",
    color: "#111827",
    fontWeight: 700,
    wordBreak: "break-word",
  };

  const buttonStyle = {
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    fontWeight: 700,
    cursor: "pointer",
  };

  const inputStyle = {
    flex: 1,
    minWidth: "220px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
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
            background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
            color: "#ffffff",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "24px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 700 }}>
            법원경매 수집 테스트
          </h1>
          <p style={{ marginTop: "10px", fontSize: "15px", lineHeight: 1.6, opacity: 0.95 }}>
            지역 키워드로 매각예정물건을 바로 필터링할 수 있어요.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "18px" }}>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="예: 서울, 부산, 평창동"
              style={inputStyle}
            />
            <button onClick={handleSearch} style={{ ...buttonStyle, background: "#ffffff", color: "#0f172a" }}>
              지역 검색
            </button>
            <button onClick={() => { setKeyword(""); fetchData(1, ""); }} style={{ ...buttonStyle, background: "#111827", color: "#ffffff" }}>
              전체 보기
            </button>
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <div style={labelStyle}>적용 지역</div>
              <div style={valueStyle}>{appliedRegion || "전체"}</div>
            </div>
            <div>
              <div style={labelStyle}>현재 페이지</div>
              <div style={valueStyle}>{page}</div>
            </div>
            <div>
              <div style={labelStyle}>현재 표시 건수</div>
              <div style={valueStyle}>{data.count}건</div>
            </div>
          </div>
        </section>

        {loading ? (
          <div style={cardStyle}>불러오는 중...</div>
        ) : error ? (
          <div style={{ ...cardStyle, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>
            {error}
          </div>
        ) : data.items.length === 0 ? (
          <div style={cardStyle}>조건에 맞는 데이터가 없어요.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {data.items.map((item, index) => (
              <article key={`${item.docid}-${index}`} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div>
                    <div style={labelStyle}>사건번호</div>
                    <div style={valueStyle}>{item.사건번호 || "-"}</div>
                  </div>
                  <div style={{ background: "#eef2ff", color: "#4338ca", borderRadius: "999px", padding: "6px 10px", fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap" }}>
                    물건 {item.목적물번호 || item.물건번호 || "-"}
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <div style={labelStyle}>소재지</div>
                  <div style={{ ...valueStyle, lineHeight: 1.6 }}>{item.소재지 || "-"}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <div style={labelStyle}>감정가</div>
                    <div style={valueStyle}>{item.감정가 ? `${item.감정가}원` : "-"}</div>
                  </div>
                  <div>
                    <div style={labelStyle}>최저가</div>
                    <div style={valueStyle}>{item.최저가 ? `${item.최저가}원` : "-"}</div>
                  </div>
                  <div>
                    <div style={labelStyle}>유찰수</div>
                    <div style={valueStyle}>{item.유찰수 || "0"}회</div>
                  </div>
                  <div>
                    <div style={labelStyle}>매각기일</div>
                    <div style={valueStyle}>{item.매각기일 || "-"}</div>
                  </div>
                </div>

                <div style={{ marginBottom: "8px" }}>
                  <div style={labelStyle}>담당계</div>
                  <div style={valueStyle}>{item.담당계 || "-"}</div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <div style={labelStyle}>비고</div>
                  <div style={{ ...valueStyle, fontWeight: 500 }}>{item.비고 || "-"}</div>
                </div>

                
                href={`https://www.courtauction.go.kr/pgj/pgjdetail/PGJ157M03.on?docid=${item.docid}&cortOfcCd=${item.courtCode}&csNo=${item.caseNo}&mokmulSer=${item.목적물번호}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    padding: "10px",
                    background: "#1976D2",
                    color: "#fff",
                    borderRadius: "10px",
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: "14px",
                    textDecoration: "none",
                  }}
                >
                  🔗 법원경매 바로가기
                </a>
              </article>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
          <button
            onClick={() => { if (page > 1) fetchData(page - 1, appliedRegion); }}
            disabled={loading || page <= 1}
            style={{ ...buttonStyle, background: page <= 1 ? "#cbd5e1" : "#e5e7eb", color: "#111827", cursor: page <= 1 ? "not-allowed" : "pointer" }}
          >
            이전 페이지
          </button>
          <button
            onClick={() => fetchData(page + 1, appliedRegion)}
            disabled={loading}
            style={{ ...buttonStyle, background: "#4f46e5", color: "#ffffff" }}
          >
            다음 페이지
          </button>
        </div>
      </div>
    </main>
  );
}
