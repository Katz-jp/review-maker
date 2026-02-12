export type Tenant = {
  id: string;
  name: string;
  googleMapsUrl: string;
  subscriptionStatus: "active" | "canceled" | "past_due" | "trialing" | "inactive";
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
      subscriptionStatus: data.subscriptionStatus ?? "inactive",
    };
  } catch {
    return null;
  }
}

export async function getTenantOrFallback(tenantId: string): Promise<Tenant> {
  const tenant = await getTenant(tenantId);
  return tenant ?? { ...DEFAULT_TENANT, id: tenantId };
}
