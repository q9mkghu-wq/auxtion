export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.DATA_GO_KR_API_KEY;

    // prptDivCd=10 (공고상세조회용 통합코드) 대신 
    // 물건목록조회용 기본값(공백 또는 제외)으로 테스트
    const url = 
      "https://apis.data.go.kr/B010003/OnbidRlstListSrvc2/getRlstCltrList2" +
      `?serviceKey=${apiKey}` +
      `&numOfRows=10&pageNo=1&resultType=json` +
      `&prptDivCd=01` + // 부동산 기본코드
      `&pvctTrgtYn=N`;

    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    
    return new Response(text, {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message });
  }
}
