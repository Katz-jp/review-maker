import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export type TenantStatus = "active" | "canceled" | "past_due" | "trialing" | "inactive";

export type TenantInfo = {
  tenantId: string;
  name: string;
  googleMapsUrl: string;
  placeId?: string;
  subscriptionStatus: TenantStatus;
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
    const data = snap.data();

    const subscriptionStatus: TenantStatus =
      data?.subscriptionStatus === "active" ||
      data?.subscriptionStatus === "canceled" ||
      data?.subscriptionStatus === "past_due" ||
      data?.subscriptionStatus === "trialing"
        ? data.subscriptionStatus
        : "inactive";

    const co = data?.customOptions as { name?: string; googleMapsUrl?: string; placeId?: string; industry?: string; retailPreset?: string } | undefined;
    return NextResponse.json({
      tenantId,
      name: data?.name ?? co?.name ?? "〇〇整骨院",
      googleMapsUrl: data?.googleMapsUrl ?? co?.googleMapsUrl ?? "https://www.google.com/maps",
      placeId: data?.placeId ?? co?.placeId ?? undefined,
      subscriptionStatus,
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
