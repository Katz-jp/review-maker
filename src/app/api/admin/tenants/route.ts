import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdminSecret } from "@/lib/admin-auth";

const VALID_STATUSES = ["active", "canceled", "past_due", "trialing", "inactive"] as const;

export type TenantListItem = {
  tenantId: string;
  name: string;
  googleMapsUrl: string;
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
      return {
        tenantId: doc.id,
        name: d.name ?? "",
        googleMapsUrl: d.googleMapsUrl ?? "https://www.google.com/maps",
        subscriptionStatus: d.subscriptionStatus ?? "inactive",
        updatedAt: d.updatedAt,
        industry: d.industry,
        retailPreset: d.retailPreset,
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
    const { tenantId, name, googleMapsUrl, subscriptionStatus, industry, retailPreset } = body as {
      tenantId?: string;
      name?: string;
      googleMapsUrl?: string;
      subscriptionStatus?: string;
      industry?: string;
      retailPreset?: string;
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
    const nextIndustry = industry === "" ? null : industry;
    const nextRetailPreset =
      nextIndustry === "retail" ? (retailPreset === "" ? null : retailPreset) : null;

    await ref.set(
      {
        name: typeof name === "string" && name.trim() ? name.trim() : id,
        googleMapsUrl: typeof googleMapsUrl === "string" && googleMapsUrl.trim() ? googleMapsUrl.trim() : "https://www.google.com/maps",
        subscriptionStatus: status,
        industry: nextIndustry,
        retailPreset: nextRetailPreset,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      tenantId: id,
      name: typeof name === "string" && name.trim() ? name.trim() : id,
      googleMapsUrl: typeof googleMapsUrl === "string" && googleMapsUrl.trim() ? googleMapsUrl.trim() : "https://www.google.com/maps",
      subscriptionStatus: status,
      industry: nextIndustry,
      retailPreset: nextRetailPreset,
    });
  } catch (err) {
    console.error("[admin/tenants POST]", err);
    return NextResponse.json(
      { error: "店舗の追加に失敗しました" },
      { status: 500 }
    );
  }
}
