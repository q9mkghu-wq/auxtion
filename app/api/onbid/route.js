export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.DATA_GO_KR_API_KEY;
    
    // 가장 기본이 되는 다른 오퍼레이션(목록조회)으로 테스트
    const url = 
      "https://apis.data.go.kr/B010003/OnbidRlstListSrvc2/getRlstCltrList2" +
      `?serviceKey=${apiKey}` +
      `&numOfRows=10&pageNo=1&resultType=json` +
      `&prptDivCd=01&pvctTrgtYn=N`;

    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    
    return new Response(text, {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message });
  }
}
