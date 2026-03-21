import {
  pickStyleAndClosing,
  getCommonRulesForUserPrompt,
  getClosingReminder,
  getCommonOutputFormat,
  parseSatisfactionFromOtherInputs,
  buildRestaurantSurveySummary,
} from "@/lib/prompts/common";
import type { IndustryConfig } from "./types";

const RESTAURANT_ROLE =
  "あなたは飲食店のGoogleマップ口コミを書くお客様をサポートするAIです。以下のアンケート回答のみをもとに、口コミの下書きを1つ生成してください。";

const RESTAURANT_NOTICE = `■ 飲食店向けの注意
* 食べていない料理の感想を追加しない
* 味・効果の断定や誇張は避ける
* 一般的な店の特徴を勝手に補完してはいけない`;

/** 店舗が customOptions でメニュー一覧を登録する（ベースは「その他」のみ） */
export const RESTAURANT_ORDERED_MENU_QUESTION_ID = "orderedMenu";

/** オーナー画面・API で保存できるメニュー行数の上限 */
export const MAX_RESTAURANT_MENU_OPTIONS = 40;

export const restaurantConfig: IndustryConfig = {
  questions: [
    {
      id: RESTAURANT_ORDERED_MENU_QUESTION_ID,
      label: "ご注文されたメニューを教えてください（複数選択可）",
      options: ["その他"],
    },
    {
      id: "scene",
      label: "今回のご利用シーンを教えてください",
      options: [
        "一人で",
        "友人・知人と",
        "家族で",
        "デート",
        "仕事（会食・接待）",
        "その他",
      ],
    },
    {
      id: "goodPoints",
      label: "特に気に入った点を教えてください（複数選択可）",
      options: [
        "料理が美味しかった",
        "盛り付け・見た目がきれい",
        "接客が良かった",
        "提供スピードがちょうど良い",
        "店内の雰囲気が良かった",
        "コスパが良い",
        "清潔感がある店内",
        "立地・アクセスが良い",
        "メニューが豊富",
        "その他",
      ],
    },
    {
      id: "concerns",
      label: "気になった点を教えてください（複数選択可）",
      options: [
        "料理の味",
        "提供までの時間",
        "接客",
        "注文内容の正確さ",
        "店内の清潔感",
        "混雑・騒音",
        "価格",
        "量（多い／少ない）",
        "メニューの分かりやすさ",
        "その他",
        "特にない",
      ],
    },
    {
      id: "returnIntent",
      label: "当店にまた来たいと思いますか？",
      options: ["ぜひ来たい", "機会があれば来たい", "あまり思わない", "来ないと思う"],
      multiSelect: false,
    },
  ],
  buildPrompt(answers, otherInputs, freeText) {
    const satisfaction = parseSatisfactionFromOtherInputs(otherInputs);
    const labels: Record<string, string> = {
      [RESTAURANT_ORDERED_MENU_QUESTION_ID]: "注文メニュー",
      scene: "利用シーン",
      goodPoints: "良かった点",
      concerns: "気になった点",
      returnIntent: "再来意向",
    };

    const summary = buildRestaurantSurveySummary(
      answers,
      otherInputs,
      labels,
      freeText,
      satisfaction
    );
    const { styleType, closingType } = pickStyleAndClosing();
    const commonRules = getCommonRulesForUserPrompt(styleType, closingType, satisfaction);
    const closingReminder = getClosingReminder(closingType, satisfaction);
    const outputFormat = getCommonOutputFormat(satisfaction);

    return `${RESTAURANT_ROLE}

${RESTAURANT_NOTICE}

■ 飲食店向けの補足（厳守）
* 以下「アンケート回答」に記載の【】付き項目はすべて口コミに反映すること（省略・要約しすぎで落とさない）
* 「最大3項目のみ」という制限は飲食店では適用しない

${commonRules}

${closingReminder}

■ アンケート回答（この内容のみ使用。ここに書かれている選択肢だけを口コミに反映する）
${summary}

${outputFormat}
【最終確認】文体は「${styleType}」、締めは「${closingType}」で書くこと。`;
  },
  systemMessage:
    "あなたは飲食店のGoogleマップ口コミを書くお客様をサポートするAIです。アンケートに答えられた項目はすべて口コミに反映する。記載のない内容の追加・誇張は禁止。口コミ本文のみ出力します。原則として絵文字（😊など）か「！」を1つ以上含め、1〜2箇所改行すること（※満足度が星1〜3の場合は、絵文字や「！」を使わず、トーンはニュートラルにし、再来や継続利用に触れない）。",
};
