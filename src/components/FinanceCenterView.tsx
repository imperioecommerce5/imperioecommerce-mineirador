import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Sun, 
  Moon, 
  Menu, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  EyeOff,
  Home,
  List,
  Sliders,
  MoreHorizontal,
  Trash2,
  Target,
  Building2,
  Check,
  AlertCircle
} from 'lucide-react';

interface Pote {
  id: string;
  nome: string;
  percentual: number;
  cor: string;
  iconeEmoji: string;
}

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'entrada' | 'saida';
  poteId: string;
  data: string;
}

interface Meta {
  id: string;
  nome: string;
  valorAlvo: number;
  valorAtual: number;
  dataLimite: string;
}

interface ItemPatrimonio {
  id: string;
  nome: string;
  valor: number;
}

export const FinanceCenterView: React.FC = () => {
  // Configurações Globais
  const [rendaMensal, setRendaMensal] = useState<number>(2000);
  const [tema, setTema] = useState<'claro' | 'escuro'>('claro');
  const [tamparValores, setTamparValores] = useState<boolean>(false);
  const [telaAtiva, setTelaAtiva] = useState<'onboarding' | 'confirmacao' | 'dashboard' | 'ajustes' | 'extrato' | 'metas' | 'patrimonio'>('onboarding');
  const [menuAberto, setMenuAberto] = useState<boolean>(false);

  // Seleção de % ao Adicionar Pote
  const [potePendente, setPotePendente] = useState<Pote | null>(null);
  const [percentualPendente, setPercentualPendente] = useState<number>(10);

  // Modais de Entrada / Lançamentos
  const [modalEntradaInicial, setModalEntradaInicial] = useState<boolean>(false);
  const [valorEntradaInicial, setValorEntradaInicial] = useState<number | ''>('');

  const [modalLancamento, setModalLancamento] = useState<boolean>(false);
  const [tipoLancamento, setTipoLancamento] = useState<'saida' | 'entrada'>('saida');
  const [valorLancamento, setValorLancamento] = useState<number | ''>('');
  const [descLancamento, setDescLancamento] = useState<string>('');
  const [poteSelecionadoId, setPoteSelecionadoId] = useState<string>('supermercado');

  // Modal Aporte em Meta
  const [metaAporteId, setMetaAporteId] = useState<string | null>(null);
  const [valorAporteMeta, setValorAporteMeta] = useState<number | ''>('');

  // Transações
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  // Potes Disponíveis
  const todosPotesDisponiveis: Pote[] = [
    { id: 'reserva', nome: 'Reserva', percentual: 30, cor: '#10B981', iconeEmoji: '🐷' },
    { id: 'transporte', nome: 'Transporte', percentual: 10, cor: '#3B82F6', iconeEmoji: '🚗' },
    { id: 'supermercado', nome: 'Supermercado', percentual: 20, cor: '#F97316', iconeEmoji: '🧺' },
    { id: 'desfrute_marido', nome: 'Desfrute ele', percentual: 10, cor: '#8B5CF6', iconeEmoji: '🎮' },
    { id: 'desfrute_esposa', nome: 'Desfrute ela', percentual: 10, cor: '#EC4899', iconeEmoji: '🛍️' },
    { id: 'dividas', nome: 'Dívidas & Parcelas', percentual: 15, cor: '#EF4444', iconeEmoji: '💳' },
    { id: 'dizimo', nome: 'Dízimo', percentual: 5, cor: '#84CC16', iconeEmoji: '✉️' },
    { id: 'investimento_ml', nome: 'Investimento ML', percentual: 0, cor: '#F59E0B', iconeEmoji: '📈' },
  ];

  const [potesAtivos, setPotesAtivos] = useState<Pote[]>([
    todosPotesDisponiveis[0],
    todosPotesDisponiveis[1],
    todosPotesDisponiveis[2],
    todosPotesDisponiveis[5]
  ]);

  // Metas & Patrimônio
  const [metas, setMetas] = useState<Meta[]>([
    { id: '1', nome: 'Reserva de Emergência', valorAlvo: 5000, valorAtual: 500, dataLimite: '2026-12-31' }
  ]);
  const [novaMetaNome, setNovaMetaNome] = useState('');
  const [novaMetaValor, setNovaMetaValor] = useState<number | ''>('');
  const [novaMetaDate, setNovaMetaDate] = useState('');

  const [patrimonioItems, setPatrimonioItems] = useState<ItemPatrimonio[]>([
    { id: '1', nome: 'Reserva CDB', valor: 2000 },
    { id: '2', nome: 'Estoque Loja ML', valor: 5000 }
  ]);

  // Cálculos do Sistema
  const totalMapeado = potesAtivos.reduce((acc, p) => acc + p.percentual, 0);
  const disponivelGeral = Math.max(0, 100 - totalMapeado);

  const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  const saldoDisponivel = totalEntradas - totalSaidas;
  const totalPatrimonio = patrimonioItems.reduce((acc, item) => acc + item.valor, 0);

  // Ações de Potes com Trava dos 100%
  const solicitarAdicaoPote = (pote: Pote) => {
    if (!potesAtivos.some(p => p.id === pote.id)) {
      if (disponivelGeral <= 0) {
        alert("Você já mapeou 100% do seu plano! Reduza o percentual de um pote existente antes de adicionar um novo.");
        return;
      }
      setPotePendente(pote);
      setPercentualPendente(Math.min(10, disponivelGeral));
    }
  };

  const confirmarAdicionarPote = () => {
    if (potePendente) {
      setPotesAtivos([...potesAtivos, { ...potePendente, percentual: percentualPendente }]);
      setPotePendente(null);
    }
  };

  const removerPote = (id: string) => {
    setPotesAtivos(potesAtivos.filter(p => p.id !== id));
  };

  const atualizarPercentual = (id: string, valorDesejado: number) => {
    const outrosPotesSoma = potesAtivos.filter(p => p.id !== id).reduce((acc, p) => acc + p.percentual, 0);
    const maxPermitido = 100 - outrosPotesSoma;
    const valorFinal = Math.min(valorDesejado, maxPermitido);

    setPotesAtivos(prev => prev.map(p => p.id === id ? { ...p, percentual: valorFinal } : p));
  };

  // Processar Lançamentos
  const processarEntrada = (valor: number, desc: string) => {
    const novaEntrada: Transacao = {
      id: Date.now().toString(),
      descricao: desc,
      valor: valor,
      tipo: 'entrada',
      poteId: 'geral',
      data: new Date().toLocaleDateString('pt-BR')
    };
    setTransacoes(prev => [novaEntrada, ...prev]);
  };

  const salvarLancamento = () => {
    if (!valorLancamento || valorLancamento <= 0) return;
    if (tipoLancamento === 'entrada') {
      processarEntrada(Number(valorLancamento), descLancamento || 'Entrada Rápida');
    } else {
      const novaSaida: Transacao = {
        id: Date.now().toString(),
        descricao: descLancamento || 'Gasto',
        valor: Number(valorLancamento),
        tipo: 'saida',
        poteId: poteSelecionadoId,
        data: new Date().toLocaleDateString('pt-BR')
      };
      setTransacoes(prev => [novaSaida, ...prev]);
    }
    setValorLancamento(''); setDescLancamento(''); setModalLancamento(false);
  };

  const confirmarEntradaInicial = () => {
    if (valorEntradaInicial && Number(valorEntradaInicial) > 0) {
      processarEntrada(Number(valorEntradaInicial), 'Renda Inicial Registrada');
    }
    setModalEntradaInicial(false);
    setTelaAtiva('dashboard');
  };

  const salvarAporteMeta = () => {
    if (!metaAporteId || !valorAporteMeta || valorAporteMeta <= 0) return;
    setMetas(metas.map(m => m.id === metaAporteId ? { ...m, valorAtual: m.valorAtual + Number(valorAporteMeta) } : m));
    setTransacoes(prev => [{
      id: Date.now().toString(),
      descricao: `Aporte Meta: ${metas.find(m => m.id === metaAporteId)?.nome}`,
      valor: Number(valorAporteMeta),
      tipo: 'saida',
      poteId: 'reserva',
      data: new Date().toLocaleDateString('pt-BR')
    }, ...prev]);
    setMetaAporteId(null); setValorAporteMeta('');
  };

  const adicionarMeta = () => {
    if (!novaMetaNome || !novaMetaValor || !novaMetaDate) return;
    setMetas([...metas, {
      id: Date.now().toString(),
      nome: novaMetaNome,
      valorAlvo: Number(novaMetaValor),
      valorAtual: 0,
      dataLimite: novaMetaDate
    }]);
    setNovaMetaNome(''); setNovaMetaValor(''); setNovaMetaDate('');
  };

  const formatarGrana = (valor: number) => {
    if (tamparValores) return 'R$ •••••';
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Fatias SVG do Círculo
  let acumulado = 0;
  const fatiasSVG = potesAtivos.map(pote => {
    const inicio = acumulado;
    acumulado += pote.percentual;
    return { ...pote, inicio, fim: acumulado };
  });

  const bgClasse = tema === 'escuro' ? 'bg-slate-950 text-slate-100' : 'bg-[#F4F7F6] text-slate-800';
  const cardClasse = tema === 'escuro' 
    ? 'bg-slate-900 border-slate-800 shadow-xl' 
    : 'bg-white border-slate-200/80 shadow-md';

  return (
    <div className={`min-h-screen ${bgClasse} font-sans tracking-tight flex flex-col justify-between transition-colors duration-200 pb-20 select-none`}>
      
      {/* HEADER ADAPTÁVEL */}
      <header className={`p-3 md:p-4 border-b flex justify-between items-center sticky top-0 z-30 ${tema === 'escuro' ? 'border-slate-800 bg-slate-950/90 backdrop-blur' : 'border-slate-200/80 bg-white/90 backdrop-blur'}`}>
        <div className="flex items-center space-x-1.5">
          <span className="text-lg md:text-2xl font-black text-emerald-600 tracking-tight">MEU IMPÉRIO</span>
          <span className="text-[9px] md:text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold uppercase">Finance</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button onClick={() => setTamparValores(!tamparValores)} className="p-2 md:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-emerald-600 transition-all">
            {tamparValores ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={() => setTema(tema === 'escuro' ? 'claro' : 'escuro')} className="p-2 md:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-emerald-600 transition-all">
            {tema === 'escuro' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMenuAberto(true)} className="p-2 md:p-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-md shadow-emerald-500/20 transition-all">
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* TELA 1: ONBOARDING / MONTANDO PLANO */}
      {telaAtiva === 'onboarding' && (
        <main className="max-w-xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-center md:text-left">Montando seu plano financeiro</h1>

          <div className={`${cardClasse} rounded-3xl p-4 md:p-6 space-y-3`}>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Meta de Renda Mensal</span>
                <span className="text-[10px] md:text-[11px] text-slate-400">Projeção para alocação</span>
              </div>
              <div className="flex items-center text-lg md:text-xl font-black">
                <span className="text-xs md:text-sm text-slate-400 mr-1">R$</span>
                <input
                  type="number"
                  value={rendaMensal}
                  onChange={(e) => setRendaMensal(Number(e.target.value))}
                  className="w-24 md:w-28 text-right bg-transparent focus:outline-none border-b-2 border-emerald-500 font-black"
                />
              </div>
            </div>
          </div>

          {/* Círculo Central Responsivo */}
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6 p-4 md:p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center drop-shadow-xl">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="11" />
                {fatiasSVG.map(pote => {
                  if (pote.percentual <= 0) return null;
                  return (
                    <circle
                      key={pote.id}
                      cx="50" cy="50" r="40"
                      fill="transparent"
                      stroke={pote.cor}
                      strokeWidth="11"
                      strokeDasharray={`${pote.percentual * 2.51327} 251.327`}
                      strokeDashoffset={`-${pote.inicio * 2.51327}`}
                      className="transition-all duration-300 ease-out"
                    />
                  );
                })}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl md:text-4xl font-black tracking-tight">{totalMapeado}%</span>
                <span className="text-[10px] text-slate-400 font-semibold max-w-[80px]">
                  {disponivelGeral > 0 ? `${disponivelGeral}% livre` : '100% preenchido'}
                </span>
              </div>
            </div>

            {/* Grid dos Potes Selecionados */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
              {potesAtivos.map(pote => (
                <div 
                  key={pote.id} 
                  onClick={() => {
                    const outros = potesAtivos.filter(p => p.id !== pote.id).reduce((a, b) => a + b.percentual, 0);
                    setPotePendente(pote);
                    setPercentualPendente(pote.percentual);
                  }}
                  className={`${cardClasse} p-3 rounded-2xl flex flex-col items-center text-center cursor-pointer relative group transition-all active:scale-95`}
                >
                  <button onClick={(e) => { e.stopPropagation(); removerPote(pote.id); }} className="absolute top-1.5 right-1.5 text-slate-400 hover:text-rose-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-2xl md:text-3xl mb-1">{pote.iconeEmoji}</span>
                  <span className="text-[11px] md:text-xs font-bold truncate w-full">{pote.nome}</span>
                  <span className="text-xs font-black text-emerald-600">{pote.percentual}%</span>
                </div>
              ))}
            </div>

            <button onClick={() => setTelaAtiva('confirmacao')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 md:py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all text-sm md:text-base">
              Concluir Plano Financeiro
            </button>
          </div>

          {/* Banco de Potes */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold text-center text-slate-400">Escolha mais potes para o seu plano:</p>
            <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
              {todosPotesDisponiveis.map(pote => {
                const selecionado = potesAtivos.some(p => p.id === pote.id);
                return (
                  <button 
                    key={pote.id} 
                    disabled={selecionado} 
                    onClick={() => solicitarAdicaoPote(pote)} 
                    className={`flex-shrink-0 p-2.5 rounded-2xl border text-center flex flex-col items-center space-y-1 w-20 md:w-24 transition-all ${selecionado ? 'opacity-40 border-slate-200 grayscale cursor-not-allowed' : `${cardClasse} hover:border-emerald-500 active:scale-95`}`}
                  >
                    <span className="text-xl md:text-2xl">{pote.iconeEmoji}</span>
                    <span className="text-[10px] md:text-[11px] font-bold truncate w-full">{pote.nome}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* MODAL TRAVA 100% AO AJUSTAR PERCENTUAL */}
      {potePendente && (() => {
        const outrosPotesSoma = potesAtivos.filter(p => p.id !== potePendente.id).reduce((acc, p) => acc + p.percentual, 0);
        const maxPermitido = 100 - outrosPotesSoma;

        return (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className={`${cardClasse} rounded-3xl p-5 md:p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative`}>
              <button onClick={() => setPotePendente(null)} className="absolute top-4 right-4 text-slate-400">
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-2xl">
                {potePendente.iconeEmoji}
              </div>

              <div>
                <h3 className="text-base md:text-lg font-black">{potePendente.nome}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Defina o percentual para este pote</p>
              </div>

              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-8 border-emerald-500 flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-inner">
                  <span className="text-xl font-black">{percentualPendente}%</span>
                  <span className="text-[9px] font-bold text-emerald-600">
                    {formatarGrana((rendaMensal * percentualPendente) / 100)}/mês
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="1"
                max={maxPermitido}
                value={percentualPendente}
                onChange={(e) => setPercentualPendente(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />

              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800/60 p-2 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Máximo disponível para não exceder 100%: <strong>{maxPermitido}%</strong></span>
              </div>

              <button
                onClick={confirmarAdicionarPote}
                className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm"
              >
                <Check className="w-4 h-4" /> Confirmar Porcentagem
              </button>
            </div>
          </div>
        );
      })()}

      {/* TELA 2: CONFIRMAÇÃO & ENTRADA INICIAL */}
      {telaAtiva === 'confirmacao' && (
        <main className="max-w-sm mx-auto p-4 text-center space-y-5 my-auto">
          <h2 className="text-xl md:text-2xl font-black">Seu plano está pronto!</h2>
          <div className="relative w-48 h-48 md:w-52 md:h-52 mx-auto flex items-center justify-center drop-shadow-xl">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {fatiasSVG.map(pote => (
                <circle key={pote.id} cx="50" cy="50" r="40" fill="transparent" stroke={pote.cor} strokeWidth="11" strokeDasharray={`${pote.percentual * 2.51327} 251.327`} strokeDashoffset={`-${pote.inicio * 2.51327}`} />
              ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center p-3 text-[11px] font-semibold text-slate-500">
              As entradas serão diluídas automaticamente nos potes!
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button 
              onClick={() => setModalEntradaInicial(true)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all text-sm"
            >
              Registrar Entrada Inicial
            </button>

            <button 
              onClick={() => setTelaAtiva('dashboard')}
              className="w-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-2xl transition-all text-sm"
            >
              Ainda não tenho entrada
            </button>
          </div>
        </main>
      )}

      {/* MODAL SOLICITAR ENTRADA INICIAL */}
      {modalEntradaInicial && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 md:p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative`}>
            <button onClick={() => setModalEntradaInicial(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base md:text-lg font-black">Qual valor entrou hoje?</h3>
            <p className="text-xs text-slate-400">Esse valor será diluído automaticamente entre os potes.</p>

            <input
              type="number"
              placeholder="Valor R$"
              value={valorEntradaInicial}
              onChange={(e) => setValorEntradaInicial(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-center font-black text-lg focus:outline-none"
            />

            <button
              onClick={confirmarEntradaInicial}
              className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-500/20 text-sm"
            >
              Confirmar e Diluir
            </button>
          </div>
        </div>
      )}

      {/* TELA 3: DASHBOARD PRINCIPAL */}
      {telaAtiva === 'dashboard' && (
        <main className="max-w-4xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          <div className={`${cardClasse} rounded-3xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4`}>
            <div className="text-center md:text-left">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Saldo Disponível em Caixa</span>
              <div className="text-2xl md:text-4xl font-black text-emerald-600 mt-0.5">
                {formatarGrana(saldoDisponivel)}
              </div>
            </div>

            <button onClick={() => setModalLancamento(true)} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-black px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm">
              <Plus className="w-4 h-4" /> Entrada / Gasto
            </button>
          </div>

          {/* POTES COM DILUIÇÃO EM TEMPO REAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {potesAtivos.map(pote => {
              const valorDiluidoNoPote = (totalEntradas * pote.percentual) / 100;
              const gastosPote = transacoes.filter(t => t.tipo === 'saida' && t.poteId === pote.id).reduce((acc, t) => acc + t.valor, 0);
              const saldoRealPote = valorDiluidoNoPote - gastosPote;

              return (
                <div key={pote.id} className={`${cardClasse} rounded-3xl p-4 md:p-6 flex flex-col items-center text-center space-y-3`}>
                  <div className="flex items-center space-x-2 font-bold text-xs md:text-sm">
                    <span className="text-xl md:text-2xl">{pote.iconeEmoji}</span>
                    <span>{pote.nome}</span>
                  </div>

                  <div className="relative w-28 h-28 md:w-32 md:h-32 flex items-center justify-center drop-shadow-md">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center" style={{ borderColor: pote.cor }}>
                      <span className="text-xs md:text-sm font-black">{formatarGrana(saldoRealPote)}</span>
                    </div>
                  </div>

                  <span className="text-[11px] md:text-xs font-bold text-slate-400">
                    Alocado ({pote.percentual}%): {formatarGrana(valorDiluidoNoPote)}
                  </span>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* TELA 4: AJUSTAR LIMITES */}
      {telaAtiva === 'ajustes' && (
        <main className="max-w-xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-black flex items-center gap-2"><Sliders className="w-5 h-5 text-emerald-600" /> Ajustar Potes</h2>
            <button onClick={() => setTelaAtiva('dashboard')} className="text-xs font-bold text-emerald-600">Salvar & Voltar</button>
          </div>

          <div className={`${cardClasse} rounded-3xl p-4 md:p-6 space-y-4`}>
            {potesAtivos.map(pote => (
              <div key={pote.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>{pote.iconeEmoji} {pote.nome}</span>
                  <span>{pote.percentual}% da renda</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={100 - potesAtivos.filter(p => p.id !== pote.id).reduce((a, b) => a + b.percentual, 0)}
                  value={pote.percentual}
                  onChange={(e) => atualizarPercentual(pote.id, Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-800 accent-emerald-500 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </main>
      )}

      {/* TELA 5: MINHAS METAS */}
      {telaAtiva === 'metas' && (
        <main className="max-w-xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-2"><Target className="w-5 h-5 text-emerald-600" /> Minhas Metas</h2>

          <div className={`${cardClasse} rounded-3xl p-4 md:p-6 space-y-3`}>
            <h3 className="text-xs font-extrabold uppercase text-slate-400">Nova Meta</h3>
            <input type="text" placeholder="Nome da Meta" value={novaMetaNome} onChange={(e) => setNovaMetaNome(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-xs md:text-sm font-bold focus:outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Valor R$" value={novaMetaValor} onChange={(e) => setNovaMetaValor(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-xs md:text-sm font-bold focus:outline-none" />
              <input type="date" value={novaMetaDate} onChange={(e) => setNovaMetaDate(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-xs md:text-sm font-bold focus:outline-none" />
            </div>
            <button onClick={adicionarMeta} className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-md text-xs md:text-sm">
              Adicionar Meta
            </button>
          </div>

          <div className="space-y-3">
            {metas.map(m => {
              const hoje = new Date();
              const prazo = new Date(m.dataLimite);
              const diffDias = Math.max(1, Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 3600 * 24)));
              const diffMeses = Math.max(1, diffDias / 30);
              const restante = Math.max(0, m.valorAlvo - m.valorAtual);
              const precisoPorDia = restante / diffDias;
              const precisoPorMes = restante / diffMeses;
              const pctConcluida = Math.min(100, (m.valorAtual / m.valorAlvo) * 100);

              return (
                <div key={m.id} className={`${cardClasse} rounded-3xl p-4 md:p-6 space-y-3 relative`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-base font-black">{m.nome}</h4>
                      <p className="text-[11px] text-slate-400">Prazo: {m.dataLimite} ({diffDias} dias restantes)</p>
                    </div>
                    <button onClick={() => setMetas(metas.filter(x => x.id !== m.id))} className="text-slate-400 hover:text-rose-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span>Progresso: {pctConcluida.toFixed(0)}%</span>
                      <span>{formatarGrana(m.valorAtual)} / {formatarGrana(m.valorAlvo)}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${pctConcluida}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-2xl text-center">
                      <span className="text-slate-400 block font-bold text-[10px]">Guardar/Dia</span>
                      <span className="text-emerald-600 font-black">{formatarGrana(precisoPorDia)}</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-2xl text-center">
                      <span className="text-slate-400 block font-bold text-[10px]">Guardar/Mês</span>
                      <span className="text-emerald-600 font-black">{formatarGrana(precisoPorMes)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setMetaAporteId(m.id)}
                    className="w-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold py-2 rounded-2xl text-xs"
                  >
                    + Guardar Valor nesta Meta
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* MODAL APORTE EM META */}
      {metaAporteId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 md:p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative`}>
            <button onClick={() => setMetaAporteId(null)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black">Aportar na Meta</h3>
            <input
              type="number"
              placeholder="Valor R$"
              value={valorAporteMeta}
              onChange={(e) => setValorAporteMeta(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-center font-black text-lg focus:outline-none"
            />

            <button
              onClick={salvarAporteMeta}
              className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl text-sm"
            >
              Confirmar Aporte
            </button>
          </div>
        </div>
      )}

      {/* TELA 6: EXTRATO */}
      {telaAtiva === 'extrato' && (
        <main className="max-w-xl mx-auto p-3 md:p-6 w-full space-y-3">
          <h2 className="text-xl font-black">Extrato</h2>
          <div className="space-y-2">
            {transacoes.map(t => (
              <div key={t.id} className={`${cardClasse} rounded-2xl p-3.5 flex justify-between items-center text-xs md:text-sm`}>
                <div className="flex items-center space-x-2.5">
                  {t.tipo === 'entrada' ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-rose-500" />}
                  <div>
                    <span className="font-bold block">{t.descricao}</span>
                    <span className="text-[10px] text-slate-400">{t.data}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <span className={`font-black ${t.tipo === 'entrada' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.tipo === 'entrada' ? '+' : '-'} {formatarGrana(t.valor)}
                  </span>
                  <button onClick={() => setTransacoes(transacoes.filter(x => x.id !== t.id))} className="text-slate-400 hover:text-rose-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* BARRA INFERIOR GLOBAL */}
      <nav className={`fixed bottom-0 inset-x-0 border-t p-1.5 flex justify-around items-center z-40 ${tema === 'escuro' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
        <button onClick={() => setTelaAtiva('dashboard')} className="flex flex-col items-center p-1.5 text-[10px] font-bold opacity-70 hover:opacity-100">
          <Home className="w-5 h-5 text-emerald-600" /> Início
        </button>
        <button onClick={() => setTelaAtiva('extrato')} className="flex flex-col items-center p-1.5 text-[10px] font-bold opacity-70 hover:opacity-100">
          <List className="w-5 h-5 text-emerald-600" /> Extrato
        </button>
        <button onClick={() => setModalLancamento(true)} className="p-3 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/30 -mt-5 active:scale-95 transition-transform">
          <Plus className="w-5 h-5" />
        </button>
        <button onClick={() => setTelaAtiva('metas')} className="flex flex-col items-center p-1.5 text-[10px] font-bold opacity-70 hover:opacity-100">
          <Target className="w-5 h-5 text-emerald-600" /> Metas
        </button>
        <button onClick={() => setMenuAberto(true)} className="flex flex-col items-center p-1.5 text-[10px] font-bold opacity-70 hover:opacity-100">
          <MoreHorizontal className="w-5 h-5 text-emerald-600" /> Mais
        </button>
      </nav>

      {/* MODAL NOVO LANÇAMENTO */}
      {modalLancamento && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 md:p-6 max-w-sm w-full space-y-4 relative shadow-2xl`}>
            <button onClick={() => setModalLancamento(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base md:text-lg font-black">Novo Lançamento</h3>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button onClick={() => setTipoLancamento('saida')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tipoLancamento === 'saida' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}>
                Gasto (Saída)
              </button>
              <button onClick={() => setTipoLancamento('entrada')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tipoLancamento === 'entrada' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>
                Renda (Entrada)
              </button>
            </div>

            <input type="number" placeholder="Valor R$" value={valorLancamento} onChange={(e) => setValorLancamento(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl font-black text-lg focus:outline-none" />
            <input type="text" placeholder="Descrição" value={descLancamento} onChange={(e) => setDescLancamento(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-xs md:text-sm focus:outline-none" />

            {tipoLancamento === 'saida' && (
              <select value={poteSelecionadoId} onChange={(e) => setPoteSelecionadoId(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-xs md:text-sm focus:outline-none font-bold">
                {potesAtivos.map(p => (
                  <option key={p.id} value={p.id}>{p.iconeEmoji} {p.nome}</option>
                ))}
              </select>
            )}

            <button onClick={salvarLancamento} className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-500/20 text-sm">
              Registrar Lançamento
            </button>
          </div>
        </div>
      )}

      {/* MENU GAVETA LATERAL */}
      {menuAberto && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex justify-end">
          <div className={`${cardClasse} w-72 md:w-80 h-full p-5 space-y-5 overflow-y-auto relative`}>
            <button onClick={() => setMenuAberto(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black">MEU IMPÉRIO</h3>

            <div className="space-y-1.5 text-xs md:text-sm font-bold">
              <button onClick={() => { setTelaAtiva('extrato'); setMenuAberto(false); }} className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5">
                <List className="w-4 h-4 text-emerald-600" /> Extrato Completo
              </button>
              <button onClick={() => { setTelaAtiva('ajustes'); setMenuAberto(false); }} className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-emerald-600" /> Ajustar Limites e Potes
              </button>
              <button onClick={() => { setTelaAtiva('metas'); setMenuAberto(false); }} className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5">
                <Target className="w-4 h-4 text-emerald-600" /> Minhas Metas
              </button>
              <button onClick={() => { setTelaAtiva('onboarding'); setMenuAberto(false); }} className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-blue-500" /> Refazer Plano
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FinanceCenterView;
