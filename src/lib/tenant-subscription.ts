/**
 * アプリ側の「app_trial」（Stripe 前の無料期間）と契約状態の判定。
 */

export const APP_TRIAL_DAYS = 30;

/** 公開デモ等 — 店舗用 PIN ゲートの対象外 */
export const PIN_EXEMPT_TENANT_IDS = new Set(["trial", "demo", "retail-demo", "demo-test"]);

export function isPinExemptTenantId(tenantId: string): boolean {
  return PIN_EXEMPT_TENANT_IDS.has(tenantId);
}

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "app_trial"
  | "inactive"
  | "canceled"
  | "past_due";

/** Firestore / JSON から日時をミリ秒に（Admin / クライアント両方想定） */
export function toMillis(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "string") {
    const t = Date.parse(v);
    return Number.isNaN(t) ? null : t;
  }
  if (typeof v === "object" && v !== null) {
    const o = v as { seconds?: unknown; nanoseconds?: unknown; toDate?: () => Date };
    if (typeof o.toDate === "function") {
      try {
        return o.toDate().getTime();
      } catch {
        return null;
      }
    }
    if (typeof o.seconds === "number") {
      const ns = typeof o.nanoseconds === "number" ? o.nanoseconds : 0;
      return o.seconds * 1000 + Math.floor(ns / 1e6);
    }
  }
  return null;
}

export function appTrialEndMillis(data: { subscriptionStatus?: unknown; appTrialEndsAt?: unknown; appTrialStartedAt?: unknown }): number | null {
  const explicitEnd = toMillis(data.appTrialEndsAt);
  if (explicitEnd != null) return explicitEnd;
  const start = toMillis(data.appTrialStartedAt);
  if (start != null) return start + APP_TRIAL_DAYS * 24 * 60 * 60 * 1000;
  return null;
}

export function isAppTrialFeaturesActive(
  data: { subscriptionStatus?: unknown; appTrialEndsAt?: unknown; appTrialStartedAt?: unknown },
  now = Date.now()
): boolean {
  if (data.subscriptionStatus !== "app_trial") return false;
  const end = appTrialEndMillis(data);
  if (end == null) return false;
  return now < end;
}

/** 店舗機能（アンケート・生成など）を利用できるか */
export function subscriptionAllowsPaidFeatures(
  data: { subscriptionStatus?: unknown; appTrialEndsAt?: unknown; appTrialStartedAt?: unknown },
  now = Date.now()
): boolean {
  const s = data.subscriptionStatus;
  if (s === "active" || s === "trialing") return true;
  if (s === "app_trial") return isAppTrialFeaturesActive(data, now);
  return false;
}

export function tenantDocRequiresAccessPin(data: { accessPinHash?: unknown } | undefined): boolean {
  const h = data?.accessPinHash;
  return typeof h === "string" && h.length > 0;
}

/** クライアントの TenantProvider 向け（trial テナントは常に可） */
export function clientTenantAllowsPaidFeatures(
  tenantId: string,
  tenant: {
    subscriptionStatus: string;
    appTrialEndsAt?: string;
    appTrialStartedAt?: string;
  }
): boolean {
  if (tenantId === "trial") return true;
  return subscriptionAllowsPaidFeatures(tenant);
}

export function isSafeTenantRedirectPath(path: string, tenantId: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  if (path === `/${tenantId}` || path.startsWith(`/${tenantId}/`)) return true;
  if (path === `/owner/${tenantId}` || path.startsWith(`/owner/${tenantId}/`)) return true;
  return false;
}
