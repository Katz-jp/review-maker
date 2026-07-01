"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { getRemainingGenerations, MAX_DEMO_GENERATIONS, isDemoLimitUiActive } from "@/lib/demo-limit";
import { DemoLimitPreviewBanner } from "@/components/DemoLimitPreview";

export default function TryPage() {
  const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null);
  const [showDemoLimitUi, setShowDemoLimitUi] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = isDemoLimitUiActive("generate");
      setShowDemoLimitUi(active);
      if (active) {
        const remaining = getRemainingGenerations("trial", "generate");
        setRemainingGenerations(remaining);
      }
      // GAイベント：tryページ到達
      if (typeof window.gtag !== "undefined") {
        window.gtag("event", "try_page_view", {
          event_category: "postcard_campaign",
          event_label: "dental_dm_b",
        });
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-green-50 text-gray-800 antialiased">
      <DemoLimitPreviewBanner />
      {/* シンプルヘッダー */}
      <header className="bg-white border-b border-green-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <BrandLogo />
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            サービス詳細 →
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          {/* タイトル */}
          <div className="text-center mb-8">
            <div className="inline-block bg-primary text-white text-xs font-bold tracking-wider px-3.5 py-1 rounded-full mb-3.5">
              Try it now!
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              実際に口コミ文を作成してみる！
            </h1>
            <p className="text-base text-gray-600">
              アンケートに答えるだけで、
              <br />
              AIが口コミ文を自動作成。
              <br />
              登録不要・30秒で体験できます。
            </p>
          </div>

          {/* お試しエリア */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-green-200 shadow-sm">
            {/* 残り回数 */}
            {showDemoLimitUi && remainingGenerations !== null && remainingGenerations < MAX_DEMO_GENERATIONS && (
              <div className="mb-4 text-center">
                <p className="text-sm font-semibold text-gray-700">
                  <span className="text-primary text-lg">無料お試し：残り{remainingGenerations}回</span>
                </p>
              </div>
            )}

            {/* 制限に達した場合 */}
            {showDemoLimitUi && remainingGenerations === 0 ? (
              <div className="space-y-4">
                <p className="text-base font-bold text-gray-900 text-center mb-2">
                  5回のお試し、いかがでしたか？
                </p>
                <p className="text-sm text-gray-600 text-center mb-4">
                  今なら全機能を1ヶ月間無料でお試しいただけます。
                </p>
                <a
                  href="https://docs.google.com/forms/d/11ikD7LepY89LQ3pCg28Ahk3BEgXR3cGLzf7FDNGn82k/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm text-center transition-colors"
                  onClick={() => {
                    window.gtag?.("event", "signup_click", {
                      event_category: "postcard_campaign",
                      event_label: "dental_dm_b",
                    });
                  }}
                >
                  1ヶ月無料トライアルに申し込む
                </a>
                <p className="text-xs text-gray-500 text-center">
                  ※トライアル期間中に解約すれば費用は一切かかりません。
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Link
                  href="/trial/questionnaire"
                  className="block w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg text-center shadow-md hover:shadow-lg transition-all"
                  onClick={() => {
                    window.gtag?.("event", "try_app_click", {
                      event_category: "postcard_campaign",
                      event_label: "dental_dm_b",
                    });
                  }}
                >
                  口コミ文を生成してみる →
                </Link>
                <p className="text-xs text-gray-500 text-center">
                  5回お試しいただけます
                </p>
              </div>
            )}
          </div>

          {/* サービス詳細へのリンク */}
          <p className="text-center mt-6 text-lg font-semibold text-gray-700">
            Review Maker Pro の詳細は
            <a
              href="https://review-maker-sable.vercel.app/industries/dentist"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline ml-1"
            >
              こちら
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
