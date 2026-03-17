import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

type EventName = "open_google_maps" | "open_inhouse_feedback";

function normalizeSatisfaction(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const n = Math.floor(value);
  return n >= 1 && n <= 5 ? n : null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantIdが必要です" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const event = (body?.event ?? "") as EventName | "";
    const satisfaction = normalizeSatisfaction(body?.satisfaction);

    if (event !== "open_google_maps" && event !== "open_inhouse_feedback") {
      return NextResponse.json(
        { error: "eventが不正です" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "データベース接続が利用できません" },
        { status: 500 }
      );
    }

    const { FieldValue, Timestamp } = await import("firebase-admin/firestore");

    const ref = db
      .collection("tenants")
      .doc(tenantId)
      .collection("stats")
      .doc("usage");

    const inc: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    if (event === "open_google_maps") {
      inc.mapsClickCount = FieldValue.increment(1);
      if (satisfaction !== null) {
        inc.mapsSatisfactionSum = FieldValue.increment(satisfaction);
        inc.mapsSatisfactionCount = FieldValue.increment(1);
      }
    } else if (event === "open_inhouse_feedback") {
      inc.feedbackClickCount = FieldValue.increment(1);
    }

    await ref.set(inc, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[stats events POST]", err);
    return NextResponse.json(
      { error: "統計情報の更新に失敗しました" },
      { status: 500 }
    );
  }
}

