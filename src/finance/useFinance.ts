import { storage } from "./storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { doc, onSnapshot, runTransaction } from "firebase/firestore";
import { db } from "../firebase";
import {
  Finance,
  empty,
  migrate,
  validateFinance,
  generateRecurring,
  entry,
  today,
} from "./model";
const KEY = "meu_imperio_finance_v2";
export function demoData(): Finance {
  const f = empty();
  f.configured = true;
  f.entries = [
    entry(
      {
        id: "demo-income",
        kind: "income",
        description: "Aporte do mês",
        cents: 1000000,
        date: today(),
      },
      f.pots,
    ),
    entry(
      {
        id: "demo-expense",
        kind: "expense",
        description: "Compras da semana",
        cents: 32750,
        date: today(),
        pot: "supermercado",
      },
      f.pots,
    ),
    entry(
      {
        id: "demo-bill",
        kind: "expense",
        description: "Internet residencial",
        cents: 11990,
        date: today(),
        status: "pending",
        pot: "free",
      },
      f.pots,
    ),
  ];
  f.goals = [
    {
      id: "demo-goal",
      name: "Reserva de emergência",
      target: 2000000,
      pot: "nosso_patrimonio",
      opening: 0,
      deadline: `${Number(today().slice(0, 4)) + 1}-06-30`,
    },
  ];
  return f;
}
export function useFinance(demo: boolean) {
  const [data, setData] = useState<Finance | null>(null);
  const [status, setStatus] = useState("Carregando");
  const [error, setError] = useState("");
  const ref = useRef<Finance | null>(null);
  const busy = useRef(false);
  const [saving, setSaving] = useState(false);
  const receive = useCallback((f: Finance) => {
    ref.current = f;
    setData(f);
  }, []);
  useEffect(() => {
    if (demo) {
      const raw = storage.getItem("imperio_demo");
      try {
        receive(raw ? JSON.parse(raw) : demoData());
      } catch {
        receive(demoData());
      }
      setStatus("Demonstração local");
      return;
    }
    const stop = onSnapshot(
      doc(db, "imperio_finance", "familia_imperio"),
      (snap) => {
        try {
          const f = migrate(snap.exists() ? snap.data() : null);
          if (!busy.current) {
            receive(f);
            storage.setItem(KEY, JSON.stringify(f));
            setStatus("Salvo");
            setError("");
          }
        } catch (e) {
          setError((e as Error).message);
          setStatus("Falha ao carregar");
        }
      },
      () => {
        setStatus("Sem conexão com a nuvem");
        setError(
          "Não foi possível acessar o Firebase. Confira sua conexão e as regras de acesso. Edições ficam bloqueadas para evitar conflitos.",
        );
        const backup = storage.getItem(KEY);
        if (backup) {
          try {
            const f = JSON.parse(backup);
            validateFinance(f);
            receive(f);
          } catch {
            setError("O backup local não pôde ser lido.");
          }
        }
      },
    );
    return stop;
  }, [demo, receive]);
  const save = useCallback(
    async (transform: (f: Finance) => Finance) => {
      if (!ref.current || busy.current)
        throw new Error("Aguarde o carregamento ou o salvamento atual.");
      busy.current = true;
      setSaving(true);
      setStatus("Sincronizando");
      setError("");
      try {
        const expected = ref.current.revision;
        let saved: Finance;
        if (demo) {
          saved = transform(structuredClone(ref.current));
          saved.revision = expected + 1;
          validateFinance(saved);
          storage.setItem("imperio_demo", JSON.stringify(saved));
        } else {
          saved = await runTransaction(db, async (tx) => {
            const target = doc(db, "imperio_finance", "familia_imperio");
            const snap = await tx.get(target);
            const current = migrate(snap.exists() ? snap.data() : null);
            if (current.revision !== expected)
              throw new Error(
                "Os dados mudaram em outro dispositivo. Atualize a página e tente novamente.",
              );
            const next = transform(structuredClone(current));
            next.revision = current.revision + 1;
            validateFinance(next);
            // Keep every legacy field as a rollback copy; only financeV2 is written.
            if (
              new TextEncoder().encode(
                JSON.stringify({
                  ...(snap.exists() ? snap.data() : {}),
                  financeV2: next,
                }),
              ).length > 850000
            )
              throw new Error(
                "O histórico está próximo do limite deste formato de armazenamento. Exporte um backup e solicite a migração para lançamentos individuais antes de continuar.",
              );
            tx.set(target, { financeV2: next }, { merge: true });
            return next;
          });
          storage.setItem(KEY, JSON.stringify(saved));
        }
        receive(saved);
        setStatus(demo ? "Demonstração local" : "Salvo");
        return saved;
      } catch (e) {
        const message = (e as Error).message;
        setStatus("Falha ao salvar");
        setError(message);
        throw e;
      } finally {
        busy.current = false;
        setSaving(false);
      }
    },
    [demo, receive],
  );
  useEffect(() => {
    if (!data || saving || (!demo && status !== "Salvo")) return;
    const generated = generateRecurring(data);
    if (generated.entries.length !== data.entries.length)
      save((f) => generateRecurring(f)).catch(() => {});
  }, [data, saving, status, demo, save]);
  return { data, save, status, error, saving };
}
