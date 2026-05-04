export const dynamic = "force-dynamic";

const SEARCH_URL =
  "https://www.courtauction.go.kr/pgj/pgjsearch/searchControllerMain.on";

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

async function fetchCourtPage(currentPage, pageSize) {
  const payload = {
    dma_srchGdsDtlSrchInfo: {
      statNum: "000000",
      cortAuctnMbrsId: "",
      pgmId: "PGJ157M02",
      lafjOrderBy: "",
      bidDvsCd: "000331",
      cortAuctnSrchCondCd: "0004602",
      cortStDvs: "1",
      cortOfcCd: "",
      jdbnCd: "",
      csNo: "",
      rprsAdongSdCd: "",
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

    // 지역 검색이 없으면 기존처럼 현재 페이지 그대로 반환
    if (!region) {
      const data = await fetchCourtPage(currentPage, pageSize);
      const items = Array.isArray(data?.data?.dlt_srchResult)
        ? data.data.dlt_srchResult
        : [];

      const mapped = items.map(mapItem);

      return Response.json({
        ok: true,
        message: data?.message || "",
        region: "",
        page: currentPage,
        size: pageSize,
        rawTotalCount: data?.data?.dma_pageInfo?.groupTotalCount || 0,
        totalCount: mapped.length,
        count: mapped.length,
        items: mapped,
        rawPageInfo: data?.data?.dma_pageInfo || null,
      });
    }

    // 지역 검색이 있으면 여러 페이지를 훑어서 맞는 것만 모음
    const fetchSize = 50;
    const maxPagesToScan = 20;
    const needCount = currentPage * pageSize;

    let rawTotalCount = 0;
    let message = "";
    let lastRawPageInfo = null;
    let scannedPages = 0;
    const collected = [];

    for (let apiPage = 1; apiPage <= maxPagesToScan; apiPage += 1) {
      const data = await fetchCourtPage(apiPage, fetchSize);

      scannedPages = apiPage;
      message = data?.message || message;
      rawTotalCount =
        data?.data?.dma_pageInfo?.groupTotalCount || rawTotalCount;
      lastRawPageInfo = data?.data?.dma_pageInfo || lastRawPageInfo;

      const items = Array.isArray(data?.data?.dlt_srchResult)
        ? data.data.dlt_srchResult
        : [];

      const matched = items
        .map(mapItem)
        .filter((item) => item.소재지.includes(region));

      collected.push(...matched);

      if (collected.length >= needCount) {
        break;
      }

      if (rawTotalCount && apiPage * fetchSize >= rawTotalCount) {
        break;
      }
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedItems = collected.slice(startIndex, endIndex);

    return Response.json({
      ok: true,
      message,
      region,
      page: currentPage,
      size: pageSize,
      rawTotalCount,
      matchedTotalCount: collected.length,
      totalCount: pagedItems.length,
      count: pagedItems.length,
      scannedPages,
      items: pagedItems,
      rawPageInfo: lastRawPageInfo,
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
