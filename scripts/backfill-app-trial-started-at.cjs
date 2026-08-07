/**
 * subscriptionStatus が "app_trial" なのに appTrialStartedAt / appTrialEndsAt が
 * 未設定のテナントに、appTrialStartedAt（現在時刻）を補完する。
 * これが無いと期限判定ができず、口コミ作成などの機能が使えないままになるバグの復旧用。
 *
 * 使い方（プロジェクトルート）:
 *   node --env-file=.env.local scripts/backfill-app-trial-started-at.cjs [--dry-run]
 */
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

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
  const dryRun = process.argv.includes("--dry-run");

  const snapshot = await db.collection("tenants").where("subscriptionStatus", "==", "app_trial").get();
  if (snapshot.empty) {
    console.log("subscriptionStatus=app_trial のテナントはありません");
    return;
  }

  const now = new Date().toISOString();
  let fixed = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.appTrialStartedAt || data.appTrialEndsAt) {
      console.log(`skip: ${doc.id}（既に appTrialStartedAt/appTrialEndsAt あり）`);
      continue;
    }
    console.log(`${dryRun ? "[dry-run] " : ""}fix: ${doc.id} -> appTrialStartedAt=${now}`);
    if (!dryRun) {
      await doc.ref.set({ appTrialStartedAt: now }, { merge: true });
    }
    fixed++;
  }
  console.log(`完了: ${fixed} 件${dryRun ? "（dry-run のため未反映）" : "を修正しました"}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
