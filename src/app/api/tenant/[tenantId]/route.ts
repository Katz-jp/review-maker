import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  subscriptionAllowsPaidFeatures,
  tenantDocRequiresAccessPin,
  appTrialEndMillis,
  toMillis,
} from "@/lib/tenant-subscription";

export type TenantStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "inactive"
  | "app_trial";

export type TenantInfo = {
  tenantId: string;
  name: string;
  googleMapsUrl: string;
  placeId?: string;
  subscriptionStatus: TenantStatus;
  /** アンケート・生成などの有料相当機能を使えるか（app_trial の期限内を含む） */
  paidAccess: boolean;
  appTrialEndsAt?: string;
  appTrialStartedAt?: string;
  /** 店舗用 URL アクセス時に PIN が必要（Firestore にハッシュあり） */
  requiresAccessPin: boolean;
  industry?: string;
  retailPreset?: string;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantIdが必要です" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "データベース接続が利用できません" },
        { status: 500 }
      );
    }

    const snap = await db.collection("tenants").doc(tenantId).get();
    const data = snap.data() ?? {};

    const raw = data.subscriptionStatus;
    const subscriptionStatus: TenantStatus =
      raw === "active" ||
      raw === "canceled" ||
      raw === "past_due" ||
      raw === "trialing" ||
      raw === "app_trial"
        ? raw
        : "inactive";

    const co = data?.customOptions as {
      name?: string;
      googleMapsUrl?: string;
      placeId?: string;
      industry?: string;
      retailPreset?: string;
    } | undefined;

    const endMs = appTrialEndMillis(data);
    const startMs = toMillis(data.appTrialStartedAt);

    return NextResponse.json({
      tenantId,
      name: data?.name ?? co?.name ?? "〇〇整骨院",
      googleMapsUrl: data?.googleMapsUrl ?? co?.googleMapsUrl ?? "https://www.google.com/maps",
      placeId: data?.placeId ?? co?.placeId ?? undefined,
      subscriptionStatus,
      paidAccess: subscriptionAllowsPaidFeatures(data),
      ...(endMs != null ? { appTrialEndsAt: new Date(endMs).toISOString() } : {}),
      ...(startMs != null ? { appTrialStartedAt: new Date(startMs).toISOString() } : {}),
      requiresAccessPin: tenantDocRequiresAccessPin(data),
      industry: data?.industry ?? co?.industry,
      retailPreset: data?.retailPreset ?? co?.retailPreset,
    } satisfies TenantInfo);
  } catch (err) {
    console.error("[tenant GET]", err);
    return NextResponse.json(
      { error: "店舗情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}
