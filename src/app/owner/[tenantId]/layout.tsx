import { TenantAccessGuard } from "@/components/TenantAccessGuard";

export default function OwnerTenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantId: string };
}) {
  return <TenantAccessGuard tenantId={params.tenantId}>{children}</TenantAccessGuard>;
}
