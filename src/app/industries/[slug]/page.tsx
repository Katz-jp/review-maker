"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PricingSection from "@/components/PricingSection";
import FaqSection from "@/components/FaqSection";
import PostingSupportInclusionsSection from "@/components/PostingSupportInclusionsSection";
import BrandLogo from "@/components/BrandLogo";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { TRIAL_POSTING_SESSION_INDUSTRY_ID } from "@/lib/posting-support-constants";

const TRIAL_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfilsWAERsNkC6Z_761_i-XPR9wVUAbKE7uByouR5iNng4y_w/viewform?usp=header";

const footerLinks = [
  { label: "特定商取引法に基づく表記", href: "/tokusho" },
  { label: "プライバシーポリシー", href: "/privacy" },
  { label: "利用規約", href: "/terms" },
];

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
          <div className="mt-6 sm:mt-8 flex justify-center">
            <video
              src="/videos/review-maker.mp4"
              className="w-full max-w-[240px] h-auto rounded-xl shadow-lg"
              controls
              playsInline
              preload="metadata"
            >
              お使いのブラウザは動画タグに対応していません。
            </video>
          </div>
          <div className="mt-8 flex flex-col gap-4 justify-center items-center">
            <a
              href={TRIAL_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block py-4 px-6 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-bold text-lg text-center shadow-md hover:shadow-lg transition-all"
            >
              30日間無料ではじめてみる！
            </a>
            <Link
              href={`/trial?industry=${trialId}`}
              className="inline-block py-2.5 px-8 rounded-xl bg-white border-2 border-gray-900 text-gray-900 font-bold text-base text-center shadow-md hover:shadow-lg transition-all hover:bg-gray-50"
            >
              ためしに口コミを作ってみる
              <span className="block text-xs font-semibold mt-0.5 text-gray-900">（5回まで・登録なし・無料）</span>
            </Link>
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
            操作時間はたったの1分程度！
            <br />
            診察室での待ち時間、移動中の車や家でのリラックス時間に、さくっと口コミ投稿ができます。
          </p>
        </section>

        <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 pb-3 border-b-2 border-primary/50">
              Googleマップの口コミ、こんなお悩みありませんか？
            </h2>
            <ul className="space-y-3 text-base sm:text-lg text-gray-700">
              <li>・低評価の口コミが全体の足を引っぱっている</li>
              <li>・Google検索で他院に埋もれている</li>
              <li>・口コミの数が少なくて不満</li>
              <li>・もらった口コミへの返信が面倒で後回しになってる</li>
              <li>・HPだけでは当院の良さや特徴がうまく伝わってない気がする</li>
            </ul>
            <p className="mt-8 text-center text-lg font-semibold text-green-800">
              １つでも当てはまるなら、
              <br />
              Review Maker Pro がお役に立てます！
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-12 sm:py-16 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 pb-3 border-b-2 border-primary/50">
            患者さんはこうやって歯医者を選んでいます
          </h2>
          <ol className="space-y-4 text-base sm:text-lg text-gray-700 list-decimal list-inside">
            <li>Googleマップで「歯医者」と検索し、近所にある歯医者を探す</li>
            <li>出てきた一覧の中から「星の数」と「口コミの数」を見る</li>
            <li>口コミの内容を読み込む</li>
            <li>良い口コミ評価が多く、また丁寧に返信のある歯医者を見つけたら、ホームページや行き方を調べる</li>
            <li>安心できる良い雰囲気を感じたらはじめて「ここにしよう」と決める</li>
          </ol>
          <p className="mt-10 text-center text-xl font-bold text-green-800">
            選ばれるかどうかは
            <br />
            &quot;口コミの見え方&quot;で決まります。
          </p>
        </section>

        <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10 pb-3 border-b-2 border-primary">
              Review Maker Pro でできること
            </h2>
            <ul className="space-y-8">
              <li>
                <h3 className="text-lg font-bold text-gray-900 mb-2">① 口コミの投稿数が増える</h3>
                <p className="text-gray-700">
                  患者さんがやることは、アンケート形式の質問にぽちぽちと答えていくだけ。あとはその回答を元に、AIが口コミに適した自然な文章を作るから「口コミ？何から書いていいか分からない」という患者さんも投稿しやすくなります。
                </p>
              </li>
              <li>
                <h3 className="text-lg font-bold text-gray-900 mb-2">② もらった口コミへの返信文もあっという間に作成！</h3>
                <p className="text-gray-700">
                  口コミ返信ヘルプAIなら、いただいた口コミの内容に合わせた返信文のたたき台を短時間で用意できます。口コミを読み比べて医院を選ぶ患者さんの多くは、本文だけでなく返信の内容やトーンもしっかり確認します。
                  <br />
                  丁寧で誠実な返信は「ちゃんと向き合っている医院」という安心感につながり、医院の強みを自然にアピールできます。
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
            院長先生・スタッフの皆さまにとっての本当のメリット
          </h2>
          <ul className="space-y-3 text-base sm:text-lg text-gray-700">
            <li>✅ 口コミを集める手間と時間が圧倒的に減る！（QRコードのカードを渡すだけ）</li>
            <li>✅ 口コミは広告よりも低コスト！（月額料金のみ）</li>
            <li>✅ 良質な口コミは大きな資産に！（未来の患者さんに語りかけ続けます）</li>
            <li>✅ 「ちゃんと患者さんに向き合っている医院」という印象づけに効果抜群！（AI を使えば面倒な口コミへの返信も一瞬で作れます）</li>
          </ul>
        </section>

        <PostingSupportInclusionsSection />
        <PricingSection />

        <FaqSection />

      </main>
      <footer className="bg-white border-t border-green-100 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-500 hover:text-primary-dark transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
            <p>
              お問い合わせ:{" "}
              <a
                href="mailto:info@kuhmom-ailabo.com"
                className="text-primary-dark hover:underline"
              >
                info@kuhmom-ailabo.com
              </a>
            </p>
            <p>電話: 050-1784-8350</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              （自動音声にて対応しております。お急ぎの場合もお問い合わせフォームからのご連絡がスムーズです）
            </p>
            <p className="text-xs text-gray-500">
              〒530-0001　大阪府大阪市北区梅田1丁目2番2号大阪駅前第2ビル12-12
            </p>
          </div>
          <p className="mt-6 pt-4 border-t border-green-100 text-center text-xs text-gray-500">
            ©2026 くーままAIラボ
          </p>
        </div>
      </footer>
      <ScrollToTopButton />
    </div>
  );
}
