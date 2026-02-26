"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Copy,
  RotateCcw,
  Trash2,
  Plus,
  MessageSquare,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { getRemainingGenerations, canGenerate, incrementGenerationCount, MAX_DEMO_GENERATIONS, TRIAL_INDUSTRY_KEY } from "@/lib/demo-limit";
import { industries, type IndustryKey } from "@/lib/industries";

type Tone = "friendly" | "polite" | "professional";

type CustomPhrase = {
  id: string;
  text: string;
  enabled: boolean;
  createdAt?: { seconds: number; nanoseconds: number };
};

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: "friendly", label: "フレンドリー" },
  { value: "polite", label: "丁寧" },
  { value: "professional", label: "プロフェッショナル" },
];

const MAX_PHRASES = 5;

export default function ReplyHelperPage() {
  const params = useParams();
  const tenantId = (params.tenantId as string) || "demo";
  const tenant = useTenant();
  // trialの場合は契約チェックをスキップ（制限のみ適用）
  const canUsePaidFeatures = tenantId === "trial" || tenant.subscriptionStatus === "active" || tenant.subscriptionStatus === "trialing";

  const [authorName, setAuthorName] = useState("");
  const [review, setReview] = useState("");
  const [memo, setMemo] = useState("");
  const [tone, setTone] = useState<Tone>("polite");
  const [starRating, setStarRating] = useState<number | null>(null);
  const [customPhrases, setCustomPhrases] = useState<CustomPhrase[]>([]);
  const [generatedReply, setGeneratedReply] = useState("");
  const [replyEdited, setReplyEdited] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [copyNotice, setCopyNotice] = useState(false);

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [phrasesSaving, setPhrasesSaving] = useState(false);
  const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null);

  // 返信で使うフレーズは1つだけ（店舗が選んだもの）
  const selectedPhraseForReply = customPhrases.find((p) => p.enabled && p.text.trim() !== "");
  const phraseForReply = selectedPhraseForReply ? [selectedPhraseForReply.text.trim()] : [];

  // 業種（テナント or trial の sessionStorage）— 返信の「当院」「当店」などに使用
  const industryKey: IndustryKey = (() => {
    const fromTrial =
      tenantId === "trial" && typeof window !== "undefined"
        ? (() => {
            const v = sessionStorage.getItem(TRIAL_INDUSTRY_KEY);
            if (v === "kouri") return "retail";
            if (v === "seikotsuin") return "seikotsu";
            return undefined;
          })()
        : undefined;
    const fromTenant = tenant?.industry;
    const fromTenantId =
      tenantId === "retail-demo" ? "retail" : tenantId === "demo-test" ? "seikotsu" : undefined;
    const raw = fromTrial ?? fromTenant ?? fromTenantId ?? "seikotsu";
    return Object.hasOwn(industries, raw) ? (raw as IndustryKey) : "seikotsu";
  })();
  const retailPreset =
    industryKey === "retail"
      ? tenant?.retailPreset ?? (tenantId === "retail-demo" || tenantId === "trial" ? "meat" : undefined)
      : undefined;

  const loadSettings = useCallback(async () => {
    if (!tenantId) return;
    setSettingsLoading(true);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/reply-settings`);
      const data = await res.json();
      if (res.ok) {
        if (data.defaultTone) setTone(data.defaultTone);
        if (Array.isArray(data.customPhrases)) {
          const raw = data.customPhrases.slice(0, MAX_PHRASES);
          const firstEnabledIndex = raw.findIndex((p: { enabled?: boolean }) => p.enabled);
          const normalized = raw.map((p: { id: string; text: string; enabled?: boolean; createdAt?: { seconds: number; nanoseconds: number } }, i: number) => ({
            ...p,
            enabled: firstEnabledIndex >= 0 ? i === firstEnabledIndex : false,
          }));
          setCustomPhrases(normalized);
        }
      }
    } catch {
      // ignore
    } finally {
      setSettingsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadSettings();
    // デモ制限チェック（trialのみ）
    if (tenantId === "trial") {
      const remaining = getRemainingGenerations(tenantId, "reply");
      setRemainingGenerations(remaining);
    } else {
      setRemainingGenerations(null);
    }
  }, [loadSettings, canUsePaidFeatures, tenantId]);

  const savePhrasesToServer = useCallback(async () => {
    if (!tenantId) return;
    setPhrasesSaving(true);
    try {
      await fetch(`/api/tenant/${tenantId}/reply-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultTone: tone,
          customPhrases: customPhrases.map((p) => ({
            id: p.id,
            text: p.text,
            enabled: p.enabled,
            createdAt: p.createdAt,
          })),
        }),
      });
    } catch {
      // ignore
    } finally {
      setPhrasesSaving(false);
    }
  }, [tenantId, tone, customPhrases]);

  useEffect(() => {
    if (settingsLoading) return;
    const t = setTimeout(savePhrasesToServer, 800);
    return () => clearTimeout(t);
  }, [customPhrases, tone, settingsLoading, savePhrasesToServer]);

  const handleGenerate = async () => {
    const trimmed = review.trim();
    if (!trimmed) {
      setGenerateError("口コミを入力してください");
      return;
    }
    
    // デモ制限チェック（trialのみ）
    if (tenantId === "trial" && !canGenerate(tenantId, "reply")) {
      setGenerateError("無料お試し回数を使い切りました。無料トライアルに申し込んでください。");
      return;
    }

    setGenerateError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim() || undefined,
          review: trimmed,
          memo: memo.trim() || undefined,
          tone,
          starRating: starRating ?? undefined,
          customPhrases: phraseForReply,
          industry: industryKey,
          ...(industryKey === "retail" && retailPreset != null && { retailPreset }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenerateError(data.error ?? "生成に失敗しました。もう一度お試しください");
        return;
      }
      // カウントを増やす（trialのみ）
      if (tenantId === "trial") {
        incrementGenerationCount(tenantId, "reply");
        setRemainingGenerations(getRemainingGenerations(tenantId, "reply"));
      }
      setGeneratedReply(data.text ?? "");
      setReplyEdited(false);
    } catch {
      setGenerateError("生成に失敗しました。もう一度お試しください");
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleCopy = async () => {
    if (!generatedReply.trim()) return;
    try {
      await navigator.clipboard.writeText(generatedReply);
      setCopyNotice(true);
      setTimeout(() => setCopyNotice(false), 2000);
    } catch {
      // ignore
    }
  };

  const addPhrase = () => {
    if (customPhrases.length >= MAX_PHRASES) return;
    setCustomPhrases((prev) => [
      ...prev,
      {
        id: `phrase_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        text: "",
        enabled: false,
      },
    ]);
  };

  const selectPhraseForReply = (id: string) => {
    setCustomPhrases((prev) => {
      const current = prev.find((p) => p.id === id);
      const isDeselect = current?.enabled;
      return prev.map((p) => ({ ...p, enabled: !isDeselect && p.id === id }));
    });
  };

  const updatePhrase = (id: string, updates: Partial<CustomPhrase>) => {
    setCustomPhrases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const removePhrase = (id: string) => {
    setCustomPhrases((prev) => prev.filter((p) => p.id !== id));
  };

  const ownerHref = `/owner/${tenantId}`;
  const backHref = tenantId === "trial" ? "/trial" : ownerHref;
  const backLabel = tenantId === "trial" ? "トライアル選択ページに戻る" : "店舗管理画面へ戻る";

  return (
    <main className="min-h-screen flex flex-col px-4 sm:px-5 pt-8 pb-12 max-w-4xl mx-auto">
      <header className="mb-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          {backLabel}
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              オーナー様用クチコミ返信ヘルプAI
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              お客様の口コミに合わせた返信文をAIで生成できます
            </p>
          </div>
          {/* デモ制限表示（trialのみ） */}
          {tenantId === "trial" && remainingGenerations !== null && remainingGenerations < MAX_DEMO_GENERATIONS && (
            <span className="text-xs font-semibold text-primary bg-green-50 px-3 py-1.5 rounded-full border border-green-200 shrink-0 whitespace-nowrap">
              無料お試し：残り{remainingGenerations}回
            </span>
          )}
        </div>
      </header>

      {/* trialの場合は契約チェックをスキップ */}
      {tenantId !== "trial" && !canUsePaidFeatures && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">契約が有効ではありません</p>
            <p className="mt-1 text-red-700">
              返信の生成をご利用いただくには、店舗管理画面から月額プランにご加入ください。
            </p>
            <Link
              href={backHref}
              className="mt-2 inline-block text-sm font-medium underline"
            >
              {tenantId === "trial" ? "トライアル選択ページへ →" : "店舗管理画面へ →"}
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          <section className="space-y-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
              <h2 className="font-bold text-gray-800 mb-2">① お客様からのクチコミを貼り付ける</h2>
              <div className="mb-3">
                <label className="block text-base mb-1">
                  <span className="font-semibold text-gray-700">投稿者名</span>
                  <span className="block text-sm font-normal text-gray-600 mt-0.5">（返信に名前を入れるとお客様との距離が近くなり、信頼関係を築きやすくなります。）</span>
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="ここに名前を入力（貼り付ける）"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div className="mb-3">
                <p className="text-base font-semibold text-gray-700 mb-2">星評価（任意）</p>
                <div className="flex flex-wrap gap-4 items-center">
                  {([1, 2, 3, 4, 5] as const).map((n) => (
                    <label key={n} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="starRating"
                        checked={starRating === n}
                        onChange={() => setStarRating(n)}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="text-base text-gray-800">★{n}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">指定しない場合は口コミ内容から判断します</p>
              </div>
              <div className="mb-3">
                <label className="block text-base font-semibold text-gray-700 mb-1">口コミ本文</label>
                <textarea
                  value={review}
                  onChange={(e) => {
                    setReview(e.target.value);
                    setGenerateError("");
                  }}
                  placeholder="お客様からの口コミをここに貼り付けてください"
                  rows={6}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
                />
                <p className="text-xs text-gray-500 mt-1">{review.length} 文字</p>
              </div>
              <div>
                <label className="block mb-1">
                  <span className="text-base font-semibold text-gray-700">② 投稿者に伝えるメッセージ（任意）</span>
                  <span className="block text-sm font-normal text-gray-600 mt-0.5">（任意ですが、投稿者とのエピソードを１つ入れるだけで、ひとりひとりのお客様を大切にしている感じが、投稿者だけでなく、返信を読む未来のお客様にも伝わりやすくなります。）</span>
                </label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="例：釣りの話が楽しかった／伝えたストレッチ方法ぜひ試してみて"
                  rows={2}
                  maxLength={80}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
                />
                <p className="text-xs text-gray-500 mt-1">{memo.length}/80 文字</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
              <h2 className="font-semibold text-gray-800 mb-3">③ 返信設定</h2>
              <div className="mb-6">
                <p className="text-base font-semibold text-gray-600 mb-2">・トーンを選ぶ（必須）</p>
                <div className="flex flex-wrap gap-2">
                  {TONE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="tone"
                        value={opt.value}
                        checked={tone === opt.value}
                        onChange={() => setTone(opt.value)}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-800">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-base text-gray-600 mb-1">・カスタムフレーズを選ぶ（任意）</p>
                <p className="text-xs text-gray-500 mb-2"><span className="text-amber-500 font-semibold">＊</span>オリジナルフレーズを５つまで登録できます。返信に使えるのは１つのみです。</p>
                {settingsLoading ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    読み込み中…
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customPhrases.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 py-2 px-3 rounded-lg bg-gray-50 border border-gray-200"
                      >
                        <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={p.enabled}
                            onChange={() => selectPhraseForReply(p.id)}
                            className="rounded text-primary focus:ring-primary"
                            aria-label="返信で使う"
                          />
                          <span className="text-xs text-gray-600 whitespace-nowrap">返信で使う</span>
                        </label>
                        <input
                          type="text"
                          value={p.text}
                          onChange={(e) =>
                            updatePhrase(p.id, { text: e.target.value })
                          }
                          placeholder="例: 駐車場10台完備、次回使える10%OFFクーポン進呈中"
                          className="flex-1 min-w-0 px-2 py-1 rounded border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <button
                          type="button"
                          onClick={() => removePhrase(p.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {customPhrases.length < MAX_PHRASES && (
                      <button
                        type="button"
                        onClick={addPhrase}
                        className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        フレーズを追加
                      </button>
                    )}
                    {phrasesSaving && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        保存中…
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-5">
            {/* 制限に達した場合の案内（trialのみ） */}
              {tenantId === "trial" && remainingGenerations === 0 && (
                <div className="bg-green-50 rounded-xl p-5 border border-green-200 mb-4">
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
                onClick={handleGenerate}
                disabled={generating || (tenantId !== "trial" && !canUsePaidFeatures) || (tenantId === "trial" && remainingGenerations === 0)}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    生成中…
                  </>
                ) : (
                  "返信文を作成する"
                )}
              </button>
              {generateError && (
                <p className="mt-2 text-sm text-red-600">{generateError}</p>
              )}

              {generatedReply && (
                <>
                  <div className="mt-4">
                    <label className="block text-sm mb-1">
                      <span className="font-medium text-gray-700">生成された返信</span>
                      <span className="font-normal text-gray-600">（編集可：必ず生成された内容を確認し、適宜加筆・修正してご使用ください）</span>
                    </label>
                    <textarea
                      value={generatedReply}
                      onChange={(e) => {
                        setGeneratedReply(e.target.value);
                        setReplyEdited(true);
                      }}
                      rows={6}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {generatedReply.length} 文字
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      disabled={generating}
                      className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      再生成
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium flex items-center gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      {copyNotice ? "コピーしました！" : "コピー"}
                    </button>
                  </div>
                </>
              )}
          </section>
        </div>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <Link href={backHref} className="text-sm text-gray-500 hover:text-gray-700">
          ← {backLabel}
        </Link>
      </div>
    </main>
  );
}
