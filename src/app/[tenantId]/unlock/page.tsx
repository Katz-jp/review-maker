"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { isPinExemptTenantId, isSafeTenantRedirectPath } from "@/lib/tenant-subscription";

function UnlockForm() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = (params.tenantId as string) || "";
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (tenantId && isPinExemptTenantId(tenantId)) {
      router.replace(`/${tenantId}`);
    }
  }, [tenantId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pin.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "認証に失敗しました");
        return;
      }
      const nextRaw = searchParams.get("next") ?? `/${tenantId}`;
      const next = nextRaw.startsWith("/") ? nextRaw : `/${tenantId}`;
      if (!isSafeTenantRedirectPath(next, tenantId)) {
        router.replace(`/${tenantId}`);
        return;
      }
      router.replace(next);
    } finally {
      setSubmitting(false);
    }
  };

  if (!tenantId || isPinExemptTenantId(tenantId)) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col px-5 pt-16 pb-12 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
          <Lock className="w-7 h-7" aria-hidden />
        </div>
        <h1 className="text-xl font-bold text-gray-800">店舗アクセス（PIN）</h1>
        <p className="text-sm text-gray-500 mt-2">
          テナント <span className="font-mono text-gray-700">{tenantId}</span>
        </p>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
          お渡しした 4〜8 桁の PIN を入力してください。正しいとブラウザに保存され、体験期間中は再入力の必要が少なくなります。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div>
          <label htmlFor="tenant-pin" className="block text-sm font-medium text-gray-700 mb-1">
            PIN（数字）
          </label>
          <input
            id="tenant-pin"
            type="password"
            inputMode="numeric"
            pattern="\d*"
            autoComplete="one-time-code"
            maxLength={8}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="••••"
            autoFocus
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || pin.length < 4}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              確認中…
            </>
          ) : (
            "アクセスする"
          )}
        </button>
      </form>
    </main>
  );
}

export default function TenantUnlockPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <UnlockForm />
    </Suspense>
  );
}
