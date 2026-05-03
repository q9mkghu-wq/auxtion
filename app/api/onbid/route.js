export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const numOfRows = searchParams.get("numOfRows") || "20";
    const pageNo = searchParams.get("pageNo") || "1";

    const apiKey = process.env.DATA_GO_KR_API_KEY;

    if (!apiKey) {
      return Response.json(
        { ok: false, error: "DATA_GO_KR_API_KEY 환경변수가 없습니다." },
        { status: 500 }
      );
    }

    const url =
      "https://apis.data.go.kr/B010003/OnbidPbancCltrDtlSrvc2/getPbctClturInfo" +
      `?serviceKey=${apiKey}` +
      `&numOfRows=${numOfRows}` +
      `&pageNo=${pageNo}` +
      `&type=json`;

    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return Response.json(
        {
          ok: false,
          error: "공공데이터 응답이 JSON이 아닙니다.",
          raw: text.slice(0, 800),
        },
        { status: 500 }
      );
    }

    return Response.json({ ok: true, data });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "알 수 없는 오류" },
      { status: 500 }
    );
  }
}
