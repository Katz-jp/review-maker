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
 * Googleマップの place URL から Place ID を抽出する。
 * 対応パターン（優先順）:
 *  1. `?placeid=` / `?place_id=` クエリパラメータ
 *  2. `?q=place_id:XXXX` 形式
 *  3. URL中に含まれる `ChIJ...` 形式の Place ID
 *  4. `!16s/g/...` 形式（データURLの内部ID。writereviewリンクで利用可能）
 */
export function extractPlaceIdFromMapsUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const fromQuery = (u.searchParams.get("placeid") ?? u.searchParams.get("place_id"))?.trim();
    if (fromQuery) return fromQuery;

    const q = u.searchParams.get("q");
    const qMatch = q?.match(/place_id:([^&\s]+)/i);
    if (qMatch?.[1]) return decodeURIComponent(qMatch[1]);
  } catch {
    // 不正なURLでも下の正規表現マッチは試す
  }

  const chijMatch = url.match(/(ChIJ[A-Za-z0-9_-]{10,})/);
  if (chijMatch) return chijMatch[1];

  const gPathMatch = url.match(/!16s(?:%2F|\/)(g(?:%2F|\/)[^!&?]+)/i);
  if (gPathMatch) {
    const raw = decodeURIComponent(gPathMatch[1]);
    if (raw.startsWith("g/")) return raw;
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

  const fromUrl = extractPlaceIdFromMapsUrl(tenant.googleMapsUrl);
  if (fromUrl) return `${WRITEREVIEW_BASE}${encodeURIComponent(fromUrl)}`;

  return tenant.googleMapsUrl;
}
