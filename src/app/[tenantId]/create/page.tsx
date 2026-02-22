"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Store, Stethoscope } from "lucide-react";
import { TRIAL_INDUSTRY_KEY } from "@/lib/trial";

const INDUSTRIES = [
  {
    id: "seikotsuin",
    label: "整骨院・整体",
    description: "施術の感想をアンケートでお聞きして、口コミの下書きを作成します。",
    icon: Stethoscope,
    available: true,
  },
  {
    id: "kouri",
    label: "小売店",
    description: "お店の体験をもとに口コミ文を生成します。",
    icon: Store,
    available: false,
  },
  {
    id: "haisha",
    label: "歯医者・クリニック",
    description: "診療体験をもとに口コミの下書きを作成します。",
    icon: Building2,
    available: false,
  },
] as const;

export default function TrialCreatePage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = (params.tenantId as string) || "";

  // trial 以外はそのままアンケートへ（業種選択は trial のみ）
  useEffect(() => {
    if (tenantId && tenantId !== "trial") {
      router.replace(`/${tenantId}/questionnaire`);
    }
  }, [tenantId, router]);

  if (tenantId && tenantId !== "trial") {
    return null;
  }

  const handleSelectIndustry = (industryId: string) => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(TRIAL_INDUSTRY_KEY, industryId);
    router.push("/trial/questionnaire");
  };

  return (
    <main className="min-h-screen flex flex-col px-5 pt-10 pb-12 max-w-lg mx-auto">
      <Link
        href="/trial"
        className="inline-flex items-center gap-1 text-gray-600 text-sm py-2 -ml-1 mb-4 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        戻る
      </Link>

      <header className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
          業種を選んでください
        </h1>
        <p className="text-base text-gray-600">
          クチコミ作成支援AIは業種ごとに最適な質問でお聞きします
        </p>
      </header>

      <section className="flex-1 space-y-4">
        {INDUSTRIES.map((item) => {
          const Icon = item.icon;
          const isAvailable = item.available;
          return (
            <div
              key={item.id}
              role={isAvailable ? "button" : undefined}
              onClick={isAvailable ? () => handleSelectIndustry(item.id) : undefined}
              className={`flex items-start gap-4 rounded-2xl p-6 border-2 transition-all ${
                isAvailable
                  ? "bg-white border-green-100 hover:border-primary/50 hover:shadow-md cursor-pointer"
                  : "bg-gray-50 border-gray-200 cursor-not-allowed opacity-75"
              }`}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary-dark" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                  {item.label}
                  {!isAvailable && (
                    <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                      準備中
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-600">{item.description}</p>
                {isAvailable && (
                  <span className="inline-block mt-2 text-sm font-semibold text-primary">
                    5回までお試し可能 →
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
