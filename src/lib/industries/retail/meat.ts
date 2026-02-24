import {
  pickStyleAndClosing,
  getCommonRulesForUserPrompt,
  buildSummaryWithMax3Categories,
  getClosingReminder,
  COMMON_OUTPUT_FORMAT,
} from "@/lib/prompts/common";
import type { IndustryConfig } from "../types";

const MEAT_ROLE =
  "あなたは精肉店のGoogleマップ口コミを書くお客様をサポートするAIです。以下のアンケート回答のみをもとに、口コミの下書きを1つ生成してください。";

const MEAT_NOTICE = `■ 精肉店向けの注意
* 産地・品質・効果の誇張禁止
* 食べていない商品の感想を追加しない
* 「新鮮」「絶品」などの根拠のない最上級表現は控えめに
* 一般的な精肉店の特徴を勝手に補完してはいけない`;

/** 精肉店プリセット */
export const retailMeatConfig: IndustryConfig = {
  questions: [
    {
      id: "product",
      label: "買ったもの",
      options: [
        "牛肉",
        "豚肉",
        "鶏肉",
        "ひき肉",
        "ホルモン",
        "焼肉用",
        "馬肉",
        "味付き肉",
        "ハム・ソーセージ",
        "その他",
      ],
    },
    {
      id: "goodPoints",
      label: "良かった点",
      options: [
        "鮮度が良い",
        "味が良い",
        "価格が手頃",
        "品揃えが豊富",
        "量が多い",
        "カットが丁寧",
        "その他",
      ],
    },
    {
      id: "atmosphere",
      label: "お店の雰囲気",
      options: [
        "清潔感がある",
        "スタッフが親切",
        "説明が丁寧",
        "駐車場がある",
        "その他",
      ],
    },
    {
      id: "purpose",
      label: "用途",
      options: [
        "日常の食事",
        "特別な日・イベント",
        "BBQ",
        "お中元",
        "お歳暮",
        "贈り物",
        "その他",
      ],
    },
    {
      id: "recommend",
      label: "おすすめしたい人",
      options: [
        "品質にこだわる方",
        "コスパ重視の方",
        "地元食材を探している方",
        "贈り物を探している方",
        "料理好きの方",
        "日々の献立に迷っている方",
        "その他",
      ],
    },
  ],
  buildPrompt(answers, otherInputs, freeText) {
    const labels: Record<string, string> = {
      product: "買ったもの",
      goodPoints: "良かった点",
      atmosphere: "お店の雰囲気",
      purpose: "用途",
      recommend: "おすすめしたい人",
    };

    const summary = buildSummaryWithMax3Categories(answers, otherInputs, labels, freeText);
    const { styleType, closingType } = pickStyleAndClosing();
    const commonRules = getCommonRulesForUserPrompt(styleType, closingType);
    const closingReminder = getClosingReminder(closingType);

    return `${MEAT_ROLE}

${MEAT_NOTICE}

${commonRules}

${closingReminder}

■ アンケート回答（この内容のみ使用。ここに書かれている選択肢だけを口コミに反映する）
${summary}

${COMMON_OUTPUT_FORMAT}
【最終確認】文体は「${styleType}」、締めは「${closingType}」で書くこと。`;
  },
  systemMessage:
    "あなたは精肉店のGoogleマップ口コミを書くお客様をサポートするAIです。選択肢は最大3つまで使用、自由記入はすべて含める。記載のない内容の追加・誇張は禁止。口コミ本文のみ出力します。",
};
