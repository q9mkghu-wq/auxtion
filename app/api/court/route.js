export const dynamic = "force-dynamic";

function extractTitle(html) {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
  return match ? match[1].trim() : "";
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const target =
      searchParams.get("target") ||
      "scheduled";

    const targets = {
      scheduled:
        "https://www.courtauction.go.kr/pgj/index.on?w2xPath=/pgj/ui/pgj100/PGJ157M00.xml",
      caseSearch:
        "https://www.courtauction.go.kr/pgj/index.on?w2xPath=/pgj/ui/pgj100/PGJ159M00.xml",
      detailSearch:
        "https://www.courtauction.go.kr/pgj/index.on?w2xPath=/pgj/ui/pgj100/PGJ151F00.xml",
    };

    const selectedUrl = targets[target] || targets.scheduled;

    const res = await fetch(selectedUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
    });

    const html = await res.text();
    const title = extractTitle(html);
    const textPreview = stripHtml(html).slice(0, 500);

    return Response.json({
      ok: true,
      target,
      pageUrl: selectedUrl,
      status: res.status,
      title,
      htmlLength: html.length,
      preview: textPreview,
      availableTargets: [
        {
          key: "scheduled",
          name: "매각예정물건",
          url: targets.scheduled,
        },
        {
          key: "caseSearch",
          name: "경매사건검색",
          url: targets.caseSearch,
        },
        {
          key: "detailSearch",
          name: "물건상세검색",
          url: targets.detailSearch,
        },
      ],
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message || "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}
