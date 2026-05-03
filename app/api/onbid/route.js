export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.DATA_GO_KR_API_KEY;

    // 모든 재산유형(비워둠)과 기본 필수값만 넣어서 호출
    const url = 
      "https://apis.data.go.kr/B010003/OnbidRlstListSrvc2/getRlstCltrList2" +
      `?serviceKey=${apiKey}` +
      "&numOfRows=10&pageNo=1&resultType=json" +
      "&prptDivCd=" + // 비워둠
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
