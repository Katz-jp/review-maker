import { TenantProvider } from "@/components/TenantProvider";

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantId: string };
}) {
  return <TenantProvider tenantId={params.tenantId}>{children}</TenantProvider>;
}
