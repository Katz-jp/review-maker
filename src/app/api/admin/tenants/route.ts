import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdminSecret } from "@/lib/admin-auth";
import { hashAccessPin, isValidAccessPinFormat } from "@/lib/access-pin";

const VALID_STATUSES = ["active", "canceled", "past_due", "trialing", "inactive", "app_trial"] as const;

export type TenantListItem = {
  tenantId: string;
  name: string;
  googleMapsUrl: string;
  placeId?: string;
  subscriptionStatus: string;
  updatedAt?: string;
  industry?: string;
  retailPreset?: string;
};

export async function GET(req: NextRequest) {
  if (!requireAdminSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "データベース接続が利用できません" },
        { status: 500 }
      );
    }

    const snapshot = await db.collection("tenants").get();
    const items: TenantListItem[] = snapshot.docs.map((doc) => {
      const d = doc.data();
      const co = d?.customOptions as { name?: string; googleMapsUrl?: string; placeId?: string; industry?: string; retailPreset?: string } | undefined;
      return {
        tenantId: doc.id,
        name: d?.name ?? co?.name ?? "",
        googleMapsUrl: d?.googleMapsUrl ?? co?.googleMapsUrl ?? "https://www.google.com/maps",
        placeId: d?.placeId ?? co?.placeId,
        subscriptionStatus: d?.subscriptionStatus ?? "inactive",
        updatedAt: d?.updatedAt,
        industry: d?.industry ?? co?.industry,
        retailPreset: d?.retailPreset ?? co?.retailPreset,
      };
    });

    items.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));

    return NextResponse.json({ tenants: items });
  } catch (err) {
    console.error("[admin/tenants GET]", err);
    return NextResponse.json(
      { error: "店舗一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdminSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      tenantId,
      name,
      googleMapsUrl,
      placeId,
      subscriptionStatus,
      industry,
      retailPreset,
      accessPin,
    } = body as {
      tenantId?: string;
      name?: string;
      googleMapsUrl?: string;
      placeId?: string;
      subscriptionStatus?: string;
      industry?: string;
      retailPreset?: string;
      accessPin?: string;
    };

    if (!tenantId || typeof tenantId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(tenantId.trim())) {
      return NextResponse.json(
        { error: "tenantIdは英数字・ハイフン・アンダースコアのみ使用できます" },
        { status: 400 }
      );
    }

    const id = tenantId.trim();
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "データベース接続が利用できません" },
        { status: 500 }
      );
    }

    const ref = db.collection("tenants").doc(id);
    const existing = await ref.get();
    if (existing.exists) {
      return NextResponse.json(
        { error: "このtenantIdは既に使用されています" },
        { status: 400 }
      );
    }

    const status =
      typeof subscriptionStatus === "string" &&
      VALID_STATUSES.includes(subscriptionStatus as (typeof VALID_STATUSES)[number])
        ? subscriptionStatus
        : "inactive";

    if (status === "app_trial") {
      const pin = typeof accessPin === "string" ? accessPin.trim() : "";
      if (!isValidAccessPinFormat(pin)) {
        return NextResponse.json(
          { error: "app_trial では店舗用 PIN（4〜8桁の数字）が必要です" },
          { status: 400 }
        );
      }
    }

    const pinToHash = typeof accessPin === "string" ? accessPin.trim() : "";
    let accessPinHash: string | undefined;
    if (pinToHash) {
      if (!isValidAccessPinFormat(pinToHash)) {
        return NextResponse.json(
          { error: "PIN は 4〜8 桁の数字で指定してください" },
          { status: 400 }
        );
      }
      accessPinHash = hashAccessPin(pinToHash);
    }
    const nextIndustry = "dental";

    const nextPlaceId = typeof placeId === "string" && placeId.trim() ? placeId.trim() : null;
    await ref.set(
      {
        name: typeof name === "string" && name.trim() ? name.trim() : id,
        googleMapsUrl: typeof googleMapsUrl === "string" && googleMapsUrl.trim() ? googleMapsUrl.trim() : "https://www.google.com/maps",
        ...(nextPlaceId !== null && { placeId: nextPlaceId }),
        subscriptionStatus: status,
        industry: nextIndustry,
        retailPreset: null,
        ...(accessPinHash !== undefined && { accessPinHash }),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      tenantId: id,
      name: typeof name === "string" && name.trim() ? name.trim() : id,
      googleMapsUrl: typeof googleMapsUrl === "string" && googleMapsUrl.trim() ? googleMapsUrl.trim() : "https://www.google.com/maps",
      placeId: nextPlaceId ?? undefined,
      subscriptionStatus: status,
      industry: nextIndustry,
      retailPreset: undefined,
    });
  } catch (err) {
    console.error("[admin/tenants POST]", err);
    return NextResponse.json(
      { error: "店舗の追加に失敗しました" },
      { status: 500 }
    );
  }
}
