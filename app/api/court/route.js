export const dynamic = "force-dynamic";

const SEARCH_URL =
  "https://www.courtauction.go.kr/pgj/pgjsearch/searchControllerMain.on";

export async function GET() {
  try {
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
        currentPage: 1,
        pageSize: 10,
        recordCountPerPage: 10,
        firstIndex: 0,
        lastIndex: 10,
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

    const simplified = items.map((item) => ({
      사건번호: item.srnSaNo || "",
      물건번호: item.maemulSer || "",
      소재지: item.realSt || "",
      감정가: item.gamevalAmt || "",
      최저가: item.minmaePrice || "",
      유찰수: item.yuchalCnt || "",
      매각기일: item.maeGiil || "",
      담당계: item.jpDeptNm || "",
      docid: item.docid || "",
      courtCode: item.boCd || "",
      caseNo: item.saNo || "",
      itemNo: item.mokmulSer || "",
    }));

    return Response.json({
      ok: true,
      message: data?.message || "",
      totalCount: data?.data?.dma_pageInfo?.groupTotalCount || 0,
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
