import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { industries, getIndustryConfig, type IndustryKey } from "@/lib/industries";

const DEFAULT_INDUSTRY: IndustryKey = "seikotsu";

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

    const industryKey = Object.hasOwn(industries, industry)
      ? (industry as IndustryKey)
      : DEFAULT_INDUSTRY;
    const config = getIndustryConfig(industryKey, retailPreset);

    const openai = new OpenAI({ apiKey });
    const prompt = config.buildPrompt(answers, otherInputs, freeText);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: config.systemMessage },
        { role: "user", content: prompt },
      ],
      temperature: 0.75,
      presence_penalty: 0.5,
      frequency_penalty: 0.45,
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("[generate]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "生成に失敗しました" },
      { status: 500 }
    );
  }
}
