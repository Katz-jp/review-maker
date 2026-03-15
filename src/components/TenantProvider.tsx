"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Tenant } from "@/lib/tenant";
import { getTenantOrFallback } from "@/lib/tenant";

const TenantContext = createContext<Tenant | null>(null);

export function TenantProvider({
  children,
  tenantId,
}: {
  children: ReactNode;
  tenantId: string;
}) {
  const [tenant, setTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    getTenantOrFallback(tenantId).then(setTenant);
  }, [tenantId]);

  return (
    <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>
  );
}

export function useTenant(): Tenant {
  const ctx = useContext(TenantContext);
  return ctx ?? { id: "demo", name: "〇〇整骨院", googleMapsUrl: "https://www.google.com/maps", subscriptionStatus: "active" as const };
}
