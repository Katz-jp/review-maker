import {
  pickStyleAndClosing,
  getCommonRulesForUserPrompt,
  buildSummaryWithMax3Categories,
  getClosingReminder,
  getCommonOutputFormat,
  parseSatisfactionFromOtherInputs,
} from "@/lib/prompts/common";
import type { IndustryConfig } from "./types";

const DENTAL_ROLE =
  "あなたは歯科クリニックのGoogleマップ口コミを書くお客様をサポートするAIです。以下のアンケート回答のみをもとに、口コミの下書きを1つ生成してください。";

const DENTAL_NOTICE = `■ 歯科特有の注意
* 治療効果・改善を断定しない
* 「痛くなかった」「怖くなかった」などの安心感の表現はOKだが、医療効果の保証はしない
* 医療広告ガイドラインを意識する
* 誇張・脚色しない
* 一般的な歯科の特徴を勝手に補完してはいけない`;

export const dentalConfig: IndustryConfig = {
  questions: [
    {
      id: "change",
      label: "治療後の印象",
      options: [
        "痛みが楽になった",
        "噛みやすくなった",
        "見た目がきれいになった",
        "気になっていたところが改善した",
        "不安が減った・安心できた",
        "通院しやすくなった",
        "その他",
      ],
    },
    {
      id: "symptom",
      label: "悩み・症状",
      options: [
        "歯が痛い・しみる",
        "噛むと痛い",
        "詰めもの・被せものが気になる",
        "歯並び・かみ合わせが気になる",
        "見た目（色・形）が気になる",
        "歯ぐきからの出血・腫れ",
        "口臭が気になる",
        "定期検診・メンテナンス",
        "その他",
      ],
    },
    {
      id: "treatment",
      label: "受けた治療",
      options: [
        "虫歯の治療",
        "定期クリーニング・検診",
        "詰めもの・被せもの（銀歯・セラミック）",
        "親知らず",
        "矯正",
        "インプラント",
        "小児歯科",
        "ホワイトニング",
        "入れ歯",
        "その他",
      ],
    },
    {
      id: "visitCount",
      label: "来院回数",
      multiSelect: false,
      options: ["今回が初めて", "2〜3回目", "4回以上通っている"],
    },
    {
      id: "atmosphere",
      label: "雰囲気・対応",
      options: [
        "院内が清潔",
        "説明がわかりやすい",
        "痛みに配慮してくれる",
        "安心できる先生",
        "スタッフが親切",
        "受付の対応が良い",
        "落ち着く雰囲気",
        "予約が取りやすい・待ち時間が少ない",
        "通いやすい場所",
        "その他",
      ],
    },
    {
      id: "recommend",
      label: "おすすめしたい人",
      options: [
        "歯医者が苦手な人",
        "丁寧に説明してほしい人",
        "できるだけ痛みを抑えたい人",
        "子どもの歯医者さんを探している人",
        "見た目（白い歯・歯並び）をきれいにしたい人",
        "仕事や育児で忙しい人",
        "近くに通いやすい歯医者を探している人",
        "その他",
      ],
    },
  ],

  buildPrompt(answers, otherInputs, freeText) {
    const satisfaction = parseSatisfactionFromOtherInputs(otherInputs);
    const isHighScore = satisfaction !== null && satisfaction >= 4;
    const labels: Record<string, string> = {
      change: "治療後の印象",
      symptom: "悩み・症状",
      treatment: "受けた治療",
      visitCount: "来院回数",
      atmosphere: "雰囲気・対応",
      recommend: "おすすめしたい人",
    };

    const answersForSummary =
      satisfaction !== null && satisfaction <= 3
        ? Object.fromEntries(
            Object.entries(answers).filter(([key]) => key !== "recommend")
          )
        : answers;
    const otherInputsForSummary =
      satisfaction !== null && satisfaction <= 3
        ? Object.fromEntries(
            Object.entries(otherInputs).filter(([key]) => key !== "recommend")
          )
        : otherInputs;

    const summary = buildSummaryWithMax3Categories(
      answersForSummary,
      otherInputsForSummary,
      labels,
      freeText
    );

    const recommendVals = answers.recommend ?? [];
    const freeHasNegativeOsusume =
      (freeText?.includes("おすすめしない") ?? false) ||
      (freeText?.includes("おすすめできない") ?? false) ||
      (freeText?.includes("あまりおすすめしない") ?? false);

    const allowOsusume =
      !freeHasNegativeOsusume &&
      (recommendVals.some(
        (v) =>
          v.includes("おすすめしたい") ||
          v.includes("人に勧めたい") ||
          v.includes("紹介したい")
      ) ||
        (freeText?.includes("おすすめです") ?? false) ||
        (freeText?.includes("おすすめしたい") ?? false));

    const { styleType, closingType } = pickStyleAndClosing();
    const commonRules = getCommonRulesForUserPrompt(styleType, closingType, satisfaction);
    const closingReminder = getClosingReminder(closingType, satisfaction);
    const outputFormat = getCommonOutputFormat(satisfaction);

    const wordingGuards = `■ 文言の制約（厳守）
* 満足度が星1〜3の場合は、「おすすめ」「おすすめしたい」「人に勧めたい」「他の方にも〜してほしい」等の“おすすめ系”の言い回しを勝手に入れない（自由記入で書かれている場合は可）
* アンケート回答と【補足】に書かれていない要素（例：待ち時間、説明の丁寧さ、スタッフの対応、予約の取りやすさ、雰囲気など）について、新しく評価や意見を追加しないこと
* 特に「もう少し〜であればよかった」「改善されると良い」「期待しています」など、改善提案や期待に関する文は、自由記入に明示的に書かれていない場合は書かないこと
${!isHighScore && !allowOsusume ? "* 今回は「おすすめ」系の表現は一切使わない\n" : ""}`;

    return `${DENTAL_ROLE}

${DENTAL_NOTICE}

${commonRules}

${closingReminder}

${wordingGuards}

■ 出力前チェック
以下をすべて満たしているか自分で確認すること：
* 満足度が星1〜3の場合：
  - 再来や通院継続について書いていない
  - 強いポジティブ表現（「とても満足」「最高」「おすすめ」など）が含まれていない
  - 「おすすめ」「人に勧めたい」等のおすすめ表現が含まれていない
  - 結論として「また行きたい」「これからも通いたい」などで締めていない
条件に違反している場合は、自分で書き直してから最終的な口コミ本文のみを出力すること。

■ アンケート回答（この内容のみ使用。ここに書かれている選択肢だけを口コミに反映する）
${summary}

【最終確認】文体は「${styleType}」、締めは「${closingType}」で書くこと。

${outputFormat}`;
  },

  systemMessage:
    "あなたは歯科クリニックのGoogleマップ口コミを書くお客様をサポートするAIです。選択肢は最大3つまで使用、自由記入はすべて含める。記載のない内容の追加・誇張は禁止。治療効果の断定や保証表現は使わない。口コミ本文のみ出力します。満足度が星1〜3の場合は、絵文字（😊など）や「！」は使わず、トーンはニュートラル（中立）にしてください。共通ルールよりも、この歯科向け指示を優先します。",
};

