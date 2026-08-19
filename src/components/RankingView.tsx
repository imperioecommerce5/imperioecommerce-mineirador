import React, { useState, useMemo } from 'react';
import {
  Award,
  Crown,
  Medal,
  TrendingUp,
  ArrowRight,
  Target,
  Truck,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { ProductAnalysis } from '../types';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

interface RankingViewProps {
  products: ProductAnalysis[];
  onSelectProduct: (product: ProductAnalysis) => void;
  onNavigate: (view: string) => void;
}

export const RankingView: React.FC<RankingViewProps> = ({
  products,
  onSelectProduct,
  onNavigate,
}) => {
  const [rankingCriterion, setRankingCriterion] = useState<string>('SCORE');

  const rankedProducts = useMemo(() => {
    const list = [...products];
    switch (rankingCriterion) {
      case 'SCORE':
        return list.sort((a, b) => b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore);
      case 'DEMAND':
        return list.sort((a, b) => b.metrics.totalPageSales - a.metrics.totalPageSales);
      case 'FULL_LOW':
        return list.sort((a, b) => a.metrics.fullCompetitors - b.metrics.fullCompetitors);
      case 'MARGIN':
        return list.sort(
          (a, b) =>
            (b.calculatedFinancials?.netMarginPercent || 0) -
            (a.calculatedFinancials?.netMarginPercent || 0)
        );
      case 'PROFIT_MONTHLY':
        return list.sort(
          (a, b) =>
            (b.calculatedFinancials?.monthlyProfit150Sales || 0) -
            (a.calculatedFinancials?.monthlyProfit150Sales || 0)
        );
      default:
        return list;
    }
  }, [products, rankingCriterion]);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          bg: 'bg-amber-400 text-slate-950 shadow-xs border border-amber-300',
          icon: Crown,
          label: '1º Lugar',
        };
      case 1:
        return {
          bg: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600',
          icon: Medal,
          label: '2º Lugar',
        };
      case 2:
        return {
          bg: 'bg-amber-700/20 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/40 dark:border-amber-700/40',
          icon: Medal,
          label: '3º Lugar',
        };
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
          icon: Award,
          label: `${index + 1}º`,
        };
    }
  };

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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs w-full">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Classificação Geral
            </span>
            <span className="text-2xs text-slate-400 font-semibold">• Top Oportunidades</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>Ranking de Oportunidades</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Visualize os melhores produtos minerados ordenados por critérios estratégicos de tração no Full.
          </p>
        </div>

        {/* Criteria selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">Ordenar por:</span>
          <select
            value={rankingCriterion}
            onChange={(e) => setRankingCriterion(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white dark:bg-slate-800 appearance-none cursor-pointer"
          >
            <option value="SCORE">Score de Oportunidade (0 a 100)</option>
            <option value="DEMAND">Maior Demanda Total (1ª Página)</option>
            <option value="FULL_LOW">Menor Concorrência no Full</option>
            <option value="MARGIN">Maior Margem Líquida (%)</option>
            <option value="PROFIT_MONTHLY">Maior Lucro Mensal (150 un/mês)</option>
          </select>
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {rankedProducts.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 w-full">
          {/* #2 */}
          <div
            onClick={() => onSelectProduct(rankedProducts[1])}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all md:order-1 order-2"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-2xs font-black bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center gap-1">
                <Medal className="w-3.5 h-3.5" /> 2º LUGAR
              </span>
              <span
                className={`text-3xs font-extrabold px-2 py-0.5 rounded border ${getRecBadge(
                  rankedProducts[1].scoreBreakdown.recommendation
                )}`}
              >
                {rankedProducts[1].scoreBreakdown.recommendation}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                {rankedProducts[1].name}
              </h3>
              <p className="text-2xs text-slate-400">{rankedProducts[1].keyword}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="text-3xs font-bold text-slate-400 uppercase">Score Total</span>
                <p className="text-xl font-black text-slate-950 dark:text-amber-400">
                  {rankedProducts[1].scoreBreakdown.totalScore} pts
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xs font-bold text-slate-400 uppercase">Demanda Total</span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {formatNumber(rankedProducts[1].metrics.totalPageSales)}
                </p>
              </div>
            </div>
          </div>

          {/* #1 GOLD */}
          <div
            onClick={() => onSelectProduct(rankedProducts[0])}
            className="bg-linear-to-b from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-900 rounded-2xl border-2 border-amber-400 dark:border-amber-500 p-6 shadow-md space-y-4 cursor-pointer hover:scale-[1.01] transition-all md:order-2 order-1 ring-2 ring-amber-400/20 dark:ring-amber-500/20"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-2xs">
                <Crown className="w-4 h-4" /> 1º LUGAR (CAMPEÃO)
              </span>
              <span
                className={`text-3xs font-extrabold px-2.5 py-1 rounded border ${getRecBadge(
                  rankedProducts[0].scoreBreakdown.recommendation
                )}`}
              >
                {rankedProducts[0].scoreBreakdown.recommendation}
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-tight">
                {rankedProducts[0].name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{rankedProducts[0].keyword}</p>
            </div>
            <div className="pt-3 border-t border-amber-200/60 dark:border-amber-800/60 flex items-baseline justify-between">
              <div>
                <span className="text-2xs font-black text-slate-500 dark:text-slate-400 uppercase">Score de Oportunidade</span>
                <p className="text-3xl font-black text-slate-950 dark:text-amber-400">
                  {rankedProducts[0].scoreBreakdown.totalScore} <span className="text-xs font-bold text-slate-400">/100</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase">Concorrência Full</span>
                <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                  {rankedProducts[0].metrics.fullCompetitors} no Full
                </p>
              </div>
            </div>
          </div>

          {/* #3 */}
          <div
            onClick={() => onSelectProduct(rankedProducts[2])}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all md:order-3 order-3"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-2xs font-black bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 flex items-center gap-1">
                <Medal className="w-3.5 h-3.5" /> 3º LUGAR
              </span>
              <span
                className={`text-3xs font-extrabold px-2 py-0.5 rounded border ${getRecBadge(
                  rankedProducts[2].scoreBreakdown.recommendation
                )}`}
              >
                {rankedProducts[2].scoreBreakdown.recommendation}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                {rankedProducts[2].name}
              </h3>
              <p className="text-2xs text-slate-400">{rankedProducts[2].keyword}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="text-3xs font-bold text-slate-400 uppercase">Score Total</span>
                <p className="text-xl font-black text-slate-950 dark:text-amber-400">
                  {rankedProducts[2].scoreBreakdown.totalScore} pts
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xs font-bold text-slate-400 uppercase">Demanda Total</span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {formatNumber(rankedProducts[2].metrics.totalPageSales)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL RANKING TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden w-full">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">
            Tabela Completa de Classificação
          </h2>
          <span className="text-2xs text-slate-400 font-semibold">
            {rankedProducts.length} produtos classificados
          </span>
        </div>

        {rankedProducts.length > 0 ? (
          <>
            {/* Desktop / Tablet: Full Width Table without horizontal scrolling */}
            <div className="hidden md:block w-full">
              <table className="w-full table-fixed text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-3xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    <th className="py-3 px-2 w-[4%] text-center">Pos.</th>
                    <th className="py-3 px-3 w-[26%]">Produto</th>
                    <th className="py-3 px-2 w-[7%] text-center">Score</th>
                    <th className="py-3 px-2 w-[9%] text-center">Demanda</th>
                    <th className="py-3 px-2 w-[8%] text-center">150+/mês</th>
                    <th className="py-3 px-2 w-[9%] text-center">Novos Entrantes</th>
                    <th className="py-3 px-2 w-[8%] text-center">Sellers Full</th>
                    <th className="py-3 px-2 w-[7%] text-center">Margem</th>
                    <th className="py-3 px-2 w-[10%] text-center">Lucro</th>
                    <th className="py-3 px-3 w-[12%] text-right">Recomendação/Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                  {rankedProducts.map((p, index) => {
                    const rank = getRankBadge(index);
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                        onClick={() => onSelectProduct(p)}
                      >
                        {/* Pos. */}
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg inline-flex items-center justify-center font-black text-2xs ${rank.bg}`}
                          >
                            {index + 1}
                          </span>
                        </td>

                        {/* Produto */}
                        <td className="py-3.5 px-4 min-w-0">
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <strong
                              className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors block line-clamp-2 leading-snug"
                              title={p.name}
                            >
                              {p.name}
                            </strong>
                            <span className="text-3xs text-slate-400 block truncate">
                              {p.keyword}
                            </span>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          <span className="font-black text-slate-950 dark:text-amber-400 text-xs sm:text-sm">
                            {p.scoreBreakdown.totalScore}
                            <span className="text-3xs text-slate-400 font-bold">/100</span>
                          </span>
                        </td>

                        {/* Demanda */}
                        <td className="py-3 px-2 text-center whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">
                          {formatNumber(p.metrics.totalPageSales)}
                        </td>

                        {/* 150+/mês */}
                        <td className="py-3 px-2 text-center whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">
                          {p.metrics.adsMaking150Plus}
                        </td>

                        {/* Novos Entrantes */}
                        <td className="py-3 px-2 text-center whitespace-nowrap font-bold text-purple-700 dark:text-purple-400">
                          {p.metrics.newEntrants300Plus}
                        </td>

                        {/* Sellers Full */}
                        <td className="py-3 px-2 text-center whitespace-nowrap font-bold text-emerald-700 dark:text-emerald-400">
                          {p.metrics.fullCompetitors}
                        </td>

                        {/* Margem */}
                        <td className="py-3 px-2 text-center whitespace-nowrap font-bold text-slate-800 dark:text-slate-200">
                          {p.calculatedFinancials
                            ? formatPercent(p.calculatedFinancials.netMarginPercent)
                            : '-'}
                        </td>

                        {/* Lucro */}
                        <td className="py-3 px-2 text-center whitespace-nowrap font-black text-emerald-600 dark:text-emerald-400">
                          {p.calculatedFinancials
                            ? formatCurrency(p.calculatedFinancials.monthlyProfit150Sales)
                            : '-'}
                        </td>

                        {/* Recomendação / Ações */}
                        <td
                          className="py-3 px-3 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span
                              className={`text-3xs font-extrabold px-2 py-0.5 rounded border whitespace-nowrap ${getRecBadge(
                                p.scoreBreakdown.recommendation
                              )}`}
                            >
                              {p.scoreBreakdown.recommendation}
                            </span>
                            <button
                              type="button"
                              onClick={() => onSelectProduct(p)}
                              className="inline-flex items-center gap-1 text-2xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 dark:hover:bg-amber-400 dark:hover:text-slate-950 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                              title="Ver Diagnóstico"
                            >
                              <span>Ver</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Responsive Vertical Cards */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {rankedProducts.map((p, index) => {
                const rank = getRankBadge(index);
                return (
                  <div
                    key={p.id}
                    className="p-4 space-y-3 bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => onSelectProduct(p)}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg inline-flex items-center justify-center font-black text-2xs shrink-0 ${rank.bg}`}
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <strong className="text-xs font-bold text-slate-900 dark:text-white block leading-snug line-clamp-2">
                            {p.name}
                          </strong>
                          <span className="text-3xs text-slate-400 block truncate font-medium">
                            {p.keyword}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="inline-flex items-baseline gap-0.5 font-black text-slate-950 dark:text-amber-400 text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          {p.scoreBreakdown.totalScore}
                          <span className="text-3xs text-slate-400 font-bold">/100</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Metrics Grid */}
                    <div className="grid grid-cols-2 min-[390px]:grid-cols-3 gap-2 bg-slate-50/80 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
                      <div className="space-y-0.5">
                        <span className="text-3xs font-bold text-slate-400 uppercase block">
                          Demanda
                        </span>
                        <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap block">
                          {formatNumber(p.metrics.totalPageSales)}
                        </strong>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-3xs font-bold text-slate-400 uppercase block">
                          150+/mês
                        </span>
                        <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap block">
                          {p.metrics.adsMaking150Plus}
                        </strong>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-3xs font-bold text-slate-400 uppercase block">
                          Novos
                        </span>
                        <strong className="text-xs font-bold text-purple-700 dark:text-purple-400 whitespace-nowrap block">
                          {p.metrics.newEntrants300Plus}
                        </strong>
                      </div>
                      <div className="space-y-0.5 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-3xs font-bold text-slate-400 uppercase block">
                          Full
                        </span>
                        <strong className="text-xs font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap block">
                          {p.metrics.fullCompetitors}
                        </strong>
                      </div>
                      <div className="space-y-0.5 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-3xs font-bold text-slate-400 uppercase block">
                          Margem
                        </span>
                        <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap block">
                          {p.calculatedFinancials
                            ? formatPercent(p.calculatedFinancials.netMarginPercent)
                            : '-'}
                        </strong>
                      </div>
                      <div className="space-y-0.5 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-3xs font-bold text-slate-400 uppercase block">
                          Lucro
                        </span>
                        <strong className="text-xs font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap block">
                          {p.calculatedFinancials
                            ? formatCurrency(p.calculatedFinancials.monthlyProfit150Sales)
                            : '-'}
                        </strong>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div
                      className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className={`text-3xs font-extrabold px-2 py-0.5 rounded border ${getRecBadge(
                          p.scoreBreakdown.recommendation
                        )}`}
                      >
                        {p.scoreBreakdown.recommendation}
                      </span>

                      <button
                        type="button"
                        onClick={() => onSelectProduct(p)}
                        className="inline-flex items-center gap-1 text-2xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 dark:hover:bg-amber-400 dark:hover:text-slate-950 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <span>Diagnóstico</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="p-12 text-center space-y-3">
            <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum produto cadastrado</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Cadastre suas análises de produtos para gerar o ranking de oportunidades.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
