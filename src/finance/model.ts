export type Actor = "voce" | "esposa";
export type RecordActor = Actor | "sistema" | "anterior";
export const actorName = (actor?: RecordActor) =>
  actor === "voce"
    ? "Rhuan"
    : actor === "esposa"
      ? "Anne"
      : actor === "sistema"
        ? "Sistema"
        : "Registro anterior";
export const MARKETPLACE_ID = "mercado_livre";
export type Marketplace = {
  id: typeof MARKETPLACE_ID;
  name: "Mercado Livre";
  percent: number;
  active: boolean;
  color: string;
};
export type Pot = {
  id: string;
  name: string;
  mode: "percent" | "fixed";
  value: number;
  reserve: boolean;
  rollover: boolean;
  priority: number;
  active: boolean;
  color: string;
  icon?: string;
  allocationBase?: "gross" | "remainder";
};
export type Allocation = Record<string, number>;
export type Entry = {
  id: string;
  kind: "income" | "expense" | "transfer";
  description: string;
  cents: number;
  date: string;
  recordedAt: string;
  updatedAt: string;
  status: "paid" | "pending";
  pot: string;
  destination: string;
  allocations: Allocation;
  policy: Pot[];
  deleted: boolean;
  source: string;
  createdBy?: RecordActor;
  updatedBy?: RecordActor;
};
export type Recurrence = {
  id: string;
  name: string;
  cents: number;
  pot: string;
  start: string;
  count: number;
  active: boolean;
};
export type Goal = {
  id: string;
  name: string;
  target: number;
  pot: string;
  deadline: string;
  opening: number;
};
export type Rule = { id: string; text: string; pot: string };
export type Finance = {
  version: 2;
  revision: number;
  configured: boolean;
  pots: Pot[];
  marketplace: Marketplace;
  entries: Entry[];
  recurrences: Recurrence[];
  goals: Goal[];
  rules: Rule[];
  closedMonths: string[];
  assets: { id: string; name: string; cents: number }[];
  migrationNotes: string[];
};
export const uid = () => crypto.randomUUID();
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const money = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export function parseMoney(value: string): number {
  const raw = value
    .trim()
    .replace(/R\$\s*/g, "")
    .replace(/\s/g, "");
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized))
    throw new Error("Informe um valor válido com até duas casas decimais.");
  const cents = Math.round(Number(normalized) * 100);
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > 1e12)
    throw new Error("O valor deve ser positivo e menor que R$ 10 bilhões.");
  return cents;
}
export const decimal = (cents: number) => (cents / 100).toFixed(2);
export const defaults: Pot[] = [
  {
    id: "nosso_patrimonio",
    name: "Nosso patrimônio",
    value: 10,
    reserve: true,
    color: "#13765e",
  },
  {
    id: "patrimonio_manuela",
    name: "Patrimônio Manuela",
    value: 10,
    reserve: true,
    color: "#4c7c94",
  },
  {
    id: "supermercado",
    name: "Supermercado",
    value: 32,
    reserve: false,
    color: "#b38142",
  },
  {
    id: "transporte",
    name: "Transporte",
    value: 24,
    reserve: false,
    color: "#5073a0",
  },
  {
    id: "desfrute_familia",
    name: "Desfrute família",
    value: 10,
    reserve: false,
    color: "#8472a0",
  },
  {
    id: "desfrute_dele",
    name: "Desfrute dele",
    value: 10,
    reserve: false,
    color: "#718d79",
  },
  {
    id: "desfrute_dela",
    name: "Desfrute dela",
    value: 4,
    reserve: false,
    color: "#a57483",
  },
].map(
  (p, i) =>
    ({
      ...p,
      mode: "percent",
      rollover: true,
      priority: i,
      active: true,
      allocationBase:
        p.id === "nosso_patrimonio" || p.id === "patrimonio_manuela"
          ? "gross"
          : "remainder",
    }) as Pot,
);
export const defaultMarketplace = (): Marketplace => ({
  id: MARKETPLACE_ID,
  name: "Mercado Livre",
  percent: 0,
  active: true,
  color: "#D9B52E",
});

export const marketplacePolicyPot = (marketplace: Marketplace): Pot => ({
  id: MARKETPLACE_ID,
  name: "Mercado Livre",
  mode: "percent",
  value: marketplace.percent,
  reserve: true,
  rollover: true,
  priority: -1,
  active: marketplace.active,
  color: marketplace.color,
  icon: "wallet",
  allocationBase: "gross",
});

export const contributionPolicy = (
  f: Pick<Finance, "pots" | "marketplace">,
  includeMarketplace = true,
): Pot[] => [
  ...structuredClone(f.pots),
  ...(includeMarketplace && f.marketplace.active && f.marketplace.percent > 0
    ? [marketplacePolicyPot(f.marketplace)]
    : []),
];

export const empty = (): Finance => ({
  version: 2,
  revision: 0,
  configured: false,
  pots: defaults,
  marketplace: defaultMarketplace(),
  entries: [],
  recurrences: [],
  goals: [],
  rules: [],
  closedMonths: [],
  assets: [],
  migrationNotes: [],
});
export const potAllocationBase = (p: Pot): "gross" | "remainder" =>
  p.allocationBase ||
  (p.id === "nosso_patrimonio" || p.id === "patrimonio_manuela"
    ? "gross"
    : "remainder");

export function validatePots(pots: Pot[]) {
  const active = pots.filter((p) => p.active);
  if (new Set(pots.map((p) => p.id)).size !== pots.length)
    throw new Error("Potes com identificadores duplicados.");
  if (
    pots.some(
      (p) =>
        typeof p.name !== "string" ||
        typeof p.id !== "string" ||
        !["percent", "fixed"].includes(p.mode) ||
        typeof p.reserve !== "boolean" ||
        typeof p.rollover !== "boolean" ||
        typeof p.active !== "boolean" ||
        !["gross", "remainder"].includes(potAllocationBase(p)),
    )
  )
    throw new Error("Configuração de potes inválida.");
  if (
    active.some(
      (p) =>
        !p.name.trim() ||
        !Number.isFinite(p.value) ||
        p.value < 0 ||
        !Number.isInteger(p.priority) ||
        (p.mode === "percent" && p.value > 100),
    )
  )
    throw new Error("Confira os nomes, valores e prioridades dos potes.");
  for (const base of ["gross", "remainder"] as const) {
    const total = active
      .filter((p) => p.mode === "percent" && potAllocationBase(p) === base)
      .reduce((s, p) => s + Math.round(p.value * 100), 0);
    if (total > 10000)
      throw new Error(
        base === "gross"
          ? "As reservas calculadas sobre o aporte bruto ultrapassam 100%."
          : "As porcentagens dos potes ultrapassam 100% do valor disponível.",
      );
  }
}

export function validateMarketplace(marketplace: Marketplace, pots: Pot[] = []) {
  if (
    !marketplace ||
    marketplace.id !== MARKETPLACE_ID ||
    marketplace.name !== "Mercado Livre" ||
    typeof marketplace.active !== "boolean" ||
    typeof marketplace.color !== "string" ||
    !Number.isFinite(marketplace.percent) ||
    marketplace.percent < 0 ||
    marketplace.percent > 100
  )
    throw new Error("Configuração do Mercado Livre inválida.");
  validatePots([
    ...pots,
    ...(marketplace.active && marketplace.percent > 0
      ? [marketplacePolicyPot(marketplace)]
      : []),
  ]);
}

/**
 * Distribui um aporte em duas bases independentes:
 * 1) patrimônio calculado diretamente sobre o aporte bruto;
 * 2) contas comprometidas ficam no saldo sem distribuição;
 * 3) os demais potes recebem percentuais sobre o que restou depois de patrimônio + compromissos.
 * O dinheiro comprometido não some: permanece em `free` até a conta ser paga.
 */
export function allocateContribution(
  cents: number,
  pots: Pot[],
  committedCents = 0,
): Allocation {
  validatePots(pots);
  if (!Number.isSafeInteger(cents) || cents < 0)
    throw new Error("Aporte inválido.");
  const active = pots
    .filter((p) => p.active)
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
  const result: Allocation = {};

  // Patrimônios: sempre sobre o bruto, uma única vez.
  const grossPots = active.filter((p) => potAllocationBase(p) === "gross");
  let grossAllocated = 0;
  for (const p of grossPots.filter((p) => p.mode === "fixed")) {
    const amount = Math.min(cents - grossAllocated, Math.round(p.value * 100));
    result[p.id] = Math.max(0, amount);
    grossAllocated += Math.max(0, amount);
  }
  for (const p of grossPots.filter((p) => p.mode === "percent")) {
    const requested = Math.floor((cents * Math.round(p.value * 100)) / 10000);
    const amount = Math.max(0, Math.min(cents - grossAllocated, requested));
    result[p.id] = amount;
    grossAllocated += amount;
  }
  grossAllocated = Math.min(cents, grossAllocated);

  const committed = Math.max(0, Math.min(committedCents, cents - grossAllocated));
  let remainder = Math.max(0, cents - grossAllocated - committed);
  const regular = active.filter((p) => potAllocationBase(p) === "remainder");

  // Valores fixos dos potes comuns são atendidos primeiro.
  for (const p of regular.filter((p) => p.mode === "fixed")) {
    const amount = Math.min(remainder, Math.round(p.value * 100));
    result[p.id] = amount;
    remainder -= amount;
  }

  // Percentuais dos potes comuns incidem sobre a base restante após contas + patrimônios.
  const percentBase = remainder;
  let normalAllocated = 0;
  for (const p of regular.filter((p) => p.mode === "percent")) {
    const amount = Math.floor((percentBase * Math.round(p.value * 100)) / 10000);
    result[p.id] = amount;
    normalAllocated += amount;
  }
  remainder = Math.max(0, percentBase - normalAllocated);

  // Inclui compromissos e a parte não distribuída. Isso permite sugerir destino depois.
  result.free = cents - Object.entries(result)
    .filter(([id]) => id !== "free")
    .reduce((sum, [, value]) => sum + value, 0);
  return result;
}

// Mantido como atalho para chamadas existentes sem compromissos mensais.
export function allocate(cents: number, pots: Pot[]): Allocation {
  return allocateContribution(cents, pots, 0);
}

export function pendingCommitmentsForMonth(f: Finance, date = today()): number {
  const month = date.slice(0, 7);
  return f.entries
    .filter(
      (e) =>
        !e.deleted &&
        e.kind === "expense" &&
        e.status === "pending" &&
        e.date.slice(0, 7) === month,
    )
    .reduce((sum, e) => sum + e.cents, 0);
}

export const validDate = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !Number.isNaN(Date.parse(s + "T12:00:00Z")) &&
  new Date(s + "T12:00:00Z").toISOString().slice(0, 10) === s;
export function entry(
  input: Partial<Entry> & {
    kind: Entry["kind"];
    cents: number;
    date: string;
    description: string;
  },
  pots: Pot[],
): Entry {
  if (!validDate(input.date)) throw new Error("Confira a data.");
  if (!Number.isSafeInteger(input.cents) || input.cents <= 0)
    throw new Error("Informe um valor positivo.");
  if (!input.description.trim()) throw new Error("Informe uma descrição.");
  const timestamp = new Date().toISOString();
  const policy = input.policy || structuredClone(pots);
  return {
    id: input.id || uid(),
    pot: "free",
    destination: "",
    source: "",
    deleted: false,
    status: "paid",
    recordedAt: timestamp,
    ...input,
    description: input.description.trim(),
    updatedAt: timestamp,
    policy,
    allocations: input.kind === "income" ? allocate(input.cents, policy) : {},
  };
}
export function balances(f: Finance, through = today()) {
  const buckets: Allocation = { free: 0 };
  const funded: Allocation = {};
  const spent: Allocation = {};
  let account = 0;
  const records = f.entries.filter(
    (e) => !e.deleted && e.status === "paid" && e.date <= through,
  );
  for (const e of records) {
    if (e.kind === "income") {
      account += e.cents;
      Object.entries(e.allocations).forEach(([p, v]) => {
        buckets[p] = (buckets[p] || 0) + v;
        funded[p] = (funded[p] || 0) + v;
      });
    }
    if (e.kind === "expense") {
      account -= e.cents;
      buckets[e.pot] = (buckets[e.pot] || 0) - e.cents;
      spent[e.pot] = (spent[e.pot] || 0) + e.cents;
    }
    if (e.kind === "transfer") {
      buckets[e.pot] = (buckets[e.pot] || 0) - e.cents;
      buckets[e.destination] = (buckets[e.destination] || 0) + e.cents;
    }
  }
  const personalReserved = f.pots
    .filter((p) => p.reserve)
    .reduce((s, p) => s + Math.max(0, buckets[p.id] || 0), 0);
  const marketplace = Math.max(0, buckets[MARKETPLACE_ID] || 0);
  const reserved = personalReserved + marketplace;
  const month = through.slice(0, 7);
  const pending = f.entries
    .filter(
      (e) =>
        !e.deleted &&
        e.kind === "expense" &&
        e.status === "pending" &&
        e.date.slice(0, 7) <= month,
    )
    .reduce((s, e) => s + e.cents, 0);
  // O "Livre para gastar" respeita a separação dos potes: contas pendentes
  // só consomem o saldo sem distribuição (free), nunca o saldo de outro pote.
  const spendablePots = f.pots
    .filter((p) => !p.reserve)
    .reduce((sum, p) => sum + Math.max(0, buckets[p.id] || 0), 0);
  const unallocatedAvailable = Math.max(0, (buckets.free || 0) - pending);

  return {
    account,
    reserved,
    personalReserved,
    marketplace,
    pending,
    free: spendablePots + unallocatedAvailable,
    buckets,
    funded,
    spent,
  };
}
export function monthDate(start: string, offset: number): string {
  const [y, m, d] = start.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1 + offset, 1));
  const last = new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return `${base.getUTCFullYear()}-${String(base.getUTCMonth() + 1).padStart(2, "0")}-${String(Math.min(d, last)).padStart(2, "0")}`;
}
export function generateRecurring(f: Finance, through = today()): Finance {
  const next = structuredClone(f);
  const ids = new Set(next.entries.map((e) => e.id));
  for (const r of f.recurrences.filter((r) => r.active)) {
    for (let i = 0; i < (r.count || 1200); i++) {
      const date = monthDate(r.start, i);
      if (date.slice(0, 7) > through.slice(0, 7)) break;
      if (f.closedMonths.some((m) => date.slice(0, 7) <= m)) continue;
      const id = `rec-${r.id}-${i}`;
      if (!ids.has(id))
        next.entries.push(
          entry(
            {
              id,
              kind: "expense",
              description: r.count ? `${r.name} · ${i + 1}/${r.count}` : r.name,
              cents: r.cents,
              date,
              pot: r.pot,
              status: "pending",
              source: r.id,
            },
            next.pots,
          ),
        );
    }
  }
  return next;
}
export function closeMonth(f: Finance, month: string): Finance {
  if (!/^\d{4}-\d{2}$/.test(month) || month >= today().slice(0, 7))
    throw new Error("Só é possível fechar meses anteriores ao atual.");
  if (f.closedMonths.includes(month))
    throw new Error("Este mês já foi fechado.");
  if (f.closedMonths.some((m) => m > month))
    throw new Error("Reabra os meses posteriores antes de fechar este mês.");
  if (
    f.entries.some(
      (e) =>
        !e.deleted && e.status === "pending" && e.date.slice(0, 7) <= month,
    )
  )
    throw new Error("Resolva as contas pendentes antes do fechamento.");
  const end = monthDate(`${month}-01`, 1);
  const at = new Date(end + "T12:00:00Z");
  at.setUTCDate(at.getUTCDate() - 1);
  const date = at.toISOString().slice(0, 10);
  const b = balances(f, date);
  const next = structuredClone(f);
  for (const p of f.pots.filter((p) => !p.rollover)) {
    const amount = b.buckets[p.id] || 0;
    if (amount > 0)
      next.entries.push(
        entry(
          {
            id: `close-${month}-${p.id}`,
            kind: "transfer",
            description: `Sobra de ${p.name} · ${month}`,
            cents: amount,
            date,
            pot: p.id,
            destination: "free",
            source: `close:${month}`,
          },
          f.pots,
        ),
      );
  }
  next.closedMonths.push(month);
  return next;
}
const toCents = (v: unknown) => Math.round((Number(v) || 0) * 100);
function legacyDate(s: string) {
  if (validDate(s)) return s;
  const [d, m, y] = (s || "").split("/");
  const v = `${y}-${m?.padStart(2, "0")}-${d?.padStart(2, "0")}`;
  return validDate(v) ? v : today();
}
export function migrate(raw: any): Finance {
  if (raw?.financeV2) {
    const original = raw.financeV2;
    const marketplaceLegacyPot = (original.pots || []).find(
      (p: Pot) =>
        p?.id === MARKETPLACE_ID ||
        String(p?.name || "").trim().toLocaleLowerCase("pt-BR") === "mercado livre",
    );
    const legacyMarketplaceId = marketplaceLegacyPot?.id || MARKETPLACE_ID;
    const marketplace: Marketplace = original.marketplace
      ? {
          ...defaultMarketplace(),
          ...original.marketplace,
          id: MARKETPLACE_ID,
          name: "Mercado Livre",
          percent: Math.max(0, Math.min(100, Math.round(Number(original.marketplace.percent) || 0))),
        }
      : {
          ...defaultMarketplace(),
          percent:
            marketplaceLegacyPot?.mode === "percent"
              ? Math.max(0, Math.min(100, Math.round(Number(marketplaceLegacyPot.value) || 0)))
              : 0,
          active: marketplaceLegacyPot?.active ?? true,
        };
    const recurrenceIds = new Set<string>(
      (original.recurrences || []).map((r: Recurrence) => r.id),
    );
    const remapId = (id: string) =>
      id === legacyMarketplaceId ? MARKETPLACE_ID : id;
    const normalizePolicy = (policy: Pot[] = []) =>
      policy.map((p: Pot) => ({
        ...p,
        id: remapId(p.id),
        name: p.id === legacyMarketplaceId ? "Mercado Livre" : p.name,
        color: p.id === legacyMarketplaceId ? marketplace.color : p.color,
        allocationBase: potAllocationBase(p),
      }));
    const normalized = {
      ...original,
      marketplace,
      pots: (original.pots || [])
        .filter((p: Pot) => p.id !== legacyMarketplaceId)
        .map((p: Pot) => ({
          ...p,
          allocationBase: potAllocationBase(p),
        })),
      recurrences: (original.recurrences || []).map((r: Recurrence) => ({
        ...r,
        pot: "free",
      })),
      entries: (original.entries || []).map((e: Entry) => {
        const allocations: Allocation = {};
        Object.entries(e.allocations || {}).forEach(([id, value]) => {
          const target = remapId(id);
          allocations[target] = (allocations[target] || 0) + Number(value);
        });
        return {
          ...e,
          allocations,
          pot:
            e.kind === "expense" &&
            e.status === "pending" &&
            e.source &&
            recurrenceIds.has(e.source)
              ? "free"
              : remapId(e.pot),
          destination: remapId(e.destination),
          policy: normalizePolicy(e.policy || []),
          createdBy: e.createdBy || "anterior",
          updatedBy: e.updatedBy || e.createdBy || "anterior",
        };
      }),
      rules: (original.rules || []).map((r: Rule) => ({
        ...r,
        pot: r.pot === legacyMarketplaceId ? "free" : r.pot,
      })),
      migrationNotes: [
        ...(original.migrationNotes || []),
        ...(!original.marketplace && marketplaceLegacyPot
          ? [
              "Mercado Livre foi separado dos potes. O saldo e o histórico existentes foram preservados integralmente; o percentual anterior foi mantido e, nos próximos aportes, passa a ser calculado sobre o aporte bruto.",
            ]
          : []),
      ],
    };
    validateFinance(normalized);
    return normalized;
  }
  const f = empty();
  if (!raw || !Array.isArray(raw.potesAtivos)) return f;
  f.configured = raw.potesAtivos.length > 0;
  const legacyMarketplace = (raw.potesAtivos || []).find(
    (p: any) => String(p?.nome || "").trim().toLocaleLowerCase("pt-BR") === "mercado livre",
  );
  if (legacyMarketplace) {
    f.marketplace.percent = Math.max(0, Math.min(100, Math.round(Number(legacyMarketplace.percentual) || 0)));
    f.marketplace.active = true;
  }
  f.pots = raw.potesAtivos
    .filter((p: any) => p !== legacyMarketplace)
    .map((p: any, i: number) => ({
      id: p.id,
      name: p.nome,
      value: Number(p.percentual) || 0,
      mode: "percent",
      reserve: !!p.retencaoAutomatica,
      rollover: true,
      priority: i,
      active: true,
      color: p.cor || "#13765e",
      allocationBase:
        p.id === "nosso_patrimonio" || p.id === "patrimonio_manuela"
          ? "gross"
          : "remainder",
    }));
  validatePots(f.pots);
  const initial = toCents(raw.aportePendenteValor);
  const dates = (raw.transacoes || [])
    .map((t: any) => legacyDate(t.data))
    .sort();
  if (initial > 0)
    f.entries.push(
      entry(
        {
          id: "legacy-opening",
          kind: "income",
          description: "Aporte inicial migrado",
          cents: initial,
          date: dates[0] || today(),
        },
        f.pots,
      ),
    );
  for (const t of raw.transacoes || []) {
    const cents = toCents(t.valor);
    if (cents <= 0) continue;
    let kind: Entry["kind"] = t.tipo === "entrada" ? "income" : "expense";
    let pot = t.poteId || "free",
      destination = "";
    if (legacyMarketplace && pot === legacyMarketplace.id) pot = MARKETPLACE_ID;
    if (["geral", "divida_fixa"].includes(pot)) pot = "free";
    if (pot.startsWith("aporte_extra_")) {
      kind = "transfer";
      destination = pot.replace("aporte_extra_", "");
      pot = "free";
    }
    f.entries.push(
      entry(
        {
          id: `legacy-${t.id}`,
          kind,
          description: t.descricao || "Movimentação anterior",
          cents,
          date: legacyDate(t.data),
          pot,
          destination,
        },
        f.pots,
      ),
    );
  }
  for (const m of raw.metas || []) {
    const pot = `goal-${m.id}`;
    f.pots.push({
      id: pot,
      name: m.nome,
      mode: "percent",
      value: 0,
      reserve: true,
      rollover: true,
      priority: f.pots.length,
      active: true,
      color: "#8472a0",
      allocationBase: "remainder",
    });
    // Legacy goal deposits were recorded as expenses; reclassify matching records as internal transfers.
    let recovered = 0;
    for (const e of f.entries.filter((e) =>
      ["meta_aporte", "meta_transf"].includes(e.pot),
    )) {
      if (e.description.includes(m.nome)) {
        e.kind = "transfer";
        e.pot = "free";
        e.destination = pot;
        recovered += e.cents;
      }
    }
    f.goals.push({
      id: m.id,
      name: m.nome,
      target: toCents(m.valorAlvo),
      pot,
      deadline: monthDate(today(), Number(m.meses) || 12),
      opening: Math.max(0, toCents(m.valorGuardado) - recovered),
    });
  }
  for (const e of f.entries.filter((e) =>
    ["meta_aporte", "meta_transf"].includes(e.pot),
  )) {
    e.pot = "free";
    f.migrationNotes.push(
      `Conferir lançamento de meta sem vínculo: ${e.description} (${money(e.cents)}). Mantido como saída para evitar atribuição incorreta.`,
    );
  }
  f.assets = (raw.itensPatrimonioManuais || []).map((a: any) => ({
    id: a.id,
    name: a.nome,
    cents: toCents(a.valor),
  }));
  f.recurrences = (raw.contasFixasObrigatorias || [])
    .filter((r: any) => r.mesesRestantes > 0)
    .map((r: any) => ({
      id: r.id,
      name: r.nome,
      cents: toCents(r.valor),
      pot: "free",
      start: today(),
      count: r.mesesRestantes,
      active: false,
    }));
  f.migrationNotes.unshift(
    "Aporte inicial convertido uma única vez. A data foi inferida do primeiro lançamento; confira no extrato. Percentuais históricos não existiam: os lançamentos anteriores usam a configuração encontrada na migração.",
  );
  if (f.recurrences.length)
    f.migrationNotes.push(
      "Contas antigas preservadas e pausadas. Confira a data do próximo vencimento e ative em Contas.",
    );
  return {
    ...f,
    entries: f.entries.map((e) => ({
      ...e,
      createdBy: "anterior" as const,
      updatedBy: "anterior" as const,
    })),
  };
}
export function validateFinance(f: any): asserts f is Finance {
  if (
    !f ||
    f.version !== 2 ||
    !Array.isArray(f.entries) ||
    !Array.isArray(f.pots) ||
    !f.marketplace ||
    !Array.isArray(f.goals) ||
    !Array.isArray(f.recurrences) ||
    !Array.isArray(f.rules) ||
    !Array.isArray(f.closedMonths) ||
    !Array.isArray(f.assets) ||
    !Array.isArray(f.migrationNotes) ||
    !Number.isInteger(f.revision) ||
    f.revision < 0 ||
    typeof f.configured !== "boolean"
  )
    throw new Error("Backup inválido ou incompatível.");
  validatePots(f.pots);
  validateMarketplace(f.marketplace, f.pots);
  if (
    f.closedMonths.some(
      (m: any) => typeof m !== "string" || !/^\d{4}-\d{2}$/.test(m),
    )
  )
    throw new Error("Fechamentos inválidos no backup.");
  const ids = new Set<string>();
  for (const e of f.entries) {
    if (
      ids.has(e.id) ||
      !e.id ||
      !["income", "expense", "transfer"].includes(e.kind) ||
      !["paid", "pending"].includes(e.status) ||
      !validDate(e.date) ||
      !Number.isSafeInteger(e.cents) ||
      e.cents <= 0 ||
      !e.allocations ||
      !Array.isArray(e.policy)
    )
      throw new Error("Há lançamentos inválidos no backup.");
    if (
      typeof e.description !== "string" ||
      typeof e.pot !== "string" ||
      typeof e.destination !== "string" ||
      typeof e.recordedAt !== "string" ||
      typeof e.deleted !== "boolean"
    )
      throw new Error("Lançamento incompleto no backup.");
    if (
      (e.kind !== "expense" && e.status !== "paid") ||
      (e.kind === "transfer" && (!e.destination || e.pot === e.destination))
    )
      throw new Error("Tipo ou destino de lançamento inválido.");
    if (e.kind === "income") validatePots(e.policy);
    if (
      [e.createdBy, e.updatedBy].some(
        (a) =>
          a !== undefined &&
          !["voce", "esposa", "sistema", "anterior"].includes(a),
      )
    )
      throw new Error("Perfil de movimentação inválido.");
    ids.add(e.id);
    if (
      Object.values(e.allocations).some(
        (v) => !Number.isSafeInteger(v) || Number(v) < 0,
      ) ||
      (e.kind === "income" &&
        Object.values(e.allocations).reduce(
          (s: number, v) => s + Number(v),
          0,
        ) !== e.cents)
    )
      throw new Error("Distribuição inválida no backup.");
  }
  for (const a of f.assets)
    if (
      !a.id ||
      typeof a.name !== "string" ||
      !Number.isSafeInteger(a.cents) ||
      a.cents < 0
    )
      throw new Error("Patrimônio inválido no backup.");
  for (const r of f.rules)
    if (
      !r.id ||
      typeof r.text !== "string" ||
      !r.text.trim() ||
      typeof r.pot !== "string"
    )
      throw new Error("Regra inválida no backup.");
  for (const r of f.recurrences)
    if (
      !validDate(r.start) ||
      !Number.isSafeInteger(r.cents) ||
      r.cents <= 0 ||
      !Number.isInteger(r.count) ||
      r.count < 0 ||
      r.count > 1200
    )
      throw new Error("Recorrência inválida no backup.");
  for (const g of f.goals)
    if (
      !validDate(g.deadline) ||
      !Number.isSafeInteger(g.target) ||
      g.target <= 0 ||
      !Number.isSafeInteger(g.opening) ||
      g.opening < 0
    )
      throw new Error("Meta inválida no backup.");
}

export function attributeChanges(
  before: Finance,
  after: Finance,
  actor: Actor,
): Finance {
  const prior = new Map(before.entries.map((e) => [e.id, e]));
  const timestamp = new Date().toISOString();
  return {
    ...after,
    entries: after.entries.map((e) => {
      const old = prior.get(e.id);
      if (
        (old && JSON.stringify(old) === JSON.stringify(e)) ||
        (!old && e.createdBy)
      )
        return e;
      const generated = !old && e.id.startsWith("rec-");
      return {
        ...e,
        createdBy:
          old?.createdBy ||
          e.createdBy ||
          (!old ? (generated ? "sistema" : actor) : "anterior"),
        updatedBy: generated ? "sistema" : actor,
        updatedAt: timestamp,
      };
    }),
  };
}
export function resetFinance(current: Finance): Finance {
  const next = empty();
  next.revision = current.revision;
  return next;
}
