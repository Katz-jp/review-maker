"use client";

import Link from "next/link";

const navItems = [
  { label: "ホーム", href: "#" },
  { label: "料金", href: "#pricing" },
  { label: "お問い合わせ", href: "/contact" },
];

const features = [
  {
    icon: "📝",
    title: "簡単アンケート",
    description: "5つの質問に答えるだけ。お客様の負担を最小限に。",
  },
  {
    icon: "🤖",
    title: "AI自動生成",
    description: "回答から自然な口コミ文章を自動生成。そのままGoogleマップへ投稿可能。",
  },
  {
    icon: "💬",
    title: "返信もAIで",
    description: "いただいた口コミへの返信もAIが作成。オーナーの手間を削減。",
  },
];

const footerLinks = [
  { label: "特定商取引法に基づく表記", href: "/tokusho" },
  { label: "プライバシーポリシー", href: "/privacy" },
  { label: "利用規約", href: "/terms" },
];

function scrollToContact() {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-green-50 text-gray-800 antialiased">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-green-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-800 hover:text-primary-dark transition-colors">
            口コミ作成AIアプリ
          </Link>
          <nav className="flex items-center gap-6 sm:gap-8">
            {navItems.map((item) =>
              item.href.startsWith("#") ? (
                <button
                  key={item.label}
                  onClick={() => document.getElementById(item.href.slice(1))?.scrollIntoView({ behavior: "smooth" })}
                  className="text-sm font-medium text-gray-600 hover:text-primary-dark transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-gray-600 hover:text-primary-dark transition-colors"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ヒーローセクション */}
        <section className="px-4 sm:px-6 py-16 sm:py-24 max-w-5xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
            お客様の声を、AIが自然な口コミに
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            簡単5問のアンケートで、Googleマップへの口コミ投稿率を劇的に改善
          </p>
          <button
            onClick={scrollToContact}
            className="mt-8 sm:mt-10 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-semibold shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            無料で始める
          </button>
        </section>

        {/* 特徴セクション（3カラム） */}
        <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-green-50/80 rounded-2xl p-6 sm:p-8 border border-green-100 shadow-sm hover:border-primary/30 transition-colors"
                >
                  <div className="text-3xl sm:text-4xl mb-4">{f.icon}</div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-2">{f.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 対象業種 */}
        <section className="px-4 sm:px-6 py-12 sm:py-16 max-w-5xl mx-auto">
          <p className="text-center text-base sm:text-lg text-gray-600">
            整骨院・美容室・飲食店など、口コミが重要な店舗向けサービスです
          </p>
        </section>

        {/* 料金プラン */}
        <section id="pricing" className="px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100 scroll-mt-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-8">
              今だけ！先行特別キャンペーン実施中
            </h2>
            <div className="max-w-md mx-auto bg-green-50 rounded-2xl p-6 sm:p-8 border border-green-200 shadow-sm">
              <ul className="space-y-4 text-gray-800">
                <li className="flex items-start gap-3">
                  <span className="text-xl">✨</span>
                  <span>初月完全無料（30日間）</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">💰</span>
                  <span>2〜3ヶ月目: 月額2,490円（50%OFF）</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🚀</span>
                  <span>4ヶ月目以降: 月額4,980円</span>
                </li>
              </ul>
              <p className="mt-6 text-sm text-gray-600 text-center">
                今なら3ヶ月で4,980円（通常14,940円の66%OFF）
              </p>
            </div>
          </div>
        </section>

        {/* お問い合わせセクション */}
        <section id="contact" className="px-4 sm:px-6 py-12 sm:py-16 max-w-5xl mx-auto scroll-mt-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-8">
            無料トライアルを始める
          </h2>
          <div className="max-w-lg mx-auto">
            <Link
              href="/contact"
              className="block bg-white rounded-2xl p-6 sm:p-8 border border-green-100 shadow-sm hover:border-primary/30 transition-colors text-center"
            >
              <p className="text-gray-600 mb-4">無料トライアル・ご質問はお気軽にどうぞ。</p>
              <span className="inline-block px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-semibold transition-colors">
                お問い合わせフォームへ
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
