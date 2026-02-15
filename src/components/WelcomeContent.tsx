"use client";

import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";

export function WelcomeContent({ tenantId }: { tenantId: string }) {
  const tenant = useTenant();

  return (
    <main className="min-h-screen flex flex-col px-5 pt-10 pb-12 max-w-lg mx-auto">
      <header className="text-center mb-8">
        <p className="text-xl font-bold text-primary-dark mb-3">{tenant.name}</p>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
          <MessageCircle className="w-8 h-8 text-primary-dark" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-800">
          口コミ作成支援AI
        </h1>
        <p className="text-base font-semibold text-gray-700 mt-2">
          AIがあなたの体験を、伝わりやすい口コミに
        </p>
      </header>

      <section className="flex-1 space-y-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            このアプリについて
          </h2>
          <p className="text-base font-medium text-gray-700 leading-relaxed">
            施術の感想をお聞きして、AIが口コミの下書きを作成します。
            これはあくまでも文章作成のためのサポートツールですので、必ず内容の確認をし、ご自分の言葉として自由に調整してクチコミ投稿してください。
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <ul className="text-base font-semibold text-gray-700 space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-primary-dark font-bold">✓</span>
              所要時間は約30秒
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-dark font-bold">✓</span>
              タップで簡単入力
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-dark font-bold">✓</span>
              その場で編集・コピー可能
            </li>
          </ul>
        </div>
      </section>

      <div className="mt-auto pt-8">
        <Link
          href={`/${tenantId}/questionnaire`}
          className="block w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-lg text-center shadow-md active:scale-[0.98] transition-transform"
        >
          アンケートを始める
        </Link>
      </div>
    </main>
  );
}
