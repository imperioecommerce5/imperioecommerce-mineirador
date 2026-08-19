import React, { useState } from 'react';
import {
  Scale,
  Award,
  Crown,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Truck,
  DollarSign,
  ArrowRight,
  Plus,
  X,
  Target,
  Sparkles,
} from 'lucide-react';
import { ProductAnalysis } from '../types';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

interface ComparatorViewProps {
  products: ProductAnalysis[];
  initialSelectedIds?: string[];
  onSelectProduct: (product: ProductAnalysis) => void;
  onNavigate: (view: string) => void;
}

export const ComparatorView: React.FC<ComparatorViewProps> = ({
  products,
  initialSelectedIds = [],
  onSelectProduct,
  onNavigate,
}) => {
  // Select up to 3 products
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialSelectedIds.length > 0) {
      return initialSelectedIds.slice(0, 3);
    }
    return products.slice(0, 3).map((p) => p.id);
  });

  const selectedProducts = selectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is ProductAnalysis => Boolean(p));

  const handleAddProduct = (id: string) => {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveProduct = (id: string) => {
    setSelectedIds(selectedIds.filter((item) => item !== id));
  };

  // Find winner per metric
  const getWinnerId = (getter: (p: ProductAnalysis) => number, isLowerBetter = false) => {
    if (selectedProducts.length <= 1) return null;
    let bestVal = getter(selectedProducts[0]);
    let winnerId = selectedProducts[0].id;
    let isTie = false;

    for (let i = 1; i < selectedProducts.length; i++) {
      const val = getter(selectedProducts[i]);
      if (isLowerBetter ? val < bestVal : val > bestVal) {
        bestVal = val;
        winnerId = selectedProducts[i].id;
        isTie = false;
      } else if (val === bestVal) {
        isTie = true;
      }
    }

    return isTie ? null : winnerId;
  };

  const winScore = getWinnerId((p) => p.scoreBreakdown.totalScore);
  const winDemand = getWinnerId((p) => p.metrics.totalPageSales);
  const win150 = getWinnerId((p) => p.metrics.adsMaking150Plus);
  const win300 = getWinnerId((p) => p.metrics.adsMaking300Plus);
  const winNewEntrants = getWinnerId((p) => p.metrics.newEntrants300Plus);
  const winFull = getWinnerId((p) => p.metrics.fullCompetitors, true); // lower is better
  const winMargin = getWinnerId((p) => p.calculatedFinancials?.netMarginPercent || 0);
  const winProfit = getWinnerId((p) => p.calculatedFinancials?.monthlyProfit150Sales || 0);

  // Overall winner
  const overallWinner = [...selectedProducts].sort(
    (a, b) => b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore
  )[0];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Análise Concorrencial
            </span>
            <span className="text-2xs text-slate-400 font-semibold">• Comparador de Nichos</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-amber-500" />
            <span>Comparador de Oportunidades</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Compare até 3 produtos lado a lado para identificar a melhor oportunidade de entrada no Mercado Livre Full.
          </p>
        </div>

        {/* Product Selector Dropdown if < 3 */}
        {selectedProducts.length < 3 && products.length > selectedProducts.length && (
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddProduct(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white dark:bg-slate-800 cursor-pointer"
            >
              <option value="" disabled>
                + Adicionar Produto ({selectedProducts.length}/3)
              </option>
              {products
                .filter((p) => !selectedIds.includes(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Score: {p.scoreBreakdown.totalScore})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {selectedProducts.length > 0 ? (
        <div className="space-y-6">
          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedProducts.map((p, idx) => {
              const isOverallWin = overallWinner?.id === p.id && selectedProducts.length > 1;

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-5 shadow-2xs space-y-4 relative flex flex-col justify-between transition-all ${
                    isOverallWin
                      ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/20 dark:ring-amber-500/20 bg-linear-to-b from-amber-50/50 to-white dark:from-amber-950/30 dark:to-slate-900'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(p.id)}
                    className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Remover da comparação"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="space-y-3">
                    {/* Header */}
                    <div className="pr-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xs font-black uppercase tracking-wider text-slate-400">
                          Opção {idx + 1}
                        </span>
                        {isOverallWin && (
                          <span className="text-2xs font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            <Crown className="w-3 h-3" /> MELHOR ESCOLHA
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {p.name}
                      </h3>
                      <p className="text-2xs text-slate-400 mt-0.5 truncate">{p.keyword}</p>
                    </div>

                    {/* Big Score Box */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                      <div>
                        <span className="text-2xs font-bold text-slate-400 uppercase">Score Total</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-950 dark:text-amber-400">
                            {p.scoreBreakdown.totalScore}
                          </span>
                          <span className="text-2xs font-bold text-slate-400">/100</span>
                        </div>
                      </div>
                      <span
                        className={`text-2xs font-extrabold px-2.5 py-1 rounded-md border ${getRecBadge(
                          p.scoreBreakdown.recommendation
                        )}`}
                      >
                        {p.scoreBreakdown.recommendation}
                      </span>
                    </div>

                    {/* Metric Rows */}
                    <div className="space-y-2 text-xs">
                      {/* Demanda */}
                      <div className={`p-2 rounded-lg border flex items-center justify-between ${
                        winDemand === p.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                      }`}>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Demanda 1ª Pág</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                          {winDemand === p.id && <Crown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                          <span>{formatNumber(p.metrics.totalPageSales)}</span>
                        </div>
                      </div>

                      {/* Ritmo 150+ */}
                      <div className={`p-2 rounded-lg border flex items-center justify-between ${
                        win150 === p.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                      }`}>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Anúncios 150+/mês</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                          {win150 === p.id && <Crown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                          <span>{p.metrics.adsMaking150Plus} ads</span>
                        </div>
                      </div>

                      {/* Ritmo 300+ */}
                      <div className={`p-2 rounded-lg border flex items-center justify-between ${
                        win300 === p.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                      }`}>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Anúncios 300+/mês</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                          {win300 === p.id && <Crown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                          <span>{p.metrics.adsMaking300Plus} ads</span>
                        </div>
                      </div>

                      {/* Novos Entrantes */}
                      <div className={`p-2 rounded-lg border flex items-center justify-between ${
                        winNewEntrants === p.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                      }`}>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Novos Entr. (&lt;180d)</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                          {winNewEntrants === p.id && <Crown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                          <span>{p.metrics.newEntrants300Plus} ads</span>
                        </div>
                      </div>

                      {/* Concorrência Full */}
                      <div className={`p-2 rounded-lg border flex items-center justify-between ${
                        winFull === p.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                      }`}>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Concorrentes Full</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                          {winFull === p.id && <Crown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                          <span>{p.metrics.fullCompetitors} no Full</span>
                        </div>
                      </div>

                      {/* Margem Líquida */}
                      {p.calculatedFinancials && (
                        <div className={`p-2 rounded-lg border flex items-center justify-between ${
                          winMargin === p.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                        }`}>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Margem Líquida %</span>
                          <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                            {winMargin === p.id && <Crown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                            <span>{formatPercent(p.calculatedFinancials.netMarginPercent)}</span>
                          </div>
                        </div>
                      )}

                      {/* Lucro Mensal (150 un) */}
                      {p.calculatedFinancials && (
                        <div className={`p-2 rounded-lg border flex items-center justify-between ${
                          winProfit === p.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                        }`}>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Lucro Mensal (150 un)</span>
                          <div className="flex items-center gap-1.5 font-black text-emerald-600 dark:text-emerald-400">
                            {winProfit === p.id && <Crown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                            <span>{formatCurrency(p.calculatedFinancials.monthlyProfit150Sales)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectProduct(p)}
                    className="w-full mt-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Ver Relatório Completo
                  </button>
                </div>
              );
            })}
          </div>

          {/* OVERALL WINNER SUMMARY CARD */}
          {overallWinner && selectedProducts.length > 1 && (
            <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xs font-black uppercase tracking-wider text-amber-400">
                      DECISÃO DO COMPARADOR
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      MELHOR OPORTUNIDADE: {overallWinner.name}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-bold">SCORE:</span>
                    <span className="text-xl font-black text-amber-400 ml-1.5">
                      {overallWinner.scoreBreakdown.totalScore}/100
                    </span>
                  </div>
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500 text-white">
                    {overallWinner.scoreBreakdown.recommendation}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  <strong>Por que este produto venceu?</strong>{' '}
                  Apresenta o maior Score de Oportunidade ({overallWinner.scoreBreakdown.totalScore} pts),{' '}
                  com volume total de demanda de {formatNumber(overallWinner.metrics.totalPageSales)} vendas,{' '}
                  {overallWinner.metrics.adsMaking150Plus} anúncios superando a meta no Full,{' '}
                  {overallWinner.metrics.newEntrants300Plus > 0
                    ? `comprovação com ${overallWinner.metrics.newEntrants300Plus} novo(s) entrante(s) escalando, `
                    : ''}
                  e concorrência Full de {overallWinner.metrics.fullCompetitors} vendedores.
                </p>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onSelectProduct(overallWinner)}
                  className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all border border-amber-300 cursor-pointer"
                >
                  <span>Abrir Diagnóstico Detalhado do Vencedor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Scale className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Selecione produtos para comparar</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Vá até a lista de "Produtos Analisados" e marque as caixas de seleção, ou selecione produtos no menu superior.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('produtos')}
            className="mt-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
          >
            Ir para Produtos Analisados
          </button>
        </div>
      )}
    </div>
  );
};
