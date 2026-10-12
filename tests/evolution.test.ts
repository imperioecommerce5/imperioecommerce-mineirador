import { test } from "node:test";
import assert from "node:assert/strict";
import {
  empty,
  entry,
  balances,
  generateRecurring,
} from "../src/finance/model";
import { familyEvolution } from "../src/finance/evolution";

test("evolution does not modify financial data and repeated entries cannot farm monthly XP", () => {
  const f = empty();
  f.configured = true;
  f.entries = [
    entry(
      {
        description: "Teste",
        kind: "income",
        cents: 100000,
        date: "2026-08-01",
      },
      f.pots,
    ),
  ];
  const snapshot = JSON.stringify(f),
    before = balances(f);
  const first = familyEvolution(f, "2026-10-12");
  assert.equal(JSON.stringify(f), snapshot);
  assert.deepEqual(balances(f), before);
  f.entries.push(
    entry(
      { description: "Teste", kind: "income", cents: 1, date: "2026-08-02" },
      f.pots,
    ),
  );
  assert.equal(familyEvolution(f, "2026-10-12").xp, first.xp);
  f.entries.push(
    entry(
      {
        description: "Teste",
        kind: "income",
        cents: 1000000,
        date: "2026-10-02",
      },
      f.pots,
    ),
  );
  assert.equal(familyEvolution(f, "2026-10-12").xp, first.xp);
});
test("future, deleted and marketplace movements do not earn XP", () => {
  const f = empty();
  f.configured = true;
  const base = familyEvolution(f, "2026-10-12").xp;
  f.entries = [
    entry(
      {
        description: "Teste",
        kind: "income",
        cents: 10000,
        date: "2026-11-01",
      },
      f.pots,
    ),
    entry(
      {
        description: "Teste",
        kind: "income",
        cents: 10000,
        date: "2026-08-01",
        deleted: true,
      },
      f.pots,
    ),
    entry(
      {
        description: "Teste",
        kind: "income",
        cents: 10000,
        date: "2026-08-01",
        source: "marketplace:income",
      },
      f.pots,
    ),
  ];
  assert.equal(familyEvolution(f, "2026-10-12").xp, base);
});
test("consistency needs consecutive months and corrections revoke derived awards", () => {
  const f = empty();
  f.configured = true;
  f.entries = ["06", "08", "09"].map((m) =>
    entry(
      {
        description: "Teste",
        kind: "income",
        cents: 10000,
        date: `2026-${m}-01`,
      },
      f.pots,
    ),
  );
  assert.equal(familyEvolution(f, "2026-10-12").medals[1].unlocked, false);
  f.entries[0].date = "2026-07-01";
  assert.equal(familyEvolution(f, "2026-10-12").medals[1].unlocked, true);
  f.entries[0].deleted = true;
  assert.equal(familyEvolution(f, "2026-10-12").medals[1].unlocked, false);
});
test("empty month never claims recurring bills paid", () => {
  const f = empty();
  f.configured = true;
  f.entries = [
    entry(
      {
        description: "Teste",
        kind: "income",
        cents: 10000,
        date: "2026-08-01",
      },
      f.pots,
    ),
  ];
  assert.equal(familyEvolution(f, "2026-10-12").medals[3].unlocked, false);
  f.recurrences = [
    {
      id: "internet",
      name: "Internet",
      cents: 1000,
      pot: "free",
      start: "2026-08-01",
      count: 1,
      active: true,
    },
  ];
  const g = generateRecurring(f, "2026-10-12");
  assert.equal(familyEvolution(g, "2026-10-12").medals[3].unlocked, false);
  g.entries.find((e) => e.source === "internet")!.status = "paid";
  assert.equal(familyEvolution(g, "2026-10-12").medals[3].unlocked, true);
});
