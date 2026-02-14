"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Copy,
  RotateCcw,
  Save,
  Trash2,
  Plus,
  MessageSquare,
  History,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import { useTenant } from "@/components/TenantProvider";

type Tone = "friendly" | "polite" | "professional";

type CustomPhrase = {
  id: string;
  text: string;
  enabled: boolean;
  createdAt?: { seconds: number; nanoseconds: number };
};

type HistoryItem = {
  id: string;
  originalReview: string;
  generatedReply: string;
  tone: string;
  usedPhrases: string[];
  characterCount: number;
  wasEdited: boolean;
  createdAt: { seconds: number; nanoseconds: number };
};

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: "friendly", label: "フレンドリー" },
  { value: "polite", label: "丁寧" },
  { value: "professional", label: "プロフェッショナル" },
];

const MAX_PHRASES = 3;

function formatHistoryDate(seconds: number): string {
  const d = new Date(seconds * 1000);
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReplyHelperPage() {
  const params = useParams();
  const tenantId = (params.tenantId as string) || "demo";
  const tenant = useTenant();
  const canUsePaidFeatures = tenant.subscriptionStatus === "active" || tenant.subscriptionStatus === "trialing";

  const [review, setReview] = useState("");
  const [tone, setTone] = useState<Tone>("polite");
  const [customPhrases, setCustomPhrases] = useState<CustomPhrase[]>([]);
  const [generatedReply, setGeneratedReply] = useState("");
  const [replyEdited, setReplyEdited] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [copyNotice, setCopyNotice] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [phrasesSaving, setPhrasesSaving] = useState(false);

  const [historyTab, setHistoryTab] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const enabledPhrases = customPhrases.filter((p) => p.enabled).map((p) => p.text);

  const loadSettings = useCallback(async () => {
    if (!tenantId) return;
    setSettingsLoading(true);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/reply-settings`);
      const data = await res.json();
      if (res.ok) {
        if (data.defaultTone) setTone(data.defaultTone);
        if (Array.isArray(data.customPhrases)) setCustomPhrases(data.customPhrases.slice(0, MAX_PHRASES));
      }
    } catch {
      // ignore
    } finally {
      setSettingsLoading(false);
    }
  }, [tenantId]);

  const loadHistory = useCallback(async () => {
    if (!tenantId) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/reply-history`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.items)) setHistoryItems(data.items);
    } catch {
      setHistoryItems([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (historyTab) loadHistory();
  }, [historyTab, loadHistory]);

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
    setGenerateError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review: trimmed,
          tone,
          customPhrases: enabledPhrases,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenerateError(data.error ?? "生成に失敗しました。もう一度お試しください");
        return;
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

  const handleSaveHistory = async () => {
    const text = generatedReply.trim();
    if (!text || !tenantId) return;
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/reply-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalReview: review.trim(),
          generatedReply: text,
          tone,
          usedPhrases: customPhrases.filter((p) => p.enabled).map((p) => p.id),
          characterCount: text.length,
          wasEdited: replyEdited,
        }),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (historyTab) loadHistory();
    } catch {
      alert("履歴の保存に失敗しました");
    }
  };

  const addPhrase = () => {
    if (customPhrases.length >= MAX_PHRASES) return;
    setCustomPhrases((prev) => [
      ...prev,
      {
        id: `phrase_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        text: "",
        enabled: true,
      },
    ]);
  };

  const updatePhrase = (id: string, updates: Partial<CustomPhrase>) => {
    setCustomPhrases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const removePhrase = (id: string) => {
    setCustomPhrases((prev) => prev.filter((p) => p.id !== id));
  };

  const useHistoryReply = (item: HistoryItem) => {
    setGeneratedReply(item.generatedReply);
    setReview(item.originalReview);
    setReplyEdited(false);
    setHistoryTab(false);
  };

  const ownerHref = `/owner/${tenantId}`;

  return (
    <main className="min-h-screen flex flex-col px-4 sm:px-5 pt-8 pb-12 max-w-4xl mx-auto">
      <header className="mb-6">
        <Link
          href={ownerHref}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          店舗管理画面へ戻る
        </Link>
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          クチコミ返信ヘルプAI
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          お客様の口コミに合わせた返信文をAIで生成できます
        </p>
      </header>

      {!canUsePaidFeatures && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">契約が有効ではありません</p>
            <p className="mt-1 text-red-700">
              返信の生成・保存をご利用いただくには、店舗管理画面から月額プランにご加入ください。
            </p>
            <Link
              href={ownerHref}
              className="mt-2 inline-block text-sm font-medium underline"
            >
              店舗管理画面へ →
            </Link>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setHistoryTab(false)}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            !historyTab
              ? "bg-white border border-b-0 border-gray-200 text-gray-800 -mb-px"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          返信を生成
        </button>
        <button
          type="button"
          onClick={() => setHistoryTab(true)}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-1 ${
            historyTab
              ? "bg-white border border-b-0 border-gray-200 text-gray-800 -mb-px"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <History className="w-4 h-4" />
          履歴を見る
        </button>
      </div>

      {!historyTab ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          <section className="space-y-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
              <h2 className="font-semibold text-gray-800 mb-2">口コミ入力</h2>
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

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
              <h2 className="font-semibold text-gray-800 mb-3">返信設定</h2>
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">トーン（必須）</p>
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
              <p className="text-xs text-gray-500 mb-4">150〜200文字を推奨</p>

              <div>
                <p className="text-sm text-gray-600 mb-2">カスタムフレーズ（最大3つ）</p>
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
                        <input
                          type="checkbox"
                          checked={p.enabled}
                          onChange={(e) =>
                            updatePhrase(p.id, { enabled: e.target.checked })
                          }
                          className="rounded text-primary focus:ring-primary"
                        />
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
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
              <h2 className="font-semibold text-gray-800 mb-3">返信を生成</h2>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !canUsePaidFeatures}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    生成中…
                  </>
                ) : (
                  "返信を生成"
                )}
              </button>
              {generateError && (
                <p className="mt-2 text-sm text-red-600">{generateError}</p>
              )}

              {generatedReply && (
                <>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      生成された返信（編集可）
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
                    <button
                      type="button"
                      onClick={handleSaveHistory}
                      disabled={!canUsePaidFeatures}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saveSuccess ? "保存しました" : "保存"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <h2 className="font-semibold text-gray-800 mb-4">返信履歴</h2>
          {historyLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              読み込み中…
            </div>
          ) : historyItems.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              まだ履歴がありません。返信を生成して「保存」するとここに表示されます。
            </p>
          ) : (
            <ul className="space-y-4">
              {historyItems.map((item) => (
                <li
                  key={item.id}
                  className="p-4 rounded-xl border border-gray-200 bg-gray-50/50"
                >
                  <p className="text-xs text-gray-500 mb-1">
                    {formatHistoryDate(item.createdAt.seconds)}
                  </p>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {item.originalReview.slice(0, 50)}
                    {item.originalReview.length > 50 ? "..." : ""}
                  </p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap mb-3">
                    {item.generatedReply}
                  </p>
                  <button
                    type="button"
                    onClick={() => useHistoryReply(item)}
                    className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium"
                  >
                    この返信を使う
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-gray-200">
        <Link href={ownerHref} className="text-sm text-gray-500 hover:text-gray-700">
          ← 店舗管理画面へ戻る
        </Link>
      </div>
    </main>
  );
}
