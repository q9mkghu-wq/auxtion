export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const numOfRows = searchParams.get("numOfRows") || "10";
    const pageNo = searchParams.get("pageNo") || "1";
    
    const apiKey = process.env.DATA_GO_KR_API_KEY;

    if (!apiKey) {
      return Response.json({ ok: false, error: "API_KEY 없음" }, { status: 500 });
    }

    // 필수 파라미터만 넣고, prptDivCd(재산유형)를 01(부동산)로 테스트
    const url =
      "https://apis.data.go.kr/B010003/OnbidRlstListSrvc2/getRlstCltrList2" +
      `?serviceKey=${apiKey}` +
      `&numOfRows=${numOfRows}` +
      `&pageNo=${pageNo}` +
      `&resultType=json` +
      `&prptDivCd=01` + 
      `&pvctTrgtYn=N`;

    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    return Response.json({ ok: true, data });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
