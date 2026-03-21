import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { industries, getIndustryConfig, type IndustryKey } from "@/lib/industries";

const DEFAULT_INDUSTRY: IndustryKey = "seikotsu";

const BANNED_WORDS_FOR_LOW_SCORE = [
  "また来たい",
  "また伺いたい",
  "また相談したい",
  "通いたい",
  "また通いたい",
  "これからも通いたい",
  "今後もお願いしたい",
  "また行こうと思う",
  "おすすめ",
  "最高",
  "大満足",
  "！",
  "!",
  "素晴らしい",
  "とても満足",
  "安心して通える",
  // 低評価で出がちな“作文っぽい総評/改善提案”のテンプレ表現
  "全体的に",
  "全体として",
  "総合的に",
  "もう少しスムーズ",
  "と良いかなと思います",
  "改善点もあると感じました",
  "改善点もある",
  "期待したいです",
];

const FORBIDDEN_SUMMARY_PHRASES_FOR_LOW_SCORE = [
  "全体的に",
  "全体として",
  "総合的に",
  "もう少しスムーズ",
  "と良いかなと思います",
  "改善点もある",
  "期待したいです",
];

const RECOMMEND_TOKENS_FOR_HIGH_SCORE = ["おすすめ"];

const REVISIT_TOKENS_FOR_HIGH_SCORE = [
  "また行",
  "また来",
  "また伺",
  "次回",
  "次も",
  "今後も",
  "これからも",
  "通いたい",
  "お願いしたい",
];

const NEGATIVE_PHRASES_FOR_HIGH_SCORE = [
  "おすすめしない",
  "おすすめできない",
  "あまりおすすめしない",
  "また行きたいとは思わない",
  "また行きたいと思わない",
  "また来たいとは思わない",
  "また伺いたいとは思わない",
];

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function containsEmoji(text: string): boolean {
  // ES5互換の簡易判定（サロゲートペアを含む＝絵文字等の可能性が高い）
  // 厳密なemoji判定ではないが、低評価時の「絵文字禁止」検知としては十分。
  return /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(text);
}

function containsBang(text: string): boolean {
  return text.includes("!") || text.includes("！");
}

function satisfiesHighScorePolicy(text: string, satisfaction: number): boolean {
  if (satisfaction < 4) return true;
  if (NEGATIVE_PHRASES_FOR_HIGH_SCORE.some((p) => text.includes(p))) return false;
  const hasEmojiOrBang = containsEmoji(text) || containsBang(text);
  const hasRecommend = RECOMMEND_TOKENS_FOR_HIGH_SCORE.some((t) => text.includes(t));
  const hasRevisit = REVISIT_TOKENS_FOR_HIGH_SCORE.some((t) => text.includes(t));
  return hasEmojiOrBang && hasRecommend && hasRevisit;
}

function violatesPolicy(text: string, satisfaction: number): boolean {
  if (satisfaction >= 4) return false;
  if (containsEmoji(text)) return true;
  return BANNED_WORDS_FOR_LOW_SCORE.some((word) => text.includes(word));
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEYが設定されていません" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      answers = {},
      otherInputs = {},
      freeText = "",
      industry = DEFAULT_INDUSTRY,
      retailPreset,
    } = body;

    const rawSatisfaction = body?.satisfaction;
    if (
      typeof rawSatisfaction !== "number" ||
      !Number.isInteger(rawSatisfaction) ||
      rawSatisfaction < 1 ||
      rawSatisfaction > 5
    ) {
      return NextResponse.json(
        { error: "満足度（1〜5の整数）が必要です" },
        { status: 400 }
      );
    }
    const satisfaction = rawSatisfaction;

    const industryKey = Object.hasOwn(industries, industry)
      ? (industry as IndustryKey)
      : DEFAULT_INDUSTRY;
    const config = getIndustryConfig(industryKey, retailPreset);

    const openai = new OpenAI({ apiKey });
    const prompt = config.buildPrompt(
      answers,
      {
        ...otherInputs,
        __satisfaction: String(satisfaction),
      },
      freeText
    );

    const firstTemperature = satisfaction <= 3 ? 0.45 : 0.75;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: config.systemMessage },
        { role: "user", content: prompt },
      ],
      temperature: firstTemperature,
      presence_penalty: 0.5,
      frequency_penalty: 0.45,
      max_tokens: 500,
    });

    let text = completion.choices[0]?.message?.content?.trim() ?? "";

    const needsRetry =
      violatesPolicy(text, satisfaction) || !satisfiesHighScorePolicy(text, satisfaction);

    if (needsRetry) {
      const retry = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: config.systemMessage },
          {
            role: "user",
            content: `${prompt}\n\n※ 上記ルールに違反している表現があれば修正したうえで、条件を満たすように書き直してください。\n※ 満足度が星4〜5のときは、以下を「必ず」満たしてください：\n- 絵文字（例：😊）または「！」を1つ以上含める\n- 「おすすめ」を必ず含める（例：「おすすめです」）\n- 再来/継続利用のコメントを必ず含める（例：「また行きたいです」「今後も通いたいです」）\n※ 上の例文をそのまま使ってもOKです。\n最終的な口コミ本文のみを出力してください。`,
          },
        ],
        temperature: 0.4,
        presence_penalty: 0.5,
        frequency_penalty: 0.45,
        max_tokens: 500,
      });
      const retryText = retry.choices[0]?.message?.content?.trim() ?? "";
      if (
        !violatesPolicy(retryText, satisfaction) &&
        satisfiesHighScorePolicy(retryText, satisfaction)
      ) {
        text = retryText;
      } else if (satisfaction <= 3) {
        // 低評価でも、違反が残る場合はもう一段強めにリライトして“総評テンプレ”を潰す
        const bannedList = FORBIDDEN_SUMMARY_PHRASES_FOR_LOW_SCORE.map((p) => `- ${p}`).join(
          "\n"
        );
        const retryLow2 = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: config.systemMessage },
            {
              role: "user",
              content: `${prompt}\n\n【重要】満足度が星1〜3です。次を必ず守って書き直してください。\n- トーンはニュートラル\n- 絵文字と「！」は禁止\n- 再来/通院継続に触れない\n- “総評っぽい締め”や“改善提案テンプレ”を入れない（以下の表現は禁止・類似表現も禁止）：\n${bannedList}\n※ 体験の事実だけを淡々と書き、最後は余韻で止めてください。\n最終的な口コミ本文のみを出力してください。`,
            },
          ],
          temperature: 0.35,
          presence_penalty: 0.3,
          frequency_penalty: 0.3,
          max_tokens: 500,
        });
        const retryLow2Text = retryLow2.choices[0]?.message?.content?.trim() ?? "";
        if (!violatesPolicy(retryLow2Text, satisfaction)) {
          text = retryLow2Text;
        }
      } else if (satisfaction >= 4) {
        // もう一段強めに“必須語句”を指定して再生成（高評価の安定化）
        // 固定文だと同じ文章が続きやすいので、候補からランダムに選ぶ。
        const emojiOrBang = pickOne(["😊", "！"]);
        const recommendPhrase =
          industryKey === "restaurant"
            ? pickOne([
                "個人的にはおすすめです。",
                "料理の味も雰囲気も気に入りました。",
                "友人にも勧めたいお店です。",
                "コスパも含めておすすめです。",
              ])
            : pickOne([
                "個人的にはおすすめです。",
                "安心しておすすめできます。",
                "同じように歯医者が苦手な方にはおすすめです。",
                "またお願いしたいと思えるのでおすすめです。",
              ]);
        const revisitPhrase =
          industryKey === "restaurant"
            ? pickOne([
                "また行きたいです。",
                "次の来店も楽しみです。",
                "機会があればまた来たいです。",
                "今度は別のメニューも試したいです。",
              ])
            : pickOne([
                "また行きたいです。",
                "次回もお願いしたいです。",
                "今後も通いたいです。",
                "これからもお世話になりたいです。",
              ]);

        const retry2 = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: config.systemMessage },
            {
              role: "user",
              content: `${prompt}\n\n【重要】満足度が星4〜5です。次の3つの“指定フレーズ”を必ず含めて、前向きな文章に書き直してください。\n1) 「${emojiOrBang}」を必ず1つ以上\n2) 「${recommendPhrase}」を必ず1回（文言を変えない）\n3) 「${revisitPhrase}」を必ず1回（文言を変えない）\n※ 事実の追加・誇張は禁止。上の指定フレーズは“感想”として自然に入れる。\n最終的な口コミ本文のみを出力してください。`,
            },
          ],
          temperature: 0.3,
          presence_penalty: 0.2,
          frequency_penalty: 0.2,
          max_tokens: 500,
        });
        const retry2Text = retry2.choices[0]?.message?.content?.trim() ?? "";
        if (satisfiesHighScorePolicy(retry2Text, satisfaction)) {
          text = retry2Text;
        }
      }
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error("[generate]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "生成に失敗しました" },
      { status: 500 }
    );
  }
}

