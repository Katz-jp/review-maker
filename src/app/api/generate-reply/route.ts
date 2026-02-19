import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export type Tone = "friendly" | "polite" | "professional";

const TONE_LABELS: Record<Tone, string> = {
  friendly: "院長・個人経営タイプ",
  polite: "受付・スタッフタイプ",
  professional: "法人・組織タイプ",
};

const SYSTEM_PROMPT = `あなたは整骨院・接骨院の口コミ返信を作成するAIです。
以下のルールを厳守し、お客様の口コミに対する返信文を1つだけ出力してください。

■ 共通必須ルール

必ず最初に感謝の気持ちを伝える

お客様の具体的なコメント内容に必ず言及する

口コミに書かれていない事実を追加しない

推測・言い訳・反論は禁止

感情的にならない

返信文のみを出力する（前置きや説明は禁止）

150〜200文字程度を目安にする（厳密でなくてよい）

■ 星評価による返信方針分岐

※星評価が入力されている場合は以下を適用する。
※「不明」の場合は口コミ内容から判断する。

★1 の場合

目的：ブランドを守ること（説得しない）

冷静で簡潔に受け止める

事実訂正を行わない

改善アピールを強く出さない

再来院を促さない

感情を抑えた落ち着いた文体にする

第三者が読んだときに「誠実で冷静」と感じる文章にする

やや短めで簡潔にまとめる

★2〜3 の場合

目的：誠実さ＋やんわり訂正

不満を否定しない

「ご説明不足」「行き違い」「認識の差」などのクッション表現を使う

直接的な否定はしない

自院の通常対応をやんわり説明する

改善姿勢は1文だけ簡潔に入れる

言い訳に見えないようにする

再来院を強く促さない

第三者が読んで安心できる文章にする

★4〜5 の場合

目的：関係強化

感謝を中心に書く

良いコメントに具体的に触れる

温かさを出す

必要以上に誇張しない

今後も安心して通える印象を与える

■ トーン指定（人格を変える）

トーンは「口調」ではなく「立場の人格」として表現する。

friendly（院長・個人経営タイプ）

明るく親しみやすい口調

絵文字は1つまで使用可

「！」は最大1回まで使用可

柔らかい語尾（〜ですね、〜うれしいです など）

少し温度を感じさせる文章

polite（受付・スタッフタイプ）

落ち着いた丁寧なです・ます調

絵文字は禁止

「！」は禁止

誇張しない

安心感重視

professional（法人・組織タイプ）

ビジネス文書調

絵文字は禁止

「！」は禁止

簡潔で無駄のない文章

感情は控えめ

「誠にありがとうございます」「存じます」など格式ある表現を使用

■ 整骨院特有の注意事項

症状改善を断定しない

医療広告ガイドラインを意識し、効果を保証しない

専門性は出しつつ誇張しない

不安や不満には真摯に向き合う姿勢を示す

■ 返信に自然に組み込みたいフレーズ（任意）

指定されたフレーズがある場合は、無理なく自然に組み込む。
不自然な挿入は禁止。

■ 名前のパーソナライズ

投稿者名が指定されている場合、生成される返信の冒頭を必ず「{投稿者名} 様」から始める。
未指定の場合は「お客様」で始める。

■ 投稿者に伝えるメッセージ

店舗から投稿者に伝えたいメッセージ（一言メモ）が指定されている場合、その内容を返信の文末や自然な箇所に組み込む。伝えたい趣旨を崩さず、返信文として自然な表現にリライトして含める。無理に挿入せず、流れに合う場合のみ使用する。

■ プライバシーガード

特定の個人情報（病名や詳細すぎる居住地など）が口コミやメモに含まれる場合は、AIの判断で「お体」「お近く」などの抽象的な表現に変換し、プライバシーに配慮した温かい文章にする。

■ 出力形式

返信本文のみを出力すること。
前置き・説明文・補足は一切不要。`;

function buildUserPrompt(
  review: string,
  tone: Tone,
  starRating: number | null,
  authorName: string,
  memo: string,
  customPhrases: string[]
): string {
  const toneDesc = TONE_LABELS[tone];
  let text = "";
  if (authorName) {
    text += `## 投稿者名\n${authorName}\n\n`;
  }
  text += `## お客様の口コミ\n${review}`;
  if (memo) {
    text += `\n\n## 投稿者に伝えたいメッセージ（返信に組み込む）\n${memo}`;
  }
  text += `\n\n## 星評価\n${starRating != null ? `★${starRating}` : "不明（口コミ内容から判断）"}`;
  text += `\n\n## 今回使用するトーン\n${tone}（${toneDesc}）`;
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
      starRating = null,
      authorName = "",
      memo = "",
      customPhrases = [],
    }: {
      review: string;
      tone: Tone;
      starRating?: number | null;
      authorName?: string;
      memo?: string;
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
    const validStar = [1, 2, 3, 4, 5].includes(Number(starRating))
      ? Number(starRating)
      : null;
    const phrases = Array.isArray(customPhrases)
      ? customPhrases.filter((p): p is string => typeof p === "string" && p.trim() !== "").map((p) => p.trim())
      : [];
    const trimmedAuthorName = typeof authorName === "string" ? authorName.trim() : "";
    const trimmedMemo = typeof memo === "string" ? memo.trim() : "";

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: buildUserPrompt(
            trimmedReview,
            selectedTone,
            validStar,
            trimmedAuthorName,
            trimmedMemo,
            phrases
          ),
        },
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
