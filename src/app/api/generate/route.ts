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

## 最重要ルール（厳守必須）
- **絶対に、アンケート回答に記載されている内容のみを使用してください**
- **選択されていない選択肢の内容を追加することは厳禁です**
- **自由記入欄に書かれていない内容を推測して追加することは厳禁です**
- **提供された情報以外の内容（一般的な整骨院の特徴、一般的な施術内容など）を勝手に追加しないでください**
- **推測や補完は一切行わず、記載されている文字列のみを基に文章を作成してください**

## その他のルール
- 回答に含まれるキーワード（地名・症状・施術名など）を必ず1回は含める（MEO対策）
- トーンは「${tone}」で統一する
- 200〜300文字程度
- 不満や改善要望が含まれる場合は、無理にポジティブにせず、建設的なフィードバックとして自然に表現する

## アンケート回答（この内容のみを使用すること）
${summary}

## 出力
口コミ本文のみを出力してください。説明や前置きは不要です。
上記のアンケート回答に記載されていない内容は一切含めないでください。`;
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
          content: "あなたは整骨院のGoogleマップ口コミを書くお客様をサポートするAIです。アンケート回答に記載されている内容のみを使用し、選択されていない選択肢や入力されていない自由記入欄の内容を追加することは絶対に禁止されています。提供された情報以外の内容を推測や補完で追加することは厳禁です。",
        },
        { role: "user", content: prompt },
      ],
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
