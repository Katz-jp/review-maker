import {
  pickStyleAndClosing,
  getCommonRulesForUserPrompt,
  buildSummaryWithMax3Categories,
  getClosingReminder,
  getCommonOutputFormat,
  parseSatisfactionFromOtherInputs,
} from "@/lib/prompts/common";
import { OTHER_OPTION_LABEL } from "@/lib/other-option-label";
import { topicsNotInSource } from "@/lib/topic-guard";
import type { IndustryConfig } from "./types";

const DENTAL_ROLE =
  "あなたは歯科クリニックのGoogleマップ口コミを書く患者様をサポートするAIです。以下のアンケート回答のみをもとに、口コミの下書きを1つ生成してください。";

const DENTAL_NOTICE = `■ 歯科特有の注意
* 治療効果・改善を断定しない
* 「痛くなかった」「怖くなかった」などの安心感の表現はOKだが、医療効果の保証はしない
* 医療広告ガイドラインを意識する
* 誇張・脚色しない
* 一般的な歯科の特徴を勝手に補完してはいけない`;

const DENTAL_BANNED_PHRASES = `■ 使わない言い回し（実際の口コミではまず見かけない、AIっぽい表現）
* 「全体的に」「全体として」「総合的に」
* 「また何かあれば」「また何かございましたら」
* 「安心感がありました」→「安心しました」「安心できました」にする
* 「少し緊張しました」→「緊張していましたが」にする
* 「次回もどうなるか」「今後どうなるか気になる」
* 「リラックスできる雰囲気」「リラックスして治療を受けられた」
* 「〜な経験でした」「〜な体験でした」（総括っぽくなるため）
* 「〜という印象です」「〜という印象でした」「良い印象を持ちました」「良い印象でした」
* 「〜することができました」「〜終えることができ」→「〜できました」「〜終わりました」にする
* 「無事に終わってほっとしています」→「無事に終わってよかったです」にする
* 「〜できたと思います」（自分の体験をぼかさない）
* 「こんな風に〜んだ」などの独り言
* 「思っていたより」「思ったより」は使ってよいが、1回まで`;

const FEW_SHOT_EXAMPLES = `■ 参考例文（実際に投稿された口コミ。文体・長さ・自然な終わり方の参考にすること）
※ これらは文体の参考です。内容をそのまま使わないこと。アンケート回答に基づいて書くこと。

【書き出しのルール】
* 実際の口コミは「治療名」や「来院状況」から直接始まるものが多い
* 例：「虫歯の治療で〜」「クリーニングで初診〜」「矯正で通っています〜」「急に痛くなり〜」
* 来院経緯の説明を冒頭に長々と入れない
* 「〜で来院しました」「〜で初めて伺いました」などの定型句で始めない
* 1文目から体験・状況に入ってよい

【急に痛くなって来院】
渋谷で仕事中に突然我慢できない痛さが走ったので、急遽連絡しました。連絡してから2〜3時間後には診てもらえることになり助かりました。院長先生は慎重に歯を見ながら過去の状態を詳しく聞いてくれて、一番確実な治療を提案してくださいました。麻酔の痛さが苦手で心配でしたが、痛みどころか感覚もなく、気づいたら終わっていました。

【歯医者が苦手・怖かった】
歯医者さんが今まで怖かったですが、説明もとても丁寧でわかりやすく、痛みもなく、ここなら通えそうです。

院内はとても清潔感があり、スタッフの皆さんも丁寧で安心して通えました。治療前にしっかりと説明してくださるので不安なくお任せでき、これまで苦手だった歯医者のイメージが変わりました。

【以前から気になっていた・矯正】
以前から歯並びが気になっており、受診しました。どんな矯正が自分に合っているのか相談したところ、丁寧に説明してもらい、治療方法を紹介していただきました。歯型を取ってもらい装着方法も親切に教えていただき、徐々に理想の歯並びに近づいています。

【紹介・初めて・ホワイトニング】
友人の紹介で初めてオフィスホワイトニングを受けました。初めてだったので丁寧に説明してくださり、治療中も心配して声をかけてくださいました。スタッフの皆さんも親切でとてもよかったです。

【他院でうまくいかず転院】
他の歯医者でやってもらった治療がうまくいかず、こちらで相談しました。話をじっくり聞いてくれて時間もゆっくりとって下さり、安心してお任せできました。その後のメンテナンスや処置も説明があり、安心しました。

【定期通院】
治療の選択肢や費用などを丁寧に説明して下さり、安心してお任せできました。ベビーカーの子連れでも快く迎えて下さるので助かっています。

【クリーニング・初診】
クリーニングで初診来院しました。歯科衛生士さんのクリーニングも丁寧に行なっていただき、雰囲気も穏やかでとても居心地が良かったです。今後の自宅でのケアなども教えていただけました。`;

export const dentalConfig: IndustryConfig = {
  questions: [
    {
      id: "treatment",
      label: "受けた治療",
      multiSelect: true,
      options: [
        "虫歯の治療",
        "定期クリーニング・検診",
        "詰めもの・被せもの（銀歯・セラミック）",
        "親知らずの抜歯",
        "矯正（インビザライン・ワイヤー）",
        "インプラント",
        "ホワイトニング",
        "歯周病・歯ぐきの治療",
        "小児歯科",
        "入れ歯",
        OTHER_OPTION_LABEL,
      ],
    },
    {
      id: "context",
      label: "来院のきっかけ",
      multiSelect: false,
      options: [
        "急に痛くなって",
        "以前から気になっていて",
        "定期的に通っている",
        "知人・家族に紹介された",
        "ネット・口コミで見つけた",
        "他の歯医者でうまくいかなくて",
        OTHER_OPTION_LABEL,
      ],
    },
    {
      id: "before",
      label: "来院前の気持ち",
      multiSelect: true,
      options: [
        "歯医者が苦手・怖かった",
        "ずっと放置していた",
        "初めてで緊張していた",
        "費用が心配だった",
        "他院での治療がうまくいかなかった",
        "特に不安はなかった",
        OTHER_OPTION_LABEL,
      ],
    },
    {
      id: "experience",
      label: "実際の体験",
      multiSelect: true,
      options: [
        "痛みがほとんどなかった",
        "説明がわかりやすかった",
        "丁寧に対応してもらえた",
        "院内が清潔・綺麗だった",
        "不安や疑問に親身に答えてもらえた",
        "治療の選択肢を提示してもらえた",
        "予約が取りやすかった・待ち時間が少なかった",
        "アクセスが良くて通いやすかった",
        OTHER_OPTION_LABEL,
      ],
    },
    {
      id: "result",
      label: "治療後の感想・変化",
      multiSelect: true,
      options: [
        "ほぼ痛みなく治療できた",
        "治療がスムーズに終わった",
        "見た目・歯並びの気になっていた部分が改善した",
        "不安や怖さが和らいだ",
        "歯医者へのイメージが変わった",
        OTHER_OPTION_LABEL,
      ],
    },
    {
      id: "visitCount",
      label: "通院歴",
      multiSelect: false,
      options: [
        "今回が初めて",
        "数回通っている（治療中）",
        "半年〜1年ほど通っている",
        "1年以上通っている",
        "定期検診で長く通っている",
      ],
    },
  ],

  buildPrompt(answers, otherInputs, freeText) {
    const satisfaction = parseSatisfactionFromOtherInputs(otherInputs);
    const isHighScore = satisfaction !== null && satisfaction >= 4;
    const labels: Record<string, string> = {
      treatment: "受けた治療",
      context: "来院のきっかけ",
      before: "来院前の気持ち",
      experience: "実際の体験",
      result: "治療後の感想・変化",
      visitCount: "通院歴",
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
      freeText,
      ["treatment"]
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

    const osusumeGuard =
      !isHighScore && !allowOsusume
        ? "\n* 今回は「おすすめ」「人に勧めたい」などのおすすめ系の表現は使わない"
        : "";

    // 回答にない話題を明示して、参考例文などからの付け足しを防ぐ
    const missingTopics = topicsNotInSource(summary);
    const doNotWriteBlock = missingTopics.length
      ? `\n■ 今回は書かないこと（アンケートに回答がないため。参考例文にあっても書かない）\n${missingTopics
          .map((t) => `* ${t}`)
          .join("\n")}\n`
      : "";

    const satisfactionLine =
      satisfaction !== null ? `■ 満足度\n星${satisfaction}（5段階）\n` : "";

    return `${DENTAL_ROLE}

${DENTAL_NOTICE}

${commonRules}${osusumeGuard}

${DENTAL_BANNED_PHRASES}

${FEW_SHOT_EXAMPLES}

${satisfactionLine}
■ アンケート回答（この内容だけを使う）
${summary}${doNotWriteBlock}
${closingReminder}

${outputFormat}`;
  },

  systemMessage:
    "あなたは、歯科クリニックに通った患者さんが自分の言葉でGoogleマップに口コミを書くのを手伝うアシスタントです。患者さん本人が書いたような、自然で飾らない日本語の口コミを1つ書きます。アンケートと補足に書かれた内容だけを使い、事実を足したり誇張したりしません。治療効果を断定・保証する表現は使いません。満足度が星1〜3のときは中立的なトーンにし、絵文字と「！」は使いません。口コミ本文だけを出力します。",
};

