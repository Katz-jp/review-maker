"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Loader2,
  Plus,
  Pencil,
  ExternalLink,
  LogOut,
  Store,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Trash2,
  AlertTriangle,
} from "lucide-react";
/** sessionStorage に保存する際のキー（認証済みパスワードを保持） */
const ADMIN_SESSION_KEY = "adminAuth";

type TenantListItem = {
  tenantId: string;
  name: string;
  googleMapsUrl: string;
  placeId?: string;
  subscriptionStatus: string;
  updatedAt?: string;
  industry?: string;
};

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const secret = sessionStorage.getItem(ADMIN_SESSION_KEY);
  return secret ? { "x-admin-secret": secret } : {};
}

const STATUS_LABELS: Record<string, string> = {
  active: "有効",
  trialing: "トライアル",
  app_trial: "アプリ体験（Stripe前）",
  inactive: "未契約",
  canceled: "解約済み",
  past_due: "支払遅延",
};

export default function AdminPage() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [secret, setSecret] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTenantId, setNewTenantId] = useState("");
  const [newName, setNewName] = useState("");
  const [newGoogleMapsUrl, setNewGoogleMapsUrl] = useState("https://www.google.com/maps");
  const [newPlaceId, setNewPlaceId] = useState("");
  const [newStatus, setNewStatus] = useState("inactive");
  const [newAccessPin, setNewAccessPin] = useState("");
  const [addError, setAddError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editGoogleMapsUrl, setEditGoogleMapsUrl] = useState("");
  const [editPlaceId, setEditPlaceId] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editAccessPin, setEditAccessPin] = useState("");
  const [editClearAccessPin, setEditClearAccessPin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editSaveError, setEditSaveError] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<TenantListItem | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchCheck = useCallback(async () => {
    const res = await fetch("/api/admin/check");
    const data = await res.json();
    setConfigured(data.configured === true);
  }, []);

  const fetchTenants = useCallback(async () => {
    const res = await fetch("/api/admin/tenants", { headers: getAuthHeaders() });
    if (res.status === 401) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      setIsAuthenticated(false);
      setTenants([]);
      return;
    }
    if (!res.ok) return;
    const data = await res.json();
    setTenants(data.tenants ?? []);
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    fetchCheck();
  }, [fetchCheck]);

  useEffect(() => {
    if (configured === false) return;
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(ADMIN_SESSION_KEY) : null;
    if (stored) {
      setLoading(true);
      fetch("/api/admin/tenants", { headers: { "x-admin-secret": stored } })
        .then((res) => {
          if (res.status === 401) {
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
            setIsAuthenticated(false);
          } else if (res.ok) {
            return res.json();
          }
        })
        .then((data) => {
          if (data?.tenants) {
            setTenants(data.tenants);
            setIsAuthenticated(true);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [configured]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!secret.trim()) {
      setLoginError("管理用パスワードを入力してください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: secret.trim() }),
      });
      const data = await res.json();
      if (res.status === 500) {
        setLoginError(data.error ?? "サーバー設定エラーです");
        return;
      }
      if (res.status === 401) {
        setLoginError("パスワードが正しくありません");
        return;
      }
      if (res.ok && data.success) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, secret.trim());
        setIsAuthenticated(true);
        const tenantsRes = await fetch("/api/admin/tenants", {
          headers: { "x-admin-secret": secret.trim() },
        });
        if (tenantsRes.ok) {
          const tenantsData = await tenantsRes.json();
          if (tenantsData?.tenants) setTenants(tenantsData.tenants);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
    setTenants([]);
    setSecret("");
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    if (newStatus === "app_trial") {
      const pin = newAccessPin.trim();
      if (!/^\d{4,8}$/.test(pin)) {
        setAddError("アプリ体験（Stripe前）では 4〜8 桁の店舗用 PIN が必要です");
        return;
      }
    }
    if (!newTenantId.trim()) {
      setAddError("テナントIDを入力してください");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          tenantId: newTenantId.trim(),
          name: newName.trim() || newTenantId.trim(),
          googleMapsUrl: newGoogleMapsUrl.trim() || "https://www.google.com/maps",
          placeId: newPlaceId.trim() || undefined,
          subscriptionStatus: newStatus,
          industry: "dental",
          ...(newAccessPin.trim() ? { accessPin: newAccessPin.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error ?? "追加に失敗しました");
        return;
      }
      setTenants((prev) => [data, ...prev]);
      setNewTenantId("");
      setNewName("");
      setNewGoogleMapsUrl("https://www.google.com/maps");
      setNewPlaceId("");
      setNewStatus("inactive");
      setNewAccessPin("");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (t: TenantListItem) => {
    setEditingId(t.tenantId);
    setEditSaveError("");
    setEditName(t.name);
    setEditGoogleMapsUrl(t.googleMapsUrl);
    setEditPlaceId(t.placeId ?? "");
    setEditStatus(t.subscriptionStatus);
    setEditAccessPin("");
    setEditClearAccessPin(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSaveError("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setEditSaveError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tenants/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          name: editName.trim() || editingId,
          googleMapsUrl: editGoogleMapsUrl.trim() || "https://www.google.com/maps",
          placeId: editPlaceId.trim() || undefined,
          subscriptionStatus: editStatus,
          industry: "dental",
          ...(editClearAccessPin ? { clearAccessPin: true } : {}),
          ...(editAccessPin.trim() && !editClearAccessPin ? { accessPin: editAccessPin.trim() } : {}),
        }),
      });
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        setEditSaveError(typeof data.error === "string" ? data.error : "保存に失敗しました");
        return;
      }
      setTenants((prev) =>
        prev.map((x) => {
          if (x.tenantId !== editingId) return x;
          return {
            ...x,
            name: typeof data.name === "string" ? data.name : x.name,
            googleMapsUrl: typeof data.googleMapsUrl === "string" ? data.googleMapsUrl : x.googleMapsUrl,
            subscriptionStatus:
              typeof data.subscriptionStatus === "string" ? data.subscriptionStatus : x.subscriptionStatus,
            ...(data.placeId !== undefined
              ? { placeId: data.placeId === null ? undefined : String(data.placeId) }
              : {}),
            ...(data.industry !== undefined
              ? { industry: data.industry === null ? undefined : String(data.industry) }
              : { industry: "dental" }),
          };
        })
      );
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (t: TenantListItem) => {
    setDeleteTarget(t);
    setDeleteConfirmText("");
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    if (deleteSubmitting) return;
    setDeleteTarget(null);
    setDeleteConfirmText("");
    setDeleteError("");
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const tid = deleteTarget.tenantId;
    if (deleteConfirmText.trim() !== tid) {
      setDeleteError("テナントIDが一致しません。もう一度入力してください。");
      return;
    }
    setDeleteSubmitting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/tenants/${encodeURIComponent(tid)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ confirmTenantId: deleteConfirmText.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        setIsAuthenticated(false);
        setTenants([]);
        setDeleteTarget(null);
        return;
      }
      if (!res.ok) {
        setDeleteError(
          typeof data.error === "string" ? data.error : "削除に失敗しました"
        );
        return;
      }
      setTenants((prev) => prev.filter((x) => x.tenantId !== tid));
      setEditingId((cur) => (cur === tid ? null : cur));
      setDeleteTarget(null);
      setDeleteConfirmText("");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (configured === null) {
    return (
      <main className="min-h-screen flex items-center justify-center px-5">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </main>
    );
  }

  if (!configured) {
    return (
      <main className="min-h-screen flex flex-col px-5 pt-10 max-w-md mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-4">管理画面</h1>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          管理機能を利用するには、環境変数 <code className="bg-amber-100 px-1 rounded">ADMIN_SECRET</code> を設定してください。
        </div>
        <Link href="/" className="mt-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          トップへ戻る
        </Link>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex flex-col px-5 pt-10 max-w-md mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-4">管理画面 ログイン</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              管理用パスワード
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="ADMIN_SECRET の値"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
          </div>
          {loginError && (
            <p className="text-sm text-red-600">{loginError}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ログイン"}
          </button>
        </form>
        <Link href="/" className="mt-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          トップへ戻る
        </Link>
      </main>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const dentalTenants = tenants.filter((t) => !t.industry || t.industry === "dental");
  const legacyTenants = tenants.filter((t) => t.industry && t.industry !== "dental");
  const grouped = [
    ...(dentalTenants.length > 0
      ? [{ key: "dental", label: "歯医者・クリニック", items: dentalTenants }]
      : []),
    ...(legacyTenants.length > 0
      ? [{ key: "_legacy", label: "旧業種設定（保存時に歯科へ更新）", items: legacyTenants }]
      : []),
  ];

  const toggleGroup = (key: string) =>
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <main className="min-h-screen flex flex-col px-4 sm:px-5 pt-8 pb-12 max-w-4xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            店舗管理
          </h1>
          <p className="text-sm text-gray-500 mt-1">店舗の追加・編集・削除・一覧</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <LogOut className="w-4 h-4" />
          ログアウト
        </button>
      </header>

      <section className="bg-white rounded-2xl p-5 shadow-sm border border-green-100 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          店舗を追加
        </h2>
        <form onSubmit={handleAddTenant} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">テナントID（英数字・ハイフン・アンダースコア）</label>
            <input
              type="text"
              value={newTenantId}
              onChange={(e) => setNewTenantId(e.target.value)}
              placeholder="例: matsudo-dental"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">店舗名</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例: 〇〇歯科クリニック"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GoogleマップURL（任意）</label>
            <input
              type="url"
              value={newGoogleMapsUrl}
              onChange={(e) => setNewGoogleMapsUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Place ID（任意・口コミ投稿リンク用）</label>
            <input
              type="text"
              value={newPlaceId}
              onChange={(e) => setNewPlaceId(e.target.value)}
              placeholder="例: ChIJ..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-gray-500 mt-0.5">設定時は「Googleに口コミを投稿する」が口コミ投稿ページへ直リンクします</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">契約状態</label>
            <select
              value={newStatus}
              onChange={(e) => {
                setNewStatus(e.target.value);
                if (e.target.value !== "app_trial") setNewAccessPin("");
              }}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          {newStatus === "app_trial" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                店舗用 PIN（必須・4〜8桁の数字）
              </label>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                maxLength={8}
                value={newAccessPin}
                onChange={(e) => setNewAccessPin(e.target.value.replace(/\D/g, ""))}
                placeholder="患者様・オーナーが初回アクセス時に入力"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono tracking-widest"
              />
              <p className="text-xs text-gray-500 mt-1">
                患者様用 URL とオーナー画面の両方で、初回にこの PIN を求めます。正しいとブラウザに保存されます。
              </p>
            </div>
          )}
          <p className="text-sm text-gray-600">業種は歯医者・クリニック（dental）固定です。</p>
          {addError && <p className="text-sm text-red-600">{addError}</p>}
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            追加
          </button>
        </form>
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
        <h2 className="font-semibold text-gray-800 mb-4">店舗一覧（{tenants.length} 件）</h2>
        {tenants.length === 0 ? (
          <p className="text-sm text-gray-500">店舗がありません。上記から追加してください。</p>
        ) : (
          <div className="space-y-3">
            {grouped.map((group) => {
              const isCollapsed = collapsedGroups[group.key] ?? false;
              return (
                <div key={group.key} className="rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left"
                  >
                    <span className="font-medium text-gray-700 text-sm">
                      {group.label}
                      <span className="ml-2 text-xs text-gray-400">（{group.items.length} 件）</span>
                    </span>
                    {isCollapsed
                      ? <ChevronRight className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                  </button>
                  {!isCollapsed && (
                    <ul className="divide-y divide-gray-100">
                      {group.items.map((t) => (
                        <li key={t.tenantId} className="p-4 bg-gray-50/30">
                          {editingId === t.tenantId ? (
                            <div className="space-y-3">
                              <div>
                                <span className="text-xs text-gray-500">テナントID</span>
                                <p className="font-mono text-sm text-gray-800">{t.tenantId}</p>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">店舗名</label>
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">GoogleマップURL</label>
                                <input
                                  type="url"
                                  value={editGoogleMapsUrl}
                                  onChange={(e) => setEditGoogleMapsUrl(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Place ID（口コミ投稿リンク用）</label>
                                <input
                                  type="text"
                                  value={editPlaceId}
                                  onChange={(e) => setEditPlaceId(e.target.value)}
                                  placeholder="例: ChIJ..."
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">契約状態</label>
                                <select
                                  value={editStatus}
                                  onChange={(e) => setEditStatus(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                >
                                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                                    <option key={v} value={v}>{l}</option>
                                  ))}
                                </select>
                              </div>
                              <p className="text-xs text-gray-500">
                                業種: 歯医者・クリニック（保存時に dental に更新）
                                {t.industry && t.industry !== "dental" ? (
                                  <span className="text-amber-700"> — 現在 DB: {t.industry}</span>
                                ) : null}
                              </p>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  新しい店舗用 PIN（4〜8桁・空欄なら変更なし）
                                </label>
                                <input
                                  type="password"
                                  inputMode="numeric"
                                  maxLength={8}
                                  value={editAccessPin}
                                  disabled={editClearAccessPin}
                                  onChange={(e) => setEditAccessPin(e.target.value.replace(/\D/g, ""))}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono tracking-widest disabled:opacity-50"
                                />
                              </div>
                              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editClearAccessPin}
                                  onChange={(e) => {
                                    setEditClearAccessPin(e.target.checked);
                                    if (e.target.checked) setEditAccessPin("");
                                  }}
                                  className="rounded border-gray-300"
                                />
                                店舗用 PIN を削除（URL での PIN 入力なし）
                              </label>
                              {editSaveError && (
                                <p className="text-sm text-red-600">{editSaveError}</p>
                              )}
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  disabled={saving}
                                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium disabled:opacity-50"
                                >
                                  {saving ? "保存中…" : "保存"}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm"
                                >
                                  キャンセル
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <p className="font-medium text-gray-800">{t.name || t.tenantId}</p>
                                  <p className="text-xs text-gray-500 font-mono">{t.tenantId}</p>
                                </div>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    t.subscriptionStatus === "active" ||
                                    t.subscriptionStatus === "trialing" ||
                                    t.subscriptionStatus === "app_trial"
                                      ? "bg-green-100 text-green-800"
                                      : t.subscriptionStatus === "canceled" || t.subscriptionStatus === "past_due"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {STATUS_LABELS[t.subscriptionStatus] ?? t.subscriptionStatus}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <button
                                  type="button"
                                  onClick={() => startEdit(t)}
                                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary"
                                >
                                  <Pencil className="w-4 h-4" />
                                  編集
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDeleteModal(t)}
                                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  削除
                                </button>
                                <a
                                  href={`${baseUrl}/owner/${t.tenantId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  管理画面
                                </a>
                                <a
                                  href={`${baseUrl}/${t.tenantId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-gray-600 hover:underline"
                                >
                                  患者様用
                                </a>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteModal();
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 border border-red-100"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <div className="flex gap-3 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden />
              </div>
              <div>
                <h2 id="delete-dialog-title" className="font-semibold text-gray-900">
                  店舗を削除しますか？
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Firestore 上の店舗データと関連する下位データ（返信履歴・設定・統計など）がすべて削除されます。この操作は取り消せません。
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 mb-4 text-sm">
              <p className="text-gray-500 text-xs">削除対象</p>
              <p className="font-medium text-gray-900">{deleteTarget.name || deleteTarget.tenantId}</p>
              <p className="font-mono text-xs text-gray-600 mt-0.5">{deleteTarget.tenantId}</p>
            </div>
            <div className="mb-4">
              <label htmlFor="delete-confirm-input" className="block text-sm font-medium text-gray-800 mb-1">
                確認のため、上記のテナントIDをそのまま入力してください
              </label>
              <input
                id="delete-confirm-input"
                type="text"
                autoComplete="off"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={deleteTarget.tenantId}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                disabled={deleteSubmitting}
              />
            </div>
            {deleteError && (
              <p className="text-sm text-red-600 mb-4">{deleteError}</p>
            )}
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-800 text-sm font-medium disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={
                  deleteSubmitting || deleteConfirmText.trim() !== deleteTarget.tenantId
                }
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
              >
                {deleteSubmitting ? "削除中…" : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
