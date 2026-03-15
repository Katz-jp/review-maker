/**
 * 口コミ投稿用URL（writereview）の組み立て
 * テナントの placeId や googleMapsUrl から、開くべきURLを返す
 */

const WRITEREVIEW_BASE = "https://search.google.com/local/writereview?placeid=";

/** テナントID別の固定 Place ID（本番で Firestore の customOptions が読めない場合のフォールバック） */
export const FIXED_PLACE_IDS: Record<string, string> = {
  "dental-002": "ChIJNXCKdxnyQDUR8XpEafSt7dY",
};

/**
 * Googleマップの place URL から Place ID を抽出する
 */
function extractPlaceIdFromMapsUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const fromQuery = u.searchParams.get("placeid")?.trim();
    if (fromQuery) return fromQuery;

    const match = url.match(/!16s(?:%2F|\/)(g(?:%2F|\/)[^!&?]+)/i);
    if (match) {
      const raw = decodeURIComponent(match[1]);
      if (raw.startsWith("g/")) return raw;
    }
  } catch {
    // ignore
  }
  return null;
}

export type TenantForReviewLink = {
  placeId?: string;
  googleMapsUrl: string;
};

/**
 * 口コミ投稿用URLを返す。
 * 優先: 固定ID(tenantId) → tenant.placeId → URLのplaceid → URLから16s抽出 → そのままgoogleMapsUrl
 */
export function getReviewOrMapUrl(
  tenant: TenantForReviewLink,
  tenantId?: string
): string {
  const fixed = tenantId && FIXED_PLACE_IDS[tenantId];
  if (fixed) return `${WRITEREVIEW_BASE}${encodeURIComponent(fixed)}`;

  const explicit = tenant.placeId?.trim();
  if (explicit) return `${WRITEREVIEW_BASE}${encodeURIComponent(explicit)}`;

  try {
    const u = new URL(tenant.googleMapsUrl);
    const fromQuery = u.searchParams.get("placeid")?.trim();
    if (fromQuery) return `${WRITEREVIEW_BASE}${encodeURIComponent(fromQuery)}`;
  } catch {
    // ignore
  }

  const fromPath = extractPlaceIdFromMapsUrl(tenant.googleMapsUrl);
  if (fromPath) return `${WRITEREVIEW_BASE}${encodeURIComponent(fromPath)}`;

  return tenant.googleMapsUrl;
}
