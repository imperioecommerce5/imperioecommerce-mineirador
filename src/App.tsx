import React, { useState } from 'react';
import FinanceCenterView from './components/FinanceCenterView';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export function App() {
  const [estaLogado, setEstaLogado] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const realizarLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEstaLogado(true);
  };

  const loginComGoogle = () => {
    // Simula a autenticação com o Google e entra no app
    setEstaLogado(true);
  };

  // Se já estiver logado, exibe o aplicativo de finanças
  if (estaLogado) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans antialiased">
        <FinanceCenterView />
      </div>
    );
  }

  // Se não estiver logado, exibe a tela de login completa
  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center p-4 font-sans select-none">
      <div className="max-w-md w-full bg-[#121824] border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
        
        {/* CABEÇALHO DA TELA DE LOGIN */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-emerald-500 tracking-tight">MEU IMPÉRIO</h1>
          <p className="text-xs text-slate-400 font-semibold">Acesse seu Centro Financeiro</p>
        </div>

        {/* BOTÃO DE LOGIN COM GOOGLE */}
        <button
          onClick={loginComGoogle}
          type="button"
          className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-md text-sm active:scale-98"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continuar com o Google
        </button>

        {/* DIVISOR */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="px-3 text-[11px] text-slate-500 font-bold uppercase">ou e-mail</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* FORMULÁRIO TRADICIONAL (E-MAIL E SENHA) */}
        <form onSubmit={realizarLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 block">E-mail</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5" />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 block">Senha</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
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
          <span className="text-[11px] text-slate-500">Acesso seguro • Controle de caixa pessoal</span>
        </div>

      </div>
    </div>
  );
}

export default App;
