import Link from "next/link";

export default function TermsPage() {
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
            利用規約
          </h1>

          <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-8">
              <section>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  第1条（適用）
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  本規約は、くーママAI labo（以下「当社」）が提供する口コミ作成AIアプリ（以下「本サービス」）の利用条件を定めるものです。
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  第2条（利用登録）
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  本サービスを利用するには、月額プランへの加入が必要です。
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  第3条（禁止事項）
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  利用者は以下の行為を行ってはなりません：
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1">
                  <li>虚偽の口コミを生成・投稿する行為</li>
                  <li>本サービスを不正な目的で利用する行為</li>
                  <li>第三者の権利を侵害する行為</li>
                  <li>法令に違反する行為</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  第4条（サブスクリプション）
                </h2>
                <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1">
                  <li>月額4,980円（税込）で自動更新されます</li>
                  <li>いつでも解約可能です</li>
                  <li>解約後、次回請求日以降はサービスを利用できません</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  第5条（免責事項）
                </h2>
                <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1">
                  <li>本サービスの利用により生じた損害について、当社は一切の責任を負いません</li>
                  <li>サービスの中断・終了により生じた損害について、当社は責任を負いません</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  第6条（規約の変更）
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  当社は、必要に応じて本規約を変更できます。
                  <br />
                  変更後は、本サービス上で通知します。
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  第7条（お問い合わせ）
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  本規約に関するお問い合わせ：
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
                  制定日
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  2026年2月14日
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
