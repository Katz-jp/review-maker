/**
 * 口コミ生成：全業種共通プロンプト
 * - 選択肢は最大3項目まで / 自由記入は全て含める
 * - 文章ルール・AIっぽさ回避・文体揺らぎ・締めタイプ
 */

const STYLE_TYPES = ["A：体験談寄り", "B：説明寄り", "C：淡々型"] as const;
const CLOSING_TYPES = ["1：断定型", "2：感想型", "3：継続型"] as const;

/** 選択肢を最大3カテゴリに絞って要約を組み立てる（渡すデータ自体を制限してモデルに全部盛りさせない） */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildSummaryWithMax3Categories(
  answers: Record<string, string[]>,
  otherInputs: Record<string, string>,
  labels: Record<string, string>,
  freeText: string
): string {
  const idsWithContent = Object.entries(answers)
    .filter(([id, vals]) => vals.length > 0 || otherInputs[id])
    .map(([id]) => id);
  const limitedIds = shuffle(idsWithContent).slice(0, 3);

  let summary = "";
  for (const id of limitedIds) {
    const vals = answers[id] ?? [];
    const parts = [...vals];
    if (otherInputs[id]) parts.push(otherInputs[id]);
    if (parts.length) summary += `【${labels[id] || id}】${parts.join("、")}\n`;
  }
  if (freeText) summary += `【補足】${freeText}\n`;
  return summary;
}

/** 締めの指示をアンケート直前で強調（「おすすめしたい」禁止・今回の締めタイプを明示） */
export function getClosingReminder(closingType: string): string {
  return `【重要】文末は今回の締めタイプ（${closingType}）の例で終えること。「〜おすすめしたい」「〜方におすすめ」で終えること禁止。`;
}

export function pickStyleAndClosing(): {
  styleType: string;
  closingType: string;
} {
  return {
    styleType: STYLE_TYPES[Math.floor(Math.random() * STYLE_TYPES.length)],
    closingType: CLOSING_TYPES[Math.floor(Math.random() * CLOSING_TYPES.length)],
  };
}

/** ユーザープロンプト用の共通ルールブロック（業種の役割・業種注意の後に結合する） */
export function getCommonRulesForUserPrompt(styleType: string, closingType: string): string {
  return `■ 最重要ルール（厳守）
* ※以下「アンケート回答」に書かれている選択肢のみ使用すること。そこにない項目は使わない（最大3項目のみ渡している）
* 選択されていない選択肢の内容を追加してはいけない
* 自由記入欄に書かれていない内容を推測して追加してはいけない
* プレースホルダーや例文から内容を引っ張ってはいけない
* 情報の追加・誇張・脚色は禁止
* 【自由記入】自由記入欄（【補足】）に書かれた内容は、趣旨を崩さずすべて口コミに含める（お客さんの言いたいことなので省略しない）

■ 文章ルール
* 200〜280文字程度（厳密でなくてよい）
* 回答に含まれる語句（地名・固有名詞など）は削除しないこと
* 感情表現は1回まで
* 絵文字は最大1つまで使用可
* 「！」は最大1回まで使用可
* 文中に1回だけ、話し言葉に近いニュアンス（例：ちょっと驚きました、意外でした）を入れてもよい

■ 構成（固定しない）
* 必ずしも時系列や項目の順番通りに書かない
* 自然な流れで並べ替えてよい
* すべてを網羅する必要はない（選択肢は最大3つまでなので）

■ AIっぽさ回避ルール（重要）
* 文章をきれいにまとめすぎないこと
* 完璧な総括で締めないこと
* 宣伝のような文章にしないこと
* 同じ語尾（〜でした／〜ました）を連続させないこと
* 優等生的な作文にしないこと
* 少しだけ余白のある終わり方にすること
* 一文をやや短めにする箇所を1つ含めてもよい
* 多少の曖昧さや主観を残してよい（例：〜かなと思います、〜という印象でした、思っていたより〜）
* 締めは固定しない。締めがなくてもよい。余韻で終わってもよい

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
※同じ締め表現を毎回使用しないこと`;
}

export const COMMON_OUTPUT_FORMAT =
  "■ 出力形式\n口コミ本文のみを出力すること。説明・補足・前置きは一切不要。";
