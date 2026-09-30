import { createHash, timingSafeEqual } from "node:crypto";
export type Profile = "voce" | "esposa";
export type LoginServices = {
  configured: () => boolean;
  pin: () => string;
  clientIp: (request: Request) => string;
  consumeAttempt: (ip: string) => Promise<boolean>;
  clearAttempts: (ip: string) => Promise<void>;
  issueToken: (profile: Profile) => Promise<string>;
};
export function samePin(input: string, expected: string): boolean {
  return timingSafeEqual(
    createHash("sha256").update(input).digest(),
    createHash("sha256").update(expected).digest(),
  );
}
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
          "O acesso por senha ainda precisa ser configurado na Vercel. Consulte o arquivo CONFIGURAR-ACESSO.md.",
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
      if (
        !body ||
        !["voce", "esposa"].includes(body.profile) ||
        typeof body.pin !== "string" ||
        !/^\d{4}$/.test(body.pin)
      )
        return json(400, {
          error: "Escolha o perfil e informe os quatro números da senha.",
        });
      const ip = services.clientIp(request);
      if (!(await services.consumeAttempt(ip)))
        return json(
          429,
          {
            error:
              "Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.",
          },
          { "Retry-After": "900" },
        );
      if (!samePin(body.pin, services.pin()))
        return json(401, {
          error: "Senha incorreta. Confira os quatro números.",
        });
      const token = await services.issueToken(body.profile);
      await services.clearAttempts(ip);
      return json(200, { token, profile: body.profile });
    } catch {
      return json(503, {
        error:
          "Não foi possível iniciar a sessão. Confira a conexão e a configuração do acesso na Vercel.",
      });
    }
  };
}
