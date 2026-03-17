import {
  pickStyleAndClosing,
  getCommonRulesForUserPrompt,
  buildSummaryWithMax3Categories,
  getClosingReminder,
  getCommonOutputFormat,
  parseSatisfactionFromOtherInputs,
} from "@/lib/prompts/common";
import type { IndustryConfig } from "./types";

const SEIKOTSU_ROLE =
  "あなたは整骨院・接骨院のGoogleマップ口コミを書くお客様をサポートするAIです。以下のアンケート回答のみをもとに、口コミの下書きを1つ生成してください。";

const SEIKOTSU_NOTICE = `■ 整骨院特有の注意
* 症状改善を断定しない
* 効果を保証する表現は禁止
* 医療広告ガイドラインを意識する
* 誇張しない
* 一般的な整骨院の特徴を勝手に補完してはいけない`;

export const seikotsuConfig: IndustryConfig = {
  questions: [
    {
      id: "change",
      label: "施術後の感想",
      options: [
        "楽になった",
        "軽く感じた",
        "動きやすくなった",
        "姿勢が整った",
        "すっきり・リラックス",
        "安心できた",
        "その他",
      ],
    },
    {
      id: "symptom",
      label: "悩み・症状",
      options: [
        "腰痛",
        "肩こり",
        "首の痛み",
        "膝の痛み",
        "猫背・姿勢",
        "産後の不調",
        "交通事故後のむちうち",
        "スポーツによる痛み",
        "その他",
      ],
    },
    {
      id: "menu",
      label: "受けたメニュー",
      options: [
        "骨盤矯正",
        "姿勢・猫背矯正",
        "産後骨盤矯正",
        "交通事故対応",
        "筋肉調整",
        "ストレッチ",
        "その他",
      ],
    },
    {
      id: "visitCount",
      label: "今回が初めての来院ですか？",
      options: ["初めて来院した", "2〜3回目", "何度も通っている"],
    },
    {
      id: "atmosphere",
      label: "雰囲気や対応",
      options: [
        "清潔",
        "説明が丁寧",
        "安心感がある",
        "落ち着く",
        "予約しやすい",
        "スタッフが親切",
        "その他",
      ],
    },
    {
      id: "recommend",
      label: "おすすめしたい人",
      options: [
        "安心して通いたい人",
        "産後のケアをしたい人",
        "デスクワークでつらい人",
        "スポーツしてる人",
        "姿勢が気になる人",
        "慢性的な痛みのある人",
        "初めて整骨院に行く人",
        "その他",
      ],
    },
  ],
  buildPrompt(answers, otherInputs, freeText) {
    const satisfaction = parseSatisfactionFromOtherInputs(otherInputs);
    const labels: Record<string, string> = {
      change: "施術後の感想",
      symptom: "悩み・症状",
      menu: "受けたメニュー",
      visitCount: "今回が初めての来院ですか？",
      atmosphere: "雰囲気や対応",
      recommend: "おすすめしたい人",
    };

    const summary = buildSummaryWithMax3Categories(answers, otherInputs, labels, freeText);
    const { styleType, closingType } = pickStyleAndClosing();
    const commonRules = getCommonRulesForUserPrompt(styleType, closingType, satisfaction);
    const closingReminder = getClosingReminder(closingType, satisfaction);
    const outputFormat = getCommonOutputFormat(satisfaction);

    return `${SEIKOTSU_ROLE}

${SEIKOTSU_NOTICE}

${commonRules}

${closingReminder}

■ アンケート回答（この内容のみ使用。ここに書かれている選択肢だけを口コミに反映する）
${summary}

【最終確認】文体は「${styleType}」、締めは「${closingType}」で書くこと。

${outputFormat}`;
  },
  systemMessage:
    "あなたは整骨院・接骨院のGoogleマップ口コミを書くお客様をサポートするAIです。選択肢は最大3つまで使用、自由記入はすべて含める。記載のない内容の追加・誇張は禁止。口コミ本文のみ出力します。原則として絵文字（😊など）か「！」を1つ以上含め、1〜2箇所改行すること（※満足度が星1〜3の場合は、絵文字や「！」を使わず、トーンはニュートラルにし、再来や通院継続に触れない）。",
};
