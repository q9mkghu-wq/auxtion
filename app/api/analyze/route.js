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

async function analyzeWithClaude(itemInfo, pdfBase64List) {
  const content = [];

  // PDF 파일들 추가
  for (const pdf of pdfBase64List) {
    content.push({
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: pdf },
    });
  }

  // 분석 요청 텍스트
  content.push({
    type: "text",
    text: `아래는 법원경매 물건 정보입니다. 첨부된 PDF 문서(매각물건명세서, 현황조사서, 감정평가서 등)를 분석해서 투자자 입장에서 상세하게 분석해주세요.

## 물건 기본 정보
- 사건번호: ${itemInfo.사건번호}
- 소재지: ${itemInfo.소재지}
- 감정가: ${itemInfo.감정가}원
- 최저가: ${itemInfo.최저가}원 (감정가 대비 ${itemInfo.비율}%)
- 유찰수: ${itemInfo.유찰수}회
- 매각기일: ${itemInfo.매각기일}
- 용도: ${itemInfo.용도 || "미상"}
- 비고: ${itemInfo.비고 || "없음"}

다음 형식으로 분석해주세요:

✅ 장점
(3~5가지 구체적으로)

⚠️ 단점
(3~5가지 구체적으로)

🚨 위험 요소
(임차인, 권리관계, 특수조건 등 중요한 위험 요소)

💰 투자 가치 평가
(수익성, 시세 대비 가격, 입찰 추천 여부)

📋 종합 의견
(최종 판단 및 주의사항)`,
  });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      messages: [{ role: "user", content }],
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text || "분석 실패";
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const itemInfoStr = formData.get("itemInfo");
    const telegramChatId = formData.get("telegramChatId");
    const pdfs = formData.getAll("pdfs");

    const itemInfo = JSON.parse(itemInfoStr);

    // PDF를 base64로 변환
    const pdfBase64List = [];
    for (const pdf of pdfs) {
      const arrayBuffer = await pdf.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      pdfBase64List.push(base64);
    }

    // Claude AI 분석
    const analysis = await analyzeWithClaude(itemInfo, pdfBase64List);

    // 텔레그램 전송
    if (telegramChatId) {
      const message = `🏠 <b>경매 물건 AI 분석 결과</b>

📍 ${itemInfo.소재지}
📋 사건번호: ${itemInfo.사건번호}
💰 감정가: ${itemInfo.감정가}원
💵 최저가: ${itemInfo.최저가}원 (${itemInfo.비율}%)
🔄 유찰: ${itemInfo.유찰수}회

${analysis}`;

      await sendTelegram(telegramChatId, message);
    }

    return Response.json({ ok: true, analysis });
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
