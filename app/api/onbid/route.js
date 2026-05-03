export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.DATA_GO_KR_API_KEY;
    
    // 처음 신청했던 '물건정보 조회서비스'의 목록 함수로 테스트
    const url = 
      "https://apis.data.go.kr/B010003/OnbidPbancCltrDtlSrvc2/getPbancCltrInf2" +
      `?serviceKey=${apiKey}` +
      `&numOfRows=10&pageNo=1&resultType=json` +
      `&pbancMngNo=123456`; // 테스트용 더미 번호

    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    
    return new Response(text, {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message });
  }
}
