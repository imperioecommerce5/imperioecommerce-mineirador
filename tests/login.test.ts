import { test } from "node:test";
import assert from "node:assert/strict";
import { loginHandler, samePin, LoginServices } from "../server/login-handler";
const url = "https://app.example/api/login";
function fixture(extra: Partial<LoginServices> = {}) {
  let count = 0;
  const issued: string[] = [];
  const handler = loginHandler({
    configured: () => true,
    pin: () => "5729",
    clientIp: () => "test-client",
    consumeAttempt: async () => ++count <= 10,
    clearAttempts: async () => {
      count = 0;
    },
    issueToken: async (actor) => {
      issued.push(actor);
      return "test-token";
    },
    ...extra,
  });
  return { handler, issued };
}
const request = (pin: string, profile = "voce") =>
  new Request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://app.example",
    },
    body: JSON.stringify({ pin, profile }),
  });
test("login: senha válida gera sessão do perfil escolhido e resposta não é cacheada", async () => {
  const { handler, issued } = fixture();
  const response = await handler(request("5729", "esposa"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(issued, ["esposa"]);
  assert.equal((await response.json()).profile, "esposa");
});
test("login: senha errada e perfil inválido não geram sessão", async () => {
  const { handler, issued } = fixture();
  assert.equal((await handler(request("9999"))).status, 401);
  assert.equal((await handler(request("5729", "outro"))).status, 400);
  assert.equal(issued.length, 0);
});
test("login: origem diferente e método inválido são recusados", async () => {
  const { handler } = fixture();
  assert.equal((await handler(new Request(url))).status, 405);
  assert.equal(
    (
      await handler(
        new Request(url, {
          method: "POST",
          headers: { Origin: "https://other.example" },
        }),
      )
    ).status,
    403,
  );
});
test("login: limite de tentativas impede emissão de sessão mesmo com senha correta após bloqueio", async () => {
  const { handler, issued } = fixture();
  for (let i = 0; i < 10; i++)
    assert.equal((await handler(request("1111"))).status, 401);
  assert.equal((await handler(request("5729"))).status, 429);
  assert.equal(issued.length, 0);
});
test("login: ausência de configuração impede a entrada em produção", async () => {
  const { handler, issued } = fixture({ configured: () => false });
  assert.equal((await handler(request("5729"))).status, 503);
  assert.equal(issued.length, 0);
  assert.equal(samePin("5729", "5729"), true);
  assert.equal(samePin("729", "5729"), false);
});
