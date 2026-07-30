import { NextRequest, NextResponse } from "next/server";
import { requireAdminSecret } from "@/lib/admin-auth";
import { extractPlaceIdFromMapsUrl } from "@/lib/review-link";

/** これらのホストは短縮リンクのため、実URLへリダイレクトを解決してから抽出する */
const SHORT_LINK_HOSTS = new Set(["maps.app.goo.gl", "goo.gl", "g.co"]);

/**
 * Google検索/マップ側で一般的なブラウザからのアクセスとして扱われるよう付与するUA。
 * 付与しないとレスポンスの構造が変わり、後続の抽出が失敗することがある。
 */
const BROWSER_LIKE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

/** GoogleマップのHTMLに埋め込まれている内部プレビューAPI（/maps/preview/place）のパスを取り出す */
function extractPreviewPlaceHref(html: string): string | null {
  const m = html.match(/href="(\/maps\/preview\/place\?[^"]+)"/);
  if (!m) return null;
  return m[1].replace(/&amp;/g, "&");
}

/**
 * GoogleマップのURLから、writereviewで実際に使える正式なPlace ID（ChIJ形式）を取得する。
 *
 * `!16s/g/...` 形式（Knowledge Graph ID）はwritereviewでは機能しないことが判明したため、
 * ここではGoogleマップのページHTMLに埋め込まれている内部プレビューAPI
 * （/maps/preview/place）を辿り、そのレスポンスに含まれる本物のChIJ形式Place IDを取得する。
 * Places APIキーは不要だが、Google側の非公開実装に依存するため、失敗した場合は
 * 呼び出し側でフォールバック抽出にゆだねる。
 */
async function fetchChijViaPreviewApi(resolvedUrl: string): Promise<string | null> {
  try {
    const pageRes = await fetch(resolvedUrl, { headers: BROWSER_LIKE_HEADERS });
    if (!pageRes.ok) return null;
    const html = await pageRes.text();

    const previewHref = extractPreviewPlaceHref(html);
    if (!previewHref) return null;

    const origin = new URL(pageRes.url || resolvedUrl).origin;
    const previewRes = await fetch(`${origin}${previewHref}`, { headers: BROWSER_LIKE_HEADERS });
    if (!previewRes.ok) return null;
    const previewBody = await previewRes.text();

    const chijMatch = previewBody.match(/ChIJ[A-Za-z0-9_-]{10,}/);
    return chijMatch ? chijMatch[0] : null;
  } catch (err) {
    console.error("[admin/resolve-place-id] preview API lookup failed", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdminSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { url?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストの形式が正しくありません" }, { status: 400 });
  }

  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  if (!rawUrl) {
    return NextResponse.json({ error: "GoogleマップURLを入力してください" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "有効なURLではありません" }, { status: 400 });
  }

  let resolvedUrl = rawUrl;
  if (SHORT_LINK_HOSTS.has(target.hostname)) {
    try {
      const res = await fetch(rawUrl, { redirect: "follow", headers: BROWSER_LIKE_HEADERS });
      if (res.url) resolvedUrl = res.url;
    } catch (err) {
      console.error("[admin/resolve-place-id] short link resolve failed", err);
      // 解決できなくても元のURLでの抽出を試みる
    }
  }

  // 1. URL自体に正式なPlace ID（ChIJ形式）が直接含まれている場合はそれを最優先で採用する
  const directMatch = extractPlaceIdFromMapsUrl(resolvedUrl) ?? extractPlaceIdFromMapsUrl(rawUrl);
  if (directMatch?.startsWith("ChIJ")) {
    return NextResponse.json({ placeId: directMatch, resolvedUrl, verified: true });
  }

  // 2. Googleの内部プレビューAPI経由で正式なPlace IDを取得する（writereviewで動作確認済みの形式）
  const chijFromPreview = await fetchChijViaPreviewApi(resolvedUrl);
  if (chijFromPreview) {
    return NextResponse.json({ placeId: chijFromPreview, resolvedUrl, verified: true });
  }

  // 3. 最後の手段: !16s/g/... 形式など（writereviewでは動作しない可能性が高いため未検証として返す）
  return NextResponse.json({ placeId: directMatch ?? null, resolvedUrl, verified: false });
}
