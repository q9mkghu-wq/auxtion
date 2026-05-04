export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.DATA_GO_KR_API_KEY;

    const types = ["0007", "0010", "0008", "0006"];

    for (const type of types) {
      const url =
        "https://apis.data.go.kr/B010003/OnbidRlstListSrvc2/getRlstCltrList2" +
        `?serviceKey=${apiKey}` +
        "&pageNo=1" +
        "&numOfRows=10" +
        "&resultType=json" +
        `&prptDivCd=${type}` +
        "&pvctTrgtYn=N";

      const res = await fetch(url, { cache: "no-store" });
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        continue;
      }

      if (data?.result?.resultCode === "00") {
        return Response.json({
          ok: true,
          matchedType: type,
          data,
        });
      }
    }

    return Response.json({
      ok: false,
      error: "정확한 4자리 코드로도 데이터 없음",
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error.message || "알 수 없는 오류",
    });
  }
}
