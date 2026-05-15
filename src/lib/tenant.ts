import { appTrialEndMillis, toMillis } from "@/lib/tenant-subscription";

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
  /** "seikotsu" | "retail" など。未設定時は整骨院として扱う */
  industry?: string;
  /** industry が "retail" のときのプリセット。"meat" | "general" など */
  retailPreset?: string;
};

export const DEFAULT_TENANT: Tenant = {
  id: "demo",
  name: "〇〇整骨院",
  googleMapsUrl: "https://www.google.com/maps",
  subscriptionStatus: "active",
};

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  if (typeof window === "undefined") return null;

  try {
    const { db } = await import("./firebase");
    if (!db) return null;

    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "tenants", tenantId));
    if (!snap.exists()) return null;

    const data = snap.data();
    const co = data?.customOptions as { name?: string; googleMapsUrl?: string; placeId?: string; industry?: string; retailPreset?: string } | undefined;
    const rawStatus = data?.subscriptionStatus ?? "inactive";
    const subscriptionStatus: Tenant["subscriptionStatus"] =
      rawStatus === "active" ||
      rawStatus === "canceled" ||
      rawStatus === "past_due" ||
      rawStatus === "trialing" ||
      rawStatus === "app_trial"
        ? rawStatus
        : "inactive";

    const endMs = appTrialEndMillis(data);
    const startMs = toMillis(data.appTrialStartedAt);

    return {
      id: tenantId,
      name: data?.name ?? co?.name ?? DEFAULT_TENANT.name,
      googleMapsUrl: data?.googleMapsUrl ?? co?.googleMapsUrl ?? DEFAULT_TENANT.googleMapsUrl,
      placeId: data?.placeId ?? co?.placeId,
      subscriptionStatus,
      ...(endMs != null ? { appTrialEndsAt: new Date(endMs).toISOString() } : {}),
      ...(startMs != null ? { appTrialStartedAt: new Date(startMs).toISOString() } : {}),
      industry: data?.industry ?? co?.industry,
      retailPreset: data?.retailPreset ?? co?.retailPreset,
    };
  } catch {
    return null;
  }
}

export async function getTenantOrFallback(tenantId: string): Promise<Tenant> {
  const tenant = await getTenant(tenantId);
  return tenant ?? { ...DEFAULT_TENANT, id: tenantId };
}
