import { useState, FormEvent } from "react";
import {
  browserSessionPersistence,
  setPersistence,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import FinanceCenterView from "./components/FinanceCenterView";
import { ArrowRight, User, Users, LockKeyhole } from "lucide-react";
import { Actor, actorName } from "./finance/model";
import "./finance/finance.css";
export default function App() {
  const demo =
    new URLSearchParams(window.location.search).get("demo") === "1" ||
    document.documentElement.dataset.demo === "true";
  const fixture = demo ? document.documentElement.dataset.demoProfile : null;
  const [session, setSession] = useState<Actor | null>(
    fixture === "voce" || fixture === "esposa" ? fixture : null,
  );
  const [selected, setSelected] = useState<Actor | null>(null),
    [pin, setPin] = useState(""),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  async function login(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!selected) {
      setError("Escolha quem está entrando.");
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setError("Informe os quatro números da senha.");
      return;
    }
    setLoading(true);
    try {
      if (!demo) {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: selected, pin }),
          credentials: "same-origin",
        });
        const data = await response.json().catch(() => ({
          error:
            "O acesso por senha não está disponível. Confira a configuração na Vercel.",
        }));
        if (!response.ok || !data.token)
          throw new Error(data.error || "Não foi possível entrar.");
        await setPersistence(auth, browserSessionPersistence);
        await signInWithCustomToken(auth, data.token);
      }
      setPin("");
      setSession(selected);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  async function logout() {
    if (!demo) await signOut(auth);
    setSession(null);
    setSelected(null);
    setPin("");
    setError("");
  }
  if (session)
    return <FinanceCenterView actor={session} demo={demo} onLogout={logout} />;
  return (
    <div className="login-page">
      <div className="login-story">
        <span className="wordmark">
          IMPÉRIO<span>FINANCEIRO</span>
        </span>
        <div>
          <p className="eyebrow">PLANEJAMENTO DA FAMÍLIA</p>
          <h1>
            Um plano.
            <br />
            Duas pessoas.
          </h1>
          <p>Organizem o dinheiro juntos, com clareza sobre cada decisão.</p>
        </div>
        <span className="login-foot">
          Cada movimento, com sua identificação.
        </span>
      </div>
      <main className="login-form">
        <form onSubmit={login}>
          <span className="eyebrow">BEM-VINDOS AO SEU IMPÉRIO</span>
          <h2>
            Quem está
            <br />
            entrando agora?
          </h2>
          <p>Selecione seu perfil e digite a senha da família.</p>
          <div
            className="profile-picker"
            role="group"
            aria-label="Quem está entrando"
          >
            <button
              type="button"
              aria-pressed={selected === "voce"}
              className={selected === "voce" ? "selected" : ""}
              onClick={() => setSelected("voce")}
            >
              <User size={25} />
              <strong>Você</strong>
              <span>Perfil pessoal</span>
            </button>
            <button
              type="button"
              aria-pressed={selected === "esposa"}
              className={selected === "esposa" ? "selected" : ""}
              onClick={() => setSelected("esposa")}
            >
              <Users size={25} />
              <strong>Sua esposa</strong>
              <span>Perfil pessoal</span>
            </button>
          </div>
          <label className="field login-pin">
            <span>Senha numérica</span>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4}"
              minLength={4}
              maxLength={4}
              autoComplete="current-password"
              aria-label="Senha numérica"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              required
            />
          </label>
          {error && (
            <div className="notice danger" role="alert">
              {error}
            </div>
          )}
          <button
            className="primary login-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Entrando…"
              : `Entrar${selected ? " como " + actorName(selected) : ""}`}
            <ArrowRight size={18} />
          </button>
          <p className="login-security">
            <LockKeyhole size={15} /> Os lançamentos registram o perfil
            selecionado.
          </p>
          {demo ? (
            <p className="demo-login-note">
              Demonstração com dados fictícios: escolha um perfil e digite
              quatro números.
            </p>
          ) : (
            <a href="?demo=1" className="text-button">
              Conhecer a demonstração
            </a>
          )}
        </form>
      </main>
    </div>
  );
}
