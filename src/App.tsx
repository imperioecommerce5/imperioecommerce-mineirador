import React, { useState } from 'react';
import FinanceCenterView from './components/FinanceCenterView';
import { Lock, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

const SENHA_AUTORIZADA = "0803";
const EMAIL_FIXO = "imperioecommerce5@gmail.com";

export function App() {
  const [estaLogado, setEstaLogado] = useState<boolean>(false);
  const [animandoLogin, setAnimandoLogin] = useState<boolean>(false);
  const [senhaInput, setSenhaInput] = useState('');
  const [erroLogin, setErroLogin] = useState<string | null>(null);

  const realizarLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senhaInput) {
      setErroLogin("Por favor, digite a senha de acesso.");
      return;
    }

    if (senhaInput.trim() === SENHA_AUTORIZADA) {
      setErroLogin(null);
      setAnimandoLogin(true); // Dispara a animação de boas-vindas
    } else {
      setErroLogin("Senha incorreta! Acesso negado.");
    }
  };

  const fazerLogout = () => {
    setEstaLogado(false);
    setAnimandoLogin(false);
    setSenhaInput('');
  };

  if (estaLogado) {
    return <FinanceCenterView emailUsuario={EMAIL_FIXO} onLogout={fazerLogout} />;
  }

  // TELA DE ANIMAÇÃO / MENSAGEM DE BOAS-VINDAS COM RESUMO APÓS LOGIN
  if (animandoLogin) {
    const rendaSalva = localStorage.getItem('@meu_imperio_renda') || '0';
    return (
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center p-4 font-sans select-none">
        <div className="max-w-md w-full bg-[#121824] border border-emerald-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center animate-bounce shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-emerald-500">Bem-vindo ao seu Império!</h2>
            <p className="text-xs text-slate-400 font-medium">Acessando seus potes e controle financeiro...</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Status Atual</span>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-300">Meta de Renda:</span>
              <span className="font-mono text-emerald-500">R$ {Number(rendaSalva).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <button
            onClick={() => setEstaLogado(true)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm"
          >
            Entrar no Painel <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center p-4 font-sans select-none">
      <div className="max-w-md w-full bg-[#121824] border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-emerald-500 tracking-tight">MEU IMPÉRIO</h1>
          <p className="text-xs text-slate-400 font-semibold">Acesso Restrito por Senha</p>
        </div>

        {erroLogin && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 flex items-start gap-2.5 text-rose-400 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{erroLogin}</span>
          </div>
        )}

        <form onSubmit={realizarLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 block">Digite a Senha de Acesso</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
              <input
                type="password"
                placeholder="••••"
                value={senhaInput}
                onChange={(e) => setSenhaInput(e.target.value)}
                autoFocus
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3.5 pl-10 pr-4 text-base tracking-widest font-black text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm"
          >
            Entrar no Sistema <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/60">
          <span className="text-[11px] text-slate-500">Sistema protegido por senha exclusiva</span>
        </div>

      </div>
    </div>
  );
}

export default App;
