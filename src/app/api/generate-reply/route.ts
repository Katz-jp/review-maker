import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export type Tone = "friendly" | "polite" | "professional";

const TONE_LABELS: Record<Tone, string> = {
  friendly: "親しみやすくフレンドリーな口調",
  polite: "丁寧で礼儀正しい口調",
  professional: "プロフェッショナルでビジネスライクな口調",
};

function buildSystemPrompt(tone: Tone): string {
  const toneDesc = TONE_LABELS[tone];
  return `あなたは店舗の口コミ返信を生成するAIです。
以下のルールに従って、お客様の口コミに対する返信文を1つだけ出力してください。

## 必須ルール
- トーン: ${toneDesc}
- 必ず感謝の気持ちを表現する
- お客様の具体的なコメント（褒め言葉・指摘など）に言及する
- 150〜200文字を目安にする（厳密でなくてよい）
- 文章の内容に合わせた絵文字や「！」を適度に使い、より自然で感情のこもった返信文章にしてください
- 返信文のみを出力する（前置き・説明・「以下が返信です」などは不要）

## 出力
返信文の本文のみを出力してください。`;
}

function buildUserPrompt(review: string, customPhrases: string[]): string {
  let text = `## お客様の口コミ\n${review}`;
  if (customPhrases.length > 0) {
    text += `\n\n## 返信に自然に組み込みたいフレーズ（あれば使う）\n${customPhrases.map((p) => `- ${p}`).join("\n")}`;
  }
  return text;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEYが設定されていません" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      review = "",
      tone = "polite",
      customPhrases = [],
    }: {
      review: string;
      tone: Tone;
      customPhrases: string[];
    } = body;

    const trimmedReview = typeof review === "string" ? review.trim() : "";
    if (!trimmedReview) {
      return NextResponse.json(
        { error: "口コミを入力してください" },
        { status: 400 }
      );
    }

    const validTones: Tone[] = ["friendly", "polite", "professional"];
    const selectedTone = validTones.includes(tone) ? tone : "polite";
    const phrases = Array.isArray(customPhrases)
      ? customPhrases.filter((p): p is string => typeof p === "string" && p.trim() !== "").map((p) => p.trim())
      : [];

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: buildSystemPrompt(selectedTone) },
        { role: "user", content: buildUserPrompt(trimmedReview, phrases) },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ text, tone: selectedTone });
  } catch (err) {
    console.error("[generate-reply]", err);
    return NextResponse.json(
      { error: "生成に失敗しました。もう一度お試しください" },
      { status: 500 }
    );
  }
}
