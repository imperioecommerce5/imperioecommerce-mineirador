import React, { useState } from 'react';
import { 
  PiggyBank, 
  ShoppingBag, 
  Car, 
  CreditCard, 
  Heart, 
  Gamepad2, 
  TrendingUp, 
  Church, 
  X,
  Check
} from 'lucide-react';

interface Pote {
  id: string;
  nome: string;
  percentual: number;
  cor: string;
  icone: any;
  subtexto?: string;
}

export const FinanceCenterView: React.FC = () => {
  // Estado 1: Renda e Frequência
  const [rendaMensal, setRendaMensal] = useState<number>(2000);
  const [frequencia, setFrequencia] = useState<'dia' | 'semana' | 'quinzena' | 'mes'>('mes');

  // Potes Disponíveis no Banco/Carrossel Inferior com Cores Harmoniosas sobre Base Amarela
  const todosPotesDisponiveis: Pote[] = [
    { id: 'reserva', nome: 'Reserva', percentual: 0, cor: '#EAB308', icone: PiggyBank }, // Amarelo
    { id: 'transporte', nome: 'Transporte', percentual: 0, cor: '#3B82F6', icone: Car }, // Azul
    { id: 'supermercado', nome: 'Supermercado', percentual: 0, cor: '#F97316', icone: ShoppingBag }, // Laranja
    { id: 'desfrute_marido', nome: 'Desfrute marido', percentual: 0, cor: '#8B5CF6', icone: Gamepad2 }, // Roxo
    { id: 'desfrute_esposa', nome: 'Desfrute esposa', percentual: 0, cor: '#EC4899', icone: Heart }, // Rosa
    { id: 'dividas', nome: 'Dívidas', percentual: 0, cor: '#EF4444', icone: CreditCard }, // Vermelho
    { id: 'dizimo', nome: 'Dízimo', percentual: 0, cor: '#10B981', icone: Church, subtexto: 'verba pra sua igreja' }, // Verde
    { id: 'investimento_ml', nome: 'Investimento ML', percentual: 0, cor: '#F59E0B', icone: TrendingUp }, // Âmbar/Amarelo Ouro
  ];

  // Potes selecionados para o plano
  const [potesSelecionados, setPotesSelecionados] = useState<Pote[]>([]);
  const [poteEmEdicao, setPoteEmEdicao] = useState<Pote | null>(null);

  // Total do Círculo
  const totalMapeado = potesSelecionados.reduce((acc, p) => acc + p.percentual, 0);

  // Adicionar pote do carrossel para a área central
  const adicionarPote = (pote: Pote) => {
    if (!potesSelecionados.some(p => p.id === pote.id)) {
      const novoPote = { ...pote, percentual: 10 }; // Valor padrão inicial ao adicionar
      setPotesSelecionados([...potesSelecionados, novoPote]);
      setPoteEmEdicao(novoPote);
    }
  };

  // Remover pote da área central
  const removerPote = (id: string) => {
    setPotesSelecionados(potesSelecionados.filter(p => p.id !== id));
  };

  // Atualizar percentual do pote
  const atualizarPercentual = (id: string, novoPercentual: number) => {
    setPotesSelecionados(prev => prev.map(p => p.id === id ? { ...p, percentual: novoPercentual } : p));
    if (poteEmEdicao && poteEmEdicao.id === id) {
      setPoteEmEdicao({ ...poteEmEdicao, percentual: novoPercentual });
    }
  };

  // Cálculo das fatias do Círculo SVG
  let acumulado = 0;
  const fatiasSVG = potesSelecionados.map(pote => {
    const inicio = acumulado;
    acumulado += pote.percentual;
    return { ...pote, inicio, fim: acumulado };
  });

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-800 p-4 md:p-8 font-sans flex flex-col items-center justify-between">
      
      {/* Título Principal */}
      <div className="w-full max-w-2xl text-left mb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Montando seu plano financeiro
        </h1>
      </div>

      {/* Card Superior: Renda e Frequência */}
      <div className="w-full max-w-xl bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/60 space-y-4 mb-6">
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

      {/* ÁREA CENTRAL: CÍRCULO E POTES ATIVOS */}
      <div className="relative w-full max-w-2xl flex flex-col items-center justify-center my-4 min-h-[340px]">
        
        {/* Círculo Central Progressivo com Base Amarela */}
        <div className="relative w-52 h-52 md:w-60 md:h-60 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Círculo base amarelo suave (quando 0%) */}
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FEF08A" strokeWidth="10" />
            
            {/* Fatias coloridas */}
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

          {/* Texto Central */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            <span className="text-3xl md:text-4xl font-black text-slate-900">{totalMapeado}%</span>
            <span className="text-[10px] md:text-xs font-medium text-slate-500 max-w-[90px]">
              da sua renda mapeada
            </span>
          </div>
        </div>

        {/* Potes Ativos em volta do Círculo */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
          {potesSelecionados.map(pote => {
            const Icone = pote.icone;
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
                  <Icone className="w-7 h-7 text-amber-600" />
                </div>

                <span className="text-xs font-bold text-slate-800">{pote.nome}</span>
                <span className="text-xs font-extrabold text-amber-600">{pote.percentual}%</span>
                <span className="text-[10px] font-semibold text-slate-400">R$ {valorCalculado.toLocaleString('pt-BR')}</span>
              </div>
            );
          })}
        </div>

      </div>

      {/* CARROSSEL INFERIOR: SELEÇÃO DE POTES */}
      <div className="w-full max-w-2xl mt-auto pt-4 border-t border-slate-200/80 space-y-2">
        <p className="text-xs font-bold text-center text-slate-500">
          Escolha seus potes — {potesSelecionados.length} escolhidos de {todosPotesDisponiveis.length}
        </p>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {todosPotesDisponiveis.map(pote => {
            const Icone = pote.icone;
            const jaSelecionado = potesSelecionados.some(p => p.id === pote.id);

            return (
              <button
                key={pote.id}
                type="button"
                onClick={() => !jaSelecionado && adicionarPote(pote)}
                disabled={jaSelecionado}
                className={`flex-shrink-0 bg-white rounded-2xl p-3 border text-center flex flex-col items-center space-y-1 w-28 transition-all ${
                  jaSelecionado 
                    ? 'opacity-40 border-slate-200 grayscale cursor-not-allowed' 
                    : 'border-slate-200/80 hover:border-amber-400 hover:shadow-sm cursor-pointer'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Icone className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 truncate w-full">{pote.nome}</span>
                {pote.subtexto && (
                  <span className="text-[9px] text-slate-400 truncate w-full">{pote.subtexto}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL DE AJUSTE INDIVIDUAL DO POTE */}
      {poteEmEdicao && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-xl relative border border-slate-100">
            <button 
              onClick={() => setPoteEmEdicao(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center">
              {React.createElement(poteEmEdicao.icone, { className: "w-9 h-9 text-amber-600" })}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{poteEmEdicao.nome}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Qual percentual da sua renda você quer deixar para este pote?
              </p>
            </div>

            {/* Anel de Ajuste com Destaque Amarelo */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-8 border-amber-400 flex flex-col items-center justify-center bg-white shadow-inner">
                <span className="text-2xl font-black text-slate-900">{poteEmEdicao.percentual}%</span>
                <span className="text-[10px] font-bold text-amber-600">
                  dão R$ {((rendaMensal * poteEmEdicao.percentual) / 100).toLocaleString('pt-BR')} por mês
                </span>
              </div>
            </div>

            {/* Controle Deslizante Amarelo */}
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
