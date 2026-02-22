import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdminSecret } from "@/lib/admin-auth";

const VALID_STATUSES = ["active", "canceled", "past_due", "trialing", "inactive"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  if (!requireAdminSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tenantId } = params;
    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantIdが必要です" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, googleMapsUrl, subscriptionStatus, industry, retailPreset } = body as {
      name?: string;
      googleMapsUrl?: string;
      subscriptionStatus?: string;
      industry?: string;
      retailPreset?: string;
    };

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (typeof name === "string") updates.name = name.trim() || tenantId;
    if (typeof googleMapsUrl === "string") updates.googleMapsUrl = googleMapsUrl.trim() || "https://www.google.com/maps";
    if (typeof subscriptionStatus === "string" && VALID_STATUSES.includes(subscriptionStatus as (typeof VALID_STATUSES)[number])) {
      updates.subscriptionStatus = subscriptionStatus;
    }
    if (industry !== undefined) updates.industry = industry === "" ? null : industry;
    if (retailPreset !== undefined) updates.retailPreset = retailPreset === "" ? null : retailPreset;

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "データベース接続が利用できません" },
        { status: 500 }
      );
    }

    const ref = db.collection("tenants").doc(tenantId);
    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json(
        { error: "店舗が見つかりません" },
        { status: 404 }
      );
    }

    await ref.set(updates, { merge: true });

    const snap = await ref.get();
    const data = snap.data();
    return NextResponse.json({
      tenantId,
      name: data?.name ?? tenantId,
      googleMapsUrl: data?.googleMapsUrl ?? "https://www.google.com/maps",
      subscriptionStatus: data?.subscriptionStatus ?? "inactive",
      industry: data?.industry,
      retailPreset: data?.retailPreset,
    });
  } catch (err) {
    console.error("[admin/tenants PATCH]", err);
    return NextResponse.json(
      { error: "店舗の更新に失敗しました" },
      { status: 500 }
    );
  }
}
