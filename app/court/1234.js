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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") || "1");
    const size = Number(searchParams.get("size") || "10");
    const region = (searchParams.get("region") || "").trim();

    const currentPage = Number.isNaN(page) || page < 1 ? 1 : page;
    const pageSize = Number.isNaN(size) || size < 1 ? 10 : size;

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

    const data = await res.json();

    const items = Array.isArray(data?.data?.dlt_srchResult)
      ? data.data.dlt_srchResult
      : [];

    const simplified = items
      .map((item) => {
        const address = buildAddress(item);

        return {
          사건번호: item.srnSaNo || "",
          물건번호: item.maemulSer || "",
          목적물번호: item.mokmulSer || "",
          소재지: address,
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
      })
      .filter((item) => {
        if (!region) return true;
        return item.소재지.includes(region);
      });

    return Response.json({
      ok: true,
      message: data?.message || "",
      totalCount: simplified.length,
      page: currentPage,
      size: pageSize,
      region,
      count: simplified.length,
      items: simplified,
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
