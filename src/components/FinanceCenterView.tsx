import { PotSymbol, potSymbol, symbols } from "../finance/PotSymbol";
import { AnimatedMoney } from "../finance/AnimatedMoney";
import { PercentageControl } from "../finance/PercentageControl";
import { storage } from "../finance/storage";
import { useMemo, useState, FormEvent, useEffect, useRef } from "react";
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
  ChevronLeft,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Activity,
  Sparkles,
  User,
  Store,
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
  allocateContribution,
  pendingCommitmentsForMonth,
  potAllocationBase,
  validatePots,
  closeMonth,
  generateRecurring,
  validateFinance,
  migrate,
  monthDate,
  Actor,
  actorName,
  resetFinance,
  MARKETPLACE_ID,
  contributionPolicy,
  marketplacePolicyPot,
  validateMarketplace,
} from "../finance/model";
import "../finance/finance.css";
type View = "home" | "ledger" | "pots" | "bills" | "goals" | "settings" | "profile";
const navViews: Exclude<View, "profile">[] = ["home", "ledger", "pots", "bills", "goals", "settings"];
type Modal =
  | { type: "entry"; kind: Entry["kind"]; existing?: Entry; presetPot?: string; presetDest?: string }
  | { type: "pot"; existing?: Pot }
  | { type: "bill"; existing?: Recurrence }
  | { type: "goal"; existing?: Goal }
  | { type: "rule" }
  | { type: "asset" }
  | { type: "setup" }
  | { type: "marketplace" }
  | { type: "reset" }
  | null;
const labels = {
  home: "Visão geral",
  ledger: "Extrato",
  pots: "Potes",
  bills: "Contas",
  goals: "Metas",
  settings: "Configurações",
  profile: "Meu perfil",
};
const icons = {
  home: Home,
  ledger: List,
  pots: Wallet,
  bills: CalendarDays,
  goals: Target,
  settings: Settings,
  profile: User,
};
const kindNames = {
  income: "Aporte",
  expense: "Gasto",
  transfer: "Transferência",
};
const displayDate = (s: string) => s.split("-").reverse().join("/");
const parseOptionalMoney = (value: string) => {
  const raw = value.trim();
  if (!raw || /^0+(?:[,.]0{1,2})?$/.test(raw)) return 0;
  return parseMoney(raw);
};
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
    [hidden, setHidden] = useState(false),
    [surplusDismissed, setSurplusDismissed] = useState(false);
  const [dark, setDark] = useState(
    () => storage.getItem("imperio_visual") === "dark",
  );
  const setupPrompted = useRef(false);
  useEffect(() => {
    const color = dark ? "#10171a" : "#f5f6f3";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", color);
    document
      .querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
      ?.setAttribute("content", dark ? "black-translucent" : "default");
    document.body.style.backgroundColor = color;
  }, [dark]);
  const [actorFilter, setActorFilter] = useState("all");
  const [undo, setUndo] = useState<Entry | null>(null);
  const b = useMemo(() => (f ? balances(f) : null), [f]);
  useEffect(() => {
    if (f && !f.configured && !setupPrompted.current && !modal) {
      setupPrompted.current = true;
      setModal({ type: "setup" });
    }
  }, [f, modal]);
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
  const unallocated = Math.max(0, (b.buckets.free || 0) - b.pending);
  const pots = f.pots.filter((p) => p.active);
  const potName = (id: string) =>
    id === "free"
      ? "Sem distribuição"
      : id === MARKETPLACE_ID
        ? "Mercado Livre"
        : f.pots.find((p) => p.id === id)?.name || "Categoria anterior";
  const pending = f.entries
    .filter((e) => !e.deleted && e.kind === "expense" && e.status === "pending")
    .sort((a, b) => a.date.localeCompare(b.date));
  const currentEntries = f.entries.filter(
    (e) => !e.deleted && e.date.slice(0, 7) === month,
  );
  const income = currentEntries
    .filter(
      (e) =>
        e.kind === "income" &&
        e.status === "paid" &&
        e.date <= today() &&
        !e.source.startsWith("marketplace:"),
    )
    .reduce((s, e) => s + e.cents, 0);
  const expense = currentEntries
    .filter(
      (e) =>
        e.kind === "expense" &&
        e.status === "paid" &&
        e.date <= today() &&
        !e.source.startsWith("marketplace:"),
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
  async function pay(e: Entry) {
    if (f.closedMonths.some((m) => e.date.slice(0, 7) <= m)) {
      setLocalError("Reabra o mês para registrar o pagamento.");
      return;
    }
    if (e.pot !== "free") {
      const available = b?.buckets[e.pot] || 0;
      if (available < e.cents) {
        setLocalError(`O pote ${potName(e.pot)} tem apenas ${cash(Math.max(0, available))}. O pagamento não pode usar saldo de outro pote.`);
        return;
      }
    }
    await change(
      (s) => ({
        ...s,
        entries: s.entries.map((x) =>
          x.id === e.id
            ? {
                ...x,
                status: "paid",
                date: today(),
                updatedAt: new Date().toISOString(),
              }
            : x,
        ),
      }),
      "Pagamento registrado hoje",
    );
  }
  async function distributeUnallocatedAcrossPots() {
    if (unallocated <= 0) {
      setLocalError("Não há saldo não alocado disponível para distribuir.");
      return;
    }
    const targets = f.pots
      .filter(
        (p) =>
          p.active &&
          !p.reserve &&
          p.mode === "percent" &&
          potAllocationBase(p) === "remainder" &&
          p.value > 0,
      )
      .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
    const weight = targets.reduce((sum, p) => sum + p.value, 0);
    if (!targets.length || weight <= 0) {
      setLocalError("Defina percentuais nos potes de uso antes de distribuir o saldo livre.");
      return;
    }
    if (
      !window.confirm(
        `Distribuir ${cash(unallocated)} entre os potes de uso conforme as proporções atuais? O valor reservado para contas não será utilizado.`,
      )
    )
      return;

    let assigned = 0;
    const transfers: Entry[] = targets.flatMap((p, index) => {
      const amount =
        index === targets.length - 1
          ? unallocated - assigned
          : Math.floor((unallocated * p.value) / weight);
      assigned += amount;
      if (amount <= 0) return [];
      return [
        entry(
          {
            id: uid(),
            kind: "transfer",
            description: `Distribuição de saldo livre · ${p.name}`,
            cents: amount,
            date: today(),
            pot: "free",
            destination: p.id,
          },
          f.pots,
        ),
      ];
    });
    await change(
      (state) => ({ ...state, entries: [...state.entries, ...transfers] }),
      "Saldo livre distribuído entre os potes",
    );
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
                  aria-label="Marcar como pago hoje"
                  title="Marcar como pago hoje"
                  onClick={() => pay(e)}
                >
                  <Check size={16} />
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
          {navViews.map((v) => {
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
              className={`account-chip ${view === "profile" ? "active" : ""}`}
              onClick={() => setView("profile")}
              aria-label="Abrir meu perfil financeiro"
            >
              <span className="avatar">{actor === "voce" ? "R" : "A"}</span>
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
                          : view === "profile"
                    ? "Acompanhe a evolução e os pontos que merecem atenção."
                    : "Seu planejamento funciona do seu jeito."}
              </p>
            </div>
            {view !== "profile" && <div className="heading-actions">
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
            </div>}
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
                  <AnimatedMoney cents={b.free} hidden={hidden} tag="strong" />
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
                  <AnimatedMoney cents={b.account} hidden={hidden} tag="strong" />
                  <small>Entradas menos pagamentos realizados</small>
                  <hr />
                  <div>
                    <span>Reservas pessoais</span>
                    <AnimatedMoney cents={b.personalReserved} hidden={hidden} tag="b" />
                  </div>
                  <div>
                    <span>Reserva Mercado Livre</span>
                    <AnimatedMoney cents={b.marketplace} hidden={hidden} tag="b" />
                  </div>
                  <div>
                    <span>Contas pendentes até este mês</span>
                    <AnimatedMoney cents={b.pending} hidden={hidden} tag="b" />
                  </div>
                </div>
              </section>
              <section className="patrimony-strip" aria-label="Patrimônios protegidos">
                <div>
                  <span className="patrimony-icon"><PiggyBank size={18} /></span>
                  <span><small>Nosso Patrimônio</small><AnimatedMoney cents={Math.max(0, b.buckets.nosso_patrimonio || 0)} hidden={hidden} tag="strong" /></span>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <span className="patrimony-icon"><PiggyBank size={18} /></span>
                  <span><small>Patrimônio Manuela</small><AnimatedMoney cents={Math.max(0, b.buckets.patrimonio_manuela || 0)} hidden={hidden} tag="strong" /></span>
                  <ShieldCheck size={16} />
                </div>
              </section>
              <button
                type="button"
                className="marketplace-card"
                onClick={() => open({ type: "marketplace" })}
                aria-label="Gerenciar Mercado Livre"
              >
                <span className="marketplace-icon"><Store size={20} /></span>
                <span className="marketplace-copy">
                  <small>RESERVA EMPRESARIAL</small>
                  <strong>Mercado Livre</strong>
                  <span>{f.marketplace.active ? `${f.marketplace.percent}% da sobra após patrimônios e contas` : "Percentual automático pausado"}</span>
                </span>
                <span className="marketplace-balance">
                  <small>Saldo reservado</small>
                  <AnimatedMoney cents={b.marketplace} hidden={hidden} tag="strong" />
                </span>
                <ChevronRight size={18} />
              </button>
              {b.free < 0 && (
                <div className="notice danger">
                  As reservas e contas pendentes superam o saldo em conta. Revise os compromissos antes de gastar.
                </div>
              )}
              {unallocated > 0 && !surplusDismissed && (
                <section className="surplus-card">
                  <div className="surplus-copy">
                    <span className="surplus-icon"><Sparkles size={18} /></span>
                    <div>
                      <small>SALDO NÃO ALOCADO</small>
                      <AnimatedMoney cents={unallocated} hidden={hidden} tag="strong" />
                      <p>Esse valor ainda não tem destino. Você decide se quer guardar, usar em uma meta ou manter livre.</p>
                    </div>
                  </div>
                  <div className="surplus-actions">
                    <button className="secondary" onClick={() => open({ type: "entry", kind: "transfer", presetPot: "free", presetDest: "nosso_patrimonio" })}>Nosso patrimônio</button>
                    <button className="secondary" onClick={() => open({ type: "entry", kind: "transfer", presetPot: "free", presetDest: "patrimonio_manuela" })}>Patrimônio Manuela</button>
                    {f.goals[0] && <button className="secondary" onClick={() => open({ type: "entry", kind: "transfer", presetPot: "free", presetDest: f.goals[0].pot })}>Aportar em meta</button>}
                    <button className="secondary" onClick={distributeUnallocatedAcrossPots}>Distribuir nos potes</button>
                    <button className="text-button" onClick={() => setSurplusDismissed(true)}>Manter como saldo livre</button>
                  </div>
                </section>
              )}
              {b.buckets.free < 0 && (
                <div className="notice danger">
                  O saldo sem distribuição está em {cash(b.buckets.free)}. Revise transferências e pagamentos anteriores.
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
                        className="icon-button"
                        aria-label="Registrar pagamento hoje"
                        onClick={() => pay(e)}
                      >
                        <Check size={17} />
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
                    hidden={hidden}
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
                  <option value={MARKETPLACE_ID}>Mercado Livre</option>
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
                    .filter((p) => p.mode === "percent" && potAllocationBase(p) === "gross")
                    .reduce((s, p) => s + p.value, 0)}% patrimônios · {f.marketplace.percent}% Mercado Livre · {pots
                    .filter((p) => p.mode === "percent" && potAllocationBase(p) === "remainder")
                    .reduce((s, p) => s + p.value, 0)}% demais potes
                </span>
              </div>
              <button type="button" className="marketplace-allocation-card" onClick={() => open({ type: "marketplace" })}>
                <span className="marketplace-icon"><Store size={19} /></span>
                <span>
                  <small>FORA DOS POTES · RESERVA EMPRESARIAL</small>
                  <strong>Mercado Livre</strong>
                  <p>{f.marketplace.active ? `${f.marketplace.percent}% do saldo após patrimônios e contas é separado automaticamente.` : "Separação automática pausada."}</p>
                </span>
                <span className="marketplace-allocation-value">
                  <AnimatedMoney cents={b.marketplace} hidden={hidden} tag="strong" />
                  <small>Gerenciar</small>
                </span>
                <ChevronRight size={18} />
              </button>
              <section className="pot-grid">
                {pots.map((p) => (
                  <PotCard
                    key={p.id}
                    pot={p}
                    balance={b.buckets[p.id] || 0}
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
                    hidden={hidden}
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
              </div>
              <section className="panel">
                <header className="section-heading">
                  <h2>Pagamentos pendentes</h2>
                  <span className="muted">
                    O saldo só diminui ao confirmar o pagamento
                  </span>
                </header>
                {pending.map(ledgerRow)}
                {!pending.length && (
                  <div className="empty-state">Tudo em dia por aqui.</div>
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
          {view === "profile" && (() => {
            const currentMonth = today().slice(0, 7);
            const previousMonth = monthDate(`${currentMonth}-01`, -1).slice(0, 7);
            const monthTotals = (m: string) => {
              const rows = f.entries.filter((e) => !e.deleted && e.status === "paid" && e.date.slice(0, 7) === m && e.date <= today());
              return {
                income: rows.filter((e) => e.kind === "income").reduce((sum, e) => sum + e.cents, 0),
                expense: rows.filter((e) => e.kind === "expense").reduce((sum, e) => sum + e.cents, 0),
                saved: rows.reduce(
                  (sum, e) =>
                    sum +
                    (e.kind === "income"
                      ? (e.allocations.nosso_patrimonio || 0) +
                        (e.allocations.patrimonio_manuela || 0)
                      : e.kind === "transfer" &&
                          ["nosso_patrimonio", "patrimonio_manuela"].includes(e.destination)
                        ? e.cents
                        : 0),
                  0,
                ),
              };
            };
            const now = monthTotals(currentMonth);
            const before = monthTotals(previousMonth);
            const protectedTotal = Math.max(0, b.buckets.nosso_patrimonio || 0) + Math.max(0, b.buckets.patrimonio_manuela || 0);
            const externalTotal = f.assets.reduce((sum, a) => sum + a.cents, 0);
            const months = Array.from({ length: 6 }, (_, i) => monthDate(`${currentMonth}-01`, i - 5).slice(0, 7));
            const history = months.map((m) => ({ month: m, ...monthTotals(m) }));
            const maxSaved = Math.max(1, ...history.map((x) => x.saved));
            const expenseDelta = before.expense
              ? ((now.expense - before.expense) / before.expense) * 100
              : now.expense > 0
                ? 100
                : 0;
            const savedDelta = before.saved ? ((now.saved - before.saved) / before.saved) * 100 : now.saved > 0 ? 100 : 0;
            const insights = [
              {
                tone: savedDelta >= 0 ? "good" : "attention",
                icon: savedDelta >= 0 ? TrendingUp : TrendingDown,
                title: savedDelta >= 0 ? "Patrimônio em evolução" : "Patrimônio desacelerou",
                text: before.saved
                  ? `Neste mês vocês direcionaram ${Math.abs(Math.round(savedDelta))}% ${savedDelta >= 0 ? "a mais" : "a menos"} para os patrimônios do que no mês anterior.`
                  : now.saved > 0
                    ? `Neste mês já foram direcionados ${cash(now.saved)} aos patrimônios.`
                    : "Ainda não houve aporte para os patrimônios neste mês.",
              },
              {
                tone: expenseDelta <= 0 ? "good" : "attention",
                icon: expenseDelta <= 0 ? TrendingDown : TrendingUp,
                title: expenseDelta <= 0 ? "Gastos sob controle" : "Gastos em alta",
                text: before.expense
                  ? `Os gastos pagos estão ${Math.abs(Math.round(expenseDelta))}% ${expenseDelta <= 0 ? "abaixo" : "acima"} do mês anterior.`
                  : `Gastos pagos neste mês: ${cash(now.expense)}.`,
              },
              {
                tone: b.pending > 0 ? "attention" : "good",
                icon: CalendarDays,
                title: b.pending > 0 ? "Há compromissos pendentes" : "Contas do período em dia",
                text: b.pending > 0 ? `${cash(b.pending)} ainda estão reservados para contas pendentes.` : "Não há contas pendentes até este mês.",
              },
            ];
            return (
              <>
                <section className="profile-hero">
                  <div>
                    <p className="eyebrow">RAIO-X FINANCEIRO</p>
                    <h2>{actorName(actor)}, esta é a evolução do planejamento</h2>
                    <p>Sem pontuação ou medalhas: apenas os números que mostram o que está avançando e o que merece atenção.</p>
                  </div>
                  <button className="secondary" onClick={onLogout}><LogOut size={16} /> Trocar perfil ou sair</button>
                </section>

                <section className="profile-metrics">
                  <article>
                    <span className="metric-icon"><PiggyBank size={19} /></span>
                    <small>Patrimônio protegido</small>
                    <strong>{cash(protectedTotal)}</strong>
                    <p>Nosso Patrimônio + Patrimônio Manuela</p>
                  </article>
                  <article>
                    <span className="metric-icon"><TrendingUp size={19} /></span>
                    <small>Guardado neste mês</small>
                    <strong>{cash(now.saved)}</strong>
                    <p>Aportes destinados aos dois patrimônios</p>
                  </article>
                  <article>
                    <span className="metric-icon"><Activity size={19} /></span>
                    <small>Resultado do mês</small>
                    <strong>{cash(now.income - now.expense)}</strong>
                    <p>Aportes menos gastos pagos</p>
                  </article>
                  <article>
                    <span className="metric-icon"><Wallet size={19} /></span>
                    <small>Patrimônio externo</small>
                    <strong>{cash(externalTotal)}</strong>
                    <p>Bens e valores informados fora da conta</p>
                  </article>
                </section>

                <section className="profile-grid">
                  <div className="panel evolution-panel">
                    <header className="section-heading">
                      <div><h2>Evolução de aportes aos patrimônios</h2><p>Últimos seis meses</p></div>
                    </header>
                    <div className="evolution-bars">
                      {history.map((item) => (
                        <div key={item.month}>
                          <span className="evolution-value">{item.saved ? cash(item.saved) : "—"}</span>
                          <span className="evolution-track"><i style={{ height: `${Math.max(item.saved ? 8 : 2, (item.saved / maxSaved) * 100)}%` }} /></span>
                          <small>{item.month.slice(5)}/{item.month.slice(2, 4)}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="panel insights-panel">
                    <header className="section-heading"><div><h2>Leitura do momento</h2><p>Baseada no histórico registrado</p></div></header>
                    {insights.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div className={`insight-row ${item.tone}`} key={item.title}>
                          <span><Icon size={17} /></span>
                          <div><strong>{item.title}</strong><p>{item.text}</p></div>
                        </div>
                      );
                    })}
                    {unallocated > 0 && (
                      <div className="insight-row neutral">
                        <span><Sparkles size={17} /></span>
                        <div><strong>Há dinheiro sem destino</strong><p>{cash(unallocated)} ainda podem ser direcionados para patrimônio, metas ou potes.</p></div>
                      </div>
                    )}
                  </div>
                </section>
              </>
            );
          })()}
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
                  conta. A reserva Mercado Livre também fica fora do valor livre
                  para gastar. Contas pendentes até o mês atual reduzem o valor livre
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
          {navViews.map((v) => {
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
      ) : modal?.type === "marketplace" ? (
        <MarketplaceDialog
          f={f}
          saving={saving}
          cash={cash}
          close={() => setModal(null)}
          commit={async (fn, keepOpen = false) => {
            const ok = await change(fn);
            if (ok && !keepOpen) setModal(null);
            return ok;
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
            commit={async (fn, keepOpen = false) => {
              const ok = await change(fn);
              if (ok && !keepOpen) setModal(null);
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
  funded,
  spent,
  cash,
  hidden,
  onEdit,
}: {
  pot: Pot;
  balance: number;
  funded: number;
  spent: number;
  cash: (v: number) => string;
  hidden: boolean;
  onEdit: () => void;
}) {
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
      </header>
      <button
        className="icon-button pot-edit-button"
        aria-label={`Editar ${p.name}`}
        onClick={onEdit}
      >
        <Pencil size={14} />
      </button>
      <div className="pot-art">
        <PotSymbol symbol={potSymbol(p)} />
        <span className="pot-percentage">
          {p.mode === "percent" ? `${p.value}%` : "Fixo"}
        </span>
      </div>
      <h3>{p.name}</h3>
      <AnimatedMoney cents={balance} hidden={hidden} tag="strong" />
      <small>{p.reserve ? "Reservado" : "Disponível no pote"}</small>
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
function MarketplaceDialog({
  f,
  saving,
  cash,
  close,
  commit,
}: {
  f: Finance;
  saving: boolean;
  cash: (v: number) => string;
  close: () => void;
  commit: (fn: (s: Finance) => Finance, keepOpen?: boolean) => Promise<boolean>;
}) {
  type Action = "income" | "expense" | "planning";
  const [action, setAction] = useState<Action>("income");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(today());
  const [distribution, setDistribution] = useState<"automatic" | "single">("automatic");
  const [destination, setDestination] = useState("nosso_patrimonio");
  const [percent, setPercent] = useState(f.marketplace.percent);
  const [active, setActive] = useState(f.marketplace.active);
  const [formError, setFormError] = useState("");
  const current = balances(f);
  const maxPercent = 100;
  const marketEntries = f.entries
    .filter(
      (e) =>
        !e.deleted &&
        ((e.allocations?.[MARKETPLACE_ID] || 0) > 0 ||
          e.pot === MARKETPLACE_ID ||
          e.destination === MARKETPLACE_ID),
    )
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.recordedAt.localeCompare(a.recordedAt),
    )
    .slice(0, 10);

  const marketEffect = (e: Entry) => {
    if (e.kind === "income") return e.allocations?.[MARKETPLACE_ID] || 0;
    if (e.kind === "expense" && e.pot === MARKETPLACE_ID) return -e.cents;
    if (e.kind === "transfer") {
      if (e.pot === MARKETPLACE_ID) return -e.cents;
      if (e.destination === MARKETPLACE_ID) return e.cents;
    }
    return 0;
  };

  async function savePercentage() {
    setFormError("");
    try {
      const nextMarketplace = {
        ...f.marketplace,
        percent,
        active,
      };
      validateMarketplace(nextMarketplace, f.pots);
      await commit(
        (s) => ({ ...s, marketplace: { ...s.marketplace, percent, active } }),
        true,
      );
    } catch (e) {
      setFormError((e as Error).message);
    }
  }

  async function submitMovement(ev: FormEvent) {
    ev.preventDefault();
    setFormError("");
    try {
      const amount = parseMoney(value);
      if (!description.trim()) throw new Error("Informe uma descrição.");
      if (f.closedMonths.some((m) => date.slice(0, 7) <= m))
        throw new Error("Reabra o mês antes de registrar esta movimentação.");
      const atDate = balances(f, date).marketplace;
      if (action !== "income" && atDate < amount)
        throw new Error(
          `O Mercado Livre tem apenas ${cash(Math.max(0, atDate))} disponível nesta data.`,
        );

      let additions: Entry[] = [];
      if (action === "income") {
        const policy = [
          {
            ...marketplacePolicyPot(f.marketplace),
            value: 100,
            active: true,
          },
        ];
        const movement = entry(
          {
            id: uid(),
            kind: "income",
            description: description.trim(),
            cents: amount,
            date,
            policy,
            source: "marketplace:income",
          },
          policy,
        );
        movement.allocations = { [MARKETPLACE_ID]: amount };
        additions = [movement];
      }

      if (action === "expense") {
        additions = [
          entry(
            {
              id: uid(),
              kind: "expense",
              description: description.trim(),
              cents: amount,
              date,
              pot: MARKETPLACE_ID,
              source: "marketplace:expense",
            },
            f.pots,
          ),
        ];
      }

      if (action === "planning") {
        const groupId = uid();
        if (distribution === "automatic") {
          const parts = allocateContribution(
            amount,
            f.pots,
            pendingCommitmentsForMonth(f, date),
          );
          additions = Object.entries(parts).flatMap(([dest, cents]) => {
            if (cents <= 0) return [];
            const targetName =
              dest === "free"
                ? "Contas + saldo livre"
                : f.pots.find((p) => p.id === dest)?.name || "Planejamento";
            return [
              entry(
                {
                  id: uid(),
                  kind: "transfer",
                  description: `${description.trim()} · ${targetName}`,
                  cents,
                  date,
                  pot: MARKETPLACE_ID,
                  destination: dest,
                  source: `marketplace:planning:${groupId}`,
                },
                f.pots,
              ),
            ];
          });
        } else {
          if (
            destination !== "free" &&
            !f.pots.some((p) => p.id === destination)
          )
            throw new Error("Escolha um destino válido.");
          additions = [
            entry(
              {
                id: uid(),
                kind: "transfer",
                description: description.trim(),
                cents: amount,
                date,
                pot: MARKETPLACE_ID,
                destination,
                source: `marketplace:planning:${groupId}`,
              },
              f.pots,
            ),
          ];
        }
      }

      const ok = await commit(
        (s) => ({ ...s, entries: [...s.entries, ...additions] }),
        true,
      );
      if (ok) {
        setDescription("");
        setValue("");
      }
    } catch (e) {
      setFormError((e as Error).message);
    }
  }

  return (
    <ModalShell title="Mercado Livre" onClose={close}>
      <div className="marketplace-dialog">
        {formError && (
          <div className="notice danger" role="alert">
            {formError}
          </div>
        )}
        <section className="marketplace-hero">
          <span className="marketplace-icon marketplace-icon-large"><Store size={25} /></span>
          <div>
            <small>RESERVA EMPRESARIAL</small>
            <strong>{cash(current.marketplace)}</strong>
            <p>Entradas e gastos do Mercado Livre ficam separados do dinheiro da família.</p>
          </div>
        </section>

        <section className="marketplace-config">
          <div className="section-heading">
            <div>
              <h3>Percentual automático</h3>
              <p>É calculado sobre o saldo que restou depois dos patrimônios e das contas. Não entra no limite de 100% dos potes.</p>
            </div>
          </div>
          <PercentageControl
            label="Mercado Livre percentual"
            value={percent}
            maxAllowed={maxPercent}
            step={1}
            color={f.marketplace.color}
            onChange={setPercent}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />{" "}
            Separar Mercado Livre nos próximos aportes
          </label>
          <button type="button" className="secondary" disabled={saving} onClick={savePercentage}>
            Salvar percentual
          </button>
        </section>

        <section className="marketplace-actions">
          <div className="marketplace-action-tabs" role="tablist" aria-label="Movimentação Mercado Livre">
            <button type="button" className={action === "income" ? "active" : ""} onClick={() => setAction("income")}>Entrada</button>
            <button type="button" className={action === "expense" ? "active" : ""} onClick={() => setAction("expense")}>Gasto</button>
            <button type="button" className={action === "planning" ? "active" : ""} onClick={() => setAction("planning")}>Levar ao planejamento</button>
          </div>
          <form className="marketplace-movement-form" onSubmit={submitMovement}>
            <Field label="Descrição">
              <input
                autoFocus
                required
                maxLength={120}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  action === "income"
                    ? "Ex.: Vendas da semana"
                    : action === "expense"
                      ? "Ex.: Reposição de estoque"
                      : "Ex.: Retirada para planejamento familiar"
                }
              />
            </Field>
            <div className="marketplace-form-grid">
              <Field label="Valor (R$)">
                <input
                  required
                  inputMode="decimal"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0,00"
                />
              </Field>
              <Field label="Data">
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
            </div>
            {action === "planning" && (
              <>
                <Field label="Como distribuir">
                  <select value={distribution} onChange={(e) => setDistribution(e.target.value as "automatic" | "single")}>
                    <option value="automatic">Distribuir conforme meu planejamento</option>
                    <option value="single">Escolher um destino</option>
                  </select>
                </Field>
                {distribution === "automatic" ? (
                  <div className="notice marketplace-plan-note">
                    Patrimônios, contas e potes recebem o valor pelas regras atuais. O percentual do Mercado Livre não é aplicado novamente nesta transferência.
                  </div>
                ) : (
                  <Field label="Destino">
                    <select value={destination} onChange={(e) => setDestination(e.target.value)}>
                      <option value="free">Saldo livre / contas</option>
                      {f.pots.filter((p) => p.active).map((p) => (
                        <option value={p.id} key={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </Field>
                )}
              </>
            )}
            <button className="primary" type="submit" disabled={saving}>
              {saving
                ? "Salvando…"
                : action === "income"
                  ? "Registrar entrada"
                  : action === "expense"
                    ? "Registrar gasto"
                    : "Transferir para o planejamento"}
            </button>
          </form>
        </section>

        <section className="marketplace-history">
          <header className="section-heading">
            <div>
              <h3>Movimentações do Mercado Livre</h3>
              <p>Últimos lançamentos que alteraram esta reserva</p>
            </div>
          </header>
          {marketEntries.map((e) => {
            const effect = marketEffect(e);
            return (
              <div className="marketplace-history-row" key={e.id}>
                <span>
                  <strong>{e.description}</strong>
                  <small>{displayDate(e.date)} · {actorName(e.createdBy)}</small>
                </span>
                <b className={effect >= 0 ? "positive" : ""}>
                  {effect >= 0 ? "+" : "−"}{cash(Math.abs(effect)).replace(/^R\$\s*/, "R$ ")}
                </b>
              </div>
            );
          })}
          {!marketEntries.length && <div className="empty-state">Nenhuma movimentação do Mercado Livre ainda.</div>}
        </section>
        <footer className="modal-footer marketplace-footer">
          <button type="button" className="secondary" onClick={close}>Fechar</button>
        </footer>
      </div>
    </ModalShell>
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
  modal: Exclude<Modal, null | { type: "reset" } | { type: "marketplace" }>;
  f: Finance;
  saving: boolean;
  cash: (v: number) => string;
  close: () => void;
  commit: (fn: (s: Finance) => Finance, keepOpen?: boolean) => Promise<boolean>;
}) {
  const old = modal.type === "entry" ? modal.existing : null;
  const p = modal.type === "pot" ? modal.existing : null;
  const r = modal.type === "bill" ? modal.existing : null;
  const g = modal.type === "goal" ? modal.existing : null;
  const defaultExpensePot = f.pots.find(
    (x) => x.active && !x.reserve && potAllocationBase(x) === "remainder",
  )?.id || "free";
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
  const [pot, setPot] = useState(
    old?.pot ||
      r?.pot ||
      g?.pot ||
      (modal.type === "entry" ? modal.presetPot : undefined) ||
      (modal.type === "entry" && modal.kind === "expense" ? defaultExpensePot : "free"),
  ),
    [dest, setDest] = useState(
      old?.destination || (modal.type === "entry" ? modal.presetDest : undefined) || "",
    );
  const [mode, setMode] = useState<"percent" | "fixed">(p?.mode || "percent"),
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
  const [setupPots, setSetupPots] = useState<Pot[]>(
    structuredClone(f.pots).map((p) => ({
      ...p,
      mode: "percent" as const,
      value: Math.max(0, Math.min(100, Math.round(p.value))),
      allocationBase: potAllocationBase(p),
    })),
  );
  const [setupStep, setSetupStep] = useState(0);
  const [setupSelected, setSetupSelected] = useState(0);
  const [setupBills, setSetupBills] = useState<Recurrence[]>([]);
  const [setupBillName, setSetupBillName] = useState("");
  const [setupBillValue, setSetupBillValue] = useState("");
  const [setupBillMonths, setSetupBillMonths] = useState(0);
  const [setupBillStart, setSetupBillStart] = useState(today());
  const [setupMarketplacePct, setSetupMarketplacePct] = useState(f.marketplace.percent);
  const [setupMarketplaceActive, setSetupMarketplaceActive] = useState(f.marketplace.active);
  const [setupMarketplaceInitial, setSetupMarketplaceInitial] = useState("");
  useEffect(() => {
    if (modal.type !== "setup" || setupStep !== 3) return;
    const timer = window.setTimeout(close, 2200);
    return () => window.clearTimeout(timer);
  }, [modal.type, setupStep, close]);
  const existingPolicy = old?.id && old.policy.length ? old.policy : contributionPolicy(f);
  const setupMarketplaceConfig = {
    ...f.marketplace,
    percent: setupMarketplacePct,
    active: setupMarketplaceActive,
  };
  // No primeiro planejamento o Mercado Livre NÃO participa como porcentagem.
  // O valor inicial é informado manualmente depois de patrimônios + contas.
  const setupTargets = setupPots;
  let setupMarketplaceAvailable = 0;
  let preview: Record<string, number> = {};
  try {
    if (modal.type === "entry" && modal.kind === "income") {
      preview = allocateContribution(
        parseMoney(value),
        existingPolicy,
        pendingCommitmentsForMonth(f, date),
      );
    }
    if (modal.type === "setup" && value.trim()) {
      const amount = parseMoney(value);
      const commitments = setupBills
        .filter((r) => r.start.slice(0, 7) <= date.slice(0, 7))
        .reduce((sum, r) => sum + r.cents, 0);
      const withoutMarketplace = allocateContribution(amount, setupPots, 0);
      const grossAllocated = setupPots
        .filter((p) => p.active && potAllocationBase(p) === "gross")
        .reduce((sum, p) => sum + (withoutMarketplace[p.id] || 0), 0);
      setupMarketplaceAvailable = Math.max(
        0,
        amount - grossAllocated - Math.min(commitments, amount - grossAllocated),
      );
      const firstMarketplaceCents = parseOptionalMoney(setupMarketplaceInitial);
      const firstPolicy: Pot[] = [
        ...setupPots,
        ...(firstMarketplaceCents > 0
          ? [
              {
                ...marketplacePolicyPot(setupMarketplaceConfig),
                mode: "fixed" as const,
                value: firstMarketplaceCents / 100,
                active: true,
                allocationBase: "remainder" as const,
              },
            ]
          : []),
      ];
      preview = allocateContribution(amount, firstPolicy, commitments);
    }
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
              ? setupStep === 0
                ? "Contas fixas e dívidas"
                : setupStep === 1
                  ? "Aporte inicial"
                  : setupStep === 2
                    ? "Monte seu plano financeiro"
                    : "Planejamento pronto"
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
  function addSetupBill() {
    setFormError("");
    try {
      if (!setupBillName.trim()) throw new Error("Informe o nome da conta.");
      const cents = parseMoney(setupBillValue);
      if (!Number.isInteger(setupBillMonths) || setupBillMonths < 0 || setupBillMonths > 1200)
        throw new Error("Informe de 0 a 1.200 meses.");
      const bill: Recurrence = {
        id: uid(),
        name: setupBillName.trim(),
        cents,
        pot: "free",
        start: setupBillStart,
        count: setupBillMonths,
        active: true,
      };
      setSetupBills((items) => [...items, bill]);
      setSetupBillName("");
      setSetupBillValue("");
      setSetupBillMonths(0);
    } catch (e) {
      setFormError((e as Error).message);
    }
  }
  async function submit(ev: FormEvent) {
    ev.preventDefault();
    setFormError("");
    try {
      if (modal.type === "setup") {
        if (setupStep === 0) {
          setSetupStep(1);
          return;
        }
        if (setupStep === 1) {
          parseMoney(value);
          setSetupStep(2);
          return;
        }
        if (setupStep === 2) {
          validatePots(setupPots);
          validateMarketplace(setupMarketplaceConfig, setupPots);
          const amount = parseMoney(value);
          const baseAllocation = allocateContribution(amount, setupPots, 0);
          const grossAllocated = setupPots
            .filter((p) => p.active && potAllocationBase(p) === "gross")
            .reduce((sum, p) => sum + (baseAllocation[p.id] || 0), 0);
          if (setupMonthlyCommitment > Math.max(0, amount - grossAllocated))
            throw new Error(
              `O aporte não cobre os patrimônios e as contas deste período. Faltam ${cash(setupMonthlyCommitment - Math.max(0, amount - grossAllocated))}.`,
            );
          const firstMarketplaceCents = parseOptionalMoney(setupMarketplaceInitial);
          const marketplaceLimit = Math.max(0, amount - grossAllocated - setupMonthlyCommitment);
          if (firstMarketplaceCents > marketplaceLimit)
            throw new Error(
              `Depois de patrimônios e contas, há ${cash(marketplaceLimit)} disponível para o Mercado Livre.`,
            );
          let next: Finance = {
            ...f,
            configured: false,
            pots: setupPots,
            marketplace: setupMarketplaceConfig,
            recurrences: [...f.recurrences, ...setupBills],
          };
          next = generateRecurring(next);
          const commitments = pendingCommitmentsForMonth(next, date);
          const firstPolicy: Pot[] = [
            ...structuredClone(setupPots),
            ...(firstMarketplaceCents > 0
              ? [
                  {
                    ...marketplacePolicyPot(setupMarketplaceConfig),
                    mode: "fixed" as const,
                    value: firstMarketplaceCents / 100,
                    active: true,
                    allocationBase: "remainder" as const,
                  },
                ]
              : []),
          ];
          const first = entry(
            {
              id: uid(),
              kind: "income",
              description: "Aporte inicial",
              cents: amount,
              date,
            },
            firstPolicy,
          );
          first.policy = structuredClone(firstPolicy);
          first.allocations = allocateContribution(amount, firstPolicy, commitments);
          next = { ...next, configured: true, entries: [...next.entries, first] };
          const ok = await commit(() => next, true);
          if (ok) setSetupStep(3);
          return;
        }
        return;
      }
      const amount = ["entry", "bill", "goal", "asset"].includes(modal.type)
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
              modal.kind === "expense" ? (old?.status || "paid") : "paid",
            policy: modal.kind === "income" ? existingPolicy : [],
            source: old?.id ? old.source : "",
          },
          f.pots,
        );
        if (modal.kind === "income") {
          candidate.allocations = allocateContribution(
            amount,
            existingPolicy,
            pendingCommitmentsForMonth(f, date),
          );
        }
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

        if (modal.kind === "expense" && candidate.status === "paid") {
          const selectedPot = f.pots.find((x) => x.id === pot);
          if (!selectedPot || selectedPot.reserve || pot === "free")
            throw new Error("Escolha o pote correto para este gasto.");
          const available = balances(
            { ...f, entries: f.entries.filter((e) => e.id !== candidate.id) },
            date,
          ).buckets[pot] || 0;
          if (available < amount)
            throw new Error(
              `Este pote tem apenas ${cash(Math.max(0, available))} disponível. O gasto não pode usar saldo de outro pote.`,
            );
        }
        if (modal.kind === "transfer") {
          const transferBalances = balances(
            { ...f, entries: f.entries.filter((e) => e.id !== candidate.id) },
            date,
          );
          const available =
            pot === "free"
              ? Math.max(0, (transferBalances.buckets.free || 0) - transferBalances.pending)
              : transferBalances.buckets[pot] || 0;
          if (available < amount)
            throw new Error(
              pot === "free"
                ? `Há apenas ${cash(available)} de saldo realmente livre. O valor reservado para contas não pode ser transferido.`
                : "O saldo do pote de origem na data escolhida não cobre a transferência.",
            );
        }
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
          mode: p && potAllocationBase(p) === "gross" ? "percent" : mode,
          reserve,
          rollover,
          priority,
          active,
          color: p?.color || "#8296bb",
          icon: symbol,
          allocationBase: p ? potAllocationBase(p) : "remainder",
        };
        const next = [...f.pots.filter((x) => x.id !== updated.id), updated];
        validatePots(next);
        validateMarketplace(f.marketplace, next);
        await commit((s) => ({
          ...s,
          pots: [...s.pots.filter((x) => x.id !== updated.id), updated],
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
          pot: "free",
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
            allocationBase: "remainder" as const,
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
  const destinationOptions = (
    <>
      <option value="free">Sem distribuição</option>
      {f.pots
        .filter((p) => p.active || p.id === dest)
        .map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
    </>
  );
  const transferSourceOptions = (
    <>
      <option value="free">Saldo sem distribuição</option>
      {f.pots
        .filter((p) => (p.active || p.id === pot) && !p.reserve)
        .map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
    </>
  );
  const ruleOptions = f.pots
    .filter((p) => p.active && !p.reserve && potAllocationBase(p) === "remainder")
    .map((p) => (
      <option key={p.id} value={p.id}>{p.name}</option>
    ));
  const expenseOptions = f.pots
    .filter((p) => p.active && !p.reserve && potAllocationBase(p) === "remainder")
    .map((p) => (
      <option key={p.id} value={p.id}>
        {p.name} · {cash(Math.max(0, balances(f, date).buckets[p.id] || 0))}
      </option>
    ));
  const selectedSetupPot = setupTargets[setupSelected] || setupTargets[0];
  const setupMonthlyCommitment = setupBills
    .filter((r) => r.start.slice(0, 7) <= date.slice(0, 7))
    .reduce((sum, r) => sum + r.cents, 0);
  const setupGrossPct = setupTargets
    .filter((p) => p.active && p.mode === "percent" && potAllocationBase(p) === "gross")
    .reduce((sum, p) => sum + p.value, 0);
  const setupRemainderPct = setupPots
    .filter((p) => p.active && p.mode === "percent" && potAllocationBase(p) === "remainder")
    .reduce((sum, p) => sum + p.value, 0);
  return (
    <ModalShell title={title} onClose={close}>
      <form onSubmit={submit} className="modal-form">
        {formError && (
          <div className="notice danger" role="alert">
            {formError}
          </div>
        )}
        {modal.type === "setup" && (
          <div className="setup-wizard">
            <div className="setup-progress" aria-label="Etapas da configuração">
              {["Contas", "Aporte", "Potes", "Pronto"].map((label, i) => (
                <div key={label} className={i <= setupStep ? "active" : ""}>
                  <span>{i + 1}</span>
                  <small>{label}</small>
                </div>
              ))}
            </div>

            {setupStep === 0 && (
              <section className="setup-step">
                <div className="setup-intro">
                  <span className="setup-icon"><CalendarDays size={21} /></span>
                  <div>
                    <h3>Primeiro, o que já sai todo mês?</h3>
                    <p>Cadastre contas fixas e dívidas. Elas serão separadas antes da distribuição dos potes.</p>
                  </div>
                </div>
                <div className="setup-bill-editor">
                  <Field label="Conta ou dívida">
                    <input
                      value={setupBillName}
                      onChange={(e) => setSetupBillName(e.target.value)}
                      placeholder="Ex.: Aluguel, luz, parcela do carro"
                    />
                  </Field>
                  <Field label="Valor mensal (R$)">
                    <input
                      inputMode="decimal"
                      value={setupBillValue}
                      onChange={(e) => setSetupBillValue(e.target.value)}
                      placeholder="0,00"
                    />
                  </Field>
                  <Field label="Por quantos meses?">
                    <input
                      type="number"
                      min="0"
                      max="1200"
                      value={setupBillMonths}
                      onChange={(e) => setSetupBillMonths(Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Primeiro vencimento">
                    <input
                      type="date"
                      value={setupBillStart}
                      onChange={(e) => setSetupBillStart(e.target.value)}
                    />
                  </Field>
                  <button type="button" className="secondary setup-add-bill" onClick={addSetupBill}>
                    <Plus size={16} /> Adicionar conta
                  </button>
                  <small className="muted">Use 0 meses para uma conta recorrente sem prazo, como aluguel, água ou internet.</small>
                </div>
                <div className="setup-bill-list">
                  {setupBills.map((bill) => (
                    <div key={bill.id} className="setup-bill-row">
                      <span>
                        <strong>{bill.name}</strong>
                        <small>{bill.count ? `${bill.count} meses` : "Recorrente"} · vence a partir de {displayDate(bill.start)}</small>
                      </span>
                      <b>{cash(bill.cents)}</b>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Remover ${bill.name}`}
                        onClick={() => setSetupBills((items) => items.filter((x) => x.id !== bill.id))}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {!setupBills.length && <p className="muted">Nenhuma conta adicionada ainda. Você pode continuar se não tiver compromissos fixos.</p>}
                </div>
                <div className="setup-total-line">
                  <span>Total mensal cadastrado</span>
                  <strong>{cash(setupBills.reduce((sum, x) => sum + x.cents, 0))}</strong>
                </div>
              </section>
            )}

            {setupStep === 1 && (
              <section className="setup-step setup-contribution-step">
                <div className="setup-intro">
                  <span className="setup-icon"><Wallet size={21} /></span>
                  <div>
                    <h3>Agora informe o aporte inicial</h3>
                    <p>É o valor bruto disponível hoje. O app separa patrimônios e contas; depois você define manualmente quanto vai para o Mercado Livre.</p>
                  </div>
                </div>
                <Field label="Aporte inicial (R$)">
                  <input
                    autoFocus
                    inputMode="decimal"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0,00"
                  />
                </Field>
                <Field label="Data do aporte">
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                </Field>
                <div className="setup-math-card">
                  <span><small>Contas do período</small><b>{cash(setupMonthlyCommitment)}</b></span>
                  <span><small>Patrimônios</small><b>calculados sobre o bruto</b></span>
                  <p>Na próxima etapa você escolhe o valor inicial do Mercado Livre. Só depois os potes dividem o saldo restante.</p>
                </div>
              </section>
            )}

            {setupStep === 2 && selectedSetupPot && (
              <section className="setup-step setup-pots-stage">
                <div className="setup-intro">
                  <span className="setup-icon"><Target size={21} /></span>
                  <div>
                    <h3>Monte o seu plano financeiro</h3>
                    <p>Use as setas para trocar de pote e arraste o marcador ao redor do círculo. As porcentagens avançam de 1 em 1.</p>
                  </div>
                </div>

                <div className="setup-plan-summary">
                  <div><small>Patrimônios · aporte bruto</small><strong>{setupGrossPct}%</strong></div>
                  <div><small>Outros potes · depois das contas e do Mercado Livre</small><strong>{setupRemainderPct}%</strong></div>
                </div>

                <div className="setup-marketplace-first">
                  <div className="setup-marketplace-head">
                    <span className="marketplace-icon"><Store size={20} /></span>
                    <span>
                      <small>PRIMEIRO APORTE · VALOR MANUAL</small>
                      <strong>Mercado Livre</strong>
                      <p>Primeiro são separados patrimônios e contas. Você escolhe quanto da sobra vai para a operação.</p>
                    </span>
                    <span className="setup-marketplace-limit">
                      <small>Disponível antes dos potes</small>
                      <strong>{cash(setupMarketplaceAvailable)}</strong>
                    </span>
                  </div>
                  <div className="setup-marketplace-fields">
                    <Field label="Valor inicial para Mercado Livre (R$)">
                      <input
                        inputMode="decimal"
                        value={setupMarketplaceInitial}
                        onChange={(e) => setSetupMarketplaceInitial(e.target.value)}
                        placeholder="0,00"
                      />
                    </Field>
                    <div className="setup-marketplace-future">
                      <PercentageControl
                        label="Percentual para os próximos aportes"
                        value={setupMarketplacePct}
                        maxAllowed={100}
                        step={1}
                        color={f.marketplace.color}
                        onChange={setSetupMarketplacePct}
                      />
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={setupMarketplaceActive}
                          onChange={(e) => setSetupMarketplaceActive(e.target.checked)}
                        />{" "}
                        Aplicar automaticamente nos próximos aportes
                      </label>
                    </div>
                  </div>
                  <small className="muted">
                    O percentual futuro é independente dos 100% dos potes e será calculado somente sobre o que restar depois de patrimônios e contas.
                  </small>
                </div>

                <div className="setup-orbit" aria-label="Visão circular dos potes">
                  <div className="setup-orbit-center">
                    <strong>100%</strong>
                    <small>limite por base</small>
                  </div>
                  {setupTargets.map((item, i) => {
                    const angle = (-90 + (i * 360) / Math.max(1, setupTargets.length)) * (Math.PI / 180);
                    const left = 50 + Math.cos(angle) * 39;
                    const top = 50 + Math.sin(angle) * 39;
                    return (
                      <button
                        type="button"
                        key={`orbit-${item.id}`}
                        className={`setup-orbit-pot ${i === setupSelected ? "selected" : ""}`}
                        style={{ left: `${left}%`, top: `${top}%`, "--pot-color": item.color } as any}
                        onClick={() => setSetupSelected(i)}
                        aria-label={`${item.name}: ${item.value}%`}
                      >
                        <PotSymbol symbol={potSymbol(item)} />
                        <span>{item.id === "patrimonio_manuela" ? "Manuela" : item.name.replace("Desfrute ", "")}</span>
                        <b>{item.value}%</b>
                      </button>
                    );
                  })}
                </div>

                <div className="setup-selected-pot">
                  <div className="setup-pot-identity">
                    <PotSymbol symbol={potSymbol(selectedSetupPot)} />
                    <span>
                      <small>{potAllocationBase(selectedSetupPot) === "gross" ? "Calculado sobre o aporte bruto" : "Calculado depois de contas, patrimônios e Mercado Livre"}</small>
                      <strong>{selectedSetupPot.id === "patrimonio_manuela" ? "Patrimônio Manuela" : selectedSetupPot.name}</strong>
                    </span>
                  </div>
                  <PercentageControl
                    label={`${selectedSetupPot.name} percentual`}
                    value={selectedSetupPot.value}
                    color={selectedSetupPot.color}
                    step={1}
                    amountLabel={preview[selectedSetupPot.id] != null ? cash(preview[selectedSetupPot.id]) : undefined}
                    maxAllowed={
                      100 - setupTargets
                        .filter((x, i) =>
                          i !== setupSelected &&
                          x.active &&
                          x.mode === "percent" &&
                          potAllocationBase(x) === potAllocationBase(selectedSetupPot),
                        )
                        .reduce((sum, x) => sum + x.value, 0)
                    }
                    onChange={(nextValue) => {
                      if (selectedSetupPot.id === MARKETPLACE_ID) {
                        setSetupMarketplacePct(nextValue);
                      } else {
                        setSetupPots((items) =>
                          items.map((x) =>
                            x.id === selectedSetupPot.id ? { ...x, value: nextValue } : x,
                          ),
                        );
                      }
                    }}
                  />
                </div>

                <div className="setup-carousel-row">
                  <button
                    type="button"
                    className="icon-button carousel-arrow"
                    aria-label="Pote anterior"
                    onClick={() => setSetupSelected((setupSelected - 1 + setupTargets.length) % setupTargets.length)}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="setup-pot-carousel" role="listbox" aria-label="Escolher pote">
                    {setupTargets.map((item, i) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={i === setupSelected}
                        key={item.id}
                        className={i === setupSelected ? "selected" : ""}
                        onClick={() => setSetupSelected(i)}
                        onPointerDown={(e) => { e.currentTarget.dataset.startY = String(e.clientY); }}
                        onPointerUp={(e) => {
                          const startY = Number(e.currentTarget.dataset.startY || e.clientY);
                          if (startY - e.clientY > 28) setSetupSelected(i);
                        }}
                      >
                        <PotSymbol symbol={potSymbol(item)} />
                        <span>{item.id === "patrimonio_manuela" ? "Manuela" : item.name}</span>
                        <b>{item.value}%</b>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="icon-button carousel-arrow"
                    aria-label="Próximo pote"
                    onClick={() => setSetupSelected((setupSelected + 1) % setupTargets.length)}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <small className="muted setup-swipe-hint">Passe pelas opções e arraste um pote para cima para focar nele.</small>

                {Object.keys(preview).length > 0 && (
                  <div className="allocation-preview setup-preview">
                    <strong>Como esse aporte será separado</strong>
                    {Object.entries(preview)
                      .filter(([, amount]) => amount > 0)
                      .map(([id, amount]) => (
                        <div key={id}>
                          <span>{id === MARKETPLACE_ID ? "Mercado Livre" : setupTargets.find((x) => x.id === id)?.name || (id === "free" ? "Contas + saldo não alocado" : "Sem distribuição")}</span>
                          <b>{cash(amount)}</b>
                        </div>
                      ))}
                  </div>
                )}
              </section>
            )}

            {setupStep === 3 && (
              <section className="setup-ready" aria-live="polite">
                <div className="ready-check"><Check size={34} /></div>
                <span className="eyebrow">PLANO CONFIGURADO</span>
                <h2>Seu planejamento está pronto.</h2>
                <p>Patrimônios, contas, Mercado Livre e potes já foram calculados. Você será levado ao dashboard.</p>
                <button type="button" className="primary" onClick={close}>Ir para o Dashboard</button>
              </section>
            )}
          </div>
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
                  (x) =>
                    x.active &&
                    x.mode === "percent" &&
                    x.id !== p?.id &&
                    potAllocationBase(x) === (p ? potAllocationBase(p) : "remainder"),
                )
                .reduce((sum, x) => sum + x.value, 0)
            }
            step={1}
            onChange={(n) => setValue(String(n))}
          />
        ) : (
          modal.type !== "rule" && modal.type !== "setup" && (
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
        {((modal.type === "entry" && modal.kind !== "expense") ||
          modal.type === "bill" ||
          modal.type === "goal") && (
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
          (modal.type === "entry" && modal.kind !== "income")) && (
          <Field
            label={
              modal.type === "entry" && modal.kind === "transfer"
                ? "Pote de origem"
                : modal.type === "entry" && modal.kind === "expense"
                  ? "De qual pote saiu?"
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
              {modal.type === "entry" && modal.kind === "expense"
                ? expenseOptions
                : modal.type === "entry" && modal.kind === "transfer"
                  ? transferSourceOptions
                  : ruleOptions}
            </select>
          </Field>
        )}
        {suggestion && <small className="muted">{suggestion}</small>}
        {modal.type === "entry" && modal.kind === "transfer" && (
          <>
            <Field label="Pote de destino">
              <select
                required
                value={dest}
                onChange={(e) => setDest(e.target.value)}
              >
                <option value="">Escolha o destino</option>
                {destinationOptions}
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
                value={p && potAllocationBase(p) === "gross" ? "percent" : mode}
                disabled={!!p && potAllocationBase(p) === "gross"}
                onChange={(e) => setMode(e.target.value as "percent" | "fixed")}
              >
                <option value="percent">
                  {p && potAllocationBase(p) === "gross"
                    ? "Porcentagem do aporte bruto"
                    : "Porcentagem do restante"}
                </option>
                {(!p || potAllocationBase(p) === "remainder") && (
                  <option value="fixed">Valor fixo por aporte</option>
                )}
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
                      allocationBase: p ? potAllocationBase(p) : "remainder",
                    },
                  ];
                  const parts = allocateContribution(
                    100000,
                    [
                      ...next,
                      ...(f.marketplace.active && f.marketplace.percent > 0
                        ? [marketplacePolicyPot(f.marketplace)]
                        : []),
                    ],
                    0,
                  );
                  return Object.entries(parts)
                    .filter(([, v]) => v > 0)
                    .map(([id, v]) => (
                      <div key={id}>
                        <span>
                          {id === MARKETPLACE_ID
                            ? "Mercado Livre"
                            : next.find((p) => p.id === id)?.name || "Sem distribuição"}
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
            <Field label="Por quantos meses? (0 = recorrente)">
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
                    (p) =>
                      p.active &&
                      p.mode === "percent" &&
                      p.id !== g?.pot &&
                      potAllocationBase(p) === "remainder",
                  )
                  .reduce((sum, p) => sum + p.value, 0)
              }
              step={1}
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
        {modal.type !== "setup" && Object.keys(preview).length > 0 && (
          <div className="allocation-preview">
            <strong>Distribuição deste aporte</strong>
            {Object.entries(preview).map(([id, v]) => (
              <div key={id}>
                <span>
                  {existingPolicy.find(
                    (p) => p.id === id,
                  )?.name || "Sem distribuição"}
                </span>
                <b>{cash(v)}</b>
              </div>
            ))}
          </div>
        )}
        {modal.type === "setup" ? (
          setupStep < 3 && (
            <footer className="modal-footer setup-footer">
              {setupStep === 0 ? (
                <button type="button" className="secondary" onClick={close}>Cancelar</button>
              ) : (
                <button type="button" className="secondary" onClick={() => setSetupStep((s) => Math.max(0, s - 1))}>
                  <ChevronLeft size={16} /> Voltar
                </button>
              )}
              <button className="primary" type="submit" disabled={saving}>
                {saving ? "Salvando…" : setupStep === 2 ? "Finalizar planejamento" : "Continuar"}
                {!saving && <ChevronRight size={16} />}
              </button>
            </footer>
          )
        ) : (
          <footer className="modal-footer">
            <button type="button" className="secondary" onClick={close}>Cancelar</button>
            <button className="primary" type="submit" disabled={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </footer>
        )}
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
