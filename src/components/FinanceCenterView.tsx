import { PotSymbol, potSymbol, symbols } from "../finance/PotSymbol";
import { PercentageControl } from "../finance/PercentageControl";
import { storage } from "../finance/storage";
import { useMemo, useState, FormEvent, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Home,
  List,
  Wallet,
  Target,
  Settings,
  LogOut,
  Sun,
  Moon,
  X,
  Pencil,
  Trash2,
  RotateCcw,
  Copy,
  ArrowRightLeft,
  Download,
  Search,
  Check,
  ChevronRight,
  ShieldCheck,
  CalendarDays,
  Eye,
  EyeOff,
} from "lucide-react";
import { useFinance } from "../finance/useFinance";
import {
  Finance,
  Pot,
  Entry,
  Recurrence,
  Goal,
  balances,
  today,
  money,
  parseMoney,
  decimal,
  entry,
  uid,
  allocate,
  validatePots,
  closeMonth,
  generateRecurring,
  validateFinance,
  migrate,
  monthDate,
  Actor,
  actorName,
  resetFinance,
  potCommitment,
  payBill,
} from "../finance/model";
import "../finance/finance.css";
type View = "home" | "ledger" | "pots" | "bills" | "goals" | "settings";
type Modal =
  | { type: "entry"; kind: Entry["kind"]; existing?: Entry }
  | { type: "pot"; existing?: Pot }
  | { type: "bill"; existing?: Recurrence }
  | { type: "goal"; existing?: Goal }
  | { type: "rule" }
  | { type: "asset" }
  | { type: "setup" }
  | { type: "reset" }
  | null;
const labels = {
  home: "Visão geral",
  ledger: "Extrato",
  pots: "Potes",
  bills: "Contas",
  goals: "Metas",
  settings: "Configurações",
};
const icons = {
  home: Home,
  ledger: List,
  pots: Wallet,
  bills: CalendarDays,
  goals: Target,
  settings: Settings,
};
const kindNames = {
  income: "Aporte",
  expense: "Gasto",
  transfer: "Transferência",
};
const displayDate = (s: string) => s.split("-").reverse().join("/");
function Field({ label, children }: { label: string; children: any }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: any;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", fn);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = old;
    };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <h2>{title}</h2>
          <button className="icon-button" aria-label="Fechar" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
function exportFile(name: string, text: string, type = "application/json") {
  const blob = new Blob([text], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
export default function FinanceCenterView({
  demo = false,
  actor = "voce",
  onLogout,
}: {
  demo?: boolean;
  actor?: Actor;
  onLogout?: () => void;
  emailUsuario?: string;
}) {
  const {
    data: f,
    save,
    status,
    error,
    saving,
    lastReset,
  } = useFinance(demo, actor);
  const [view, setView] = useState<View>("home"),
    [modal, setModal] = useState<Modal>(null),
    [toast, setToast] = useState(""),
    [localError, setLocalError] = useState("");
  const [month, setMonth] = useState(today().slice(0, 7)),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [potFilter, setPotFilter] = useState("all"),
    [showDeleted, setShowDeleted] = useState(false),
    [hidden, setHidden] = useState(false);
  const [dark, setDark] = useState(
    () => storage.getItem("imperio_visual") === "dark",
  );
  useEffect(() => {
    const color = dark ? "#11141b" : "#f5f6f3";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", color);
    document
      .querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
      ?.setAttribute("content", dark ? "black-translucent" : "default");
    document.body.style.backgroundColor = color;
  }, [dark]);
  const [actorFilter, setActorFilter] = useState("all");
  const [payment, setPayment] = useState<Entry | null>(null);
  const [paymentUndo, setPaymentUndo] = useState<{
    before: Entry;
    cents: number;
    date: string;
  } | null>(null);
  const [undo, setUndo] = useState<Entry | null>(null);
  const b = useMemo(() => (f ? balances(f) : null), [f]);
  const cash = (v: number) => (hidden ? "R$ ••••" : money(v));
  async function change(
    fn: (s: Finance) => Finance,
    message = "Alteração salva",
    backupBefore = false,
  ) {
    try {
      setLocalError("");
      await save(fn, backupBefore);
      setToast(message);
      return true;
    } catch (e) {
      setLocalError((e as Error).message);
      return false;
    }
  }
  function open(m: Modal) {
    setLocalError("");
    setModal(m);
  }
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  function toggleTheme() {
    setDark(!dark);
    storage.setItem("imperio_visual", dark ? "light" : "dark");
  }
  if (!f || !b)
    return (
      <main className="loading">
        <span className="wordmark">
          IMPÉRIO<span>FINANCEIRO</span>
        </span>
        <p>{error || "Carregando seu planejamento…"}</p>
        {error && (
          <button onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        )}
      </main>
    );
  const pots = f.pots.filter((p) => p.active);
  const potName = (id: string) =>
    id === "free"
      ? "Sem distribuição"
      : f.pots.find((p) => p.id === id)?.name || "Categoria anterior";
  const pending = f.entries
    .filter((e) => !e.deleted && e.kind === "expense" && e.status === "pending")
    .sort((a, b) => a.date.localeCompare(b.date));
  const currentEntries = f.entries.filter(
    (e) => !e.deleted && e.date.slice(0, 7) === month,
  );
  const income = currentEntries
    .filter(
      (e) => e.kind === "income" && e.status === "paid" && e.date <= today(),
    )
    .reduce((s, e) => s + e.cents, 0);
  const expense = currentEntries
    .filter(
      (e) => e.kind === "expense" && e.status === "paid" && e.date <= today(),
    )
    .reduce((s, e) => s + e.cents, 0);
  const filtered = f.entries
    .filter(
      (e) =>
        (showDeleted || !e.deleted) &&
        (actorFilter === "all" ||
          e.createdBy === actorFilter ||
          e.updatedBy === actorFilter) &&
        e.date.slice(0, 7) === month &&
        (filter === "all" ||
          (filter === "pending"
            ? e.status === "pending"
            : e.kind === filter)) &&
        (potFilter === "all" ||
          e.pot === potFilter ||
          e.destination === potFilter ||
          e.allocations[potFilter] > 0) &&
        e.description.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    )
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        b.recordedAt.localeCompare(a.recordedAt),
    );
  async function softDelete(e: Entry) {
    if (f.closedMonths.some((m) => e.date.slice(0, 7) <= m)) {
      setLocalError("Reabra o mês antes de excluir este lançamento.");
      return;
    }
    if (
      await change(
        (s) => ({
          ...s,
          entries: s.entries.map((x) =>
            x.id === e.id
              ? { ...x, deleted: true, updatedAt: new Date().toISOString() }
              : x,
          ),
        }),
        "Lançamento excluído. Você pode desfazer.",
      )
    )
      setUndo(e);
  }
  async function restore(e: Entry) {
    if (f.closedMonths.some((m) => e.date.slice(0, 7) <= m)) {
      setLocalError(
        "Reabra os meses fechados antes de restaurar este lançamento.",
      );
      return;
    }

    await change(
      (s) => ({
        ...s,
        entries: s.entries.map((x) =>
          x.id === e.id
            ? { ...x, deleted: false, updatedAt: new Date().toISOString() }
            : x,
        ),
      }),
      "Lançamento restaurado",
    );
    setUndo(null);
  }
  function pay(e: Entry) {
    setLocalError("");
    setPayment(e);
  }
  async function undoPayment() {
    if (!paymentUndo) return;
    const previous = paymentUndo;
    const ok = await change((s) => {
      const current = s.entries.find((e) => e.id === previous.before.id);
      if (
        !current ||
        current.deleted ||
        current.status !== "paid" ||
        current.date !== previous.date ||
        current.cents !== previous.cents
      )
        throw new Error("A conta mudou desde o pagamento. Confira o extrato.");
      if (
        s.closedMonths.some(
          (m) =>
            current.date.slice(0, 7) <= m ||
            previous.before.date.slice(0, 7) <= m,
        )
      )
        throw new Error("Reabra o mês antes de desfazer o pagamento.");
      return {
        ...s,
        entries: s.entries.map((e) =>
          e.id === current.id
            ? {
                ...e,
                status: "pending",
                cents: previous.before.cents,
                date: previous.before.date,
                updatedAt: new Date().toISOString(),
              }
            : e,
        ),
      };
    }, "Pagamento desfeito. A conta voltou a ficar pendente.");
    if (ok) setPaymentUndo(null);
  }
  function ledgerRow(e: Entry) {
    const Icon =
      e.kind === "income"
        ? ArrowDownLeft
        : e.kind === "transfer"
          ? ArrowRightLeft
          : ArrowUpRight;
    return (
      <div className={`ledger-row ${e.deleted ? "deleted" : ""}`} key={e.id}>
        <span className={`entry-icon ${e.kind}`}>
          <Icon size={18} />
        </span>
        <div className="entry-info">
          <strong>{e.description}</strong>
          <small>
            {displayDate(e.date)} ·{" "}
            {e.kind === "income" ? "Distribuição automática" : potName(e.pot)}
            {e.kind === "transfer" ? ` → ${potName(e.destination)}` : ""}
            {e.date > today() ? " · Agendado" : ""}
          </small>
          <span className="entry-author">
            Por {actorName(e.createdBy)}
            {e.updatedBy && e.updatedBy !== e.createdBy
              ? ` · Última alteração: ${actorName(e.updatedBy)}`
              : ""}
          </span>
        </div>
        <span className={`badge ${e.status === "pending" ? "warning" : ""}`}>
          {e.deleted
            ? "Excluído"
            : e.status === "pending"
              ? "Pendente"
              : e.kind === "expense"
                ? "Pago"
                : kindNames[e.kind]}
        </span>
        <strong
          className={`entry-value ${e.kind === "income" ? "positive" : ""}`}
        >
          {e.kind === "expense" ? "−" : e.kind === "income" ? "+" : ""}
          {cash(e.cents)}
        </strong>
        <div className="row-actions">
          {e.deleted ? (
            <button
              aria-label="Restaurar lançamento"
              onClick={() => restore(e)}
            >
              <RotateCcw size={16} />
            </button>
          ) : (
            <>
              {e.status === "pending" && (
                <button
                  aria-label={`Pagar ${e.description}`}
                  className="pay-button"
                  disabled={saving}
                  onClick={() => pay(e)}
                >
                  <Check size={16} /> Pagar
                </button>
              )}
              <button
                aria-label="Editar lançamento"
                onClick={() =>
                  open({ type: "entry", kind: e.kind, existing: e })
                }
              >
                <Pencil size={15} />
              </button>
              <button
                aria-label="Repetir lançamento"
                onClick={() =>
                  open({
                    type: "entry",
                    kind: e.kind,
                    existing: {
                      ...e,
                      id: "",
                      date: today(),
                      policy: [],
                      source: "",
                    },
                  })
                }
              >
                <Copy size={15} />
              </button>
              <button
                aria-label="Excluir lançamento"
                onClick={() => softDelete(e)}
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={`finance-app ${dark ? "dark" : ""}`}>
      <aside className="sidebar">
        <span className="wordmark">
          IMPÉRIO<span>FINANCEIRO</span>
        </span>
        <p className="sidebar-caption">PLANEJAMENTO DA FAMÍLIA</p>
        <nav>
          {(Object.keys(labels) as View[]).map((v) => {
            const Icon = icons[v];
            return (
              <button
                key={v}
                className={view === v ? "active" : ""}
                onClick={() => {
                  setView(v);
                  setLocalError("");
                }}
              >
                <Icon size={18} />
                <span>{labels[v]}</span>
                {view === v && <ChevronRight size={14} />}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <span>
            <i
              className={
                status.includes("Falha") || status.includes("Sem conexão")
                  ? "offline"
                  : ""
              }
            />
            {saving ? "Sincronizando" : status}
          </span>
          <button onClick={onLogout}>
            <LogOut size={16} /> Sair da conta
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="mobile-brand">IMPÉRIO</div>
          <span className="breadcrumb">
            Meu Império <span>/</span> {labels[view]}
          </span>
          <div className="top-actions">
            {demo && (
              <span className="badge warning">
                Demonstração · dados fictícios
              </span>
            )}
            <button
              className="icon-button"
              aria-label={hidden ? "Mostrar valores" : "Ocultar valores"}
              onClick={() => setHidden(!hidden)}
            >
              {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button
              className="icon-button"
              aria-label="Alternar tema"
              onClick={toggleTheme}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="account-chip"
              onClick={onLogout}
              aria-label="Trocar perfil"
            >
              <span className="avatar">{actor === "voce" ? "V" : "E"}</span>
              <span>{actorName(actor)}</span>
            </button>
          </div>
        </header>
        <main className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {view === "home"
                  ? "SEU PLANEJAMENTO, EM DIA"
                  : "MEU IMPÉRIO FINANCEIRO"}
              </p>
              <h1>{labels[view]}</h1>
              <p>
                {view === "home"
                  ? "Clareza para decidir. Consistência para construir."
                  : view === "pots"
                    ? "Cada entrada segue suas prioridades."
                    : view === "bills"
                      ? "Contas organizadas, pagamentos confirmados por você."
                      : view === "goals"
                        ? "Transforme contribuições em conquistas."
                        : view === "ledger"
                          ? "Cada movimento conta a história do seu dinheiro."
                          : "Seu planejamento funciona do seu jeito."}
              </p>
            </div>
            <div className="heading-actions">
              <button
                className="secondary"
                disabled={saving || !f.configured}
                onClick={() => open({ type: "entry", kind: "expense" })}
              >
                <Plus size={17} /> Registrar gasto
              </button>
              <button
                className="primary"
                disabled={saving || !f.configured}
                onClick={() => open({ type: "entry", kind: "income" })}
              >
                <Plus size={17} /> Registrar aporte
              </button>
            </div>
          </div>
          {!f.configured && (
            <div className="setup-banner">
              <div>
                <h2>Comece pelas suas prioridades.</h2>
                <p>
                  Configure os potes e registre o primeiro aporte uma única vez.
                </p>
              </div>
              <button
                className="primary"
                onClick={() => open({ type: "setup" })}
              >
                Configurar planejamento <ChevronRight size={17} />
              </button>
            </div>
          )}
          {(error || localError) && (
            <div className="notice danger" role="alert">
              {localError || error}
            </div>
          )}
          {f.migrationNotes.length > 0 && (
            <details className="notice">
              <summary>
                Dados anteriores preservados · conferir migração
              </summary>
              {f.migrationNotes.map((n, i) => (
                <p key={i}>{n}</p>
              ))}
              <button
                className="text-button"
                onClick={() =>
                  change(
                    (s) => ({ ...s, migrationNotes: [] }),
                    "Conferência registrada",
                  )
                }
              >
                Conferi estas informações
              </button>
            </details>
          )}
          {view === "home" && (
            <>
              <section className="balance-grid">
                <div className="balance-main">
                  <span className="eyebrow">LIVRE PARA GASTAR</span>
                  <strong>{cash(b.free)}</strong>
                  <p>
                    Saldo em conta menos reservas e contas pendentes até este
                    mês.
                  </p>
                  <div>
                    <span>Reservas protegidas</span>
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <div className="balance-card">
                  <span>Saldo em conta</span>
                  <strong>{cash(b.account)}</strong>
                  <small>Entradas menos pagamentos realizados</small>
                  <hr />
                  <div>
                    <span>Reservado nos potes</span>
                    <b>{cash(b.reserved)}</b>
                  </div>
                  <div>
                    <span>Contas pendentes até este mês</span>
                    <b>{cash(b.pending)}</b>
                  </div>
                </div>
              </section>
              {(b.free < 0 || b.buckets.free !== 0) && (
                <div className={`notice ${b.free < 0 ? "danger" : ""}`}>
                  {b.free < 0
                    ? "As reservas e contas pendentes superam o saldo em conta. Revise os compromissos antes de gastar."
                    : b.buckets.free < 0
                      ? `O saldo sem distribuição está em ${cash(b.buckets.free)}. Transfira recursos de um pote de gastos para ajustar o orçamento.`
                      : `Sem distribuição: ${cash(b.buckets.free || 0)}. Você pode transferir esse valor para um pote.`}
                </div>
              )}
              <section className="two-columns">
                <div className="panel">
                  <header className="section-heading">
                    <div>
                      <h2>Próximos pagamentos</h2>
                      <p>
                        {pending.length}{" "}
                        {pending.length === 1
                          ? "conta pendente"
                          : "contas pendentes"}
                      </p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setView("bills")}
                    >
                      Ver contas <ChevronRight size={15} />
                    </button>
                  </header>
                  {pending.slice(0, 4).map((e) => (
                    <div className="bill-row" key={e.id}>
                      <div className="date-box">
                        <b>{e.date.slice(8)}</b>
                        <span>{e.date.slice(5, 7)}</span>
                      </div>
                      <div>
                        <strong>{e.description}</strong>
                        <small className={e.date < today() ? "overdue" : ""}>
                          {e.date < today()
                            ? "Vencida"
                            : e.date === today()
                              ? "Vence hoje"
                              : displayDate(e.date)}
                        </small>
                      </div>
                      <b>{cash(e.cents)}</b>
                      <button
                        className="secondary pay-button"
                        disabled={saving}
                        aria-label={`Pagar ${e.description}`}
                        onClick={() => pay(e)}
                      >
                        <Check size={17} /> Pagar
                      </button>
                    </div>
                  ))}
                  {!pending.length && (
                    <div className="empty-state">
                      Nenhuma conta pendente.
                      <small>
                        Cadastre contas recorrentes para acompanhar os próximos
                        vencimentos.
                      </small>
                    </div>
                  )}
                </div>
                <div className="panel">
                  <header className="section-heading">
                    <div>
                      <h2>Movimento do mês</h2>
                      <p>Valores pagos até hoje</p>
                    </div>
                    <input
                      aria-label="Mês do resumo"
                      type="month"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                    />
                  </header>
                  <div className="month-stat">
                    <span>Aportes</span>
                    <b className="positive">{cash(income)}</b>
                  </div>
                  <div className="month-stat">
                    <span>Gastos</span>
                    <b>{cash(expense)}</b>
                  </div>
                  <div className="month-stat total">
                    <span>Resultado</span>
                    <b>{cash(income - expense)}</b>
                  </div>
                  <div className="spending-bar">
                    <span
                      style={{
                        width: `${income ? Math.min(100, (expense / income) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <p className="muted">
                    {income
                      ? `${Math.round((expense / income) * 100)}% dos aportes utilizados em gastos.`
                      : "Registre um aporte para acompanhar o resultado."}
                  </p>
                </div>
              </section>
              <header className="section-heading">
                <div>
                  <h2>Suas prioridades</h2>
                  <p>Distribuição e saldo de cada pote</p>
                </div>
                <button className="text-button" onClick={() => setView("pots")}>
                  Gerenciar potes <ChevronRight size={15} />
                </button>
              </header>
              <section className="pot-grid">
                {pots.map((p) => (
                  <PotCard
                    key={p.id}
                    pot={p}
                    balance={b.buckets[p.id] || 0}
                    committed={potCommitment(f, p.id)}
                    funded={b.funded[p.id] || 0}
                    spent={
                      p.rollover
                        ? b.spent[p.id] || 0
                        : f.entries
                            .filter(
                              (e) =>
                                !e.deleted &&
                                e.kind === "expense" &&
                                e.status === "paid" &&
                                e.pot === p.id &&
                                e.date.slice(0, 7) === today().slice(0, 7) &&
                                e.date <= today(),
                            )
                            .reduce((s, e) => s + e.cents, 0)
                    }
                    cash={cash}
                    onEdit={() => open({ type: "pot", existing: p })}
                  />
                ))}
              </section>
              <section className="panel">
                <header className="section-heading">
                  <h2>Últimas movimentações</h2>
                  <button
                    className="text-button"
                    onClick={() => setView("ledger")}
                  >
                    Abrir extrato <ChevronRight size={15} />
                  </button>
                </header>
                {f.entries
                  .filter((e) => !e.deleted)
                  .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
                  .slice(0, 5)
                  .map(ledgerRow)}
                {!f.entries.length && (
                  <div className="empty-state">
                    Seu primeiro aporte começa esta história.
                  </div>
                )}
              </section>
            </>
          )}
          {view === "ledger" && (
            <>
              <div className="toolbar">
                <label className="search">
                  <Search size={17} />
                  <input
                    placeholder="Buscar movimentação"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <input
                  aria-label="Mês do extrato"
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
                <select
                  aria-label="Tipo de movimentação"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">Todos os tipos</option>
                  <option value="income">Aportes</option>
                  <option value="expense">Gastos</option>
                  <option value="transfer">Transferências</option>
                  <option value="pending">Pendentes</option>
                </select>
                <select
                  aria-label="Pote do extrato"
                  value={potFilter}
                  onChange={(e) => setPotFilter(e.target.value)}
                >
                  <option value="all">Todos os potes</option>
                  <option value="free">Sem distribuição</option>
                  {f.pots.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Quem fez a movimentação"
                  value={actorFilter}
                  onChange={(e) => setActorFilter(e.target.value)}
                >
                  <option value="all">Todos os perfis</option>
                  <option value="voce">Rhuan</option>
                  <option value="esposa">Anne</option>
                  <option value="sistema">Sistema</option>
                </select>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={showDeleted}
                    onChange={(e) => setShowDeleted(e.target.checked)}
                  />{" "}
                  Excluídos
                </label>
              </div>
              <section className="panel">
                <header className="section-heading">
                  <div>
                    <h2>{filtered.length} movimentações</h2>
                    <p>
                      {month} ·{" "}
                      {f.closedMonths.includes(month)
                        ? "Mês fechado"
                        : "Mês aberto"}
                    </p>
                  </div>
                  <button
                    className="secondary"
                    onClick={() =>
                      exportFile(
                        `extrato-${month}.csv`,
                        "Data;Tipo;Descrição;Valor;Status;Pote;Criado por;Última alteração por\n" +
                          filtered
                            .map((e) =>
                              [
                                e.date,
                                kindNames[e.kind],
                                e.description,
                                money(e.cents),
                                e.status === "paid" ? "Pago" : "Pendente",
                                potName(e.pot),
                                actorName(e.createdBy),
                                actorName(e.updatedBy),
                              ]
                                .map(
                                  (v) =>
                                    '"' +
                                    String(v)
                                      .replace(/"/g, '""')
                                      .replace(/^[=+@-]/, "'") +
                                    '"',
                                )
                                .join(";"),
                            )
                            .join("\n"),
                        "text/csv;charset=utf-8",
                      )
                    }
                  >
                    Exportar CSV
                  </button>
                </header>
                {filtered.map(ledgerRow)}
                {!filtered.length && (
                  <div className="empty-state">
                    Nenhuma movimentação para estes filtros.
                  </div>
                )}
              </section>
              <div className="notice">
                Ao editar um aporte, sua divisão original é mantida e os valores
                são recalculados. Novas porcentagens só valem para novos
                aportes.
              </div>
            </>
          )}
          {view === "pots" && (
            <>
              <div className="toolbar">
                <button
                  className="primary"
                  onClick={() => open({ type: "pot" })}
                >
                  <Plus size={17} /> Novo pote
                </button>
                <button
                  className="secondary"
                  onClick={() => open({ type: "entry", kind: "transfer" })}
                >
                  <ArrowRightLeft size={17} /> Transferir entre potes
                </button>
                <span className="muted">
                  {pots
                    .filter((p) => p.mode === "percent")
                    .reduce((s, p) => s + p.value, 0)}
                  % do restante distribuído
                </span>
              </div>
              <section className="pot-grid">
                {pots.map((p) => (
                  <PotCard
                    key={p.id}
                    pot={p}
                    balance={b.buckets[p.id] || 0}
                    committed={potCommitment(f, p.id)}
                    funded={b.funded[p.id] || 0}
                    spent={
                      p.rollover
                        ? b.spent[p.id] || 0
                        : f.entries
                            .filter(
                              (e) =>
                                !e.deleted &&
                                e.kind === "expense" &&
                                e.status === "paid" &&
                                e.pot === p.id &&
                                e.date.slice(0, 7) === today().slice(0, 7) &&
                                e.date <= today(),
                            )
                            .reduce((s, e) => s + e.cents, 0)
                    }
                    cash={cash}
                    onEdit={() => open({ type: "pot", existing: p })}
                  />
                ))}
              </section>
              <div className="notice">
                Valores fixos são atendidos primeiro, na ordem de prioridade. As
                porcentagens dividem o restante de cada aporte. Transferências
                internas mantêm o saldo em conta.
              </div>
              {f.pots.some((p) => !p.active) && (
                <section className="panel">
                  <h2>Potes arquivados</h2>
                  {f.pots
                    .filter((p) => !p.active)
                    .map((p) => (
                      <div className="simple-row" key={p.id}>
                        <span>
                          {p.name} · {cash(b.buckets[p.id] || 0)}
                        </span>
                        <button
                          className="text-button"
                          onClick={() => open({ type: "pot", existing: p })}
                        >
                          Editar e reativar
                        </button>
                      </div>
                    ))}
                </section>
              )}
            </>
          )}
          {view === "bills" && (
            <>
              <div className="toolbar">
                <button
                  className="primary"
                  onClick={() => open({ type: "bill" })}
                >
                  <Plus size={17} /> Conta recorrente ou parcelada
                </button>
                <button
                  className="secondary"
                  onClick={() => open({ type: "entry", kind: "expense" })}
                >
                  Gasto avulso pendente
                </button>
              </div>
              <section className="panel">
                <header className="section-heading">
                  <h2>Pagamentos pendentes</h2>
                  <span className="muted">
                    Contas pendentes comprometem o pote; ao pagar, viram gastos
                  </span>
                </header>
                {pending.map(ledgerRow)}
                {!pending.length && (
                  <div className="empty-state">Tudo em dia por aqui.</div>
                )}
              </section>
              <section className="panel">
                <h2>Pagamentos deste mês</h2>
                {f.entries
                  .filter(
                    (e) =>
                      !e.deleted &&
                      e.kind === "expense" &&
                      e.status === "paid" &&
                      e.date.slice(0, 7) === today().slice(0, 7) &&
                      e.date <= today(),
                  )
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map(ledgerRow)}
                {!f.entries.some(
                  (e) =>
                    !e.deleted &&
                    e.kind === "expense" &&
                    e.status === "paid" &&
                    e.date.slice(0, 7) === today().slice(0, 7) &&
                    e.date <= today(),
                ) && (
                  <div className="empty-state">
                    Nenhum pagamento registrado neste mês.
                  </div>
                )}
              </section>
              <section className="panel">
                <h2>Automatizações cadastradas</h2>
                {f.recurrences.map((r) => (
                  <div className="simple-row" key={r.id}>
                    <div>
                      <strong>{r.name}</strong>
                      <small>
                        {cash(r.cents)} ·{" "}
                        {r.count ? `${r.count} parcelas` : "Mensal"} · Desde{" "}
                        {displayDate(r.start)} ·{" "}
                        {r.active ? "Ativa" : "Pausada"}
                      </small>
                    </div>
                    <button
                      className="icon-button"
                      aria-label="Editar conta"
                      onClick={() => open({ type: "bill", existing: r })}
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                ))}
                {!f.recurrences.length && (
                  <div className="empty-state">
                    Cadastre uma conta. Os vencimentos serão gerados
                    automaticamente ao abrir o app.
                  </div>
                )}
              </section>
            </>
          )}
          {view === "goals" && (
            <>
              <div className="toolbar">
                <button
                  className="primary"
                  onClick={() => open({ type: "goal" })}
                >
                  <Plus size={17} /> Nova meta
                </button>
                <button
                  className="secondary"
                  onClick={() => open({ type: "entry", kind: "transfer" })}
                >
                  Contribuição extra
                </button>
              </div>
              <section className="goal-grid">
                {f.goals.map((g) => {
                  const accumulated = (b.buckets[g.pot] || 0) + g.opening;
                  const remaining = Math.max(0, g.target - accumulated);
                  const since = monthDate(today(), -3);
                  const contributions = f.entries
                    .filter(
                      (e) =>
                        !e.deleted &&
                        e.status === "paid" &&
                        e.date >= since &&
                        e.date <= today(),
                    )
                    .reduce(
                      (s, e) =>
                        s +
                        (e.kind === "income"
                          ? e.allocations[g.pot] || 0
                          : e.kind === "transfer" && e.destination === g.pot
                            ? e.cents
                            : 0),
                      0,
                    );
                  const average = contributions / 3;
                  const pct = Math.max(
                    0,
                    Math.min(100, (accumulated / g.target) * 100),
                  );
                  return (
                    <article className="goal-card" key={g.id}>
                      <header>
                        <span className="entry-icon transfer">
                          <Target size={20} />
                        </span>
                        <button
                          className="icon-button"
                          aria-label="Editar meta"
                          onClick={() => open({ type: "goal", existing: g })}
                        >
                          <Pencil size={16} />
                        </button>
                      </header>
                      <h2>{g.name}</h2>
                      <strong>{cash(accumulated)}</strong>
                      <p>
                        de {cash(g.target)} · {pct.toFixed(0)}%
                      </p>
                      <div className="spending-bar">
                        <span style={{ width: `${pct}%` }} />
                      </div>
                      <div className="goal-detail">
                        <span>Falta</span>
                        <b>{cash(remaining)}</b>
                      </div>
                      <div className="goal-detail">
                        <span>Prazo desejado</span>
                        <b>{displayDate(g.deadline)}</b>
                      </div>
                      <small>
                        {remaining === 0
                          ? "Meta alcançada. Edite seu pote para redistribuir os próximos aportes."
                          : average > 0
                            ? `Estimativa: ${Math.ceil(remaining / average)} meses, pela média de contribuições dos últimos 3 meses.`
                            : "Faça contribuições para obter uma previsão."}
                      </small>
                      {g.opening > 0 && (
                        <small>
                          Inclui {cash(g.opening)} de saldo anterior externo ao
                          saldo em conta.
                        </small>
                      )}
                      <button
                        className="secondary"
                        onClick={() =>
                          open({
                            type: "entry",
                            kind: "transfer",
                            existing: {
                              ...entry(
                                {
                                  kind: "transfer",
                                  cents: 1,
                                  date: today(),
                                  description: `Contribuição · ${g.name}`,
                                  pot: "free",
                                  destination: g.pot,
                                },
                                f.pots,
                              ),
                              id: "",
                            },
                          })
                        }
                      >
                        Contribuir
                      </button>
                    </article>
                  );
                })}
              </section>
              {!f.goals.length && (
                <div className="panel empty-state">
                  Qual é sua próxima conquista? Crie uma meta para começar.
                </div>
              )}
              <section className="panel">
                <header className="section-heading">
                  <div>
                    <h2>Patrimônio externo</h2>
                    <p>
                      Bens e investimentos informativos. Não alteram o saldo em
                      conta.
                    </p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => open({ type: "asset" })}
                  >
                    Adicionar bem
                  </button>
                </header>
                {f.assets.map((a) => (
                  <div className="simple-row" key={a.id}>
                    <span>{a.name}</span>
                    <b>{cash(a.cents)}</b>
                    <button
                      className="icon-button"
                      aria-label="Remover bem"
                      onClick={() =>
                        change((s) => ({
                          ...s,
                          assets: s.assets.filter((x) => x.id !== a.id),
                        }))
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <div className="month-stat total">
                  <span>Total informado</span>
                  <b>{cash(f.assets.reduce((s, a) => s + a.cents, 0))}</b>
                </div>
              </section>
            </>
          )}
          {view === "settings" && (
            <>
              <section className="panel account-panel">
                <div>
                  <p className="eyebrow">PERFIL DESTA SESSÃO</p>
                  <h2>{actorName(actor)}</h2>
                  <p className="muted">
                    As movimentações desta sessão registram seu perfil.
                  </p>
                </div>
                <button className="secondary" onClick={onLogout}>
                  <LogOut size={17} /> Trocar perfil ou sair
                </button>
              </section>
              <section className="panel">
                <h2>Fechamento mensal</h2>
                <p className="muted">
                  Confira o mês antes de fechar. Potes que não acumulam devolvem
                  as sobras para o saldo sem distribuição. Meses fechados
                  bloqueiam alterações retroativas.
                </p>
                <div className="toolbar">
                  <input
                    type="month"
                    aria-label="Mês para fechamento"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  />
                  {f.closedMonths.includes(month) ? (
                    <button
                      className="secondary"
                      onClick={() =>
                        change((s) => {
                          if (s.closedMonths.some((m) => m > month))
                            throw new Error(
                              "Reabra primeiro os meses posteriores a este.",
                            );
                          return {
                            ...s,
                            closedMonths: s.closedMonths.filter(
                              (m) => m !== month,
                            ),
                            entries: s.entries.filter(
                              (e) => e.source !== `close:${month}`,
                            ),
                          };
                        }, "Mês reaberto")
                      }
                    >
                      Reabrir mês
                    </button>
                  ) : (
                    <button
                      className="primary"
                      onClick={() =>
                        change(
                          (s) => closeMonth(s, month),
                          "Mês fechado e sobras redistribuídas",
                        )
                      }
                    >
                      Fechar mês
                    </button>
                  )}
                  <button
                    className="secondary"
                    onClick={() => {
                      const rows = currentEntries.filter(
                        (e) => e.status === "paid",
                      );
                      exportFile(
                        `resumo-${month}.json`,
                        JSON.stringify(
                          {
                            month,
                            aportes:
                              rows
                                .filter((e) => e.kind === "income")
                                .reduce((s, e) => s + e.cents, 0) / 100,
                            gastos:
                              rows
                                .filter((e) => e.kind === "expense")
                                .reduce((s, e) => s + e.cents, 0) / 100,
                            saldo:
                              balances(
                                f,
                                new Date(
                                  Date.parse(
                                    monthDate(`${month}-01`, 1) + "T12:00:00Z",
                                  ) - 86400000,
                                )
                                  .toISOString()
                                  .slice(0, 10),
                              ).account / 100,
                            movimentacoes: rows,
                          },
                          null,
                          2,
                        ),
                      );
                    }}
                  >
                    Exportar resumo
                  </button>
                </div>
                <div className="month-stat">
                  <span>Aportes do mês</span>
                  <b>{cash(income)}</b>
                  <span>Gastos do mês</span>
                  <b>{cash(expense)}</b>
                </div>
              </section>
              <section className="panel">
                <header className="section-heading">
                  <div>
                    <h2>Regras de categoria</h2>
                    <p>
                      Sugestões aplicadas ao digitar a descrição de um gasto
                    </p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => open({ type: "rule" })}
                  >
                    Nova regra
                  </button>
                </header>
                {f.rules.map((r) => (
                  <div className="simple-row" key={r.id}>
                    <span>
                      Contém “{r.text}” → {potName(r.pot)}
                    </span>
                    <button
                      className="icon-button"
                      aria-label="Excluir regra"
                      onClick={() =>
                        change((s) => ({
                          ...s,
                          rules: s.rules.filter((x) => x.id !== r.id),
                        }))
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {!f.rules.length && (
                  <p className="muted">
                    O histórico também sugere categorias de descrições iguais.
                  </p>
                )}
              </section>
              <section className="panel">
                <h2>Backup e recuperação</h2>
                <p className="muted">
                  Exporte antes de importar. A recuperação substitui o
                  financeiro atual e preserva uma cópia local anterior.
                </p>
                <div className="toolbar">
                  <button
                    className="secondary"
                    onClick={() =>
                      exportFile(
                        `imperio-backup-${today()}.json`,
                        JSON.stringify(
                          {
                            exportedAt: new Date().toISOString(),
                            financeV2: f,
                          },
                          null,
                          2,
                        ),
                      )
                    }
                  >
                    <Download size={17} /> Exportar backup
                  </button>
                  <label className="secondary file-button">
                    Importar backup
                    <input
                      type="file"
                      accept=".json"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        try {
                          if (file.size > 900000)
                            throw new Error(
                              "O arquivo excede o limite seguro de importação.",
                            );
                          const raw = JSON.parse(await file.text());
                          if (!raw.financeV2 && !Array.isArray(raw.potesAtivos))
                            throw new Error(
                              "Este arquivo não é um backup financeiro do Império.",
                            );
                          const restored = migrate(raw);
                          validateFinance(restored);
                          if (
                            !window.confirm(
                              "Substituir os dados atuais por este backup? Uma cópia anterior será baixada antes da recuperação.",
                            )
                          )
                            return;
                          exportFile(
                            `imperio-antes-importacao-${today()}.json`,
                            JSON.stringify({ financeV2: f }, null, 2),
                          );
                          storage.setItem(
                            "imperio_before_restore",
                            JSON.stringify(f),
                          );
                          await change(
                            (s) => ({ ...restored, revision: s.revision }),
                            "Backup recuperado",
                          );
                        } catch (e) {
                          setLocalError((e as Error).message);
                        }
                      }}
                    />
                  </label>
                </div>
              </section>
              <section className="panel reset-panel">
                <div>
                  <h2>Recomeçar o planejamento</h2>
                  <p className="muted">
                    Volte à configuração inicial de potes e aporte. Uma cópia
                    anterior será guardada antes do reset.
                  </p>
                </div>
                <div className="toolbar">
                  <button
                    className="reset-button"
                    onClick={() => open({ type: "reset" })}
                  >
                    <RotateCcw size={17} /> Resetar e configurar do zero
                  </button>
                  <button
                    className="secondary"
                    onClick={async () => {
                      try {
                        const previous = await lastReset();
                        if (
                          !window.confirm(
                            "Recuperar o planejamento anterior ao último reset?",
                          )
                        )
                          return;
                        exportFile(
                          `imperio-antes-recuperacao-${today()}.json`,
                          JSON.stringify({ financeV2: f }, null, 2),
                        );
                        await change(
                          (s) => ({ ...previous, revision: s.revision }),
                          "Planejamento anterior recuperado",
                        );
                      } catch (e) {
                        setLocalError((e as Error).message);
                      }
                    }}
                  >
                    Recuperar último reset
                  </button>
                </div>
              </section>
              <section className="panel">
                <h2>Como seus valores são calculados</h2>
                <p className="muted">
                  Aporte aumenta o saldo em conta. Gasto pago diminui o saldo.
                  Reserva e transferência entre potes não retiram dinheiro da
                  conta. Contas pendentes até o mês atual reduzem o valor livre
                  para gastar. Aportes futuros aparecem no extrato, mas só
                  entram nos saldos na data informada.
                </p>
                <p className="muted">
                  Os percentuais ficam registrados em cada aporte. Valores fixos
                  são distribuídos por aporte, antes das porcentagens. As contas
                  recorrentes são geradas enquanto o app está aberto; não há
                  notificações externas nem débito automático.
                </p>
              </section>
            </>
          )}
        </main>
        <nav className="mobile-nav">
          {(Object.keys(labels) as View[]).map((v) => {
            const Icon = icons[v];
            return (
              <button
                className={view === v ? "active" : ""}
                key={v}
                onClick={() => setView(v)}
              >
                <Icon size={19} />
                <span>
                  {v === "settings"
                    ? "Ajustes"
                    : v === "home"
                      ? "Início"
                      : labels[v]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
      {paymentUndo && (
        <div className="notice payment-undo" role="status">
          <span>Pagamento de {paymentUndo.before.description} registrado.</span>
          <button
            className="text-button"
            disabled={saving}
            onClick={undoPayment}
          >
            Desfazer pagamento
          </button>
        </div>
      )}
      {payment && (
        <PaymentDialog
          bill={payment}
          saving={saving}
          potName={potName(payment.pot)}
          error={localError}
          close={() => {
            if (!saving) setPayment(null);
          }}
          confirm={async (cents, date) => {
            const ok = await change(
              (s) => payBill(s, payment.id, cents, date),
              "Pagamento registrado",
            );
            if (ok) {
              setPaymentUndo({ before: payment, cents, date });
              setPayment(null);
            }
          }}
        />
      )}
      {(toast || undo) && (
        <div className="toast" role="status">
          <Check size={17} />
          <span>{toast || "Lançamento excluído"}</span>
          {undo && <button onClick={() => restore(undo)}>Desfazer</button>}
          <button
            aria-label="Fechar aviso"
            onClick={() => {
              setToast("");
              setUndo(null);
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {modal?.type === "reset" ? (
        <ResetDialog
          saving={saving}
          count={f.entries.filter((e) => !e.deleted).length}
          close={() => setModal(null)}
          confirm={async () => {
            exportFile(
              `imperio-antes-reset-${today()}.json`,
              JSON.stringify(
                { financeV2: f, exportedAt: new Date().toISOString() },
                null,
                2,
              ),
            );
            const ok = await change(
              resetFinance,
              "Planejamento reiniciado. A cópia anterior está disponível em Ajustes.",
              true,
            );
            if (ok) {
              setModal(null);
              setView("home");
              setUndo(null);
            }
          }}
        />
      ) : (
        modal && (
          <FinanceModal
            modal={modal}
            f={f}
            saving={saving}
            cash={cash}
            close={() => setModal(null)}
            commit={async (fn) => {
              const ok = await change(fn);
              if (ok) setModal(null);
              return ok;
            }}
          />
        )
      )}
    </div>
  );
}
function PotCard({
  pot: p,
  balance,
  committed,
  funded,
  spent,
  cash,
  onEdit,
}: {
  pot: Pot;
  balance: number;
  committed: number;
  funded: number;
  spent: number;
  cash: (v: number) => string;
  onEdit: () => void;
}) {
  const available = balance - committed;
  const budget = balance + spent;
  const used =
    budget > 0 ? (spent / budget) * 100 : balance <= 0 && spent > 0 ? 100 : 0;
  return (
    <article className="pot-card">
      <header>
        <span className="pot-dot" style={{ background: p.color }} />
        <span>
          {p.reserve ? "Reserva" : "Gastos"} ·{" "}
          {p.mode === "percent"
            ? `${p.value}%`
            : money(Math.round(p.value * 100)) + " / aporte"}
        </span>
        <button
          className="icon-button"
          aria-label={`Editar ${p.name}`}
          onClick={onEdit}
        >
          <Pencil size={14} />
        </button>
      </header>
      <div className="pot-art">
        <PotSymbol symbol={potSymbol(p)} />
        <span className="pot-percentage">
          {p.mode === "percent" ? `${p.value}%` : "Fixo"}
        </span>
      </div>
      <h3>{p.name}</h3>
      <strong>{cash(Math.max(0, available))}</strong>
      <small>
        {p.reserve ? "Guardado após compromissos" : "Disponível para gastar"}
      </small>
      <div className="pot-commitments">
        <span>
          Saldo do pote <b>{cash(balance)}</b>
        </span>
        <span>
          Comprometido <b>{cash(committed)}</b>
        </span>
        <small>Contas vencidas e do mês atual</small>
        {available < 0 && (
          <span className="overdue">
            Faltam {cash(-available)} para cobrir os compromissos.
          </span>
        )}
      </div>
      <div className="spending-bar">
        <span
          style={{
            width: `${Math.min(100, Math.max(0, used))}%`,
            background: used >= 100 ? "#be5145" : p.color,
          }}
        />
      </div>
      <footer>
        <span>
          {p.rollover
            ? "Saldo acumulativo"
            : "Sobra redistribuída no fechamento"}
        </span>
        {!p.reserve && used >= 80 && (
          <b className={used >= 100 ? "overdue" : ""}>
            {used >= 100 ? "Limite atingido" : "80% utilizado"}
          </b>
        )}
      </footer>
    </article>
  );
}
function FinanceModal({
  modal,
  f,
  saving,
  cash,
  close,
  commit,
}: {
  modal: Exclude<Modal, null | { type: "reset" }>;
  f: Finance;
  saving: boolean;
  cash: (v: number) => string;
  close: () => void;
  commit: (fn: (s: Finance) => Finance) => Promise<boolean>;
}) {
  const old = modal.type === "entry" ? modal.existing : null;
  const p = modal.type === "pot" ? modal.existing : null;
  const r = modal.type === "bill" ? modal.existing : null;
  const g = modal.type === "goal" ? modal.existing : null;
  const [description, setDescription] = useState(
    old?.description || p?.name || r?.name || g?.name || "",
  );
  const [value, setValue] = useState(
    old
      ? decimal(old.cents)
      : r
        ? decimal(r.cents)
        : g
          ? decimal(g.target)
          : p
            ? String(p.value)
            : "",
  );
  const [date, setDate] = useState(
    old?.date || r?.start || g?.deadline || today(),
  );
  const [pot, setPot] = useState(old?.pot || r?.pot || g?.pot || "free"),
    [dest, setDest] = useState(old?.destination || "");
  const [status, setStatus] = useState(old?.status || "paid"),
    [mode, setMode] = useState<"percent" | "fixed">(p?.mode || "percent"),
    [reserve, setReserve] = useState(p?.reserve || false),
    [rollover, setRollover] = useState(p?.rollover ?? true),
    [priority, setPriority] = useState(p?.priority ?? f.pots.length),
    [active, setActive] = useState(p?.active ?? r?.active ?? true);
  const [count, setCount] = useState(r?.count || 0),
    [goalPct, setGoalPct] = useState(
      g ? f.pots.find((p) => p.id === g.pot)?.value || 0 : 0,
    ),
    [opening, setOpening] = useState(g ? decimal(g.opening) : "0");
  const [symbol, setSymbol] = useState(p ? potSymbol(p) : "wallet");
  const [ruleText, setRuleText] = useState(""),
    [formError, setFormError] = useState(""),
    [suggestion, setSuggestion] = useState("");
  const [setupPots, setSetupPots] = useState<Pot[]>(structuredClone(f.pots));
  const existingPolicy = old?.id && old.policy.length ? old.policy : f.pots;
  let preview: Record<string, number> = {};
  try {
    if (
      (modal.type === "entry" && modal.kind === "income") ||
      modal.type === "setup"
    )
      preview = allocate(
        parseMoney(value),
        modal.type === "setup" ? setupPots : existingPolicy,
      );
  } catch {}
  const title =
    modal.type === "entry"
      ? `${old?.id ? "Editar" : "Registrar"} ${kindNames[modal.kind].toLowerCase()}`
      : modal.type === "pot"
        ? p
          ? "Editar pote"
          : "Novo pote"
        : modal.type === "bill"
          ? r
            ? "Editar automatização"
            : "Conta recorrente ou parcelada"
          : modal.type === "goal"
            ? g
              ? "Editar meta"
              : "Nova meta"
            : modal.type === "setup"
              ? "Seu primeiro aporte"
              : modal.type === "asset"
                ? "Adicionar patrimônio externo"
                : "Nova regra de categoria";
  function suggest(text: string) {
    setDescription(text);
    if (modal.type !== "entry" || modal.kind !== "expense") return;
    const rule = f.rules.find((r) =>
      text.toLowerCase().includes(r.text.toLowerCase()),
    );
    const last = [...f.entries]
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
      .find(
        (e) =>
          !e.deleted &&
          e.kind === "expense" &&
          e.description.toLowerCase() === text.toLowerCase(),
      );
    const candidate = rule?.pot || last?.pot;
    if (candidate) {
      setPot(candidate);
      setSuggestion(
        "Categoria sugerida pelo seu histórico ou pelas suas regras. Você pode alterar.",
      );
    } else setSuggestion("");
  }
  async function submit(ev: FormEvent) {
    ev.preventDefault();
    setFormError("");
    try {
      const amount = ["entry", "setup", "bill", "goal", "asset"].includes(
        modal.type,
      )
        ? parseMoney(value)
        : 0;
      if (modal.type === "entry") {
        if (
          f.closedMonths.some((m) => date.slice(0, 7) <= m) ||
          (old?.id && f.closedMonths.some((m) => old.date.slice(0, 7) <= m))
        )
          throw new Error(
            "Reabra os meses fechados antes de alterar um lançamento deste período.",
          );
        if (modal.kind === "transfer" && (!dest || pot === dest))
          throw new Error("Escolha potes diferentes para origem e destino.");
        const candidate = entry(
          {
            ...(old?.id ? old : {}),
            id: old?.id || uid(),
            kind: modal.kind,
            cents: amount,
            date,
            description,
            pot,
            destination: dest,
            status:
              modal.kind === "expense" ? (status as Entry["status"]) : "paid",
            policy: modal.kind === "income" ? existingPolicy : [],
            source: old?.id ? old.source : "",
          },
          f.pots,
        );
        const duplicates = f.entries.some(
          (e) =>
            !e.deleted &&
            e.id !== candidate.id &&
            e.kind === candidate.kind &&
            e.cents === amount &&
            e.date === date &&
            e.description.toLowerCase() === description.trim().toLowerCase(),
        );
        if (
          duplicates &&
          !window.confirm(
            "Já existe uma movimentação com a mesma descrição, valor e data. Registrar mesmo assim?",
          )
        )
          return;

        if (
          modal.kind === "transfer" &&
          (balances(
            { ...f, entries: f.entries.filter((e) => e.id !== candidate.id) },
            date,
          ).buckets[pot] || 0) < amount
        )
          throw new Error(
            "O saldo do pote de origem na data escolhida não cobre a transferência.",
          );
        await commit((s) => ({
          ...s,
          entries: [
            ...s.entries.filter((e) => e.id !== candidate.id),
            candidate,
          ],
        }));
      }
      if (modal.type === "pot") {
        const number = Number(value.replace(",", "."));
        if (!Number.isFinite(number) || number < 0)
          throw new Error("Informe um valor válido.");
        const updated: Pot = {
          id: p?.id || uid(),
          name: description.trim(),
          value: number,
          mode,
          reserve,
          rollover,
          priority,
          active,
          color: p?.color || "#8296bb",
          icon: symbol,
        };
        const next = [...f.pots.filter((x) => x.id !== updated.id), updated];
        validatePots(next);
        await commit((s) => ({
          ...s,
          pots: [...s.pots.filter((x) => x.id !== updated.id), updated],
        }));
      }
      if (modal.type === "setup") {
        validatePots(setupPots);
        const first = entry(
          {
            id: uid(),
            kind: "income",
            description: "Aporte inicial",
            cents: amount,
            date,
          },
          setupPots,
        );
        await commit((s) => ({
          ...s,
          configured: true,
          pots: setupPots,
          entries: [...s.entries, first],
        }));
      }
      if (modal.type === "bill") {
        if (!description.trim()) throw new Error("Informe o nome da conta.");
        if (!Number.isInteger(count) || count < 0 || count > 1200)
          throw new Error("Informe de 0 a 1.200 parcelas.");
        if (f.closedMonths.some((m) => date.slice(0, 7) <= m))
          throw new Error(
            "A primeira parcela não pode estar em um mês fechado.",
          );
        const bill: Recurrence = {
          id: r?.id || uid(),
          name: description.trim(),
          cents: amount,
          pot,
          start: date,
          count,
          active,
        };
        await commit((s) =>
          generateRecurring({
            ...s,
            recurrences: [
              ...s.recurrences.filter((x) => x.id !== bill.id),
              bill,
            ],
          }),
        );
      }
      if (modal.type === "goal") {
        if (!description.trim()) throw new Error("Informe o nome da meta.");
        const potId = g?.pot || `goal-${uid()}`;
        const updatedPot: Pot = {
          ...(f.pots.find((p) => p.id === potId) || {
            id: potId,
            mode: "percent" as const,
            rollover: true,
            priority: f.pots.length,
            color: "#8472a0",
          }),
          name: description.trim(),
          mode: "percent",
          value: goalPct,
          reserve: true,
          active: true,
        };
        const nextPots = [...f.pots.filter((p) => p.id !== potId), updatedPot];
        validatePots(nextPots);
        const openingCents =
          opening === "0" || opening === "0.00" || opening === "0,00"
            ? 0
            : parseMoney(opening);
        const goal: Goal = {
          id: g?.id || uid(),
          name: description.trim(),
          target: amount,
          pot: potId,
          deadline: date,
          opening: openingCents,
        };
        await commit((s) => ({
          ...s,
          pots: [...s.pots.filter((p) => p.id !== potId), updatedPot],
          goals: [...s.goals.filter((x) => x.id !== goal.id), goal],
        }));
      }
      if (modal.type === "rule") {
        if (!ruleText.trim() || pot === "free")
          throw new Error("Informe uma palavra e escolha um pote.");
        const rule = { id: uid(), text: ruleText.trim(), pot };
        await commit((s) => ({ ...s, rules: [...s.rules, rule] }));
      }
      if (modal.type === "asset") {
        if (!description.trim()) throw new Error("Informe o nome do bem.");
        const asset = { id: uid(), name: description.trim(), cents: amount };
        await commit((s) => ({ ...s, assets: [...s.assets, asset] }));
      }
    } catch (e) {
      setFormError((e as Error).message);
    }
  }
  const options = (
    <>
      <option value="free">Sem distribuição</option>
      {f.pots
        .filter((p) => p.active || p.id === pot || p.id === dest)
        .map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
    </>
  );
  return (
    <ModalShell title={title} onClose={close}>
      <form onSubmit={submit} className="modal-form">
        {formError && (
          <div className="notice danger" role="alert">
            {formError}
          </div>
        )}
        {modal.type === "setup" && (
          <>
            <p className="muted">
              Defina a distribuição e informe o dinheiro que já está na conta.
              Não há valor estimado obrigatório.
            </p>
            <div className="setup-pots">
              {setupPots.map((p, i) => (
                <div className="setup-pot" key={p.id}>
                  <PotSymbol symbol={potSymbol(p)} />
                  <PercentageControl
                    label={`${p.name} percentual`}
                    value={p.value}
                    color={p.color}
                    maxAllowed={
                      100 -
                      setupPots
                        .filter((_, j) => j !== i)
                        .reduce((sum, p) => sum + p.value, 0)
                    }
                    onChange={(value) =>
                      setSetupPots(
                        setupPots.map((x, j) =>
                          j === i ? { ...x, value } : x,
                        ),
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <p className="muted">
              Total: {setupPots.reduce((s, p) => s + p.value, 0)}% · O restante
              fica sem distribuição.
            </p>
          </>
        )}
        {modal.type !== "setup" && modal.type !== "rule" && (
          <Field label={modal.type === "entry" ? "Descrição" : "Nome"}>
            <input
              autoFocus
              required
              value={description}
              onChange={(e) => suggest(e.target.value)}
              maxLength={120}
              placeholder={
                modal.type === "entry"
                  ? "Ex.: vendas Mercado Livre"
                  : "Um nome fácil de identificar"
              }
            />
          </Field>
        )}
        {modal.type === "rule" && (
          <Field label="Descrição contém">
            <input
              autoFocus
              required
              value={ruleText}
              onChange={(e) => setRuleText(e.target.value)}
              placeholder="Ex.: Uber"
              maxLength={80}
            />
          </Field>
        )}
        {modal.type === "pot" && mode === "percent" ? (
          <PercentageControl
            label="Porcentagem do pote"
            value={Number(value.replace(",", ".")) || 0}
            maxAllowed={
              100 -
              f.pots
                .filter(
                  (x) => x.active && x.mode === "percent" && x.id !== p?.id,
                )
                .reduce((sum, x) => sum + x.value, 0)
            }
            onChange={(n) => setValue(String(n))}
          />
        ) : (
          modal.type !== "rule" && (
            <Field
              label={
                modal.type === "pot"
                  ? mode === "percent"
                    ? "Porcentagem do restante (%)"
                    : "Valor fixo por aporte (R$)"
                  : modal.type === "goal"
                    ? "Valor da meta (R$)"
                    : modal.type === "bill"
                      ? "Valor de cada parcela (R$)"
                      : "Valor (R$)"
              }
            >
              <input
                inputMode="decimal"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0,00"
              />
            </Field>
          )
        )}
        {["entry", "setup", "bill", "goal"].includes(modal.type) && (
          <Field
            label={
              modal.type === "bill"
                ? "Primeiro vencimento"
                : modal.type === "goal"
                  ? "Prazo desejado"
                  : "Data da movimentação"
            }
          >
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        )}
        {(modal.type === "rule" ||
          modal.type === "bill" ||
          (modal.type === "entry" && modal.kind !== "income")) && (
          <Field
            label={
              modal.type === "entry" && modal.kind === "transfer"
                ? "Pote de origem"
                : "Pote"
            }
          >
            <select
              value={pot}
              onChange={(e) => {
                setPot(e.target.value);
                setSuggestion("");
              }}
            >
              {options}
            </select>
          </Field>
        )}
        {suggestion && <small className="muted">{suggestion}</small>}
        {modal.type === "entry" && modal.kind === "expense" && (
          <Field label="Situação">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "paid" | "pending")}
            >
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
            </select>
          </Field>
        )}
        {modal.type === "entry" && modal.kind === "transfer" && (
          <>
            <Field label="Pote de destino">
              <select
                required
                value={dest}
                onChange={(e) => setDest(e.target.value)}
              >
                <option value="">Escolha o destino</option>
                {options}
              </select>
            </Field>
            <p className="muted">
              Transferência interna: não altera o saldo em conta.
            </p>
          </>
        )}
        {modal.type === "entry" && old?.id && (
          <div className="notice">
            Registrado em{" "}
            {new Date(old.recordedAt).toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
            })}
            .{" "}
            {modal.kind === "income"
              ? "Este aporte mantém os percentuais originais."
              : ""}
          </div>
        )}
        {modal.type === "pot" && (
          <>
            <Field label="Forma de distribuição">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as "percent" | "fixed")}
              >
                <option value="percent">Porcentagem do restante</option>
                <option value="fixed">Valor fixo por aporte</option>
              </select>
            </Field>
            <div
              className="symbol-picker"
              role="group"
              aria-label="Símbolo do pote"
            >
              {symbols.map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  className={symbol === key ? "selected" : ""}
                  aria-label={`Símbolo ${label}`}
                  aria-pressed={symbol === key}
                  onClick={() => setSymbol(key)}
                >
                  <PotSymbol symbol={key} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <Field label="Prioridade dos valores fixos (menor vem primeiro)">
              <input
                type="number"
                min="0"
                max="999"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </Field>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={reserve}
                onChange={(e) => setReserve(e.target.checked)}
              />{" "}
              Reserva protegida do valor livre para gastar
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={rollover}
                onChange={(e) => setRollover(e.target.checked)}
              />{" "}
              Acumular sobras entre meses
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />{" "}
              Participar dos novos aportes
            </label>
            <div className="notice">
              Novas configurações valem apenas para novos aportes. Desativar
              preserva o saldo e o histórico deste pote.
            </div>
            <div className="allocation-preview">
              <strong>Simulação de um aporte de R$ 1.000</strong>
              {(() => {
                try {
                  const next = [
                    ...f.pots.filter((x) => x.id !== p?.id),
                    {
                      id: p?.id || "preview",
                      name: description || "Novo pote",
                      value: Number(value.replace(",", ".")) || 0,
                      mode,
                      reserve,
                      rollover,
                      priority,
                      active,
                      color: "#13765e",
                    },
                  ];
                  const parts = allocate(100000, next);
                  return Object.entries(parts)
                    .filter(([, v]) => v > 0)
                    .map(([id, v]) => (
                      <div key={id}>
                        <span>
                          {next.find((p) => p.id === id)?.name ||
                            "Sem distribuição"}
                        </span>
                        <b>{cash(v)}</b>
                      </div>
                    ));
                } catch (e) {
                  return <p className="overdue">{(e as Error).message}</p>;
                }
              })()}
            </div>
          </>
        )}
        {modal.type === "bill" && (
          <>
            <Field label="Número de parcelas (0 = mensal contínua)">
              <input
                type="number"
                min="0"
                max="1200"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </Field>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />{" "}
              Gerar vencimentos automaticamente
            </label>
            <div className="notice">
              Os próximos vencimentos são gerados ao abrir o app, até o mês
              atual. Pausar não exclui pendências existentes. Alterações no
              cadastro valem para parcelas ainda não geradas; edite pendências
              existentes no extrato.
            </div>
          </>
        )}
        {modal.type === "goal" && (
          <>
            <PercentageControl
              label="Percentual automático da meta"
              value={goalPct}
              maxAllowed={
                100 -
                f.pots
                  .filter(
                    (p) => p.active && p.mode === "percent" && p.id !== g?.pot,
                  )
                  .reduce((sum, p) => sum + p.value, 0)
              }
              onChange={setGoalPct}
            />
            <Field label="Saldo anterior externo à conta (R$)">
              <input
                inputMode="decimal"
                value={opening}
                onChange={(e) => setOpening(e.target.value)}
              />
            </Field>
            <div className="notice">
              A meta terá um pote próprio. Seu percentual participa do limite
              total de 100%; reduza outros potes se necessário. O saldo anterior
              é informativo e não altera a conta atual.
            </div>
          </>
        )}
        {Object.keys(preview).length > 0 && (
          <div className="allocation-preview">
            <strong>Distribuição deste aporte</strong>
            {Object.entries(preview).map(([id, v]) => (
              <div key={id}>
                <span>
                  {(modal.type === "setup" ? setupPots : existingPolicy).find(
                    (p) => p.id === id,
                  )?.name || "Sem distribuição"}
                </span>
                <b>{cash(v)}</b>
              </div>
            ))}
          </div>
        )}
        <footer className="modal-footer">
          <button type="button" className="secondary" onClick={close}>
            Cancelar
          </button>
          <button className="primary" type="submit" disabled={saving}>
            {saving
              ? "Salvando…"
              : modal.type === "setup"
                ? "Começar com este aporte"
                : "Salvar"}
          </button>
        </footer>
      </form>
    </ModalShell>
  );
}

function ResetDialog({
  saving,
  count,
  close,
  confirm,
}: {
  saving: boolean;
  count: number;
  close: () => void;
  confirm: () => Promise<void>;
}) {
  const [text, setText] = useState("");
  return (
    <ModalShell title="Recomeçar do zero" onClose={close}>
      <form
        className="modal-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (text === "REINICIAR") await confirm();
        }}
      >
        <p className="muted">
          O planejamento atual, com {count} movimentações, será substituído pela
          configuração inicial. Uma cópia ficará guardada para recuperação e um
          backup será oferecido para download.
        </p>
        <div className="notice">
          Você voltará a escolher as porcentagens dos potes e registrar um único
          aporte inicial.
        </div>
        <Field label="Digite REINICIAR para confirmar">
          <input
            autoFocus
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="REINICIAR"
          />
        </Field>
        <footer className="modal-footer">
          <button className="secondary" type="button" onClick={close}>
            Cancelar
          </button>
          <button
            className="reset-button"
            type="submit"
            disabled={saving || text !== "REINICIAR"}
          >
            {saving ? "Guardando cópia…" : "Confirmar reset"}
          </button>
        </footer>
      </form>
    </ModalShell>
  );
}

function PaymentDialog({
  bill,
  saving,
  potName,
  error,
  close,
  confirm,
}: {
  bill: Entry;
  saving: boolean;
  potName: string;
  error: string;
  close: () => void;
  confirm: (cents: number, date: string) => Promise<void>;
}) {
  const [value, setValue] = useState(decimal(bill.cents));
  const [date, setDate] = useState(today());
  const [validation, setValidation] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setValidation("");
    try {
      await confirm(parseMoney(value), date);
    } catch (err) {
      setValidation((err as Error).message);
    }
  }
  return (
    <ModalShell title="Confirmar pagamento" onClose={close}>
      <form onSubmit={submit}>
        <p>
          <strong>{bill.description}</strong>
        </p>
        <p className="muted">
          Vencimento: {displayDate(bill.date)} · Pote: {potName}
        </p>
        <Field label="Valor pago (R$)">
          <input
            inputMode="decimal"
            value={value}
            required
            disabled={saving}
            onChange={(e) => setValue(e.target.value)}
          />
        </Field>
        <Field label="Data do pagamento">
          <input
            type="date"
            value={date}
            max={today()}
            required
            disabled={saving}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <p className="muted">
          O pagamento desconta do saldo do pote e retira a conta dos
          compromissos, sem descontar duas vezes.
        </p>
        {(validation || error) && (
          <div className="notice danger" role="alert">
            {validation || error}
          </div>
        )}
        <button className="primary" type="submit" disabled={saving}>
          {saving ? "Salvando…" : "Confirmar pagamento"}
        </button>
        <button
          className="text-button"
          type="button"
          disabled={saving}
          onClick={close}
        >
          Cancelar
        </button>
      </form>
    </ModalShell>
  );
}
