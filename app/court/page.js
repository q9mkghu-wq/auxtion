"use client";

import { useEffect, useState } from "react";

const USAGE_LIST = ["전체", "아파트", "다세대", "단독주택", "토지", "상가", "오피스텔", "공장", "임야", "근린주택", "다가구"];

export default function CourtPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [usage, setUsage] = useState("전체");
  const [appliedRegion, setAppliedRegion] = useState("");
  const [appliedUsage, setAppliedUsage] = useState("");
  const [data, setData] = useState({ totalCount: 0, count: 0, items: [] });

  const fetchData = async (nextPage = 1, nextRegion = "", nextUsage = "전체") => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(nextPage), size: "10" });
      if (nextRegion.trim()) params.set("region", nextRegion.trim());
      if (nextUsage && nextUsage !== "전체") params.set("usage", nextUsage);
      const res = await fetch("/api/court?" + params.toString(), { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "법원 데이터를 불러오지 못했어요.");
      setData({ totalCount: json.totalCount || 0, count: json.count || 0, items: Array.isArray(json.items) ? json.items : [] });
      setPage(json.page || nextPage);
      setAppliedRegion(json.region || "");
      setAppliedUsage(json.usage || "");
    } catch (err) {
      console.error(err);
      setError(err.message || "알 수 없는 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(1, "", "전체"); }, []);

  const handleSearch = () => fetchData(1, keyword, usage);

  const goToCourt = (item) => {
    const url = "https://www.courtauction.go.kr/pgj/pgjdetail/PGJ157M03.on?docid=" +
