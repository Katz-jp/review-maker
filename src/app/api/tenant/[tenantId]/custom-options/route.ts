import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { questionnaireData } from "@/lib/questionnaire-data";

export type CustomOptionsByQuestion = Record<string, string[]>;

const MAX_CUSTOM_OPTIONS_PER_QUESTION = 3;
const QUESTION_IDS = questionnaireData.questions.map((q) => q.id);

function validateQuestionId(id: string): boolean {
  return QUESTION_IDS.includes(id);
}

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

    const ref = db.collection("tenants").doc(tenantId);
    const snap = await ref.get();
    const data = snap.data();
    const customOptions: CustomOptionsByQuestion = data?.customOptions ?? {};

    return NextResponse.json({ customOptions });
  } catch (err) {
    console.error("[custom-options GET]", err);
    return NextResponse.json(
      { error: "カスタム選択肢の取得に失敗しました" },
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
    const { customOptions } = body as { customOptions: CustomOptionsByQuestion };

    if (!customOptions || typeof customOptions !== "object") {
      return NextResponse.json(
        { error: "customOptionsが必要です" },
        { status: 400 }
      );
    }

    const validated: CustomOptionsByQuestion = {};
    for (const [questionId, options] of Object.entries(customOptions)) {
      if (!validateQuestionId(questionId)) continue;
      if (!Array.isArray(options)) continue;
      const filtered = options
        .filter((o): o is string => typeof o === "string" && o.trim() !== "")
        .map((o) => o.trim())
        .slice(0, MAX_CUSTOM_OPTIONS_PER_QUESTION);
      if (filtered.length > 0) {
        validated[questionId] = filtered;
      }
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "データベース接続が利用できません" },
        { status: 500 }
      );
    }

    const ref = db.collection("tenants").doc(tenantId);
    await ref.set({ customOptions: validated }, { merge: true });

    return NextResponse.json({ customOptions: validated });
  } catch (err) {
    console.error("[custom-options POST]", err);
    return NextResponse.json(
      { error: "カスタム選択肢の保存に失敗しました" },
      { status: 500 }
    );
  }
}
