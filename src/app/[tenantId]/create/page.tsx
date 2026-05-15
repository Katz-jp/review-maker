"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { TRIAL_INDUSTRY_KEY } from "@/lib/demo-limit";
import { TRIAL_POSTING_SESSION_INDUSTRY_ID } from "@/lib/posting-support-constants";

export default function TrialCreatePage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = (params.tenantId as string) || "";

  useEffect(() => {
    if (tenantId !== "trial") return;
    if (typeof window === "undefined") return;
    sessionStorage.setItem(TRIAL_INDUSTRY_KEY, TRIAL_POSTING_SESSION_INDUSTRY_ID);
    router.replace("/trial/questionnaire");
  }, [tenantId, router]);

  useEffect(() => {
    if (tenantId && tenantId !== "trial") {
      router.replace(`/${tenantId}/questionnaire`);
    }
  }, [tenantId, router]);

  if (tenantId && tenantId !== "trial") {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 bg-green-50 text-gray-600">
      <p className="text-base">アンケートへ移動しています…</p>
    </main>
  );
}
