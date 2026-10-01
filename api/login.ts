import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

type Profile = "voce" | "esposa";

function credentialSource() {
  const candidates = [
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
    process.env.FIREBASE_SERVICE_ACCOUNT,
    process.env.FIREBASE_SERVICE,
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
  ];
  return candidates.find((value) => value?.trim())?.trim() || "";
}

function serviceAccount() {
  const value = credentialSource();
  if (!value) throw new Error("SERVICE_ACCOUNT_MISSING");

  const attempts = [value];
  try {
    attempts.push(Buffer.from(value, "base64").toString("utf8"));
  } catch {
    // The plain JSON attempt below is still valid.
  }

  let raw: any = null;
  for (const candidate of attempts) {
    try {
      raw = JSON.parse(candidate);
      if (typeof raw === "string") raw = JSON.parse(raw);
      if (raw && typeof raw === "object") break;
    } catch {
      raw = null;
    }
  }

  if (!raw) throw new Error("SERVICE_ACCOUNT_INVALID");
  if (typeof raw.private_key === "string")
    raw.private_key = raw.private_key.replace(/\\n/g, "\n");
  if (raw.project_id !== "imperioecommerce-mineirador")
    throw new Error("SERVICE_ACCOUNT_PROJECT");
  return raw;
}

function backend() {
  let app = getApps().find((item) => item.name === "imperio-profile");
  if (!app) {
    app = initializeApp(
      { credential: cert(serviceAccount()) },
      "imperio-profile",
    );
  }
  return getAuth(app);
}

function send(res: any, status: number, body: object) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.status(status).json(body);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "Use POST para entrar." });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const profile = body.profile as Profile;
    if (!(["voce", "esposa"] as const).includes(profile))
      return send(res, 400, { error: "Escolha Rhuan ou Anne para entrar." });

    const token = await backend().createCustomToken(`imperio-familia-${profile}`, {
      familyFinance: true,
      actor: profile,
    });
    return send(res, 200, { token, profile });
  } catch (error) {
    const code = (error as Error)?.message || "AUTH_ERROR";
    if (code === "SERVICE_ACCOUNT_MISSING")
      return send(res, 503, {
        code: "AUTH_CONFIG_MISSING",
        error:
          "Este deploy não recebeu a credencial do Firebase. Use o mesmo projeto da Vercel que já possui a variável de serviço.",
      });
    return send(res, 503, {
      code: "AUTH_START_FAILED",
      error:
        "Não foi possível iniciar a sessão com o Firebase neste deploy.",
    });
  }
}
