import { storage } from "./storage";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  doc,
  onSnapshot,
  runTransaction,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Finance,
  empty,
  migrate,
  validateFinance,
  generateRecurring,
  entry,
  today,
  Actor,
  attributeChanges,
  uid,
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
export function useFinance(demo: boolean, actor: Actor) {
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
          "Não foi possível acessar o Firebase. Confira sua conexão e as regras de acesso. Não há salvamento offline; reconecte para registrar alterações.",
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
    async (transform: (f: Finance) => Finance, backupBefore = false) => {
      if (!ref.current || busy.current)
        throw new Error("Aguarde o carregamento ou o salvamento atual.");
      busy.current = true;
      setSaving(true);
      setStatus("Sincronizando");
      setError("");
      try {
        const expected = ref.current.revision;
        const backupId = uid();

        let saved: Finance;
        if (demo) {
          if (
            backupBefore &&
            !storage.setItem("imperio_last_reset", JSON.stringify(ref.current))
          )
            throw new Error(
              "Não foi possível guardar a cópia anterior. O reset foi cancelado.",
            );
          saved = attributeChanges(
            ref.current,
            transform(structuredClone(ref.current)),
            actor,
          );
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
            const next = attributeChanges(
              current,
              transform(structuredClone(current)),
              actor,
            );
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
            if (backupBefore)
              tx.set(doc(db, "imperio_finance_backups", backupId), {
                financeV2: current,
                createdAt: serverTimestamp(),
                createdBy: actor,
              });
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
    [demo, receive, actor],
  );
  useEffect(() => {
    if (!data || saving || (!demo && status !== "Salvo")) return;
    const generated = generateRecurring(data);
    if (generated.entries.length !== data.entries.length)
      save((f) => generateRecurring(f)).catch(() => {});
  }, [data, saving, status, demo, save]);
  async function lastReset(): Promise<Finance> {
    if (demo) {
      const raw = storage.getItem("imperio_last_reset");
      if (!raw) throw new Error("Ainda não há cópia de reset para recuperar.");
      const f = JSON.parse(raw);
      validateFinance(f);
      return migrate({ financeV2: f });
    }
    const snap = await getDocs(
      query(
        collection(db, "imperio_finance_backups"),
        orderBy("createdAt", "desc"),
        limit(1),
      ),
    );
    if (snap.empty)
      throw new Error("Ainda não há cópia de reset para recuperar.");
    return migrate(snap.docs[0].data());
  }
  return { data, save, status, error, saving, lastReset };
}
