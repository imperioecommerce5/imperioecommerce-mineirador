import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const view = fs.readFileSync(path.join(root, "src/components/FinanceCenterView.tsx"), "utf8");
const refinements = fs.readFileSync(path.join(root, "src/finance/refinements.css"), "utf8");
const card = view.slice(view.indexOf("function PotCard({"), view.indexOf("function MarketplaceDialog({"));

test("V5.1: os potes mantêm arco circular e ícones 3D", () => {
  assert.match(card, /pot-ring-continuous/);
  assert.match(card, /<PotSymbol symbol={potSymbol\(p\)} \/>/);
  assert.match(refinements, /\.pot-card\.pot-card-refined/);
});

test("V5.1: legendas não voltam ao topo e rodapé informa progresso real", () => {
  assert.doesNotMatch(card, /<header>/);
  assert.doesNotMatch(card, /Saldo acumulativo/);
  assert.match(card, /Reserva protegida/);
  assert.match(card, /Math\.round\(used\).*% utilizado/);
  assert.match(card, /Limite atingido/);
});

test("V5.1: reservas sem meta não recebem porcentagem inventada", () => {
  assert.match(card, /goalProgress \?\? 0/);
  assert.match(card, /goalTarget && goalTarget > 0/);
  assert.match(card, /p\.reserve \? "protected"/);
});
