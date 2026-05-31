"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PricingSection from "@/components/PricingSection";
import PostingSupportInclusionsSection from "@/components/PostingSupportInclusionsSection";
import BrandLogo from "@/components/BrandLogo";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { TRIAL_POSTING_SESSION_INDUSTRY_ID } from "@/lib/posting-support-constants";

const TRIAL_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfilsWAERsNkC6Z_761_i-XPR9wVUAbKE7uByouR5iNng4y_w/viewform?usp=header";

export default function IndustryLandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const requestedSlug = params.slug;
  const router = useRouter();
  const trialId = TRIAL_POSTING_SESSION_INDUSTRY_ID;

  useEffect(() => {
    if (requestedSlug !== "dentist") {
      router.replace("/industries/dentist");
    }
  }, [requestedSlug, router]);

  if (requestedSlug !== "dentist") {
    return (
      <div className="min-h-screen flex flex-col bg-green-50 items-center justify-center px-4 text-gray-600">
        <p>歯医者・クリニック向けページへ移動しています…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-green-50 text-gray-800 antialiased">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-green-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-gray-600 hover:text-primary-dark text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            トップに戻る
          </Link>
          <BrandLogo />
        </div>
      </header>

      <main className="flex-1">
        <section className="px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            歯医者・クリニックのための
            <br />
            口コミ戦略ツール
          </h1>
          <p className="mt-6 text-xl sm:text-2xl font-semibold text-gray-800">
            Googleマップの口コミを
            <br />
            「選ばれるクリニック」の装置に変えませんか？
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/trial?industry=${trialId}`}
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
              src="/industry-hero-dental.png"
              alt="生成された口コミの画面"
              width={320}
              height={480}
              className="w-full max-w-[320px] h-auto rounded-xl drop-shadow-lg object-contain"
              unoptimized
            />
          </div>
          <p className="mt-6 text-center text-base sm:text-lg font-semibold text-gray-700">
            診療の合間に、さくっと使えます。
          </p>
        </section>

        <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
              こんなお悩みありませんか？
            </h2>
            <ul className="space-y-3 text-base sm:text-lg text-gray-700">
              <li>・「怖い・痛そう」で敬遠されている</li>
              <li>・Google検索で他院に埋もれている</li>
              <li>・口コミが少なくて不安</li>
              <li>・返信が面倒で後回しになっている</li>
              <li>・痛くない・丁寧・予約しやすいなどの強みが伝わっていない</li>
            </ul>
            <p className="mt-8 text-center text-lg font-semibold text-gray-800">
              ひとつでも当てはまるなら、この仕組みが役立ちます。
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
            患者さんはこうやってクリニックを選んでいます
          </h2>
          <ol className="space-y-4 text-base sm:text-lg text-gray-700 list-decimal list-inside">
            <li>「地域名＋歯医者／痛くない／矯正」で検索</li>
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

        <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10 pb-3 border-b-2 border-primary">
              このツールでできること
            </h2>
            <ul className="space-y-8">
              <li>
                <h3 className="text-lg font-bold text-gray-900 mb-2">① 口コミの投稿数が増える</h3>
                <p className="text-gray-700">
                  患者さんがやることは、アンケート形式の質問にぽちぽちと答えていくだけ。あとはその回答を元に、AIが口コミに適した自然な文章を作るから「口コミ？何から書いていいか分からない」という患者さんも投稿しやすくなります。
                </p>
              </li>
              <li>
                <h3 className="text-lg font-bold text-gray-900 mb-2">② いただいた口コミへの返信文を、かんたんに整えられる</h3>
                <p className="text-gray-700">
                  クチコミ返信ヘルプAIなら、いただいた口コミの内容に合わせた返信文のたたき台を短時間で用意できます。口コミを読み比べて医院を選ぶ患者さんの多くは、本文だけでなく返信の内容やトーンもしっかり確認します。丁寧で誠実な返信は「ちゃんと向き合っている医院」という安心感につながり、医院の強みを自然にアピールできます。
                </p>
              </li>
              <li>
                <h3 className="text-lg font-bold text-gray-900 mb-2">③ Googleマップ上で&quot;地域の中で最も活気ある歯科医院&quot;として認知される</h3>
                <p className="text-gray-700">
                  口コミの投稿数増加＋口コミに対する返信から、更新頻度がアップ。Googleマップ内での存在感が増すことで、検索でより引っかかりやすくなります。
                </p>
              </li>
              <li>
                <h3 className="text-lg font-bold text-gray-900 mb-2">④ 欲しいキーワードを自然に増やすことができる</h3>
                <p className="text-gray-700">
                  オリジナルの選択肢を追加することで「〇〇市　歯医者」「歯医者　痛くない」など、欲しいキーワードが自然な形で入った口コミを作りやすくなり、検索に好影響を与えます。
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-14 sm:py-20 bg-white border-y border-green-100">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6 pb-3 border-b-2 border-primary/40">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                選ばれる歯科クリニックは、口コミで決まる
              </h2>
            </div>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              「怖い・痛そう」で迷っている患者さんは、
              <br />
              必ず口コミを読んでから来院を決めます。
              <br />
              そのときに
              <br />
              「痛くなくて安心した」「説明が丁寧だった」といった声があるかどうかで
              <br />
              選ばれるかどうかが決まります。
              <br />
              口コミは、信頼を見える化する資産です。
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
            先生・医院にとっての本当のメリット
          </h2>
          <ul className="space-y-3 text-base sm:text-lg text-gray-700">
            <li>・口コミを集める手間と時間が圧倒的に少なくなる</li>
            <li>・口コミは広告よりも低コスト</li>
            <li>・口コミは消えない&quot;資産&quot;</li>
            <li>・「ちゃんと患者さんに向き合っている医院」という印象づけに効果抜群</li>
          </ul>
        </section>

        <PostingSupportInclusionsSection />
        <PricingSection />

        <section className="px-4 sm:px-6 py-12 sm:py-16 bg-green-50 border-t border-green-100">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg font-semibold text-gray-800 mb-6">
              まずは1ヶ月、無料で体験してください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/trial?industry=${trialId}`}
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
      <ScrollToTopButton />
    </div>
  );
}
