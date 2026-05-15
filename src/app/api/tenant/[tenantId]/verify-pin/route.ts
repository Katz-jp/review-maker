import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyAccessPin, isValidAccessPinFormat } from "@/lib/access-pin";
import {
  APP_TRIAL_DAYS,
  isPinExemptTenantId,
  appTrialEndMillis,
  toMillis,
} from "@/lib/tenant-subscription";
import {
  assertTenantUnlockSecretConfigured,
  signUnlockCookieValue,
  TENANT_UNLOCK_COOKIE,
  unlockCookieMaxAgeSec,
} from "@/lib/tenant-unlock-cookie";

export async function POST(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    if (!tenantId) {
      return NextResponse.json({ error: "tenantIdが必要です" }, { status: 400 });
    }

    if (isPinExemptTenantId(tenantId)) {
      return NextResponse.json({ error: "この店舗では PIN は不要です" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const pin = typeof body.pin === "string" ? body.pin.trim() : "";
    if (!isValidAccessPinFormat(pin)) {
      return NextResponse.json(
        { error: "PIN は 4〜8 桁の数字で入力してください" },
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

    const ref = db.collection("tenants").doc(tenantId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "店舗が見つかりません" }, { status: 404 });
    }

    const data = snap.data() ?? {};
    const stored = data.accessPinHash;
    if (typeof stored !== "string" || !stored) {
      return NextResponse.json({ error: "PIN が設定されていません" }, { status: 400 });
    }

    if (!verifyAccessPin(pin, stored)) {
      return NextResponse.json({ error: "PIN が正しくありません" }, { status: 401 });
    }

    assertTenantUnlockSecretConfigured();

    const now = Date.now();
    const updates: Record<string, string> = {};

    if (data.subscriptionStatus === "app_trial") {
      const hadEnd = toMillis(data.appTrialEndsAt) != null;
      const hadStart = toMillis(data.appTrialStartedAt) != null;
      if (!hadEnd && !hadStart) {
        const end = new Date(now + APP_TRIAL_DAYS * 24 * 60 * 60 * 1000);
        updates.appTrialStartedAt = new Date(now).toISOString();
        updates.appTrialEndsAt = end.toISOString();
      }
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString();
      await ref.set(updates, { merge: true });
    }

    const fresh = (await ref.get()).data() ?? data;
    const endMs = appTrialEndMillis(fresh);
    const fallbackEndMs = now + 60 * 60 * 24 * 31 * 1000;
    const effectiveEndMs = endMs ?? fallbackEndMs;
    const expSec = Math.floor(effectiveEndMs / 1000);
    const cookieVal = signUnlockCookieValue(tenantId, expSec);
    const maxAge =
      endMs != null ? unlockCookieMaxAgeSec(endMs) : 60 * 60 * 24 * 31;

    const res = NextResponse.json({ ok: true });
    res.cookies.set(TENANT_UNLOCK_COOKIE, cookieVal, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });
    return res;
  } catch (err) {
    console.error("[verify-pin]", err);
    const msg = err instanceof Error ? err.message : "PIN の検証に失敗しました";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
