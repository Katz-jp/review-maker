import {
  pickStyleAndClosing,
  getCommonRulesForUserPrompt,
  getClosingReminder,
  COMMON_OUTPUT_FORMAT,
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

function parseSatisfaction(otherInputs: Record<string, string>): number | null {
  const raw = otherInputs.__satisfaction;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export const dentalConfig: IndustryConfig = {
  questions: [
    {
      id: "treatment",
      label: "来院理由",
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
      id: "impression",
      label: "実際に来院してどうでしたか？",
      options: [
        "治療が丁寧",
        "説明がわかりやすい",
        "痛みが少ない",
        "安心できる先生",
        "無理な治療提案がない",
        "スタッフが親切",
        "受付の対応が良い",
        "院内が清潔",
        "設備がきれい",
        "落ち着く雰囲気",
        "予約が取りやすい",
        "待ち時間が少ない",
        "通いやすい場所",
        "その他",
      ],
    },
    {
      id: "recommend",
      label: "この歯医者をおすすめしたいですか？",
      options: [
        "ぜひおすすめしたい",
        "おすすめできる",
        "どちらとも言えない",
        "あまりおすすめできない",
      ],
    },
    {
      id: "safety",
      label: "この施設は安心して通えると感じましたか？",
      multiSelect: false,
      options: [
        "とても感じた",
        "感じた",
        "どちらとも言えない",
        "あまり感じなかった",
        "感じなかった",
      ],
    },
  ],

  buildPrompt(answers, otherInputs, freeText) {
    const treatmentVals = answers.treatment ?? [];
    const impressionVals = answers.impression ?? [];
    const recommendVals = answers.recommend ?? [];
    const safetyVals = answers.safety ?? [];
    const satisfaction = parseSatisfaction(otherInputs);

    // 「安心」「おすすめ」系の文言は、選択 or 自由記入で触れているときだけ許可する
    const allowAnshin =
      impressionVals.some((v) => v.includes("安心")) ||
      safetyVals.some((v) => v === "とても感じた" || v === "感じた") ||
      (freeText?.includes("安心") ?? false);
    const allowOsusume =
      recommendVals.some((v) => v === "ぜひおすすめしたい" || v === "おすすめできる") ||
      (freeText?.includes("おすすめ") ?? false);

    let summary = "";
    if (treatmentVals.length) {
      const parts = [...treatmentVals];
      if (otherInputs.treatment) parts.push(otherInputs.treatment);
      summary += `【来院理由】${parts.join("、")}\n`;
    }
    if (freeText) {
      summary += `【来院前に困っていたこと】${freeText}\n`;
    }
    if (impressionVals.length) {
      const parts = [...impressionVals];
      if (otherInputs.impression) parts.push(otherInputs.impression);
      summary += `【実際に来院してどうでしたか？】${parts.join("、")}\n`;
    }
    if (recommendVals.length) {
      const parts = [...recommendVals];
      if (otherInputs.recommend) parts.push(otherInputs.recommend);
      summary += `【この歯医者をおすすめしたいですか？】${parts.join("、")}\n`;
    }
    if (safetyVals.length) {
      const parts = [...safetyVals];
      if (otherInputs.safety) parts.push(otherInputs.safety);
      summary += `【この施設は安心して通えると感じましたか？】${parts.join("、")}\n`;
    }
    if (satisfaction !== null) {
      summary += `【満足度（星）】${satisfaction}\n`;
    }

    const { styleType, closingType } = pickStyleAndClosing();
    const commonRules = getCommonRulesForUserPrompt(styleType, closingType);
    const closingReminder = getClosingReminder(closingType);

    const lowScoreRules =
      satisfaction !== null && satisfaction <= 3
        ? `■ 追加ルール（満足度が星1〜3のとき：厳守）
* 「また来たい」「また行きたい」「これからも通いたい」「次回も」など、再訪・継続・今後の利用を示す表現は書かない
* 絵文字（😊など）は一切使わない（代わりに「！」は最低1つ入れる）`
        : "";

    const wordingGuards = `■ 文言の制約（厳守）
* アンケートで選ばれていない限り、「安心」「安心感」「信頼できる」等の“安心系”の言い回しを勝手に入れない（自由記入で書かれている場合は可）
* アンケートで選ばれていない限り、「おすすめ」「おすすめしたい」「人に勧めたい」等の“おすすめ系”の言い回しを勝手に入れない（自由記入で書かれている場合は可）
${allowAnshin ? "" : "* 今回は「安心」系の表現は使わない\n"}${allowOsusume ? "" : "* 今回は「おすすめ」系の表現は使わない\n"}`;

    return `${DENTAL_ROLE}

${DENTAL_NOTICE}

${commonRules}

${closingReminder}

${lowScoreRules}

${wordingGuards}

■ アンケート回答（この内容のみ使用。ここに書かれている選択肢だけを口コミに反映する）
${summary}

【最終確認】文体は「${styleType}」、締めは「${closingType}」で書くこと。

${COMMON_OUTPUT_FORMAT}`;
  },

  systemMessage:
    "あなたは歯科クリニックのGoogleマップ口コミを書くお客様をサポートするAIです。選択肢は最大3つまで使用、自由記入はすべて含める。記載のない内容の追加・誇張は禁止。治療効果の断定や保証表現は使わない。口コミ本文のみ出力します。出力には絵文字（😊など）か「！」を必ず1つ以上含め、1〜2箇所改行すること。",
};
