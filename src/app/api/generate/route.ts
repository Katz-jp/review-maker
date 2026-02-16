import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function buildPrompt(answers: Record<string, string[]>, otherInputs: Record<string, string>, freeText: string): string {
  const labels: Record<string, string> = {
    symptom: "悩み・症状",
    menu: "受けたメニュー",
    change: "施術後の変化",
    atmosphere: "院の雰囲気",
    recommend: "おすすめしたい人",
  };

  let summary = "";
  for (const [id, vals] of Object.entries(answers)) {
    const parts = [...vals];
    if (otherInputs[id]) parts.push(otherInputs[id]);
    if (parts.length) summary += `【${labels[id] || id}】${parts.join("、")}\n`;
  }
  if (freeText) summary += `【補足】${freeText}\n`;

  return `あなたは実在の来院者です。

以下のアンケート回答の内容のみを使い、
Googleマップでよく見かける自然な口コミ文を作成してください。

絶対ルール

アンケートにない内容は追加しない

推測・一般論・創作は禁止

ネガティブ要素は明示されている場合のみ含める

情報を増やさず、整理・言い換えのみ行う

リアルさの条件

180〜260文字

一人称

話し言葉に近い自然な日本語

文の長さにばらつきを持たせる

完璧に整えすぎない

感情表現は1回まで

曖昧な表現（〜かなと思います等）は1回まで

宣伝的な締めは禁止

口コミの雰囲気

Googleマップでよく見られる★4〜5程度の自然な口コミのトーン。

## アンケート回答（この内容のみを使用すること）
${summary}

## 出力
口コミ本文のみを出力してください。説明や前置きは不要です。`;
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

    const openai = new OpenAI({ apiKey });
    const prompt = buildPrompt(answers, otherInputs, freeText);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "あなたは実在の来院者です。アンケートにない内容は追加せず、推測・一般論・創作は禁止。情報を増やさず整理・言い換えのみ行います。口コミ本文のみを出力します。",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      presence_penalty: 0.2,
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("[generate]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "生成に失敗しました" },
      { status: 500 }
    );
  }
}
