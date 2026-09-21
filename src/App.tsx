import React, { useState } from 'react';
import FinanceCenterView from './components/FinanceCenterView';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export function App() {
  const [estaLogado, setEstaLogado] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const realizarLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && senha) {
      setEstaLogado(true);
    } else {
      alert('Por favor, preencha o e-mail e a senha.');
    }
  };

  // Se já estiver logado, carrega o app financeiro
  if (estaLogado) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans antialiased">
        <FinanceCenterView />
      </div>
    );
  }

  // Se não estiver logado, exibe a tela de login
  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center p-4 font-sans select-none">
      <div className="max-w-md w-full bg-[#121824] border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-emerald-500 tracking-tight">MEU IMPÉRIO</h1>
          <p className="text-xs text-slate-400 font-semibold">Acesse seu Centro Financeiro</p>
        </div>

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
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm pt-4"
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
