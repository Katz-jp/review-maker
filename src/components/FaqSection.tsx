"use client";

import { useState } from "react";

const faqItems = [
  {
    q: "Googleの規約違反（ペナルティ）になりませんか？",
    a: "本ツールは、あくまでお客様自身の「下書き作成」を支援するものです。AIが自動で投稿を行うわけではなく、お客様が内容を確認・編集した上で自ら投稿する仕組みのため、ガイドラインを遵守した運用が可能です。",
  },
  {
    q: "口コミの代わりに割引クーポンを渡してもいいですか？",
    a: "Googleの規約では「対価（割引や特典）としての口コミ」は禁止されています。本ツールは、対価ではなく「書きやすさの提供」によって口コミ率を高めるツールとしてご活用ください。",
  },
  {
    q: "ITに詳しくないスタッフでも運用できますか？",
    a: "はい、可能です。店舗側が行うのは「QRコードを設置して声をかける」だけです。操作説明用のPOPデザインも提供しますので、スタッフ様の負担はほとんどありません。",
  },
  {
    q: "返信AIはどんな文章を作りますか？",
    a: "口コミの内容を分析し、お礼の言葉と共に、お店のこだわりや狙いたいキーワード（例：「肩こり解消」「産後ケア」など）を自然に盛り込んだ丁寧な文章を提案します。",
  },
  {
    q: "解約に縛りはありますか？",
    a: "いいえ、最低利用期間などの縛りは一切ございません。無料トライアル期間中でも、いつでもマイページから簡単に解約が可能です。",
  },
  {
    q: "お客様に何をお願いすればいいですか？",
    a: "「30秒程で済むので、よかったらアンケートからクチコミ投稿のご協力をお願いします」と案内するだけでOK。お会計の場所や待合室などにQRコードを置いておくとスムーズです。",
  },
  {
    q: "低評価やネガティブな口コミにも対応できますか？",
    a: "オーナー様用の返信ヘルパーAIを使えば、落ち着いたトーンの返信案を提案できます。謝意・事実確認・改善意志・再発防止・来店導線などを自然に含めた形に整えられます。ネガティブな口コミにもほぼ心を乱されずに返信が可能です。",
  },
  {
    q: "月に何件くらい口コミが増えますか？",
    a: "QR設置＋会計時のひとこと、または公式LINEのメニューに追加など、お客様の目の行くところに設置するのがポイントです。",
  },
  {
    q: "返信文は、毎回同じ文になりませんか？",
    a: "毎回似たような文章が作られたり、一目でAIと分かる文章が続かないよう、文章の雰囲気や形式を変え、人間が書いたかのような揺らぎをプログラムしております。ぜひ一度無料デモでご体感ください！",
  },
  {
    q: "どのくらい手間が減りますか？",
    a: "口コミ依頼はリンクを渡すだけ、返信は下書きをベースに微調整するだけ、という運用に寄せられます。返信が止まっていた店舗ほど効果を実感しやすいです。",
  },
  {
    q: "お客様の入力内容や個人情報は保存されますか？",
    a: "入力された情報は一切保存されませんが、運用方針として、個人が特定される情報は入力しないようご案内ください。",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-10 pb-3 border-b-2 border-primary/50">
          よくある質問
        </h2>
        <div className="space-y-2 sm:space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-green-100 bg-green-50/50 overflow-hidden transition-colors hover:border-green-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center gap-3 px-4 sm:px-5 py-4 sm:py-5 text-left"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                >
                  <span className="shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                    ？
                  </span>
                  <span className="flex-1 font-semibold text-gray-800 text-sm sm:text-base">
                    {item.q}
                  </span>
                  <span
                    className={`shrink-0 w-6 h-6 flex items-center justify-center text-gray-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex items-start gap-3 px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                      <span className="shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm mt-0.5">
                        ✔️
                      </span>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed pt-1">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
