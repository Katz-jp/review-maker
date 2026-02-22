import { WelcomeContent } from "@/components/WelcomeContent";
import { TrialChoiceContent } from "@/components/TrialChoiceContent";

export default function TenantWelcomePage({
  params,
}: {
  params: { tenantId: string };
}) {
  if (params.tenantId === "trial") {
    return <TrialChoiceContent />;
  }
  return <WelcomeContent tenantId={params.tenantId} />;
}
