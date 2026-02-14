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
    const { tenantId } = await req.json();

    if (!tenantId || typeof tenantId !== "string") {
      return NextResponse.json(
        { error: "tenantIdが必要です" },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        { error: "データベース接続が利用できません" },
        { status: 500 }
      );
    }

    const snap = await adminDb.collection("tenants").doc(tenantId).get();
    const stripeCustomerId = snap.data()?.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: "契約情報が見つかりません。サブスクリプション加入後にご利用ください。" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/owner/${tenantId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[portal]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "ポータルの作成に失敗しました" },
      { status: 500 }
    );
  }
}
