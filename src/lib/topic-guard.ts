/**
 * 口コミの「勝手な付け足し」防止用。
 * アンケート回答・補足に出てこない話題を、AIが口コミに書いていないかを判定する。
 *
 * - output: 口コミ本文にこの語があれば「その話題に触れた」とみなす
 * - input : アンケート回答・補足にこの語が1つもなければ「回答にない話題」とみなす
 */
export type TopicGuard = { label: string; output: string[]; input: string[] };

export const TOPIC_GUARDS: TopicGuard[] = [
  {
    label: "院内の雰囲気・清潔さ",
    output: ["雰囲気", "院内", "清潔", "綺麗", "きれい", "リラックス", "居心地"],
    input: ["院内", "清潔", "綺麗", "きれい", "雰囲気", "リラックス", "居心地"],
  },
  {
    label: "スタッフ・受付・衛生士さんの対応",
    output: ["スタッフ", "受付", "衛生士"],
    input: ["スタッフ", "受付", "衛生士"],
  },
  {
    label: "待ち時間・予約",
    output: ["待ち時間", "予約", "待たされ", "待たず"],
    input: ["待ち", "予約", "待た", "当日"],
  },
  {
    label: "費用・料金",
    output: ["費用", "料金", "値段", "金額"],
    input: ["費用", "料金", "値段", "金額", "お金"],
  },
  {
    label: "アクセス・立地・駐車場",
    output: ["アクセス", "駅から", "駐車場", "通いやすい"],
    input: ["アクセス", "駅", "駐車", "通いやす", "近"],
  },
  {
    label: "治療中の声かけ・気遣い",
    output: ["声をかけ", "声かけ", "気遣"],
    input: ["声", "気遣", "親身"],
  },
];

/** アンケート回答・補足に出てこない話題のラベル一覧 */
export function topicsNotInSource(sourceText: string): string[] {
  return TOPIC_GUARDS.filter((t) => !t.input.some((w) => sourceText.includes(w))).map(
    (t) => t.label
  );
}

/** 口コミ本文が、回答にない話題に触れていればそのラベル一覧を返す */
export function findUnmentionedTopics(text: string, sourceText: string): string[] {
  return TOPIC_GUARDS.filter(
    (t) =>
      t.output.some((w) => text.includes(w)) && !t.input.some((w) => sourceText.includes(w))
  ).map((t) => t.label);
}
