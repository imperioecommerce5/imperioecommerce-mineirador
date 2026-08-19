import React, { useRef } from 'react';
import {
  X,
  Sparkles,
  Target,
  Truck,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ExternalLink,
  Edit,
  Copy,
  Printer,
  TrendingUp,
  Award,
  ArrowRight,
} from 'lucide-react';
import { ProductAnalysis } from '../types';
import { calculateSalesPotential, calculateFullAdvantage } from '../utils/calculator';
import { formatCurrency, formatNumber, formatPercent, formatDateFull } from '../utils/formatters';

interface AnalysisResultModalProps {
  product: ProductAnalysis;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: ProductAnalysis) => void;
  onDuplicate: (product: ProductAnalysis) => void;
}

export const AnalysisResultModal: React.FC<AnalysisResultModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
}) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const { scoreBreakdown, diagnosis, calculatedFinancials, metrics } = product;
  const potential = diagnosis.salesPotential || calculateSalesPotential(metrics);
  const fullAdvantage = diagnosis.fullAdvantage || calculateFullAdvantage(metrics);

  const getRecommendationBadge = () => {
    switch (scoreBreakdown.recommendation) {
      case 'ENTRAR':
        return {
          label: 'ENTRAR NO NICHO',
          badgeClass: 'bg-emerald-500 text-white border-emerald-400',
          containerClass: 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/30',
          icon: CheckCircle2,
          desc: 'Excelente alinhamento de métricas. Alta probabilidade de atingir e superar a meta mínima de 3 vendas/dia no Full.',
        };
      case 'ANALISAR':
        return {
          label: 'ANALISAR COM CAUTELA',
          badgeClass: 'bg-amber-500 text-slate-950 border-amber-400',
          containerClass: 'border-amber-300 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/30',
          icon: Sparkles,
          desc: 'Nicho viável com demanda comprovada. Avaliar diferenciação e validar margem líquida unitária.',
        };
      case 'ALTO_RISCO':
        return {
          label: 'ALTO RISCO',
          badgeClass: 'bg-orange-500 text-white border-orange-400',
          containerClass: 'border-orange-300 dark:border-orange-800/80 bg-orange-50/40 dark:bg-orange-950/30',
          icon: AlertTriangle,
          desc: 'Métricas frágeis, concentração de vendas ou concorrência Full acirrada. Risco de estoque parado.',
        };
      default:
        return {
          label: 'DESCARTAR PRODUTO',
          badgeClass: 'bg-rose-500 text-white border-rose-400',
          containerClass: 'border-rose-300 dark:border-rose-800/80 bg-rose-50/40 dark:bg-rose-950/30',
          icon: X,
          desc: 'Demanda insuficiente ou mercado totalmente blindado por concorrentes antigos. Não recomendado.',
        };
    }
  };

  const rec = getRecommendationBadge();
  const RecIcon = rec.icon;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        ref={modalContentRef}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                Relatório de Mineração
              </span>
              <span className="text-2xs text-slate-400 font-semibold">
                Analisado em {formatDateFull(product.createdAt)}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {product.name}
            </h2>
            {product.keyword && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Palavra-chave Avantpro: <strong className="text-slate-800 dark:text-slate-200">{product.keyword}</strong>
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Imprimir / Salvar PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDuplicate(product)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Duplicar Produto"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Editar Análise"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* TOP HIGHLIGHT: SCORE & RECOMMENDATION CARD */}
          <div
            className={`rounded-2xl p-5 sm:p-6 border ${rec.containerClass} shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6`}
          >
            {/* Score Circle / Big Display */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col items-center justify-center shrink-0">
                <span className="text-3xl font-black text-slate-950 dark:text-white tracking-tight leading-none">
                  {scoreBreakdown.totalScore}
                </span>
                <span className="text-3xs font-bold text-slate-400 uppercase mt-0.5">de 100 pts</span>
              </div>

              <div className="space-y-1">
                <span className="text-2xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pontuação de Oportunidade
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs sm:text-sm font-black px-3 py-1 rounded-lg border flex items-center gap-1.5 shadow-2xs ${rec.badgeClass}`}
                  >
                    <RecIcon className="w-4 h-4" />
                    <span>{rec.label}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-md pt-0.5 leading-relaxed">
                  {rec.desc}
                </p>
              </div>
            </div>

            {/* Target Minimum Daily Indicator & Vantagem Full */}
            <div className="w-full md:w-auto p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs shrink-0 flex flex-col sm:flex-row md:flex-col gap-3 justify-center text-center md:text-right">
              <div className="space-y-0.5">
                <span className="text-3xs font-bold text-slate-400 uppercase block tracking-wider">
                  Meta Mínima (3 vendas/dia)
                </span>
                <div className="text-sm font-black text-slate-950 dark:text-white">
                  {diagnosis.chanceGoal5Daily === 'ALTA' && (
                    <span className="text-emerald-600 dark:text-emerald-400">🟢 ALTA PROBABILIDADE</span>
                  )}
                  {diagnosis.chanceGoal5Daily === 'MEDIA' && (
                    <span className="text-amber-600 dark:text-amber-400">🟡 PROBABILIDADE MÉDIA</span>
                  )}
                  {diagnosis.chanceGoal5Daily === 'BAIXA' && (
                    <span className="text-rose-600 dark:text-rose-400">🔴 BAIXA PROBABILIDADE</span>
                  )}
                </div>
              </div>

              <div className="pt-2 md:pt-2 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-3xs font-bold text-slate-400 uppercase block tracking-wider">
                  Vantagem Full
                </span>
                <div className="text-sm font-black text-slate-950 dark:text-white">
                  {fullAdvantage.label}
                </div>
              </div>
            </div>
          </div>

          {/* NOVO CARD: POTENCIAL ESTIMADO DE VENDAS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  Potencial Estimado de Vendas
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xs font-black px-2.5 py-1 rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                  {potential.classificationLabel}
                </span>
                <span className="text-2xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  Confiança: <strong className="text-slate-900 dark:text-white font-black">{potential.confidence}</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Conservador */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <span className="text-3xs font-bold text-slate-500 dark:text-slate-400 uppercase block tracking-wider">
                  Conservador (~65%)
                </span>
                <div className="flex items-baseline gap-1">
                  <strong className="text-xl font-black text-slate-900 dark:text-white">
                    {formatNumber(potential.conservativeDaily)}
                  </strong>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">vendas/dia</span>
                </div>
                <p className="text-2xs text-slate-500 dark:text-slate-400 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  ≈ {formatNumber(potential.conservativeMonthly)} vendas/mês
                </p>
              </div>

              {/* Provável */}
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1 ring-1 ring-amber-400/30">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-black text-amber-800 dark:text-amber-400 uppercase block tracking-wider">
                    Provável (Base)
                  </span>
                  <span className="text-3xs font-bold bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-200 px-1.5 py-0.5 rounded">
                    Prudente
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <strong className="text-2xl font-black text-slate-950 dark:text-white">
                    {formatNumber(potential.probableDaily)}
                  </strong>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">vendas/dia</span>
                </div>
                <p className="text-2xs text-amber-900 dark:text-amber-300 font-bold pt-1 border-t border-amber-200 dark:border-amber-800/80">
                  ≈ {formatNumber(potential.probableMonthly)} vendas/mês
                </p>
              </div>

              {/* Otimista */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <span className="text-3xs font-bold text-slate-500 dark:text-slate-400 uppercase block tracking-wider">
                  Otimista (~150%)
                </span>
                <div className="flex items-baseline gap-1">
                  <strong className="text-xl font-black text-slate-900 dark:text-white">
                    {formatNumber(potential.optimisticDaily)}
                  </strong>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">vendas/dia</span>
                </div>
                <p className="text-2xs text-slate-500 dark:text-slate-400 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  ≈ {formatNumber(potential.optimisticMonthly)} vendas/mês
                </p>
              </div>
            </div>

            {/* Aviso */}
            <p className="text-3xs text-slate-400 dark:text-slate-500 font-medium italic pt-1 border-t border-slate-100 dark:border-slate-800">
              Estimativa baseada nas métricas de mercado cadastradas. Não representa garantia de vendas.
            </p>
          </div>

          {/* VANTAGEM FULL CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  Vantagem Full
                </h3>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                {fullAdvantage.label}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {fullAdvantage.explanation}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-2xs text-slate-500 dark:text-slate-400 font-semibold">
              <span>Concorrência no Full informada: <strong className="text-slate-900 dark:text-white font-black">{metrics.fullCompetitors} vendedores</strong></span>
              <span>Operação do Vendedor: <strong className="text-emerald-700 dark:text-emerald-400 font-black">Mercado Livre Full</strong></span>
            </div>
          </div>

          {/* VERDICT & NEXT STEP BOX */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Flame className="w-5 h-5" />
              <h3 className="text-xs font-black uppercase tracking-wider">
                {diagnosis.verdictTitle}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {diagnosis.verdictText}
            </p>
            <div className="pt-3 border-t border-slate-800 flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-2xs uppercase text-amber-400 block font-bold">
                  Próxima Ação Recomendada:
                </strong>
                <p className="text-xs text-slate-300 font-medium">{diagnosis.nextStep}</p>
              </div>
            </div>
          </div>

          {/* METRIC BREAKDOWN GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span>Diagnóstico Detalhado por Métrica (Avantpro)</span>
              </h3>
              <span className="text-2xs text-slate-400 font-semibold">1ª Página</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {diagnosis.metricDiagnostics.map((metric) => {
                const isGood = metric.statusColor === 'emerald';
                const isWarn = metric.statusColor === 'yellow' || metric.statusColor === 'amber';
                return (
                  <div
                    key={metric.key}
                    className={`p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-2xs space-y-2 ${
                      isGood
                        ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                        : isWarn
                        ? 'border-amber-200/80 dark:border-amber-800/60 bg-amber-50/20 dark:bg-amber-950/20'
                        : 'border-rose-200/80 dark:border-rose-800/60 bg-rose-50/20 dark:bg-rose-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                        {metric.name}
                      </span>
                      <span
                        className={`text-3xs font-extrabold px-2 py-0.5 rounded-full ${
                          isGood
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                            : isWarn
                            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {metric.level}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <strong className="text-base font-black text-slate-950 dark:text-white">
                        {metric.displayValue}
                      </strong>
                      <span className="text-2xs font-bold text-slate-400">
                        {metric.scoreAwarded}/{metric.maxScore} pts
                      </span>
                    </div>

                    <p className="text-2xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {metric.summary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* POSITIVE & ATTENTION POINTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Positives */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-black text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Pontos Positivos do Nicho</span>
              </div>
              <ul className="space-y-2">
                {diagnosis.positivePoints.map((point, idx) => (
                  <li key={idx} className="text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Attention / Risks */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Pontos de Atenção / Riscos</span>
              </div>
              <ul className="space-y-2">
                {diagnosis.attentionPoints.map((point, idx) => (
                  <li key={idx} className="text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* FINANCIAL SIMULATION (IF ENABLED) */}
          {calculatedFinancials && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                    Simulação de Lucratividade na Meta (150 vendas/mês)
                  </h3>
                </div>
                <span className="text-2xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded">
                  Projeção Unitária & Mensal
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <span className="text-3xs font-bold text-slate-500 dark:text-slate-400 uppercase block">Preço de Venda</span>
                  <strong className="text-base font-black text-slate-900 dark:text-white">
                    {formatCurrency(calculatedFinancials.grossRevenueUnit)}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <span className="text-3xs font-bold text-slate-500 dark:text-slate-400 uppercase block">Total Custos & Taxas</span>
                  <strong className="text-base font-black text-slate-900 dark:text-white">
                    {formatCurrency(calculatedFinancials.totalFeesUnit)}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-3xs font-bold text-emerald-800 dark:text-emerald-300 uppercase block">Lucro Líquido Unitário</span>
                  <strong className="text-base font-black text-emerald-950 dark:text-emerald-200">
                    {formatCurrency(calculatedFinancials.netProfitUnit)}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-3xs font-bold text-emerald-800 dark:text-emerald-300 uppercase block">Margem Líquida</span>
                  <strong className="text-base font-black text-emerald-950 dark:text-emerald-200">
                    {formatPercent(calculatedFinancials.netMarginPercent)}
                  </strong>
                </div>
              </div>

              {/* Monthly totals at 150 sales */}
              <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-2xs font-bold text-slate-400 uppercase block">
                    Faturamento Estimado (150 un/mês)
                  </span>
                  <strong className="text-lg font-black text-white">
                    {formatCurrency(calculatedFinancials.monthlyRevenue150Sales)}
                  </strong>
                </div>

                <div className="sm:text-right">
                  <span className="text-2xs font-bold text-amber-400 uppercase block">
                    Lucro Líquido Mensal Estimado (150 un/mês)
                  </span>
                  <strong className="text-xl font-black text-emerald-400">
                    {formatCurrency(calculatedFinancials.monthlyProfit150Sales)}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* EXTERNAL LINKS & STRATEGIC NOTES */}
          {(product.mlLink || product.supplierLink || product.notes) && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2">
              <span className="text-2xs font-bold uppercase text-slate-400 block tracking-tight">
                Referências & Anotações
              </span>

              <div className="flex flex-wrap gap-3">
                {product.mlLink && (
                  <a
                    href={product.mlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline"
                  >
                    <span>Ver Anúncio no Mercado Livre</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {product.supplierLink && (
                  <a
                    href={product.supplierLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                  >
                    <span>Ver Link do Fornecedor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {product.notes && (
                <p className="text-slate-600 dark:text-slate-300 pt-1 text-xs border-t border-slate-200/60 dark:border-slate-700/60">
                  <strong>Obs:</strong> {product.notes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Fechar Relatório
          </button>

          <button
            type="button"
            onClick={() => {
              onEdit(product);
            }}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all border border-amber-300 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span>Editar Parâmetros deste Produto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
