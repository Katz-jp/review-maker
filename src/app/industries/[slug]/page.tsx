"use client";

import Link from "next/link";
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
                href={trialId ? `/trial/create?industry=${trialId}` : "/trial/create"}
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
                  href={trialId ? `/trial/create?industry=${trialId}` : "/trial/create"}
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
            <Link href="/industries" className="inline-flex items-center gap-1 text-gray-600 hover:text-primary-dark text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" />
              対応業種一覧
            </Link>
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-primary-dark transition-colors">
              口コミ投稿サポートAI
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6">
            小売店のための口コミ戦略ツール
          </h1>
          <p className="text-center text-gray-600 mb-10">
            お店の体験をもとに、Googleマップの口コミ文を効率的に増やせます。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href={trialId ? `/trial/create?industry=${trialId}` : "/trial/create"}
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
          <PricingSection />
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
