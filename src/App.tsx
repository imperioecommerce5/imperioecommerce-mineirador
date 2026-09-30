import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import FinanceCenterView from "./components/FinanceCenterView";
import { ArrowRight, ShieldCheck } from "lucide-react";
export default function App() {
  const demo =
    new URLSearchParams(window.location.search).get("demo") === "1" ||
    document.documentElement.dataset.demo === "true";
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(!demo),
    [error, setError] = useState("");
  useEffect(() => {
    if (demo) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, [demo]);
  async function login() {
    try {
      setError("");
      await signInWithPopup(auth, googleProvider);
    } catch {
      setError(
        "Não foi possível entrar. Confira se o acesso Google está ativado e se este domínio está autorizado no Firebase.",
      );
    }
  }
  if (demo || user)
    return (
      <FinanceCenterView
        demo={demo}
        onLogout={() =>
          demo
            ? window.location.assign(window.location.pathname)
            : signOut(auth)
        }
      />
    );
  return (
    <div className="login-page">
      <div className="login-story">
        <span className="wordmark">
          IMPÉRIO<span>FINANCEIRO</span>
        </span>
        <div>
          <p className="eyebrow">CONTROLE COM CLAREZA</p>
          <h1>
            Seu dinheiro.
            <br />
            Suas prioridades.
          </h1>
          <p>
            Uma visão simples do que entra, do que sai e do que você está
            construindo.
          </p>
        </div>
        <span className="login-foot">
          Planeje o presente. Construa o futuro.
        </span>
      </div>
      <main className="login-form">
        <div>
          <span className="eyebrow">BEM-VINDO AO SEU IMPÉRIO</span>
          <h2>
            Vamos organizar
            <br />o próximo passo.
          </h2>
          <p>
            Acesse sua conta para continuar o planejamento financeiro da
            família.
          </p>
          {error && (
            <div className="notice danger" role="alert">
              {error}
            </div>
          )}
          <button
            className="primary login-button"
            onClick={login}
            disabled={loading}
          >
            {loading ? "Carregando" : "Entrar com Google"}
            <ArrowRight size={18} />
          </button>
          <p className="login-security">
            <ShieldCheck size={16} /> Acesso autenticado com sua conta Google
          </p>
          <a href="?demo=1" className="text-button">
            Conhecer a demonstração
          </a>
        </div>
      </main>
    </div>
  );
}
