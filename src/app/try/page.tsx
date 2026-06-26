"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { getRemainingGenerations, MAX_DEMO_GENERATIONS, isDevelopment } from "@/lib/demo-limit";

export default function TryPage() {
  const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dev = isDevelopment();
      setIsDev(dev);
      if (!dev) {
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
              実際に口コミ文を生成してみましょう！
            </h1>
            <p className="text-base text-gray-600">
              アンケートに答えるだけで、AIが口コミ文を自動作成。
              <br />
              登録不要・30秒で体験できます。
            </p>
          </div>

          {/* お試しエリア */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-green-200 shadow-sm">
            {/* 残り回数 */}
            {!isDev && remainingGenerations !== null && remainingGenerations < MAX_DEMO_GENERATIONS && (
              <div className="mb-4 text-center">
                <p className="text-sm font-semibold text-gray-700">
                  <span className="text-primary text-lg">無料お試し：残り{remainingGenerations}回</span>
                </p>
              </div>
            )}

            {/* 制限に達した場合 */}
            {!isDev && remainingGenerations === 0 ? (
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
                  ※ 無料お試しは最大5回まで
                </p>
              </div>
            )}
          </div>

          {/* トップへのリンク */}
          <p className="text-center mt-6 text-sm text-gray-500">
            サービス詳細は
            <Link href="/" className="text-primary hover:underline ml-1">
              こちら
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
