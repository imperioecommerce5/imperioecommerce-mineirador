import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  PackageCheck,
  Trophy,
  Scale,
  Settings,
  X,
  Target,
  Truck,
  Sparkles,
  TrendingUp,
  Warehouse,
  DollarSign,
} from 'lucide-react';
import { ProductAnalysis } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  products: ProductAnalysis[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  products,
  isMobileOpen,
  onCloseMobile,
}) => {
  const totalProducts = products.length;
  const entrarCount = products.filter((p) => p.scoreBreakdown.recommendation === 'ENTRAR').length;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'nova-analise',
      label: 'Nova Análise',
      icon: PlusCircle,
      badge: 'Novo',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    },
    {
      id: 'produtos',
      label: 'Produtos Analisados',
      icon: PackageCheck,
      badge: totalProducts > 0 ? totalProducts : null,
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    },
    {
      id: 'ranking',
      label: 'Ranking',
      icon: Trophy,
      badge: entrarCount > 0 ? `${entrarCount} Entrar` : null,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    },
    {
      id: 'comparador',
      label: 'Comparador',
      icon: Scale,
      badge: null,
    },
    {
      id: 'estoque',
      label: 'Estoque',
      icon: Warehouse,
      badge: null,
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      icon: DollarSign,
      badge: null,
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      badge: null,
    },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="space-y-6">
        {/* Mobile Header in Drawer */}
        <div className="lg:hidden flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">IMPERIOECOMMERCE</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-2xs font-black px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              MINEIRADOR
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Nav Items */}
        <div className="space-y-1.5">
          <p className="px-3 text-2xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navegação Principal
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs border border-amber-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                      isActive ? 'bg-slate-950 text-amber-400 border-slate-900' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info in Sidebar */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-2xs font-semibold text-slate-500 dark:text-slate-400">
          <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Meta mínima: 3 vendas/dia (≈ 90/mês)</span>
        </div>
        <div className="flex items-center gap-2 text-2xs font-semibold text-slate-500 dark:text-slate-400">
          <Truck className="w-3.5 h-3.5 text-slate-700 dark:text-slate-400" />
          <span>Logística: Full Fulfillment</span>
        </div>
        <p className="text-2xs text-slate-400 dark:text-slate-500 font-medium pt-1">
          v1.0 • IMPERIOECOMMERCE
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-5rem)] transition-colors duration-150">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 z-40 lg:hidden backdrop-blur-2xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-xl transform transition-transform duration-200 ease-in-out lg:hidden border-r dark:border-slate-800 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </div>
    </>
  );
};
