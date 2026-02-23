import {
  pickStyleAndClosing,
  getCommonRulesForUserPrompt,
  buildSummaryWithMax3Categories,
  getClosingReminder,
  COMMON_OUTPUT_FORMAT,
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
      id: "symptom",
      label: "悩み・症状",
      options: [
        "腰痛",
        "肩こり",
        "首の痛み",
        "産後ケア",
        "猫背",
        "膝の痛み",
        "その他",
      ],
    },
    {
      id: "menu",
      label: "受けたメニュー",
      options: [
        "骨盤矯正",
        "猫背矯正",
        "整体",
        "マッサージ",
        "ストレッチ",
        "産後骨盤矯正",
        "その他",
      ],
    },
    {
      id: "change",
      label: "施術後の変化",
      options: [
        "痛みが消えた",
        "体が軽くなった",
        "姿勢が良くなった",
        "動きやすくなった",
        "リラックスできた",
        "その他",
      ],
    },
    {
      id: "atmosphere",
      label: "院の雰囲気",
      options: [
        "清潔感がある",
        "説明が丁寧",
        "アットホーム",
        "予約が取りやすい",
        "駐車場がある",
        "その他",
      ],
    },
    {
      id: "recommend",
      label: "おすすめしたい人",
      options: [
        "信頼できる先生を探している方",
        "産後の方",
        "デスクワークの方",
        "スポーツをしている人",
        "姿勢が気になる方",
        "その他",
      ],
    },
  ],
  buildPrompt(answers, otherInputs, freeText) {
    const labels: Record<string, string> = {
      symptom: "悩み・症状",
      menu: "受けたメニュー",
      change: "施術後の変化",
      atmosphere: "院の雰囲気",
      recommend: "おすすめしたい人",
    };

    const summary = buildSummaryWithMax3Categories(answers, otherInputs, labels, freeText);
    const { styleType, closingType } = pickStyleAndClosing();
    const commonRules = getCommonRulesForUserPrompt(styleType, closingType);
    const closingReminder = getClosingReminder(closingType);

    return `${SEIKOTSU_ROLE}

${SEIKOTSU_NOTICE}

${commonRules}

${closingReminder}

■ アンケート回答（この内容のみ使用。ここに書かれている選択肢だけを口コミに反映する）
${summary}

${COMMON_OUTPUT_FORMAT}`;
  },
  systemMessage:
    "あなたは整骨院・接骨院のGoogleマップ口コミを書くお客様をサポートするAIです。選択肢は最大3つまで使用、自由記入はすべて含める。記載のない内容の追加・誇張は禁止。口コミ本文のみ出力します。",
};
