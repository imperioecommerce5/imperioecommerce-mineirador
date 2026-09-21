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
  MoreHorizontal
} from 'lucide-react';

// Tipos para evitar erros de compilação no TypeScript
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

export const FinanceCenterView: React.FC = () => {
  // Configurações Globais
  const [rendaMensal, setRendaMensal] = useState<number>(2000);
  const [frequencia, setFrequencia] = useState<'dia' | 'semana' | 'quinzena' | 'mes'>('mes');
  const [tema, setTema] = useState<'claro' | 'escuro'>('claro');
  const [tamparValores, setTamparValores] = useState<boolean>(false);
  const [telaAtiva, setTelaAtiva] = useState<'onboarding' | 'confirmacao' | 'dashboard' | 'ajustes' | 'extrato'>('onboarding');
  const [menuAberto, setMenuAberto] = useState<boolean>(false);

  // Modal de Lançamentos
  const [modalLancamento, setModalLancamento] = useState<boolean>(false);
  const [tipoLancamento, setTipoLancamento] = useState<'saida' | 'entrada'>('saida');
  const [valorLancamento, setValorLancamento] = useState<number | ''>('');
  const [descLancamento, setDescLancamento] = useState<string>('');
  const [poteSelecionadoId, setPoteSelecionadoId] = useState<string>('supermercado');

  // Histórico de Transações
  const [transacoes, setTransacoes] = useState<Transacao[]>([
    { id: '1', descricao: 'Salário CLT', valor: 2000, tipo: 'entrada', poteId: 'geral', data: '20/09/2026' },
    { id: '2', descricao: 'Compras do mês', valor: 300, tipo: 'saida', poteId: 'supermercado', data: '21/09/2026' }
  ]);

  // Lista de Potes
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
    todosPotesDisponiveis[3],
    todosPotesDisponiveis[4],
    todosPotesDisponiveis[5]
  ]);

  const [poteEmEdicao, setPoteEmEdicao] = useState<Pote | null>(null);

  // Cálculos Automáticos
  const totalMapeado = potesAtivos.reduce((acc, p) => acc + p.percentual, 0);
  const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  const saldoDisponivel = totalEntradas - totalSaidas;

  // Ações de Potes
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

  // Registar Lançamento
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
    setValorLancamento('');
    setDescLancamento('');
    setModalLancamento(false);
  };

  // Formatação de Valores
  const formatarGrana = (valor: number) => {
    if (tamparValores) return 'R$ •••••';
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Fatias do Círculo
  let acumulado = 0;
  const fatiasSVG = potesAtivos.map(pote => {
    const inicio = acumulado;
    acumulado += pote.percentual;
    return { ...pote, inicio, fim: acumulado };
  });

  const bgClasse = tema === 'escuro' ? 'bg-slate-950 text-slate-100' : 'bg-[#F8F9FA] text-slate-800';
  const cardClasse = tema === 'escuro' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-sm';

  return (
    <div className={`min-h-screen ${bgClasse} font-sans flex flex-col justify-between transition-colors duration-200 pb-20`}>
      
      {/* BARRA SUPERIOR / HEADER */}
      <header className={`p-4 border-b flex justify-between items-center ${tema === 'escuro' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center space-x-2">
          <span className="text-xl font-black text-amber-500">Potes</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 font-bold">Family</span>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setTamparValores(!tamparValores)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-500"
          >
            {tamparValores ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => setTema(tema === 'escuro' ? 'claro' : 'escuro')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-500"
          >
            {tema === 'escuro' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => setMenuAberto(true)}
            className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* TELA 1: ONBOARDING / MONTANDO SEU PLANO */}
      {telaAtiva === 'onboarding' && (
        <main className="max-w-2xl mx-auto p-4 w-full space-y-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Montando seu plano financeiro</h1>

          {/* Configuração de Renda */}
          <div className={`${cardClasse} rounded-3xl p-5 space-y-4`}>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sua renda por mês</span>
                <span className="text-[11px] text-slate-400">Soma de CLT + Mercado Livre</span>
              </div>
              <div className="flex items-center text-xl font-extrabold">
                <span className="text-sm text-slate-400 mr-1">R$</span>
                <input
                  type="number"
                  value={rendaMensal}
                  onChange={(e) => setRendaMensal(Number(e.target.value))}
                  className="w-28 text-right bg-transparent focus:outline-none border-b-2 border-amber-400 font-extrabold"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Com que frequência você recebe dinheiro?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-semibold">
                {[
                  { key: 'dia', label: 'Todo dia' },
                  { key: 'semana', label: 'Toda semana' },
                  { key: 'quinzena', label: 'A cada 15 dias' },
                  { key: 'mes', label: 'Uma vez por mês' },
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFrequencia(item.key as any)}
                    className={`py-2 px-3 rounded-full border text-center transition-all ${
                      frequencia === item.key 
                        ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 font-bold border-transparent' 
                        : 'border-slate-200 dark:border-slate-800 opacity-70'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Círculo com Zonas de Drop e Potes Ativos */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FEF08A" strokeWidth="10" />
                {fatiasSVG.map(pote => {
                  if (pote.percentual <= 0) return null;
                  const dashArray = `${pote.percentual * 2.51327} 251.327`;
                  const dashOffset = `-${pote.inicio * 2.51327}`;
                  return (
                    <circle
                      key={pote.id}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={pote.cor}
                      strokeWidth="10"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      className="transition-all duration-300 ease-out"
                    />
                  );
                })}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black">{totalMapeado}%</span>
                <span className="text-[10px] text-slate-400 max-w-[80px]">da sua renda mapeada</span>
              </div>
            </div>

            {/* Grid dos Potes Selecionados */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
              {potesAtivos.map(pote => (
                <div 
                  key={pote.id}
                  onClick={() => setPoteEmEdicao(pote)}
                  className={`${cardClasse} p-3 rounded-2xl flex flex-col items-center text-center cursor-pointer relative group`}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); removerPote(pote.id); }}
                    className="absolute top-1 right-1 text-slate-400 hover:text-rose-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-2xl mb-1">{pote.iconeEmoji}</span>
                  <span className="text-xs font-bold">{pote.nome}</span>
                  <span className="text-xs font-extrabold text-amber-500">{pote.percentual}%</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setTelaAtiva('confirmacao')}
              className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-4 rounded-2xl shadow-lg transition-all"
            >
              Avançar para o Plano
            </button>
          </div>
        </main>
      )}

      {/* TELA 2: CONFIRMAÇÃO DO PLANO */}
      {telaAtiva === 'confirmacao' && (
        <main className="max-w-md mx-auto p-6 text-center space-y-6 my-auto">
          <h2 className="text-2xl font-black">Seu planejamento financeiro está pronto!</h2>
          
          <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {fatiasSVG.map(pote => (
                <circle
                  key={pote.id}
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke={pote.cor}
                  strokeWidth="10"
                  strokeDasharray={`${pote.percentual * 2.51327} 251.327`}
                  strokeDashoffset={`-${pote.inicio * 2.51327}`}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center p-4 text-xs font-semibold text-slate-500">
              Você lança o que entrou e o app organiza!
            </div>
          </div>

          <button
            onClick={() => setTelaAtiva('dashboard')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all"
          >
            Começar Agora
          </button>
        </main>
      )}

      {/* TELA 3: DASHBOARD PRINCIPAL */}
      {telaAtiva === 'dashboard' && (
        <main className="max-w-4xl mx-auto p-4 w-full space-y-6">
          <div className={`${cardClasse} rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-4`}>
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Saldo Disponível</span>
              <div className="text-3xl md:text-4xl font-black text-emerald-500 mt-1">
                {formatarGrana(saldoDisponivel)}
              </div>
              <span className="text-xs text-slate-400">de {formatarGrana(rendaMensal)} mapeados</span>
            </div>

            <button 
              onClick={() => setModalLancamento(true)}
              className="bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md"
            >
              <Plus className="w-5 h-5" /> Novo Lançamento
            </button>
          </div>

          {/* Cards do Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {potesAtivos.map(pote => {
              const limitePote = (rendaMensal * pote.percentual) / 100;
              const gastosPote = transacoes
                .filter(t => t.tipo === 'saida' && t.poteId === pote.id)
                .reduce((acc, t) => acc + t.valor, 0);
              const restantePote = limitePote - gastosPote;

              return (
                <div key={pote.id} className={`${cardClasse} rounded-3xl p-5 flex flex-col items-center text-center space-y-3`}>
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <span>{pote.iconeEmoji}</span>
                    <span>{pote.nome}</span>
                  </div>

                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center" style={{ borderColor: pote.cor }}>
                      <span className="text-sm font-black">{formatarGrana(restantePote)}</span>
                    </div>
                  </div>

                  <span className="text-xs font-medium text-slate-400">de {formatarGrana(limitePote)} / mês</span>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* TELA 4: AJUSTAR LIMITES */}
      {telaAtiva === 'ajustes' && (
        <main className="max-w-2xl mx-auto p-4 w-full space-y-6">
          <h2 className="text-xl font-black">Ajustar limites de potes</h2>

          <div className={`${cardClasse} rounded-3xl p-6 space-y-6`}>
            {potesAtivos.map(pote => {
              const valorCalculado = (rendaMensal * pote.percentual) / 100;

              return (
                <div key={pote.id} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{pote.iconeEmoji} {pote.nome}</span>
                    <span>{formatarGrana(valorCalculado)} ({pote.percentual}%)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={pote.percentual}
                    onChange={(e) => atualizarPercentual(pote.id, Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-slate-200 accent-amber-400 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* TELA 5: EXTRATO */}
      {telaAtiva === 'extrato' && (
        <main className="max-w-2xl mx-auto p-4 w-full space-y-4">
          <h2 className="text-xl font-black">Extrato de Entradas e Saídas</h2>

          <div className="space-y-2">
            {transacoes.map(t => (
              <div key={t.id} className={`${cardClasse} rounded-2xl p-4 flex justify-between items-center text-sm`}>
                <div className="flex items-center space-x-3">
                  {t.tipo === 'entrada' ? (
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-rose-500" />
                  )}
                  <div>
                    <span className="font-bold block">{t.descricao}</span>
                    <span className="text-xs text-slate-400">{t.data}</span>
                  </div>
                </div>
                <span className={`font-black ${t.tipo === 'entrada' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {t.tipo === 'entrada' ? '+' : '-'} {formatarGrana(t.valor)}
                </span>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* BARRA INFERIOR GLOBAL DE NAVEGAÇÃO */}
      <nav className={`fixed bottom-0 inset-x-0 border-t p-2 flex justify-around items-center z-40 ${tema === 'escuro' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <button onClick={() => setTelaAtiva('dashboard')} className="flex flex-col items-center p-2 text-xs font-bold opacity-70 hover:opacity-100">
          <Home className="w-5 h-5" /> Início
        </button>
        <button onClick={() => setTelaAtiva('extrato')} className="flex flex-col items-center p-2 text-xs font-bold opacity-70 hover:opacity-100">
          <List className="w-5 h-5" /> Extrato
        </button>
        <button onClick={() => setModalLancamento(true)} className="p-3 bg-amber-400 text-slate-950 rounded-full shadow-lg -mt-6">
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-6 max-w-sm w-full space-y-4 relative`}>
            <button onClick={() => setModalLancamento(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold">Novo Lançamento</h3>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setTipoLancamento('saida')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tipoLancamento === 'saida' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}
              >
                Gasto (Saída)
              </button>
              <button
                onClick={() => setTipoLancamento('entrada')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tipoLancamento === 'entrada' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}
              >
                Renda (Entrada)
              </button>
            </div>

            <input
              type="number"
              placeholder="Valor R$"
              value={valorLancamento}
              onChange={(e) => setValorLancamento(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl font-black text-lg focus:outline-none"
            />

            <input
              type="text"
              placeholder="Descrição (ex: Almoço, Venda ML)"
              value={descLancamento}
              onChange={(e) => setDescLancamento(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-sm focus:outline-none"
            />

            {tipoLancamento === 'saida' && (
              <select
                value={poteSelecionadoId}
                onChange={(e) => setPoteSelecionadoId(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-sm focus:outline-none font-bold"
              >
                {potesAtivos.map(p => (
                  <option key={p.id} value={p.id}>{p.iconeEmoji} {p.nome}</option>
                ))}
              </select>
            )}

            <button
              onClick={salvarLancamento}
              className="w-full bg-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow-md"
            >
              Registrar Lançamento
            </button>
          </div>
        </div>
      )}

      {/* MENU GAVETA LATERAL (MAIS) */}
      {menuAberto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
          <div className={`${cardClasse} w-80 h-full p-6 space-y-6 overflow-y-auto relative animate-slideLeft`}>
            <button onClick={() => setMenuAberto(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black">Mais Opções</h3>

            <div className="space-y-2 text-sm font-bold">
              <button onClick={() => { setTelaAtiva('extrato'); setMenuAberto(false); }} className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                📊 Extrato Completo
              </button>
              <button onClick={() => { setTelaAtiva('ajustes'); setMenuAberto(false); }} className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                ⚙️ Ajustar Limites
              </button>
              <button onClick={() => { setTelaAtiva('onboarding'); setMenuAberto(false); }} className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                🔄 Refazer Plano
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FinanceCenterView;
