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
    label: "第1期",
    subLabel: "限定30社",
    price: 4980,
    priceNote: "税込",
    isCurrent: true,
    isUpcoming: false,
    description: "現在のプラン",
  },
  {
    id: "phase2" as const,
    label: "第2期",
    subLabel: "限定50社",
    price: 7980,
    priceNote: "予定",
    isCurrent: false,
    isUpcoming: true,
    description: "第1期枠が埋まり次第スタート",
  },
  {
    id: "phase3" as const,
    label: "第3期",
    subLabel: "正規価格",
    price: 9980,
    priceNote: "予定",
    isCurrent: false,
    isUpcoming: true,
    description: "通常価格",
  },
];

const REGULAR_PRICE = 9980;
const CURRENT_PRICE = 4980;
const MAX_SAVINGS = REGULAR_PRICE - CURRENT_PRICE; // 5,000円

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100 scroll-mt-16"
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3 pb-3 border-b-2 border-primary/50">
          今だけ！先行特別キャンペーン実施中🎉
        </h2>
        <p className="text-center text-base text-gray-700 font-medium mb-2">
          【先着30社限定】第1期・先行導入パートナーを募集します！
        </p>
        <p className="text-center text-sm text-gray-600 mb-6 max-w-2xl mx-auto">
          第1期にご契約いただいた方は、解約されない限り
          <br />
          <strong className="text-gray-800">永久に月額4,980円</strong>
          でご利用いただけます。
        </p>

        {/* 3段階カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
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
                <p className={`text-sm font-semibold ${phase.isUpcoming ? "text-gray-500" : "text-gray-600"}`}>
                  {phase.label}
                  <span className="text-xs font-normal ml-1">（{phase.subLabel}）</span>
                </p>
                <p className={`mt-2 text-2xl sm:text-3xl font-bold ${phase.isUpcoming ? "text-gray-500" : "text-gray-800"}`}>
                  {(phase.isCurrent || phase.id === "phase2" || phase.id === "phase3") && "初月無料、"}
                  月額{phase.price.toLocaleString()}円
                  <span className={`text-sm font-normal ml-1 ${phase.isUpcoming ? "text-gray-400" : "text-gray-600"}`}>
                    （{phase.priceNote}）
                  </span>
                </p>
                {(phase.isCurrent || phase.id === "phase2") && (
                  <p className={`mt-1 text-sm line-through ${phase.isUpcoming ? "text-gray-400" : "text-gray-500"}`}>
                    正規価格 月額{REGULAR_PRICE.toLocaleString()}円
                  </p>
                )}
                {phase.isCurrent && (
                  <p className="mt-3 text-center text-sm font-bold text-amber-700 border-l-4 border-amber-500 pl-3 py-1.5">
                    🎊 初月無料＆2ヶ月目、3ヶ月目は50%OFF（2,490円）でご利用いただけます！
                  </p>
                )}
                {!phase.isCurrent && (
                  <p className={`mt-1 text-xs ${phase.isUpcoming ? "text-gray-400" : "text-gray-500"}`}>{phase.description}</p>
                )}
                {phase.isCurrent && (
                  <Link
                    href="/contact"
                    className="mt-4 inline-block w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-semibold text-sm text-center transition-colors shadow-md hover:shadow-lg"
                  >
                    第1期先行価格で申し込む
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
