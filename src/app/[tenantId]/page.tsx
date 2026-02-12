import { WelcomeContent } from "@/components/WelcomeContent";

export default function TenantWelcomePage({
  params,
}: {
  params: { tenantId: string };
}) {
  return <WelcomeContent tenantId={params.tenantId} />;
}
