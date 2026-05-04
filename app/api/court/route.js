export const dynamic = "force-dynamic";

const ROOT = "https://www.courtauction.go.kr";

function one(text, regex) {
  const m = text.match(regex);
  return m ? m[1].trim() : "";
}

function all(text, regex) {
  return [...text.matchAll(regex)].map((m) => m[1].trim());
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

async function fetchText(url) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/xml,text/xml,text/html,*/*",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
    },
  });

  return {
    status: res.status,
    text: await res.text(),
  };
}

export async function GET() {
  try {
    const resultXmlUrl = `${ROOT}/pgj/ui/pgj100/PGJ157M02.xml`;
    const resultXml = await fetchText(resultXmlUrl);

    const title = one(resultXml.text, /meta_screenName="([^"]+)"/i);

    const sbmSelectBlock = one(
      resultXml.text,
      /<xf:submission[^>]*id="sbm_selectGdsDtlSrch"[\s\S]*?action="([^"]+)"[\s\S]*?<\/xf:submission>/i
    );

    const allActions = uniq(
      all(resultXml.text, /action="([^"]+)"/gi).map((path) =>
        path.startsWith("http") ? path : `${ROOT}${path}`
      )
    );

    return Response.json({
      ok: true,
      title,
      resultXmlUrl,
      resultXmlStatus: resultXml.status,
      selectSearchAction: sbmSelectBlock
        ? sbmSelectBlock.startsWith("http")
          ? sbmSelectBlock
          : `${ROOT}${sbmSelectBlock}`
        : "",
      allActions,
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
