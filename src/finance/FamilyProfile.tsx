import { useState } from "react";
import {
  Award,
  Crown,
  ShieldCheck,
  TrendingUp,
  LockKeyhole,
  Check,
} from "lucide-react";
import { Finance, today, monthDate } from "./model";
import { familyEvolution } from "./evolution";

export function FamilyProfile({
  f,
  cash,
  hidden,
}: {
  f: Finance;
  cash: (n: number) => string;
  hidden: boolean;
}) {
  const evolution = familyEvolution(f);
  const thisMonth = evolution.history.find((m) => m.month === today().slice(0, 7));
  const [selected, setSelected] = useState(today().slice(0, 7));
  const [period, setPeriod] = useState(6);
  const [medal, setMedal] = useState<string | null>(null);
  const history = Array.from({ length: period }, (_, i) => {
    const month = monthDate(`${today().slice(0, 7)}-01`, i - period + 1).slice(
      0,
      7,
    );
    return (
      evolution.history.find((m) => m.month === month) || {
        month,
        income: 0,
        expense: 0,
        saved: 0,
        xp: 0,
        completed: month < today().slice(0, 7),
      }
    );
  });
  const active =
    history.find((m) => m.month === selected) || history[history.length - 1];
  const max = Math.max(1, ...history.map((m) => m.saved));
  return (
    <>
      <section className="family-rank panel">
        <div className="rank-emblem" aria-hidden="true">
          <Crown size={34} strokeWidth={1.3} />
        </div>
        <div className="rank-copy">
          <p className="eyebrow">EVOLUÇÃO DA FAMÍLIA</p>
          <h2>{evolution.title}</h2>
          <p>Rhuan e Anne · Nível {evolution.level}</p>
          <div
            className="rank-progress"
            role="progressbar"
            aria-label="Progresso do nível"
            aria-valuenow={Math.round(evolution.progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${evolution.progress}%` }} />
          </div>
          <small>
            {evolution.xp} XP{" "}
            {evolution.next
              ? `· ${evolution.next - evolution.xp} para o próximo nível`
              : "· Nível máximo alcançado"}
          </small>
          <small>
            Destinado aos patrimônios neste mês: {cash(thisMonth?.saved || 0)}.
            O XP do mês é apurado quando ele termina.
          </small>
        </div>
      </section>
      <section className="profile-grid">
        <div className="panel family-chart">
          <header className="section-heading">
            <div>
              <h2>Valores destinados aos patrimônios</h2>
              <p>Entradas e transferências para as reservas protegidas</p>
            </div>
            <div className="period-switch" aria-label="Período do gráfico">
              {[6, 12].map((n) => (
                <button
                  key={n}
                  aria-pressed={period === n}
                  onClick={() => setPeriod(n)}
                >
                  {n} meses
                </button>
              ))}
            </div>
          </header>
          <div className="chart-reading" aria-live="polite">
            <small>
              {active.month.split("-").reverse().join("/")}{" "}
              {active.completed ? "" : "· Em andamento"}
            </small>
            <strong>{cash(active.saved)}</strong>
            <span>
              {active.xp} XP{" "}
              {active.completed ? "no mês" : "· Apuração ao concluir o mês"}
            </span>
          </div>
          {hidden ? (
            <p className="chart-private">Valores e gráfico ocultos</p>
          ) : (
            <div
              className="family-bars"
              role="group"
              aria-label="Selecionar mês"
            >
              {history.map((m) => (
                <button
                  key={m.month}
                  aria-pressed={active.month === m.month}
                  aria-label={`${m.month}: ${cash(m.saved)}`}
                  onClick={() => setSelected(m.month)}
                >
                  <span className="family-bar-track">
                    <i
                      style={{
                        height: `${Math.max(2, (m.saved / max) * 100)}%`,
                      }}
                    />
                  </span>
                  <small>
                    {m.month.slice(5)}/{m.month.slice(2, 4)}
                  </small>
                </button>
              ))}
            </div>
          )}
          <p className="muted">
            Toque em um mês para consultar. Inclui transferências do Mercado Livre
            para os patrimônios, sem tratá-las como novas receitas. Meses sem
            registros aparecem com zero e não comprovam ausência de atividade.
          </p>
        </div>
        <div className="panel insights-panel">
          <header className="section-heading">
            <h2>Como estamos indo</h2>
          </header>
          {evolution.insights.map((item) => (
            <div
              className={`insight-row ${item.good ? "good" : "attention"}`}
              key={item.title}
            >
              <span>
                {item.good ? <Check size={18} /> : <TrendingUp size={18} />}
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <header className="section-heading">
          <div>
            <h2>Nossas conquistas</h2>
            <p>Organização e constância, um mês de cada vez.</p>
          </div>
        </header>
        <div className="achievement-grid">
          {evolution.medals.map((m, i) => {
            const Icon = [ShieldCheck, Award, Crown, Check][i];
            return (
              <button
                className={`achievement ${m.unlocked ? "unlocked" : "locked"}`}
                key={m.id}
                aria-expanded={medal === m.id}
                onClick={() => setMedal(medal === m.id ? null : m.id)}
              >
                <span className="medal-icon">
                  <Icon size={26} strokeWidth={1.5} />
                </span>
                <strong>{m.name}</strong>
                <small>
                  {m.unlocked ? (
                    "Conquistada"
                  ) : (
                    <>
                      <LockKeyhole size={11} /> A conquistar
                    </>
                  )}
                </small>
                {medal === m.id && <p>{m.description}</p>}
              </button>
            );
          })}
        </div>
      </section>
      <details className="panel rank-rules">
        <summary>Como funciona nossa evolução?</summary>
        <p>
          20 XP pela configuração inicial. Em cada mês completo: 20 XP por ter
          aporte pessoal, 20 XP por distribuir parte dele aos patrimônios, 20 XP
          por gastos pagos até o total de aportes e 20 XP por ter contas
          recorrentes sem pendências registradas. Cada critério pontua uma vez
          no mês, independentemente do valor ou da quantidade de movimentos.
        </p>
        <p>
          O mês atual só pontua após terminar. Exclusões e correções recalculam
          a evolução. Transferências, inclusive do Mercado Livre para patrimônios,
          aparecem nos valores destinados às reservas, mas não geram XP por si.
          Não é uma nota de crédito nem uma comparação com outras famílias.
        </p>
        <p>
          O histórico atual não registra todas as datas originais de vencimento
          nem metas mensais de aporte ou saldos de dívidas. Por isso, não
          afirmamos pontualidade passada, cumprimento de metas não cadastradas
          ou redução de dívidas sem esses dados.
        </p>
      </details>
    </>
  );
}
