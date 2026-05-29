import { TenantProvider } from "@/components/TenantProvider";
import { TenantAccessGuard } from "@/components/TenantAccessGuard";

/** テナントごとに動的表示（静的パス生成時の Firebase バンドル不整合を避ける） */
export const dynamic = "force-dynamic";

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantId: string };
}) {
  return (
    <TenantProvider tenantId={params.tenantId}>
      <TenantAccessGuard tenantId={params.tenantId}>{children}</TenantAccessGuard>
    </TenantProvider>
  );
}
