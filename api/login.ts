import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { ipAddress } from "@vercel/functions";
import { createHash } from "node:crypto";
import { loginHandler } from "../server/login-handler.js";
function backend() {
  let app = getApps().find((a) => a.name === "imperio-pin");
  if (!app) {
    const raw = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
    if (raw.project_id !== "imperioecommerce-mineirador")
      throw new Error("Projeto Firebase incompatível.");
    app = initializeApp({ credential: cert(raw) }, "imperio-pin");
  }
  return { auth: getAuth(app), db: getFirestore(app) };
}
const idFor = (ip: string) => createHash("sha256").update(ip).digest("hex");
const handler = loginHandler({
  configured: () =>
    /^\d{4}$/.test(process.env.APP_PIN || "") &&
    !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  pin: () => process.env.APP_PIN!,
  clientIp: (request) => ipAddress(request) || "unknown",
  async consumeAttempt(ip) {
    const { db } = backend();
    const ref = db.collection("imperio_login_limits").doc(idFor(ip));
    return db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const prior = snap.data();
      const now = Date.now();
      const since =
        prior?.since && now - prior.since < 900000 ? prior.since : now;
      const attempts = since === prior?.since ? Number(prior.attempts) || 0 : 0;
      if (attempts >= 10) return false;
      tx.set(ref, {
        since,
        attempts: attempts + 1,
        expiresAt: new Date(since + 900000),
      });
      return true;
    });
  },
  async clearAttempts(ip) {
    await backend()
      .db.collection("imperio_login_limits")
      .doc(idFor(ip))
      .delete();
  },
  issueToken: (profile) =>
    backend().auth.createCustomToken(`imperio-familia-${profile}`, {
      familyFinance: true,
      actor: profile,
    }),
});
export default { fetch: handler };
