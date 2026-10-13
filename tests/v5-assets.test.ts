import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const icons = [
  "family", "car", "basket", "market", "health", "travel", "education",
  "game", "debts", "investment", "patrimony", "baby", "emergency",
  "pets", "gifts",
];

test("V5: coleção 3D possui 15 arquivos WebP locais", () => {
  for (const name of icons) {
    const p = path.join(root, "public", "potes-3d", `${name}.webp`);
    assert.ok(fs.existsSync(p), `Ícone não encontrado: ${name}`);
    const b = fs.readFileSync(p);
    assert.equal(b.toString("ascii", 0, 4), "RIFF");
    assert.equal(b.toString("ascii", 8, 12), "WEBP");
  }
});

test("V5: navegação e movimentação direta incluídas", () => {
  const view = fs.readFileSync(path.join(root, "src/components/FinanceCenterView.tsx"), "utf8");
  assert.match(view, /className="mobile-nav"/);
  assert.match(view, /className="finance-v5-entry-tabs"/);
  assert.match(view, /setPotDetail\(p\.id\)/);
  assert.match(view, /Aportar do saldo livre/);
  assert.match(view, /pot-ring-continuous/);
});
