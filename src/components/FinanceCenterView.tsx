import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Ícones visuais em estilo 3D
const IconePorquinho3D = () => <div className="text-3xl select-none">🐷</div>;
const IconeCarro3D = () => <div className="text-3xl select-none">🚗</div>;
const IconeSupermercado3D = () => <div className="text-3xl select-none">🧺</div>;
const IconeControle3D = () => <div className="text-3xl select-none">🎮</div>;
const IconeSacola3D = () => <div className="text-3xl select-none">🛍️</div>;
const IconeDividas3D = () => <div className="text-3xl select-none">💳</div>;
const IconeDizimo3D = () => <div className="text-3xl select-none">✉️</div>;
const IconeInvestimento3D = () => <div className="text-3xl select-none">📈</div>;

interface Pote {
  id: string;
  nome: string;
  percentual: number;
  cor: string;
  IconeComponente: React.FC;
  subtexto?: string;
}

export const FinanceCenterView: React.FC = () => {
  const [rendaMensal, setRendaMensal] = useState<number>(2000);
  const [frequencia, setFrequencia] = useState<'dia' | 'semana' | 'quinzena' | 'mes'>('mes');
  const scrollRef = useRef<HTMLDivElement>(null);

  const todosPotesDisponiveis: Pote[] = [
    { id: 'reserva', nome: 'Reserva', percentual: 0, cor: '#EAB308', IconeComponente: IconePorquinho3D },
    { id: 'transporte', nome: 'Transporte', percentual: 0, cor: '#3B82F6', IconeComponente: IconeCarro3D },
    { id: 'supermercado', nome: 'Supermercado', percentual: 0, cor: '#F97316', IconeComponente: IconeSupermercado3D },
    { id: 'desfrute_marido', nome: 'Desfrute marido', percentual: 0, cor: '#8B5CF6', IconeComponente: IconeControle3D },
    { id: 'desfrute_esposa', nome: 'Desfrute esposa', percentual: 0, cor: '#EC4899', IconeComponente: IconeSacola3D },
    { id: 'dividas', nome: 'Dívidas', percentual: 0, cor: '#EF4444', IconeComponente: IconeDividas3D },
    { id: 'dizimo', nome: 'Dízimo', percentual: 0, cor: '#10B981', IconeComponente: IconeDizimo3D, subtexto: 'verba pra sua igreja' },
    { id: 'investimento_ml', nome: 'Investimento ML', percentual: 0, cor: '#F59E0B', IconeComponente: IconeInvestimento3D },
  ];

  const [potesSelecionados, setPotesSelecionados] = useState<Pote[]>([]);
  const [poteEmEdicao, setPoteEmEdicao] = useState<Pote | null>(null);

  const totalMapeado = potesSelecionados.reduce((acc, p) => acc + p.percentual, 0);

  const adicionarPote = (pote: Pote) => {
    if (!potesSelecionados.some(p => p.id === pote.id)) {
      const novoPote = { ...pote, percentual: 10 };
      setPotesSelecionados([...potesSelecionados, novoPote]);
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

  // Funções de deslizar o carrossel inferior com as setas
  const scrollEsquerda = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollDireita = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  // Handlers de Drag and Drop
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
      adicionarPote(pote);
    }
  };

  let acumulado = 0;
  const fatiasSVG = potesSelecionados.map(pote => {
    const inicio = acumulado;
    acumulado += pote.percentual;
    return { ...pote, inicio, fim: acumulado };
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 p-4 md:p-8 font-sans flex flex-col items-center justify-between">
      
      {/* Título Principal */}
      <div className="w-full max-w-2xl text-left mb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Montando seu plano financeiro
        </h1>
      </div>

      {/* Card Superior: Renda e Frequência */}
      <div className="w-full max-w-xl bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/60 space-y-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="text-xs font-semibold text-slate-500">
            Sua renda por mês
            <span className="block text-[11px] font-normal text-slate-400">Somar tudo que entra no mês, de todas as fontes.</span>
          </div>
          <div className="flex items-center text-xl md:text-2xl font-extrabold text-slate-800">
            <span className="text-sm font-bold text-slate-400 mr-1">R$</span>
            <input
              type="number"
              value={rendaMensal}
              onChange={(e) => setRendaMensal(Number(e.target.value))}
              className="w-28 text-right bg-transparent focus:outline-none border-b-2 border-amber-400 font-extrabold text-slate-900"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            COM QUE FREQUÊNCIA VOCÊ RECEBE DINHEIRO?
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
                className={`py-2 px-3 rounded-full border text-center transition-all flex items-center justify-center gap-1.5 ${
                  frequencia === item.key 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  frequencia === item.key ? 'border-white bg-amber-400' : 'border-slate-300'
                }`}>
                  {frequencia === item.key && <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />}
                </div>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ÁREA CENTRAL (DROP ZONE): CÍRCULO E POTES ATIVOS */}
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative w-full max-w-2xl flex flex-col items-center justify-center my-2 p-4 min-h-[340px] rounded-3xl border-2 border-dashed border-transparent hover:border-amber-300/50 transition-all"
      >
        
        {/* Círculo Central Progressivo */}
        <div className="relative w-52 h-52 md:w-60 md:h-60 flex items-center justify-center">
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

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            <span className="text-3xl md:text-4xl font-black text-slate-900">{totalMapeado}%</span>
            <span className="text-[10px] md:text-xs font-medium text-slate-500 max-w-[90px]">
              da sua renda mapeada
            </span>
          </div>
        </div>

        {/* Potes Ativos em Volta do Círculo */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
          {potesSelecionados.map(pote => {
            const Icone = pote.IconeComponente;
            const valorCalculado = (rendaMensal * pote.percentual) / 100;

            return (
              <div 
                key={pote.id}
                onClick={() => setPoteEmEdicao(pote)}
                className="relative bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center space-y-1 group"
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); removerPote(pote.id); }}
                  className="absolute top-1.5 right-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-12 h-12 rounded-xl bg-amber-50/60 flex items-center justify-center my-1 group-hover:scale-105 transition-transform">
                  <Icone />
                </div>

                <span className="text-xs font-bold text-slate-800">{pote.nome}</span>
                <span className="text-xs font-extrabold text-amber-600">{pote.percentual}%</span>
                <span className="text-[10px] font-semibold text-slate-400">R$ {valorCalculado.toLocaleString('pt-BR')}</span>
              </div>
            );
          })}
        </div>

      </div>

      {/* CARROSSEL INFERIOR COM NAVEGAÇÃO POR SETAS E ARRASTE */}
      <div className="w-full max-w-2xl mt-auto pt-4 border-t border-slate-200/80 space-y-3">
        <p className="text-xs font-bold text-center text-slate-500">
          Escolha seus potes — {potesSelecionados.length} escolhidos de {todosPotesDisponiveis.length}
        </p>

        <div className="relative flex items-center">
          {/* Seta para a Esquerda */}
          <button 
            type="button"
            onClick={scrollEsquerda}
            className="p-2 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-colors shrink-0 z-10 mr-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Carrossel Deslizante de Potes */}
          <div 
            ref={scrollRef}
            className="flex items-center space-x-3 overflow-x-auto py-2 scrollbar-none scroll-smooth w-full px-1"
          >
            {todosPotesDisponiveis.map(pote => {
              const Icone = pote.IconeComponente;
              const jaSelecionado = potesSelecionados.some(p => p.id === pote.id);

              return (
                <div
                  key={pote.id}
                  draggable={!jaSelecionado}
                  onDragStart={(e) => handleDragStart(e, pote)}
                  onClick={() => !jaSelecionado && adicionarPote(pote)}
                  className={`flex-shrink-0 bg-white rounded-2xl p-3 border text-center flex flex-col items-center space-y-1 w-28 select-none transition-all ${
                    jaSelecionado 
                      ? 'opacity-40 border-slate-200 grayscale cursor-not-allowed' 
                      : 'border-slate-200/80 hover:border-amber-400 hover:shadow-sm cursor-grab active:cursor-grabbing'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Icone />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 truncate w-full">{pote.nome}</span>
                  {pote.subtexto && (
                    <span className="text-[9px] text-slate-400 truncate w-full">{pote.subtexto}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Seta para a Direita */}
          <button 
            type="button"
            onClick={scrollDireita}
            className="p-2 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-colors shrink-0 z-10 ml-1"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MODAL DE AJUSTE INDIVIDUAL */}
      {poteEmEdicao && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-xl relative border border-slate-100">
            <button 
              onClick={() => setPoteEmEdicao(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center">
              {React.createElement(poteEmEdicao.IconeComponente)}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{poteEmEdicao.nome}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Qual percentual da sua renda você quer deixar para este pote?
              </p>
            </div>

            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-8 border-amber-400 flex flex-col items-center justify-center bg-white shadow-inner">
                <span className="text-2xl font-black text-slate-900">{poteEmEdicao.percentual}%</span>
                <span className="text-[10px] font-bold text-amber-600">
                  dão R$ {((rendaMensal * poteEmEdicao.percentual) / 100).toLocaleString('pt-BR')} por mês
                </span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={poteEmEdicao.percentual}
              onChange={(e) => atualizarPercentual(poteEmEdicao.id, Number(e.target.value))}
              className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />

            <p className="text-[11px] font-medium text-slate-400">
              {totalMapeado > 100 ? '⚠️ Total ultrapassa 100% da renda!' : `${100 - totalMapeado}% restante livre`}
            </p>

            <button
              onClick={() => setPoteEmEdicao(null)}
              className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-3 rounded-2xl transition-all shadow-md shadow-amber-400/20"
            >
              Pronto
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default FinanceCenterView;
