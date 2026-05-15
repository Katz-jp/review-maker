"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isPinExemptTenantId } from "@/lib/tenant-subscription";

export function TenantAccessGuard({
  tenantId,
  children,
}: {
  tenantId: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const onUnlockPage = Boolean(pathname?.endsWith("/unlock"));
  const exempt = isPinExemptTenantId(tenantId);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!tenantId || exempt || onUnlockPage) {
      setReady(true);
      return;
    }

    setReady(false);
    let cancelled = false;
    fetch(`/api/tenant/${tenantId}/access`)
      .then((r) => r.json())
      .then((data: { requiresPin?: boolean; hasValidUnlock?: boolean }) => {
        if (cancelled) return;
        if (data.requiresPin && !data.hasValidUnlock) {
          const next = `${pathname ?? `/${tenantId}`}${typeof window !== "undefined" ? window.location.search : ""}`;
          router.replace(`/${tenantId}/unlock?next=${encodeURIComponent(next)}`);
          return;
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [tenantId, pathname, router, exempt, onUnlockPage]);

  if (!ready) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2 px-5">
        <p className="text-gray-500 text-sm">アクセス確認中…</p>
      </div>
    );
  }
  return <>{children}</>;
}
