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
} from "lucide-react";

/** sessionStorage に保存する際のキー（認証済みパスワードを保持） */
const ADMIN_SESSION_KEY = "adminAuth";

type TenantListItem = {
  tenantId: string;
  name: string;
  googleMapsUrl: string;
  subscriptionStatus: string;
  updatedAt?: string;
};

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const secret = sessionStorage.getItem(ADMIN_SESSION_KEY);
  return secret ? { "x-admin-secret": secret } : {};
}

const STATUS_LABELS: Record<string, string> = {
  active: "有効",
  trialing: "トライアル",
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
  const [addError, setAddError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editGoogleMapsUrl, setEditGoogleMapsUrl] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);

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
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (t: TenantListItem) => {
    setEditingId(t.tenantId);
    setEditName(t.name);
    setEditGoogleMapsUrl(t.googleMapsUrl);
    setEditStatus(t.subscriptionStatus);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tenants/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          name: editName.trim() || editingId,
          googleMapsUrl: editGoogleMapsUrl.trim() || "https://www.google.com/maps",
          subscriptionStatus: editStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setTenants((prev) =>
        prev.map((x) => (x.tenantId === editingId ? { ...x, ...data } : x))
      );
      setEditingId(null);
    } finally {
      setSaving(false);
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

  return (
    <main className="min-h-screen flex flex-col px-4 sm:px-5 pt-8 pb-12 max-w-4xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            店舗管理
          </h1>
          <p className="text-sm text-gray-500 mt-1">店舗の追加・編集・一覧</p>
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
              placeholder="例: matsudo-seikotsu"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">店舗名</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例: 〇〇整骨院"
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
          <ul className="space-y-3">
            {tenants.map((t) => (
              <li
                key={t.tenantId}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/50"
              >
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
                          t.subscriptionStatus === "active" || t.subscriptionStatus === "trialing"
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
                        お客様用
                      </a>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
