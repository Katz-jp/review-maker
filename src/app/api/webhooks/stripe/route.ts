import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY未設定");
  return new Stripe(key);
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig || !webhookSecret) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("[webhook] signature verification failed", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const tenantId = (event.data.object as { metadata?: { tenantId?: string } }).metadata?.tenantId;

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const status = mapStripeStatus(sub.status);
        await updateTenantSubscription(tenantId || sub.metadata?.tenantId, status);
        break;
      }
      case "customer.subscription.deleted": {
        await updateTenantSubscription(
          tenantId || (event.data.object as Stripe.Subscription).metadata?.tenantId,
          "canceled"
        );
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
        const subId = invoice.subscription;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await updateTenantSubscription(sub.metadata?.tenantId, "past_due");
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook error" },
      { status: 500 }
    );
  }
}

function mapStripeStatus(s: string): "active" | "canceled" | "past_due" | "trialing" | "inactive" {
  if (s === "active" || s === "trialing") return s;
  if (s === "past_due" || s === "canceled") return s;
  return "inactive";
}

async function updateTenantSubscription(
  tenantId: string | undefined,
  status: "active" | "canceled" | "past_due" | "trialing" | "inactive"
) {
  if (!tenantId) return;

  const adminDb = getAdminDb();
  if (!adminDb) {
    console.warn("[webhook] Firebase Admin not configured, skipping Firestore update");
    return;
  }

  await adminDb.collection("tenants").doc(tenantId).set(
    { subscriptionStatus: status, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}
