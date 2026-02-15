"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";

type Payload = {
  answers: Record<string, string[]>;
  otherInputs: Record<string, string>;
  freeText: string;
  tenantId?: string;
};

export default function TenantGeneratePage() {
  const params = useParams();
  const tenantId = (params.tenantId as string) || "demo";
  const tenant = useTenant();
  const canUsePaidFeatures = tenant.subscriptionStatus === "active" || tenant.subscriptionStatus === "trialing";

  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!canUsePaidFeatures) {
      setError("この店舗は現在ご利用いただけません。");
      setLoading(false);
      return;
    }
    const raw = sessionStorage.getItem("questionnaireAnswers");
    if (!raw) {
      setError("回答データが見つかりません。最初からやり直してください。");
      setLoading(false);
      return;
    }

    let payload: Payload;
    try {
      payload = JSON.parse(raw) as Payload;
    } catch {
      setError("回答データの形式が不正です。");
      setLoading(false);
      return;
    }

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: payload.answers,
        otherInputs: payload.otherInputs,
        freeText: payload.freeText,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "生成に失敗しました");
        setGeneratedText(data.text || "");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [canUsePaidFeatures]);

  const handleCopy = async () => {
    if (!generatedText) return;
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-gray-600 font-medium">口コミを生成しています…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col px-5 pt-6 pb-12 max-w-lg mx-auto">
        <Link
          href={`/${tenantId}`}
          className="flex items-center gap-1 text-gray-600 text-sm py-2 -ml-1 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </Link>
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-red-600 font-medium text-center">{error}</p>
          <Link
            href={`/${tenantId}`}
            className="mt-6 py-3 px-6 rounded-xl bg-primary text-white font-semibold"
          >
            最初からやり直す
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col px-5 pt-6 pb-12 max-w-lg mx-auto">
      <header className="flex items-center justify-between mb-6">
        <Link
          href={`/${tenantId}`}
          className="flex items-center gap-1 text-gray-600 text-sm py-2 -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </Link>
        <span className="text-sm text-gray-500">口コミ下書き</span>
      </header>

      <section className="flex-1">
        <label className="block font-semibold text-gray-800 mb-2">
          生成された口コミ
        </label>
        <textarea
          value={generatedText}
          onChange={(e) => setGeneratedText(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-800 text-base resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="口コミが表示されます"
        />
      </section>

      <div className="mt-6 space-y-3">
        <div className="bg-amber-50/80 rounded-2xl p-4 mb-4 border border-amber-200/60">
          <p className="text-sm font-semibold text-amber-900/90">
            いただいた回答からAIが作成した文章です。内容を確認し、必要なら修正して、納得してからクチコミを投稿してください。
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary-dark text-white font-semibold text-base shadow-md active:scale-[0.98] transition-transform"
        >
          {copied ? (
            <>
              <Copy className="w-5 h-5" />
              コピーしました！
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              文章をコピーする
            </>
          )}
        </button>

        <a
          href={tenant.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl border-2 border-primary text-primary-dark hover:bg-primary/10 font-semibold text-base transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          Googleマップへ投稿する
        </a>
      </div>
    </main>
  );
}
