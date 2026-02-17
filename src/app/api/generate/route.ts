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

  // 文体タイプをランダムに選択
  const styleTypes = ["A：体験談寄り", "B：説明寄り", "C：淡々型"];
  const styleType = styleTypes[Math.floor(Math.random() * styleTypes.length)];

  // 締めタイプをランダムに選択
  const closingTypes = ["1：断定型", "2：感想型", "3：継続型", "4：中立型"];
  const closingType = closingTypes[Math.floor(Math.random() * closingTypes.length)];

  return `あなたは整骨院・接骨院のGoogleマップ口コミを書くお客様をサポートするAIです。 以下のアンケート回答のみをもとに、口コミの下書きを1つ生成してください。

■ 最重要ルール（厳守）
* アンケートのすべての回答内容を口コミ本文に反映すること
* アンケートに記載されている内容のみを使用すること
* 選択されていない選択肢の内容を追加してはいけない
* 自由記入欄に書かれていない内容を推測して追加してはいけない
* 一般的な整骨院の特徴を勝手に補完してはいけない
* プレースホルダーや例文から内容を引っ張ってはいけない
* 情報の追加・誇張・脚色は禁止 
■ 整骨院特有の注意
* 症状改善を断定しない
* 効果を保証する表現は禁止
* 医療広告ガイドラインを意識する
* 誇張しない

■ 文章ルール
* 200〜320文字程度（厳密でなくてよい）
* 回答に含まれる語句（地名・症状・施術名など）は削除しないこと
* 感情表現は1回まで
* 絵文字は最大1つまで使用可
* 「！」は最大1回まで使用可

■ 構成（固定しない）
* 情報はすべて含めること
* ただし、構成の順番を毎回固定しないこと
* 自然な流れで並べ替えてよい

■ AIっぽさ回避ルール（重要）
* 文章をきれいにまとめすぎないこと
* 完璧な総括で締めないこと
* 宣伝のような文章にしないこと
* 同じ語尾（〜でした／〜ました）を連続させないこと
* 優等生的な作文にしないこと
* 少しだけ余白のある終わり方にすること
* 一文をやや短めにする箇所を1つ含めてもよい
* 実際のGoogleマップに投稿されている自然な整骨院口コミの雰囲気に寄せること

■ 文体揺らぎ（内部制御）
文章は以下の文体傾向で作成する：${styleType}
A：体験談寄り
* 少しラフ
* 短文を1つ混ぜる
* 感情を1回入れる
B：説明寄り
* やや整った流れ
* 落ち着いたトーン
C：淡々型
* 短文多め
* 接続詞少なめ
* 感情控えめ

■ 締めタイプ（内部制御）
締めは以下のいずれかのタイプにする：${closingType}
1：断定型（例：おすすめです） 
2：感想型（例：合っている気がします） 
3：継続型（例：もう少し通ってみます） 
4：中立型（例：様子を見てみます）
※同じ締め表現を毎回使用しないこと

■ アンケート回答（この内容のみ使用）
${summary}

■ 出力形式
口コミ本文のみを出力すること。 説明・補足・前置きは一切不要。`;
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
          content: "あなたは整骨院・接骨院のGoogleマップ口コミを書くお客様をサポートするAIです。アンケートに記載されている内容のみを使用し、選択されていない選択肢や入力されていない自由記入欄の内容を追加することは絶対に禁止されています。情報の追加・誇張・脚色は禁止です。口コミ本文のみを出力します。",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.55,
      presence_penalty: 0.3,
      frequency_penalty: 0.2,
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
