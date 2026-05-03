export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.DATA_GO_KR_API_KEY;

    // prptDivCd를 03(압류재산)으로 변경하여 테스트
    const url = 
      "https://apis.data.go.kr/B010003/OnbidRlstListSrvc2/getRlstCltrList2" +
      `?serviceKey=${apiKey}` +
      "&pageNo=1" +
      "&numOfRows=10" +
      "&resultType=json" +
      "&prptDivCd=03" + 
      "&pvctTrgtYn=N";

    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    
    return new Response(text, {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message });
  }
}
