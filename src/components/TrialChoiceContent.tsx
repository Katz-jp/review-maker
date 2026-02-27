"use client";

import Link from "next/link";
import { MessageCircle, Sparkles, Home } from "lucide-react";

interface TrialChoiceContentProps {
  industry?: string;
}

export function TrialChoiceContent({ industry }: TrialChoiceContentProps) {
  const createHref = industry
    ? `/trial/create?industry=${industry}`
    : "/trial/create";
  return (
    <main className="min-h-screen flex flex-col px-5 pt-10 pb-12 max-w-lg mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
          無料でデモを試す
        </h1>
        <p className="text-base text-gray-600">
          それぞれ5回までお試しいただけます
        </p>
      </header>

      <section className="flex-1 space-y-5">
        <Link
          href={createHref}
          className="block bg-white rounded-2xl p-6 shadow-sm border-2 border-green-100 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-dark" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                クチコミ作成支援AI
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                施術の感想をアンケートでお聞きして、AIが口コミの下書きを作成します。
              </p>
              <span className="text-sm font-semibold text-primary">
                5回までお試し可能 →
              </span>
            </div>
          </div>
        </Link>

        <Link
          href="/trial/reply-helper"
          className="block bg-white rounded-2xl p-6 shadow-sm border-2 border-green-100 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary-dark" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                クチコミ返信ヘルプAI
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                お客様の口コミに合わせた返信文をAIで生成できます。
              </p>
              <span className="text-sm font-semibold text-primary">
                5回までお試し可能 →
              </span>
            </div>
          </div>
        </Link>
      </section>

      <div className="mt-auto pt-8 border-t border-gray-200">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          トップページに戻る
        </Link>
      </div>
    </main>
  );
}
