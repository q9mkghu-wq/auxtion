export const dynamic = "force-dynamic";

const ROOT = "https://www.courtauction.go.kr";

function pickOne(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

function pickAll(text, regex) {
  return [...text.matchAll(regex)].map((m) => m[1].trim());
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
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
    const mainXmlUrl = `${ROOT}/pgj/ui/pgj100/PGJ157M00.xml`;
    const mainXml = await fetchText(mainXmlUrl);

    const title = pickOne(mainXml.text, /<title>([\s\S]*?)<\/title>/i);
    const frameSrc = pickOne(
      mainXml.text,
      /wfm_mainFrame\.setSrc\("([^"]+)"\)/i
    );

    const resolvedFrameUrl = frameSrc
      ? `${ROOT}${frameSrc}`
      : "";

    let frameStatus = null;
    let submissionActions = [];

    if (resolvedFrameUrl) {
      const frameXml = await fetchText(resolvedFrameUrl);
      frameStatus = frameXml.status;

      submissionActions = unique(
        pickAll(frameXml.text, /action="([^"]+)"/gi).map((path) =>
          path.startsWith("http") ? path : `${ROOT}${path}`
        )
      );
    }

    return Response.json({
      ok: true,
      step: "court-internal-xml-check",
      title,
      mainXmlUrl,
      mainXmlStatus: mainXml.status,
      frameSrc,
      frameUrl: resolvedFrameUrl,
      frameStatus,
      submissionActions,
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
