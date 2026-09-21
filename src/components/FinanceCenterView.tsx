import React, { useState, useEffect } from 'react';
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
  Check,
  CreditCard,
  ShieldAlert,
  ArrowRight,
  Vault,
  Sparkles,
  BrainCircuit,
  LayoutGrid,
  Columns2,
  LogOut,
  FileText
} from 'lucide-react';

interface ContaFixa {
  id: string;
  nome: string;
  valor: number;
  mesesTotales: number;
  mesesRestantes: number;
}

interface Pote {
  id: string;
  nome: string;
  percentual: number;
  cor: string;
  iconeEmoji: string;
  retencaoAutomatica?: boolean;
  contasFixas?: ContaFixa[];
}

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'entrada' | 'saida';
  origemEntrada?: 'CLT' | 'Mercado Livre';
  poteId: string;
  poteNome?: string;
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
  tipo: 'automatico' | 'manual';
}

interface Props {
  emailUsuario?: string;
  onLogout?: () => void;
}

export const FinanceCenterView: React.FC<Props> = ({ emailUsuario, onLogout }) => {
  const [telaAtiva, setTelaAtiva] = useState<'onboarding' | 'confirmacao' | 'dashboard' | 'ajustes' | 'extrato' | 'metas' | 'patrimonio' | 'perfil'>('onboarding');

  const [rendaMensal, setRendaMensal] = useState<number>(() => {
    const salvo = localStorage.getItem('@meu_imperio_renda');
    return salvo ? Number(salvo) : 0;
  });
  const [tema, setTema] = useState<'claro' | 'escuro'>('escuro');
  const [tamparValores, setTamparValores] = useState<boolean>(false);
  const [menuAberto, setMenuAberto] = useState<boolean>(false);
  const [modoVisualizacaoPotes, setModoVisualizacaoPotes] = useState<'grid' | 'coluna'>('coluna');

  const todosPotesDisponiveis: Pote[] = [
    { id: 'nosso_patrimonio', nome: 'Nosso Patrimônio', percentual: 0, cor: '#10B981', iconeEmoji: '🐷', retencaoAutomatica: true },
    { id: 'patrimonio_manuela', nome: 'Patrimônio Manuela', percentual: 0, cor: '#06B6D4', iconeEmoji: '👶', retencaoAutomatica: true },
    { id: 'supermercado', nome: 'Supermercado', percentual: 0, cor: '#F97316', iconeEmoji: '🧺' },
    { id: 'transporte', nome: 'Transporte', percentual: 0, cor: '#3B82F6', iconeEmoji: '🚗' },
    { id: 'desfrute_ele', nome: 'Desfrute ele', percentual: 0, cor: '#8B5CF6', iconeEmoji: '🎮' },
    { id: 'desfrute_ela', nome: 'Desfrute ela', percentual: 0, cor: '#EC4899', iconeEmoji: '🛍️' },
    { id: 'dividas_contas', nome: 'Dívidas & Contas Fixas', percentual: 0, cor: '#EF4444', iconeEmoji: '💳', retencaoAutomatica: true, contasFixas: [] },
    { id: 'dizimo', nome: 'Dízimo', percentual: 0, cor: '#84CC16', iconeEmoji: '✉️', retencaoAutomatica: true },
  ];

  const [potesAtivos, setPotesAtivos] = useState<Pote[]>(() => {
    const salvo = localStorage.getItem('@meu_imperio_potes');
    return salvo ? JSON.parse(salvo) : [];
  });

  const [transacoes, setTransacoes] = useState<Transacao[]>(() => {
    const salvo = localStorage.getItem('@meu_imperio_transacoes');
    return salvo ? JSON.parse(salvo) : [];
  });

  const [itensPatrimonioManuais, setItensPatrimonioManuais] = useState<ItemPatrimonio[]>(() => {
    const salvo = localStorage.getItem('@meu_imperio_patrimonio');
    return salvo ? JSON.parse(salvo) : [];
  });

  useEffect(() => {
    localStorage.setItem('@meu_imperio_renda', rendaMensal.toString());
    localStorage.setItem('@meu_imperio_potes', JSON.stringify(potesAtivos));
    localStorage.setItem('@meu_imperio_transacoes', JSON.stringify(transacoes));
    localStorage.setItem('@meu_imperio_patrimonio', JSON.stringify(itensPatrimonioManuais));
  }, [rendaMensal, potesAtivos, transacoes, itensPatrimonioManuais]);

  const [potePendente, setPotePendente] = useState<Pote | null>(null);
  const [percentualPendente, setPercentualPendente] = useState<number>(10);
  const [contasFixasTemp, setContasFixasTemp] = useState<ContaFixa[]>([]);
  const [novaContaNome, setNovaContaNome] = useState('');
  const [novaContaValor, setNovaContaValor] = useState<number | ''>('');
  const [novaContaMeses, setNovaContaMeses] = useState<number | ''>('');

  const [modalEntradaInicial, setModalEntradaInicial] = useState<boolean>(false);
  const [valorEntradaInicial, setValorEntradaInicial] = useState<number | ''>('');
  const [origemEntradaInicial, setOrigemEntradaInicial] = useState<'CLT' | 'Mercado Livre'>('Mercado Livre');

  const [modalLancamento, setModalLancamento] = useState<boolean>(false);
  const [tipoLancamento, setTipoLancamento] = useState<'saida' | 'entrada'>('saida');
  const [valorLancamento, setValorLancamento] = useState<number | ''>('');
  const [origemEntradaModal, setOrigemEntradaModal] = useState<'CLT' | 'Mercado Livre'>('Mercado Livre');
  const [categoriaSaidaSelecionada, setCategoriaSaidaSelecionada] = useState<string>('Supermercado / Compras');
  const [poteSelecionadoId, setPoteSelecionadoId] = useState<string>('supermercado');

  const [filtroExtrato, setFiltroExtrato] = useState<'todos' | 'entradas' | 'saidas'>('todos');
  const [modalNovoPatrimonio, setModalNovoPatrimonio] = useState<boolean>(false);
  const [nomeNovoPatrimonio, setNomeNovoPatrimonio] = useState('');
  const [valorNovoPatrimonio, setValorNovoPatrimonio] = useState<number | ''>('');

  const [animacaoEntrada, setAnimacaoEntrada] = useState<{
    ativo: boolean;
    valorTotal: number;
    detalhes: { nome: string; icone: string; valor: number; percentual: number; cor: string }[];
  } | null>(null);

  const [alertaEstouro, setAlertaEstouro] = useState<{
    poteNome: string;
    valorEstourado: number;
    poteCompensadorId: string;
  } | null>(null);

  const navegarPara = (tela: typeof telaAtiva) => {
    setTelaAtiva(tela);
    setMenuAberto(false);
  };

  const totalMapeado = potesAtivos.reduce((acc, p) => acc + p.percentual, 0);
  const disponivelGeral = Math.max(0, 100 - totalMapeado);

  const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  
  const saldoCaixaBruto = totalEntradas - totalSaidas;

  const poteDividasObj = potesAtivos.find(p => p.id === 'dividas_contas' || p.nome.toLowerCase().includes('dívida'));
  const totalContasFixasEDividas = poteDividasObj?.contasFixas?.reduce((acc, c) => acc + c.valor, 0) || 0;

  const saldoLiquidoDisponivel = Math.max(0, saldoCaixaBruto - totalContasFixasEDividas);

  const poteNossoPatrimonio = potesAtivos.find(p => p.id === 'nosso_patrimonio');
  const pctNossoPatrimonio = poteNossoPatrimonio ? poteNossoPatrimonio.percentual : 0;
  const saldoNossoPatrimonio = (totalEntradas * pctNossoPatrimonio) / 100;

  const potePatrimonioManuela = potesAtivos.find(p => p.id === 'patrimonio_manuela');
  const pctPatrimonioManuela = potePatrimonioManuela ? potePatrimonioManuela.percentual : 0;
  const saldoPatrimonioManuela = (totalEntradas * pctPatrimonioManuela) / 100;

  const totalPatrimonioManual = itensPatrimonioManuais.reduce((acc, item) => acc + item.valor, 0);
  const patrimonioTotalCalculado = saldoNossoPatrimonio + saldoPatrimonioManuela + totalPatrimonioManual;

  const adicionarContaFixaTemp = () => {
    if (!novaContaNome || !novaContaValor || Number(novaContaValor) <= 0 || !novaContaMeses || Number(novaContaMeses) <= 0) return;
    const meses = Number(novaContaMeses);
    setContasFixasTemp([...contasFixasTemp, {
      id: Date.now().toString(),
      nome: novaContaNome,
      valor: Number(novaContaValor),
      mesesTotales: meses,
      mesesRestantes: meses
    }]);
    setNovaContaNome('');
    setNovaContaValor('');
    setNovaContaMeses('');
  };

  const removerContaFixaTemp = (id: string) => {
    setContasFixasTemp(contasFixasTemp.filter(c => c.id !== id));
  };

  const solicitarAdicaoPote = (pote: Pote) => {
    if (!potesAtivos.some(p => p.id === pote.id)) {
      if (disponivelGeral <= 0) {
        alert("100% do plano já foi mapeado! Reduza a porcentagem de outro pote primeiro.");
        return;
      }
      setPotePendente(pote);
      setPercentualPendente(Math.min(10, disponivelGeral));
      setContasFixasTemp(pote.contasFixas || []);
    }
  };

  const confirmarAdicionarPote = () => {
    if (potePendente) {
      const poteAtualizado = {
        ...potePendente,
        percentual: percentualPendente,
        contasFixas: contasFixasTemp
      };
      setPotesAtivos([...potesAtivos.filter(p => p.id !== potePendente.id), poteAtualizado]);
      setPotePendente(null);
      setContasFixasTemp([]);
    }
  };

  const removerPote = (id: string) => {
    setPotesAtivos(potesAtivos.filter(p => p.id !== id));
  };

  const processarEntradaComAnimacao = (valor: number, origem: 'CLT' | 'Mercado Livre') => {
    const novaEntrada: Transacao = {
      id: Date.now().toString(),
      descricao: `Entrada (${origem})`,
      valor: valor,
      tipo: 'entrada',
      origemEntrada: origem,
      poteId: 'geral',
      poteNome: `Origem: ${origem}`,
      data: new Date().toLocaleDateString('pt-BR')
    };
    setTransacoes(prev => [novaEntrada, ...prev]);

    const detalhes = potesAtivos.map(pote => ({
      nome: pote.nome,
      icone: pote.iconeEmoji,
      valor: (valor * pote.percentual) / 100,
      percentual: pote.percentual,
      cor: pote.cor
    }));

    setAnimacaoEntrada({
      ativo: true,
      valorTotal: valor,
      detalhes
    });
  };

  const salvarLancamento = () => {
    if (!valorLancamento || Number(valorLancamento) <= 0) return;

    if (tipoLancamento === 'entrada') {
      processarEntradaComAnimacao(Number(valorLancamento), origemEntradaModal);
      setValorLancamento(''); setModalLancamento(false);
    } else {
      const valorGasto = Number(valorLancamento);
      const poteAlvo = potesAtivos.find(p => p.id === poteSelecionadoId);

      if (!poteAlvo) return;

      const valorDiluidoNoPote = (totalEntradas * poteAlvo.percentual) / 100;
      const gastosAtuaisPote = transacoes.filter(t => t.tipo === 'saida' && t.poteId === poteAlvo.id).reduce((acc, t) => acc + t.valor, 0);
      const saldoDisponivelPote = valorDiluidoNoPote - gastosAtuaisPote;

      if (valorGasto > saldoDisponivelPote && !poteAlvo.retencaoAutomatica) {
        const excesso = valorGasto - saldoDisponivelPote;
        const outroPoteCompensador = potesAtivos.find(p => p.id !== poteAlvo.id && !p.retencaoAutomatica);

        setAlertaEstouro({
          poteNome: poteAlvo.nome,
          valorEstourado: excesso,
          poteCompensadorId: outroPoteCompensador ? outroPoteCompensador.id : 'nosso_patrimonio'
        });
        return;
      }

      const novaSaida: Transacao = {
        id: Date.now().toString(),
        descricao: categoriaSaidaSelecionada,
        valor: valorGasto,
        tipo: 'saida',
        poteId: poteAlvo.id,
        poteNome: poteAlvo.nome,
        data: new Date().toLocaleDateString('pt-BR')
      };
      setTransacoes(prev => [novaSaida, ...prev]);
      setValorLancamento(''); setModalLancamento(false);
    }
  };

  const confirmarCompensacaoEstouro = () => {
    if (!alertaEstouro || !valorLancamento) return;

    const valorGasto = Number(valorLancamento);
    const poteAlvo = potesAtivos.find(p => p.id === poteSelecionadoId);

    if (poteAlvo) {
      const novaSaida: Transacao = {
        id: Date.now().toString(),
        descricao: `${categoriaSaidaSelecionada} (Excedeu ${formatarGrana(alertaEstouro.valorEstourado)})`,
        valor: valorGasto,
        tipo: 'saida',
        poteId: poteAlvo.id,
        poteNome: poteAlvo.nome,
        data: new Date().toLocaleDateString('pt-BR')
      };

      const compensacaoSaida: Transacao = {
        id: (Date.now() + 1).toString(),
        descricao: `Compensação de estouro em ${poteAlvo.nome}`,
        valor: alertaEstouro.valorEstourado,
        tipo: 'saida',
        poteId:alertaEstouro.poteCompensadorId,
        poteNome: 'Nosso Patrimônio (Compensação)',
        data: new Date().toLocaleDateString('pt-BR')
      };

      setTransacoes(prev => [novaSaida, compensacaoSaida, ...prev]);
    }

    setAlertaEstouro(null);
    setValorLancamento('');
    setModalLancamento(false);
  };

  const confirmarEntradaInicial = () => {
    if (valorEntradaInicial && Number(valorEntradaInicial) > 0) {
      processarEntradaComAnimacao(Number(valorEntradaInicial), origemEntradaInicial);
    }
    setModalEntradaInicial(false);
    navegarPara('dashboard');
  };

  const adicionarPatrimonioManual = () => {
    if (!nomeNovoPatrimonio || !valorNovoPatrimonio || Number(valorNovoPatrimonio) <= 0) return;
    setItensPatrimonioManuais([...itensPatrimonioManuais, {
      id: Date.now().toString(),
      nome: nomeNovoPatrimonio,
      valor: Number(valorNovoPatrimonio),
      tipo: 'manual'
    }]);
    setNomeNovoPatrimonio(''); setValorNovoPatrimonio(''); setModalNovoPatrimonio(false);
  };

  const formatarGrana = (valor: number) => {
    if (tamparValores) return 'R$ •••••';
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isDark = tema === 'escuro';
  const bgClasse = isDark ? 'bg-[#0B0F17] text-slate-100' : 'bg-[#F4F7F6] text-slate-900';
  const cardClasse = isDark 
    ? 'bg-[#121824] border-slate-800/80 shadow-2xl text-slate-100' 
    : 'bg-white border-slate-200/80 shadow-md text-slate-900';

  const textMuted = isDark ? 'text-slate-400' : 'text-slate-600';
  const inputBg = isDark ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-slate-100 text-slate-900 border-slate-300';

  const transacoesFiltradas = transacoes.filter(t => {
    if (filtroExtrato === 'entradas') return t.tipo === 'entrada';
    if (filtroExtrato === 'saidas') return t.tipo === 'saida';
    return true;
  });

  return (
    <div className={`min-h-screen ${bgClasse} font-sans tracking-tight flex flex-col justify-between transition-colors duration-300 pb-28 select-none`}>
      
      {/* HEADER */}
      <header className={`p-3 md:p-4 border-b flex justify-between items-center sticky top-0 z-30 transition-colors duration-300 ${isDark ? 'border-slate-800 bg-[#0B0F17]/90 backdrop-blur-md' : 'border-slate-200 bg-white/90 backdrop-blur-md'}`}>
        <div className="flex items-center space-x-2">
          <span className="text-xl md:text-2xl font-black text-emerald-500 tracking-tight">MEU IMPÉRIO</span>
          <span className="text-[9px] md:text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold uppercase">Finance</span>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => setTamparValores(!tamparValores)} className={`p-2 md:p-2.5 rounded-2xl border ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'} hover:text-emerald-500 transition-all`}>
            {tamparValores ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={() => setTema(isDark ? 'claro' : 'escuro')} className={`p-2 md:p-2.5 rounded-2xl border ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'} hover:text-emerald-500 transition-all`}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMenuAberto(!menuAberto)} className="p-2 md:p-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black shadow-md shadow-emerald-500/20 transition-all">
            <Menu className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      {/* TELA 1: ONBOARDING */}
      {telaAtiva === 'onboarding' && (
        <main className="max-w-4xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-center md:text-left">Montando seu plano financeiro</h1>

          <div className={`${cardClasse} rounded-3xl p-4 md:p-6 space-y-3`}>
            <div className="flex justify-between items-center">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider block ${textMuted}`}>Meta de Renda Mensal</span>
                <span className={`text-[10px] md:text-[11px] ${textMuted}`}>Base para o cálculo automático</span>
              </div>
              <div className="flex items-center text-lg md:text-xl font-black">
                <span className={`text-xs md:text-sm mr-1 ${textMuted}`}>R$</span>
                <input
                  type="number"
                  value={rendaMensal === 0 ? '' : rendaMensal}
                  placeholder="0"
                  onChange={(e) => setRendaMensal(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-24 md:w-32 text-right bg-transparent focus:outline-none border-b-2 border-emerald-500 font-black"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 md:p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center drop-shadow-xl shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke={isDark ? "#1E293B" : "#E2E8F0"} strokeWidth="11" />
                {(() => {
                  let acumulado = 0;
                  return potesAtivos.map(pote => {
                    const inicio = acumulado;
                    acumulado += pote.percentual;
                    const dashArray = `${pote.percentual * 2.51327} 251.327`;
                    const dashOffset = `-${inicio * 2.51327}`;
                    if (pote.percentual <= 0) return null;
                    return (
                      <circle
                        key={pote.id}
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke={pote.cor}
                        strokeWidth="11"
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                        className="transition-all duration-300 ease-out"
                      />
                    );
                  });
                })()}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl md:text-4xl font-black tracking-tight">{totalMapeado}%</span>
                <span className={`text-[10px] font-semibold max-w-[80px] ${textMuted}`}>
                  {disponivelGeral > 0 ? `${disponivelGeral}% livre` : '100% preenchido'}
                </span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 w-full">
                {potesAtivos.map(pote => (
                  <div 
                    key={pote.id} 
                    onClick={() => {
                      setPotePendente(pote);
                      setPercentualPendente(pote.percentual);
                      setContasFixasTemp(pote.contasFixas || []);
                    }}
                    className={`${cardClasse} p-3.5 rounded-2xl flex flex-col items-center text-center cursor-pointer relative group transition-all active:scale-95 hover:border-emerald-500/50`}
                  >
                    <button onClick={(e) => { e.stopPropagation(); removerPote(pote.id); }} className="absolute top-1.5 right-1.5 text-slate-400 hover:text-rose-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-2xl md:text-3xl mb-1">{pote.iconeEmoji}</span>
                    <span className="text-[11px] md:text-xs font-bold truncate w-full">{pote.nome}</span>
                    <span className="text-xs font-black text-emerald-500">{pote.percentual}%</span>
                  </div>
                ))}
              </div>

              {totalMapeado === 100 ? (
                <button onClick={() => navegarPara('confirmacao')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all text-sm md:text-base">
                  Concluir Plano Financeiro
                </button>
              ) : (
                <div className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold py-3 px-4 rounded-2xl text-center">
                  ⚠️ O plano precisa atingir exatamente 100% para prosseguir ({totalMapeado}% preenchido).
                </div>
              )}
            </div>
          </div>

          {/* LISTA DE POTES DISPONÍVEIS PARA ADICIONAR */}
          <div className="space-y-3 pt-2">
            <p className={`text-xs font-bold text-center md:text-left ${textMuted}`}>Clique abaixo para adicionar e configurar os potes:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {todosPotesDisponiveis.map(pote => {
                const selecionado = potesAtivos.some(p => p.id === pote.id);
                return (
                  <button 
                    key={pote.id} 
                    disabled={selecionado} 
                    onClick={() => solicitarAdicaoPote(pote)} 
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center space-y-1.5 transition-all ${selecionado ? 'opacity-40 border-slate-200 grayscale cursor-not-allowed bg-slate-900/40' : `${cardClasse} hover:border-emerald-500 active:scale-95 cursor-pointer`}`}
                  >
                    <span className="text-2xl">{pote.iconeEmoji}</span>
                    <span className="text-[11px] font-bold truncate w-full">{pote.nome}</span>
                    <span className="text-[10px] font-extrabold text-emerald-500">
                      {selecionado ? 'Adicionado' : '+ Adicionar'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* MODAL CONFIGURAR POTE / CONTAS FIXAS / DÍVIDAS */}
      {potePendente && (() => {
        const outrosPotesSoma = potesAtivos.filter(p => p.id !== potePendente.id).reduce((acc, p) => acc + p.percentual, 0);
        const maxPermitido = 100 - outrosPotesSoma;
        const valorMapeadoPote = (rendaMensal * percentualPendente) / 100;
        const eDividasOuContas = potePendente.id === 'dividas_contas' || potePendente.nome.toLowerCase().includes('dívida');

        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className={`${cardClasse} rounded-3xl p-5 md:p-6 max-w-lg w-full text-center space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto`}>
              <button onClick={() => setPotePendente(null)} className="absolute top-4 right-4 text-slate-400">
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl">
                {potePendente.iconeEmoji}
              </div>

              <div>
                <h3 className="text-base md:text-lg font-black">{potePendente.nome}</h3>
              </div>

              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className={`w-24 h-24 rounded-full border-8 border-emerald-500 flex flex-col items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-100'} shadow-inner`}>
                  <span className="text-xl font-black">{percentualPendente}%</span>
                  <span className="text-[9px] font-bold text-emerald-500">{formatarGrana(valorMapeadoPote)}/mês</span>
                </div>
              </div>

              {!eDividasOuContas && (
                <input
                  type="range"
                  min="1"
                  max={maxPermitido}
                  value={percentualPendente}
                  onChange={(e) => setPercentualPendente(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              )}

              {eDividasOuContas && (
                <div className="space-y-3 pt-2 text-left border-t border-slate-800">
                  <span className="text-xs font-bold text-emerald-500 block">Adicionar Contas Fixas & Dívidas (Com Duração):</span>
                  
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Nome (Ex: Luz, Água, Aluguel, Empréstimo)"
                      value={novaContaNome}
                      onChange={(e) => setNovaContaNome(e.target.value)}
                      className={`w-full ${inputBg} p-2.5 rounded-xl text-xs font-bold border`}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Valor Mensal R$"
                        value={novaContaValor}
                        onChange={(e) => setNovaContaValor(e.target.value === '' ? '' : Number(e.target.value))}
                        className={`w-full ${inputBg} p-2.5 rounded-xl text-xs font-bold border font-mono`}
                      />
                      <input
                        type="number"
                        placeholder="Duração (Meses)"
                        value={novaContaMeses}
                        onChange={(e) => setNovaContaMeses(e.target.value === '' ? '' : Number(e.target.value))}
                        className={`w-full ${inputBg} p-2.5 rounded-xl text-xs font-bold border font-mono`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={adicionarContaFixaTemp}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar na Lista
                    </button>
                  </div>

                  {contasFixasTemp.length > 0 && (
                    <div className="space-y-1.5 pt-2 max-h-36 overflow-y-auto">
                      {contasFixasTemp.map(c => (
                        <div key={c.id} className={`${inputBg} p-2.5 rounded-xl flex justify-between items-center text-xs border`}>
                          <div>
                            <span className="font-bold block">{c.nome}</span>
                            <span className="text-[10px] text-slate-400">{formatarGrana(c.valor)}/mês • {c.mesesTotales} meses</span>
                          </div>
                          <button onClick={() => removerContaFixaTemp(c.id)} className="text-rose-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={confirmarAdicionarPote}
                className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm"
              >
                <Check className="w-4 h-4" /> Confirmar e Salvar
              </button>
            </div>
          </div>
        );
      })()}

      {/* TELA 2: CONFIRMAÇÃO */}
      {telaAtiva === 'confirmacao' && (
        <main className="max-w-md mx-auto p-4 text-center space-y-5 my-auto">
          <h2 className="text-xl md:text-2xl font-black">Seu plano está pronto!</h2>
          <div className="space-y-2.5 pt-2">
            <button 
              onClick={() => setModalEntradaInicial(true)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all text-sm"
            >
              Registrar Entrada Inicial
            </button>
            <button 
              onClick={() => navegarPara('dashboard')}
              className={`w-full ${inputBg} font-bold py-3 rounded-2xl transition-all text-sm border`}
            >
              Ir para o Painel
            </button>
          </div>
        </main>
      )}

      {/* MODAL ENTRADA INICIAL */}
      {modalEntradaInicial && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 md:p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative`}>
            <button onClick={() => setModalEntradaInicial(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base md:text-lg font-black">Qual valor entrou hoje?</h3>
            <div className={`flex ${inputBg} p-1 rounded-xl border`}>
              <button onClick={() => setOrigemEntradaInicial('Mercado Livre')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${origemEntradaInicial === 'Mercado Livre' ? 'bg-emerald-500 text-white' : textMuted}`}>
                Mercado Livre
              </button>
              <button onClick={() => setOrigemEntradaInicial('CLT')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${origemEntradaInicial === 'CLT' ? 'bg-emerald-500 text-white' : textMuted}`}>
                CLT
              </button>
            </div>

            <input
              type="number"
              placeholder="Valor R$"
              value={valorEntradaInicial}
              onChange={(e) => setValorEntradaInicial(e.target.value === '' ? '' : Number(e.target.value))}
              className={`w-full ${inputBg} p-3 rounded-2xl text-center font-black text-lg focus:outline-none font-mono border`}
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

      {/* ANIMAÇÃO VISUAL DE ENTRADA */}
      {animacaoEntrada && animacaoEntrada.ativo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-6 max-w-md w-full text-center space-y-5 shadow-2xl relative border-2 border-emerald-500/40 animate-fade-in max-h-[90vh] overflow-y-auto`}>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold text-emerald-500 tracking-wider">Entrada Distribuída Automaticamente!</span>
              <h3 className="text-2xl font-black font-mono mt-1">{formatarGrana(animacaoEntrada.valorTotal)}</h3>
            </div>
            <div className="space-y-2 text-left">
              {animacaoEntrada.detalhes.map((item, idx) => (
                <div key={idx} className={`${inputBg} p-3 rounded-2xl border space-y-1`}>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>{item.icone} {item.nome} ({item.percentual}%)</span>
                    <span className="font-mono text-emerald-500">{formatarGrana(item.valor)}</span>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setAnimacaoEntrada(null)}
              className="w-full bg-emerald-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 text-sm"
            >
              Ver Meu Painel
            </button>
          </div>
        </div>
      )}

      {/* TELA 3: DASHBOARD PRINCIPAL */}
      {telaAtiva === 'dashboard' && (
        <main className="max-w-5xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${cardClasse} rounded-3xl p-5 md:p-6 flex flex-col justify-between space-y-2`}>
              <div>
                <span className={`text-[11px] uppercase font-bold tracking-wider ${textMuted}`}>SALDO BRUTO EM CAIXA</span>
                <div className="text-3xl md:text-4xl font-black text-emerald-500 mt-1 font-mono">
                  {formatarGrana(saldoCaixaBruto)}
                </div>
              </div>
              <span className={`text-[11px] font-semibold ${textMuted}`}>Total de entradas diluídas menos gastos efetuados</span>
            </div>

            <div className={`${cardClasse} rounded-3xl p-5 md:p-6 border-l-4 border-l-rose-500 flex flex-col justify-between space-y-2`}>
              <div>
                <span className={`text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5 ${textMuted}`}>
                  <CreditCard className="w-4 h-4 text-rose-500" /> SALDO LÍQUIDO LIVRE EM CONTA
                </span>
                <div className={`text-3xl md:text-4xl font-black mt-1 font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {formatarGrana(saldoLiquidoDisponivel)}
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                <span className="text-rose-500">Descontado {formatarGrana(totalContasFixasEDividas)}</span> em contas fixas & dívidas
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`${cardClasse} rounded-3xl p-4 flex items-center justify-between border-l-4 border-l-emerald-500`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🐷</span>
                <div>
                  <span className={`text-[10px] uppercase font-extrabold ${textMuted}`}>Patrimônio Integrado</span>
                  <span className="font-black text-sm block">Nosso Patrimônio</span>
                </div>
              </div>
              <span className="font-mono font-black text-emerald-500 text-base">{formatarGrana(saldoNossoPatrimonio)}</span>
            </div>

            <div className={`${cardClasse} rounded-3xl p-4 flex items-center justify-between border-l-4 border-l-cyan-500`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👶</span>
                <div>
                  <span className={`text-[10px] uppercase font-extrabold ${textMuted}`}>Patrimônio Integrado</span>
                  <span className="font-black text-sm block">Manuela</span>
                </div>
              </div>
              <span className="font-mono font-black text-cyan-500 text-base">{formatarGrana(saldoPatrimonioManuela)}</span>
            </div>
          </div>

          {/* BARRA DE AÇÃO E BOTÃO DE ALTERNÂNCIA DE VISUALIZAÇÃO */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black">Como você pode gastar:</h3>
              <div className={`flex ${inputBg} p-1 rounded-xl border`}>
                <button onClick={() => setModoVisualizacaoPotes('coluna')} className={`p-1.5 rounded-lg ${modoVisualizacaoPotes === 'coluna' ? 'bg-emerald-500 text-white' : textMuted}`} title="Modo Coluna Única">
                  <Columns2 className="w-4 h-4" />
                </button>
                <button onClick={() => setModoVisualizacaoPotes('grid')} className={`p-1.5 rounded-lg ${modoVisualizacaoPotes === 'grid' ? 'bg-emerald-500 text-white' : textMuted}`} title="Modo Grid / Colunas">
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button onClick={() => setModalLancamento(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-xs md:text-sm">
              <Plus className="w-4 h-4" /> + Entrada / Gasto
            </button>
          </div>

          {/* GRID OU COLUNA DOS POTES COM GRÁFICOS VISÍVEIS */}
          <div className={modoVisualizacaoPotes === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" : "space-y-4 max-w-2xl mx-auto"}>
            {potesAtivos.map(pote => {
              const valorDiluidoNoPote = (totalEntradas * pote.percentual) / 100;
              const gastosPote = transacoes.filter(t => t.tipo === 'saida' && t.poteId === pote.id).reduce((acc, t) => acc + t.valor, 0);
              const saldoRealPote = pote.retencaoAutomatica ? valorDiluidoNoPote : Math.max(0, valorDiluidoNoPote - gastosPote);

              const percentualProgresso = valorDiluidoNoPote > 0 ? Math.max(0, Math.min(100, (saldoRealPote / valorDiluidoNoPote) * 100)) : 100;
              const dashOffset = 251.327 - (percentualProgresso * 2.51327);

              return (
                <div key={pote.id} className={`${cardClasse} rounded-3xl p-5 md:p-6 flex flex-col items-center text-center space-y-4 relative overflow-hidden`}>
                  {pote.retencaoAutomatica && (
                    <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                      Retenção Automática
                    </span>
                  )}

                  <div className="flex items-center space-x-2 font-black text-sm md:text-base">
                    <span className="text-2xl">{pote.iconeEmoji}</span>
                    <span>{pote.nome}</span>
                  </div>

                  <div className="relative w-32 h-32 md:w-36 md:h-36 flex items-center justify-center drop-shadow-md">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 absolute inset-0">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke={isDark ? "#1E293B" : "#E2E8F0"} strokeWidth="10" />
                      <circle 
                        cx="50" cy="50" r="40" 
                        fill="transparent" 
                        stroke={saldoRealPote < 0 ? '#EF4444' : pote.cor} 
                        strokeWidth="10"
                        strokeDasharray="251.327"
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>

                    <div className="flex flex-col items-center justify-center z-10">
                      <span className={`text-sm md:text-base font-black font-mono ${saldoRealPote < 0 ? 'text-rose-500' : ''}`}>
                        {formatarGrana(saldoRealPote)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5 w-full">
                    <span className={`text-xs font-bold block ${textMuted}`}>
                      Alocado ({pote.percentual}%): {formatarGrana(valorDiluidoNoPote)}
                    </span>
                    {pote.contasFixas && pote.contasFixas.length > 0 && (
                      <div className="pt-2 text-left space-y-1 border-t border-slate-800/60 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 block">Contas Fixas & Dívidas:</span>
                        {pote.contasFixas.map(cf => (
                          <div key={cf.id} className="flex justify-between text-[11px] font-semibold">
                            <span className="truncate pr-2">{cf.nome}</span>
                            <span className="font-mono text-rose-400">{formatarGrana(cf.valor)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* TELA DE PATRIMÔNIO */}
      {telaAtiva === 'patrimonio' && (
        <main className="max-w-2xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
              <Vault className="w-6 h-6 text-emerald-500" /> Patrimônio da Família (Integrado)
            </h2>
            <button onClick={() => setModalNovoPatrimonio(true)} className="bg-emerald-500 text-white px-3.5 py-2 rounded-2xl text-xs font-bold">
              + Adicionar Manual
            </button>
          </div>

          <div className={`${cardClasse} rounded-3xl p-5 md:p-6 text-center space-y-2 border-2 border-emerald-500/30`}>
            <span className={`text-xs uppercase font-bold font-mono tracking-wider ${textMuted}`}>Patrimônio Total Consolidado</span>
            <div className="text-3xl md:text-4xl font-black text-emerald-500 font-mono">
              {formatarGrana(patrimonioTotalCalculado)}
            </div>
          </div>

          <div className="space-y-3">
            <div className={`${cardClasse} rounded-2xl p-4 flex justify-between items-center border-l-4 border-l-emerald-500`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🐷</span>
                <div>
                  <span className="font-bold block text-sm">Nosso Patrimônio (Automático)</span>
                  <span className={`text-[10px] ${textMuted}`}>{pctNossoPatrimonio}% de todas as entradas</span>
                </div>
              </div>
              <span className="font-mono font-black text-emerald-500 text-sm md:text-base">{formatarGrana(saldoNossoPatrimonio)}</span>
            </div>

            <div className={`${cardClasse} rounded-2xl p-4 flex justify-between items-center border-l-4 border-l-cyan-500`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👶</span>
                <div>
                  <span className="font-bold block text-sm">Patrimônio Manuela (Automático)</span>
                  <span className={`text-[10px] ${textMuted}`}>{pctPatrimonioManuela}% de todas as entradas</span>
                </div>
              </div>
              <span className="font-mono font-black text-cyan-500 text-sm md:text-base">{formatarGrana(saldoPatrimonioManuela)}</span>
            </div>
          </div>
        </main>
      )}

      {/* TELA DE EXTRATO */}
      {telaAtiva === 'extrato' && (
        <main className="max-w-xl mx-auto p-3 md:p-6 w-full space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black">Extrato</h2>
            <div className={`flex ${inputBg} p-1 rounded-xl border text-xs`}>
              <button onClick={() => setFiltroExtrato('todos')} className={`px-3 py-1.5 font-bold rounded-lg ${filtroExtrato === 'todos' ? 'bg-emerald-500 text-white' : textMuted}`}>Todos</button>
              <button onClick={() => setFiltroExtrato('entradas')} className={`px-3 py-1.5 font-bold rounded-lg ${filtroExtrato === 'entradas' ? 'bg-emerald-500 text-white' : textMuted}`}>Entradas</button>
              <button onClick={() => setFiltroExtrato('saidas')} className={`px-3 py-1.5 font-bold rounded-lg ${filtroExtrato === 'saidas' ? 'bg-emerald-500 text-white' : textMuted}`}>Saídas</button>
            </div>
          </div>

          <div className="space-y-2">
            {transacoesFiltradas.length === 0 ? (
              <p className={`text-center text-xs py-8 ${textMuted}`}>Nenhuma transação encontrada neste filtro.</p>
            ) : (
              transacoesFiltradas.map(t => (
                <div key={t.id} className={`${cardClasse} rounded-2xl p-3.5 flex justify-between items-center text-xs md:text-sm`}>
                  <div className="flex items-center space-x-2.5">
                    {t.tipo === 'entrada' ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-rose-500" />}
                    <div>
                      <span className="font-bold block">{t.descricao}</span>
                      <span className={`text-[10px] font-semibold text-emerald-500 block`}>
                        {t.tipo === 'entrada' ? `Origem: ${t.origemEntrada}` : `Saiu de: ${t.poteNome}`}
                      </span>
                      <span className={`text-[9px] ${textMuted}`}>{t.data}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <span className={`font-black font-mono ${t.tipo === 'entrada' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.tipo === 'entrada' ? '+' : '-'} {formatarGrana(t.valor)}
                    </span>
                    <button onClick={() => setTransacoes(transacoes.filter(x => x.id !== t.id))} className="text-slate-400 hover:text-rose-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      )}

      {/* MODAL ADICIONAR PATRIMÔNIO */}
      {modalNovoPatrimonio && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 max-w-sm w-full space-y-4 relative shadow-2xl`}>
            <button onClick={() => setModalNovoPatrimonio(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base md:text-lg font-black">Adicionar ao Patrimônio Manual</h3>
            <input
              type="text"
              placeholder="Nome (Ex: Imóvel, Veículo)"
              value={nomeNovoPatrimonio}
              onChange={(e) => setNomeNovoPatrimonio(e.target.value)}
              className={`w-full ${inputBg} p-3 rounded-2xl text-xs font-bold focus:outline-none border`}
            />
            <input
              type="number"
              placeholder="Valor R$"
              value={valorNovoPatrimonio}
              onChange={(e) => setValorNovoPatrimonio(e.target.value === '' ? '' : Number(e.target.value))}
              className={`w-full ${inputBg} p-3 rounded-2xl font-black text-lg focus:outline-none font-mono border`}
            />
            <button onClick={adicionarPatrimonioManual} className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg text-sm">
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* MODAL ALERTA DE ESTOURO */}
      {alertaEstouro && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 md:p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative border-2 border-amber-500/50`}>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black text-amber-500">Aviso de Limite Excedido</h3>
              <p className={`text-xs mt-1 ${textMuted}`}>
                Este gasto estourou o limite do pote <strong>{alertaEstouro.poteNome}</strong> em <strong>{formatarGrana(alertaEstouro.valorEstourado)}</strong>.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAlertaEstouro(null)} className={`flex-1 ${inputBg} font-bold py-3 rounded-2xl text-xs border`}>
                Cancelar
              </button>
              <button onClick={confirmarCompensacaoEstouro} className="flex-1 bg-amber-500 text-slate-950 font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-1">
                Compensar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARRA INFERIOR GLOBAL */}
      <nav className={`fixed bottom-0 inset-x-0 border-t p-1.5 flex justify-around items-center z-40 transition-colors duration-300 ${isDark ? 'bg-slate-950/95 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
        <button onClick={() => navegarPara('dashboard')} className="flex flex-col items-center p-1.5 text-[10px] font-bold opacity-80 hover:opacity-100">
          <Home className="w-5 h-5 text-emerald-500" /> Início
        </button>
        <button onClick={() => navegarPara('extrato')} className="flex flex-col items-center p-1.5 text-[10px] font-bold opacity-80 hover:opacity-100">
          <List className="w-5 h-5 text-emerald-500" /> Extrato
        </button>
        <button onClick={() => setModalLancamento(true)} className="p-3 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/30 -mt-5 active:scale-95 transition-transform">
          <Plus className="w-5 h-5" />
        </button>
        <button onClick={() => navegarPara('patrimonio')} className="flex flex-col items-center p-1.5 text-[10px] font-bold opacity-80 hover:opacity-100">
          <Vault className="w-5 h-5 text-emerald-500" /> Patrimônio
        </button>
        <button onClick={() => setMenuAberto(!menuAberto)} className="flex flex-col items-center p-1.5 text-[10px] font-bold opacity-80 hover:opacity-100">
          <MoreHorizontal className="w-5 h-5 text-emerald-500" /> Mais
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

            <div className={`flex ${inputBg} p-1 rounded-xl border`}>
              <button onClick={() => setTipoLancamento('saida')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tipoLancamento === 'saida' ? 'bg-rose-500 text-white' : textMuted}`}>
                Gasto (Saída)
              </button>
              <button onClick={() => setTipoLancamento('entrada')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tipoLancamento === 'entrada' ? 'bg-emerald-500 text-white' : textMuted}`}>
                Renda (Entrada)
              </button>
            </div>

            {tipoLancamento === 'entrada' ? (
              <div className="space-y-3">
                <label className={`text-xs font-bold block ${textMuted}`}>Origem da Entrada:</label>
                <div className={`flex ${inputBg} p-1 rounded-xl border`}>
                  <button onClick={() => setOrigemEntradaModal('Mercado Livre')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${origemEntradaModal === 'Mercado Livre' ? 'bg-emerald-500 text-white' : textMuted}`}>
                    Mercado Livre
                  </button>
                  <button onClick={() => setOrigemEntradaModal('CLT')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${origemEntradaModal === 'CLT' ? 'bg-emerald-500 text-white' : textMuted}`}>
                    CLT
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className={`text-xs font-bold block ${textMuted}`}>Categoria da Saída:</label>
                <select 
                  value={categoriaSaidaSelecionada} 
                  onChange={(e) => setCategoriaSaidaSelecionada(e.target.value)} 
                  className={`w-full ${inputBg} p-3 rounded-2xl text-xs md:text-sm focus:outline-none font-bold border`}
                >
                  <option value="Supermercado / Compras">🛒 Supermercado / Compras</option>
                  <option value="Combustível / Transporte">🚗 Combustível / Transporte</option>
                  <option value="Lazer Ele (Marido)">🎮 Lazer Ele (Marido)</option>
                  <option value="Lazer Ela (Esposa)">🛍️ Lazer Ela (Esposa)</option>
                  <option value="Pagamento de Dívida">💳 Pagamento de Dívida</option>
                  <option value="Outros Gastos">📦 Outros Gastos</option>
                </select>

                <label className={`text-xs font-bold block ${textMuted}`}>Retirar do Pote:</label>
                <select value={poteSelecionadoId} onChange={(e) => setPoteSelecionadoId(e.target.value)} className={`w-full ${inputBg} p-3 rounded-2xl text-xs md:text-sm focus:outline-none font-bold border`}>
                  {potesAtivos.map(p => (
                    <option key={p.id} value={p.id}>{p.iconeEmoji} {p.nome}</option>
                  ))}
                </select>
              </div>
            )}

            <input type="number" placeholder="Valor R$" value={valorLancamento} onChange={(e) => setValorLancamento(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full ${inputBg} p-3 rounded-2xl font-black text-lg focus:outline-none font-mono border`} />

            <button onClick={salvarLancamento} className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-500/20 text-sm">
              Registrar Lançamento
            </button>
          </div>
        </div>
      )}

      {/* MENU LATERAL COM BOTÃO DE SAIR */}
      {menuAberto && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex justify-end" onClick={() => setMenuAberto(false)}>
          <div className={`${cardClasse} w-72 md:w-80 h-full p-5 space-y-5 overflow-y-auto relative border-l flex flex-col justify-between`} onClick={(e) => e.stopPropagation()}>
            <div className="space-y-5">
              <button onClick={() => setMenuAberto(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-black text-emerald-500">MEU IMPÉRIO</h3>

              <div className="space-y-1.5 text-xs md:text-sm font-bold">
                <button onClick={() => navegarPara('onboarding')} className={`w-full text-left p-3 rounded-2xl ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} flex items-center gap-2.5`}>
                  <Sliders className="w-4 h-4 text-emerald-500" /> Montar / Refazer Plano
                </button>
                <button onClick={() => navegarPara('dashboard')} className={`w-full text-left p-3 rounded-2xl ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} flex items-center gap-2.5`}>
                  <Home className="w-4 h-4 text-emerald-500" /> Início / Dashboard
                </button>
                <button onClick={() => navegarPara('perfil')} className={`w-full text-left p-3 rounded-2xl ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} flex items-center gap-2.5`}>
                  <BrainCircuit className="w-4 h-4 text-emerald-500" /> Diagnóstico de Perfil
                </button>
                <button onClick={() => navegarPara('patrimonio')} className={`w-full text-left p-3 rounded-2xl ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} flex items-center gap-2.5`}>
                  <Vault className="w-4 h-4 text-emerald-500" /> Patrimônio da Família
                </button>
                <button onClick={() => navegarPara('extrato')} className={`w-full text-left p-3 rounded-2xl ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} flex items-center gap-2.5`}>
                  <List className="w-4 h-4 text-emerald-500" /> Extrato Completo
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button 
                onClick={onLogout} 
                className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold p-3 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all"
              >
                <LogOut className="w-4 h-4" /> Sair da Conta (Logout)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FinanceCenterView;
