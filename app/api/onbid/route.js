export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.DATA_GO_KR_API_KEY;

    // prptDivCd를 아예 빼거나 공백으로 두어 전체 검색 시도
    const url = 
      "https://apis.data.go.kr/B010003/OnbidRlstListSrvc2/getRlstCltrList2" +
      `?serviceKey=${apiKey}` +
      "&pageNo=1" +
      "&numOfRows=10" +
      "&resultType=json" +
      "&pvctTrgtYn=N"; // 필수값만 유지

    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    
    return new Response(text, {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message });
  }
}
