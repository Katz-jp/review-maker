/**
 * Firestore の tenants/{tenantId}/stats/usage を初期化する。
 * 使い方（プロジェクトルート）:
 *   node --env-file=.env.local scripts/reset-tenant-usage-stats.cjs [tenantId]
 * 既定の tenantId は restaurant-002
 */
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

async function main() {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!key || !projectId) {
    console.error(
      "FIREBASE_SERVICE_ACCOUNT_KEY と NEXT_PUBLIC_FIREBASE_PROJECT_ID が必要です（.env.local を node --env-file で読み込んでください）"
    );
    process.exit(1);
  }
  if (getApps().length === 0) {
    initializeApp({ credential: cert(JSON.parse(key)), projectId });
  }
  const db = getFirestore();
  const tenantId = process.argv[2] || "restaurant-002";
  const ref = db.collection("tenants").doc(tenantId).collection("stats").doc("usage");
  await ref.set({
    mapsClickCount: 0,
    mapsSatisfactionSum: 0,
    mapsSatisfactionCount: 0,
    feedbackClickCount: 0,
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log(`tenants/${tenantId}/stats/usage を初期化しました`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
