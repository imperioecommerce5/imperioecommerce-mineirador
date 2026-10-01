import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { loginHandler } from "../server/login-handler.ts";

function serviceAccount() {
  const value = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!value) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON ausente.");
  let raw: any = JSON.parse(value);
  if (typeof raw === "string") raw = JSON.parse(raw);
  if (typeof raw?.private_key === "string")
    raw.private_key = raw.private_key.replace(/\\n/g, "\n");
  if (raw?.project_id !== "imperioecommerce-mineirador")
    throw new Error("Projeto Firebase incompatível.");
  return raw;
}

function backend() {
  let app = getApps().find((a) => a.name === "imperio-profile");
  if (!app)
    app = initializeApp(
      { credential: cert(serviceAccount()) },
      "imperio-profile",
    );
  return { auth: getAuth(app) };
}

const handler = loginHandler({
  configured: () => !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim(),
  issueToken: (profile) =>
    backend().auth.createCustomToken(`imperio-familia-${profile}`, {
      familyFinance: true,
      actor: profile,
    }),
});

export default {
  fetch(request: Request) {
    return handler(request);
  },
};
