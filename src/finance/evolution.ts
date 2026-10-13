import { Finance, balances, today, MARKETPLACE_ID } from "./model";

// Read-only projection: never writes XP, changes a balance or migrates a record.
export function familyEvolution(f: Finance, asOf = today()) {
  // Conta transferências reais para os patrimônios no gráfico, sem tratá-las
  // como receita adicional ou permitir que transferências gerem XP.
  const patrimonies = new Set(["nosso_patrimonio", "patrimonio_manuela"]);
  const isPatrimonyTransfer = (e: Finance["entries"][number]) =>
    e.kind === "transfer" &&
    patrimonies.has(e.destination) &&
    !patrimonies.has(e.pot) &&
    (e.pot === MARKETPLACE_ID || e.pot === "free" ||
      f.pots.some((p) => p.id === e.pot && !p.reserve));
  const rows = f.entries.filter(
    (e) =>
      !e.deleted &&
      e.date <= asOf &&
      (!e.source.startsWith("marketplace:") || isPatrimonyTransfer(e)),
  );
  const months = [...new Set(rows.map((e) => e.date.slice(0, 7)))].sort();
  const history = months.map((month) => {
    const entries = rows.filter((e) => e.date.startsWith(month));
    const paid = entries.filter((e) => e.status === "paid");
    const income = paid
      .filter((e) => e.kind === "income")
      .reduce((n, e) => n + e.cents, 0);
    const expense = paid
      .filter((e) => e.kind === "expense")
      .reduce((n, e) => n + e.cents, 0);
    const allocated = paid
      .filter((e) => e.kind === "income")
      .reduce(
        (n, e) =>
          n +
          (e.allocations.nosso_patrimonio || 0) +
          (e.allocations.patrimonio_manuela || 0),
        0,
      );
    const transferred = paid
      .filter(isPatrimonyTransfer)
      .reduce((n, e) => n + e.cents, 0);
    // Valor efetivamente destinado aos patrimônios; a transferência não
    // aumenta o saldo em conta e não vira um novo lançamento de receita.
    const saved = allocated + transferred;
    const completed = month < asOf.slice(0, 7);
    const hasBills = entries.some(
      (e) =>
        e.kind === "expense" && f.recurrences.some((r) => r.id === e.source),
    );
    const billsClear =
      hasBills &&
      !entries.some((e) => e.kind === "expense" && e.status === "pending");
    const balanced = income > 0 && expense <= income;
    // Each criterion counts once per completed month, regardless of amount or transaction count.
    const xp = completed
      ? (income > 0 ? 20 : 0) +
        (allocated > 0 ? 20 : 0) +
        (balanced ? 20 : 0) +
        (billsClear ? 20 : 0)
      : 0;
    return {
      month,
      income,
      expense,
      saved,
      allocated,
      transferred,
      completed,
      balanced,
      billsClear,
      xp,
    };
  });
  const xp = (f.configured ? 20 : 0) + history.reduce((n, m) => n + m.xp, 0);
  const thresholds = [0, 100, 260, 500, 820, 1220];
  const titles = [
    "Aprendiz",
    "Organizador",
    "Construtor",
    "Estrategista",
    "Guardião",
    "Mestre do Império",
  ];
  const index = thresholds.reduce(
    (result, threshold, i) => (xp >= threshold ? i : result),
    0,
  );
  const next = thresholds[index + 1];
  const completed = history.filter((m) => m.completed);
  const medals = [
    {
      id: "plan",
      name: "Primeiro plano",
      description: "Planejamento inicial concluído.",
      unlocked: f.configured,
    },
    {
      id: "reserve",
      name: "Constância",
      description:
        "Aportes aos patrimônios em três meses consecutivos completos.",
      unlocked: completed.some(
        (m, i) =>
          i >= 2 &&
          m.saved > 0 &&
          completed[i - 1].saved > 0 &&
          completed[i - 2].saved > 0 &&
          monthIndex(m.month) - monthIndex(completed[i - 2].month) === 2,
      ),
    },
    {
      id: "balance",
      name: "Mês equilibrado",
      description: "Um mês completo com gastos pagos até o total de aportes.",
      unlocked: completed.some((m) => m.balanced),
    },
    {
      id: "bills",
      name: "Compromissos pagos",
      description:
        "Um mês completo com contas recorrentes e sem pendências registradas.",
      unlocked: completed.some((m) => m.billsClear),
    },
  ];
  const overdue = rows.filter(
    (e) => e.kind === "expense" && e.status === "pending" && e.date < asOf,
  );
  const current = history.find((m) => m.month === asOf.slice(0, 7));
  const b = balances(f, asOf);
  const insights = [
    {
      good: !overdue.length,
      title: overdue.length
        ? "Prioridade: contas vencidas"
        : "Sem atrasos registrados",
      text: overdue.length
        ? `${overdue.length} compromisso(s) vencido(s) aguardam pagamento. Confira a tela Contas.`
        : "Não há pagamentos pendentes com data anterior a hoje. Isso considera apenas os registros do aplicativo.",
    },
    {
      good: !!current?.saved,
      title: current?.saved
        ? "Patrimônios recebendo aportes"
        : "Acompanhem os aportes",
      text: current?.saved
        ? "Neste mês houve entradas ou transferências registradas para os patrimônios da família."
        : "Ainda não há entradas ou transferências para os patrimônios neste mês. Confiram o planejamento antes do próximo recebimento.",
    },
    {
      good: b.free >= 0,
      title:
        b.free >= 0
          ? "Compromissos cobertos pelo saldo"
          : "Atenção ao saldo disponível",
      text:
        b.free >= 0
          ? "O saldo atual cobre as reservas e os compromissos considerados pelo aplicativo."
          : "Os compromissos e reservas superam o saldo disponível. Revisem as pendências antes de novos gastos.",
    },
  ];
  return {
    xp,
    level: index + 1,
    title: titles[index],
    next,
    progress: next
      ? ((xp - thresholds[index]) / (next - thresholds[index])) * 100
      : 100,
    history,
    medals,
    insights,
  };
}
function monthIndex(month: string) {
  return Number(month.slice(0, 4)) * 12 + Number(month.slice(5)) - 1;
}
