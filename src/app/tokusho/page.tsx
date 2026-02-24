import Link from "next/link";

const sections = [
  {
    title: "事業者名",
    content: "くーママAI labo",
  },
  {
    title: "運営責任者",
    content: "平林 桂",
  },
  {
    title: "所在地",
    content: "〒861-2236\n熊本県上益城郡益城町広崎508-1-2-203",
  },
  {
    title: "連絡先",
    content: "メールアドレス: info@kuhmom-ailabo.com\n電話番号: メールにてお問い合わせください",
  },
  {
    title: "販売価格",
    content:
      "月額4,980円（税込）\n初月無料、2〜3ヶ月目は2,490円（キャンペーン価格）",
  },
  {
    title: "支払方法",
    content: "クレジットカード（Stripe経由）",
  },
  {
    title: "商品・サービスの引渡し時期",
    content: "決済完了後、即時ご利用いただけます。",
  },
  {
    title: "返品・キャンセルについて",
    content:
      "サブスクリプションサービスのため、いつでも解約可能です。\n解約後は次回請求日以降のご利用ができなくなります。\n日割り返金は行っておりません。",
  },
  {
    title: "サービス提供期間",
    content: "毎月自動更新（解約までの間）",
  },
];

export default function TokushoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-green-50 text-gray-800 antialiased">
      <header className="bg-white border-b border-green-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/"
            className="text-lg font-bold text-gray-800 hover:text-primary-dark transition-colors"
          >
            口コミ作成AIアプリ
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-8">
            特定商取引法に基づく表記
          </h1>

          <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
            <dl className="divide-y divide-gray-100">
              {sections.map((section) => (
                <div
                  key={section.title}
                  className="px-4 sm:px-6 py-4 sm:py-5"
                >
                  <dt className="text-sm font-semibold text-gray-700 mb-1">
                    {section.title}
                  </dt>
                  <dd className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                    {section.content}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <footer className="mt-8 text-center space-y-2">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-primary-dark transition-colors"
            >
              トップに戻る
            </Link>
            <p className="text-sm text-gray-500">©2026 くーままAIラボ</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
