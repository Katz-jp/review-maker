import { createHmac, timingSafeEqual } from "crypto";

export const TENANT_UNLOCK_COOKIE = "rm_tunlock";

function getSecret(): string {
  return process.env.TENANT_UNLOCK_SECRET?.trim() ?? "";
}

export function assertTenantUnlockSecretConfigured(): void {
  if (!getSecret()) {
    throw new Error("TENANT_UNLOCK_SECRET が設定されていません");
  }
}

export function signUnlockCookieValue(tenantId: string, expUnixSec: number): string {
  const secret = getSecret();
  if (!secret) throw new Error("TENANT_UNLOCK_SECRET が設定されていません");
  const payloadJson = JSON.stringify({ t: tenantId, exp: expUnixSec });
  const payload = Buffer.from(payloadJson, "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function parseUnlockCookieValue(
  raw: string | undefined
): { tenantId: string; exp: number } | null {
  if (!raw || typeof raw !== "string") return null;
  const secret = getSecret();
  if (!secret) return null;
  const dot = raw.indexOf(".");
  if (dot <= 0) return null;
  const payload = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expectedSig = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  try {
    const json = Buffer.from(payload, "base64url").toString("utf8");
    const j = JSON.parse(json) as { t?: unknown; exp?: unknown };
    if (typeof j.t !== "string" || typeof j.exp !== "number") return null;
    if (Date.now() / 1000 > j.exp) return null;
    return { tenantId: j.t, exp: j.exp };
  } catch {
    return null;
  }
}

export function unlockCookieMaxAgeSec(appTrialEndMs: number): number {
  const now = Date.now();
  const untilEnd = Math.floor((appTrialEndMs - now) / 1000);
  const capped = Math.min(untilEnd, 60 * 60 * 24 * 31);
  return Math.max(capped, 60 * 60);
}
