"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import PricingSection from "@/components/PricingSection";
import FaqSection from "@/components/FaqSection";
import { getRemainingGenerations, MAX_DEMO_GENERATIONS, isDevelopment } from "@/lib/demo-limit";

const navItems = [
  { label: "ホーム", href: "#" },
  { label: "料金", href: "#pricing" },
  { label: "お問い合わせ", href: "/contact" },
];

const features = [
  {
    icon: "📝",
    title: "お客様は短いアンケートに答えるだけ",
    description: "「書くのが面倒」「何を書けばいいか分からない」を解消。回答内容をもとに、口コミ投稿用の文章を整えて下書きします。",
  },
  {
    icon: "🤖",
    title: "最新AIが口コミ文をその場で下書き",
    description: "自然な日本語生成に特化した最新AIが自動生成した文章は、投稿前にお客様が確認・編集できます。",
  },
  {
    icon: "💬",
    title: "返信文もAIで作成できる",
    description: "いただいた口コミへの返信もAIが作成。返信にかかる時間を8割削減し、キーワードを盛り込んだ戦略的な返信が10秒で完成！ネガティブな口コミにも適切な返信文を提案します。",
  },
];

const footerLinks = [
  { label: "特定商取引法に基づく表記", href: "/tokusho" },
  { label: "プライバシーポリシー", href: "/privacy" },
  { label: "利用規約", href: "/terms" },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // クライアントサイドでのみLocalStorageにアクセス
    if (typeof window !== "undefined") {
      const dev = isDevelopment();
      setIsDev(dev);
      // 開発環境でない場合のみ残り回数を取得（trial用）
      if (!dev) {
        const remaining = getRemainingGenerations("trial", "generate");
        setRemainingGenerations(remaining);
      }
    }
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleNavClick = (item: (typeof navItems)[0]) => {
    closeMenu();
    if (item.href.startsWith("#")) {
      document.getElementById(item.href.slice(1))?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-green-50 text-gray-800 antialiased">
      {/* ヘッダー（スマホ: ハンバーガー / PC: 横並びナビ） */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-green-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-base sm:text-lg font-bold text-gray-800 hover:text-primary-dark transition-colors shrink-0 min-w-0"
          >
            口コミ投稿サポートAI
          </Link>
          {/* 768px以上: 横並びナビ */}
          <nav className="hidden md:flex items-center gap-6 shrink-0" aria-label="メインメニュー">
            {navItems.map((item) =>
              item.href.startsWith("#") ? (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className="text-sm font-medium text-gray-600 hover:text-primary-dark transition-colors whitespace-nowrap"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-gray-600 hover:text-primary-dark transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
          {/* スマホ: ハンバーガーボタン */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 -mr-2 rounded-lg text-gray-600 hover:bg-green-50 aria-expanded:bg-green-50"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          >
            <span className="sr-only">メニュー</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        {/* スマホ: 開いたメニュー */}
        {menuOpen && (
          <nav
            className="md:hidden border-t border-green-100 bg-white py-2 px-4"
            aria-label="メインメニュー"
          >
            <ul className="flex flex-col gap-0">
              {navItems.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith("#") ? (
                    <button
                      type="button"
                      onClick={() => handleNavClick(item)}
                      className="block w-full text-left py-3 px-2 text-sm font-medium text-gray-600 hover:text-primary-dark hover:bg-green-50 rounded-lg transition-colors"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="block py-3 px-2 text-sm font-medium text-gray-600 hover:text-primary-dark hover:bg-green-50 rounded-lg transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main className="flex-1">
        {/* ヒーローセクション */}
        <section className="px-4 sm:px-6 py-16 sm:py-24 max-w-5xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
            口コミを、集客の武器に。
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            口コミ投稿数2.5倍、作成時間わずか30秒。
            <br />
            <span className="font-bold">忙しいオーナーのためのMEO対策AIツール</span>
          </p>
          <p className="mt-4 text-sm text-gray-500 max-w-2xl mx-auto">
            当アプリは、インセンティブなし・実体験ベースの
            <br />
            口コミづくりを前提にしています。
          </p>
          <Link
            href="/industries"
            className="inline-block mt-8 sm:mt-10 px-10 py-4 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-semibold text-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            対応業種を調べる
          </Link>
          <div className="mt-8 sm:mt-10 flex justify-center">
            <Image
              src="/hero-review.png"
              alt="生成された口コミの画面。文章をコピーする・Googleマップへ投稿するボタンが表示されています。"
              width={320}
              height={480}
              className="w-full max-w-[320px] h-auto rounded-xl drop-shadow-lg"
              priority
            />
          </div>
        </section>

        {/* 特徴セクション（3カラム） */}
        <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 pb-3 border-b-2 border-primary/50">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                口コミが&quot;武器&quot;になる3つの理由
              </h2>
              <p className="mt-2 text-base sm:text-lg font-semibold text-primary">
                簡単・時短・続けられる！
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {features.map((f, index) => (
                <div
                  key={f.title}
                  className="bg-green-50/80 rounded-2xl p-6 sm:p-8 border border-green-100 shadow-sm hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3 sm:gap-4 mb-3">
                    <span className="text-3xl sm:text-4xl shrink-0">{f.icon}</span>
                    <h3 className="font-semibold text-gray-800 text-lg pt-0.5">
                      {index === 0 && <span className="text-primary">簡単！</span>}
                      {index === 1 && <span className="text-primary">時短！</span>}
                      {index === 2 && <span className="text-primary">続けやすい！</span>}
                      {f.title}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 口コミ投稿サポートAIを使う理由 */}
        <section className="px-4 sm:px-6 py-12 sm:py-16 max-w-5xl mx-auto space-y-12 sm:space-y-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2 pb-3 border-b-2 border-primary/50">
            口コミが&quot;集客&quot;に変わる理由
          </h2>
          {/* セクション1 なぜ口コミが必要か */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-4">
              <span aria-hidden>✅ </span>
              口コミが増えると、来店率が上がる
            </h3>
            <p className="text-center text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Googleマップで比較される時代。
              <br />
              口コミの数と内容が、そのまま&quot;安心材料&quot;になります。
              <br />
              投稿が増えるほど、見つけてもらいやすくなり、
              <br />
              電話・ルート検索・予約につながりやすくなります。
            </p>
            <div className="mt-8 flex justify-center">
              <Image
                src="/hero-review.png"
                alt="生成された口コミの画面"
                width={220}
                height={330}
                className="w-full max-w-[220px] h-auto rounded-xl drop-shadow-md"
              />
            </div>
          </div>

          {/* セクション2 このアプリのベネフィット */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-4">
              <span aria-hidden>✅ </span>
              口コミ運用を自動化し、止まらなくする
            </h3>
            <p className="text-center text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              お客様は短いアンケートに答えるだけ。
              <br />
              オーナーは返信をワンクリックで作成。
              <br />
              運用が止まらないから、口コミが積み上がり、
              <br />
              信頼も自然に増えていきます。
            </p>
            <div className="mt-8 flex justify-center">
              <Image
                src="/reply-helper-screen.png"
                alt="クチコミ返信ヘルプAIの画面。口コミ入力に合わせた返信文をAIで生成できます。"
                width={220}
                height={330}
                className="w-full max-w-[220px] h-auto rounded-xl drop-shadow-md"
              />
            </div>
          </div>

          {/* セクション3 向いている業種 */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-4">
              <span aria-hidden>✅ </span>
              地域検索で上位に選ばれやすくなる
            </h3>
            <p className="text-center text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              腰痛・交通事故・美容・整体など、
              <br />
              お店の強みを自然に含んだ口コミが増えることで、
              <br />
              地域検索で比較されたときに強くなります。
            </p>
            <div className="mt-8 flex justify-center">
              <Image
                src="/questionnaire-screen.png"
                alt="お客様アンケートの画面。受けたメニューなどを複数選択できます。"
                width={220}
                height={330}
                className="w-full max-w-[220px] h-auto rounded-xl drop-shadow-md"
              />
            </div>
          </div>

        </section>

        {/* 導入はかんたん3ステップ */}
        <section className="px-4 sm:px-6 py-12 sm:py-16 bg-green-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block bg-primary text-white text-xs font-bold tracking-wider px-3.5 py-1 rounded-full mb-3.5">
                SIMPLE 3 STEPS
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                導入は<span className="text-primary">かんたん</span>3ステップ
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-0 relative">
              {/* Step 1 */}
              <div className="flex-1 bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center relative shadow-sm border-2 border-primary/12 hover:-translate-y-1 hover:shadow-md transition-all animate-fadeUp" style={{ animationDelay: "0.1s" }}>
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-black w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                  1
                </div>
                <div className="w-18 h-18 bg-green-50 rounded-xl flex items-center justify-center my-2 mb-5 text-3xl">
                  <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="14" height="14" rx="2.5" fill="#22c55e"/>
                    <rect x="5" y="5" width="8" height="8" rx="1" fill="white"/>
                    <rect x="7" y="7" width="4" height="4" rx="0.5" fill="#22c55e"/>
                    <rect x="22" y="2" width="14" height="14" rx="2.5" fill="#22c55e"/>
                    <rect x="25" y="5" width="8" height="8" rx="1" fill="white"/>
                    <rect x="27" y="7" width="4" height="4" rx="0.5" fill="#22c55e"/>
                    <rect x="2" y="22" width="14" height="14" rx="2.5" fill="#22c55e"/>
                    <rect x="5" y="25" width="8" height="8" rx="1" fill="white"/>
                    <rect x="7" y="27" width="4" height="4" rx="0.5" fill="#22c55e"/>
                    <rect x="22" y="22" width="4" height="4" rx="0.5" fill="#22c55e"/>
                    <rect x="28" y="22" width="4" height="4" rx="0.5" fill="#22c55e"/>
                    <rect x="22" y="28" width="4" height="4" rx="0.5" fill="#22c55e"/>
                    <rect x="28" y="28" width="8" height="4" rx="0.5" fill="#22c55e"/>
                    <rect x="34" y="22" width="2" height="4" rx="0.5" fill="#22c55e"/>
                  </svg>
                </div>
                <div className="text-lg font-black text-gray-900 mb-2.5">
                  <span className="text-primary">QR</span>を置く
                </div>
                <div className="text-sm text-gray-600 leading-relaxed mb-3.5">
                  専用QRを印刷して<br />お店に置くだけ。<br />設定は一切不要！
                </div>
                <div className="inline-block bg-green-50 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary/25">
                  30秒で完了
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="flex items-center justify-center w-9 h-8 shrink-0 relative z-10 sm:h-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary opacity-70 sm:rotate-0 rotate-90">
                  <polyline points="7 4 13 10 7 16"/>
                </svg>
              </div>

              {/* Step 2 */}
              <div className="flex-1 bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center relative shadow-sm border-2 border-primary/12 hover:-translate-y-1 hover:shadow-md transition-all animate-fadeUp sm:mt-0 mt-8" style={{ animationDelay: "0.2s" }}>
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-black w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                  2
                </div>
                <div className="w-18 h-18 bg-green-50 rounded-xl flex items-center justify-center my-2 mb-5 text-3xl">
                  👆
                </div>
                <div className="text-lg font-black text-gray-900 mb-2.5">
                  <span className="text-primary">答える</span>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed mb-3.5">
                  お客さまがスマホで<br />ポチポチ回答するだけ。<br />文章入力は不要！
                </div>
                <div className="inline-block bg-green-50 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary/25">
                  タップで選ぶだけ
                </div>
              </div>

              {/* Arrow 2 */}
              <div className="flex items-center justify-center w-9 h-8 shrink-0 relative z-10 sm:h-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary opacity-70 sm:rotate-0 rotate-90">
                  <polyline points="7 4 13 10 7 16"/>
                </svg>
              </div>

              {/* Step 3 */}
              <div className="flex-1 bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center relative shadow-sm border-2 border-primary/12 hover:-translate-y-1 hover:shadow-md transition-all animate-fadeUp sm:mt-0 mt-8" style={{ animationDelay: "0.3s" }}>
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-black w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                  3
                </div>
                <div className="w-18 h-18 bg-green-50 rounded-xl flex items-center justify-center my-2 mb-5 text-3xl">
                  ⭐
                </div>
                <div className="text-lg font-black text-gray-900 mb-2.5">
                  <span className="text-primary">投稿</span>する
                </div>
                <div className="text-sm text-gray-600 leading-relaxed mb-3.5">
                  AIが生成した文を<br />確認してそのままGoogle<br />マップへ投稿！
                </div>
                <div className="inline-block bg-green-50 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary/25">
                  口コミが自動生成
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 無料お試しセクション */}
        <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-block bg-primary text-white text-xs font-bold tracking-wider px-3.5 py-1 rounded-full mb-3.5">
                Try it now!
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                実際にアプリを触ってご体感ください！
              </h2>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                実際にアンケートに答えて、AIが生成する口コミ文を体験できます。
                <br />
                登録不要で、すぐに試せます。
              </p>
            </div>

            <div className="bg-green-50 rounded-2xl p-6 sm:p-8 border-2 border-green-200 shadow-sm">
              {/* 残り回数表示（開発環境では非表示） */}
              {!isDev && remainingGenerations !== null && remainingGenerations < MAX_DEMO_GENERATIONS && (
                <div className="mb-4 text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    <span className="text-primary text-lg">無料お試し：残り{remainingGenerations}回</span>
                  </p>
                </div>
              )}

              {/* 制限に達した場合の案内（開発環境では非表示） */}
              {!isDev && remainingGenerations === 0 ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-5 border border-green-200">
                    <p className="text-base font-bold text-gray-900 mb-3 text-center">
                      5回のお試し、いかがでしたか？
                    </p>
                    <p className="text-sm text-gray-700 mb-4 text-center leading-relaxed">
                      実際のクチコミの質を実感いただけたでしょうか？
                    </p>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-700">
                        「もっと多くのメニューで試したい」
                      </p>
                      <p className="text-sm text-gray-700">
                        「実際に店舗で運用してみたい」
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                      そんなオーナー様のために、今なら全ての機能を1ヶ月間無料でお試しいただけるトライアルをご用意しています。
                    </p>
                    <a
                      href="https://docs.google.com/forms/d/11ikD7LepY89LQ3pCg28Ahk3BEgXR3cGLzf7FDNGn82k/viewform"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm text-center transition-colors mb-2"
                    >
                      1ヶ月無料トライアルに申し込む
                    </a>
                    <p className="text-xs text-gray-600 text-center">
                      ※トライアル期間中に解約すれば費用は一切かかりません。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link
                    href="/industries"
                    className="block w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg text-center shadow-md hover:shadow-lg transition-all"
                  >
                    対応業種を選ぶ →
                  </Link>
                  <p className="text-xs text-gray-600 text-center">
                    ※ 各デモは最大5回までお試しいただけます
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 料金プラン（先行導入・成長支援プラン）— 非表示 */}
        {/* <PricingSection /> */}

        {/* よくある質問 */}
        <FaqSection />

        {/* お問い合わせセクション */}
        <section id="contact" className="px-4 sm:px-6 py-12 sm:py-16 max-w-5xl mx-auto scroll-mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3 pb-3 border-b-2 border-primary/50">
            ご質問・ご要望はお気軽にどうぞ！
          </h2>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-8 max-w-xl mx-auto">
            「対応業種に自分の業種がなかった」「自分の店舗ならどの業種がぴったりかな？」など、ご質問やご要望はこちらからお寄せください。
          </p>
          <div className="max-w-lg mx-auto flex justify-center">
            <Link
              href="/contact"
              className="inline-block px-10 py-4 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-semibold text-lg transition-colors text-center"
            >
              お問い合わせ
            </Link>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-green-100 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-primary-dark transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center text-sm text-gray-500 space-y-1">
            <p>運営者: くーママAI labo</p>
            <p>
              お問い合わせ:{" "}
              <a
                href="mailto:info@kuhmom-ailabo.com"
                className="text-primary-dark hover:underline"
              >
                info@kuhmom-ailabo.com
              </a>
            </p>
            <p>©2026 くーままAIラボ</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
