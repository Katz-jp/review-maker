import { WelcomeContent } from "@/components/WelcomeContent";
import { TrialChoiceContent } from "@/components/TrialChoiceContent";

export default function TenantWelcomePage({
  params,
  searchParams,
}: {
  params: { tenantId: string };
  searchParams: { industry?: string };
}) {
  if (params.tenantId === "trial") {
    return <TrialChoiceContent industry={searchParams.industry} />;
  }
  return <WelcomeContent tenantId={params.tenantId} />;
}
