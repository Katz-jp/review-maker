"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CreditCard, QrCode, ExternalLink, Loader2, Plus, Trash2, Settings2, MessageSquare } from "lucide-react";
import { questionnaireData } from "@/lib/questionnaire-data";

type CustomOptionsByQuestion = Record<string, string[]>;

const MAX_CUSTOM_OPTIONS = 3;

function CustomOptionsEditor({
  questionId,
  questionLabel,
  options,
  onAdd,
  onRemove,
  maxOptions,
}: {
  questionId: string;
  questionLabel: string;
  options: string[];
  onAdd: (questionId: string, value: string) => void;
  onRemove: (questionId: string, index: number) => void;
  maxOptions: number;
}) {
  const [inputValue, setInputValue] = useState("");
  const canAdd = options.length < maxOptions && inputValue.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd) return;
    onAdd(questionId, inputValue);
    setInputValue("");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
      <h3 className="font-medium text-gray-800 text-sm mb-2">{questionLabel}</h3>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-white border border-gray-200"
          >
            <span className="text-sm text-gray-800">{opt}</span>
            <button
              type="button"
              onClick={() => onRemove(questionId, i)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {options.length < maxOptions && (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="選択肢を追加（例：オーダーメイド矯正）"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              type="submit"
              disabled={!canAdd}
              className="px-3 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              追加
            </button>
          </form>
        )}
        {options.length > 0 && (
          <p className="text-xs text-gray-500">
            {options.length} / {maxOptions} 件
          </p>
        )}
      </div>
    </div>
  );
}

export default function OwnerPage() {
  const params = useParams();
  const tenantId = (params.tenantId as string) || "demo";
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [canceled, setCanceled] = useState(false);

  const [tenantStatus, setTenantStatus] = useState<"active" | "trialing" | "inactive" | "canceled" | "past_due" | null>(null);
  const [customOptions, setCustomOptions] = useState<CustomOptionsByQuestion>({});
  const [customOptionsLoading, setCustomOptionsLoading] = useState(true);
  const [customOptionsSaving, setCustomOptionsSaving] = useState(false);
  const [customOptionsSaved, setCustomOptionsSaved] = useState(false);
  const [customerUrl, setCustomerUrl] = useState(`/${tenantId}`);

  const canUsePaidFeatures = tenantStatus === "active" || tenantStatus === "trialing";
  const isRestricted = tenantStatus === "canceled" || tenantStatus === "past_due";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    setSuccess(sp.get("success") === "true");
    setCanceled(sp.get("canceled") === "true");
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCustomerUrl(`${window.location.origin}/${tenantId}`);
    }
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    fetch(`/api/tenant/${tenantId}`)
      .then((res) => res.json())
      .then((data) => setTenantStatus(data.subscriptionStatus ?? "inactive"))
      .catch(() => setTenantStatus("inactive"));
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    fetch(`/api/tenant/${tenantId}/custom-options`)
      .then((res) => res.json())
      .then((data) => {
        setCustomOptions(data.customOptions ?? {});
      })
      .catch(() => setCustomOptions({}))
      .finally(() => setCustomOptionsLoading(false));
  }, [tenantId]);

  const handleAddOption = (questionId: string, value: string) => {
    const current = customOptions[questionId] ?? [];
    if (current.length >= MAX_CUSTOM_OPTIONS) return;
    const trimmed = value.trim();
    if (!trimmed || current.includes(trimmed)) return;
    setCustomOptions((prev) => ({
      ...prev,
      [questionId]: [...current, trimmed],
    }));
  };

  const handleRemoveOption = (questionId: string, index: number) => {
    setCustomOptions((prev) => {
      const current = prev[questionId] ?? [];
      const next = current.filter((_, i) => i !== index);
      if (next.length === 0) {
        const { [questionId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [questionId]: next };
    });
  };

  const handleSaveCustomOptions = async () => {
    setCustomOptionsSaving(true);
    setCustomOptionsSaved(false);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/custom-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customOptions }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "保存に失敗しました");
      }
      setCustomOptionsSaved(true);
      setTimeout(() => setCustomOptionsSaved(false), 3000);
    } catch (e) {
      alert(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setCustomOptionsSaving(false);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "エラー");
      if (data.url)       window.location.href = data.url;
    } catch (e) {
      alert(e instanceof Error ? e.message : "チェックアウトに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col px-5 pt-10 pb-12 max-w-lg mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-xl font-bold text-gray-800">口コミ作成AIアプリ 店舗管理画面</h1>
        <p className="text-sm text-gray-500 mt-1">テナントID: {tenantId}</p>
      </header>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
          決済が完了しました。サブスクリプションが有効になりました。
        </div>
      )}
      {canceled && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
          決済がキャンセルされました。
        </div>
      )}

      {isRestricted && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
          {tenantStatus === "canceled"
            ? "ご契約は解約済みです。以下の機能はご利用いただけません。再開するには「月額プランに加入する」からお手続きください。"
            : "お支払いが遅延しています。以下の機能を利用するにはお支払いを完了してください。"}
        </div>
      )}

      <section className="flex-1 space-y-6">
        {canUsePaidFeatures ? (
          <Link
            href={`/${tenantId}/reply-helper`}
            className="block bg-white rounded-2xl p-5 shadow-sm border border-green-100 hover:border-primary/50 transition-colors"
          >
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              クチコミ返信ヘルプAI
            </h2>
            <p className="text-sm text-gray-600">
              お客様の口コミに合わせた返信文をAIで生成できます。
            </p>
            <span className="mt-2 inline-block text-sm text-primary font-medium">
              使ってみる →
            </span>
          </Link>
        ) : (
          <div className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-200 bg-gray-50/50 opacity-90">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              クチコミ返信ヘルプAI
            </h2>
            <p className="text-sm text-gray-600">
              お客様の口コミに合わせた返信文をAIで生成できます。
            </p>
            <p className="mt-2 text-sm text-gray-500">
              ご利用には有効な月額プランが必要です。
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            サブスクリプション
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            月額プランに加入して、お客様アンケート機能を利用できます。
          </p>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                処理中…
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                月額プランに加入する
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            オリジナル選択肢の設定
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            各質問に、最大3つまで店舗オリジナルの選択肢を追加できます。お客様アンケートに表示されます。
          </p>
          {customOptionsLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              読み込み中…
            </div>
          ) : (
            <div className="space-y-5">
              {questionnaireData.questions.map((q) => (
                <CustomOptionsEditor
                  key={q.id}
                  questionId={q.id}
                  questionLabel={q.label}
                  options={customOptions[q.id] ?? []}
                  onAdd={handleAddOption}
                  onRemove={handleRemoveOption}
                  maxOptions={MAX_CUSTOM_OPTIONS}
                />
              ))}
              <button
                type="button"
                onClick={handleSaveCustomOptions}
                disabled={customOptionsSaving || !canUsePaidFeatures}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {customOptionsSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    保存中…
                  </>
                ) : customOptionsSaved ? (
                  "✓ 保存しました"
                ) : !canUsePaidFeatures ? (
                  "契約が有効な場合のみ保存できます"
                ) : (
                  "選択肢を保存する"
                )}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            お客様用URL
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            QRコードやリンクでお客様に共有してください。
          </p>
          <div className="p-3 rounded-xl bg-gray-50 text-sm text-gray-700 font-mono break-all">
            {customerUrl}
          </div>
          <a
            href={customerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-primary-dark font-medium text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            ページを開く
          </a>
        </div>
      </section>

      <div className="mt-auto pt-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          ← トップへ戻る
        </Link>
      </div>
    </main>
  );
}
