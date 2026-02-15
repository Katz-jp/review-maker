import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export type Tone = "friendly" | "polite" | "professional";

export type CustomPhrase = {
  id: string;
  text: string;
  enabled: boolean;
  createdAt: FirebaseFirestore.Timestamp;
};

type CustomPhraseResponse = {
  id: string;
  text: string;
  enabled: boolean;
  createdAt?: { seconds: number; nanoseconds: number };
};

const MAX_PHRASES = 5;
const SETTINGS_DOC_ID = "default";

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

    const ref = db
      .collection("tenants")
      .doc(tenantId)
      .collection("replySettings")
      .doc(SETTINGS_DOC_ID);
    const snap = await ref.get();
    const data = snap.data();

    const defaultTone: Tone = data?.defaultTone ?? "polite";
    const customPhrases: CustomPhraseResponse[] = Array.isArray(data?.customPhrases)
      ? data.customPhrases.map((p: { id?: string; text?: string; enabled?: boolean; createdAt?: { seconds: number; nanoseconds?: number } }) => {
          const raw = p.createdAt;
          const hasTimestamp = raw != null && typeof (raw as { seconds?: number }).seconds === "number";
          return {
            id: p.id ?? "",
            text: p.text ?? "",
            enabled: p.enabled ?? true,
            ...(hasTimestamp
              ? { createdAt: { seconds: (raw as { seconds: number }).seconds, nanoseconds: (raw as { nanoseconds?: number }).nanoseconds ?? 0 } }
              : {}),
          };
        })
      : [];

    return NextResponse.json({
      defaultTone,
      customPhrases: customPhrases.slice(0, MAX_PHRASES),
    });
  } catch (err) {
    console.error("[reply-settings GET]", err);
    return NextResponse.json(
      { error: "設定の取得に失敗しました" },
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
    const { defaultTone = "polite", customPhrases = [] } = body;

    const validTones: Tone[] = ["friendly", "polite", "professional"];
    const tone: Tone = validTones.includes(defaultTone) ? defaultTone : "polite";

    const { Timestamp } = await import("firebase-admin/firestore");
    const phrases: CustomPhrase[] = (Array.isArray(customPhrases)
      ? customPhrases
      : []
    )
      .filter((p: { text?: string }) => typeof p?.text === "string" && p.text.trim() !== "")
      .slice(0, MAX_PHRASES)
      .map((p: { id?: string; text?: string; enabled?: boolean; createdAt?: { seconds?: number; nanoseconds?: number } }) => {
        const created =
          p.createdAt &&
          typeof p.createdAt === "object" &&
          typeof (p.createdAt as { seconds?: number }).seconds === "number"
            ? Timestamp.fromMillis((p.createdAt as { seconds: number }).seconds * 1000)
            : Timestamp.now();
        return {
          id: typeof p.id === "string" && p.id ? p.id : `phrase_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          text: (p.text ?? "").trim(),
          enabled: Boolean(p.enabled),
          createdAt: created,
        };
      });

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "データベース接続が利用できません" },
        { status: 500 }
      );
    }

    const ref = db
      .collection("tenants")
      .doc(tenantId)
      .collection("replySettings")
      .doc(SETTINGS_DOC_ID);

    const payload: {
      defaultTone: Tone;
      customPhrases: { id: string; text: string; enabled: boolean; createdAt: FirebaseFirestore.Timestamp }[];
      updatedAt: FirebaseFirestore.Timestamp;
    } = {
      defaultTone: tone,
      customPhrases: phrases.map((p) => ({
        id: p.id,
        text: p.text,
        enabled: p.enabled,
        createdAt: p.createdAt as FirebaseFirestore.Timestamp,
      })),
      updatedAt: Timestamp.now(),
    };

    await ref.set(payload, { merge: true });

    return NextResponse.json({
      defaultTone: payload.defaultTone,
      customPhrases: payload.customPhrases,
    });
  } catch (err) {
    console.error("[reply-settings POST]", err);
    return NextResponse.json(
      { error: "設定の保存に失敗しました" },
      { status: 500 }
    );
  }
}
