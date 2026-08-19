import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  HelpCircle,
  Calculator,
  Save,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Truck,
  DollarSign,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { AvantproMetrics, FinancialData, ProductAnalysis, SystemSettings } from '../types';
import { calculateScoreAndDiagnosis, calculateFinancials } from '../utils/calculator';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface NewAnalysisViewProps {
  initialData?: ProductAnalysis | null;
  settings: SystemSettings;
  onSave: (
    product: Omit<
      ProductAnalysis,
      'id' | 'createdAt' | 'updatedAt' | 'scoreBreakdown' | 'diagnosis' | 'calculatedFinancials'
    > & { id?: string }
  ) => void;
  onCancel?: () => void;
}

const DEFAULT_METRICS: AvantproMetrics = {
  totalPageSales: 6500,
  adsMaking150Plus: 6,
  adsMaking300Plus: 3,
  newEntrants300Plus: 1,
  adsUnder180Days: 12,
  ads180To365Days: 18,
  adsOver365Days: 20,
  fullCompetitors: 8,
};

const DEFAULT_FINANCIALS: FinancialData = {
  enabled: true,
  costPrice: 25.0,
  sellPrice: 79.9,
  mlCommissionPercent: 16,
  fixedFee: 6.0,
  shippingFee: 0,
  taxPercent: 5.0,
  adsPercent: 8.0,
  otherCosts: 2.0,
};

export const NewAnalysisView: React.FC<NewAnalysisViewProps> = ({
  initialData,
  settings,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [keyword, setKeyword] = useState(initialData?.keyword || '');
  const [mlLink, setMlLink] = useState(initialData?.mlLink || '');
  const [supplierLink, setSupplierLink] = useState(initialData?.supplierLink || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [metrics, setMetrics] = useState<AvantproMetrics>(
    initialData?.metrics || DEFAULT_METRICS
  );

  const [financials, setFinancials] = useState<FinancialData>(
    initialData?.financials || DEFAULT_FINANCIALS
  );

  const handleMetricChange = (field: keyof AvantproMetrics, val: string | number) => {
    const num = Math.max(0, Number(val) || 0);
    setMetrics((prev) => ({
      ...prev,
      [field]: num,
    }));
  };

  const handleFinancialChange = (field: keyof FinancialData, val: string | number | boolean) => {
    setFinancials((prev) => ({
      ...prev,
      [field]: typeof val === 'boolean' ? val : Math.max(0, Number(val) || 0),
    }));
  };

  // Real-time calculation of score and diagnostics
  const { scoreBreakdown, diagnosis } = useMemo(() => {
    return calculateScoreAndDiagnosis(metrics, settings);
  }, [metrics, settings]);

  const calcFinancials = useMemo(() => {
    if (!financials.enabled) return null;
    return calculateFinancials(financials, settings);
  }, [financials, settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, informe o nome do produto.');
      return;
    }

    onSave({
      id: initialData?.id,
      name: name.trim(),
      keyword: keyword.trim(),
      mlLink: mlLink.trim() || undefined,
      supplierLink: supplierLink.trim() || undefined,
      notes: notes.trim() || undefined,
      metrics,
      financials,
    });
  };

  const getRecommendationBadge = () => {
    switch (scoreBreakdown.recommendation) {
      case 'ENTRAR':
        return {
          label: 'ENTRAR (RECOMENDADO)',
          color: 'bg-emerald-500 text-white border-emerald-400',
          desc: 'Potencial alto para atingir a meta mínima (>= 3 vendas/dia) no Full.',
        };
      case 'ANALISAR':
        return {
          label: 'ANALISAR (COM CAUTELA)',
          color: 'bg-amber-500 text-slate-950 border-amber-400',
          desc: 'Nicho viável, mas exige validação de margem e diferenciação.',
        };
      case 'ALTO_RISCO':
        return {
          label: 'ALTO RISCO',
          color: 'bg-orange-500 text-white border-orange-400',
          desc: 'Métricas frágeis ou concorrência excessiva no Full.',
        };
      default:
        return {
          label: 'DESCARTAR',
          color: 'bg-rose-500 text-white border-rose-400',
          desc: 'Volume insuficiente ou nicho totalmente dominado por antigos.',
        };
    }
  };

  const recBadge = getRecommendationBadge();

  return (
    <div className="w-full max-w-none space-y-6 pb-12">
      {/* Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Avantpro + Mercado Livre Full
            </span>
            <span className="text-2xs text-slate-400 font-semibold">• Coleta Manual 1ª Página</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6 text-amber-500" />
            <span>{initialData ? 'Editar Análise de Produto' : 'Nova Mineração de Produto'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Preencha as métricas extraídas no Avantpro da 1ª página para calcular a pontuação de oportunidade.
          </p>
        </div>

        {initialData && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cancelar Edição</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: DATA ENTRY FORM */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: IDENTIFICATION */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 font-black text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">
                Identificação do Produto e Pesquisa
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                  Nome do Produto / Oportunidade <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Suporte Articulado para Notebook em Alumínio"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50/50 dark:bg-slate-800/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                  Palavra-Chave Principal (Avantpro)
                </label>
                <input
                  type="text"
                  placeholder="Ex: suporte articulado notebook"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50/50 dark:bg-slate-800/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                  Link de Referência no Mercado Livre <span className="normal-case font-medium text-slate-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  inputMode="url"
                  placeholder="https://produto.mercadolivre.com.br/..."
                  value={mlLink}
                  onChange={(e) => setMlLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50/50 dark:bg-slate-800/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                  Link do Fornecedor / Fabricante <span className="normal-case font-medium text-slate-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  inputMode="url"
                  placeholder="Ex: https://fornecedor.com.br/produto..."
                  value={supplierLink}
                  onChange={(e) => setSupplierLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50/50 dark:bg-slate-800/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                  Observações Estratégicas
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fornecedor nacional, embalagem reforçada..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50/50 dark:bg-slate-800/60"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: AVANTPRO METRICS (1ST PAGE) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  Métricas Avantpro (1ª Página de Resultados)
                </h2>
              </div>
              <span className="text-2xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                Filtros Avantpro
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Demanda Total */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                    Demanda Total da Página
                  </label>
                  <span className="text-3xs text-slate-400 font-semibold">Soma 1ª pág</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={metrics.totalPageSales}
                  onChange={(e) => handleMetricChange('totalPageSales', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                />
                <p className="text-3xs text-slate-500 dark:text-slate-400">
                  Ideal: &gt; 5.000 un/mês (&gt;10k = excelente, &lt;3k = fraco).
                </p>
              </div>

              {/* 2. Anúncios com 150+ vendas/mês */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                    Anúncios com 150+ vendas/mês
                  </label>
                  <span className="text-3xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded">
                    ~5 vendas/dia
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={metrics.adsMaking150Plus}
                  onChange={(e) => handleMetricChange('adsMaking150Plus', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                />
                <p className="text-3xs text-slate-500 dark:text-slate-400">
                  Ideal: 5 a 8 anúncios (9+ = excelente, 0-2 = concentrado).
                </p>
              </div>

              {/* 3. Anúncios com 300+ vendas/mês */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                    Anúncios com 300+ vendas/mês
                  </label>
                  <span className="text-3xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded">
                    ~10 vendas/dia
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={metrics.adsMaking300Plus}
                  onChange={(e) => handleMetricChange('adsMaking300Plus', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                />
                <p className="text-3xs text-slate-500 dark:text-slate-400">
                  Ideal: 3 a 5 anúncios (mostra teto alto de escala no nicho).
                </p>
              </div>

              {/* 4. Novos Entrantes com 300+ */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                    Novos Entrantes (&lt;180d) com 300+
                  </label>
                  <span className="text-3xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-1.5 py-0.5 rounded">
                    Validador
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={metrics.newEntrants300Plus}
                  onChange={(e) => handleMetricChange('newEntrants300Plus', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                />
                <p className="text-3xs text-slate-500 dark:text-slate-400">
                  Prova de entrada: 1 ou mais anúncios recentes já no topo.
                </p>
              </div>

              {/* 5. Idade dos Anúncios */}
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                    Distribuição da Idade dos Anúncios (Total 1ª Página)
                  </label>
                  <span className="text-3xs text-slate-400 font-semibold">Rotatividade</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="block text-3xs font-bold text-slate-500 dark:text-slate-400 mb-1">&lt; 180 dias</span>
                    <input
                      type="number"
                      min="0"
                      value={metrics.adsUnder180Days}
                      onChange={(e) => handleMetricChange('adsUnder180Days', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <span className="block text-3xs font-bold text-slate-500 dark:text-slate-400 mb-1">180 a 365 dias</span>
                    <input
                      type="number"
                      min="0"
                      value={metrics.ads180To365Days}
                      onChange={(e) => handleMetricChange('ads180To365Days', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <span className="block text-3xs font-bold text-slate-500 dark:text-slate-400 mb-1">&gt; 365 dias</span>
                    <input
                      type="number"
                      min="0"
                      value={metrics.adsOver365Days}
                      onChange={(e) => handleMetricChange('adsOver365Days', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Concorrência no Full */}
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                      Concorrência no Mercado Livre Full
                    </label>
                  </div>
                  <span className="text-3xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded">
                    Qtd sellers no Full
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={metrics.fullCompetitors}
                  onChange={(e) => handleMetricChange('fullCompetitors', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                />
                <p className="text-3xs text-slate-500 dark:text-slate-400">
                  Ideal: 0 a 10 no Full (11-15 atenção, &gt;20 saturado/guerra de preço).
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: UNIT FINANCIAL SIMULATOR (OPTIONAL) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 font-black text-xs flex items-center justify-center">
                  3
                </span>
                <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  Simulação Financeira Unitária (Opcional)
                </h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={financials.enabled}
                  onChange={(e) => handleFinancialChange('enabled', e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                />
                <span>Habilitar Cálculos Financeiros</span>
              </label>
            </div>

            {financials.enabled ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-3xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Preço de Venda (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={financials.sellPrice}
                      onChange={(e) => handleFinancialChange('sellPrice', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Custo Produto (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={financials.costPrice}
                      onChange={(e) => handleFinancialChange('costPrice', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Comissão ML (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={financials.mlCommissionPercent}
                      onChange={(e) => handleFinancialChange('mlCommissionPercent', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Taxa Fixa ML (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={financials.fixedFee}
                      onChange={(e) => handleFinancialChange('fixedFee', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Frete / Envio (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={financials.shippingFee}
                      onChange={(e) => handleFinancialChange('shippingFee', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Imposto / DAS (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={financials.taxPercent}
                      onChange={(e) => handleFinancialChange('taxPercent', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Ads / Tráfego (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={financials.adsPercent}
                      onChange={(e) => handleFinancialChange('adsPercent', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Outros Custos (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={financials.otherCosts}
                      onChange={(e) => handleFinancialChange('otherCosts', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
                    />
                  </div>
                </div>

                {calcFinancials && (
                  <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-3xs font-bold uppercase text-emerald-800 dark:text-emerald-300">Lucro Líquido Unit.</span>
                      <p className="text-base font-black text-emerald-950 dark:text-emerald-200">
                        {formatCurrency(calcFinancials.netProfitUnit)}
                      </p>
                    </div>
                    <div>
                      <span className="text-3xs font-bold uppercase text-emerald-800 dark:text-emerald-300">Margem Líquida</span>
                      <p className="text-base font-black text-emerald-950 dark:text-emerald-200">
                        {formatPercent(calcFinancials.netMarginPercent)}
                      </p>
                    </div>
                    <div>
                      <span className="text-3xs font-bold uppercase text-emerald-800 dark:text-emerald-300">Lucro Mensal (150 un)</span>
                      <p className="text-base font-black text-emerald-950 dark:text-emerald-200">
                        {formatCurrency(calcFinancials.monthlyProfit150Sales)}
                      </p>
                    </div>
                    <div>
                      <span className="text-3xs font-bold uppercase text-emerald-800 dark:text-emerald-300">Faturamento (150 un)</span>
                      <p className="text-base font-black text-emerald-950 dark:text-emerald-200">
                        {formatCurrency(calcFinancials.monthlyRevenue150Sales)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Cálculos financeiros desativados. Ative a caixa acima caso queira simular margem e lucratividade na meta de 150 vendas/mês.
              </p>
            )}
          </div>

          {/* SAVE BUTTON */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 px-7 py-3 rounded-xl font-black text-sm shadow-xs transition-all border border-amber-300 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Salvar Alterações' : 'Salvar & Ver Diagnóstico Completo'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT 1 COL: REAL-TIME SCORE & LIVE DIAGNOSTIC */}
        <div className="space-y-6">
          <div className="sticky top-20 space-y-6">
            {/* SCORE CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-2xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                    Score de Oportunidade
                  </span>
                </div>
                <span className="text-2xs font-bold text-slate-400">Tempo Real</span>
              </div>

              {/* Big Score Display */}
              <div className="text-center py-2 space-y-1">
                <div className="inline-flex items-baseline gap-1">
                  <span className="text-5xl font-black text-slate-950 dark:text-amber-400 tracking-tight">
                    {scoreBreakdown.totalScore}
                  </span>
                  <span className="text-sm font-bold text-slate-400">/100</span>
                </div>
                <p className="text-2xs text-slate-400 font-semibold uppercase">Pontuação Algorítmica</p>
              </div>

              {/* Recommendation Badge */}
              <div className={`p-3.5 rounded-xl border text-center space-y-1 ${recBadge.color}`}>
                <span className="text-xs font-black uppercase tracking-wider block">
                  {recBadge.label}
                </span>
                <p className="text-2xs font-medium opacity-90">{recBadge.desc}</p>
              </div>

              {/* Chance 3/Day & Vantagem Full */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xs font-bold uppercase text-slate-400 block">
                      Meta Mínima (3 vendas/dia)
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {diagnosis.chanceGoal5Daily === 'ALTA'
                        ? '🟢 ALTA PROBABILIDADE'
                        : diagnosis.chanceGoal5Daily === 'MEDIA'
                        ? '🟡 PROBABILIDADE MÉDIA'
                        : '🔴 BAIXA PROBABILIDADE'}
                    </span>
                  </div>
                  <span className="text-3xs font-extrabold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    Full 90/mês
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-3xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    Vantagem Full:
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {diagnosis.fullAdvantage?.label || '🟢 ALTA'}
                  </span>
                </div>
              </div>

              {/* Score Breakdown Bars */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-2xs">
                <span className="font-bold text-slate-600 dark:text-slate-400 uppercase text-3xs tracking-wider block">
                  Composição da Pontuação
                </span>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Demanda Total</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">{scoreBreakdown.demandScore} / {settings.weightDemand} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Ritmo Atual (150+/mês)</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">{scoreBreakdown.rate150Score} / {settings.weightRate150} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Ritmo Forte (300+/mês)</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">{scoreBreakdown.rate300Score} / {settings.weightRate300} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Novos Entrantes (&lt;180d)</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">{scoreBreakdown.newEntrantsScore} / {settings.weightNewEntrants} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Idade dos Anúncios</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">{scoreBreakdown.adAgeScore} / {settings.weightAdAge} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Concorrência Full</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">{scoreBreakdown.fullCompScore} / {settings.weightFullComp} pts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Verdict Preview */}
            <div className="bg-slate-900 dark:bg-slate-900/90 text-white rounded-2xl p-5 border border-slate-800 dark:border-slate-700 shadow-2xs space-y-3">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Flame className="w-4 h-4" />
                <span className="text-2xs font-black uppercase tracking-wider">Veredito do Mineirador</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {diagnosis.verdictText}
              </p>
              <div className="pt-2 border-t border-slate-800 dark:border-slate-700">
                <span className="text-3xs uppercase font-bold text-amber-400 block mb-1">Próxima Etapa:</span>
                <p className="text-2xs text-slate-300 font-semibold">{diagnosis.nextStep}</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
