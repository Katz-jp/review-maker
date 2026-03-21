/**
 * 口コミ生成：全業種共通プロンプト
 * - 選択肢は最大3項目まで / 自由記入は全て含める
 * - 文章ルール・AIっぽさ回避・文体揺らぎ・締めタイプ
 */

const STYLE_TYPES = ["A：体験談寄り", "B：説明寄り", "C：淡々型"] as const;
const CLOSING_TYPES = ["1：断定型", "2：感想型", "3：継続型"] as const;

export type Satisfaction = number | null;

export function parseSatisfactionFromOtherInputs(
  otherInputs: Record<string, string>
): Satisfaction {
  const raw = otherInputs.__satisfaction;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function isLowScoreSatisfaction(satisfaction: Satisfaction): boolean {
  return satisfaction !== null && satisfaction <= 3;
}

export function isHighScoreSatisfaction(satisfaction: Satisfaction): boolean {
  return satisfaction !== null && satisfaction >= 4;
}

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

const RESTAURANT_ALWAYS_IDS = ["orderedMenu", "scene", "returnIntent"] as const;

/** 飲食店：注文メニュー・利用シーン・再来意向は毎回必ず要約に含める。④は満足度で分岐 */
export function buildRestaurantSurveySummary(
  answers: Record<string, string[]>,
  otherInputs: Record<string, string>,
  labels: Record<string, string>,
  freeText: string,
  satisfaction: Satisfaction
): string {
  let summary = "";

  for (const id of RESTAURANT_ALWAYS_IDS) {
    const vals = answers[id] ?? [];
    const parts = [...vals];
    if (otherInputs[id]) parts.push(otherInputs[id]);
    if (parts.length) summary += `【${labels[id] || id}】${parts.join("、")}\n`;
  }

  const branchId =
    satisfaction !== null && satisfaction >= 4 ? "goodPoints" : "concerns";
  const bVals = answers[branchId] ?? [];
  const bParts = [...bVals];
  if (otherInputs[branchId]) bParts.push(otherInputs[branchId]);
  if (bParts.length) summary += `【${labels[branchId] || branchId}】${bParts.join("、")}\n`;

  if (freeText) summary += `【補足】${freeText}\n`;
  return summary;
}

/** 締めの指示をアンケート直前で強調（「おすすめしたい」禁止・今回の締めタイプを明示） */
export function getClosingReminder(
  closingType: string,
  satisfaction: Satisfaction = null
): string {
  if (isLowScoreSatisfaction(satisfaction)) return "";
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
export function getCommonRulesForUserPrompt(
  styleType: string,
  closingType: string,
  satisfaction: Satisfaction = null
): string {
  const lowScore = isLowScoreSatisfaction(satisfaction);
  const highScore = isHighScoreSatisfaction(satisfaction);

  const mustEmojiOrBang = lowScore
    ? "* 絵文字（😊など）や「！」は使わないこと\n"
    : "* 【必須】絵文字（😊など）か「！」を必ず1つ以上含めること。改行を1〜2箇所入れること。\n";

  const highScoreBlock = highScore
    ? `\n■ 追加ルール（満足度が星4〜5のとき：厳守）
* 全体のトーンは前向き（ポジティブ）にする
* 文章のどこかに「おすすめ」を必ず含める（例：「おすすめです」「おすすめしたい」など）
* 文章のどこかに「再来・継続利用」系のコメントを必ず1つ入れる（例：「また行きたい」「今後も通いたい」など）
* 否定表現（例：「おすすめしない」「また行きたいとは思わない」など）を混ぜない
※ 上記2つは文末でなくてもOK。ただし不自然な押し付けや宣伝口調にはしない`
    : "";

  const lowScoreBlock = lowScore
    ? `\n■ 追加ルール（満足度が星1〜3のとき：厳守）
* 全体のトーンはニュートラル（中立）にする。過度にポジティブにもネガティブにも寄せない
* 不満や気になった点がアンケートや自由記入で言及されている場合は、その内容を淡々と事実ベースで簡潔にまとめる
* 今後の通院・再来・継続利用については決して書かない（示唆も含めない）
* 強いポジティブ表現（「最高」「大満足」「素晴らしい」「おすすめ」等）は使わない
* 「全体的に」「全体として」「総合的に」などの“総評っぽい締め”を書かない
* 「もう少し〜だと良い」「改善されると良い」「期待しています」などの改善提案・要望は、自由記入に明示されていない限り書かない

■ 星1〜3のときの文章構造（目安）
文章は次の構造で書くこと（きっちり守る必要はない。自然な短文でOK）：
1文目：来店・来院理由（目的）または状況
2文目：体験や印象（ニュートラル）
3文目：気になった点（アンケートや自由記入にある場合のみ）
※ まとめや結論を書く必要はない

■ 再来・通院に関する禁止表現
次の意味を含む表現は禁止（これらに類する表現も含めないこと）：
- また来たい
- また伺いたい
- また相談したい
- 通いたい
- また通いたい
- これからも通いたい
- 今後もお願いしたい
- また行こうと思う

■ 絵文字・感嘆符に関するルール（星1〜3のとき）
* 今回は絵文字（😊など）は一切使わないこと
* 「！」も使用しないこと（文末を無理に強くしない）`
    : "";

  const closingRules = lowScore
    ? `\n■ 締め（星1〜3のとき）
* 締めタイプは固定しない
* 結論で締めない（余韻で終わってよい）
* 「また行きたい」「これからも通いたい」「今後もお願いしたい」などの再来を示す締めは禁止`
    : `\n■ 締めタイプ（内部制御）
締めは以下のいずれかのタイプにする：${closingType}
1：断定型（例：おすすめです）
2：感想型（例：合っている気がします）
3：継続型（例：もう少し通ってみます）
※同じ締め表現を毎回使用しないこと`;

  return `■ 最重要ルール（厳守）
* ※以下「アンケート回答」に書かれている選択肢のみ使用すること。そこにない項目は使わない（最大3項目のみ渡している）
* 選択されていない選択肢の内容を追加してはいけない
* 自由記入欄に書かれていない内容を推測して追加してはいけない
* プレースホルダーや例文から内容を引っ張ってはいけない
* 情報の追加・誇張・脚色は禁止
* 【自由記入】自由記入欄（【補足】）に書かれた内容は、趣旨を崩さずすべて口コミに含める（お客さんの言いたいことなので省略しない）
${mustEmojiOrBang}

■ 文章ルール
* 200〜280文字程度（厳密でなくてよい）
* 回答に含まれる語句（地名・固有名詞など）は削除しないこと
* 感情表現は1回まで
${lowScore ? "* 絵文字（😊など）や「！」は使わないこと\n" : "* 絵文字（😊など）か「！」を少なくとも1つは入れること（自然な範囲で）\n"}
* 文章はお客様本人の視点で書くこと
* 「この店は〜」「こちらの〜は」と店を主語にしないこと
${lowScore ? "* 改行は必須ではない（0〜2箇所で自然な範囲でよい）\n" : "* 適宜改行を入れること（1〜2箇所でよい。読みやすく自然な印象になる）\n"}

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

${closingRules}
${highScoreBlock}
${lowScoreBlock}`;
}

export function getCommonOutputFormat(satisfaction: Satisfaction = null): string {
  if (isLowScoreSatisfaction(satisfaction)) {
    return "■ 出力形式\n口コミ本文のみを出力すること。説明・補足・前置きは一切不要。\n※絵文字（😊など）や「！」は使わない。改行は必須ではない（0〜2箇所で自然な範囲）。";
  }
  return "■ 出力形式\n口コミ本文のみを出力すること。説明・補足・前置きは一切不要。\n※必ず絵文字（😊など）か「！」を1つ以上入れ、1〜2箇所改行すること。";
}
