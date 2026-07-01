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
  Undo2,
} from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { getRemainingGenerations, canGenerate, incrementGenerationCount, MAX_DEMO_GENERATIONS } from "@/lib/demo-limit";
import { clientTenantAllowsPaidFeatures } from "@/lib/tenant-subscription";

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
  const canUsePaidFeatures = clientTenantAllowsPaidFeatures(tenantId, tenant);

  const [authorName, setAuthorName] = useState("");
  const [review, setReview] = useState("");
  const [memo, setMemo] = useState("");
  const [tone, setTone] = useState<Tone>("polite");
  const [starRating, setStarRating] = useState<number | null>(null);
  const [customPhrases, setCustomPhrases] = useState<CustomPhrase[]>([]);
  const [generatedReply, setGeneratedReply] = useState("");
  const [previousReply, setPreviousReply] = useState<string | null>(null);
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
      if (generatedReply.trim()) setPreviousReply(generatedReply);
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

  const handleRestorePrevious = () => {
    if (previousReply !== null) {
      setGeneratedReply(previousReply);
      setPreviousReply(null);
    }
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
              オーナー様用口コミ返信ヘルプAI
            </h1>
            <p className="text-base text-gray-500 mt-1">
              届いた口コミの文章を貼り付けるだけで、かんたんに返信文が作れます
            </p>
          </div>
          {tenantId === "trial" && remainingGenerations !== null && remainingGenerations < MAX_DEMO_GENERATIONS && (
            <span className="text-xs font-semibold text-primary bg-green-50 px-3 py-1.5 rounded-full border border-green-200 shrink-0 whitespace-nowrap">
              無料お試し：残り{remainingGenerations}回
            </span>
          )}
        </div>
      </header>

      {tenantId !== "trial" && !canUsePaidFeatures && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">契約が有効ではありません</p>
            <p className="mt-1 text-red-700">
              返信の生成をご利用いただくには、店舗管理画面から月額プランにご加入ください。
            </p>
            <Link href={backHref} className="mt-2 inline-block text-sm font-medium underline">
              {tenantId === "trial" ? "トライアル選択ページへ →" : "店舗管理画面へ →"}
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* 左カラム：入力 */}
        <div className="space-y-4">

          {/* STEP 1: 口コミ入力 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
            <div className="flex items-center gap-2.5 mb-4 text-lg">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">1</span>
              <h2 className="font-bold text-gray-800">口コミを貼り付ける</h2>
            </div>

            {/* 口コミ本文（最重要 → 一番上） */}
            <div className="mb-4">
              <label className="block text-base font-semibold text-gray-700 mb-1.5 border-[3px] border-transparent">
                口コミ本文 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={review}
                onChange={(e) => { setReview(e.target.value); setGenerateError(""); }}
                placeholder="Googleマップなどに投稿された患者様の口コミをここにコピー＆ペーストしてください"
                rows={6}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-[rgba(31,41,55,1)] resize-y"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{review.length} 文字</p>
            </div>

            {/* 星評価（クリック式★） */}
            <div className="mb-4">
              <p className="text-base font-semibold text-gray-700 mb-1.5">
                星評価 <span className="text-gray-400 font-normal text-xs">（任意）</span>
              </p>
              <div className="flex items-center gap-1">
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStarRating(starRating === n ? null : n)}
                    className={`text-3xl leading-none transition-colors ${
                      n <= (starRating ?? 0) ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">指定しない場合は口コミ内容から判断します</p>
            </div>

            {/* 投稿者名 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                投稿者名 <span className="text-gray-400 font-normal text-xs">（任意）</span>
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="例：猫乃くー"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-[rgba(31,41,55,1)]"
              />
              <p className="text-xs text-gray-500 mt-1">名前を入れると、より親しみのある返信になります</p>
            </div>

            {/* メモ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                一言メモ <span className="text-gray-400 font-normal text-xs">（任意）</span>
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="例：釣りの話が楽しかった／伝えたストレッチ方法ぜひ試してみて"
                rows={2}
                maxLength={80}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-[rgba(31,41,55,1)] resize-y"
              />
              <p className="text-sm text-gray-500 mt-1">
                {memo.length}/80文字 ・ 投稿者とのエピソードを添えると、より温かみのある返信になります
              </p>
            </div>
          </div>

          {/* STEP 2: 返信スタイル */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">2</span>
              <h2 className="font-bold text-gray-800">返信スタイルを選ぶ</h2>
            </div>

            {/* トーン（ピルボタン） */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">文体</p>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTone(opt.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      tone === opt.value
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* カスタムフレーズ */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                カスタムフレーズ <span className="text-gray-400 font-normal text-xs">（任意）</span>
              </p>
              <p className="text-xs text-gray-500 mb-3">
                返信に添えるフレーズを最大5つ登録できます。選択した1つが返信に使われます。
              </p>
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
                      className={`flex items-center gap-2 py-2 px-3 rounded-xl border transition-colors ${
                        p.enabled ? "border-primary bg-green-50" : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      {/* ラジオ風ボタン */}
                      <button
                        type="button"
                        onClick={() => selectPhraseForReply(p.id)}
                        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          p.enabled ? "border-primary bg-primary" : "border-gray-300 bg-white"
                        }`}
                        aria-label={p.enabled ? "選択中" : "選択する"}
                      >
                        {p.enabled && <span className="w-2 h-2 rounded-full bg-white block" />}
                      </button>
                      <input
                        type="text"
                        value={p.text}
                        onChange={(e) => updatePhrase(p.id, { text: e.target.value })}
                        placeholder="例: 駐車場10台完備、次回10%OFFクーポン進呈中"
                        className="flex-1 min-w-0 px-2 py-1 rounded-lg border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
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
        </div>

        {/* 右カラム：生成＆結果 */}
        <div className="space-y-4">

          {/* トライアル上限 */}
          {tenantId === "trial" && remainingGenerations === 0 && (
            <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
              <p className="text-base font-bold text-gray-900 mb-3 text-center">
                5回のお試し、いかがでしたか？
              </p>
              <p className="text-sm text-gray-700 mb-4 text-center leading-relaxed">
                実際の口コミの質を実感いただけたでしょうか？
              </p>
              <div className="space-y-1 mb-4 text-sm text-gray-700">
                <p>「もっと多くのメニューで試したい」</p>
                <p>「実際に店舗で運用してみたい」</p>
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

          {/* STEP 3: 生成ボタン */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">3</span>
              <h2 className="font-bold text-gray-800">返信文を生成する</h2>
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || (tenantId !== "trial" && !canUsePaidFeatures) || (tenantId === "trial" && remainingGenerations === 0)}
              className="w-full py-5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-lg leading-tight disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  生成中…
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5" />
                  返信文を作成する
                </>
              )}
            </button>
            {generateError && (
              <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {generateError}
              </p>
            )}
          </div>

          {/* 返信結果 */}
          {generatedReply && (
            <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800">返信案</h3>
                {replyEdited && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    編集済み
                  </span>
                )}
              </div>
              <textarea
                value={generatedReply}
                onChange={(e) => { setGeneratedReply(e.target.value); setReplyEdited(true); }}
                rows={8}
                className="w-full px-3 py-2 rounded-xl border border-green-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{generatedReply.length} 文字</p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm ${
                    copyNotice
                      ? "bg-green-500 text-white"
                      : "bg-primary hover:bg-primary-dark text-white"
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {copyNotice ? "コピーしました！" : "コピーする"}
                </button>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={generating}
                  className="px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  他の案
                </button>
              </div>

              {previousReply !== null && (
                <button
                  type="button"
                  onClick={handleRestorePrevious}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  ひとつ前の案に戻す
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200 text-lg font-semibold">
        <Link href={backHref} className="text-sm text-gray-500 hover:text-gray-700">
          ← {backLabel}
        </Link>
      </div>
    </main>
  );
}
