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
DollarSign,
Moon,
Sun,
Monitor,
CheckCircle2
} from 'lucide-react';

// Custom 3D Illustration Components
const IconePorquinho3D = () => (

const IconeCarro3D = () => (

const IconeSupermercado3D = () => (

const IconeControle3D = () => (

const IconeSacola3D = () => (

const IconeDividas3D = () => (

const IconeDizimo3D = () => (

const IconeInvestimento3D = () => (

interface Pote {
id: string;
nome: string;
percentual: number;
cor: string;
IconeComponente: React.FC;
subtexto?: string;
posicaoSlot?: number;
}

type ModeTheme = 'light' | 'dark' | 'system';
type ScreenState = 'setup' | 'confirmation' | 'dashboard' | 'adjust_limits';

export const FinanceCenterView: React.FC = () => {
// Theme & Privacy States
const [themeMode, setThemeMode] = useState('system');
const [isDarkMode, setIsDarkMode] = useState(false);
const [tamparValores, setTamparValores] = useState(false);

// App Navigation States
const [telaAtual, setTelaAtual] = useState('setup');
const [menuMaisAberto, setMenuMaisAberto] = useState(false);

// Financial Data States
const [rendaMensal, setRendaMensal] = useState(2000);
const [frequencia, setFrequencia] = useState<'dia' | 'semana' | 'quinzena' | 'mes'>('mes');

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

// Selected Jars / Placement
const [potesSelecionados, setPotesSelecionados] = useState<Pote[]>([
{ ...todosPotesDisponiveis[0], posicaoSlot: 0 },
{ ...todosPotesDisponiveis[1], posicaoSlot: 1 },
{ ...todosPotesDisponiveis[2], posicaoSlot: 2 },
{ ...todosPotesDisponiveis[3], posicaoSlot: 3 },
{ ...todosPotesDisponiveis[4], posicaoSlot: 4 },
{ ...todosPotesDisponiveis[5], posicaoSlot: 5 },
]);

const [poteEmEdicao, setPoteEmEdicao] = useState<Pote | null>(null);

// System Dark Mode Handler
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

// Total Percentage
const totalMapeado = potesSelecionados.reduce((acc, p) => acc + p.percentual, 0);

// Slots positioning around the ring (6 radial slots)
const slotPositions = [
{ top: '0%', left: '50%', transform: 'translate(-50%, -100%)' }, // Slot 0: Top
{ top: '25%', left: '100%', transform: 'translate(10%, -50%)' }, // Slot 1: Top-Right
{ top: '75%', left: '100%', transform: 'translate(10%, -50%)' }, // Slot 2: Bottom-Right
{ top: '100%', left: '50%', transform: 'translate(-50%, 10%)' }, // Slot 3: Bottom
{ top: '75%', left: '0%', transform: 'translate(-110%, -50%)' }, // Slot 4: Bottom-Left
{ top: '25%', left: '0%', transform: 'translate(-110%, -50%)' }, // Slot 5: Top-Left
];

// Actions
const adicionarPoteNoSlot = (pote: Pote, targetSlot?: number) => {
if (potesSelecionados.some(p => p.id === pote.id)) return;

// Find next available slot if not specified
let slotToUse = targetSlot;
if (slotToUse === undefined) {
  const occupiedSlots = potesSelecionados.map(p => p.posicaoSlot);
  slotToUse = [0, 1, 2, 3, 4, 5].find(s => !occupiedSlots.includes(s));
}

if (slotToUse !== undefined && slotToUse >= 0 && slotToUse < 6) {
  // Remove any existing jar in that slot or add new
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

// Drag and Drop Handlers
const handleDragStart = (e: React.DragEvent, pote: Pote) => {
e.dataTransfer.setData('application/json', JSON.stringify(pote));
};

const handleDragOver = (e: React.DragEvent) => {
e.preventDefault();
};

const handleDropOnSlot = (e: React.DragEvent, slotIndex: number) => {
e.preventDefault();
const data = e.dataTransfer.getData('application/json');
if (data) {
const pote: Pote = JSON.parse(data);
adicionarPoteNoSlot(pote, slotIndex);
}
};

// Scroll controls for carousel
const scrollEsquerda = () => scrollRef.current?.scrollBy({ left: -180, behavior: 'smooth' });
const scrollDireita = () => scrollRef.current?.scrollBy({ left: 180, behavior: 'smooth' });

// Format monetary value helper
const formatValor = (val: number) => tamparValores ? 'R$ •••••' : R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })};

// Calculate SVG Donut Slices
let acumulado = 0;
const fatiasSVG = potesSelecionados.map(pote => {
const inicio = acumulado;
acumulado += pote.percentual;
return { ...pote, inicio, fim: acumulado };
});

return (
<div className={min-h-screen transition-colors duration-200 font-sans ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#F6F7F9] text-slate-900'}}>

  {/* APP CONTAINER */}
  <div className="max-w-md md:max-w-xl mx-auto min-h-screen flex flex-col justify-between pb-24 relative shadow-xl bg-white dark:bg-slate-900 border-x border-slate-200/60 dark:border-slate-800">

    {/* TOP BAR / THEME SELECTOR */}
    <header className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80">
      <div className="flex items-center space-x-2">
        <span className="text-xl font-black bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
          Potes
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          Pro
        </span>
      </div>

      {/* Theme Mode Switcher */}
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

    {/* SCREEN 1: SETUP / ONBOARDING */}
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

        {/* Income Card */}
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

        {/* RING AREA WITH DEDICATED CIRCULAR DROP ZONES */}
        <div className="relative my-10 py-12 flex justify-center items-center min-h-[300px]">
          
          {/* Central Donut Chart */}
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

          {/* 6 Radial Drop Zones around the ring */}
          {slotPositions.map((pos, idx) => {
            const poteNoSlot = potesSelecionados.find(p => p.posicaoSlot === idx);
            const Icone = poteNoSlot?.IconeComponente;

            return (
              <div
                key={idx}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnSlot(e, idx)}
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
                      Arraste aqui
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Carousel Selector */}
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
                    draggable={!jaSelecionado}
                    onDragStart={(e) => handleDragStart(e, pote)}
                    onClick={() => !jaSelecionado && adicionarPoteNoSlot(pote)}
                    className={`flex-shrink-0 bg-slate-50 dark:bg-slate-800 rounded-2xl p-2.5 border text-center flex flex-col items-center space-y-1 w-24 select-none transition-all ${
                      jaSelecionado 
                        ? 'opacity-30 border-slate-200 dark:border-slate-800 grayscale cursor-not-allowed' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500 cursor-grab active:cursor-grabbing hover:shadow-sm'
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

        {/* Confirm Setup Action */}
        <button
          onClick={() => setTelaAtual('confirmation')}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 mt-2"
        >
          Concluir Plano Financeiro
        </button>
      </main>
    )}

    {/* SCREEN 2: CONFIRMATION PAGE */}
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

        {/* Central Donut Summary */}
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

    {/* SCREEN 3: DASHBOARD */}
    {telaAtual === 'dashboard' && (
      <main className="p-5 flex-1 space-y-6">
        {/* Available Balance Banner */}
        <div className="text-center space-y-1 py-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            SALDO DISPONÍVEL
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {formatValor(rendaMensal * (totalMapeado / 100))}
          </div>
          <p className="text-xs text-slate-400">
            de {formatValor(rendaMensal)} que entraram no mês
          </p>
        </div>

        {/* Section Title */}
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

        {/* Jars Grid */}
        <div className="grid grid-cols-2 gap-4">
          {potesSelecionados.map(pote => {
            const valorCalculado = (rendaMensal * pote.percentual) / 100;
            return (
              <div
                key={pote.id}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-4 border border-slate-200/70 dark:border-slate-700/60 flex flex-col items-center text-center space-y-3"
              >
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {pote.nome}
                </span>

                {/* Circular Ring per Jar */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke={isDarkMode ? '#334155' : '#E2E8F0'} strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={pote.cor}
                      strokeWidth="8"
                      strokeDasharray="251.327"
                      strokeDashoffset="0"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center p-1">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {formatValor(valorCalculado)}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-slate-400">
                  de {formatValor(valorCalculado)}
                </span>
              </div>
            );
          })}
        </div>
      </main>
    )}

    {/* SCREEN 4: ADJUST LIMITS */}
    {telaAtual === 'adjust_limits' && (
      <main className="p-5 flex-1 space-y-6">
        <div className="flex items-center space-x-3">
          {/* Ring Thumbnail */}
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

        {/* Sliders list */}
        <div className="space-y-4">
          {potesSelecionados.map(pote => {
            const valorMes = (rendaMensal * pote.percentual) / 100;
            const valorDiaUtil = valorMes / 22; // ~22 business days

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

        {/* Add Custom / Income Action */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            onClick={() => setTelaAtual('setup')}
            className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200/60 dark:border-slate-700"
          >
            + Nova categoria
          </button>
          <button 
            onClick={() => setTelaAtual('setup')}
            className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200/60 dark:border-slate-700"
          >
            Alterar minha renda
          </button>
        </div>

        <button
          onClick={() => setTelaAtual('dashboard')}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-emerald-600/20"
        >
          Salvar limites
        </button>
      </main>
    )}

    {/* BOTTOM NAVIGATION BAR (5 BUTTONS) */}
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
        onClick={() => setTelaAtual('dashboard')}
        className="flex flex-col items-center space-y-0.5 text-[10px] font-bold text-slate-400 hover:text-slate-600"
      >
        <List className="w-5 h-5" />
        <span>Extrato</span>
      </button>

      {/* Quick Add Central Floating Button */}
      <button
        onClick={() => setTelaAtual('setup')}
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

          {/* Install App Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl flex items-center space-x-3 border border-emerald-200/50 dark:border-emerald-800/40">
            <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              Baixe o app no celular
            </span>
          </div>

          {/* Section: Ir Para */}
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
                  onClick={() => setMenuMaisAberto(false)}
                  className="w-full flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Ajustes */}
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

          {/* Section: Ajuda e Conta */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <button className="w-full flex items-center space-x-3 p-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
              <HelpCircle className="w-4 h-4 text-teal-500" />
              <span>Suporte</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30">
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sair desta conta</span>
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
