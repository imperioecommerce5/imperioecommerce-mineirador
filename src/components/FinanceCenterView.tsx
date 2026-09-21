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
  Percent
} from 'lucide-react';

interface Pote {
  id: string;
  nome: string;
  percentual: number;
  cor: string;
  iconeEmoji: string;
  subtexto?: string;
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
  categoria: string;
}

export const FinanceCenterView: React.FC = () => {
  // Configurações Globais e Tema
  const [rendaMensal, setRendaMensal] = useState<number>(2000);
  const [frequencia, setFrequencia] = useState<'dia' | 'semana' | 'quinzena' | 'mes'>('mes');
  const [tema, setTema] = useState<'claro' | 'escuro'>('claro');
  const [tamparValores, setTamparValores] = useState<boolean>(false);
  const [telaAtiva, setTelaAtiva] = useState<'onboarding' | 'confirmacao' | 'dashboard' | 'ajustes' | 'extrato' | 'metas' | 'patrimonio'>('onboarding');
  const [menuAberto, setMenuAberto] = useState<boolean>(false);

  // Modal para Seleção de Percentual ao Adicionar Pote
  const [potePendente, setPotePendente] = useState<Pote | null>(null);
  const [percentualPendente, setPercentualPendente] = useState<number>(10);

  // Modal de Lançamentos
  const [modalLancamento, setModalLancamento] = useState<boolean>(false);
  const [tipoLancamento, setTipoLancamento] = useState<'saida' | 'entrada'>('saida');
  const [valorLancamento, setValorLancamento] = useState<number | ''>('');
  const [descLancamento, setDescLancamento] = useState<string>('');
  const [poteSelecionadoId, setPoteSelecionadoId] = useState<string>('supermercado');

  // Histórico de Transações
  const [transacoes, setTransacoes] = useState<Transacao[]>([
    { id: '1', descricao: 'Salário CLT', valor: 2000, tipo: 'entrada', poteId: 'geral', data: '20/09/2026' },
    { id: '2', descricao: 'Supermercado Mensal', valor: 300, tipo: 'saida', poteId: 'supermercado', data: '21/09/2026' }
  ]);

  // Lista Completa de Potes
  const todosPotesDisponiveis: Pote[] = [
    { id: 'reserva', nome: 'Reserva', percentual: 30, cor: '#10B981', iconeEmoji: '🐷' },
    { id: 'transporte', nome: 'Transporte', percentual: 10, cor: '#3B82F6', iconeEmoji: '🚗' },
    { id: 'supermercado', nome: 'Supermercado', percentual: 20, cor: '#F97316', iconeEmoji: '🧺' },
    { id: 'desfrute_marido', nome: 'Desfrute ele', percentual: 10, cor: '#8B5CF6', iconeEmoji: '🎮' },
    { id: 'desfrute_esposa', nome: 'Desfrute ela', percentual: 10, cor: '#EC4899', iconeEmoji: '🛍️' },
    { id: 'dividas', nome: 'Dívidas', percentual: 10, cor: '#EF4444', iconeEmoji: '💳' },
    { id: 'dizimo', nome: 'Dízimo', percentual: 5, cor: '#84CC16', iconeEmoji: '✉️', subtexto: 'verba pra sua igreja' },
    { id: 'investimento_ml', nome: 'Investimento ML', percentual: 5, cor: '#EAB308', iconeEmoji: '📈' },
  ];

  const [potesAtivos, setPotesAtivos] = useState<Pote[]>([
    todosPotesDisponiveis[0],
    todosPotesDisponiveis[1],
    todosPotesDisponiveis[2],
    todosPotesDisponiveis[3]
  ]);

  // Metas & Patrimônio
  const [metas, setMetas] = useState<Meta[]>([
    { id: '1', nome: 'Viagem em Família', valorAlvo: 5000, valorAtual: 1200, dataLimite: '2026-12-31' }
  ]);
  const [novaMetaNome, setNovaMetaNome] = useState('');
  const [novaMetaValor, setNovaMetaValor] = useState<number | ''>('');
  const [novaMetaDate, setNovaMetaDate] = useState('');

  const [patrimonioItems, setPatrimonioItems] = useState<ItemPatrimonio[]>([
    { id: '1', nome: 'Reserva em CDB', valor: 3500, categoria: 'Investimento' },
    { id: '2', nome: 'Estoque Mercado Livre', valor: 8000, categoria: 'Loja' }
  ]);
  const [novoPatrimonioNome, setNovoPatrimonioNome] = useState('');
  const [novoPatrimonioValor, setNovoPatrimonioValor] = useState<number | ''>('');

  // Cálculos Automáticos
  const totalMapeado = potesAtivos.reduce((acc, p) => acc + p.percentual, 0);
  const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  const saldoDisponivel = totalEntradas - totalSaidas;
  const totalPatrimonio = patrimonioItems.reduce((acc, item) => acc + item.valor, 0);

  // Iniciar solicitação de adição do pote
  const solicitarAdicaoPote = (pote: Pote) => {
    if (!potesAtivos.some(p => p.id === pote.id)) {
      setPotePendente(pote);
      setPercentualPendente(10);
    }
  };

  // Confirmar adição do pote com percentual
  const confirmarAdicionarPote = () => {
    if (potePendente) {
      setPotesAtivos([...potesAtivos, { ...potePendente, percentual: percentualPendente }]);
      setPotePendente(null);
    }
  };

  // Eventos de Drag and Drop
  const handleDragStart = (e: React.DragEvent, pote: Pote) => {
    e.dataTransfer.setData('application/json', JSON.stringify(pote));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      const pote: Pote = JSON.parse(data);
      solicitarAdicaoPote(pote);
    }
  };

  const removerPote = (id: string) => {
    setPotesAtivos(potesAtivos.filter(p => p.id !== id));
  };

  const atualizarPercentual = (id: string, novoPercentual: number) => {
    setPotesAtivos(prev => prev.map(p => p.id === id ? { ...p, percentual: novoPercentual } : p));
  };

  const excluirTransacao = (id: string) => {
    setTransacoes(transacoes.filter(t => t.id !== id));
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

  const adicionarPatrimonio = () => {
    if (!novoPatrimonioNome || !novoPatrimonioValor) return;
    setPatrimonioItems([...patrimonioItems, {
      id: Date.now().toString(),
      nome: novoPatrimonioNome,
      valor: Number(novoPatrimonioValor),
      categoria: 'Geral'
    }]);
    setNovoPatrimonioNome(''); setNovoPatrimonioValor('');
  };

  const salvarLancamento = () => {
    if (!valorLancamento || valorLancamento <= 0) return;
    const novaTransacao: Transacao = {
      id: Date.now().toString(),
      descricao: descLancamento || (tipoLancamento === 'entrada' ? 'Entrada' : 'Gasto'),
      valor: Number(valorLancamento),
      tipo: tipoLancamento,
      poteId: poteSelecionadoId,
      data: new Date().toLocaleDateString('pt-BR')
    };
    setTransacoes([novaTransacao, ...transacoes]);
    setValorLancamento(''); setDescLancamento(''); setModalLancamento(false);
  };

  const formatarGrana = (valor: number) => {
    if (tamparValores) return 'R$ •••••';
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // SVG das fatias
  let acumulado = 0;
  const fatiasSVG = potesAtivos.map(pote => {
    const inicio = acumulado;
    acumulado += pote.percentual;
    return { ...pote, inicio, fim: acumulado };
  });

  const bgClasse = tema === 'escuro' ? 'bg-[#0B0F17] text-slate-100' : 'bg-[#F1F3F6] text-slate-800';
  const cardClasse = tema === 'escuro' 
    ? 'bg-slate-900/90 border-slate-800/80 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl' 
    : 'bg-white/90 border-slate-200/80 shadow-[0_10px_25px_rgba(0,0,0,0.06)] backdrop-blur-xl';

  return (
    <div className={`min-h-screen ${bgClasse} font-sans tracking-tight flex flex-col justify-between transition-colors duration-200 pb-24`}>
      
      {/* HEADER FIXO COM ESTILO ERP */}
      <header className={`p-4 border-b flex justify-between items-center sticky top-0 z-30 ${tema === 'escuro' ? 'border-slate-800 bg-slate-950/80 backdrop-blur' : 'border-slate-200 bg-white/80 backdrop-blur'}`}>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-black text-amber-500 tracking-tight drop-shadow-sm">Potes</span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-600 font-extrabold uppercase font-mono">ERP 3D</span>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => setTamparValores(!tamparValores)} className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-500 shadow-sm transition-all">
            {tamparValores ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={() => setTema(tema === 'escuro' ? 'claro' : 'escuro')} className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-500 shadow-sm transition-all">
            {tema === 'escuro' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMenuAberto(true)} className="p-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-400/20 transition-all">
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* TELA 1: ONBOARDING / MONTANDO PLANO */}
      {telaAtiva === 'onboarding' && (
        <main className="max-w-2xl mx-auto p-4 w-full space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Montando seu plano financeiro</h1>
          </div>

          <div className={`${cardClasse} rounded-3xl p-6 space-y-4`}>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">Renda Total por Mês</span>
                <span className="text-[11px] text-slate-400">Somar todas as fontes de receita</span>
              </div>
              <div className="flex items-center text-xl font-black font-mono">
                <span className="text-sm text-slate-400 mr-1">R$</span>
                <input
                  type="number"
                  value={rendaMensal}
                  onChange={(e) => setRendaMensal(Number(e.target.value))}
                  className="w-28 text-right bg-transparent focus:outline-none border-b-2 border-amber-400 font-black font-mono"
                />
              </div>
            </div>
          </div>

          {/* Círculo Central com Drop Zone e Sombra 3D */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center space-y-6 p-6 rounded-3xl border-2 border-dashed border-amber-400/30 bg-amber-400/5 transition-all"
          >
            <div className="relative w-60 h-60 flex items-center justify-center drop-shadow-2xl">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FEF08A" strokeWidth="11" />
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
                <span className="text-4xl font-black tracking-tight font-mono">{totalMapeado}%</span>
                <span className="text-[11px] text-slate-400 font-semibold max-w-[90px]">Arraste ou escolha os potes</span>
              </div>
            </div>

            {/* Potes Ativos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
              {potesAtivos.map(pote => (
                <div 
                  key={pote.id} 
                  onClick={() => { setPotePendente(pote); setPercentualPendente(pote.percentual); }}
                  className={`${cardClasse} p-3.5 rounded-2xl flex flex-col items-center text-center cursor-pointer relative group transform hover:-translate-y-1 transition-all border border-slate-200/80`}
                >
                  <button onClick={(e) => { e.stopPropagation(); removerPote(pote.id); }} className="absolute top-1.5 right-1.5 text-slate-400 hover:text-rose-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-3xl mb-1">{pote.iconeEmoji}</span>
                  <span className="text-xs font-bold">{pote.nome}</span>
                  <span className="text-xs font-black text-amber-500 font-mono">{pote.percentual}%</span>
                </div>
              ))}
            </div>

            <button onClick={() => setTelaAtiva('confirmacao')} className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-4 rounded-2xl shadow-xl shadow-amber-400/20 transition-all text-base">
              Avançar para o Plano
            </button>
          </div>

          {/* Carrossel de Potes Disponíveis */}
          <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold text-center text-slate-400">Arraste ou clique para adicionar mais potes:</p>
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {todosPotesDisponiveis.map(pote => {
                const selecionado = potesAtivos.some(p => p.id === pote.id);
                return (
                  <button 
                    key={pote.id} 
                    draggable={!selecionado}
                    onDragStart={(e) => handleDragStart(e, pote)}
                    disabled={selecionado} 
                    onClick={() => solicitarAdicaoPote(pote)} 
                    className={`flex-shrink-0 p-3 rounded-2xl border text-center flex flex-col items-center space-y-1 w-24 transition-all ${selecionado ? 'opacity-40 border-slate-200 grayscale cursor-not-allowed' : `${cardClasse} hover:border-amber-400 cursor-grab active:cursor-grabbing`}`}
                  >
                    <span className="text-2xl">{pote.iconeEmoji}</span>
                    <span className="text-[11px] font-bold truncate w-full">{pote.nome}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* MODAL PARA ESCOLHER % DO POTE SELECIONADO */}
      {potePendente && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl relative border border-slate-200 dark:border-slate-800`}>
            <button onClick={() => setPotePendente(null)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-400/20 flex items-center justify-center text-3xl">
              {potePendente.iconeEmoji}
            </div>

            <div>
              <h3 className="text-lg font-black">{potePendente.nome}</h3>
              <p className="text-xs text-slate-400 mt-1">Quantos % da sua renda vai para este pote?</p>
            </div>

            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-8 border-amber-400 flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-inner">
                <span className="text-2xl font-black font-mono">{percentualPendente}%</span>
                <span className="text-[10px] font-bold text-amber-500 font-mono">
                  {formatarGrana((rendaMensal * percentualPendente) / 100)}
                </span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="100"
              value={percentualPendente}
              onChange={(e) => setPercentualPendente(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />

            <button
              onClick={confirmarAdicionarPote}
              className="w-full bg-amber-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" /> Confirmar Porcentagem
            </button>
          </div>
        </div>
      )}

      {/* TELA 2: CONFIRMAÇÃO DO PLANO */}
      {telaAtiva === 'confirmacao' && (
        <main className="max-w-md mx-auto p-6 text-center space-y-6 my-auto">
          <h2 className="text-2xl font-black">Seu planejamento financeiro está pronto!</h2>
          <div className="relative w-56 h-56 mx-auto flex items-center justify-center drop-shadow-2xl">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {fatiasSVG.map(pote => (
                <circle key={pote.id} cx="50" cy="50" r="40" fill="transparent" stroke={pote.cor} strokeWidth="11" strokeDasharray={`${pote.percentual * 2.51327} 251.327`} strokeDashoffset={`-${pote.inicio * 2.51327}`} />
              ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center p-4 text-xs font-semibold text-slate-500">
              Você lança o que entrou e o app organiza!
            </div>
          </div>
          <button onClick={() => setTelaAtiva('dashboard')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all">
            Start ERP Dashboard
          </button>
        </main>
      )}

      {/* TELA 3: DASHBOARD PRINCIPAL */}
      {telaAtiva === 'dashboard' && (
        <main className="max-w-4xl mx-auto p-4 w-full space-y-6">
          <div className={`${cardClasse} rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-4`}>
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider font-mono">Saldo Disponível Real</span>
              <div className="text-3xl md:text-4xl font-black text-emerald-500 mt-1 font-mono">
                {formatarGrana(saldoDisponivel)}
              </div>
              <span className="text-xs text-slate-400 font-mono">Total acumulado de entradas menos saídas</span>
            </div>

            <button onClick={() => setModalLancamento(true)} className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all">
              <Plus className="w-5 h-5" /> Novo Lançamento
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {potesAtivos.map(pote => {
              const limitePote = (rendaMensal * pote.percentual) / 100;
              const gastosPote = transacoes.filter(t => t.tipo === 'saida' && t.poteId === pote.id).reduce((acc, t) => acc + t.valor, 0);
              const restantePote = limitePote - gastosPote;

              return (
                <div key={pote.id} className={`${cardClasse} rounded-3xl p-6 flex flex-col items-center text-center space-y-4 transform hover:-translate-y-1 transition-all`}>
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <span className="text-2xl">{pote.iconeEmoji}</span>
                    <span>{pote.nome}</span>
                  </div>

                  <div className="relative w-32 h-32 flex items-center justify-center drop-shadow-md">
                    <div className="w-28 h-28 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center" style={{ borderColor: pote.cor }}>
                      <span className="text-sm font-black font-mono">{formatarGrana(restantePote)}</span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-400 font-mono">Meta/mês: {formatarGrana(limitePote)}</span>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* TELA 4: AJUSTAR LIMITES A QUALQUER MOMENTO */}
      {telaAtiva === 'ajustes' && (
        <main className="max-w-2xl mx-auto p-4 w-full space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black flex items-center gap-2"><Sliders className="w-6 h-6 text-amber-500" /> Ajustar Limites do Plano</h2>
            <button onClick={() => setTelaAtiva('dashboard')} className="text-xs font-bold text-amber-500">Salvar & Voltar</button>
          </div>

          <div className={`${cardClasse} rounded-3xl p-6 space-y-6`}>
            {potesAtivos.map(pote => {
              const valorCalculado = (rendaMensal * pote.percentual) / 100;

              return (
                <div key={pote.id} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{pote.iconeEmoji} {pote.nome}</span>
                    <span className="font-mono">{formatarGrana(valorCalculado)} ({pote.percentual}%)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={pote.percentual}
                    onChange={(e) => atualizarPercentual(pote.id, Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-800 accent-amber-400 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* TELA 5: MINHAS METAS */}
      {telaAtiva === 'metas' && (
        <main className="max-w-2xl mx-auto p-4 w-full space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-2"><Target className="w-6 h-6 text-amber-500" /> Minhas Metas</h2>

          <div className={`${cardClasse} rounded-3xl p-6 space-y-4`}>
            <h3 className="text-sm font-extrabold uppercase text-slate-400 font-mono">Criar Nova Meta</h3>
            <input type="text" placeholder="Nome da Meta" value={novaMetaNome} onChange={(e) => setNovaMetaNome(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-sm font-bold focus:outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Valor R$" value={novaMetaValor} onChange={(e) => setNovaMetaValor(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-sm font-bold font-mono focus:outline-none" />
              <input type="date" value={novaMetaDate} onChange={(e) => setNovaMetaDate(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-sm font-bold focus:outline-none" />
            </div>
            <button onClick={adicionarMeta} className="w-full bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-md">
              Adicionar Meta
            </button>
          </div>

          <div className="space-y-4">
            {metas.map(m => {
              const hoje = new Date();
              const prazo = new Date(m.dataLimite);
              const diffDias = Math.max(1, Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 3600 * 24)));
              const diffMeses = Math.max(1, diffDias / 30);
              const restante = m.valorAlvo - m.valorAtual;
              const precisoPorDia = restante / diffDias;
              const precisoPorMes = restante / diffMeses;

              return (
                <div key={m.id} className={`${cardClasse} rounded-3xl p-6 space-y-4 relative`}>
                  <h4 className="text-lg font-black">{m.nome}</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
                      <span className="text-slate-400 block font-bold">Por Dia</span>
                      <span className="text-amber-500 text-base font-black font-mono">{formatarGrana(precisoPorDia)}</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
                      <span className="text-slate-400 block font-bold">Por Mês</span>
                      <span className="text-emerald-500 text-base font-black font-mono">{formatarGrana(precisoPorMes)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* TELA 6: PATRIMÔNIO */}
      {telaAtiva === 'patrimonio' && (
        <main className="max-w-2xl mx-auto p-4 w-full space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-2"><Building2 className="w-6 h-6 text-emerald-500" /> Meu Patrimônio</h2>
          <div className={`${cardClasse} rounded-3xl p-6 text-center`}>
            <span className="text-xs font-bold text-slate-400 uppercase font-mono">Patrimônio Acumulado</span>
            <div className="text-3xl font-black text-emerald-500 mt-1 font-mono">{formatarGrana(totalPatrimonio)}</div>
          </div>
        </main>
      )}

      {/* TELA 7: EXTRATO COM BOTAO DE EXCLUIR */}
      {telaAtiva === 'extrato' && (
        <main className="max-w-2xl mx-auto p-4 w-full space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black">Extrato de Movimentações</h2>
            <span className="text-xs font-bold text-slate-400 font-mono">{transacoes.length} registros</span>
          </div>

          <div className="space-y-2">
            {transacoes.map(t => (
              <div key={t.id} className={`${cardClasse} rounded-2xl p-4 flex justify-between items-center text-sm`}>
                <div className="flex items-center space-x-3">
                  {t.tipo === 'entrada' ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-rose-500" />}
                  <div>
                    <span className="font-bold block">{t.descricao}</span>
                    <span className="text-xs text-slate-400">{t.data}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`font-black font-mono ${t.tipo === 'entrada' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.tipo === 'entrada' ? '+' : '-'} {formatarGrana(t.valor)}
                  </span>
                  <button onClick={() => excluirTransacao(t.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* BARRA INFERIOR GLOBAL */}
      <nav className={`fixed bottom-0 inset-x-0 border-t p-2 flex justify-around items-center z-40 ${tema === 'escuro' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
        <button onClick={() => setTelaAtiva('dashboard')} className="flex flex-col items-center p-2 text-xs font-bold opacity-70 hover:opacity-100">
          <Home className="w-5 h-5" /> Início
        </button>
        <button onClick={() => setTelaAtiva('extrato')} className="flex flex-col items-center p-2 text-xs font-bold opacity-70 hover:opacity-100">
          <List className="w-5 h-5" /> Extrato
        </button>
        <button onClick={() => setModalLancamento(true)} className="p-3.5 bg-amber-400 text-slate-950 rounded-full shadow-lg shadow-amber-400/30 -mt-6">
          <Plus className="w-6 h-6" />
        </button>
        <button onClick={() => setTelaAtiva('ajustes')} className="flex flex-col items-center p-2 text-xs font-bold opacity-70 hover:opacity-100">
          <Sliders className="w-5 h-5" /> Limites
        </button>
        <button onClick={() => setMenuAberto(true)} className="flex flex-col items-center p-2 text-xs font-bold opacity-70 hover:opacity-100">
          <MoreHorizontal className="w-5 h-5" /> Mais
        </button>
      </nav>

      {/* MODAL NOVO LANÇAMENTO */}
      {modalLancamento && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-6 max-w-sm w-full space-y-4 relative`}>
            <button onClick={() => setModalLancamento(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black">Novo Lançamento</h3>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button onClick={() => setTipoLancamento('saida')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tipoLancamento === 'saida' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}>
                Gasto (Saída)
              </button>
              <button onClick={() => setTipoLancamento('entrada')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tipoLancamento === 'entrada' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>
                Renda (Entrada)
              </button>
            </div>

            <input type="number" placeholder="Valor R$" value={valorLancamento} onChange={(e) => setValorLancamento(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl font-black text-lg font-mono focus:outline-none" />
            <input type="text" placeholder="Descrição" value={descLancamento} onChange={(e) => setDescLancamento(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-sm focus:outline-none" />

            {tipoLancamento === 'saida' && (
              <select value={poteSelecionadoId} onChange={(e) => setPoteSelecionadoId(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-sm focus:outline-none font-bold">
                {potesAtivos.map(p => (
                  <option key={p.id} value={p.id}>{p.iconeEmoji} {p.nome}</option>
                ))}
              </select>
            )}

            <button onClick={salvarLancamento} className="w-full bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-md">
              Registrar Lançamento
            </button>
          </div>
        </div>
      )}

      {/* MENU GAVETA LATERAL (MAIS OPÇÕES) */}
      {menuAberto && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end">
          <div className={`${cardClasse} w-80 h-full p-6 space-y-6 overflow-y-auto relative`}>
            <button onClick={() => setMenuAberto(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black">Mais Opções</h3>

            <div className="space-y-2 text-sm font-bold">
              <button onClick={() => { setTelaAtiva('extrato'); setMenuAberto(false); }} className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3">
                <List className="w-4 h-4 text-amber-500" /> Extrato Completo
              </button>
              <button onClick={() => { setTelaAtiva('ajustes'); setMenuAberto(false); }} className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3">
                <Sliders className="w-4 h-4 text-amber-500" /> Ajustar Limites
              </button>
              <button onClick={() => { setTelaAtiva('metas'); setMenuAberto(false); }} className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3">
                <Target className="w-4 h-4 text-amber-500" /> Minhas Metas
              </button>
              <button onClick={() => { setTelaAtiva('patrimonio'); setMenuAberto(false); }} className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3">
                <Building2 className="w-4 h-4 text-emerald-500" /> Meu Patrimônio
              </button>
              <button onClick={() => { setTelaAtiva('onboarding'); setMenuAberto(false); }} className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3">
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
