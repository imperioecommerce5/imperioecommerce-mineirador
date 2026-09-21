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
  Check,
  Receipt,
  CreditCard,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface ContaFixa {
  id: string;
  nome: string;
  valor: number;
}

interface Pote {
  id: string;
  nome: string;
  percentual: number;
  cor: string;
  iconeEmoji: string;
  contasFixas?: ContaFixa[];
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

export const FinanceCenterView: React.FC = () => {
  // Configurações Globais
  const [rendaMensal, setRendaMensal] = useState<number>(2000);
  const [tema, setTema] = useState<'claro' | 'escuro'>('escuro');
  const [tamparValores, setTamparValores] = useState<boolean>(false);
  const [telaAtiva, setTelaAtiva] = useState<'onboarding' | 'confirmacao' | 'dashboard' | 'ajustes' | 'extrato' | 'metas'>('onboarding');
  const [menuAberto, setMenuAberto] = useState<boolean>(false);

  // Seleção e Gerenciamento de Potes
  const [potePendente, setPotePendente] = useState<Pote | null>(null);
  const [percentualPendente, setPercentualPendente] = useState<number>(10);
  const [contasFixasTemp, setContasFixasTemp] = useState<ContaFixa[]>([]);
  const [novaContaNome, setNovaContaNome] = useState('');
  const [novaContaValor, setNovaContaValor] = useState<number | ''>('');

  // Modais de Lançamento / Compensação
  const [modalEntradaInicial, setModalEntradaInicial] = useState<boolean>(false);
  const [valorEntradaInicial, setValorEntradaInicial] = useState<number | ''>('');

  const [modalLancamento, setModalLancamento] = useState<boolean>(false);
  const [tipoLancamento, setTipoLancamento] = useState<'saida' | 'entrada'>('saida');
  const [valorLancamento, setValorLancamento] = useState<number | ''>('');
  const [descLancamento, setDescLancamento] = useState<string>('');
  const [poteSelecionadoId, setPoteSelecionadoId] = useState<string>('supermercado');

  // Sistema de Alerta e Reposição
  const [alertaEstouro, setAlertaEstouro] = useState<{
    poteNome: string;
    valorEstourado: number;
    poteCompensadorId: string;
  } | null>(null);

  // Histórico de Transações
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  // Potes Iniciais Padrão
  const todosPotesDisponiveis: Pote[] = [
    { id: 'reserva', nome: 'Reserva', percentual: 30, cor: '#10B981', iconeEmoji: '🐷' },
    { id: 'transporte', nome: 'Transporte', percentual: 10, cor: '#3B82F6', iconeEmoji: '🚗' },
    { id: 'supermercado', nome: 'Supermercado', percentual: 20, cor: '#F97316', iconeEmoji: '🧺' },
    { id: 'desfrute_marido', nome: 'Desfrute ele', percentual: 10, cor: '#8B5CF6', iconeEmoji: '🎮' },
    { id: 'desfrute_esposa', nome: 'Desfrute ela', percentual: 10, cor: '#EC4899', iconeEmoji: '🛍️' },
    { id: 'dividas', nome: 'Dívidas & Contas Fixas', percentual: 15, cor: '#EF4444', iconeEmoji: '💳', contasFixas: [
      { id: '1', nome: 'Luz & Água', valor: 150 },
      { id: '2', nome: 'Cartão de Crédito', valor: 150 }
    ]},
    { id: 'dizimo', nome: 'Dízimo', percentual: 5, cor: '#84CC16', iconeEmoji: '✉️' },
    { id: 'investimento_ml', nome: 'Investimento ML', percentual: 0, cor: '#F59E0B', iconeEmoji: '📈' },
  ];

  const [potesAtivos, setPotesAtivos] = useState<Pote[]>([
    todosPotesDisponiveis[0],
    todosPotesDisponiveis[1],
    todosPotesDisponiveis[2],
    todosPotesDisponiveis[5]
  ]);

  // Metas
  const [metas, setMetas] = useState<Meta[]>([
    { id: '1', nome: 'Reserva de Emergência', valorAlvo: 5000, valorAtual: 500, dataLimite: '2026-12-31' }
  ]);
  const [novaMetaNome, setNovaMetaNome] = useState('');
  const [novaMetaValor, setNovaMetaValor] = useState<number | ''>('');
  const [novaMetaDate, setNovaMetaDate] = useState('');
  const [metaAporteId, setMetaAporteId] = useState<string | null>(null);
  const [valorAporteMeta, setValorAporteMeta] = useState<number | ''>('');

  // Lógica de Navegação
  const navegarPara = (tela: typeof telaAtiva) => {
    setTelaAtiva(tela);
    setMenuAberto(false);
  };

  // Cálculos Automáticos
  const totalMapeado = potesAtivos.reduce((acc, p) => acc + p.percentual, 0);
  const disponivelGeral = Math.max(0, 100 - totalMapeado);

  const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  const saldoCaixaBruto = totalEntradas - totalSaidas;

  // Total das Dívidas / Contas Fixas Cadastradas
  const poteDividasObj = potesAtivos.find(p => p.id === 'dividas' || p.nome.toLowerCase().includes('dívida'));
  const totalContasFixasEDividas = poteDividasObj?.contasFixas?.reduce((acc, c) => acc + c.valor, 0) || 0;

  // Saldo Líquido Disponível em Conta (Subtraindo Contas Fixas e Dívidas)
  const saldoLiquidoDisponivel = Math.max(0, saldoCaixaBruto - totalContasFixasEDividas);

  // Manipulação de Potes
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

  const adicionarContaFixaTemp = () => {
    if (!novaContaNome || !novaContaValor || Number(novaContaValor) <= 0) return;
    setContasFixasTemp([...contasFixasTemp, {
      id: Date.now().toString(),
      nome: novaContaNome,
      valor: Number(novaContaValor)
    }]);
    setNovaContaNome('');
    setNovaContaValor('');
  };

  const removerContaFixaTemp = (id: string) => {
    setContasFixasTemp(contasFixasTemp.filter(c => c.id !== id));
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

  const atualizarPercentual = (id: string, valorDesejado: number) => {
    const outrosPotesSoma = potesAtivos.filter(p => p.id !== id).reduce((acc, p) => acc + p.percentual, 0);
    const maxPermitido = 100 - outrosPotesSoma;
    const valorFinal = Math.min(valorDesejado, maxPermitido);

    setPotesAtivos(prev => prev.map(p => p.id === id ? { ...p, percentual: valorFinal } : p));
  };

  // Registros de Entrada / Saída com Sistema de Trava e Compensação
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
      setValorLancamento(''); setDescLancamento(''); setModalLancamento(false);
    } else {
      const valorGasto = Number(valorLancamento);
      const poteAlvo = potesAtivos.find(p => p.id === poteSelecionadoId);

      if (!poteAlvo) return;

      const valorDiluidoNoPote = (totalEntradas * poteAlvo.percentual) / 100;
      const gastosAtuaisPote = transacoes.filter(t => t.tipo === 'saida' && t.poteId === poteAlvo.id).reduce((acc, t) => acc + t.valor, 0);
      const saldoDisponivelPote = valorDiluidoNoPote - gastosAtuaisPote;

      // Trava de Segurança: Se estourar o pote
      if (valorGasto > saldoDisponivelPote) {
        const excesso = valorGasto - saldoDisponivelPote;
        const outroPoteCompensador = potesAtivos.find(p => p.id !== poteAlvo.id && p.id !== 'dividas');

        setAlertaEstouro({
          poteNome: poteAlvo.nome,
          valorEstourado: excesso,
          poteCompensadorId: outroPoteCompensador ? outroPoteCompensador.id : 'reserva'
        });
        return;
      }

      const novaSaida: Transacao = {
        id: Date.now().toString(),
        descricao: descLancamento || `Gasto em ${poteAlvo.nome}`,
        valor: valorGasto,
        tipo: 'saida',
        poteId: poteAlvo.id,
        data: new Date().toLocaleDateString('pt-BR')
      };
      setTransacoes(prev => [novaSaida, ...prev]);
      setValorLancamento(''); setDescLancamento(''); setModalLancamento(false);
    }
  };

  // Confirmar Compensação do Estouro em Outro Pote
  const confirmarCompensacaoEstouro = () => {
    if (!alertaEstouro || !valorLancamento) return;

    const valorGasto = Number(valorLancamento);
    const poteAlvo = potesAtivos.find(p => p.id === poteSelecionadoId);

    if (poteAlvo) {
      // Registra o gasto original
      const novaSaida: Transacao = {
        id: Date.now().toString(),
        descricao: `${descLancamento || 'Gasto Excedente'} (Excedeu ${formatarGrana(alertaEstouro.valorEstourado)})`,
        valor: valorGasto,
        tipo: 'saida',
        poteId: poteAlvo.id,
        data: new Date().toLocaleDateString('pt-BR')
      };

      // Registra a compensação do outro pote
      const compensacaoSaida: Transacao = {
        id: (Date.now() + 1).toString(),
        descricao: `Compensação automática para estouro em ${poteAlvo.nome}`,
        valor: alertaEstouro.valorEstourado,
        tipo: 'saida',
        poteId: alertaEstouro.poteCompensadorId,
        data: new Date().toLocaleDateString('pt-BR')
      };

      setTransacoes(prev => [novaSaida, compensacaoSaida, ...prev]);
    }

    setAlertaEstouro(null);
    setValorLancamento('');
    setDescLancamento('');
    setModalLancamento(false);
  };

  const confirmarEntradaInicial = () => {
    if (valorEntradaInicial && Number(valorEntradaInicial) > 0) {
      processarEntrada(Number(valorEntradaInicial), 'Renda Inicial Registrada');
    }
    setModalEntradaInicial(false);
    navegarPara('dashboard');
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

  // Círculo SVG
  let acumulado = 0;
  const fatiasSVG = potesAtivos.map(pote => {
    const inicio = acumulado;
    acumulado += pote.percentual;
    return { ...pote, inicio, fim: acumulado };
  });

  const isDark = tema === 'escuro';
  const bgClasse = isDark ? 'bg-[#0B0F17] text-slate-100' : 'bg-[#F4F7F6] text-slate-800';
  const cardClasse = isDark 
    ? 'bg-[#121824] border-slate-800/80 shadow-2xl' 
    : 'bg-white border-slate-200/80 shadow-md';

  return (
    <div className={`min-h-screen ${bgClasse} font-sans tracking-tight flex flex-col justify-between transition-colors duration-300 pb-28 select-none`}>
      
      {/* HEADER */}
      <header className={`p-3 md:p-4 border-b flex justify-between items-center sticky top-0 z-30 transition-colors duration-300 ${isDark ? 'border-slate-800 bg-[#0B0F17]/90 backdrop-blur-md' : 'border-slate-200/80 bg-white/90 backdrop-blur-md'}`}>
        <div className="flex items-center space-x-2">
          <span className="text-xl md:text-2xl font-black text-emerald-500 tracking-tight">MEU IMPÉRIO</span>
          <span className="text-[9px] md:text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold uppercase">Finance</span>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => setTamparValores(!tamparValores)} className="p-2 md:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all">
            {tamparValores ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={() => setTema(isDark ? 'claro' : 'escuro')} className="p-2 md:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMenuAberto(!menuAberto)} className="p-2 md:p-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black shadow-md shadow-emerald-500/20 transition-all">
            <Menu className="w-4 h-4 text-white" />
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

          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6 p-4 md:p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center drop-shadow-xl">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke={isDark ? "#1E293B" : "#E2E8F0"} strokeWidth="11" />
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
              {potesAtivos.map(pote => (
                <div 
                  key={pote.id} 
                  onClick={() => {
                    setPotePendente(pote);
                    setPercentualPendente(pote.percentual);
                    setContasFixasTemp(pote.contasFixas || []);
                  }}
                  className={`${cardClasse} p-3 rounded-2xl flex flex-col items-center text-center cursor-pointer relative group transition-all active:scale-95`}
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

            <button onClick={() => navegarPara('confirmacao')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 md:py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all text-sm md:text-base">
              Concluir Plano Financeiro
            </button>
          </div>

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

      {/* MODAL DE % DO POTE E CADASTRO DE CONTAS FIXAS/DÍVIDAS */}
      {potePendente && (() => {
        const outrosPotesSoma = potesAtivos.filter(p => p.id !== potePendente.id).reduce((acc, p) => acc + p.percentual, 0);
        const maxPermitido = 100 - outrosPotesSoma;
        const totalContasFixas = contasFixasTemp.reduce((a, b) => a + b.valor, 0);
        const valorMapeadoPote = (rendaMensal * percentualPendente) / 100;
        const pctContasFixas = valorMapeadoPote > 0 ? Math.min(100, (totalContasFixas / valorMapeadoPote) * 100) : 0;

        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className={`${cardClasse} rounded-3xl p-5 md:p-6 max-w-md w-full text-center space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto`}>
              <button onClick={() => setPotePendente(null)} className="absolute top-4 right-4 text-slate-400">
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl">
                {potePendente.iconeEmoji}
              </div>

              <div>
                <h3 className="text-base md:text-lg font-black">{potePendente.nome}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Defina a porcentagem e especifique os compromissos</p>
              </div>

              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-8 border-emerald-500 flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-inner">
                  <span className="text-xl font-black">{percentualPendente}%</span>
                  <span className="text-[9px] font-bold text-emerald-500">
                    {formatarGrana(valorMapeadoPote)}/mês
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

              {/* SEÇÃO DE CONTAS FIXAS & DÍVIDAS */}
              {(potePendente.id === 'dividas' || potePendente.nome.toLowerCase().includes('dívida')) && (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-3 text-left">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="flex items-center gap-1.5"><Receipt className="w-4 h-4 text-rose-500" /> Dívidas & Contas Fixas</span>
                    <span className="text-rose-500 font-mono">{pctContasFixas.toFixed(0)}% do pote ({formatarGrana(totalContasFixas)})</span>
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {contasFixasTemp.map(c => (
                      <div key={c.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-800/80 p-2 rounded-xl text-xs">
                        <span className="font-bold">{c.nome}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-rose-500">{formatarGrana(c.valor)}</span>
                          <button onClick={() => removerContaFixaTemp(c.id)} className="text-slate-400 hover:text-rose-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Nome da Conta/Dívida"
                      value={novaContaNome}
                      onChange={(e) => setNovaContaNome(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-xs flex-1 font-bold focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Valor R$"
                      value={novaContaValor}
                      onChange={(e) => setNovaContaValor(e.target.value === '' ? '' : Number(e.target.value))}
                      className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-xs w-20 font-bold focus:outline-none font-mono"
                    />
                    <button onClick={adicionarContaFixaTemp} className="bg-emerald-500 text-white px-3 py-2 rounded-xl font-bold text-xs">
                      +
                    </button>
                  </div>
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
              onClick={() => navegarPara('dashboard')}
              className="w-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-2xl transition-all text-sm"
            >
              Ainda não tenho entrada
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
            <p className="text-xs text-slate-400">Esse valor será diluído automaticamente nos potes.</p>

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
          
          {/* PAINEL DE SALDO EM CAIXA & SALDO LÍQUIDO DISPONÍVEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${cardClasse} rounded-3xl p-4 md:p-6 flex flex-col justify-between space-y-2`}>
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Saldo Bruto em Caixa</span>
                <div className="text-2xl md:text-3xl font-black text-emerald-500 mt-0.5">
                  {formatarGrana(saldoCaixaBruto)}
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">Total de entradas diluídas menos gastos efetuados</span>
            </div>

            <div className={`${cardClasse} rounded-3xl p-4 md:p-6 border-l-4 border-l-rose-500 flex flex-col justify-between space-y-2`}>
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-rose-500" /> Saldo Líquido Livre em Conta
                </span>
                <div className="text-2xl md:text-3xl font-black text-white mt-0.5 font-mono">
                  {formatarGrana(saldoLiquidoDisponivel)}
                </div>
              </div>
              <span className="text-[11px] text-rose-400 font-bold">
                Descontado {formatarGrana(totalContasFixasEDividas)} em dívidas & contas fixas cadastradas
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <h3 className="text-base font-extrabold">Como você pode gastar:</h3>
            <button onClick={() => setModalLancamento(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-xs">
              <Plus className="w-4 h-4" /> + Entrada / Gasto
            </button>
          </div>

          {/* GRID DE POTES */}
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
                    <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full border-8 flex flex-col items-center justify-center ${saldoRealPote < 0 ? 'border-rose-500' : ''}`} style={{ borderColor: saldoRealPote < 0 ? '#EF4444' : pote.cor }}>
                      <span className={`text-xs md:text-sm font-black ${saldoRealPote < 0 ? 'text-rose-500' : ''}`}>
                        {formatarGrana(saldoRealPote)}
                      </span>
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

      {/* MODAL DE ALERTA DE ESTOURO E COMPENSAÇÃO */}
      {alertaEstouro && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 md:p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative border-2 border-amber-500/50`}>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base md:text-lg font-black text-amber-500">Aviso de Limite Excedido</h3>
              <p className="text-xs text-slate-400 mt-1">
                Este gasto estourou o limite disponível do pote <strong>{alertaEstouro.poteNome}</strong> em <strong>{formatarGrana(alertaEstouro.valorEstourado)}</strong>.
              </p>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-xs font-bold text-left space-y-1">
              <span className="text-slate-400 block font-mono">Plano de Compensação:</span>
              <p className="text-emerald-500">
                O valor excedente de {formatarGrana(alertaEstouro.valorEstourado)} será compensado automaticamente no seu pote de Reserva para manter o caixa equilibrado.
              </p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setAlertaEstouro(null)} className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-400 font-bold py-3 rounded-2xl text-xs">
                Cancelar
              </button>
              <button onClick={confirmarCompensacaoEstouro} className="flex-1 bg-amber-500 text-slate-950 font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-1">
                Compensar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TELA 4: AJUSTAR LIMITES */}
      {telaAtiva === 'ajustes' && (
        <main className="max-w-xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-black flex items-center gap-2"><Sliders className="w-5 h-5 text-emerald-500" /> Ajustar Potes</h2>
            <button onClick={() => navegarPara('dashboard')} className="text-xs font-bold text-emerald-500">Salvar & Voltar</button>
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
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-2"><Target className="w-5 h-5 text-emerald-500" /> Minhas Metas</h2>

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
                      <span className="text-emerald-500 font-black">{formatarGrana(precisoPorDia)}</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-2xl text-center">
                      <span className="text-slate-400 block font-bold text-[10px]">Guardar/Mês</span>
                      <span className="text-emerald-500 font-black">{formatarGrana(precisoPorMes)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setMetaAporteId(m.id)}
                    className="w-full bg-emerald-500/10 text-emerald-500 font-bold py-2 rounded-2xl text-xs hover:bg-emerald-500/20 transition-colors"
                  >
                    + Guardar Valor nesta Meta
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* MODAL APORTE META */}
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
        <button onClick={() => navegarPara('metas')} className="flex flex-col items-center p-1.5 text-[10px] font-bold opacity-80 hover:opacity-100">
          <Target className="w-5 h-5 text-emerald-500" /> Metas
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

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button onClick={() => setTipoLancamento('saida')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tipoLancamento === 'saida' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}>
                Gasto (Saída)
              </button>
              <button onClick={() => setTipoLancamento('entrada')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tipoLancamento === 'entrada' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>
                Renda (Entrada)
              </button>
            </div>

            <input type="number" placeholder="Valor R$" value={valorLancamento} onChange={(e) => setValorLancamento(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl font-black text-lg focus:outline-none font-mono" />
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex justify-end" onClick={() => setMenuAberto(false)}>
          <div className={`${cardClasse} w-72 md:w-80 h-full p-5 space-y-5 overflow-y-auto relative border-l`} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMenuAberto(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-emerald-500">MEU IMPÉRIO</h3>

            <div className="space-y-1.5 text-xs md:text-sm font-bold">
              <button onClick={() => navegarPara('dashboard')} className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5">
                <Home className="w-4 h-4 text-emerald-500" /> Início / Dashboard
              </button>
              <button onClick={() => navegarPara('extrato')} className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5">
                <List className="w-4 h-4 text-emerald-500" /> Extrato Completo
              </button>
              <button onClick={() => navegarPara('ajustes')} className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-emerald-500" /> Ajustar Limites e Potes
              </button>
              <button onClick={() => navegarPara('metas')} className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5">
                <Target className="w-4 h-4 text-emerald-500" /> Minhas Metas
              </button>
              <button onClick={() => navegarPara('onboarding')} className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5">
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
