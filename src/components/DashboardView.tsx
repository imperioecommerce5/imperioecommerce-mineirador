import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PlusCircle,
  Award,
  Sparkles,
  ArrowRight,
  Truck,
  Target,
  Scale,
  Flame,
} from 'lucide-react';
import { ProductAnalysis } from '../types';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

interface DashboardViewProps {
  products: ProductAnalysis[];
  onNavigate: (view: string) => void;
  onSelectProduct: (product: ProductAnalysis) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  onNavigate,
  onSelectProduct,
}) => {
  const totalAnalyzed = products.length;
  const approvedCount = products.filter((p) => p.scoreBreakdown.recommendation === 'ENTRAR').length;
  const analyzingCount = products.filter((p) => p.scoreBreakdown.recommendation === 'ANALISAR').length;
  const highRiskCount = products.filter((p) => p.scoreBreakdown.recommendation === 'ALTO_RISCO').length;
  const discardedCount = products.filter((p) => p.scoreBreakdown.recommendation === 'DESCARTAR').length;

  const topOpportunities = [...products]
    .sort((a, b) => b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore)
    .slice(0, 5);

  const getRecBadge = (rec: string) => {
    switch (rec) {
      case 'ENTRAR':
        return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'ANALISAR':
        return 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'ALTO_RISCO':
        return 'bg-orange-100 dark:bg-orange-950/70 text-orange-900 dark:text-orange-300 border-orange-300 dark:border-orange-800';
      default:
        return 'bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    }
  };

  return (
    <div className="w-full max-w-none space-y-6 pb-12">
      {/* Top Banner / Welcome */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-2xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Painel Executivo de Mineração</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              IMPERIO<span className="text-amber-400">ECOMMERCE</span> MINEIRADOR
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Avaliação algorítmica de produtos com potencial para atingir a meta mínima de{' '}
              <strong className="text-amber-400 font-bold">3 vendas por dia (≈ 90 vendas/mês)</strong> no{' '}
              <strong className="text-emerald-400 font-bold">Mercado Livre Full</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('nova-analise')}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 px-5 py-3 rounded-xl font-black text-xs shadow-xs transition-all border border-amber-300 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova Análise Avantpro</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('produtos')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-bold text-xs border border-slate-700 transition-all cursor-pointer"
            >
              <span>Ver Todos ({totalAnalyzed})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analisados */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-2xs font-bold uppercase tracking-wider">Produtos Minerados</span>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-950 dark:text-white">{totalAnalyzed}</span>
            <span className="text-xs text-slate-400 font-medium">cadastrados</span>
          </div>
          <p className="text-3xs text-slate-400 font-medium">Total de análises no banco</p>
        </div>

        {/* Recomendação: ENTRAR */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-2xs font-bold uppercase tracking-wider">Recomendados (ENTRAR)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-950 dark:text-emerald-300">{approvedCount}</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              {totalAnalyzed > 0 ? Math.round((approvedCount / totalAnalyzed) * 100) : 0}%
            </span>
          </div>
          <p className="text-3xs text-emerald-800 dark:text-emerald-300/80 font-medium">Score &gt;= 80 (Potencial &gt;= 5/dia)</p>
        </div>

        {/* Recomendação: ANALISAR */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-400">
            <span className="text-2xs font-bold uppercase tracking-wider">Em Análise / Estudo</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-950 dark:text-white">{analyzingCount}</span>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">
              {totalAnalyzed > 0 ? Math.round((analyzingCount / totalAnalyzed) * 100) : 0}%
            </span>
          </div>
          <p className="text-3xs text-amber-800 dark:text-amber-300/80 font-medium">Score 60 a 79 (Validar margem)</p>
        </div>

        {/* Recomendação: RISCO & DESCARTADOS */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
            <span className="text-2xs font-bold uppercase tracking-wider">Risco / Descartados</span>
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-950 dark:text-rose-300">{highRiskCount + discardedCount}</span>
            <span className="text-xs text-rose-700 dark:text-rose-400 font-bold">
              {highRiskCount} risco | {discardedCount} desc.
            </span>
          </div>
          <p className="text-3xs text-rose-800 dark:text-rose-300/80 font-medium">Score &lt; 60 (Pouca liquidez ou saturação)</p>
        </div>
      </div>

      {/* TOP OPPORTUNITIES LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Top Oportunidades Mineradas
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Produtos com maior pontuação no Score de 0 a 100
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('ranking')}
              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Ver Ranking Completo
            </button>
          </div>
        </div>

        {topOpportunities.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block w-full">
              <table className="w-full table-fixed text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-3xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    <th className="py-3 px-4 w-[34%]">Produto & Nicho</th>
                    <th className="py-3 px-2 w-[8%] text-center">Score</th>
                    <th className="py-3 px-2 w-[11%] text-center">Demanda 1ª Pág</th>
                    <th className="py-3 px-2 w-[9%] text-center">150+ /mês</th>
                    <th className="py-3 px-2 w-[11%] text-center">Novos Entrantes</th>
                    <th className="py-3 px-2 w-[9%] text-center">Sellers Full</th>
                    <th className="py-3 px-2 w-[9%] text-center">Recomendação</th>
                    <th className="py-3 px-4 w-[9%] text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                  {topOpportunities.map((product, index) => (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => onSelectProduct(product)}
                    >
                      <td className="py-3.5 px-4 min-w-0">
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-2xs flex items-center justify-center shrink-0">
                            #{index + 1}
                          </span>
                          <div className="min-w-0 space-y-0.5">
                            <strong
                              className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors block line-clamp-2 leading-snug"
                              title={product.name}
                            >
                              {product.name}
                            </strong>
                            <span className="text-3xs text-slate-400 block truncate">
                              {product.keyword}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-2 text-center whitespace-nowrap">
                        <span className="inline-flex items-baseline gap-0.5 font-black text-slate-950 dark:text-amber-400 text-sm">
                          {product.scoreBreakdown.totalScore}
                          <span className="text-3xs text-slate-400 font-bold">/100</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-2 text-center text-slate-700 dark:text-slate-200 font-bold whitespace-nowrap">
                        {formatNumber(product.metrics.totalPageSales)} un
                      </td>

                      <td className="py-3.5 px-2 text-center font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {product.metrics.adsMaking150Plus} ads
                      </td>

                      <td className="py-3.5 px-2 text-center font-bold text-purple-700 dark:text-purple-400 whitespace-nowrap">
                        {product.metrics.newEntrants300Plus} ads
                      </td>

                      <td className="py-3.5 px-2 text-center font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {product.metrics.fullCompetitors} no Full
                      </td>

                      <td className="py-3.5 px-2 text-center whitespace-nowrap">
                        <span
                          className={`text-3xs font-extrabold px-2 py-0.5 rounded border whitespace-nowrap ${getRecBadge(
                            product.scoreBreakdown.recommendation
                          )}`}
                        >
                          {product.scoreBreakdown.recommendation}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct(product);
                          }}
                          className="inline-flex items-center gap-1 text-2xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 dark:hover:bg-amber-400 dark:hover:text-slate-950 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <span>Ver</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {topOpportunities.map((product, index) => (
                <div
                  key={product.id}
                  className="p-4 space-y-3 bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => onSelectProduct(product)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-2xs flex items-center justify-center shrink-0 mt-0.5">
                        #{index + 1}
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        <strong className="text-xs font-bold text-slate-900 dark:text-white block leading-snug line-clamp-2">
                          {product.name}
                        </strong>
                        <span className="text-3xs text-slate-400 block truncate">
                          {product.keyword}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-slate-950 dark:text-amber-400 text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                      {product.scoreBreakdown.totalScore}
                      <span className="text-3xs text-slate-400 font-bold">/100</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 bg-slate-50 dark:bg-slate-800/70 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
                    <div>
                      <span className="text-3xs text-slate-400 font-bold uppercase block">Demanda</span>
                      <strong className="text-xs text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap block">
                        {formatNumber(product.metrics.totalPageSales)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-3xs text-slate-400 font-bold uppercase block">150+/mês</span>
                      <strong className="text-xs text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap block">
                        {product.metrics.adsMaking150Plus}
                      </strong>
                    </div>
                    <div>
                      <span className="text-3xs text-slate-400 font-bold uppercase block">Novos</span>
                      <strong className="text-xs text-purple-700 dark:text-purple-400 font-bold whitespace-nowrap block">
                        {product.metrics.newEntrants300Plus}
                      </strong>
                    </div>
                    <div>
                      <span className="text-3xs text-slate-400 font-bold uppercase block">Full</span>
                      <strong className="text-xs text-emerald-700 dark:text-emerald-400 font-bold whitespace-nowrap block">
                        {product.metrics.fullCompetitors}
                      </strong>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span
                      className={`text-3xs font-extrabold px-2 py-0.5 rounded border ${getRecBadge(
                        product.scoreBreakdown.recommendation
                      )}`}
                    >
                      {product.scoreBreakdown.recommendation}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      className="inline-flex items-center gap-1 text-2xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 dark:hover:bg-amber-400 dark:hover:text-slate-950 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>Diagnóstico</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-12 text-center space-y-3">
            <Target className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nenhum produto analisado ainda.</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Faça sua primeira análise para começar a construir seu ranking de oportunidades.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('nova-analise')}
              className="inline-flex items-center gap-2 mt-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer border border-amber-300"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ NOVA ANÁLISE</span>
            </button>
          </div>
        )}
      </div>

      {/* QUICK COMPARISON BANNER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800/80">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Dúvida entre 2 ou 3 nichos?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Use o Comparador de Oportunidades para confrontar métricas e margens lado a lado.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('comparador')}
          className="flex items-center gap-2 bg-slate-900 dark:bg-amber-400 hover:bg-slate-800 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <span>Abrir Comparador</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

