import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let db: FirebaseFirestore.Firestore | null = null;

export function getAdminDb() {
  if (db) return db;

  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!key || !projectId) return null;

  try {
    const credential = cert(JSON.parse(key) as ServiceAccount);
    if (getApps().length === 0) {
      initializeApp({ credential, projectId });
    }
    db = getFirestore();
    return db;
  } catch {
    return null;
  }
}
