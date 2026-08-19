import React from 'react';
import { Target, Truck, PlusCircle, Menu, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onNavigate,
  currentView,
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors duration-150">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center font-black text-amber-400 text-base shadow-2xs group-hover:scale-105 transition-transform border border-slate-800">
                I<span className="text-white text-xs">M</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-slate-950 dark:text-white">
                    IMPERIO<span className="text-amber-500">ECOMMERCE</span>
                  </span>
                  <span className="text-2xs font-extrabold px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800 uppercase tracking-wider">
                    Mineirador
                  </span>
                </div>
                <p className="text-2xs text-slate-400 font-medium">
                  Análise & Mineração de Produtos Mercado Livre
                </p>
              </div>
            </button>
          </div>

          {/* Center Badges (Meta & Full) */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-300 text-xs font-bold shadow-2xs">
              <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>META MÍNIMA: 3 VENDAS/DIA (≈ 90/MÊS)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-300 text-xs font-bold shadow-2xs">
              <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>OPERAÇÃO: MERCADO LIVRE FULL</span>
            </div>
          </div>

          {/* Right Action & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Switcher */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  theme === 'light'
                    ? 'bg-white text-amber-600 shadow-2xs font-extrabold'
                    : 'hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Tema Claro"
                aria-label="Tema Claro"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-3xs uppercase tracking-tight">Claro</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  theme === 'dark'
                    ? 'bg-slate-900 text-amber-400 shadow-2xs font-extrabold border border-slate-700'
                    : 'hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Tema Escuro"
                aria-label="Tema Escuro"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-3xs uppercase tracking-tight">Escuro</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  theme === 'system'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                    : 'hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Tema do Sistema (Automático)"
                aria-label="Tema Automático do Sistema"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-3xs uppercase tracking-tight">Auto</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('nova-analise')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                currentView === 'nova-analise'
                  ? 'bg-amber-500 text-slate-950 border border-amber-400'
                  : 'bg-amber-400 hover:bg-amber-500 text-slate-950 border border-amber-300'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Análise</span>
              <span className="sm:hidden">Analisar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

