import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT;

export function getAdminApp() {
  if (getApps().length) return getApps()[0];

  if (!SERVICE_ACCOUNT_JSON) return null;

  return initializeApp({
    credential: cert(JSON.parse(SERVICE_ACCOUNT_JSON)),
  });
}

export function getFirebaseAuth() {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}
