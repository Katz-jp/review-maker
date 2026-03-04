"use client";

import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";

export function WelcomeContent({ tenantId }: { tenantId: string }) {
  const tenant = useTenant();

  return (
    <main className="min-h-screen flex flex-col px-5 pt-10 pb-12 max-w-lg mx-auto">
      <header className="text-center mb-6">
        <p className="text-xl font-bold text-primary-dark">{tenant.name}</p>
      </header>

      <section className="text-center mb-10">
        <h1 className="text-2xl font-extrabold text-gray-800 leading-tight">
          口コミ投稿に
          <br />
          ご協力お願いします
        </h1>
        <p className="text-2xl mt-2 tracking-widest">⭐️⭐️⭐️⭐️⭐️</p>
        <p className="text-base text-gray-600 mt-3">
          今日のご感想を口コミで教えていただけると嬉しいです😊
        </p>
      </section>

      <div className="space-y-4">
        <a
          href={tenant.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-lg text-center shadow-md active:scale-[0.98] transition-transform"
        >
          <MapPin className="w-5 h-5" />
          Googleマップを開いて投稿する（30秒）
        </a>

        <Link
          href={`/${tenantId}/questionnaire`}
          className="block w-full py-4 px-6 rounded-2xl bg-white border-2 border-primary text-primary-dark font-bold text-lg text-center shadow-sm active:scale-[0.98] transition-transform"
        >
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            AIで口コミを作る
          </span>
          <span className="block text-sm font-normal text-gray-500 mt-1">
            質問に答えるだけで文章を作成
          </span>
        </Link>
      </div>

      <p className="text-xs text-gray-400 text-center mt-8">
        AIは口コミ文章の作成をお手伝いします。内容は自由に編集して投稿してください
      </p>
    </main>
  );
}
