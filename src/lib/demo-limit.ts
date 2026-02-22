export const MAX_DEMO_GENERATIONS = 5;

/** trial で選択した業種を sessionStorage に保存するキー */
export const TRIAL_INDUSTRY_KEY = "trial_industry";

function getStorageKey(tenantId: string, type: "generate" | "reply"): string {
  return `${tenantId}_${type}_count`;
}

// 開発環境かどうかを判定（localhostでアクセスしている場合は開発環境とみなす）
export function isDevelopment(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

export function getRemainingGenerations(tenantId: string, type: "generate" | "reply"): number {
  if (typeof window === "undefined") return MAX_DEMO_GENERATIONS;
  // 開発環境では制限なし
  if (isDevelopment()) return MAX_DEMO_GENERATIONS;
  // demo-testは制限なし（開発の本番環境テスト用）
  if (tenantId === "demo-test") return MAX_DEMO_GENERATIONS;
  // trialのみ制限を適用（本番環境のみ）
  if (tenantId !== "trial") return MAX_DEMO_GENERATIONS;
  const key = getStorageKey(tenantId, type);
  const count = parseInt(localStorage.getItem(key) || "0", 10);
  return Math.max(0, MAX_DEMO_GENERATIONS - count);
}

export function incrementGenerationCount(tenantId: string, type: "generate" | "reply"): boolean {
  if (typeof window === "undefined") return false;
  // 開発環境ではカウントしない
  if (isDevelopment()) return true;
  // demo-testは制限なしなのでカウントしない
  if (tenantId === "demo-test") return true;
  // trialのみカウント（本番環境のみ）
  if (tenantId !== "trial") return true;
  const key = getStorageKey(tenantId, type);
  const current = parseInt(localStorage.getItem(key) || "0", 10);
  if (current >= MAX_DEMO_GENERATIONS) {
    return false;
  }
  localStorage.setItem(key, String(current + 1));
  return true;
}

export function canGenerate(tenantId: string, type: "generate" | "reply"): boolean {
  // 開発環境では常に生成可能
  if (isDevelopment()) return true;
  // demo-testは制限なし（開発の本番環境テスト用）
  if (tenantId === "demo-test") return true;
  // trialのみ制限を適用（本番環境のみ）
  if (tenantId !== "trial") return true;
  return getRemainingGenerations(tenantId, type) > 0;
}

export function resetDemoCounts(tenantId?: string): void {
  if (typeof window === "undefined") return;
  if (tenantId) {
    // 特定のtenantIdのカウントをリセット
    localStorage.removeItem(getStorageKey(tenantId, "generate"));
    localStorage.removeItem(getStorageKey(tenantId, "reply"));
  } else {
    // すべてのカウントをリセット（後方互換性のため）
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes("_generate_count") || key.includes("_reply_generate_count")) {
        localStorage.removeItem(key);
      }
    });
  }
}
