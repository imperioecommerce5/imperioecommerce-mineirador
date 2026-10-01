import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { loginHandler } from "../server/login-handler.ts";

function backend() {
  let app = getApps().find((a) => a.name === "imperio-profile");
  if (!app) {
    const raw = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
    if (raw.project_id !== "imperioecommerce-mineirador")
      throw new Error("Projeto Firebase incompatível.");
    app = initializeApp({ credential: cert(raw) }, "imperio-profile");
  }
  return { auth: getAuth(app) };
}

const handler = loginHandler({
  configured: () => !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  issueToken: (profile) =>
    backend().auth.createCustomToken(`imperio-familia-${profile}`, {
      familyFinance: true,
      actor: profile,
    }),
});

export default { fetch: handler };
