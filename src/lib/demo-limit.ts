export const MAX_DEMO_GENERATIONS = 5;
const STORAGE_KEY_GENERATE = "demo_generate_count";
const STORAGE_KEY_REPLY = "demo_reply_generate_count";

// 開発環境かどうかを判定（localhostでアクセスしている場合は開発環境とみなす）
export function isDevelopment(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

export function getRemainingGenerations(type: "generate" | "reply"): number {
  if (typeof window === "undefined") return MAX_DEMO_GENERATIONS;
  // 開発環境では制限なし
  if (isDevelopment()) return MAX_DEMO_GENERATIONS;
  const key = type === "generate" ? STORAGE_KEY_GENERATE : STORAGE_KEY_REPLY;
  const count = parseInt(localStorage.getItem(key) || "0", 10);
  return Math.max(0, MAX_DEMO_GENERATIONS - count);
}

export function incrementGenerationCount(type: "generate" | "reply"): boolean {
  if (typeof window === "undefined") return false;
  // 開発環境ではカウントしない
  if (isDevelopment()) return true;
  const key = type === "generate" ? STORAGE_KEY_GENERATE : STORAGE_KEY_REPLY;
  const current = parseInt(localStorage.getItem(key) || "0", 10);
  if (current >= MAX_DEMO_GENERATIONS) {
    return false;
  }
  localStorage.setItem(key, String(current + 1));
  return true;
}

export function canGenerate(type: "generate" | "reply"): boolean {
  // 開発環境では常に生成可能
  if (isDevelopment()) return true;
  return getRemainingGenerations(type) > 0;
}

export function resetDemoCounts(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_GENERATE);
  localStorage.removeItem(STORAGE_KEY_REPLY);
}
