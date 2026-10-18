/**
 * 口コミ生成：全業種共通プロンプト
 * - 選択肢は最大3項目まで（優先項目は必ず残す）/ 自由記入は全て含める
 * - ルールは「守ること」と「自然な日本語のコツ」に絞り、矛盾をなくす
 */

import { OTHER_OPTION_LABEL } from "@/lib/other-option-label";

const STYLE_TYPES = [
  "体験談寄り（少しくだけた丁寧語。短い一文を1つ混ぜる）",
  "説明寄り（落ち着いた丁寧語で、流れよく書く）",
  "淡々型（短めの文を重ねる。接続詞と感情表現は控えめ）",
] as const;

/**
 * 締めのタイプ。実際の歯科の口コミでよく見る終わり方だけにしている。
 * ※ ここに書いた例文はAIがそのまま真似するので、不自然な例は絶対に入れないこと
 *   （以前「〜という印象です」「少しホッとしました」を例にしたら、そのまま多用された）
 */
const CLOSING_TYPES = [
  "体験の事実でそのまま終える（例：〜気づいたら終わっていました。／〜説明してもらえました。）",
  "短い感想で終える（例：〜助かりました。／〜よかったです。／〜安心しました。）",
  "お礼で終える（例：〜ありがとうございました。）",
] as const;

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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 選択肢を最大3カテゴリに絞って要約を組み立てる
 * （渡すデータ自体を制限してモデルに全部盛りさせない）
 * - requiredIds に指定したカテゴリ（例：受けた治療）は回答があれば必ず残す
 *   → 「治療名が抜けて気持ちだけ残る」ような、文脈のつながらない組み合わせを防ぐ
 * - 「その他（自由入力）」というラベル自体はプロンプトに渡さない（自由入力の中身だけ渡す）
 */
export function buildSummaryWithMax3Categories(
  answers: Record<string, string[]>,
  otherInputs: Record<string, string>,
  labels: Record<string, string>,
  freeText: string,
  requiredIds: string[] = []
): string {
  const cleanValues = (id: string): string[] => {
    const vals = (answers[id] ?? []).filter((v) => v !== OTHER_OPTION_LABEL);
    const other = otherInputs[id]?.trim();
    if (other) vals.push(other);
    return vals;
  };

  const idsWithContent = Object.keys(answers).filter((id) => cleanValues(id).length > 0);
  const required = requiredIds.filter((id) => idsWithContent.includes(id));
  const rest = shuffle(idsWithContent.filter((id) => !required.includes(id)));
  const limitedIds = [...required, ...rest].slice(0, 3);

  // 質問の並び順（labels の定義順）に戻して、話の流れを作りやすくする
  const order = Object.keys(labels);
  limitedIds.sort((a, b) => order.indexOf(a) - order.indexOf(b));

  let summary = "";
  for (const id of limitedIds) {
    summary += `【${labels[id] || id}】${cleanValues(id).join("、")}\n`;
  }
  const extra = freeText?.trim();
  if (extra) summary += `【補足】${extra}\n`;
  return summary;
}

/** 締めの念押し（星1〜3は締めタイプを使わないので空） */
export function getClosingReminder(
  closingType: string,
  satisfaction: Satisfaction = null
): string {
  if (isLowScoreSatisfaction(satisfaction)) return "";
  return `終わり方は「${closingType}」。「おすすめです」などの宣伝っぽい締めにはしない。`;
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

  const emojiRule = lowScore
    ? "* 絵文字と「！」は使わない"
    : "* 絵文字（😊など）や「！」は、気持ちが自然に乗る箇所があれば1つだけ入れてよい。無理に入れなくてよい";

  const highScoreBlock = highScore
    ? `
■ 星4〜5のとき
* 前向きなトーンで書く。否定的な言葉は混ぜない
* 「おすすめ」「また行きたい」「今後も通いたい」は、回答か【補足】にある場合だけ使う`
    : "";

  const lowScoreBlock = lowScore
    ? `
■ 星1〜3のとき（厳守）
* ニュートラルなトーンで書く。持ち上げすぎも、批判しすぎもしない
* 気になった点が回答や【補足】にあれば、事実として短く書く
* 再来・通院継続には触れない（「また来たい」「通いたい」「今後もお願いしたい」など、似た表現も不可）
* 「最高」「大満足」「素晴らしい」「おすすめ」などの強い褒め言葉は使わない
* 「もう少し〜だと良い」「期待しています」などの改善提案・要望は、【補足】にない限り書かない
* 総評で締めない（「全体的に」「全体として」「総合的に」も不可）。体験の一場面で終えてよい
* 書き方の目安：来院の理由や状況 → 体験・印象 → 気になった点（あれば）`
    : "";

  const closingLine = lowScore
    ? "* 終わり方：結論やまとめを書かず、体験や印象のところで自然に終える"
    : `* 終わり方：${closingType}`;

  return `■ 守ること（最優先）
* 下の「アンケート回答」と【補足】に書かれた内容だけを使う
* 書かれていないこと（待ち時間、スタッフの対応、雰囲気など）を足さない。盛らない
* 【補足】の内容は趣旨を変えずに必ず入れる（お客さんが一番伝えたいことなので）
* 回答にある地名・固有名詞は残す
* 患者さん本人の目線で書く（医院やお店を主語にしない）

■ 自然な日本語にするコツ
* Googleマップに実際に投稿される口コミのように、普通の人が書く普通の文章にする
* 長さは80〜150文字くらい。短くて自然なら80文字未満でもよい（長くても200文字まで）
* 回答の言葉をそのまま並べない。自分の言葉に言い換えてつなげる（例：「説明がわかりやすかった」→「説明がわかりやすくて」）
* 文末が「〜でした」「〜ました」ばかり続かないよう、「〜です」「〜てくれて」「〜助かりました」なども混ぜる
* 「また、」「さらに、」「そして、」を並べない。話の流れでつなぐ
* 翻訳調・作文調の言い回しは避ける（「〜することができました」「〜という経験でした」「非常に」「大変満足」など）
* これから来院する人が読む口コミとして書く。日記や独り言（「こんな風に終わるんだ」など）にしない
* 自分の体験を「〜と思います」「〜という印象です」とぼかさない。体験したことはそのまま言い切る
* きれいにまとめすぎない。最後を総括や宣伝で締めない
* 改行は0〜1回。なくてもよい
${emojiRule}

■ 今回の書きぶり
* 文体：${styleType}
${closingLine}
${highScoreBlock}
${lowScoreBlock}`;
}

export function getCommonOutputFormat(satisfaction: Satisfaction = null): string {
  const emoji = isLowScoreSatisfaction(satisfaction)
    ? "絵文字と「！」は使わない。"
    : "絵文字や「！」は入れても1つまで。";
  return `■ 出力
口コミ本文だけを出力する（前置き・説明・カギカッコは不要）。${emoji}`;
}
