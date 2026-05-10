import { db } from "@/lib/firebase-admin";

// GET: 알림 조건 조회
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return Response.json({ ok: false, error: "userId 필요" }, { status: 400 });

    const doc = await db.collection("alerts").doc(userId).get();
    if (!doc.exists) return Response.json({ ok: true, alerts: [] });

    return Response.json({ ok: true, alerts: doc.data().alerts || [], telegramChatId: doc.data().telegramChatId || "" });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// POST: 알림 조건 저장
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, alerts, telegramChatId } = body;
    if (!userId) return Response.json({ ok: false, error: "userId 필요" }, { status: 400 });

    await db.collection("alerts").doc(userId).set({
      alerts,
      telegramChatId: telegramChatId || "",
      updatedAt: new Date().toISOString()
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
