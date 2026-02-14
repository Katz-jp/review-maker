import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export type ReplyHistoryItem = {
  id: string;
  originalReview: string;
  generatedReply: string;
  tone: string;
  usedPhrases: string[];
  characterCount: number;
  wasEdited: boolean;
  createdAt: { seconds: number; nanoseconds: number };
};

const LIMIT = 50;

export async function GET(
  _req: NextRequest,
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

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "データベース接続が利用できません" },
        { status: 500 }
      );
    }

    const snapshot = await db
      .collection("tenants")
      .doc(tenantId)
      .collection("replyHistory")
      .orderBy("createdAt", "desc")
      .limit(LIMIT)
      .get();

    const items: ReplyHistoryItem[] = snapshot.docs.map((doc) => {
      const d = doc.data();
      const createdAt = d.createdAt;
      return {
        id: doc.id,
        originalReview: d.originalReview ?? "",
        generatedReply: d.generatedReply ?? "",
        tone: d.tone ?? "polite",
        usedPhrases: Array.isArray(d.usedPhrases) ? d.usedPhrases : [],
        characterCount: typeof d.characterCount === "number" ? d.characterCount : 0,
        wasEdited: Boolean(d.wasEdited),
        createdAt:
          createdAt && typeof (createdAt as { seconds: number; nanoseconds: number }).seconds === "number"
            ? { seconds: (createdAt as { seconds: number }).seconds, nanoseconds: (createdAt as { nanoseconds: number }).nanoseconds ?? 0 }
            : { seconds: 0, nanoseconds: 0 },
      };
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("[reply-history GET]", err);
    return NextResponse.json(
      { error: "履歴の取得に失敗しました" },
      { status: 500 }
    );
  }
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

    const body = await req.json();
    const {
      originalReview = "",
      generatedReply = "",
      tone = "polite",
      usedPhrases = [],
      characterCount = 0,
      wasEdited = false,
    } = body;

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "データベース接続が利用できません" },
        { status: 500 }
      );
    }

    const { Timestamp } = await import("firebase-admin/firestore");

    const ref = db
      .collection("tenants")
      .doc(tenantId)
      .collection("replyHistory")
      .doc();

    await ref.set({
      originalReview: String(originalReview),
      generatedReply: String(generatedReply),
      tone: String(tone),
      usedPhrases: Array.isArray(usedPhrases) ? usedPhrases : [],
      characterCount: Number(characterCount) || 0,
      wasEdited: Boolean(wasEdited),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      id: ref.id,
      createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
    });
  } catch (err) {
    console.error("[reply-history POST]", err);
    return NextResponse.json(
      { error: "履歴の保存に失敗しました" },
      { status: 500 }
    );
  }
}
