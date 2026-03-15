export type Tenant = {
  id: string;
  name: string;
  googleMapsUrl: string;
  /** Google Place ID。設定時は口コミ投稿用URL（writereview）のリンクに使用 */
  placeId?: string;
  subscriptionStatus: "active" | "canceled" | "past_due" | "trialing" | "inactive";
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
    return {
      id: tenantId,
      name: data.name ?? DEFAULT_TENANT.name,
      googleMapsUrl: data.googleMapsUrl ?? DEFAULT_TENANT.googleMapsUrl,
      placeId: data.placeId,
      subscriptionStatus: data.subscriptionStatus ?? "inactive",
      industry: data.industry,
      retailPreset: data.retailPreset,
    };
  } catch {
    return null;
  }
}

export async function getTenantOrFallback(tenantId: string): Promise<Tenant> {
  const tenant = await getTenant(tenantId);
  return tenant ?? { ...DEFAULT_TENANT, id: tenantId };
}
