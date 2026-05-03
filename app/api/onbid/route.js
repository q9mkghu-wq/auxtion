export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.DATA_GO_KR_API_KEY;

    // 온비드 부동산 목록 API에서 가장 흔한 재산유형 4가지
    // 01:국유, 02:수탁, 03:압류, 04:유입
    const types = ["01", "02", "03", "04"];
    
    for (const type of types) {
      const url = 
        "https://apis.data.go.kr/B010003/OnbidRlstListSrvc2/getRlstCltrList2" +
        `?serviceKey=${apiKey}` +
        `&pageNo=1&numOfRows=10&resultType=json&pvctTrgtYn=N` +
        `&prptDivCd=${type}`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      // 만약 데이터가 있으면 바로 응답
      if (data.result?.resultCode === "00") {
        return Response.json({ ok: true, type, data });
      }
    }

    return Response.json({ ok: false, error: "모든 유형에서 데이터 없음" });
  } catch (error) {
    return Response.json({ ok: false, error: error.message });
  }
}
