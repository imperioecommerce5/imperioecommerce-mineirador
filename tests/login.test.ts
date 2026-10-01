import { test } from "node:test";
import assert from "node:assert/strict";
import { loginHandler, LoginServices } from "../server/login-handler";

const url = "https://app.example/api/login";

function fixture(extra: Partial<LoginServices> = {}) {
  const issued: string[] = [];
  const handler = loginHandler({
    configured: () => true,
    issueToken: async (actor) => {
      issued.push(actor);
      return "test-token";
    },
    ...extra,
  });
  return { handler, issued };
}

const request = (profile = "voce") =>
  new Request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://app.example",
    },
    body: JSON.stringify({ profile }),
  });

test("login: perfil escolhido gera sessão sem senha e resposta não é cacheada", async () => {
  const { handler, issued } = fixture();
  const response = await handler(request("esposa"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(issued, ["esposa"]);
  assert.equal((await response.json()).profile, "esposa");
});

test("login: perfil inválido não gera sessão", async () => {
  const { handler, issued } = fixture();
  assert.equal((await handler(request("outro"))).status, 400);
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

test("login: ausência de configuração impede entrada em produção", async () => {
  const { handler, issued } = fixture({ configured: () => false });
  assert.equal((await handler(request())).status, 503);
  assert.equal(issued.length, 0);
});
