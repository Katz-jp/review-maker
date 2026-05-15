import { TenantProvider } from "@/components/TenantProvider";
import { TenantAccessGuard } from "@/components/TenantAccessGuard";

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
