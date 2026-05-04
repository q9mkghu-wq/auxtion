export const dynamic = "force-dynamic";

const SEARCH_URL =
  "https://www.courtauction.go.kr/pgj/pgjsearch/searchControllerMain.on";

const REGION_CODE_MAP = {
  서울: "11",
  부산: "26",
  대구: "27",
  인천: "28",
  광주: "29",
  대전: "30",
  울산: "31",
  세종: "36",
  경기: "41",
  강원: "42",
  충북: "43",
  충청북도: "43",
  충남: "44",
  충청남도: "44",
  전북: "45",
  전라북도: "45",
  전남: "46",
  전라남도: "46",
  경북: "47",
  경상북도: "47",
  경남: "48",
  경상남도: "48",
  제주: "50",
  제주도: "50",
  제주특별자치도: "50",
};

function formatDate(value) {
  if (!value) return "";
  const s = String(value);
  if (s.length !== 8) return s;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

function formatPrice(value) {
  if (!value) return "";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("ko-KR");
}

function buildAddress(item) {
  return (
    item.printSt ||
    item.realSt ||
    [item.hjguSido, item.hjguSigu, item.hjguDong, item.hjguRd, item.daepyoLotno]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function mapItem(item) {
  return {
    사건번호: item.srnSaNo || "",
    물건번호: item.maemulSer || "",
    목적물번호: item.mokmulSer || "",
    소재지: buildAddress(item),
    감정가: formatPrice(item.gamevalAmt),
    최저가: formatPrice(item.minmaePrice),
    유찰수: item.yuchalCnt || "0",
    매각기일: formatDate(item.maeGiil),
    담당계: item.jpDeptNm || "",
    비고: item.mulBigo || "",
    용도코드: item.maemulUtilCd || "",
    docid: item.docid || "",
    courtCode: item.boCd || "",
    caseNo: item.saNo || "",
    itemNo: item.mokmulSer || "",
  };
}

function findRegionCode(region) {
  const keyword = (region || "").trim();
  if (!keyword) return "";

  for (const [name, code] of Object.entries(REGION_CODE_MAP)) {
    if (keyword.includes(name) || name.includes(keyword)) {
      return code;
    }
  }

  return "";
}

async function fetchCourt(currentPage, pageSize, regionCode = "") {
  const payload = {
    dma_srchGdsDtlSrchInfo: {
      statNum: "000000",
      cortAuctnMbrsId: "",
      pgmId: "PGJ157M02",
      lafjOrderBy: "",
      bidDvsCd: "000331",
      cortAuctnSrchCondCd: "0004602",
      cortStDvs: regionCode ? "2" : "1",
      cortOfcCd: "",
      jdbnCd: "",
      csNo: "",
      rprsAdongSdCd: regionCode || "",
      rprsAdongSggCd: "",
      rprsAdongEmdCd: "",
      rdnmSdCd: "",
      rdnmSggCd: "",
      rdnmNo: "",
      lclDspslGdsLstUsgCd: "",
      mclDspslGdsLstUsgCd: "",
      sclDspslGdsLstUsgCd: "",
      aeeEvlAmtMin: "",
      aeeEvlAmtMax: "",
      lwsDspslPrcMin: "",
      lwsDspslPrcMax: "",
      lwsDspslPrcRateMin: "",
      lwsDspslPrcRateMax: "",
      flbdNcntMin: "",
      flbdNcntMax: "",
      objctArDtsMin: "",
      objctArDtsMax: "",
      bidBgngYmd: "",
      bidEndYmd: "",
    },
    dma_pageInfo: {
      currentPage,
      pageSize,
      recordCountPerPage: pageSize,
      firstIndex: (currentPage - 1) * pageSize,
      lastIndex: currentPage * pageSize,
    },
  };

  const res = await fetch(SEARCH_URL, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json, text/plain, */*",
      "User-Agent": "Mozilla/5.0",
    },
    body: JSON.stringify(payload),
  });

  return res.json();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") || "1");
    const size = Number(searchParams.get("size") || "10");
    const region = (searchParams.get("region") || "").trim();

    const currentPage = Number.isNaN(page) || page < 1 ? 1 : page;
    const pageSize = Number.isNaN(size) || size < 1 ? 10 : size;
    const regionCode = findRegionCode(region);

    // 지역검색이 아니면 기존 방식
    if (!region) {
      const data = await fetchCourt(currentPage, pageSize, "");

      const items = Array.isArray(data?.data?.dlt_srchResult)
        ? data.data.dlt_srchResult
        : [];

      const mapped = items.map(mapItem);

      return Response.json({
        ok: true,
        message: data?.message || "",
        region: "",
        regionCode: "",
        page: currentPage,
        size: pageSize,
        rawTotalCount: data?.data?.dma_pageInfo?.groupTotalCount || 0,
        totalCount: mapped.length,
        count: mapped.length,
        items: mapped,
        rawPageInfo: data?.data?.dma_pageInfo || null,
      });
    }

    // 지역검색이면 50건을 한 번에 받고 우리 쪽에서 10개씩 자르기
    const bulkSize = 50;
    const data = await fetchCourt(1, bulkSize, regionCode);

    const items = Array.isArray(data?.data?.dlt_srchResult)
      ? data.data.dlt_srchResult
      : [];

    let mapped = items.map(mapItem);

    if (!regionCode) {
      mapped = mapped.filter((item) => item.소재지.includes(region));
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedItems = mapped.slice(startIndex, endIndex);

    return Response.json({
      ok: true,
      message: data?.message || "",
      region,
      regionCode,
      page: currentPage,
      size: pageSize,
      rawTotalCount: data?.data?.dma_pageInfo?.groupTotalCount || 0,
      matchedTotalCount: mapped.length,
      totalCount: pagedItems.length,
      count: pagedItems.length,
      items: pagedItems,
      rawPageInfo: data?.data?.dma_pageInfo || null,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message || "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}
