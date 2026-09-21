import React, { useState, useRef, useEffect } from 'react';
import {
ChevronLeft,
ChevronRight,
X,
Home,
List,
ArrowUp,
Sliders,
MoreHorizontal,
Download,
ArrowDownCircle,
ArrowUpCircle,
FileText,
PieChart,
CreditCard,
Activity,
ShoppingBag,
Target,
EyeOff,
Eye,
HelpCircle,
LogOut,
Plus,
Moon,
Sun,
Monitor,
CheckCircle2,
TrendingDown,
TrendingUp,
Calendar,
Tag
} from 'lucide-react';

// Custom 3D-styled Illustration Components
const IconePorquinho3D = () => 🐷;
const IconeCarro3D = () => 🚗;
const IconeSupermercado3D = () => 🧺;
const IconeControle3D = () => 🎮;
const IconeSacola3D = () => 🛍️;
const IconeDividas3D = () => 💳;
const IconeDizimo3D = () => ✉️;
const IconeInvestimento3D = () => 📈;

interface Pote {
id: string;
nome: string;
percentual: number;
cor: string;
IconeComponente: React.FC;
subtexto?: string;
posicaoSlot?: number;
}

interface Transacao {
id: string;
descricao: string;
valor: number;
tipo: 'entrada' | 'saida';
poteId?: string;
poteNome?: string;
data: string;
}

export const FinanceCenterView: React.FC = () => {
// Theme & Privacy States
const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
const [isDarkMode, setIsDarkMode] = useState(false);
const [tamparValores, setTamparValores] = useState(false);

// Navigation & Modal States
const [telaAtual, setTelaAtual] = useState<'setup' | 'confirmation' | 'dashboard' | 'adjust_limits' | 'extrato'>('setup');
const [menuMaisAberto, setMenuMaisAberto] = useState(false);
const [modalLancamentoAberto, setModalLancamentoAberto] = useState(false);

// Financial Base Data
const [rendaMensal, setRendaMensal] = useState(2000);
const [frequencia, setFrequencia] = useState<'dia' | 'semana' | 'quinzena' | 'mes'>('mes');

// Transaction States (Entradas e Saídas)
const [transacoes, setTransacoes] = useState<Transacao[]>([
{
id: '1',
descricao: 'Salário CLT',
valor: 2000,
tipo: 'entrada',
data: new Date().toISOString().split('T')[0]
},
{
id: '2',
descricao: 'Feira da semana',
valor: 150,
tipo: 'saida',
poteId: 'supermercado',
poteNome: 'Supermercado',
data: new Date().toISOString().split('T')[0]
}
]);

// Form State for Quick Add Transaction
const [novoTipo, setNovoTipo] = useState<'saida' | 'entrada'>('saida');
const [novaDescricao, setNovaDescricao] = useState('');
const [novoValor, setNovoValor] = useState<number | ''>('');
const [novoPoteId, setNovoPoteId] = useState('supermercado');

const scrollRef = useRef(null);

// Potes catalog
const todosPotesDisponiveis: Pote[] = [
{ id: 'reserva', nome: 'Reserva', percentual: 39, cor: '#10B981', IconeComponente: IconePorquinho3D },
{ id: 'transporte', nome: 'Transporte', percentual: 12, cor: '#3B82F6', IconeComponente: IconeCarro3D },
{ id: 'supermercado', nome: 'Supermercado', percentual: 10, cor: '#F97316', IconeComponente: IconeSupermercado3D },
{ id: 'desfrute_marido', nome: 'Desfrute dele', percentual: 12, cor: '#8B5CF6', IconeComponente: IconeControle3D },
{ id: 'desfrute_esposa', nome: 'Desfrute dela', percentual: 9, cor: '#EC4899', IconeComponente: IconeSacola3D },
{ id: 'dividas', nome: 'Dívidas', percentual: 18, cor: '#EF4444', IconeComponente: IconeDividas3D },
{ id: 'dizimo', nome: 'Dízimo', percentual: 0, cor: '#EAB308', IconeComponente: IconeDizimo3D, subtexto: 'verba pra sua igreja' },
{ id: 'investimento_ml', nome: 'Investimento ML', percentual: 0, cor: '#F59E0B', IconeComponente: IconeInvestimento3D },
];

// Selected Jars
const [potesSelecionados, setPotesSelecionados] = useState<Pote[]>([
{ ...todosPotesDisponiveis[0], posicaoSlot: 0 },
{ ...todosPotesDisponiveis[1], posicaoSlot: 1 },
{ ...todosPotesDisponiveis[2], posicaoSlot: 2 },
{ ...todosPotesDisponiveis[3], posicaoSlot: 3 },
{ ...todosPotesDisponiveis[4], posicaoSlot: 4 },
{ ...todosPotesDisponiveis[5], posicaoSlot: 5 },
]);

const [poteEmEdicao, setPoteEmEdicao] = useState<Pote | null>(null);

// Theme Sync
useEffect(() => {
const handleSystemTheme = () => {
if (themeMode === 'system') {
setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
} else {
setIsDarkMode(themeMode === 'dark');
}
};

handleSystemTheme();
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', handleSystemTheme);

return () => mediaQuery.removeEventListener('change', handleSystemTheme);


}, [themeMode]);

// Calculations
const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
const saldoAtualDisponivel = totalEntradas - totalSaidas;

const totalMapeado = potesSelecionados.reduce((acc, p) => acc + p.percentual, 0);

// Radial Slot positions (6 slots around central ring)
const slotPositions = [
{ top: '0%', left: '50%', transform: 'translate(-50%, -100%)' },
{ top: '25%', left: '100%', transform: 'translate(10%, -50%)' },
{ top: '75%', left: '100%', transform: 'translate(10%, -50%)' },
{ top: '100%', left: '50%', transform: 'translate(-50%, 10%)' },
{ top: '75%', left: '0%', transform: 'translate(-110%, -50%)' },
{ top: '25%', left: '0%', transform: 'translate(-110%, -50%)' },
];

// Add Jar to slot
const adicionarPoteNoSlot = (pote: Pote, targetSlot?: number) => {
if (potesSelecionados.some(p => p.id === pote.id)) return;

let slotToUse = targetSlot;
if (slotToUse === undefined) {
  const occupiedSlots = potesSelecionados.map(p => p.posicaoSlot);
  slotToUse = [0, 1, 2, 3, 4, 5].find(s => !occupiedSlots.includes(s));
}

if (slotToUse !== undefined && slotToUse >= 0 && slotToUse < 6) {
  const filtered = potesSelecionados.filter(p => p.posicaoSlot !== slotToUse);
  const novoPote = { ...pote, percentual: pote.percentual || 10, posicaoSlot: slotToUse };
  setPotesSelecionados([...filtered, novoPote]);
  setPoteEmEdicao(novoPote);
}


};

const removerPote = (id: string) => {
setPotesSelecionados(potesSelecionados.filter(p => p.id !== id));
};

const atualizarPercentual = (id: string, novoPercentual: number) => {
setPotesSelecionados(prev => prev.map(p => p.id === id ? { ...p, percentual: novoPercentual } : p));
if (poteEmEdicao && poteEmEdicao.id === id) {
setPoteEmEdicao({ ...poteEmEdicao, percentual: novoPercentual });
}
};

// Add Transaction Handler
const handleAdicionarTransacao = (e: React.FormEvent) => {
e.preventDefault();
if (!novaDescricao || !novoValor || Number(novoValor) <= 0) return;

const poteSelecionadoObj = potesSelecionados.find(p => p.id === novoPoteId);

const novaTransacao: Transacao = {
  id: Date.now().toString(),
  descricao: novaDescricao,
  valor: Number(novoValor),
  tipo: novoTipo,
  poteId: novoTipo === 'saida' ? novoPoteId : undefined,
  poteNome: novoTipo === 'saida' ? poteSelecionadoObj?.nome : undefined,
  data: new Date().toISOString().split('T')[0]
};

setTransacoes([novaTransacao, ...transacoes]);

// Reset Form
setNovaDescricao('');
setNovoValor('');
setModalLancamentoAberto(false);


};

// Scroll controls
const scrollEsquerda = () => scrollRef.current?.scrollBy({ left: -180, behavior: 'smooth' });
const scrollDireita = () => scrollRef.current?.scrollBy({ left: 180, behavior: 'smooth' });

// Privacy format
const formatValor = (val: number) => tamparValores ? 'R$ •••••' : R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })};

// SVG Slices
let acumulado = 0;
const fatiasSVG = potesSelecionados.map(pote => {
const inicio = acumulado;
acumulado += pote.percentual;
return { ...pote, inicio, fim: acumulado };
});

// Calculate spent amount per jar
const getGastoPorPote = (poteId: string) => {
return transacoes
.filter(t => t.tipo === 'saida' && t.poteId === poteId)
.reduce((acc, t) => acc + t.valor, 0);
};

return (
<div className={min-h-screen transition-colors duration-200 font-sans ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#F6F7F9] text-slate-900'}}>

  {/* CONTAINER PRINCIPAL (ESTILO IPAD/CELULAR) */}
  <div className="max-w-md md:max-w-xl mx-auto min-h-screen flex flex-col justify-between pb-24 relative shadow-xl bg-white dark:bg-slate-900 border-x border-slate-200/60 dark:border-slate-800">

    {/* CAMEÇALHO & SELEÇÃO DE TEMA */}
    <header className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80">
      <div className="flex items-center space-x-2">
        <span className="text-xl font-black bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
          Potes
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          Pro
        </span>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full space-x-1 border border-slate-200/50 dark:border-slate-700">
        <button
          onClick={() => setThemeMode('light')}
          className={`p-1.5 rounded-full transition-all ${themeMode === 'light' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          title="Modo Claro"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => setThemeMode('dark')}
          className={`p-1.5 rounded-full transition-all ${themeMode === 'dark' ? 'bg-slate-900 text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          title="Modo Escuro"
        >
          <Moon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setThemeMode('system')}
          className={`p-1.5 rounded-full transition-all ${themeMode === 'system' ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-sm' : 'text-slate-400'}`}
          title="Modo do Sistema"
        >
          <Monitor className="w-4 h-4" />
        </button>
      </div>
    </header>

    {/* TELA 1: MONTAGEM DO PLANO (SETUP) */}
    {telaAtual === 'setup' && (
      <main className="p-5 flex-1 flex flex-col justify-between space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Montando seu plano financeiro
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Defina sua renda e posicione os potes nos círculos ao redor.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Sua renda por mês
            </span>
            <div className="flex items-center text-xl font-extrabold text-slate-900 dark:text-white">
              <span className="text-xs text-slate-400 mr-1">R$</span>
              <input
                type="number"
                value={rendaMensal}
                onChange={(e) => setRendaMensal(Number(e.target.value))}
                className="w-24 text-right bg-transparent border-b-2 border-emerald-500 font-black focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              COM QUE FREQUÊNCIA VOCÊ RECEBE DINHEIRO?
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
              {[
                { key: 'dia', label: 'Todo dia' },
                { key: 'semana', label: 'Toda semana' },
                { key: 'quinzena', label: 'A cada 15 dias' },
                { key: 'mes', label: 'Uma vez por mês' },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setFrequencia(item.key as any)}
                  className={`py-1.5 px-3 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                    frequencia === item.key 
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600' 
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ÁREA DO ANEL COM ZONAS DE ARRASTE FIXAS */}
        <div className="relative my-10 py-12 flex justify-center items-center min-h-[300px]">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke={isDarkMode ? '#1E293B' : '#E2E8F0'} strokeWidth="10" />
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

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{totalMapeado}%</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                mapeada
              </span>
            </div>
          </div>

          {/* Slots Círculares ao Redor */}
          {slotPositions.map((pos, idx) => {
            const poteNoSlot = potesSelecionados.find(p => p.posicaoSlot === idx);
            const Icone = poteNoSlot?.IconeComponente;

            return (
              <div
                key={idx}
                style={{ top: pos.top, left: pos.left, transform: pos.transform }}
                className={`absolute w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  poteNoSlot
                    ? 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md cursor-pointer'
                    : 'border-2 border-dashed border-emerald-400/60 bg-emerald-50/20 dark:bg-emerald-950/20 hover:border-emerald-500 hover:scale-105'
                }`}
                onClick={() => poteNoSlot && setPoteEmEdicao(poteNoSlot)}
              >
                {poteNoSlot ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-1 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); removerPote(poteNoSlot.id); }}
                      className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow-sm hover:scale-110"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <Icone />
                    <span className="text-[10px] font-bold truncate w-full mt-0.5 text-slate-800 dark:text-slate-200">
                      {poteNoSlot.nome}
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                      {poteNoSlot.percentual}%
                    </span>
                  </div>
                ) : (
                  <div className="text-center p-1">
                    <Plus className="w-5 h-5 mx-auto text-emerald-500/80 mb-0.5" />
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block leading-tight">
                      Adicionar
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Carrossel Inferior */}
        <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          <p className="text-xs font-bold text-center text-slate-500 dark:text-slate-400">
            Escolha seus potes — {potesSelecionados.length} escolhidos de {todosPotesDisponiveis.length}
          </p>

          <div className="relative flex items-center">
            <button 
              onClick={scrollEsquerda} 
              className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shrink-0 z-10 mr-1 hover:bg-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div ref={scrollRef} className="flex space-x-2 overflow-x-auto py-2 scrollbar-none scroll-smooth w-full">
              {todosPotesDisponiveis.map(pote => {
                const Icone = pote.IconeComponente;
                const jaSelecionado = potesSelecionados.some(p => p.id === pote.id);

                return (
                  <div
                    key={pote.id}
                    onClick={() => !jaSelecionado && adicionarPoteNoSlot(pote)}
                    className={`flex-shrink-0 bg-slate-50 dark:bg-slate-800 rounded-2xl p-2.5 border text-center flex flex-col items-center space-y-1 w-24 select-none transition-all ${
                      jaSelecionado 
                        ? 'opacity-30 border-slate-200 dark:border-slate-800 grayscale cursor-not-allowed' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500 cursor-pointer hover:shadow-sm'
                    }`}
                  >
                    <Icone />
                    <span className="text-[10px] font-bold truncate w-full text-slate-800 dark:text-slate-200">{pote.nome}</span>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={scrollDireita} 
              className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shrink-0 z-10 ml-1 hover:bg-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={() => setTelaAtual('confirmation')}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 mt-2"
        >
          Concluir Plano Financeiro
        </button>
      </main>
    )}

    {/* TELA 2: CONFIRMAÇÃO DO PLANO */}
    {telaAtual === 'confirmation' && (
      <main className="p-6 flex-1 flex flex-col items-center justify-between text-center space-y-6 my-auto">
        <div className="space-y-2 mt-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Seu planejamento financeiro <span className="text-emerald-500">está pronto</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Tudo calculado para equilibrar sua vida pessoal e seus investimentos no Mercado Livre.
          </p>
        </div>

        <div className="relative w-64 h-64 flex items-center justify-center my-6">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke={isDarkMode ? '#1E293B' : '#E2E8F0'} strokeWidth="12" />
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
                  strokeWidth="12"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-tight">
              Você lança o que entrou e o app organiza seu dinheiro!
            </p>
          </div>
        </div>

        <button
          onClick={() => setTelaAtual('dashboard')}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 text-base"
        >
          Começar
        </button>
      </main>
    )}

    {/* TELA 3: DASHBOARD PRINCIPAL (SALDO REAL E POTES) */}
    {telaAtual === 'dashboard' && (
      <main className="p-5 flex-1 space-y-6">
        
        {/* Banner de Saldo Mapeado e Real */}
        <div className="text-center space-y-1 py-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            SALDO DISPONÍVEL REAL
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {formatValor(saldoAtualDisponivel)}
          </div>
          <p className="text-xs text-slate-400">
            de {formatValor(totalEntradas)} que entraram no mês
          </p>
        </div>

        {/* Título da Seção */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            COMO VOCÊ PODE GASTAR
          </span>
          <button 
            onClick={() => setTelaAtual('adjust_limits')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Ajustar limites
          </button>
        </div>

        {/* Grid dos Potes com Progresso de Gastos Reais */}
        <div className="grid grid-cols-2 gap-4">
          {potesSelecionados.map(pote => {
            const orcamentoPote = (rendaMensal * pote.percentual) / 100;
            const gastoAtualPote = getGastoPorPote(pote.id);
            const restantePote = orcamentoPote - gastoAtualPote;
            
            // Percentual de progresso do pote
            const percentualGasto = orcamentoPote > 0 ? Math.min(100, (gastoAtualPote / orcamentoPote) * 100) : 0;
            const dashOffset = 251.327 - (251.327 * (100 - percentualGasto)) / 100;

            return (
              <div
                key={pote.id}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-4 border border-slate-200/70 dark:border-slate-700/60 flex flex-col items-center text-center space-y-3"
              >
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {pote.nome}
                </span>

                {/* Circulo de Progresso do Pote */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke={isDarkMode ? '#334155' : '#E2E8F0'} strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={restantePote >= 0 ? pote.cor : '#EF4444'}
                      strokeWidth="8"
                      strokeDasharray="251.327"
                      strokeDashoffset={dashOffset}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                    <span className={`text-xs font-black ${restantePote < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                      {formatValor(restantePote)}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-slate-400">
                  de {formatValor(orcamentoPote)}/mês
                </span>
              </div>
            );
          })}
        </div>
      </main>
    )}

    {/* TELA 4: EXTRATO COMPLETO DE ENTRADAS E SAÍDAS */}
    {telaAtual === 'extrato' && (
      <main className="p-5 flex-1 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Extrato Financeiro</h2>
            <p className="text-xs text-slate-400">Histórico de movimentações do mês</p>
          </div>
          <button
            onClick={() => setModalLancamentoAberto(true)}
            className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Novo Lançamento
          </button>
        </div>

        {/* Cards Resumo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 p-3 rounded-2xl">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Total Entradas</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatValor(totalEntradas)}</span>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 p-3 rounded-2xl">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase block">Total Saídas</span>
            <span className="text-base font-black text-rose-600 dark:text-rose-400">{formatValor(totalSaidas)}</span>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="space-y-2 pt-2">
          {transacoes.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">Nenhuma movimentação registrada.</p>
          ) : (
            transacoes.map(t => (
              <div key={t.id} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${t.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'}`}>
                    {t.tipo === 'entrada' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{t.descricao}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {t.data} {t.poteNome && `• Pote: ${t.poteNome}`}
                    </span>
                  </div>
                </div>
                <span className={`font-black text-sm ${t.tipo === 'entrada' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {t.tipo === 'entrada' ? '+' : '-'} {formatValor(t.valor)}
                </span>
              </div>
            ))
          )}
        </div>
      </main>
    )}

    {/* TELA 5: AJUSTAR LIMITES */}
    {telaAtual === 'adjust_limits' && (
      <main className="p-5 flex-1 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke={isDarkMode ? '#1E293B' : '#E2E8F0'} strokeWidth="12" />
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
                    strokeWidth="12"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                  />
                );
              })}
            </svg>
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Ajustar limites
            </h2>
            <p className="text-xs text-slate-400">
              Sua renda por mês: <strong className="text-slate-700 dark:text-slate-200">{formatValor(rendaMensal)}</strong>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {potesSelecionados.map(pote => {
            const valorMes = (rendaMensal * pote.percentual) / 100;
            const valorDiaUtil = valorMes / 22;

            return (
              <div key={pote.id} className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{pote.nome}</span>
                    <p className="text-[10px] text-slate-400">
                      {formatValor(valorDiaUtil)} por dia útil • {formatValor(valorMes)} no mês
                    </p>
                  </div>
                  <span className="font-black text-sm text-slate-900 dark:text-white">{pote.percentual}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pote.percentual}
                  onChange={(e) => atualizarPercentual(pote.id, Number(e.target.value))}
                  style={{ accentColor: pote.cor }}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setTelaAtual('dashboard')}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-emerald-600/20"
        >
          Salvar limites
        </button>
      </main>
    )}

    {/* BARRA DE NAVEGAÇÃO INFERIOR DE 5 BOTÕES */}
    <nav className="fixed bottom-0 left-0 right-0 max-w-md md:max-w-xl mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200/80 dark:border-slate-800 px-4 py-2 flex justify-between items-center z-40">
      <button
        onClick={() => setTelaAtual('dashboard')}
        className={`flex flex-col items-center space-y-0.5 text-[10px] font-bold ${
          telaAtual === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Início</span>
      </button>

      <button
        onClick={() => setTelaAtual('extrato')}
        className={`flex flex-col items-center space-y-0.5 text-[10px] font-bold ${
          telaAtual === 'extrato' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
        }`}
      >
        <List className="w-5 h-5" />
        <span>Extrato</span>
      </button>

      {/* Botão Flutuante Central (Abrir Modal de Lançamento) */}
      <button
        onClick={() => setModalLancamentoAberto(true)}
        className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full shadow-lg -mt-5 transition-transform active:scale-95"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      <button
        onClick={() => setTelaAtual('adjust_limits')}
        className={`flex flex-col items-center space-y-0.5 text-[10px] font-bold ${
          telaAtual === 'adjust_limits' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
        }`}
      >
        <Sliders className="w-5 h-5" />
        <span>Ajustar</span>
      </button>

      <button
        onClick={() => setMenuMaisAberto(true)}
        className="flex flex-col items-center space-y-0.5 text-[10px] font-bold text-slate-400 hover:text-slate-600"
      >
        <MoreHorizontal className="w-5 h-5" />
        <span>Mais</span>
      </button>
    </nav>

    {/* MODAL DE LANÇAMENTO RÁPIDO (ENTRADAS E SAÍDAS) */}
    {modalLancamentoAberto && (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800 relative">
          <button
            onClick={() => setModalLancamentoAberto(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Novo Lançamento
          </h3>

          {/* Seletor Tipo: Entrada ou Saída */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setNovoTipo('saida')}
              className={`py-2 rounded-xl transition-all ${novoTipo === 'saida' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500'}`}
            >
              Saída (Gasto)
            </button>
            <button
              type="button"
              onClick={() => setNovoTipo('entrada')}
              className={`py-2 rounded-xl transition-all ${novoTipo === 'entrada' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500'}`}
            >
              Entrada (Renda)
            </button>
          </div>

          <form onSubmit={handleAdicionarTransacao} className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Descrição</label>
              <input
                type="text"
                required
                placeholder="Ex: Supermercado, Venda ML, Conta de Luz"
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Valor R$</label>
              <input
                type="number"
                required
                step="0.01"
                placeholder="0,00"
                value={novoValor}
                onChange={(e) => setNovoValor(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono text-base focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Selecionar Pote se for Saída */}
            {novoTipo === 'saida' && (
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Descontar do Pote</label>
                <select
                  value={novoPoteId}
                  onChange={(e) => setNovoPoteId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  {potesSelecionados.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className={`w-full font-bold py-3 rounded-xl text-white transition-all shadow-md ${novoTipo === 'saida' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
            >
              Registrar {novoTipo === 'saida' ? 'Saída' : 'Entrada'}
            </button>
          </form>
        </div>
      </div>
    )}

    {/* MENU DRAWER "MAIS" */}
    {menuMaisAberto && (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
        <div className="w-4/5 max-w-xs bg-white dark:bg-slate-900 h-full p-5 shadow-2xl overflow-y-auto space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-base font-black text-slate-900 dark:text-white">Mais</span>
            <button onClick={() => setMenuMaisAberto(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl flex items-center space-x-3 border border-emerald-200/50 dark:border-emerald-800/40">
            <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              Baixe o app no celular
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              IR PARA
            </span>
            <div className="space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
              {[
                { label: 'Extrato de saídas', icon: ArrowDownCircle, color: 'text-rose-500' },
                { label: 'Extrato de entradas', icon: ArrowUpCircle, color: 'text-emerald-500' },
                { label: 'Contas fixas', icon: FileText, color: 'text-blue-500' },
                { label: 'Patrimônio', icon: PieChart, color: 'text-emerald-600' },
                { label: 'Meu planejamento', icon: Sliders, color: 'text-purple-500' },
                { label: 'Minhas dívidas', icon: CreditCard, color: 'text-rose-500' },
                { label: 'Meu desempenho', icon: Activity, color: 'text-amber-500' },
                { label: 'Supermercado', icon: ShoppingBag, color: 'text-orange-500' },
                { label: 'Minhas metas', icon: Target, color: 'text-emerald-500' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setTelaAtual('extrato'); setMenuMaisAberto(false); }}
                  className="w-full flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              AJUSTES
            </span>
            <button
              onClick={() => setTamparValores(!tamparValores)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <div className="flex items-center space-x-3">
                {tamparValores ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                <span>Tampar valores</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{tamparValores ? 'Ativado' : 'Desativado'}</span>
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
</div>


);
};

export default FinanceCenterView;
