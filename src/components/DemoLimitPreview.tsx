"use client";

import Link from "next/link";
import {
  clearPreviewLimit,
  isDevelopment,
  isPreviewingLimitReached,
  PREVIEW_LIMIT_PARAM,
} from "@/lib/demo-limit";

export function DemoLimitPreviewBanner() {
  if (!isDevelopment() || !isPreviewingLimitReached()) return null;

  const handleClear = () => {
    clearPreviewLimit();
    const url = new URL(window.location.href);
    url.searchParams.delete(PREVIEW_LIMIT_PARAM);
    window.location.href = url.pathname + url.search;
  };

  return (
    <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-center text-sm text-amber-900">
      <strong>プレビューモード</strong>：5回終了画面を表示中
      <button
        type="button"
        onClick={handleClear}
        className="ml-3 font-medium underline underline-offset-2 hover:text-amber-950"
      >
        解除
      </button>
    </div>
  );
}

const previewLinks = [
  { label: "Tryページ", href: `/try?${PREVIEW_LIMIT_PARAM}=generate` },
  { label: "生成結果", href: `/trial/generate?${PREVIEW_LIMIT_PARAM}=generate` },
  { label: "返信ヘルプ", href: `/trial/reply-helper?${PREVIEW_LIMIT_PARAM}=reply` },
] as const;

export function DemoLimitPreviewDevLinks() {
  if (!isDevelopment()) return null;

  return (
    <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
      <p className="font-semibold mb-2">開発用：5回終了画面プレビュー</p>
      <ul className="space-y-1.5">
        {previewLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-primary-dark hover:underline font-medium">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
