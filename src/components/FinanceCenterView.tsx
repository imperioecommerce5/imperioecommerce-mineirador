import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
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
  BarChart3,
  Calendar,
  DollarSign
} from 'lucide-react';

// Tipos principais
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
  const [telaAtiva, setTelaAtiva] = useState<'onboarding' | 'confirmacao' | 'dashboard' | 'ajustes' | 'extrato' | 'metas' | 'patrimonio' | 'desempenho'>('onboarding');
  const [menuAberto, setMenuAberto] = useState<boolean>(false);

  // Modal de Lançamentos
  const [modalLancamento, setModalLancamento] = useState<boolean>(false);
  const [tipoLancamento, setTipoLancamento] = useState<'saida' | 'entrada'>('saida');
  const [valorLancamento, setValorLancamento] = useState<number | ''>('');
  const [descLancamento, setDescLancamento] = useState<string>('');
  const [poteSelecionadoId, setPoteSelecionadoId] = useState<string>('supermercado');

  // Historico de Transacoes (Inicia com lista editavel/excluir)
  const [transacoes, setTransacoes] = useState<Transacao[]>([
    { id: '1', descricao: 'Salário CLT', valor: 2000, tipo: 'entrada', poteId: 'geral', data: '20/09/2026' },
    { id: '2', descricao: 'Compras do mês', valor: 300, tipo: 'saida', poteId: 'supermercado', data: '21/09/2026' }
  ]);

  // Lista Completa de Potes
  const todosPotesDisponiveis: Pote[] = [
    { id: 'reserva', nome: 'Reserva', percentual: 30, cor: '#EAB308', iconeEmoji: '🐷' },
    { id: 'transporte', nome: 'Transporte', percentual: 10, cor: '#3B82F6', iconeEmoji: '🚗' },
    { id: 'supermercado', nome: 'Supermercado', percentual: 20, cor: '#F97316', iconeEmoji: '🧺' },
    { id: 'desfrute_marido', nome: 'Desfrute ele', percentual: 10, cor: '#8B5CF6', iconeEmoji: '🎮' },
    { id: 'desfrute_esposa', nome: 'Desfrute ela', percentual: 10, cor: '#EC4899', iconeEmoji: '🛍️' },
    { id: 'dividas', nome: 'Dívidas', percentual: 10, cor: '#EF4444', iconeEmoji: '💳' },
    { id: 'dizimo', nome: 'Dízimo', percentual: 5, cor: '#10B981', iconeEmoji: '✉️', subtexto: 'verba pra sua igreja' },
    { id: 'investimento_ml', nome: 'Investimento ML', percentual: 5, cor: '#F59E0B', iconeEmoji: '📈' },
  ];

  const [potesAtivos, setPotesAtivos] = useState<Pote[]>([
    todosPotesDisponiveis[0],
    todosPotesDisponiveis[1],
    todosPotesDisponiveis[2],
    todosPotesDisponiveis[3]
  ]);

  const [poteEmEdicao, setPoteEmEdicao] = useState<Pote | null>(null);

  // Módulo Minhas Metas
  const [metas, setMetas] = useState<Meta[]>([
    { id: '1', nome: 'Viagem em Família', valorAlvo: 5000, valorAtual: 1200, dataLimite: '2026-12-31' }
  ]);
  const [novaMetaNome, setNovaMetaNome] = useState('');
  const [novaMetaValor, setNovaMetaValor] = useState<number | ''>('');
  const [novaMetaDate, setNovaMetaDate] = useState('');

  // Módulo Patrimônio
  const [patrimonioItems, setPatrimonioItems] = useState<ItemPatrimonio[]>([
    { id: '1', nome: 'Reserva em CDB', valor: 3500, categoria: 'Investimento' },
    { id: '2', nome: 'Estoque Mercado Livre', valor: 8000, categoria: 'Loja' }
  ]);
  const [novoPatrimonioNome, setNovoPatrimonioNome] = useState('');
  const [novoPatrimonioValor, setNovoPatrimonioValor] = useState<number | ''>('');

  // Cálculos do Sistema
  const totalMapeado = potesAtivos.reduce((acc, p) => acc + p.percentual, 0);
  const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  const saldoDisponivel = totalEntradas - totalSaidas;
  const totalPatrimonio = patrimonioItems.reduce((acc, item) => acc + item.valor, 0);

  // Manipulação de Potes
  const adicionarPote = (pote: Pote) => {
    if (!potesAtivos.some(p => p.id === pote.id)) {
      setPotesAtivos([...potesAtivos, { ...pote, percentual: 10 }]);
    }
  };

  const removerPote = (id: string) => {
    setPotesAtivos(potesAtivos.filter(p => p.id !== id));
  };

  const atualizarPercentual = (id: string, novoPercentual: number) => {
    setPotesAtivos(prev => prev.map(p => p.id === id ? { ...p, percentual: novoPercentual } : p));
  };

  // Excluir Movimentação
  const excluirTransacao = (id: string) => {
    setTransacoes(transacoes.filter(t => t.id !== id));
  };

  // Adicionar Meta
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

  const excluirMeta = (id: string) => {
    setMetas(metas.filter(m => m.id !== id));
  };

  // Adicionar Patrimônio
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

  const excluirPatrimonio = (id: string) => {
    setPatrimonioItems(patrimonioItems.filter(p => p.id !== id));
  };

  // Salvar Novo Lançamento
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

  // Formatador de Moeda
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

  const bgClasse = tema === 'escuro' ? 'bg-slate-950 text-slate-100' : 'bg-[#F4F5F7] text-slate-800';
  const cardClasse = tema === 'escuro' ? 'bg-slate-900 border-slate-800/80 shadow-2xl shadow-black/40' : 'bg-white border-slate-200/80 shadow-xl shadow-slate-200/50';

  return (
    <div className={`min-h-screen ${bgClasse} font-sans flex flex-col justify-between transition-colors duration-200 pb-24`}>
      
      {/* HEADER FIXO */}
      <header className={`p-4 border-b flex justify-between items-center sticky top-0 z-30 ${tema === 'escuro' ? 'border-slate-800 bg-slate-950/90 backdrop-blur' : 'border-slate-200 bg-white/90 backdrop-blur'}`}>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-black text-amber-500 tracking-tight drop-shadow">Potes</span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-600 font-extrabold uppercase">Family 3D</span>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => setTamparValores(!tamparValores)} className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-500 shadow-sm">
            {tamparValores ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={() => setTema(tema === 'escuro' ? 'claro' : 'escuro')} className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-500 shadow-sm">
            {tema === 'escuro' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMenuAberto(true)} className="p-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-400/20">
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* TELA 1: ONBOARDING / MONTANDO PLANO */}
      {telaAtiva === 'onboarding' && (
        <main className="max-w-2xl mx-auto p-4 w-full space-y-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Montando seu plano financeiro</h1>

          <div className={`${cardClasse} rounded-3xl p-6 space-y-4`}>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sua renda por mês</span>
                <span className="text-[11px] text-slate-400">Somar todas as fontes de receita.</span>
              </div>
              <div className="flex items-center text-xl font-black">
                <span className="text-sm text-slate-400 mr-1">R$</span>
                <input
                  type="number"
                  value={rendaMensal}
                  onChange={(e) => setRendaMensal(Number(e.target.value))}
                  className="w-28 text-right bg-transparent focus:outline-none border-b-2 border-amber-400 font-black"
                />
              </div>
            </div>
          </div>

          {/* Círculo Central com Sombra 3D */}
          <div className="flex flex-col items-center justify-center space-y-6">
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
                <span className="text-4xl font-black tracking-tight">{totalMapeado}%</span>
                <span className="text-[11px] text-slate-400 font-semibold max-w-[90px]">renda mapeada</span>
              </div>
            </div>

            {/* Potes Escolhidos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
              {potesAtivos.map(pote => (
                <div key={pote.id} onClick={() => setPoteEmEdicao(pote)} className={`${cardClasse} p-3.5 rounded-2xl flex flex-col items-center text-center cursor-pointer relative group transform hover:-translate-y-1 transition-all`}>
                  <button onClick={(e) => { e.stopPropagation(); removerPote(pote.id); }} className="absolute top-1.5 right-1.5 text-slate-400 hover:text-rose-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-3xl mb-1">{pote.iconeEmoji}</span>
                  <span className="text-xs font-bold">{pote.nome}</span>
                  <span className="text-xs font-black text-amber-500">{pote.percentual}%</span>
                </div>
              ))}
            </div>

            <button onClick={() => setTelaAtiva('confirmacao')} className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-4 rounded-2xl shadow-xl shadow-amber-400/20 transition-all text-base">
              Avançar para o Plano
            </button>
          </div>

          {/* Carrossel de Potes Disponíveis */}
          <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold text-center text-slate-400">Clique para adicionar mais potes ao plano:</p>
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {todosPotesDisponiveis.map(pote => {
                const selecionado = potesAtivos.some(p => p.id === pote.id);
                return (
                  <button key={pote.id} disabled={selecionado} onClick={() => adicionarPote(pote)} className={`flex-shrink-0 p-3 rounded-2xl border text-center flex flex-col items-center space-y-1 w-24 transition-all ${selecionado ? 'opacity-40 border-slate-200 grayscale cursor-not-allowed' : `${cardClasse} hover:border-amber-400 cursor-pointer`}`}>
                    <span className="text-2xl">{pote.iconeEmoji}</span>
                    <span className="text-[11px] font-bold truncate w-full">{pote.nome}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* TELA 2: CONFIRMAÇÃO */}
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
            Começar Agora
          </button>
        </main>
      )}

      {/* TELA 3: DASHBOARD PRINCIPAL */}
      {telaAtiva === 'dashboard' && (
        <main className="max-w-4xl mx-auto p-4 w-full space-y-6">
          <div className={`${cardClasse} rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-4`}>
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Saldo Disponível Real</span>
              <div className="text-3xl md:text-4xl font-black text-emerald-500 mt-1">
                {formatarGrana(saldoDisponivel)}
              </div>
              <span className="text-xs text-slate-400">Total acumulado de entradas menos saídas</span>
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
                      <span className="text-sm font-black">{formatarGrana(restantePote)}</span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-400">Meta/mês: {formatarGrana(limitePote)}</span>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* TELA 4: MINHAS METAS */}
      {telaAtiva === 'metas' && (
        <main className="max-w-2xl mx-auto p-4 w-full space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black flex items-center gap-2"><Target className="w-6 h-6 text-amber-500" /> Minhas Metas</h2>
          </div>

          {/* Form Nova Meta */}
          <div className={`${cardClasse} rounded-3xl p-6 space-y-4`}>
            <h3 className="text-sm font-extrabold uppercase text-slate-400">Criar Nova Meta</h3>
            <input type="text" placeholder="Nome da Meta (ex: Carro Novo)" value={novaMetaNome} onChange={(e) => setNovaMetaNome(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-sm font-bold focus:outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Valor Alvo R$" value={novaMetaValor} onChange={(e) => setNovaMetaValor(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-sm font-bold focus:outline-none" />
              <input type="date" value={novaMetaDate} onChange={(e) => setNovaMetaDate(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-sm font-bold focus:outline-none" />
            </div>
            <button onClick={adicionarMeta} className="w-full bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-md">
              Adicionar Meta
            </button>
          </div>

          {/* Lista de Metas com Cálculos */}
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
                  <button onClick={() => excluirMeta(m.id)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500">
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <h4 className="text-lg font-black">{m.nome}</h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
                      <span className="text-slate-400 block font-bold">Guarde por Dia</span>
                      <span className="text-amber-500 text-base font-black">{formatarGrana(precisoPorDia)}/dia</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
                      <span className="text-slate-400 block font-bold">Guarde por Mês</span>
                      <span className="text-emerald-500 text-base font-black">{formatarGrana(precisoPorMes)}/mês</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 font-bold flex justify-between">
                    <span>Faltam {diffDias} dias para a data limite ({m.dataLimite})</span>
                    <span>{formatarGrana(m.valorAlvo)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* TELA 5: PATRIMÔNIO */}
      {telaAtiva === 'patrimonio' && (
        <main className="max-w-2xl mx-auto p-4 w-full space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-2"><Building2 className="w-6 h-6 text-emerald-500" /> Meu Patrimônio</h2>

          <div className={`${cardClasse} rounded-3xl p-6 text-center`}>
            <span className="text-xs font-bold text-slate-400 uppercase">Patrimônio Acumulado</span>
            <div className="text-3xl font-black text-emerald-500 mt-1">{formatarGrana(totalPatrimonio)}</div>
          </div>

          <div className={`${cardClasse} rounded-3xl p-6 space-y-3`}>
            <h3 className="text-sm font-extrabold uppercase text-slate-400">Adicionar Ativo/Bem</h3>
            <div className="flex gap-2">
              <input type="text" placeholder="Ex: Casa, Ações" value={novoPatrimonioNome} onChange={(e) => setNovoPatrimonioNome(e.target.value)} className="flex-1 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-sm font-bold focus:outline-none" />
              <input type="number" placeholder="R$" value={novoPatrimonioValor} onChange={(e) => setNovoPatrimonioValor(e.target.value === '' ? '' : Number(e.target.value))} className="w-28 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-sm font-bold focus:outline-none" />
              <button onClick={adicionarPatrimonio} className="bg-emerald-500 text-white px-4 rounded-xl font-black">+</button>
            </div>
          </div>

          <div className="space-y-2">
            {patrimonioItems.map(p => (
              <div key={p.id} className={`${cardClasse} p-4 rounded-2xl flex justify-between items-center`}>
                <span className="font-bold">{p.nome}</span>
                <div className="flex items-center space-x-3">
                  <span className="font-black text-emerald-500">{formatarGrana(p.valor)}</span>
                  <button onClick={() => excluirPatrimonio(p.id)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* TELA 6: EXTRATO (COM BOTAO EXCLUIR) */}
      {telaAtiva === 'extrato' && (
        <main className="max-w-2xl mx-auto p-4 w-full space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black">Extrato de Entradas e Saídas</h2>
            <span className="text-xs font-bold text-slate-400">{transacoes.length} lançamentos</span>
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
                  <span className={`font-black ${t.tipo === 'entrada' ? 'text-emerald-500' : 'text-rose-500'}`}>
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
        <button onClick={() => setTelaAtiva('metas')} className="flex flex-col items-center p-2 text-xs font-bold opacity-70 hover:opacity-100">
          <Target className="w-5 h-5" /> Metas
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

            <input type="number" placeholder="Valor R$" value={valorLancamento} onChange={(e) => setValorLancamento(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl font-black text-lg focus:outline-none" />
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
          <div className={`${cardClasse} w-80 h-full p-6 space-y-6 overflow-y-auto relative animate-slideLeft`}>
            <button onClick={() => setMenuAberto(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black">Mais Opções</h3>

            <div className="space-y-2 text-sm font-bold">
              <button onClick={() => { setTelaAtiva('extrato'); setMenuAberto(false); }} className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3">
                <List className="w-4 h-4 text-amber-500" /> Extrato Completo
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
