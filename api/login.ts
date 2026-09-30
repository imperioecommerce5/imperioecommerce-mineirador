import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { ipAddress } from "@vercel/functions";
import { createHash } from "node:crypto";

type Profile = "voce" | "esposa";

function backend() {
  let app = getApps().find((a) => a.name === "imperio-pin");

  if (!app) {
    const credential = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!credential) {
      throw new Error("Credencial Firebase ausente.");
    }

    const raw = JSON.parse(credential);
    if (raw.project_id !== "imperioecommerce-mineirador") {
      throw new Error("Projeto Firebase incompatível.");
    }

    app = initializeApp(
      { credential: cert(raw) },
      "imperio-pin",
    );
  }

  return { auth: getAuth(app), db: getFirestore(app) };
}

function json(
  status: number,
  body: object,
  extra: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra,
    },
  });
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json(405, { error: "Use POST para entrar." }, {
      Allow: "POST",
    });
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return json(403, { error: "Origem não autorizada." });
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return json(503, {
      error: "Configure FIREBASE_SERVICE_ACCOUNT_JSON na Vercel.",
    });
  }

  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return json(415, { error: "Formato inválido." });
  }

  try {
    const text = await request.text();
    if (text.length > 2048) {
      return json(413, { error: "Solicitação muito grande." });
    }

    let body: { profile?: unknown } | null;
    try {
      body = JSON.parse(text);
    } catch {
      return json(400, { error: "Solicitação inválida." });
    }

    if (
      !body ||
      (body.profile !== "voce" && body.profile !== "esposa")
    ) {
      return json(400, { error: "Selecione Rhuan ou Anne." });
    }

    const profile: Profile = body.profile;
    const { auth, db } = backend();
    const ip = ipAddress(request) || "unknown";
    const id = createHash("sha256").update(ip).digest("hex");
    const ref = db.collection("imperio_login_limits").doc(id);

    const allowed = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const prior = snap.data();
      const now = Date.now();
      const since =
        typeof prior?.since === "number" &&
        now - prior.since < 900000
          ? prior.since
          : now;
      const attempts =
        since === prior?.since ? Number(prior.attempts) || 0 : 0;

      if (attempts >= 60) return false;

      tx.set(ref, {
        since,
        attempts: attempts + 1,
        expiresAt: new Date(since + 900000),
      });

      return true;
    });

    if (!allowed) {
      return json(429, {
        error: "Muitos acessos. Aguarde 15 minutos.",
      }, { "Retry-After": "900" });
    }

    const token = await auth.createCustomToken(
      `imperio-familia-${profile}`,
      { familyFinance: true, actor: profile },
    );

    return json(200, { token, profile });
  } catch (error) {
    // Registra somente o código, sem expor credenciais.
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? String(error.code)
        : "configuration-error";

    console.error("Falha ao iniciar sessão:", code);

    return json(503, {
      error: "Não foi possível entrar. Confira os Logs da Vercel.",
    });
  }
}

export default { fetch: handler };
