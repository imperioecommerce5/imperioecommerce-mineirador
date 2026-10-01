import { useState } from "react";
import {
  browserSessionPersistence,
  setPersistence,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import FinanceCenterView from "./components/FinanceCenterView";
import { ArrowRight, User, Users } from "lucide-react";
import { Actor } from "./finance/model";
import "./finance/finance.css";

export default function App() {
  const demo =
    new URLSearchParams(window.location.search).get("demo") === "1" ||
    document.documentElement.dataset.demo === "true";
  const fixture = demo ? document.documentElement.dataset.demoProfile : null;
  const [session, setSession] = useState<Actor | null>(
    fixture === "voce" || fixture === "esposa" ? fixture : null,
  );
  const [loadingProfile, setLoadingProfile] = useState<Actor | null>(null);
  const [error, setError] = useState("");

  async function loginAs(profile: Actor) {
    setError("");
    setLoadingProfile(profile);
    try {
      if (!demo) {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile }),
          credentials: "same-origin",
        });
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json"))
          throw new Error(
            "A função de acesso não respondeu corretamente. Faça um novo deploy desta versão na Vercel.",
          );
        const data = await response.json();
        if (!response.ok || !data.token)
          throw new Error(
            data.error ||
              (response.status === 503
                ? "Este deploy não recebeu a configuração de acesso do Firebase."
                : "Não foi possível entrar."),
          );
        await setPersistence(auth, browserSessionPersistence);
        await signInWithCustomToken(auth, data.token);
      }
      setSession(profile);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingProfile(null);
    }
  }

  async function logout() {
    if (!demo) await signOut(auth);
    setSession(null);
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
          Cada movimento, com o nome de quem registrou.
        </span>
      </div>
      <main className="login-form">
        <div className="login-profile-panel">
          <span className="eyebrow">BEM-VINDOS AO SEU IMPÉRIO</span>
          <h2>
            Quem está
            <br />
            entrando agora?
          </h2>
          <p>Toque no seu perfil para entrar. Não é necessário digitar senha.</p>
          <div
            className="profile-picker"
            role="group"
            aria-label="Quem está entrando"
          >
            <button
              type="button"
              disabled={!!loadingProfile}
              onClick={() => loginAs("voce")}
            >
              <User size={25} />
              <strong>{loadingProfile === "voce" ? "Entrando…" : "Rhuan"}</strong>
              <span>Entrar como Rhuan</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              disabled={!!loadingProfile}
              onClick={() => loginAs("esposa")}
            >
              <Users size={25} />
              <strong>{loadingProfile === "esposa" ? "Entrando…" : "Anne"}</strong>
              <span>Entrar como Anne</span>
              <ArrowRight size={16} />
            </button>
          </div>
          {error && (
            <div className="notice danger" role="alert">
              {error}
            </div>
          )}
          <p className="login-security">
            As movimentações ficam identificadas como Rhuan ou Anne no extrato.
          </p>
          {demo ? (
            <p className="demo-login-note">
              Demonstração com dados fictícios: escolha Rhuan ou Anne para entrar.
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
