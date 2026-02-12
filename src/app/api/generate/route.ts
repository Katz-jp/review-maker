import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const TONES = ["誠実", "フレンドリー", "レポート風"] as const;

function buildPrompt(answers: Record<string, string[]>, otherInputs: Record<string, string>, freeText: string): string {
  const tone = TONES[Math.floor(Math.random() * TONES.length)];
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

  return `あなたは整骨院のGoogleマップ口コミを書くお客様をサポートするAIです。
以下のアンケート回答をもとに、口コミの下書きを1つ生成してください。

## ルール
- 回答に含まれるキーワード（地名・症状・施術名など）を必ず1回は含める（MEO対策）
- トーンは「${tone}」で統一する
- 200〜300文字程度
- 不満や改善要望が含まれる場合は、無理にポジティブにせず、建設的なフィードバックとして自然に表現する

## アンケート回答
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
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
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
