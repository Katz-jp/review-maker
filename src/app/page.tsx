"use client";

import { useState } from "react";
import Link from "next/link";
import PricingSection from "@/components/PricingSection";
import FaqSection from "@/components/FaqSection";

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
            お客様の実体験を、自然な口コミ文に整える
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            口コミ投稿数2.5倍、作成時間わずか30秒。
            <br />
            <span className="font-bold">忙しいオーナーのためのMEO対策AIツール</span>
          </p>
          <p className="mt-4 text-sm text-gray-500 max-w-2xl mx-auto">
            当アプリは、インセンティブなし・実体験ベースの口コミづくりを前提にしています。
          </p>
          <Link
            href="/contact"
            className="inline-block mt-8 sm:mt-10 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-semibold shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            無料トライアルに申し込む
          </Link>
        </section>

        {/* 特徴セクション（3カラム） */}
        <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 pb-3 border-b-2 border-primary/50">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                口コミ投稿サポートAIを
                <br />
                導入する理由
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
            口コミ投稿サポートAIを使う理由
          </h2>
          {/* セクション1 なぜ口コミが必要か */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-4">
              <span aria-hidden>✅ </span>
              口コミが増えると、選ばれやすくなる
            </h3>
            <p className="text-center text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Googleマップでお店を探す人は、口コミと写真で比較して来店を決めます。
              口コミが増えるほど、見つけてもらいやすくなり、電話やルート検索・予約につながりやすくなります。
            </p>
          </div>

          {/* セクション2 このアプリのベネフィット */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-4">
              <span aria-hidden>✅ </span>
              口コミ運用の手間を、まとめて減らす
            </h3>
            <p className="text-center text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              お客様は短いアンケートに答えるだけで、投稿用の文章が完成。
              オーナーは返信文もすぐ作れて、運用が止まりません。
              結果として、口コミの量と内容の具体性が増え、信頼が積み上がります。
            </p>
          </div>

          {/* セクション3 向いている業種 */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-4">
              <span aria-hidden>✅ </span>
              店舗型ビジネスに向いています
            </h3>
            <p className="text-center text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              整骨院・整体・美容室・サロン・飲食店・クリニックなど、地域で選ばれるために口コミが重要な業種におすすめです。
            </p>
          </div>

        </section>

        {/* 料金プラン（先行導入・成長支援プラン） */}
        <PricingSection />

        {/* よくある質問 */}
        <FaqSection />

        {/* お問い合わせセクション */}
        <section id="contact" className="px-4 sm:px-6 py-12 sm:py-16 max-w-5xl mx-auto scroll-mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3 pb-3 border-b-2 border-primary/50">
            １ヶ月無料でお試しいただけます！
          </h2>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-8 max-w-xl mx-auto">
            無料トライアル中も口コミ作成・返信作成ツール、どちらも回数無制限で使えます。
          </p>
          <div className="max-w-lg mx-auto">
            <Link
              href="/contact"
              className="block bg-white rounded-2xl p-6 sm:p-8 border border-green-100 shadow-sm hover:border-primary/30 transition-colors text-center"
            >
              <p className="text-gray-600 mb-4">無料トライアル・ご質問はお気軽にどうぞ。</p>
              <span className="inline-block px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-semibold transition-colors">
                お申し込み／お問い合わせ
              </span>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
