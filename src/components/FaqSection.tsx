"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

type FaqItem = {
  q: string;
  a: ReactNode;
};

const faqItems: FaqItem[] = [
  {
    q: "Googleの規約違反（ペナルティ）になりませんか？",
    a: "本ツールは、あくまで患者様自身の「下書き作成」を支援するものです。AIが自動で投稿を行うわけではなく、患者様が内容を確認・編集した上で自ら投稿する仕組みのため、ガイドラインを遵守した運用が可能です。",
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
    a: "口コミの内容を分析し、お礼の言葉と共に、お店のこだわりや狙いたいキーワード（例：「痛くない」「自費治療」など）を自然に盛り込んだ丁寧な文章を提案します。",
  },
  {
    q: "解約に縛りはありますか？",
    a: "いいえ、最低利用期間などの縛りは一切ございません。無料トライアル期間中でも、いつでもマイページから簡単に解約が可能です。",
  },
  {
    q: "患者様に何をお願いすればいいですか？",
    a: "「もしよかったら、今日の感想を教えていただけると嬉しいです。」「スタッフへの励みになります」と案内するだけでOK。お会計の場所や待合室などにQRコードを置いておくとスムーズです。",
  },
  {
    q: "低評価やネガティブな口コミにも対応できますか？",
    a: (
      <>
        オーナー様用の
        <Link href="/trial/reply-helper" className="text-primary-dark hover:underline font-medium">
          返信ヘルパーAI
        </Link>
        を使えば、落ち着いたトーンの返信案を提案できます。謝意・事実確認・改善意志・再発防止・来店導線などを自然に含めた形に整えられます。ネガティブな口コミにもほぼ心を乱されずに返信が可能です。
      </>
    ),
  },
  {
    q: "月に何件くらい口コミが増えますか？",
    a: "正直なところ、件数は保証できません。ただ、「書きたいけど書けない」という患者さんの手が止まる理由をなくすツールなので、QRコードの設置場所と、受付での一言声がけをセットで実践していただいた医院さんでは実感が出やすいです。まずは1ヶ月試していただくのが一番わかりやすいと思います。",
  },
  {
    q: "返信文は、毎回同じ文になりませんか？",
    a: "毎回似たような文章が作られたり、一目でAIと分かる文章が続かないよう、文章の雰囲気や形式を変え、人間が書いたかのような揺らぎをプログラムしております。ぜひ一度無料デモでご体感ください！",
  },
  {
    q: "患者さんの手間はどのくらいですか？",
    a: "アンケートはすべて選択式で、所要時間は約1分です。文章を一から考える必要はなく、AIが自動で口コミ文を生成します。「何を書けばいいかわからない」という方でも、そのままGoogleマップへ投稿できます。",
  },
  {
    q: "患者様の入力内容や個人情報は保存されますか？",
    a: "入力された情報は一切保存されませんが、運用方針として、個人が特定される情報は入力しないようご案内ください。",
  },
  {
    q: "導入にどのくらい手間がかかりますか？",
    a: "システムの工事や設備投資は一切不要です。アカウント発行後、お送りするQRコードのカードを待合室や受付に置くだけで準備完了です。最短1日で運用を開始できます。",
  },
  {
    q: "口コミの文章はどのように作られますか？",
    a: "患者さんがアンケート（全8問・選択式）に回答した内容をもとに、AIが自然な口コミ文を自動生成します。生成された文章は患者さんご自身で確認・修正でき、気に入らない場合は「別の表現を試す」ボタンで再生成もできます。",
  },
  {
    q: "Googleマップへの投稿は患者さんが自分でやるのですか？",
    a: "はい。口コミの投稿は患者さんご自身に行っていただきます。「Googleに口コミを投稿する」ボタンからGoogleマップへ直接移動して貼り付けるだけです。操作は画面の案内に沿って進めるだけなので、ITが苦手な方でもご利用いただけます。",
  },
  {
    q: "口コミへの返信もサポートしてもらえますか？",
    a: "はい。管理画面から「口コミ返信ヘルプAI」をご利用いただけます。届いた口コミを貼り付けるだけで、AIが返信文の下書きを約30秒で生成します。フレンドリー・丁寧・プロフェッショナルの3つの文体から選べ、低評価への返信にも対応しています。",
  },
  {
    q: "アンケートの選択肢は変えられますか？",
    a: "はい。管理画面から各設問にオリジナルの選択肢を最大3つまで追加できます。医院の特色や強みに合わせてカスタマイズしていただくと、より医院らしい口コミ文が生成されます。",
  },
  {
    q: "料金はいくらですか？",
    a: "月額9,980円で使い放題プランをご用意しております。なお、初月無料・初期費用不要・契約の縛りはありませんので、いつでも好きなときに解約していただけます。",
  },
  {
    q: "操作がわからなくなったときはどうすればいいですか？",
    a: "管理画面内に操作方法の解説動画（YouTube）を3本掲載しています。それでも解決しない場合は、メール／問い合わせフォームでの有人サポートもございますので安心してお使いください。",
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
