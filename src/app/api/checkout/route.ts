import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";

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

    // Firestoreからテナント情報を取得し、クーポン使用済みかチェック
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        { error: "データベース接続が利用できません" },
        { status: 500 }
      );
    }

    const tenantSnap = await adminDb.collection("tenants").doc(tenantId).get();
    if (!tenantSnap.exists) {
      return NextResponse.json(
        { error: "テナントが見つかりません" },
        { status: 404 }
      );
    }

    const tenantData = tenantSnap.data();
    // クーポン使用済みかチェック（フィールドが存在しない場合はfalseとして扱う）
    const shouldApplyCoupon = !tenantData?.couponUsed;

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const couponId = process.env.STRIPE_COUPON_ID;

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
        trial_period_days: 30,
        metadata: {
          tenantId,
        },
      },
      // クーポンは初回のみ適用
      ...(couponId && shouldApplyCoupon ? { discounts: [{ coupon: couponId }] } : {}),
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
