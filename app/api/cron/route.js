export const dynamic = "force-dynamic";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegram(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

async function fetchCourt(regionCode = "") {
  const payload = {
    dma_srchGdsDtlSrchInfo: {
      statNum: "000000", cortAuctnMbrsId: "", pgmId: "PGJ157M02",
      lafjOrderBy: "", bidDvsCd: "000331", cortAuctnSrchCondCd: "0004602",
      cortStDvs: regionCode ? "2" : "1", cortOfcCd: "", jdbnCd: "", csNo: "",
      rprsAdongSdCd: regionCode || "", rprsAdongSggCd: "", rprsAdongEmdCd: "",
      rdnmSdCd: "", rdnmSggCd: "", rdnmNo: "", lclDspslGdsLstUsgCd: "",
      mclDspslGdsLstUsgCd: "", sclDspslGdsLstUsgCd: "", aeeEvlAmtMin: "",
      aeeEvlAmtMax: "", lwsDspslPrcMin: "", lwsDspslPrcMax: "",
      lwsDspslPrcRateMin: "", lwsDspslPrcRateMax: "", flbdNcntMin: "",
      flbdNcntMax: "", objctArDtsMin: "", objctArDtsMax: "",
      bidBgngYmd: "", bidEndYmd: "",
    },
    dma_pageInfo: { currentPage: 1, pageSize: 50, recordCountPerPage: 50, firstIndex: 0, lastIndex: 50 },
  };

  const res = await fetch("https://www.courtauction.go.kr/pgj/pgjsearch/searchControllerMain.on", {
    method: "POST", cache: "no-store",
    headers: { "Content-Type": "application/json; charset=UTF-8", Accept: "application/json, text/plain, */*", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return Array.isArray(data?.data?.dlt_srchResult) ? data.data.dlt_srchResult : [];
}

async function fetchOnbid() {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  const url = "https://apis.data.go.kr/B010003/OnbidRlstListSrvc2/getRlstCltrList2" +
    `?serviceKey=${apiKey}&pageNo=1&numOfRows=50&resultType=json&prptDivCd=0007&pvctTrgtYn=N`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return data?.result?.list || [];
}

const REGION_CODE_MAP = {
  서울: "11", 부산: "26", 대구: "27", 인천: "28", 광주: "29",
  대전: "30", 울산: "31", 세종: "36", 경기: "41", 강원: "42",
  충북: "43", 충남: "44", 전북: "45", 전남: "46",
  경북: "47", 경남: "48", 제주: "50",
};

function matchesAlert(item, alert) {
  if (alert.region && alert.region !== "전국") {
    if (!item.소재지.includes(alert.region)) return false;
  }
  const minPrice = Number(String(item.최저가 || "0").replace(/,/g, ""));
  if (alert.minPrice && minPrice < Number(alert.minPrice) * 10000) return false;
  if (alert.maxPrice && minPrice > Number(alert.maxPrice) * 10000) return false;
  const yuchal = Number(item.유찰수 || "0");
  if (alert.minYuchal && yuchal < Number(alert.minYuchal)) return false;
  return true;
}

function formatCourtMessage(item, alertName) {
  const g = Number(item.감정가.replace(/,/g, ""));
  const m = Number(item.최저가.replace(/,/g, ""));
  const ratio = g ? Math.round((m / g) * 100) : null;
  return `🏠 <b>[법원경매] ${alertName}</b>
📍 ${item.소재지 || "주소 없음"}
💰 감정가: ${item.감정가}원
💵 최저가: ${item.최저가}원${ratio ? ` (${ratio}%)` : ""}
🔄 유찰: ${item.유찰수}회
📅 매각기일: ${item.매각기일}
📋 사건번호: ${item.사건번호}`;
}

function formatOnbidMessage(item, alertName) {
  return `🏢 <b>[공매] ${alertName}</b>
📍 ${item.prptAddr || "주소 없음"}
💰 감정가: ${Number(item.aprsAmt || 0).toLocaleString("ko-KR")}원
💵 최저가: ${Number(item.lwsDspslPrc || 0).toLocaleString("ko-KR")}원
📅 입찰기간: ${item.bidBgngDt || ""} ~ ${item.bidEndDt || ""}`;
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { getFirebaseAdmin } = await import("@/lib/firebase-admin");
    const db = getFirebaseAdmin();
    const snapshot = await db.collection("alerts").get();
    let totalSent = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const { alerts, telegramChatId } = data;
      if (!alerts || alerts.length === 0 || !telegramChatId) continue;

      for (const alert of alerts) {
        if (!alert.active) continue;
        const messages = [];

        if (alert.types?.includes("court")) {
          const regionCode = REGION_CODE_MAP[alert.region] || "";
          const items = await fetchCourt(regionCode);
          const matched = items.filter((item) => matchesAlert({
            소재지: item.printSt || item.realSt || "",
            최저가: String(item.minmaePrice || "0"),
            유찰수: item.yuchalCnt || "0",
          }, alert));

          for (const item of matched.slice(0, 3)) {
            messages.push(formatCourtMessage({
              소재지: item.printSt || item.realSt || "",
              최저가: Number(item.minmaePrice || 0).toLocaleString("ko-KR"),
              감정가: Number(item.gamevalAmt || 0).toLocaleString("ko-KR"),
              유찰수: item.yuchalCnt || "0",
              매각기일: String(item.maeGiil || "").replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
              사건번호: item.srnSaNo || "",
            }, alert.name));
          }
        }

        if (alert.types?.includes("onbid")) {
          const items = await fetchOnbid();
          const matched = items.filter((item) => matchesAlert({
            소재지: item.prptAddr || "",
            최저가: String(item.lwsDspslPrc || "0"),
            유찰수: "0",
          }, alert));
          for (const item of matched.slice(0, 3)) {
            messages.push(formatOnbidMessage(item, alert.name));
          }
        }

        if (messages.length > 0) {
          await sendTelegram(telegramChatId, `🔔 <b>${alert.name}</b> 조건에 맞는 물건 ${messages.length}건!\n\n` + messages.join("\n\n---\n\n"));
          totalSent += messages.length;
        } else {
          await sendTelegram(telegramChatId, `🔍 <b>${alert.name}</b>\n오늘은 조건에 맞는 새 물건이 없어요.`);
        }
      }
    }

    return Response.json({ ok: true, totalSent });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
