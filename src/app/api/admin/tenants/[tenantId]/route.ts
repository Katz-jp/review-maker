import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import type { CollectionReference, Firestore } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdminSecret } from "@/lib/admin-auth";
import { hashAccessPin, isValidAccessPinFormat } from "@/lib/access-pin";

const VALID_STATUSES = ["active", "canceled", "past_due", "trialing", "inactive", "app_trial"] as const;

const TENANT_SUBCOLLECTIONS = ["replyHistory", "replySettings", "stats"] as const;

async function deleteCollectionInBatches(db: Firestore, colRef: CollectionReference): Promise<void> {
  let snap = await colRef.limit(500).get();
  while (!snap.empty) {
    const batch = db.batch();
    for (const d of snap.docs) {
      batch.delete(d.ref);
    }
    await batch.commit();
    snap = await colRef.limit(500).get();
  }
}

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
    const {
      name,
      googleMapsUrl,
      placeId,
      subscriptionStatus,
      industry,
      retailPreset,
      accessPin,
      clearAccessPin,
    } = body as {
      name?: string;
      googleMapsUrl?: string;
      placeId?: string;
      subscriptionStatus?: string;
      industry?: string;
      retailPreset?: string;
      accessPin?: string;
      clearAccessPin?: boolean;
    };

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (typeof name === "string") updates.name = name.trim() || tenantId;
    if (typeof googleMapsUrl === "string") updates.googleMapsUrl = googleMapsUrl.trim() || "https://www.google.com/maps";
    if (placeId !== undefined) updates.placeId = typeof placeId === "string" && placeId.trim() ? placeId.trim() : null;
    if (typeof subscriptionStatus === "string" && VALID_STATUSES.includes(subscriptionStatus as (typeof VALID_STATUSES)[number])) {
      updates.subscriptionStatus = subscriptionStatus;
    }
    updates.industry = "dental";
    updates.retailPreset = null;

    if (clearAccessPin === true) {
      updates.accessPinHash = FieldValue.delete();
    } else if (typeof accessPin === "string" && accessPin.trim()) {
      const pin = accessPin.trim();
      if (!isValidAccessPinFormat(pin)) {
        return NextResponse.json(
          { error: "PIN は 4〜8 桁の数字で指定してください" },
          { status: 400 }
        );
      }
      updates.accessPinHash = hashAccessPin(pin);
    }

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
    const co = data?.customOptions as { name?: string; googleMapsUrl?: string; placeId?: string; industry?: string; retailPreset?: string } | undefined;
    return NextResponse.json({
      tenantId,
      name: data?.name ?? co?.name ?? tenantId,
      googleMapsUrl: data?.googleMapsUrl ?? co?.googleMapsUrl ?? "https://www.google.com/maps",
      placeId: data?.placeId ?? co?.placeId ?? undefined,
      subscriptionStatus: data?.subscriptionStatus ?? "inactive",
      industry: data?.industry ?? co?.industry,
      retailPreset: data?.retailPreset ?? co?.retailPreset,
    });
  } catch (err) {
    console.error("[admin/tenants PATCH]", err);
    return NextResponse.json(
      { error: "店舗の更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  if (!requireAdminSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = params;
  if (!tenantId) {
    return NextResponse.json({ error: "tenantIdが必要です" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { confirmTenantId?: unknown };
  const confirm =
    typeof body.confirmTenantId === "string" ? body.confirmTenantId.trim() : "";
  if (confirm !== tenantId) {
    return NextResponse.json(
      {
        error:
          "確認のため、JSON 本文に confirmTenantId（削除する店舗のテナントIDと完全一致）を含めてください",
      },
      { status: 400 }
    );
  }

  try {
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
      return NextResponse.json({ error: "店舗が見つかりません" }, { status: 404 });
    }

    for (const sub of TENANT_SUBCOLLECTIONS) {
      await deleteCollectionInBatches(db, ref.collection(sub));
    }

    await ref.delete();

    return NextResponse.json({ ok: true, tenantId });
  } catch (err) {
    console.error("[admin/tenants DELETE]", err);
    return NextResponse.json(
      { error: "店舗の削除に失敗しました" },
      { status: 500 }
    );
  }
}
