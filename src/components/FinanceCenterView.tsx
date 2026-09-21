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
  Plus,
  Trash2,
  Calendar,
  Sliders
} from 'lucide-react';

interface GastoFixo {
  id: string;
  nome: string;
  valor: number;
}

interface Divida {
  id: string;
  nome: string;
  valorParcela: number;
  parcelasRestantes: number;
  valorTotalRestante: number;
}

export const FinanceCenterView: React.FC = () => {
  const [rendaMensal, setRendaMensal] = useState<number>(2000);
  const [abaAtiva, setAbaAtiva] = useState<'potes' | 'limites' | 'dividas'>('potes');

  // Percentuais padrão (estilo sliders)
  const [percentuais, setPercentuais] = useState({
    reserva: 30,
    investimentoML: 20,
    supermercado: 15,
    desfruteMarido: 10,
    desfruteEsposa: 10,
    dizimo: 10,
    transporte: 5
  });

  // Gastos Fixos Editáveis
  const [gastosFixos, setGastosFixos] = useState<GastoFixo[]>([
    { id: '1', nome: 'Supermercado', valor: 300 },
    { id: '2', nome: 'Luz e Água', valor: 150 },
  ]);
  const [novoGastoNome, setNovoGastoNome] = useState('');
  const [novoGastoValor, setNovoGastoValor] = useState<number | ''>('');

  // Dívidas com Duração
  const [dividas, setDividas] = useState<Divida[]>([
    { id: '1', nome: 'Cartão de Crédito', valorParcela: 180, parcelasRestantes: 6, valorTotalRestante: 1080 },
  ]);
  const [novaDividaNome, setNovaDividaNome] = useState('');
  const [novaDividaParcela, setNovaDividaParcela] = useState<number | ''>('');
  const [novaDividaQtdParcelas, setNovaDividaQtdParcelas] = useState<number | ''>('');

  // Atualizador de percentuais dos sliders
  const handlePercentChange = (categoria: keyof typeof percentuais, valor: number) => {
    setPercentuais(prev => ({ ...prev, [categoria]: valor }));
  };

  const totalPercent = Object.values(percentuais).reduce((a, b) => a + b, 0);

  // Lista dos Cards (Anéis Circulares)
  const listaPotes = [
    {
      id: 'reserva',
      nome: 'Reserva',
      percent: percentuais.reserva,
      cor: 'border-emerald-500 text-emerald-600',
      corBg: 'bg-emerald-50 text-emerald-700',
      icone: PiggyBank
    },
    {
      id: 'investimentoML',
      nome: 'Investimento Loja ML',
      percent: percentuais.investimentoML,
      cor: 'border-amber-500 text-amber-600',
      corBg: 'bg-amber-50 text-amber-700',
      icone: TrendingUp
    },
    {
      id: 'supermercado',
      nome: 'Supermercado',
      percent: percentuais.supermercado,
      cor: 'border-orange-500 text-orange-600',
      corBg: 'bg-orange-50 text-orange-700',
      icone: ShoppingBag
    },
    {
      id: 'desfruteMarido',
      nome: 'Desfrute Marido',
      percent: percentuais.desfruteMarido,
      cor: 'border-blue-500 text-blue-600',
      corBg: 'bg-blue-50 text-blue-700',
      icone: Gamepad2
    },
    {
      id: 'desfruteEsposa',
      nome: 'Desfrute Esposa',
      percent: percentuais.desfruteEsposa,
      cor: 'border-pink-500 text-pink-600',
      corBg: 'bg-pink-50 text-pink-700',
      icone: Heart
    },
    {
      id: 'dizimo',
      nome: 'Dízimo',
      percent: percentuais.dizimo,
      cor: 'border-purple-500 text-purple-600',
      corBg: 'bg-purple-50 text-purple-700',
      icone: Church
    },
    {
      id: 'transporte',
      nome: 'Transporte',
      percent: percentuais.transporte,
      cor: 'border-rose-500 text-rose-600',
      corBg: 'bg-rose-50 text-rose-700',
      icone: Car
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Painel do Topo (Saldo Disponível) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Saldo Disponível</span>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">R$</span>
              <input
                type="number"
                value={rendaMensal}
                onChange={(e) => setRendaMensal(Number(e.target.value))}
                className="text-3xl font-extrabold text-slate-900 bg-transparent w-40 focus:outline-none border-b-2 border-emerald-500"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">de R$ {rendaMensal.toLocaleString('pt-BR')} que entraram no mês</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setAbaAtiva('potes')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                abaAtiva === 'potes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Planejamento
            </button>
            <button
              onClick={() => setAbaAtiva('limites')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                abaAtiva === 'limites' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Ajustar %
            </button>
            <button
              onClick={() => setAbaAtiva('dividas')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                abaAtiva === 'dividas' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Dívidas
            </button>
          </div>
        </div>

        {/* ABA 1: VISÃO DE CARDS (IGUAL ÁS FOTOS) */}
        {abaAtiva === 'potes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {listaPotes.map(item => {
              const Icone = item.icone;
              const valorCalculado = (rendaMensal * item.percent) / 100;

              return (
                <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-between text-center space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm">
                    <Icone className="w-5 h-5 text-slate-500" />
                    <span>{item.nome}</span>
                  </div>

                  {/* Circulo de Progresso */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <div className={`w-32 h-32 rounded-full border-[10px] ${item.cor} flex items-center justify-center bg-white shadow-inner`}>
                      <span className="text-xl font-extrabold text-slate-900">
                        R$ {valorCalculado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    {item.percent}% da sua renda
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ABA 2: SLIDERS DE AJUSTE (IGUAL À FOTO "AJUSTAR LIMITES") */}
        {abaAtiva === 'limites' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Ajustar limites</h2>
                <p className="text-xs text-slate-400 mt-0.5">Defina quanto da sua renda vai para cada objetivo</p>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                totalPercent === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {totalPercent}% da sua renda mapeada
              </div>
            </div>

            <div className="space-y-6">
              {listaPotes.map(item => {
                const valorCalculado = (rendaMensal * item.percent) / 100;

                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-700">{item.nome}</span>
                      <span className="font-semibold text-slate-500">
                        R$ {valorCalculado.toLocaleString('pt-BR')} por mês ({item.percent}%)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={item.percent}
                      onChange={(e) => handlePercentChange(item.id as any, Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ABA 3: DÍVIDAS E GASTOS FIXOS */}
        {abaAtiva === 'dividas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Gastos Fixos */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" /> Gastos Fixos
              </h3>

              <div className="space-y-2">
                {gastosFixos.map(g => (
                  <div key={g.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl text-sm font-medium">
                    <span className="text-slate-700">{g.nome}</span>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-slate-900">R$ {g.valor}</span>
                      <button onClick={() => setGastosFixos(gastosFixos.filter(x => x.id !== g.id))} className="text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Nome do gasto"
                  value={novoGastoNome}
                  onChange={(e) => setNovoGastoNome(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 flex-1"
                />
                <input
                  type="number"
                  placeholder="R$"
                  value={novoGastoValor}
                  onChange={(e) => setNovoGastoValor(e.target.value === '' ? '' : Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 w-24"
                />
                <button 
                  onClick={() => {
                    if (novoGastoNome && novoGastoValor) {
                      setGastosFixos([...gastosFixos, { id: Date.now().toString(), nome: novoGastoNome, valor: Number(novoGastoValor) }]);
                      setNovoGastoNome(''); setNovoGastoValor('');
                    }
                  }} 
                  className="bg-emerald-600 text-white p-2.5 rounded-xl font-bold text-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dívidas e Financiamentos */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-500" /> Dívidas e Duração
              </h3>

              <div className="space-y-3">
                {dividas.map(d => (
                  <div key={d.id} className="p-4 bg-slate-50 rounded-2xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{d.nome}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          Faltam <strong>{d.parcelasRestantes} parcelas</strong>
                        </p>
                      </div>
                      <button onClick={() => setDividas(dividas.filter(x => x.id !== d.id))} className="text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t border-slate-200/60">
                      <span>Parcela: <strong>R$ {d.valorParcela}</strong></span>
                      <span>Total restante: <strong className="text-rose-600">R$ {d.valorTotalRestante}</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Nome da dívida"
                  value={novaDividaNome}
                  onChange={(e) => setNovaDividaNome(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 flex-1 min-w-[120px]"
                />
                <input
                  type="number"
                  placeholder="R$/mês"
                  value={novaDividaParcela}
                  onChange={(e) => setNovaDividaParcela(e.target.value === '' ? '' : Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 w-20"
                />
                <input
                  type="number"
                  placeholder="Nº parc."
                  value={novaDividaQtdParcelas}
                  onChange={(e) => setNovaDividaQtdParcelas(e.target.value === '' ? '' : Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 w-20"
                />
                <button 
                  onClick={() => {
                    if (novaDividaNome && novaDividaParcela && novaDividaQtdParcelas) {
                      const p = Number(novaDividaParcela);
                      const q = Number(novaDividaQtdParcelas);
                      setDividas([...dividas, { id: Date.now().toString(), nome: novaDividaNome, valorParcela: p, parcelasRestantes: q, valorTotalRestante: p * q }]);
                      setNovaDividaNome(''); setNovaDividaParcela(''); setNovaDividaQtdParcelas('');
                    }
                  }} 
                  className="bg-rose-600 text-white px-3 py-2.5 rounded-xl font-bold text-xs"
                >
                  <Plus className="w-4 h-4" />
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
