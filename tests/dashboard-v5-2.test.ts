import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const view = fs.readFileSync(path.join(root, "src/components/FinanceCenterView.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src/finance/dashboard-v5-2.css"), "utf8");
const home = view.slice(view.indexOf('{view === "home" && ('), view.indexOf('{view === "ledger" && ('));
const ledger = view.slice(view.indexOf('{view === "ledger" && ('), view.indexOf('{view === "pots" && ('));

test("V5.2: home compacto mantém os dois saldos e patrimônios lado a lado", () => {
  assert.match(home, /home-v52-balances/);
  assert.match(home, /cents={b\.free}/);
  assert.match(home, /cents={b\.account}/);
  assert.match(home, /home-v52-patrimony-grid/);
  assert.match(home, /nosso_patrimonio.*patrimonio_manuela/);
  assert.match(css, /\.home-v52-patrimony-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2/);
});

test("V5.2: Mercado Livre segue isolado, com saldo real e acesso à gestão", () => {
  assert.match(home, /home-v52-marketplace-row/);
  assert.match(home, /cents={b\.marketplace}/);
  assert.match(home, /type: "marketplace"/);
  assert.match(home, /Separada do dinheiro pessoal/);
  assert.match(home, /f\.marketplace\.percent/);
});

test("V5.2: a home não duplica os potes, o resumo mensal ou o extrato", () => {
  assert.doesNotMatch(home, /<PotCard/);
  assert.doesNotMatch(home, /Movimento do mês/);
  assert.doesNotMatch(home, /Últimas movimentações/);
  assert.match(home, /Próximos pagamentos/);
  assert.match(home, /onClick=\{\(\) => pay\(e\)\}/);
});

test("V5.2: extrato tem filtros, agrupamento diário e detalhes expandidos", () => {
  assert.match(ledger, /ledger-v52-toolbar/);
  assert.match(ledger, /ledger-v52-day-heading/);
  assert.match(ledger, /ledgerDayTitle\(date\)/);
  assert.match(view, /aria-expanded={expanded}/);
  assert.match(view, /expandedEntryId === e\.id/);
  assert.match(view, /e\.kind === "transfer"[\s\S]*?Transferência interna/);
  assert.match(view, /e\.kind === "income" \? "\+ " : e\.kind === "expense" \? "− " : ""/);
  assert.match(ledger, /exportFile\(/);
});

test("V5.2: mudanças são de UI e mantêm os ícones 3D anteriores", () => {
  assert.match(view, /<PotSymbol symbol="market" \/>/);
  assert.match(view, /<PotSymbol symbol=\{id === "patrimonio_manuela" \? "baby" : "pig"\} \/>/);
  assert.match(view, /className="pot-grid"/);
  assert.match(css, /\.ledger-v52-amount\.transfer/);
});
