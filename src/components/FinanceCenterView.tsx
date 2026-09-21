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
  Calendar
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
  const [abaAtiva, setAbaAtiva] = useState<'planejamento' | 'dividas'>('planejamento');

  // Percentuais de cada categoria (Inicia preenchido ou ajustável)
  const [percentuais, setPercentuais] = useState({
    reserva: 30,
    investimentoML: 20,
    supermercado: 15,
    desfruteMarido: 10,
    desfruteEsposa: 10,
    dizimo: 10,
    transporte: 5
  });

  // Lista de Gastos Fixos
  const [gastosFixos, setGastosFixos] = useState<GastoFixo[]>([
    { id: '1', nome: 'Supermercado', valor: 300 },
    { id: '2', nome: 'Luz e Água', valor: 150 },
  ]);
  const [novoGastoNome, setNovoGastoNome] = useState('');
  const [novoGastoValor, setNovoGastoValor] = useState<number | ''>('');

  // Lista de Dívidas
  const [dividas, setDividas] = useState<Divida[]>([
    { id: '1', nome: 'Cartão de Crédito', valorParcela: 180, parcelasRestantes: 6, valorTotalRestante: 1080 },
  ]);
  const [novaDividaNome, setNovaDividaNome] = useState('');
  const [novaDividaParcela, setNovaDividaParcela] = useState<number | ''>('');
  const [novaDividaQtdParcelas, setNovaDividaQtdParcelas] = useState<number | ''>('');

  const handlePercentChange = (categoria: keyof typeof percentuais, valor: number) => {
    setPercentuais(prev => ({ ...prev, [categoria]: valor }));
  };

  const totalPercent = Object.values(percentuais).reduce((a, b) => a + b, 0);

  // Definição das Categorias e Cores do Círculo
  const categorias = [
    { id: 'reserva', nome: 'Reserva', percent: percentuais.reserva, cor: '#10B981', icone: PiggyBank }, // verde
    { id: 'investimentoML', nome: 'Investir na Loja ML', percent: percentuais.investimentoML, cor: '#F59E0B', icone: TrendingUp }, // amarelo/amber
    { id: 'supermercado', nome: 'Supermercado', percent: percentuais.supermercado, cor: '#F97316', icone: ShoppingBag }, // laranja
    { id: 'desfruteMarido', nome: 'Desfrute Marido', percent: percentuais.desfruteMarido, cor: '#3B82F6', icone: Gamepad2 }, // azul
    { id: 'desfruteEsposa', nome: 'Desfrute Esposa', percent: percentuais.desfruteEsposa, cor: '#EC4899', icone: Heart }, // rosa
    { id: 'dizimo', nome: 'Dízimo', percent: percentuais.dizimo, cor: '#8B5CF6', icone: Church }, // roxo
    { id: 'transporte', nome: 'Transporte', percent: percentuais.transporte, cor: '#EF4444', icone: Car } // vermelho
  ];

  // Cálculo SVG do Círculo Unificado
  let accumulatedPercent = 0;
  const slices = categorias.map(cat => {
    const start = accumulatedPercent;
    accumulatedPercent += cat.percent;
    return { ...cat, startPercent: start, endPercent: accumulatedPercent };
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Topo com Renda Mensal */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Renda da Casa Mapeada</span>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">R$</span>
              <input
                type="number"
                value={rendaMensal}
                onChange={(e) => setRendaMensal(Number(e.target.value))}
                className="text-3xl font-extrabold text-slate-900 bg-transparent w-40 focus:outline-none border-b-2 border-emerald-500"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Soma do salário CLT + Vendas do Mercado Livre</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setAbaAtiva('planejamento')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                abaAtiva === 'planejamento' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Círculo & Sliders
            </button>
            <button
              onClick={() => setAbaAtiva('dividas')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                abaAtiva === 'dividas' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Gastos Fixos & Dívidas
            </button>
          </div>
        </div>

        {/* ABA PRINCIPAL: CÍRCULO DINÂMICO + SLIDERS */}
        {abaAtiva === 'planejamento' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            
            {/* LADO ESQUERDO: CÍRCULO INTERATIVO */}
            <div className="md:col-span-5 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Fundo Cinza */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="12" />
                  
                  {/* Fatias Coloridas que Crescem Conforme os Sliders */}
                  {slices.map(slice => {
                    if (slice.percent <= 0) return null;
                    const strokeDasharray = `${slice.percent * 2.51327} 251.327`;
                    const strokeDashoffset = `-${slice.startPercent * 2.51327}`;

                    return (
                      <circle
                        key={slice.id}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={slice.cor}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300 ease-out"
                      />
                    );
                  })}
                </svg>

                {/* Texto Centralizado dentro do Círculo */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <span className="text-3xl font-extrabold text-slate-900">{totalPercent}%</span>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {totalPercent === 100 ? 'Renda Mapeada' : 'Ajustando'}
                  </span>
                </div>
              </div>

              <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                totalPercent === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {totalPercent === 100 ? '✅ 100% da renda preenchida' : `⚠️ Falta/Excede ${100 - totalPercent}%`}
              </div>
            </div>

            {/* LADO DIREITO: CONTROLES DESLIZANTES (SLIDERS) */}
            <div className="md:col-span-7 space-y-5">
              <h3 className="font-bold text-lg text-slate-900 border-b pb-3 border-slate-100">
                Arraste os sliders para preencher o círculo:
              </h3>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                {categorias.map(cat => {
                  const Icone = cat.icone;
                  const valorCalculado = (rendaMensal * cat.percent) / 100;

                  return (
                    <div key={cat.id} className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <div className="flex items-center space-x-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.cor }}></span>
                          <Icone className="w-4 h-4 text-slate-600" />
                          <span className="text-slate-800">{cat.nome}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-900 font-extrabold">R$ {valorCalculado.toLocaleString('pt-BR')}</span>
                          <span className="text-slate-400 ml-1">({cat.percent}%)</span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={cat.percent}
                        onChange={(e) => handlePercentChange(cat.id as any, Number(e.target.value))}
                        style={{ accentColor: cat.cor }}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ABA DE DÍVIDAS E GASTOS FIXOS */}
        {abaAtiva === 'dividas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Gastos Fixos */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" /> Gastos Fixos da Casa
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

            {/* Dívidas e Duração */}
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
