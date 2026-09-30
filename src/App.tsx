import { useState } from "react";
import {
  browserSessionPersistence,
  setPersistence,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import FinanceCenterView from "./components/FinanceCenterView";
import { User, Users } from "lucide-react";
import type { Actor } from "./finance/model";
import "./finance/finance.css";

export default function App() {
  const demo =
    new URLSearchParams(window.location.search).get("demo") === "1" ||
    document.documentElement.dataset.demo === "true";

  const fixture = demo
    ? document.documentElement.dataset.demoProfile
    : null;

  const [session, setSession] = useState<Actor | null>(
    fixture === "voce" || fixture === "esposa" ? fixture : null,
  );
  const [loading, setLoading] = useState<Actor | null>(null);
  const [error, setError] = useState("");

  async function login(profile: Actor) {
    if (loading) return;

    setError("");
    setLoading(profile);

    try {
      if (!demo) {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile }),
          credentials: "same-origin",
        });

        const data = await response.json().catch(() => ({
          error: "O serviço de acesso está indisponível.",
        }));

        if (!response.ok || !data.token) {
          throw new Error(data.error || "Não foi possível entrar.");
        }

        await setPersistence(auth, browserSessionPersistence);
        await signInWithCustomToken(auth, data.token);
      }

      setSession(profile);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível entrar.",
      );
    } finally {
      setLoading(null);
    }
  }

  async function logout() {
    try {
      if (!demo) await signOut(auth);
      setSession(null);
      setError("");
    } catch {
      setError("Não foi possível sair. Tente novamente.");
    }
  }

  if (session) {
    return (
      <FinanceCenterView
        actor={session}
        demo={demo}
        onLogout={logout}
      />
    );
  }

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
          <p>
            Organizem o dinheiro juntos, com clareza sobre cada decisão.
          </p>
        </div>

        <span className="login-foot">
          Cada movimento, com sua identificação.
        </span>
      </div>

      <main className="login-form">
        <div>
          <span className="eyebrow">BEM-VINDOS AO SEU IMPÉRIO</span>
          <h2>
            Quem está
            <br />
            entrando agora?
          </h2>
          <p>Toque no seu nome para entrar.</p>

          <div
            className="profile-picker"
            role="group"
            aria-label="Quem está entrando"
          >
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => void login("voce")}
            >
              <User size={25} />
              <strong>Rhuan</strong>
              <span>
                {loading === "voce" ? "Entrando…" : "Entrar"}
              </span>
            </button>

            <button
              type="button"
              disabled={loading !== null}
              onClick={() => void login("esposa")}
            >
              <Users size={25} />
              <strong>Anne</strong>
              <span>
                {loading === "esposa" ? "Entrando…" : "Entrar"}
              </span>
            </button>
          </div>

          {error && (
            <div className="notice danger" role="alert">
              {error}
            </div>
          )}

          <p className="login-security">
            Os lançamentos registram o perfil selecionado.
          </p>

          {demo ? (
            <p className="demo-login-note">
              Demonstração com dados fictícios.
            </p>
          ) : (
            <a href="?demo=1" className="text-button">
              Conhecer a demonstração
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
