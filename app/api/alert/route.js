import { getFirebaseAdmin } from "@/lib/firebase-admin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return Response.json({ ok: false, error: "userId 필요" }, { status: 400 });

    const db = getFirebaseAdmin();
    const doc = await db.collection("alerts").doc(userId).get();
    if (!doc.exists) return Response.json({ ok: true, alerts: [], telegramChatId: "" });

    return Response.json({ ok: true, alerts: doc.data().alerts || [], telegramChatId: doc.data().telegramChatId || "" });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, alerts, telegramChatId } = body;
    if (!userId) return Response.json({ ok: false, error: "userId 필요" }, { status: 400 });

    const db = getFirebaseAdmin();
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
