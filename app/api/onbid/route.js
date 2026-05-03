export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.DATA_GO_KR_API_KEY;

    // 문서의 필수값(1)들을 모두 정확히 채운 호출 주소
    const url = 
      "https://apis.data.go.kr/B010003/OnbidRlstListSrvc2/getRlstCltrList2" +
      `?serviceKey=${apiKey}` +
      "&pageNo=1" +
      "&numOfRows=10" +
      "&resultType=json" +
      "&prptDivCd=01" + // 01: 국유재산 (가장 흔함)
      "&pvctTrgtYn=N";  // 수의계약 대상여부 (기본 N)

    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    
    return new Response(text, {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message });
  }
}
