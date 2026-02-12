import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY未設定");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  try {
    const { tenantId, successUrl, cancelUrl } = await req.json();

    if (!tenantId || typeof tenantId !== "string") {
      return NextResponse.json(
        { error: "tenantIdが必要です" },
        { status: 400 }
      );
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "STRIPE_PRICE_IDが設定されていません" },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${baseUrl}/owner/${tenantId}?success=true`,
      cancel_url: cancelUrl || `${baseUrl}/owner/${tenantId}?canceled=true`,
      metadata: {
        tenantId,
      },
      subscription_data: {
        metadata: {
          tenantId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "チェックアウト作成に失敗しました" },
      { status: 500 }
    );
  }
}
