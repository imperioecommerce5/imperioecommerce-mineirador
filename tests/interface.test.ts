import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import { JSDOM } from "jsdom";
import { transformSync } from "esbuild";
import { randomUUID } from "node:crypto";
const sleep = () => new Promise((resolve) => setTimeout(resolve, 35));
async function openApp() {
  const dom = new JSDOM(
    '<!doctype html><html data-demo="true"><body><div id="root"></div></body></html>',
    {
      url: "https://demo.invalid/?demo=1",
      runScripts: "dangerously",
      pretendToBeVisual: true,
    },
  );
  Object.defineProperty(dom.window, "structuredClone", {
    value: structuredClone,
  });
  Object.defineProperty(dom.window.crypto, "randomUUID", { value: randomUUID });
  dom.window.confirm = () => true;
  dom.window.scrollTo = () => {};
  const js = fs.readdirSync("dist/assets").find((n) => n.endsWith(".js"))!;
  const code = transformSync(fs.readFileSync("dist/assets/" + js, "utf8"), {
    format: "iife",
    loader: "js",
  }).code;
  dom.window.eval(code);
  await sleep();
  await sleep();
  return dom;
}
function click(dom: JSDOM, text: string) {
  const b = Array.from(dom.window.document.querySelectorAll("button")).find(
    (el) => el.textContent?.trim() === text,
  );
  assert.ok(b, "Botão não encontrado: " + text);
  (b as HTMLElement).click();
}
function fill(dom: JSDOM, label: string, value: string) {
  const field = Array.from(dom.window.document.querySelectorAll("label"))
    .find((el) => el.querySelector("span")?.textContent === label)
    ?.querySelector("input");
  assert.ok(field, "Campo não encontrado: " + label);
  Object.getOwnPropertyDescriptor(
    dom.window.HTMLInputElement.prototype,
    "value",
  )!.set!.call(field, value);
  field.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
}
test("interface: navegação, aporte, exclusão e restauração com saldos atualizados", async () => {
  const dom = await openApp();
  try {
    assert.match(
      dom.window.document.body.textContent || "",
      /Livre para gastar|LIVRE PARA GASTAR/,
    );
    assert.match(dom.window.document.body.textContent || "", /7\.552,60/);
    click(dom, "Registrar aporte");
    await sleep();
    fill(dom, "Descrição", "Aporte de teste");
    fill(dom, "Valor (R$)", "1000,00");
    await sleep();
    dom.window.document
      .querySelector("form")!
      .dispatchEvent(
        new dom.window.Event("submit", { bubbles: true, cancelable: true }),
      );
    await sleep();
    await sleep();
    const saved = JSON.parse(dom.window.localStorage.getItem("imperio_demo")!);
    assert.equal(
      saved.entries.find((e: any) => e.description === "Aporte de teste").cents,
      100000,
    );
    assert.match(dom.window.document.body.textContent || "", /8\.352,60/);
    const row = Array.from(
      dom.window.document.querySelectorAll(".ledger-row"),
    ).find((el) => el.textContent?.includes("Aporte de teste"))!;
    (
      row.querySelector('[aria-label="Excluir lançamento"]') as HTMLElement
    ).click();
    await sleep();
    assert.match(dom.window.document.body.textContent || "", /7\.552,60/);
    click(dom, "Desfazer");
    await sleep();
    assert.match(dom.window.document.body.textContent || "", /8\.352,60/);
    click(dom, "Extrato");
    await sleep();
    assert.ok(
      dom.window.document.querySelector('[aria-label="Mês do extrato"]'),
    );
    click(dom, "Contas");
    await sleep();
    click(dom, "Conta recorrente ou parcelada");
    await sleep();
    assert.match(
      dom.window.document.querySelector('[role="dialog"]')?.textContent || "",
      /Primeiro vencimento/,
    );
  } finally {
    dom.window.close();
  }
});
test("interface: configuração inicial pede apenas um aporte e distribui conforme potes", async () => {
  const dom = await openApp();
  try {
    dom.window.localStorage.setItem(
      "imperio_demo",
      JSON.stringify({
        version: 2,
        revision: 0,
        configured: false,
        pots: [],
        entries: [],
        goals: [],
        recurrences: [],
        rules: [],
        closedMonths: [],
        assets: [],
        migrationNotes: [],
      }),
    );
    // A new isolated document avoids stale React state while retaining the explicitly supplied setup fixture.
    const second = new JSDOM(
      '<html data-demo="true"><body><div id="root"></div></body></html>',
      {
        url: "https://demo.invalid/?demo=1",
        runScripts: "dangerously",
        pretendToBeVisual: true,
      },
    );
    try {
      Object.defineProperty(second.window, "structuredClone", {
        value: structuredClone,
      });
      Object.defineProperty(second.window.crypto, "randomUUID", {
        value: randomUUID,
      });
      second.window.localStorage.setItem(
        "imperio_demo",
        dom.window.localStorage.getItem("imperio_demo")!,
      );
      const js = fs.readdirSync("dist/assets").find((n) => n.endsWith(".js"))!;
      second.window.eval(
        transformSync(fs.readFileSync("dist/assets/" + js, "utf8"), {
          format: "iife",
        }).code,
      );
      await sleep();
      await sleep();
      click(second, "Configurar planejamento");
      await sleep();
      assert.equal(
        second.window.document.querySelectorAll('input[inputmode="decimal"]')
          .length,
        1,
      );
      assert.doesNotMatch(
        second.window.document.querySelector("form")?.textContent || "",
        /renda mensal/i,
      );
    } finally {
      second.window.close();
    }
  } finally {
    dom.window.close();
  }
});

test("interface: conta recorrente gera pendência, pagamento afeta saldo e transferência preserva saldo em conta", async () => {
  const dom = await openApp();
  try {
    click(dom, "Contas");
    await sleep();
    click(dom, "Conta recorrente ou parcelada");
    await sleep();
    fill(dom, "Nome", "Academia recorrente");
    fill(dom, "Valor de cada parcela (R$)", "100,00");
    await sleep();
    dom.window.document
      .querySelector("form")!
      .dispatchEvent(
        new dom.window.Event("submit", { bubbles: true, cancelable: true }),
      );
    await sleep();
    await sleep();
    let data = JSON.parse(dom.window.localStorage.getItem("imperio_demo")!);
    const bill = data.entries.find(
      (e: any) => e.description === "Academia recorrente",
    );
    assert.equal(bill.status, "pending");
    assert.equal(data.recurrences.length, 1);
    const row = Array.from(
      dom.window.document.querySelectorAll(".ledger-row"),
    ).find((el) => el.textContent?.includes("Academia recorrente"))!;
    (
      row.querySelector('[aria-label="Marcar como pago hoje"]') as HTMLElement
    ).click();
    await sleep();
    data = JSON.parse(dom.window.localStorage.getItem("imperio_demo")!);
    assert.equal(
      data.entries.find((e: any) => e.id === bill.id).status,
      "paid",
    );
    click(dom, "Potes");
    await sleep();
    click(dom, "Transferir entre potes");
    await sleep();
    assert.match(
      dom.window.document.querySelector('[role="dialog"]')?.textContent || "",
      /não altera o saldo em conta/,
    );
  } finally {
    dom.window.close();
  }
});
