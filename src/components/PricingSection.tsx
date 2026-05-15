"use client";

import Link from "next/link";

/**
 * 先行導入・成長支援プラン 料金セクション
 * 残り枠数は管理画面から可変にする想定で定数化しています。
 */
export const FIRST_PHASE_SLOTS_TOTAL = 30;
export const FIRST_PHASE_SLOTS_REMAINING = 12;

const phases = [
  {
    id: "phase1" as const,
    price: 9980,
    priceNote: "税込",
    isCurrent: true,
    isUpcoming: false,
    description: "現在のプラン",
  },
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100 scroll-mt-16"
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3 pb-3 border-b-2 border-primary/50 leading-snug">
          <span className="block">
            🎉 先着30社限定キャンペーン 🎊
          </span>
          <span className="block mt-3 text-2xl sm:text-3xl text-green-600">初月無料＋２ヶ月目・３ヶ月目は半額！</span>
        </h2>
        <p className="text-center text-base text-gray-700 font-medium mb-2">
          先行導入パートナー様を募集しています
        </p>
        <p className="text-center text-sm text-gray-600 mb-6 max-w-2xl mx-auto">
          先行導入パートナーとしてご契約いただいた方には、初月０円、２ヶ月目・３ヶ月目は4,990円（税込）でご利用いただけます！
        </p>

        <div className="grid grid-cols-1 max-w-lg mx-auto gap-4 sm:gap-6 mb-8">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className={`relative rounded-2xl p-6 sm:p-6 border-2 shadow-sm ${
                phase.isCurrent
                  ? "bg-green-50 border-primary ring-2 ring-primary/30"
                  : phase.isUpcoming
                    ? "bg-gray-100 border-gray-200"
                    : "bg-white border-green-200"
              }`}
            >
              {phase.isCurrent && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-gray-900 text-xs font-bold shadow">
                  現在のプラン
                </span>
              )}
              <div className={`text-center ${phase.isUpcoming ? "text-gray-500" : ""}`}>
                <p className={`text-2xl sm:text-3xl font-bold ${phase.isUpcoming ? "text-gray-500" : "text-gray-800"}`}>
                  {phase.isCurrent ? (
                    <>
                      初月0円＋
                      <br />
                      2ヶ月目・3ヶ月目は4,990円
                    </>
                  ) : (
                    <>
                      月額{phase.price.toLocaleString()}円
                      <span className={`text-sm font-normal ml-1 ${phase.isUpcoming ? "text-gray-400" : "text-gray-600"}`}>
                        （{phase.priceNote}）
                      </span>
                    </>
                  )}
                </p>
                {phase.isCurrent && (
                  <p className="mt-3 text-center text-sm font-bold text-amber-700 border-l-4 border-amber-500 pl-3 py-1.5">
                    4ヶ月目以降は、通常の月額9,980円（税込）となります
                  </p>
                )}
                {!phase.isCurrent && (
                  <p className={`mt-1 text-xs ${phase.isUpcoming ? "text-gray-400" : "text-gray-500"}`}>{phase.description}</p>
                )}
                {phase.isCurrent && (
                  <Link
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfilsWAERsNkC6Z_761_i-XPR9wVUAbKE7uByouR5iNng4y_w/viewform?usp=header"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block w-full px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-semibold text-sm text-center transition-colors shadow-md hover:shadow-lg"
                  >
                    1ヶ月無料で始めてみる
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
