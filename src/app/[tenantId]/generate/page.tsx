"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Copy, Loader2 } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { getRemainingGenerations, incrementGenerationCount, MAX_DEMO_GENERATIONS } from "@/lib/demo-limit";

type Payload = {
  answers: Record<string, string[]>;
  otherInputs: Record<string, string>;
  freeText: string;
  tenantId?: string;
  industry?: string;
  retailPreset?: string;
};

export default function TenantGeneratePage() {
  const params = useParams();
  const tenantId = (params.tenantId as string) || "demo";
  const tenant = useTenant();
  // trialの場合は契約チェックをスキップ（制限のみ適用）
  const canUsePaidFeatures = tenantId === "trial" || tenant.subscriptionStatus === "active" || tenant.subscriptionStatus === "trialing";

  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null);

  useEffect(() => {
    // デモ制限チェック（trialのみ）
    if (tenantId === "trial") {
      const remaining = getRemainingGenerations(tenantId, "generate");
      setRemainingGenerations(remaining);
    } else {
      setRemainingGenerations(null);
    }

    // trialの場合は契約チェックをスキップ
    if (tenantId !== "trial" && !canUsePaidFeatures) {
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
        industry: payload.industry ?? "seikotsu",
        ...(payload.industry === "retail" && { retailPreset: payload.retailPreset ?? "meat" }),
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "生成に失敗しました");
        setGeneratedText(data.text || "");
        // 成功したらカウントを増やす（trialのみ）
        if (tenantId === "trial") {
          incrementGenerationCount(tenantId, "generate");
          setRemainingGenerations(getRemainingGenerations(tenantId, "generate"));
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [canUsePaidFeatures, tenantId]);

  const handleCopy = async () => {
    if (!generatedText) return;
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAndOpenMaps = async () => {
    if (!generatedText) return;
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.open(tenant.googleMapsUrl, "_blank", "noopener,noreferrer");
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
        <div className="flex items-center gap-3">
          {/* デモ制限表示（trialのみ） */}
          {tenantId === "trial" && remainingGenerations !== null && remainingGenerations < MAX_DEMO_GENERATIONS && (
            <span className="text-xs font-semibold text-primary bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
              無料お試し：残り{remainingGenerations}回
            </span>
          )}
          <span className="text-sm text-gray-500">口コミ下書き</span>
        </div>
      </header>

      <section className="flex-1">
        <label className="block font-semibold text-gray-800 mb-2">
          文章を作成しました！
        </label>
        <p className="text-sm font-semibold text-amber-900/90 mb-4">
          AIが作成した下書きです。
          <br />
          自由に修正してから投稿してください。
        </p>
        <textarea
          value={generatedText}
          onChange={(e) => setGeneratedText(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-800 text-base resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="口コミが表示されます"
        />
      </section>

      <div className="mt-6 space-y-3">
        <div className="rounded-2xl p-4 mb-4 bg-amber-50/80 border border-amber-200/60">
          <p className="text-sm font-semibold text-amber-900/90 mb-3">【投稿はかんたん3ステップ】</p>
          <ol className="text-sm text-amber-900/90 space-y-2 list-none">
            <li>① ↓の「コピーしてGoogleマップに進む」を押す</li>
            <li>② ☆をタップして評価（星が⭐️黄色になります）</li>
            <li>③ 文章を貼り付けて「投稿」！</li>
          </ol>
        </div>

        {/* 残り回数表示（trialのみ） */}
        {tenantId === "trial" && remainingGenerations !== null && remainingGenerations > 0 && (
          <div className="bg-green-50 rounded-xl p-4 border border-green-200 mb-3">
            <p className="text-sm font-semibold text-center text-gray-800">
              <span className="text-primary text-base">あと残り{remainingGenerations}回試せます</span>
            </p>
          </div>
        )}

        {/* 制限に達した場合の案内（trialのみ） */}
        {tenantId === "trial" && remainingGenerations === 0 && (
          <div className="bg-green-50 rounded-xl p-5 border border-green-200 mb-3">
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
        )}
        <button
          type="button"
          onClick={handleCopyAndOpenMaps}
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
              コピーしてGoogleマップに進む
            </>
          )}
        </button>
      </div>
    </main>
  );
}
