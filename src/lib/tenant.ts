export type Tenant = {
  id: string;
  name: string;
  googleMapsUrl: string;
  /** Google Place ID。設定時は口コミ投稿用URL（writereview）のリンクに使用 */
  placeId?: string;
  subscriptionStatus:
    | "active"
    | "canceled"
    | "past_due"
    | "trialing"
    | "inactive"
    | "app_trial";
  /** アプリ側無料体験の終了時刻（ISO）。Firestore の appTrialEndsAt または開始から30日で算出 */
  appTrialEndsAt?: string;
  appTrialStartedAt?: string;
  /** 歯科専用。未設定時は dental として扱う */
  industry?: string;
};

export const DEFAULT_TENANT: Tenant = {
  id: "demo",
  name: "〇〇歯科クリニック",
  googleMapsUrl: "https://www.google.com/maps",
  subscriptionStatus: "active",
};

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  if (typeof window === "undefined") return null;

  try {
    // Firestore の tenants コレクションはクライアントから直接読めない（本番のセキュリティルールで
    // 拒否される）ため、Admin SDK 経由でテナント情報を返すサーバーAPIを使用する。
    // 直接 getDoc() していた旧実装は本番で常に権限エラーとなり、フォールバック（〇〇歯科クリニック /
    // ただの地図URL）が表示され続けるバグの原因だった。
    const res = await fetch(`/api/tenant/${encodeURIComponent(tenantId)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = await res.json();
    const rawStatus = data?.subscriptionStatus ?? "inactive";
    const subscriptionStatus: Tenant["subscriptionStatus"] =
      rawStatus === "active" ||
      rawStatus === "canceled" ||
      rawStatus === "past_due" ||
      rawStatus === "trialing" ||
      rawStatus === "app_trial"
        ? rawStatus
        : "inactive";

    return {
      id: tenantId,
      name: typeof data?.name === "string" && data.name ? data.name : DEFAULT_TENANT.name,
      googleMapsUrl:
        typeof data?.googleMapsUrl === "string" && data.googleMapsUrl
          ? data.googleMapsUrl
          : DEFAULT_TENANT.googleMapsUrl,
      placeId: typeof data?.placeId === "string" && data.placeId ? data.placeId : undefined,
      subscriptionStatus,
      ...(typeof data?.appTrialEndsAt === "string" ? { appTrialEndsAt: data.appTrialEndsAt } : {}),
      ...(typeof data?.appTrialStartedAt === "string" ? { appTrialStartedAt: data.appTrialStartedAt } : {}),
      industry: data?.industry ?? "dental",
    };
  } catch {
    return null;
  }
}

export async function getTenantOrFallback(tenantId: string): Promise<Tenant> {
  const tenant = await getTenant(tenantId);
  return tenant ?? { ...DEFAULT_TENANT, id: tenantId };
}
