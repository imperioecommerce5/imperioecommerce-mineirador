import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  PlusCircle,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Eye,
  Scale,
  Target,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { ProductAnalysis, RecommendationStatus } from '../types';
import { formatCurrency, formatNumber, formatPercent, formatDateShort } from '../utils/formatters';

interface ProductsListViewProps {
  products: ProductAnalysis[];
  onSelectProduct: (product: ProductAnalysis) => void;
  onEditProduct: (product: ProductAnalysis) => void;
  onDuplicateProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  onNavigate: (view: string) => void;
  selectedForCompare: string[];
  onToggleCompare: (id: string) => void;
  onGoToCompare: () => void;
}

export const ProductsListView: React.FC<ProductsListViewProps> = ({
  products,
  onSelectProduct,
  onEditProduct,
  onDuplicateProduct,
  onDeleteProduct,
  onNavigate,
  selectedForCompare,
  onToggleCompare,
  onGoToCompare,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('SCORE_DESC');
  const [productToDelete, setProductToDelete] = useState<ProductAnalysis | null>(null);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.keyword.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' || p.scoreBreakdown.recommendation === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [products, searchTerm, statusFilter]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'SCORE_DESC':
        return list.sort((a, b) => b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore);
      case 'SCORE_ASC':
        return list.sort((a, b) => a.scoreBreakdown.totalScore - b.scoreBreakdown.totalScore);
      case 'DEMAND_DESC':
        return list.sort((a, b) => b.metrics.totalPageSales - a.metrics.totalPageSales);
      case 'FULL_ASC':
        return list.sort((a, b) => a.metrics.fullCompetitors - b.metrics.fullCompetitors);
      case 'MARGIN_DESC':
        return list.sort(
          (a, b) =>
            (b.calculatedFinancials?.netMarginPercent || 0) -
            (a.calculatedFinancials?.netMarginPercent || 0)
        );
      case 'PROFIT_DESC':
        return list.sort(
          (a, b) =>
            (b.calculatedFinancials?.monthlyProfit150Sales || 0) -
            (a.calculatedFinancials?.monthlyProfit150Sales || 0)
        );
      case 'RECENT':
      default:
        return list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [filteredProducts, sortBy]);

  const getRecBadge = (rec: string) => {
    switch (rec) {
      case 'ENTRAR':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'ANALISAR':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'ALTO_RISCO':
        return 'bg-orange-100 text-orange-900 border-orange-300';
      default:
        return 'bg-rose-100 text-rose-900 border-rose-300';
    }
  };

  return (
    <div className="w-full max-w-none space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Banco de Dados
            </span>
            <span className="text-2xs text-slate-400 font-semibold">• Produtos Analisados</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Produtos Analisados</span>
            <span className="text-sm font-bold text-slate-400">({products.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Gerencie, filtre e compare todas as oportunidades mineradas no Avantpro para o Full.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedForCompare.length > 0 && (
            <button
              type="button"
              onClick={onGoToCompare}
              className="flex items-center gap-2 bg-slate-900 dark:bg-amber-400 hover:bg-slate-800 dark:hover:bg-amber-500 text-amber-400 dark:text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer border border-slate-800 dark:border-amber-300"
            >
              <Scale className="w-4 h-4" />
              <span>Comparar Selecionados ({selectedForCompare.length}/3)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('nova-analise')}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer border border-amber-300"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Análise</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou palavra-chave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50/50 dark:bg-slate-800 dark:placeholder-slate-500"
          />
        </div>

        {/* Filter Recommendation */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50/50 dark:bg-slate-800 appearance-none cursor-pointer"
          >
            <option value="ALL">Todas as Recomendações</option>
            <option value="ENTRAR">Recomendados (ENTRAR)</option>
            <option value="ANALISAR">Em Análise (ANALISAR)</option>
            <option value="ALTO_RISCO">Alto Risco</option>
            <option value="DESCARTAR">Descartados</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="relative">
          <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50/50 dark:bg-slate-800 appearance-none cursor-pointer"
          >
            <option value="SCORE_DESC">Maior Score (0 a 100)</option>
            <option value="SCORE_ASC">Menor Score</option>
            <option value="DEMAND_DESC">Maior Demanda 1ª Pág</option>
            <option value="FULL_ASC">Menor Concorrência Full</option>
            <option value="MARGIN_DESC">Maior Margem Líquida %</option>
            <option value="PROFIT_DESC">Maior Lucro Mensal (150 un)</option>
            <option value="RECENT">Mais Recentes</option>
          </select>
        </div>
      </div>

      {/* TABLE & CARDS LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {sortedProducts.length > 0 ? (
          <>
            {/* Desktop / Tablet: Full Width Table without horizontal scrolling */}
            <div className="hidden md:block w-full">
              <table className="w-full table-fixed text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-3xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    <th className="py-3 px-3 w-[56px] text-center">COMP.</th>
                    <th className="py-3 px-4 w-[28%] text-left">PRODUTO</th>
                    <th className="py-3 px-2 w-[7%] text-center">SCORE</th>
                    <th className="py-3 px-2 w-[9%] text-center">DEMANDA 1ª PÁG</th>
                    <th className="py-3 px-2 w-[8%] text-center">150+ /MÊS</th>
                    <th className="py-3 px-2 w-[7%] text-center">NOVOS</th>
                    <th className="py-3 px-2 w-[7%] text-center">FULL</th>
                    <th className="py-3 px-2 w-[8%] text-center">MARGEM</th>
                    <th className="py-3 px-2 w-[10%] text-center">LUCRO</th>
                    <th className="py-3 px-3 w-[12%] text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                  {sortedProducts.map((p) => {
                    const isSelected = selectedForCompare.includes(p.id);
                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors group cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/60 dark:bg-amber-950/30'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                        }`}
                        onClick={() => onSelectProduct(p)}
                      >
                        {/* 1. Seleção */}
                        <td
                          className="py-3.5 px-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleCompare(p.id)}
                            className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer align-middle dark:bg-slate-800 dark:border-slate-700"
                            title="Selecionar para comparar"
                          />
                        </td>

                        {/* 2. Produto */}
                        <td className="py-3.5 px-4 min-w-0">
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <strong
                              className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors block line-clamp-2 leading-snug"
                              title={p.name}
                            >
                              {p.name}
                            </strong>
                            <div className="flex items-center gap-1.5 text-3xs text-slate-400 truncate">
                              <span className="truncate">{p.keyword}</span>
                              <span>•</span>
                              <span className="shrink-0">{formatDateShort(p.createdAt)}</span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Score */}
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          <span className="font-black text-slate-950 dark:text-amber-400 text-xs sm:text-sm">
                            {p.scoreBreakdown.totalScore}
                            <span className="text-3xs text-slate-400 font-bold">/100</span>
                          </span>
                        </td>

                        {/* 4. Demanda */}
                        <td className="py-3 px-2 text-center whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">
                          {formatNumber(p.metrics.totalPageSales)}
                        </td>

                        {/* 5. 150+/mês */}
                        <td className="py-3 px-2 text-center whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">
                          {p.metrics.adsMaking150Plus}
                        </td>

                        {/* 6. Novos */}
                        <td className="py-3 px-2 text-center whitespace-nowrap font-bold text-purple-700 dark:text-purple-400">
                          {p.metrics.newEntrants300Plus}
                        </td>

                        {/* 7. Full */}
                        <td className="py-3 px-2 text-center whitespace-nowrap font-bold text-emerald-700 dark:text-emerald-400">
                          {p.metrics.fullCompetitors}
                        </td>

                        {/* 8. Margem */}
                        <td className="py-3 px-2 text-center whitespace-nowrap font-bold text-slate-800 dark:text-slate-200">
                          {p.calculatedFinancials
                            ? formatPercent(p.calculatedFinancials.netMarginPercent)
                            : '-'}
                        </td>

                        {/* 9. Lucro */}
                        <td className="py-3 px-2 text-center whitespace-nowrap font-black text-emerald-600 dark:text-emerald-400">
                          {p.calculatedFinancials
                            ? formatCurrency(p.calculatedFinancials.monthlyProfit150Sales)
                            : '-'}
                        </td>

                        {/* 10. Ações */}
                        <td
                          className="py-3 px-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                            <button
                              type="button"
                              onClick={() => onSelectProduct(p)}
                              className="p-1 sm:p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Ver Diagnóstico Completo"
                            >
                              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditProduct(p)}
                              className="p-1 sm:p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDuplicateProduct(p.id)}
                              className="p-1 sm:p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Duplicar"
                            >
                              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductToDelete(p)}
                              className="p-1 sm:p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
              {sortedProducts.map((p) => {
                const isSelected = selectedForCompare.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`p-4 space-y-3 transition-colors ${
                      isSelected
                        ? 'bg-amber-50/60 dark:bg-amber-950/30'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-800/50'
                    }`}
                    onClick={() => onSelectProduct(p)}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex items-start gap-2.5 min-w-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleCompare(p.id)}
                          className="mt-0.5 rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer shrink-0 dark:bg-slate-800 dark:border-slate-700"
                          title="Selecionar para comparar"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <strong className="text-xs font-bold text-slate-900 dark:text-white block leading-snug line-clamp-2">
                            {p.name}
                          </strong>
                          <div className="flex items-center gap-1.5 text-3xs text-slate-400">
                            <span className="truncate font-medium">{p.keyword}</span>
                            <span>•</span>
                            <span className="shrink-0">{formatDateShort(p.createdAt)}</span>
                          </div>
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
                          Demanda 1ª Pág
                        </span>
                        <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap block">
                          {formatNumber(p.metrics.totalPageSales)}
                        </strong>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-3xs font-bold text-slate-400 uppercase block">
                          150+ /mês
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
                      <button
                        type="button"
                        onClick={() => onSelectProduct(p)}
                        className="inline-flex items-center gap-1 text-2xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Diagnóstico</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditProduct(p)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateProduct(p.id)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Duplicar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="p-12 text-center space-y-3">
            <Target className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum produto encontrado</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Nenhum registro atende aos filtros de busca atuais. Tente limpar os filtros.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {productToDelete && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setProductToDelete(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Excluir Produto
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Deseja realmente excluir este produto?
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <strong className="text-xs font-bold text-slate-900 dark:text-white block line-clamp-2">
                {productToDelete.name}
              </strong>
              <span className="text-3xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                Palavra-chave: {productToDelete.keyword}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs transition-all cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
