import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

type UsageStatsDoc = {
  mapsClickCount?: number;
  mapsSatisfactionSum?: number;
  mapsSatisfactionCount?: number;
  feedbackClickCount?: number;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantIdが必要です" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "データベース接続が利用できません" },
        { status: 500 }
      );
    }

    const ref = db
      .collection("tenants")
      .doc(tenantId)
      .collection("stats")
      .doc("usage");
    const snap = await ref.get();
    const data = (snap.data() ?? {}) as UsageStatsDoc;

    const mapsClickCount =
      typeof data.mapsClickCount === "number" ? data.mapsClickCount : 0;
    const mapsSatisfactionSum =
      typeof data.mapsSatisfactionSum === "number" ? data.mapsSatisfactionSum : 0;
    const mapsSatisfactionCount =
      typeof data.mapsSatisfactionCount === "number"
        ? data.mapsSatisfactionCount
        : 0;
    const feedbackClickCount =
      typeof data.feedbackClickCount === "number" ? data.feedbackClickCount : 0;

    const mapsSatisfactionAvg =
      mapsSatisfactionCount > 0 ? mapsSatisfactionSum / mapsSatisfactionCount : null;

    const res = NextResponse.json({
      mapsClickCount,
      mapsSatisfactionAvg,
      mapsSatisfactionCount,
      feedbackClickCount,
    });
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    return res;
  } catch (err) {
    console.error("[stats GET]", err);
    return NextResponse.json(
      { error: "統計情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}
