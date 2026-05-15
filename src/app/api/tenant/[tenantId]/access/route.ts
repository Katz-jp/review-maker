import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  isPinExemptTenantId,
  subscriptionAllowsPaidFeatures,
  tenantDocRequiresAccessPin,
  appTrialEndMillis,
} from "@/lib/tenant-subscription";
import { parseUnlockCookieValue, TENANT_UNLOCK_COOKIE } from "@/lib/tenant-unlock-cookie";

export async function GET(
  _req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    if (!tenantId) {
      return NextResponse.json({ error: "tenantIdが必要です" }, { status: 400 });
    }

    if (isPinExemptTenantId(tenantId)) {
      return NextResponse.json({
        requiresPin: false,
        hasValidUnlock: true,
        paidFeatures: true,
        appTrialEndIso: null as string | null,
      });
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
    const requiresPin = tenantDocRequiresAccessPin(data);

    const cookieStore = cookies();
    const raw = cookieStore.get(TENANT_UNLOCK_COOKIE)?.value;
    const parsed = parseUnlockCookieValue(raw);
    const cookieOk = Boolean(parsed && parsed.tenantId === tenantId);
    const hasValidUnlock = !requiresPin || cookieOk;

    const paid = subscriptionAllowsPaidFeatures(data);
    const endMs = appTrialEndMillis(data);
    const appTrialEndIso = endMs != null ? new Date(endMs).toISOString() : null;

    return NextResponse.json({
      requiresPin,
      hasValidUnlock,
      paidFeatures: paid,
      appTrialEndIso,
    });
  } catch (err) {
    console.error("[tenant access GET]", err);
    return NextResponse.json(
      { error: "アクセス確認に失敗しました" },
      { status: 500 }
    );
  }
}
