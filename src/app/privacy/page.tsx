import Link from "next/link";

export default function PrivacyPage() {
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
            プライバシーポリシー
          </h1>

          <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-8">
              <section>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  1. 個人情報の収集
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  当サービスでは、以下の個人情報を収集します：
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1">
                  <li>店舗名、担当者名、メールアドレス、電話番号</li>
                  <li>お客様が入力した口コミ内容</li>
                  <li>決済情報（Stripe経由、当社では保存しません）</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  2. 利用目的
                </h2>
                <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1">
                  <li>サービスの提供</li>
                  <li>お問い合わせへの対応</li>
                  <li>サービス改善のための分析</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  3. 第三者提供
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  以下のサービスを利用しています：
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1">
                  <li>Stripe（決済処理）</li>
                  <li>Firebase（データ保存）</li>
                  <li>OpenAI（AI機能）</li>
                  <li>Vercel（ホスティング）</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  4. Cookie
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  サービス提供のため、Cookieを使用する場合があります。
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  5. お問い合わせ
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  個人情報に関するお問い合わせ：
                  <a
                    href="mailto:info@kuhmom-ailabo.com"
                    className="text-primary-dark hover:underline ml-1"
                  >
                    info@kuhmom-ailabo.com
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  6. 制定日・改定日
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  制定日: 2026年2月14日
                </p>
              </section>
            </div>
          </div>

          <footer className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-primary-dark transition-colors"
            >
              トップに戻る
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
}
