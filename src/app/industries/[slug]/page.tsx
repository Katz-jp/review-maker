"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import PricingSection from "@/components/PricingSection";

const TRIAL_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfilsWAERsNkC6Z_761_i-XPR9wVUAbKE7uByouR5iNng4y_w/viewform?usp=header";

/** 業種スラッグから trial 用 industry id へのマッピング（sessionStorage 用） */
const SLUG_TO_TRIAL_ID: Record<string, string> = {
  seikotsu: "seikotsuin",
  retail: "kouri",
  dentist: "haisha",
};

export default function IndustryLandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;
  const trialId = SLUG_TO_TRIAL_ID[slug];

  if (slug === "seikotsu") {
    return (
      <div className="min-h-screen flex flex-col bg-green-50 text-gray-800 antialiased">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-green-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
            <Link
              href="/industries"
              className="inline-flex items-center gap-1 text-gray-600 hover:text-primary-dark text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              対応業種一覧
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-primary-dark transition-colors"
            >
              口コミ投稿サポートAI
            </Link>
          </div>
        </header>

        <main className="flex-1">
          {/* ヒーロー */}
          <section className="px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              新規患者が増える整骨院のための
              <br />
              口コミ戦略ツール
            </h1>
            <p className="mt-6 text-xl sm:text-2xl font-semibold text-gray-800">
              Googleマップの口コミを
              <br />
              「集客の装置」に変えませんか？
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={trialId ? `/trial?industry=${trialId}` : "/trial"}
                className="inline-block py-4 px-6 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-bold text-lg text-center shadow-md hover:shadow-lg transition-all"
              >
                無料でデモを試す
              </Link>
              <a
                href={TRIAL_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-4 px-6 rounded-xl bg-white border-2 border-primary text-primary hover:bg-primary/10 font-bold text-lg text-center shadow-md hover:shadow-lg transition-all"
              >
                1ヶ月無料トライアル
              </a>
            </div>
            <div className="mt-8 flex justify-center overflow-hidden">
              <Image
                src="/industry-hero-review.png"
                alt="生成された口コミの画面"
                width={320}
                height={480}
                className="w-full max-w-[320px] h-auto rounded-xl drop-shadow-lg object-contain"
                unoptimized
              />
            </div>
            <p className="mt-6 text-center text-base sm:text-lg font-semibold text-gray-700">
              施術の合間に、さくっと使えます。
            </p>
          </section>

          {/* こんなお悩み */}
          <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
                こんなお悩みありませんか？
              </h2>
              <ul className="space-y-3 text-base sm:text-lg text-gray-700">
                <li>・紹介頼みで新規が安定しない</li>
                <li>・Google検索で他院に埋もれている</li>
                <li>・口コミが少なくて不安</li>
                <li>・返信が面倒で後回しになっている</li>
                <li>・交通事故や産後骨盤矯正などの強みが伝わっていない</li>
              </ul>
              <p className="mt-8 text-center text-lg font-semibold text-gray-800">
                ひとつでも当てはまるなら、この仕組みが役立ちます。
              </p>
            </div>
          </section>

          {/* 患者さんはこうやって院を選んでいます */}
          <section className="px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
              患者さんはこうやって院を選んでいます
            </h2>
            <ol className="space-y-4 text-base sm:text-lg text-gray-700 list-decimal list-inside">
              <li>「地域名＋腰痛／交通事故／整骨院」で検索</li>
              <li>Googleマップを開く</li>
              <li>口コミ数と星を見る</li>
              <li>返信の丁寧さを見る</li>
              <li>「ここにしよう」と決める</li>
            </ol>
            <p className="mt-10 text-center text-xl font-bold text-primary">
              選ばれるかどうかは
              <br />
              &quot;口コミの見え方&quot;で決まります。
            </p>
          </section>

          {/* このツールでできること */}
          <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
                このツールでできること
              </h2>
              <ul className="space-y-8">
                <li>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">① 口コミ投稿率を上げる</h3>
                  <p className="text-gray-700">質問形式で書きやすく。「書こうかな」で終わらせません。</p>
                </li>
                <li>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">② キーワードを自然に増やす</h3>
                  <p className="text-gray-700">腰痛／交通事故／産後骨盤矯正など狙ったワードを自然に反映。</p>
                </li>
                <li>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">③ 返信を自動生成</h3>
                  <p className="text-gray-700">忙しい時間帯でも、丁寧な返信を即作成。</p>
                </li>
                <li>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">④ ネガティブ口コミにも即対応</h3>
                  <p className="text-gray-700">適切なトーンで信用を守る。</p>
                </li>
                <li>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">⑤ Googleマップ上の&quot;動き&quot;を作る</h3>
                  <p className="text-gray-700">投稿＋返信で更新頻度アップ。</p>
                </li>
              </ul>
            </div>
          </section>

          {/* 選ばれる整骨院は、口コミで決まる */}
          <section className="px-4 sm:px-6 py-14 sm:py-20 bg-white border-y border-green-100">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block mb-6 pb-3 border-b-2 border-primary/40">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  選ばれる整骨院は、口コミで決まる
                </h2>
              </div>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                痛みや不安を抱えた患者さんは、
                <br />
                必ず口コミを読んでから来院を決めます。
                <br />
                そのときに
                <br />
                「自分と似た症状の声」があるかどうかで
                <br />
                選ばれるかどうかが決まります。
                <br />
                口コミは、信頼を見える化する資産です。
              </p>
            </div>
          </section>

          {/* 先生にとっての本当のメリット */}
          <section className="px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
              先生にとっての本当のメリット
            </h2>
            <ul className="space-y-3 text-base sm:text-lg text-gray-700">
              <li>・月に新規患者が1人増えれば十分回収可能</li>
              <li>・広告より低コスト</li>
              <li>・口コミは消えない&quot;資産&quot;</li>
              <li>・来院前の不安を減らせる</li>
              <li>・「ちゃんと経営している院」に見える</li>
            </ul>
          </section>

          {/* 料金 + CTA */}
          <PricingSection />

          <section className="px-4 sm:px-6 py-12 sm:py-16 bg-green-50 border-t border-green-100">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-lg font-semibold text-gray-800 mb-6">
                まずは1ヶ月、無料で体験してください。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={trialId ? `/trial?industry=${trialId}` : "/trial"}
                  className="inline-block py-4 px-6 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-bold text-lg text-center shadow-md hover:shadow-lg transition-all"
                >
                  無料でデモを試す
                </Link>
                <a
                  href={TRIAL_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-4 px-6 rounded-xl bg-white border-2 border-primary text-primary hover:bg-primary/10 font-bold text-lg text-center shadow-md hover:shadow-lg transition-all"
                >
                  1ヶ月無料トライアル
                </a>
              </div>
            </div>
          </section>
        </main>
        <footer className="py-6 text-center text-sm text-gray-500 border-t border-green-100">
          ©2026 くーままAIラボ
        </footer>
      </div>
    );
  }

  if (slug === "retail") {
    return (
      <div className="min-h-screen flex flex-col bg-green-50 text-gray-800 antialiased">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-green-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
            <Link
              href="/industries"
              className="inline-flex items-center gap-1 text-gray-600 hover:text-primary-dark text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              対応業種一覧
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-primary-dark transition-colors"
            >
              口コミ投稿サポートAI
            </Link>
          </div>
        </header>

        <main className="flex-1">
          {/* ヒーロー */}
          <section className="px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              商品を売るお店のための
              <br />
              口コミ戦略ツール
            </h1>
            <p className="mt-6 text-xl sm:text-2xl font-semibold text-gray-800">
              SNSで気になったお客様が、
              <br />
              安心して&quot;来店&quot;を決められる状態を作りませんか？
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={trialId ? `/trial?industry=${trialId}` : "/trial"}
                className="inline-block py-4 px-6 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-bold text-lg text-center shadow-md hover:shadow-lg transition-all"
              >
                無料でデモを試す
              </Link>
              <a
                href={TRIAL_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-4 px-6 rounded-xl bg-white border-2 border-primary text-primary hover:bg-primary/10 font-bold text-lg text-center shadow-md hover:shadow-lg transition-all"
              >
                1ヶ月無料トライアル
              </a>
            </div>
            <div className="mt-8 flex justify-center overflow-hidden">
              <Image
                src="/industry-hero-retail.png"
                alt="生成された口コミの画面"
                width={320}
                height={480}
                className="w-full max-w-[320px] h-auto rounded-xl drop-shadow-lg object-contain"
                unoptimized
              />
            </div>
          </section>

          {/* こんなお悩み */}
          <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
                こんなお悩みありませんか？
              </h2>
              <ul className="space-y-3 text-base sm:text-lg text-gray-700">
                <li>・SNSは見られているのに来店が伸びない</li>
                <li>・常連はいるが新規が増えない</li>
                <li>・口コミが少なくて不安</li>
                <li>・星の数が低く見えてしまう</li>
                <li>・レビュー依頼が言いづらい</li>
              </ul>
              <p className="mt-8 text-center text-lg font-semibold text-gray-800">
                ひとつでも当てはまるなら、この仕組みが役立ちます。
              </p>
            </div>
          </section>

          {/* お客様はこうやってお店を選んでいます */}
          <section className="px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
              お客様はこうやってお店を選んでいます
            </h2>
            <ol className="space-y-4 text-base sm:text-lg text-gray-700 list-decimal list-inside">
              <li>InstagramやSNSで商品を見る</li>
              <li>「ちょっと気になる」と思う</li>
              <li>Googleマップでお店を検索する</li>
              <li>口コミと星の数を見る</li>
              <li>「ここなら安心」と思えたら来店</li>
            </ol>
            <p className="mt-10 text-center text-xl font-bold text-primary">
              この最後の一歩で、
              <br />
              来店するかどうかが決まります。
            </p>
          </section>

          {/* このツールでできること */}
          <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
                このツールでできること
              </h2>
              <ul className="space-y-8">
                <li>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">◎ 口コミ投稿率を上げる</h3>
                  <p className="text-gray-700">質問形式で、自然にレビューを書いてもらえる。</p>
                </li>
                <li>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">◎ 商品名や強みを自然に増やす</h3>
                  <p className="text-gray-700">お店が伝えたいキーワードを反映。</p>
                </li>
                <li>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">◎ 「また買いたい」が伝わる文章を作る</h3>
                  <p className="text-gray-700">体験を具体的に言語化。</p>
                </li>
                <li>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">◎ 返信文も自動生成</h3>
                  <p className="text-gray-700">忙しい店主でも負担なし。</p>
                </li>
                <li>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">◎ Googleマップ上の信頼感を高める</h3>
                  <p className="text-gray-700">投稿＋返信で安心感を可視化。</p>
                </li>
              </ul>
            </div>
          </section>

          {/* 選ばれるお店は、口コミで決まる */}
          <section className="px-4 sm:px-6 py-14 sm:py-20 bg-white border-y border-green-100">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block mb-6 pb-3 border-b-2 border-primary/40">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  選ばれるお店は、口コミで決まる
                </h2>
              </div>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                SNSで見て気になったとしても、
                <br />
                多くの人は最後にGoogleマップを確認します。
                <br />
                そのときに
                <br />
                口コミが少なかったり、
                <br />
                内容が薄かったり、
                <br />
                星の数が低く見えると、不安になってしまいます。
                <br />
                <br />
                逆に、
                <br />
                <br />
                「接客が丁寧だった」
                <br />
                「商品の説明がわかりやすかった」
                <br />
                「また買いに行きたいと思えた」
                <br />
                <br />
                そんな具体的な声があるだけで、
                <br />
                安心して来店を決められます。
                <br />
                <br />
                口コミは、
                <br />
                &quot;買いに行く理由&quot;をつくる資産です。
              </p>
            </div>
          </section>

          {/* 店主にとっての本当のメリット */}
          <section className="px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
              店主にとっての本当のメリット
            </h2>
            <ul className="space-y-3 text-base sm:text-lg text-gray-700">
              <li>・SNS→Google→来店の動線を強化できる</li>
              <li>・月に数名の新規増加で十分回収可能</li>
              <li>・広告より低コスト</li>
              <li>・口コミは消えない&quot;資産&quot;</li>
              <li>・星の見た目による不安を減らせる</li>
            </ul>
          </section>

          {/* 料金 + CTA */}
          <PricingSection />

          <section className="px-4 sm:px-6 py-12 sm:py-16 bg-green-50 border-t border-green-100">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-lg font-semibold text-gray-800 mb-6">
                まずは1ヶ月、無料で体験してください。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={trialId ? `/trial?industry=${trialId}` : "/trial"}
                  className="inline-block py-4 px-6 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-bold text-lg text-center shadow-md hover:shadow-lg transition-all"
                >
                  無料でデモを試す
                </Link>
                <a
                  href={TRIAL_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-4 px-6 rounded-xl bg-white border-2 border-primary text-primary hover:bg-primary/10 font-bold text-lg text-center shadow-md hover:shadow-lg transition-all"
                >
                  1ヶ月無料トライアル
                </a>
              </div>
            </div>
          </section>
        </main>
        <footer className="py-6 text-center text-sm text-gray-500 border-t border-green-100">
          ©2026 くーままAIラボ
        </footer>
      </div>
    );
  }

  if (slug === "dentist") {
    return (
      <div className="min-h-screen flex flex-col bg-green-50 text-gray-800 antialiased">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-green-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <Link href="/industries" className="inline-flex items-center gap-1 text-gray-600 hover:text-primary-dark text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" />
              対応業種一覧
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold text-gray-500 bg-gray-200 px-3 py-1 rounded-full mb-4">
            準備中
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            歯医者・クリニック向け
          </h1>
          <p className="text-gray-600 mb-8">
            診療体験をもとに口コミの下書きを作成する機能を準備しています。しばらくお待ちください。
          </p>
          <Link
            href="/industries"
            className="inline-block py-3 px-6 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-semibold transition-colors"
          >
            対応業種一覧に戻る
          </Link>
        </main>
        <footer className="py-6 text-center text-sm text-gray-500 border-t border-green-100">
          ©2026 くーままAIラボ
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-green-50 items-center justify-center px-4">
      <p className="text-gray-600 mb-4">指定の業種が見つかりませんでした。</p>
      <Link href="/industries" className="text-primary font-semibold hover:underline">
        対応業種一覧へ
      </Link>
      <footer className="mt-auto py-6 text-center text-sm text-gray-500">
        ©2026 くーままAIラボ
      </footer>
    </div>
  );
}
