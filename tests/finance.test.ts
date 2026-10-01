import assert from "node:assert/strict";
import { test } from "node:test";
import {
  empty,
  allocate,
  allocateContribution,
  balances,
  entry,
  migrate,
  generateRecurring,
  monthDate,
  closeMonth,
  validateFinance,
  parseMoney,
  today,
  Pot,
  validatePots,
  pendingCommitmentsForMonth,
} from "../src/finance/model";
const pot = (id: string, value: number, extra: Partial<Pot> = {}): Pot => ({
  id,
  name: id,
  value,
  mode: "percent",
  reserve: false,
  rollover: true,
  priority: 0,
  active: true,
  color: "#000000",
  ...extra,
});

test("aporte bruto separa patrimônios, contas e só então distribui os demais potes", () => {
  const pots = [
    pot("nosso_patrimonio", 10, { reserve: true, allocationBase: "gross" }),
    pot("patrimonio_manuela", 5, { reserve: true, allocationBase: "gross" }),
    pot("mercado", 60, { allocationBase: "remainder" }),
    pot("transporte", 40, { allocationBase: "remainder" }),
  ];
  const a = allocateContribution(300000, pots, 80000);
  assert.equal(a.nosso_patrimonio, 30000);
  assert.equal(a.patrimonio_manuela, 15000);
  assert.equal(a.mercado, 105000);
  assert.equal(a.transporte, 70000);
  assert.equal(a.free, 80000);
  assert.equal(Object.values(a).reduce((sum, cents) => sum + cents, 0), 300000);
});

test("percentuais são validados por base e compromissos pendentes podem ser calculados no mês", () => {
  assert.throws(() =>
    validatePots([
      pot("nosso_patrimonio", 60, { reserve: true, allocationBase: "gross" }),
      pot("patrimonio_manuela", 42, { reserve: true, allocationBase: "gross" }),
    ]),
  );
  assert.throws(() =>
    validatePots([
      pot("a", 60, { allocationBase: "remainder" }),
      pot("b", 42, { allocationBase: "remainder" }),
    ]),
  );
  const f = empty();
  f.entries = [
    entry({ kind: "expense", cents: 30000, date: "2026-09-10", description: "Aluguel", status: "pending", pot: "free" }, f.pots),
    entry({ kind: "expense", cents: 10000, date: "2026-10-10", description: "Internet", status: "pending", pot: "free" }, f.pots),
  ];
  assert.equal(pendingCommitmentsForMonth(f, "2026-09-20"), 30000);
});
test("aporte uma vez; reservas não retiram dinheiro da conta; gasto pago e pendência têm efeitos distintos", () => {
  const f = empty();
  f.pots = [pot("reserve", 20, { reserve: true }), pot("food", 80)];
  f.entries = [
    entry(
      {
        kind: "income",
        cents: 200000,
        date: "2026-01-10",
        description: "Aporte",
      },
      f.pots,
    ),
    entry(
      {
        kind: "expense",
        cents: 10000,
        date: "2026-01-11",
        description: "Mercado",
        pot: "food",
      },
      f.pots,
    ),
    entry(
      {
        kind: "expense",
        cents: 25000,
        date: "2026-01-20",
        description: "Internet",
        status: "pending",
        pot: "food",
      },
      f.pots,
    ),
  ];
  const b = balances(f, "2026-01-15");
  assert.equal(b.account, 190000);
  assert.equal(b.reserved, 40000);
  assert.equal(b.pending, 25000);
  assert.equal(b.free, 125000);
  assert.equal(b.buckets.food, 150000);
});
test("mudar percentuais não altera aportes existentes; editar aporte mantém a política original", () => {
  const f = empty();
  f.pots = [pot("reserve", 10, { reserve: true }), pot("food", 90)];
  const original = entry(
    {
      kind: "income",
      cents: 100000,
      date: "2026-01-01",
      description: "Primeiro",
    },
    f.pots,
  );
  f.entries = [original];
  f.pots = [pot("reserve", 50, { reserve: true }), pot("food", 50)];
  assert.equal(balances(f, "2026-01-02").reserved, 10000);
  f.entries = [
    entry({ ...original, cents: 200000 }, f.pots),
    entry(
      {
        kind: "income",
        cents: 100000,
        date: "2026-01-02",
        description: "Novo",
      },
      f.pots,
    ),
  ];
  assert.equal(balances(f, "2026-01-02").reserved, 70000);
});
test("centavos são conservados com porcentagens fracionárias e prioridades fixas", () => {
  for (let cents = 1; cents < 301; cents++) {
    const a = allocate(cents, [
      pot("a", 33.33),
      pot("b", 33.33),
      pot("c", 33.34),
    ]);
    assert.equal(
      Object.values(a).reduce((s, v) => s + v, 0),
      cents,
    );
  }
  const a = allocate(10000, [
    pot("last", 200, { mode: "fixed", priority: 2 }),
    pot("first", 60, { mode: "fixed", priority: 1 }),
    pot("pct", 100),
  ]);
  assert.equal(a.first, 6000);
  assert.equal(a.last, 4000);
  assert.equal(a.pct, 0);
  assert.throws(() => allocate(10000, [pot("a", 60), pot("b", 60)]));
});
test("transferências entre potes conservam saldo e total distribuído", () => {
  const f = empty();
  f.pots = [pot("reserve", 20, { reserve: true }), pot("food", 80)];
  f.entries = [
    entry(
      {
        kind: "income",
        cents: 100000,
        date: "2026-01-01",
        description: "Aporte",
      },
      f.pots,
    ),
    entry(
      {
        kind: "transfer",
        cents: 10000,
        date: "2026-01-02",
        description: "Reserva extra",
        pot: "food",
        destination: "reserve",
      },
      f.pots,
    ),
  ];
  const b = balances(f, "2026-01-05");
  assert.equal(b.account, 100000);
  assert.equal(b.reserved, 30000);
  assert.equal(
    Object.values(b.buckets).reduce((s, v) => s + v, 0),
    b.account,
  );
});
test("migração converte aporte sem duplicidade e preserva dados de origem", () => {
  const raw = {
    rendaMensal: 99999,
    aportePendenteValor: 2000,
    potesAtivos: [
      {
        id: "reserve",
        nome: "Reserva",
        percentual: 10,
        retencaoAutomatica: true,
      },
    ],
    transacoes: [
      {
        id: "1",
        tipo: "entrada",
        valor: 500,
        data: "10/01/2026",
        descricao: "Aporte",
        poteId: "geral",
      },
      {
        id: "2",
        tipo: "saida",
        valor: 200,
        data: "11/01/2026",
        descricao: "Gasto",
        poteId: "divida_fixa",
      },
    ],
  };
  const copy = JSON.stringify(raw);
  const f = migrate(raw);
  assert.equal(f.entries.filter((e) => e.kind === "income").length, 2);
  assert.equal(balances(f, "2026-02-01").account, 230000);
  assert.equal(balances(f, "2026-02-01").reserved, 25000);
  assert.equal(JSON.stringify(raw), copy);
  assert.deepEqual(migrate({ financeV2: f }), f);
});
test("recorrências são idempotentes; exclusão não recria parcela; dia 31 respeita fevereiro", () => {
  assert.equal(monthDate("2024-01-31", 1), "2024-02-29");
  assert.equal(monthDate("2025-01-31", 1), "2025-02-28");
  const f = empty();
  f.recurrences = [
    {
      id: "internet",
      name: "Internet",
      cents: 10000,
      pot: "free",
      start: "2026-01-31",
      count: 3,
      active: true,
    },
  ];
  const generated = generateRecurring(f, "2026-03-01");
  assert.equal(generated.entries.length, 3);
  assert.equal(generated.entries[1].date, "2026-02-28");
  assert.equal(generateRecurring(generated, "2026-03-20").entries.length, 3);
  generated.entries[0].deleted = true;
  assert.equal(generateRecurring(generated, "2026-04-01").entries.length, 3);
  assert.equal(balances(generated, "2026-03-20").account, 0);
});
test("fechamento devolve sobra sem apagar histórico nem movimentar saldo em conta", () => {
  const f = empty();
  f.pots = [pot("food", 100, { rollover: false })];
  f.entries = [
    entry(
      {
        kind: "income",
        cents: 100000,
        date: "2026-01-01",
        description: "Aporte",
      },
      f.pots,
    ),
    entry(
      {
        kind: "expense",
        cents: 20000,
        date: "2026-01-02",
        description: "Mercado",
        pot: "food",
      },
      f.pots,
    ),
  ];
  const closed = closeMonth(f, "2026-01");
  assert.equal(balances(closed, "2026-02-01").account, 80000);
  assert.equal(balances(closed, "2026-02-01").buckets.food, 0);
  assert.equal(balances(closed, "2026-02-01").buckets.free, 80000);
  assert.throws(() => closeMonth(closed, "2026-01"));
  assert.equal(f.entries.length, 2);
});
test("aporte futuro e excluído não inflacionam saldo; restauração recupera divisão", () => {
  const f = empty();
  const e = entry(
    {
      kind: "income",
      cents: 100000,
      date: "2026-02-01",
      description: "Futuro",
    },
    f.pots,
  );
  f.entries = [e];
  assert.equal(balances(f, "2026-01-31").account, 0);
  e.deleted = true;
  assert.equal(balances(f, "2026-02-01").account, 0);
  e.deleted = false;
  assert.equal(balances(f, "2026-02-01").account, 100000);
});
test("backup inválido e valor monetário inválido são rejeitados", () => {
  assert.equal(parseMoney("1.234,56"), 123456);
  assert.equal(parseMoney("1234.56"), 123456);
  assert.throws(() => parseMoney("-3"));
  assert.throws(() => parseMoney("NaN"));
  assert.throws(() => parseMoney("10,555"));
  assert.throws(() => validateFinance({ version: 2 }));
  const f = empty();
  f.entries = [
    entry(
      { kind: "income", cents: 100, date: today(), description: "Aporte" },
      f.pots,
    ),
  ];
  f.entries[0].allocations = { free: 99 };
  assert.throws(() => validateFinance(f));
});

test("recorrências não escrevem em meses fechados; migração sem potes preserva entradas", () => {
  const f = empty();
  f.closedMonths = ["2026-01"];
  f.recurrences = [
    {
      id: "r",
      name: "Conta",
      cents: 100,
      pot: "free",
      start: "2026-01-01",
      count: 3,
      active: true,
    },
  ];
  const generated = generateRecurring(f, "2026-02-01");
  assert.equal(generated.entries.length, 1);
  assert.equal(generated.entries[0].date, "2026-02-01");
  const migrated = migrate({
    potesAtivos: [],
    aportePendenteValor: 100,
    transacoes: [],
  });
  assert.equal(balances(migrated, today()).account, 10000);
});

test("autoria: criada por um perfil, alterada pelo outro, original preservado e reset sem mutação", async () => {
  const { attributeChanges, resetFinance } =
    await import("../src/finance/model");
  const f = empty();
  const e = entry(
    { kind: "income", description: "Aporte", cents: 10000, date: today() },
    f.pots,
  );
  const created = attributeChanges(f, { ...f, entries: [e] }, "voce");
  assert.equal(created.entries[0].createdBy, "voce");
  const edited = attributeChanges(
    created,
    {
      ...created,
      entries: [{ ...created.entries[0], description: "Aporte editado" }],
    },
    "esposa",
  );
  assert.equal(edited.entries[0].createdBy, "voce");
  assert.equal(edited.entries[0].updatedBy, "esposa");
  const reset = resetFinance(edited);
  assert.equal(reset.entries.length, 0);
  assert.equal(reset.configured, false);
  assert.equal(edited.entries.length, 1);
  assert.equal(reset.pots.length, 7);
});
