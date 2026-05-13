"use client";

import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { getReviewOrMapUrl } from "@/lib/review-link";

export function WelcomeContent({ tenantId }: { tenantId: string }) {
  const tenant = useTenant();

  return (
    <main className="min-h-screen flex flex-col px-5 pt-10 pb-12 max-w-lg mx-auto">
      <header className="text-center mb-6">
        <p className="text-[2.5rem] leading-tight font-bold text-primary-dark">
          {tenant.name}
        </p>
      </header>

      <section className="text-center mb-10">
        <h1 className="text-2xl font-extrabold text-gray-800 leading-tight">
          Googleマップへの口コミ投稿に
          <br />
          ご協力をお願いします
        </h1>
        <p className="text-2xl mt-2 tracking-widest">⭐️⭐️⭐️⭐️⭐️</p>
        <p className="text-[18px] text-[#000000] mt-3">
          より良いサービスづくりと
          <br />
          これからご利用される方の参考のため、
          <br />
          ご感想をお聞かせいただけると嬉しいです😊
        </p>
      </section>

      <div className="space-y-4">
        <a
          href={getReviewOrMapUrl(tenant, tenantId)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Googleに口コミを投稿する（Googleマップが開きます）"
          className="flex w-full items-start justify-center gap-2 py-4 px-6 rounded-2xl bg-primary hover:bg-primary-dark text-[#000000] font-bold text-lg text-center shadow-md active:scale-[0.98] transition-transform"
        >
          <MapPin className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
          <span className="min-w-0 flex-1 leading-snug text-center">
            Googleに口コミを投稿する
            <br />
            <span className="text-sm font-bold">（Googleマップが開きます）</span>
          </span>
        </a>

        <Link
          href={`/${tenantId}/questionnaire`}
          className="block w-full py-4 px-6 rounded-2xl bg-white border-2 border-primary text-[#000000] font-bold text-lg text-center shadow-sm active:scale-[0.98] transition-transform"
        >
          <span className="flex w-full items-start justify-center gap-2">
            <Sparkles className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
            <span className="min-w-0 flex-1 leading-snug text-center">
              アンケートに答えて口コミの下書き文章を作る（所要時間約１分）
            </span>
          </span>
          <span className="mt-1 block text-base font-normal leading-relaxed text-[#000000] text-center">
            「何から書けばいいかわからない」という方は、簡単なアンケートに答えていただくと AI が文章を作るお手伝いをします
          </span>
        </Link>
      </div>
    </main>
  );
}
