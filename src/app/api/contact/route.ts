import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = "info@kuhmom-ailabo.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

const industryLabels: Record<string, string> = {
  seikotsuin: "整骨院",
  biyoshi: "美容室",
  inshokuten: "飲食店",
  other: "その他",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeName, name, email, phone, industry, message } = body;

    if (!storeName?.trim() || !name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "店舗名・お名前・メールアドレスは必須です。" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return NextResponse.json(
        { error: "有効なメールアドレスを入力してください。" },
        { status: 400 }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "メール送信の設定がありません。しばらくしてからお試しください。" },
        { status: 500 }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const industryLabel = industry ? industryLabels[industry] ?? industry : "未選択";

    const text = [
      `【お問い合わせ】`,
      ``,
      `店舗名: ${String(storeName).trim()}`,
      `お名前: ${String(name).trim()}`,
      `メールアドレス: ${String(email).trim()}`,
      `電話番号: ${phone ? String(phone).trim() : "未入力"}`,
      `業種: ${industryLabel}`,
      ``,
      `お問い合わせ内容:`,
      message ? String(message).trim() : "未入力",
    ].join("\n");

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: String(email).trim(),
      subject: `[口コミ作成AI] お問い合わせ: ${String(storeName).trim()}`,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "メールの送信に失敗しました。しばらくしてからお試しください。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Contact API error:", e);
    return NextResponse.json(
      { error: "送信処理でエラーが発生しました。" },
      { status: 500 }
    );
  }
}
