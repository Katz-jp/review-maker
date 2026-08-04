"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { QRCodeSVG } from "qrcode.react";
import {
  CreditCard,
  QrCode,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
  Settings2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getIndustryConfig } from "@/lib/industries";
import { BRAND_NAME } from "@/lib/brand";

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
      <h3 className="font-medium text-gray-800 text-base mb-2">{questionLabel}</h3>
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
          <p className="text-xs text-gray-800 font-medium">
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

  const [tenantStatus, setTenantStatus] = useState<
    "active" | "trialing" | "inactive" | "canceled" | "past_due" | "app_trial" | null
  >(null);
  const [tenantPaidAccess, setTenantPaidAccess] = useState(false);
  const [appTrialEndsAtIso, setAppTrialEndsAtIso] = useState<string | undefined>(undefined);
  const [tenantIndustry, setTenantIndustry] = useState<string | undefined>(undefined);
  const [tenantName, setTenantName] = useState<string | undefined>(undefined);
  const [usageStats, setUsageStats] = useState<{
    mapsClickCount: number;
    mapsSatisfactionAvg: number | null;
    mapsSatisfactionCount: number;
    feedbackClickCount: number;
  } | null>(null);
  const [customOptions, setCustomOptions] = useState<CustomOptionsByQuestion>({});
  const [customOptionsLoading, setCustomOptionsLoading] = useState(true);
  const [customOptionsSaving, setCustomOptionsSaving] = useState(false);
  const [customOptionsSaved, setCustomOptionsSaved] = useState(false);
  const [customerUrl, setCustomerUrl] = useState(`/${tenantId}`);
  const [showUrgentQrOrder, setShowUrgentQrOrder] = useState(false);
  const [showBulkQrOrder, setShowBulkQrOrder] = useState(false);

  const canUsePaidFeatures = tenantPaidAccess;
  const stripeSubscribed = tenantStatus === "active" || tenantStatus === "trialing";
  const appTrialLive = tenantStatus === "app_trial" && tenantPaidAccess;
  const isRestricted = tenantStatus === "canceled" || tenantStatus === "past_due";
  const effectiveIndustry = tenantIndustry ?? "dental";
  const isDental = effectiveIndustry === "dental" || effectiveIndustry === "";

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
      .then((data) => {
        setTenantStatus(data.subscriptionStatus ?? "inactive");
        setTenantPaidAccess(data.paidAccess === true);
        setAppTrialEndsAtIso(typeof data.appTrialEndsAt === "string" ? data.appTrialEndsAt : undefined);
        setTenantIndustry(data.industry);
        setTenantName(typeof data.name === "string" ? data.name : undefined);
      })
      .catch(() => {
        setTenantStatus("inactive");
        setTenantPaidAccess(false);
      });
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    fetch(`/api/tenant/${tenantId}/stats`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setUsageStats({
          mapsClickCount: typeof data.mapsClickCount === "number" ? data.mapsClickCount : 0,
          mapsSatisfactionAvg: typeof data.mapsSatisfactionAvg === "number" ? data.mapsSatisfactionAvg : null,
          mapsSatisfactionCount: typeof data.mapsSatisfactionCount === "number" ? data.mapsSatisfactionCount : 0,
          feedbackClickCount: typeof data.feedbackClickCount === "number" ? data.feedbackClickCount : 0,
        });
      })
      .catch(() =>
        setUsageStats({
          mapsClickCount: 0,
          mapsSatisfactionAvg: null,
          mapsSatisfactionCount: 0,
          feedbackClickCount: 0,
        })
      );
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
    const cap = MAX_CUSTOM_OPTIONS;
    if (current.length >= cap) return;
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
      if (data.url) window.location.href = data.url;
    } catch (e) {
      alert(e instanceof Error ? e.message : "チェックアウトに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "エラー");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      alert(e instanceof Error ? e.message : "プラン管理ページを開けませんでした");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col px-5 pt-10 pb-12 max-w-lg mx-auto">
      <Script src="https://js.stripe.com/v3/buy-button.js" strategy="afterInteractive" />
      <header className="text-center mb-8">
        <h1 className="text-xl font-bold text-gray-800">{BRAND_NAME} - 店舗管理画面</h1>
        {tenantName && (
          <p className="text-base font-semibold text-gray-700 mt-1">{tenantName}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">テナントID: {tenantId}</p>
      </header>

      <div className="mb-6 bg-white rounded-2xl p-5 shadow-sm border border-green-100">
        <h2 className="font-semibold text-gray-800 mb-3">ご利用状況</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <p className="text-xs text-gray-800 font-medium">平均満足度</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">
              {usageStats?.mapsSatisfactionAvg != null ? usageStats.mapsSatisfactionAvg.toFixed(1) : "—"}
              <span className="ml-1 text-sm font-semibold text-gray-600">/ 5</span>
            </p>
            <p className="mt-1 text-xs text-gray-800 font-medium">
              n={usageStats?.mapsSatisfactionCount ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <p className="text-xs text-gray-800 font-medium">Googleへの口コミ投稿数</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">
              {usageStats?.mapsClickCount ?? 0}
              <span className="ml-1 text-sm font-semibold text-gray-600">件</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-white rounded-2xl p-5 shadow-sm border border-green-100">
        <h2 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          ご契約状況
        </h2>
        {stripeSubscribed ? (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-700 font-semibold">✅ 月額プラン利用中</p>
              <p className="text-sm text-gray-600 mt-2">
                ご利用ありがとうございます。
              </p>
            </div>
            <button
              type="button"
              onClick={handlePortal}
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
                  プランを管理
                </>
              )}
            </button>

            <div className="mt-6 pt-6 border-t border-green-100 space-y-5">
              <div>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfcrw-MRiHglYXzwnCmygMiYcxrQY0hJ71yJLilPlSKRdijxQ/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-white border-2 border-primary text-primary-dark font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                >
                  <QrCode className="w-5 h-5" />
                  （無料）QRカードを追加注文する
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-sm font-semibold text-gray-800 mt-2">
                  無料でお届けする名刺サイズのQRカード100枚配送（お届けまで7日〜10日程度）の注文フォームです。
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowUrgentQrOrder((v) => !v)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-gray-50/50 text-sm font-medium text-gray-700"
                >
                  <span>【有料】QRカード追加：お急ぎで100枚（お届けまで3日程度）</span>
                  {showUrgentQrOrder ? (
                    <ChevronUp className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  )}
                </button>
                {showUrgentQrOrder && (
                  <div className="p-4 border-t border-gray-200">
                    <stripe-buy-button
                      buy-button-id="buy_btn_1Tz8QvCxmSrOKVkzVmute8Kx"
                      publishable-key="pk_live_51Szq9lCxmSrOKVkzULx9ndiZ6jwT6NtEzLXLRo1sWmEKRDgzRe25idRgmN6vpXKmES6pkxPdX7aSs16R3UjjbYXB00NgoxsURW"
                    />
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowBulkQrOrder((v) => !v)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-gray-50/50 text-sm font-medium text-gray-700"
                >
                  <span>【有料】QRカード追加：まとめて注文500枚（お届けまで5〜7日程度）</span>
                  {showBulkQrOrder ? (
                    <ChevronUp className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  )}
                </button>
                {showBulkQrOrder && (
                  <div className="p-4 border-t border-gray-200">
                    <stripe-buy-button
                      buy-button-id="buy_btn_1Tz8S5CxmSrOKVkzgDpUwlsn"
                      publishable-key="pk_live_51Szq9lCxmSrOKVkzULx9ndiZ6jwT6NtEzLXLRo1sWmEKRDgzRe25idRgmN6vpXKmES6pkxPdX7aSs16R3UjjbYXB00NgoxsURW"
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : appTrialLive ? (
          <>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
              <p className="text-teal-800 font-semibold">🎁 アプリ無料体験中（Stripe 登録前）</p>
              <p className="text-sm text-gray-700 mt-2">
                お店用 URL と PIN で体験中です。気に入ったら下から正式に Stripe でお手続きください（カード登録と同時にご利用料金の請求が始まります）。
              </p>
              {appTrialEndsAtIso && (
                <p className="text-xs text-gray-600 mt-2">
                  体験終了予定:{" "}
                  <time dateTime={appTrialEndsAtIso}>
                    {new Date(appTrialEndsAtIso).toLocaleString("ja-JP", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </p>
              )}
            </div>
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
                  Stripe で正式登録する
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-semibold">🎉 先行特別キャンペーン実施中！</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>💰 ご契約から2ヶ月間は半額の4,990円</li>
                <li>🚀 3ヶ月目から月額9,980円</li>
              </ul>
              <p className="text-xs text-gray-600 mt-2">
                ＊無料体験（アプリ体験期間）をまだご利用でない場合は、お問い合わせより担当者にご連絡ください。
              </p>
            </div>
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
                  今すぐ契約する
                </>
              )}
            </button>
          </>
        )}
      </div>

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
            className="block bg-white rounded-2xl p-5 shadow-sm border border-green-100 hover:border-primary/50 transition-colors text-green-700"
          >
            <h2 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              （医院様用）口コミ返信AI
            </h2>
            <p className="text-[15px] text-gray-800">
              患者様の口コミに合わせた返信文をAIで生成できます。
            </p>
            <span className="mt-2 inline-block text-base text-green-700 font-bold">
              使ってみる →
            </span>
          </Link>
        ) : (
          <div className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-200 bg-gray-50/50 opacity-90">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              （医院様が利用）口コミ返信AI
            </h2>
            <p className="text-sm text-gray-600">
              患者様の口コミに合わせた返信文をAIで生成できます。
            </p>
            <p className="mt-2 text-sm text-gray-500">
              ご利用には有効な月額プランが必要です。
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            （患者様が利用）口コミ作成AI
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            QRコードやリンクで患者様に共有できます。
          </p>
          <div className="p-3 rounded-xl bg-gray-50 text-sm text-gray-700 font-mono break-all">
            {customerUrl}
          </div>
          <div className="mt-4 flex justify-center">
            <QRCodeSVG value={customerUrl} size={180} level="M" className="rounded-lg border border-gray-200 bg-white p-2" />
          </div>
          <a
            href={customerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-primary-dark font-medium text-base"
          >
            <ExternalLink className="w-4 h-4" />
            ページを開く
          </a>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            オリジナル選択肢の設定
          </h2>
          <div className="text-sm text-gray-600 mb-4">
            <p className="text-base font-medium">
              各質問に、最大3つまで貴院オリジナルの選択肢を追加できます。
            </p>
            <div className="text-red-600 mt-2">
              <span className="text-[15px] block font-bold">※追加・削除するときの注意点</span>
              <ul className="text-[13px] mt-1 ml-4 list-disc space-y-0.5">
                <li>１つずつ追加すること</li>
                <li>必ず「選択肢を保存する」ボタンを押すこと（これを押さないと反映されません）</li>
              </ul>
            </div>
          </div>
          {customOptionsLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              読み込み中…
            </div>
          ) : (
            <div className="space-y-5">
              {getIndustryConfig().questions.map((q) => (
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
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
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

        {/* 操作方法動画 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <h2 className="font-semibold text-gray-800 mb-4">
            操作方法動画
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            以下の動画で使い方をご確認いただけます。
          </p>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-800 text-base mb-2">口コミ作成AIの流れを説明した動画</h3>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                <iframe
                  src="https://www.youtube.com/embed/nb5kaQUmy4Q"
                  title="口コミ作成AIの流れを説明した動画"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 text-base mb-2">オリジナルの選択肢の追加・削除方法</h3>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                <iframe
                  src="https://www.youtube.com/embed/PcRkGMbkoJ0"
                  title="オリジナルの選択肢の追加・削除方法"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 text-base mb-2">口コミ返信ヘルプ AI の使い方</h3>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                <iframe
                  src="https://www.youtube.com/embed/SSW514dPT70"
                  title="口コミ返信ヘルプ AI の使い方"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-auto pt-6 border-t border-gray-200">
        <div className="pt-6">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScL6qaicGvP-__HBsraAXicZuXPe8Je1eclgAGUNDAdklZTiQ/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-base text-gray-600 hover:text-gray-800 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            要望や不具合を報告する（Googleフォームが開きます）
            <ExternalLink className="w-3 h-3" />
          </a>
          <p className="text-sm text-gray-500 font-medium mt-1 ml-6">
            ご意見・不具合報告はこちらからお願いします
          </p>
        </div>
        <Link href="/" className="block mt-8 text-lg text-gray-500 hover:text-gray-700">
          ← {BRAND_NAME}のトップページへ
        </Link>
      </div>
    </main>
  );
}
