export type Profile = "voce" | "esposa";
export type LoginServices = {
  configured: () => boolean;
  issueToken: (profile: Profile) => Promise<string>;
};

export function loginHandler(services: LoginServices) {
  const json = (
    status: number,
    body: object,
    extra: Record<string, string> = {},
  ) =>
    Response.json(body, {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        ...extra,
      },
    });

  return async (request: Request): Promise<Response> => {
    if (request.method !== "POST")
      return json(405, { error: "Use POST para entrar." }, { Allow: "POST" });

    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      return json(403, { error: "Origem não autorizada." });

    if (!services.configured())
      return json(503, {
        error:
          "O acesso aos perfis ainda precisa ser configurado na Vercel. Confira FIREBASE_SERVICE_ACCOUNT_JSON.",
      });

    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return json(415, { error: "Formato inválido." });

    try {
      const text = await request.text();
      if (text.length > 2048)
        return json(413, { error: "Solicitação muito grande." });

      let body: any;
      try {
        body = JSON.parse(text);
      } catch {
        return json(400, { error: "Solicitação inválida." });
      }

      if (!body || !["voce", "esposa"].includes(body.profile))
        return json(400, { error: "Escolha Rhuan ou Anne para entrar." });

      const token = await services.issueToken(body.profile);
      return json(200, { token, profile: body.profile });
    } catch {
      return json(503, {
        error:
          "Não foi possível iniciar a sessão. Confira a conexão e a configuração do acesso na Vercel.",
      });
    }
  };
}
