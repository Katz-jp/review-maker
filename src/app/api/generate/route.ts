import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getIndustryConfig } from "@/lib/industries";

/**
 * 使用モデル。Vercel の環境変数 OPENAI_MODEL で切り替え可能（未設定なら従来どおり gpt-4o-mini）。
 * → モデル比較・上位モデルへの切り替えをコード変更なしで行えるようにしている。
 */
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/** 星1〜3で使わせない表現（再来・強い褒め言葉・総評テンプレ） */
const BANNED_WORDS_FOR_LOW_SCORE = [
  "また来たい",
  "また伺いたい",
  "また相談したい",
  "通いたい",
  "今後もお願いしたい",
  "また行こうと思う",
  "おすすめ",
  "最高",
  "大満足",
  "素晴らしい",
  "とても満足",
  "安心して通える",
  "全体的に",
  "全体として",
  "総合的に",
  "と良いかなと思います",
  "改善点もある",
  "期待したいです",
  "！",
  "!",
];

/** 星4〜5で混ざってはいけない否定表現 */
const NEGATIVE_PHRASES_FOR_HIGH_SCORE = [
  "おすすめしない",
  "おすすめできない",
  "また行きたいとは思わない",
  "また行きたいと思わない",
  "また来たいとは思わない",
  "また伺いたいとは思わない",
];

/** 星に関係なく出てほしくない表現（総評テンプレ・書き言葉すぎる締め） */
const BANNED_WORDS_ALWAYS = [
  "全体的に",
  "全体として",
  "総合的に",
  "という印象",
  "良い印象",
  "ことができ",
  "ほっとしています",
  "ホッとしています",
  "こんな風に",
  "できたと思います",
];

function containsEmoji(text: string): boolean {
  // サロゲートペアを含む＝絵文字の可能性が高い（低評価時の絵文字検知用の簡易判定）
  return /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(text);
}

/** ルール違反になっている表現を列挙する（空配列なら問題なし） */
function findViolations(text: string, satisfaction: number): string[] {
  const found = new Set<string>();
  for (const w of BANNED_WORDS_ALWAYS) if (text.includes(w)) found.add(w);
  if (satisfaction <= 3) {
    if (containsEmoji(text)) found.add("絵文字");
    for (const w of BANNED_WORDS_FOR_LOW_SCORE) if (text.includes(w)) found.add(w);
  } else {
    for (const w of NEGATIVE_PHRASES_FOR_HIGH_SCORE) if (text.includes(w)) found.add(w);
  }
  return Array.from(found);
}

/** モデルが付けがちな前後のカギカッコ・引用符を外す */
function cleanOutput(text: string): string {
  return text
    .trim()
    .replace(/^[「『"“]+/, "")
    .replace(/[」』"”]+$/, "")
    .trim();
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
    const { answers = {}, otherInputs = {}, freeText = "" } = body;

    const rawSatisfaction = body?.satisfaction;
    if (
      typeof rawSatisfaction !== "number" ||
      !Number.isInteger(rawSatisfaction) ||
      rawSatisfaction < 1 ||
      rawSatisfaction > 5
    ) {
      return NextResponse.json(
        { error: "満足度（1〜5の整数）が必要です" },
        { status: 400 }
      );
    }
    const satisfaction = rawSatisfaction;

    const config = getIndustryConfig();
    const openai = new OpenAI({ apiKey });
    const prompt = config.buildPrompt(
      answers,
      { ...otherInputs, __satisfaction: String(satisfaction) },
      freeText
    );

    // ※ frequency_penalty / presence_penalty は使わない。
    //   日本語では助詞や語尾（の・が・て・ました）まで避けようとして、言い回しが不自然になるため。
    const generate = async (userContent: string, temperature: number) => {
      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: config.systemMessage },
          { role: "user", content: userContent },
        ],
        temperature,
        max_tokens: 500,
      });
      return cleanOutput(completion.choices[0]?.message?.content ?? "");
    };

    let text = await generate(prompt, satisfaction <= 3 ? 0.6 : 0.8);

    // ルール違反があれば、具体的にどの表現がダメだったかを伝えて最大2回まで書き直す
    for (let attempt = 0; attempt < 2; attempt++) {
      const violations = findViolations(text, satisfaction);
      if (violations.length === 0) break;

      const fixRequest = `${prompt}

■ 書き直しのお願い
前回の下書き：
${text}

次の表現がルールに合わないので、使わずに書き直してください：${violations
        .map((v) => `「${v}」`)
        .join("、")}
内容は変えず、自然な日本語のまま直してください。口コミ本文だけを出力してください。`;

      const retryText = await generate(fixRequest, 0.5);
      if (retryText) text = retryText;
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error("[generate]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "生成に失敗しました" },
      { status: 500 }
    );
  }
}
