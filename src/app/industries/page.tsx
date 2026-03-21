"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Store, Stethoscope, UtensilsCrossed } from "lucide-react";

const INDUSTRIES = [
  {
    slug: "seikotsu",
    label: "整骨院・整体",
    description: "施術の感想をアンケートでお聞きして、口コミの下書きを作成します。",
    icon: Stethoscope,
    available: true,
  },
  {
    slug: "retail",
    label: "小売店",
    description: "お店の体験をもとに口コミ文を生成します。",
    icon: Store,
    available: true,
  },
  {
    slug: "restaurant",
    label: "飲食店",
    description: "来店の体験をもとに口コミ文を生成します。",
    icon: UtensilsCrossed,
    available: true,
  },
  {
    slug: "dentist",
    label: "歯医者・クリニック",
    description: "診療体験をもとに口コミの下書きを作成します。",
    icon: Building2,
    available: true,
  },
] as const;

export default function IndustriesListPage() {
  return (
    <div className="min-h-screen flex flex-col bg-green-50 text-gray-800 antialiased">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-green-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-gray-600 hover:text-primary-dark text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            トップに戻る
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-10 sm:py-12 max-w-2xl mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            対応業種を選ぶ
          </h1>
          <p className="text-base text-gray-600">
            業種に合わせたベネフィットと無料デモをご用意しています
          </p>
        </div>

        <section className="space-y-4">
          {INDUSTRIES.map((item) => {
            const Icon = item.icon;
            const isAvailable = item.available;
            const href = isAvailable ? `/industries/${item.slug}` : "#";
            const content = (
              <div
                className={`flex items-start gap-4 rounded-2xl p-6 border-2 transition-all ${
                  isAvailable
                    ? "bg-white border-green-100 hover:border-primary/50 hover:shadow-md"
                    : "bg-gray-50 border-gray-200 opacity-75"
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
                      詳しく見る →
                    </span>
                  )}
                </div>
              </div>
            );

            return isAvailable ? (
              <Link key={item.slug} href={href}>
                {content}
              </Link>
            ) : (
              <div key={item.slug} className="cursor-not-allowed">
                {content}
              </div>
            );
          })}
        </section>
      </main>
      <footer className="py-6 text-center text-sm text-gray-500 border-t border-green-100 mt-auto">
        ©2026 くーままAIラボ
      </footer>
    </div>
  );
}
