import React, { useState } from 'react';
import { 
  Heart, 
  Gamepad2, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Calendar, 
  Church, 
  CreditCard, 
  ShoppingBag
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
  
  // Categorias Diretas
  const [dizimoPercent, setDizimoPercent] = useState<number>(10);
  const [desfruteMarido, setDesfruteMarido] = useState<number>(200);
  const [desfruteEsposa, setDesfruteEsposa] = useState<number>(200);
  const [investimentoML, setInvestimentoML] = useState<number>(400);

  // Lista de Gastos Fixos Editáveis
  const [gastosFixos, setGastosFixos] = useState<GastoFixo[]>([
    { id: '1', nome: 'Supermercado', valor: 500 },
    { id: '2', nome: 'Luz e Água', valor: 150 },
  ]);
  const [novoGastoNome, setNovoGastoNome] = useState('');
  const [novoGastoValor, setNovoGastoValor] = useState<number | ''>('');

  // Lista de Dívidas com Duração
  const [dividas, setDividas] = useState<Divida[]>([
    { id: '1', nome: 'Cartão de Crédito (Geladeira)', valorParcela: 180, parcelasRestantes: 6, valorTotalRestante: 1080 },
  ]);
  const [novaDividaNome, setNovaDividaNome] = useState('');
  const [novaDividaParcela, setNovaDividaParcela] = useState<number | ''>('');
  const [novaDividaQtdParcelas, setNovaDividaQtdParcelas] = useState<number | ''>('');

  // Cálculos Automáticos
  const valorDizimo = (rendaMensal * dizimoPercent) / 100;
  const totalGastosFixos = gastosFixos.reduce((acc, g) => acc + g.valor, 0);
  const totalDividasMensal = dividas.reduce((acc, d) => acc + d.valorParcela, 0);
  const totalComprometido = valorDizimo + desfruteMarido + desfruteEsposa + investimentoML + totalGastosFixos + totalDividasMensal;
  const saldoLivre = rendaMensal - totalComprometido;

  // Funções de Ação
  const adicionarGastoFixo = () => {
    if (!novoGastoNome || !novoGastoValor) return;
    setGastosFixos([...gastosFixos, { id: Date.now().toString(), nome: novoGastoNome, valor: Number(novoGastoValor) }]);
    setNovoGastoNome('');
    setNovoGastoValor('');
  };

  const removerGastoFixo = (id: string) => {
    setGastosFixos(gastosFixos.filter(g => g.id !== id));
  };

  const adicionarDivida = () => {
    if (!novaDividaNome || !novaDividaParcela || !novaDividaQtdParcelas) return;
    const p = Number(novaDividaParcela);
    const q = Number(novaDividaQtdParcelas);
    setDividas([...dividas, { 
      id: Date.now().toString(), 
      nome: novaDividaNome, 
      valorParcela: p, 
      parcelasRestantes: q, 
      valorTotalRestante: p * q 
    }]);
    setNovaDividaNome('');
    setNovaDividaParcela('');
    setNovaDividaQtdParcelas('');
  };

  const removerDivida = (id: string) => {
    setDividas(dividas.filter(d => d.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      {/* Resumo da Renda */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Renda Mensal Total (CLT + Loja)</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-2xl font-bold text-slate-400">R$</span>
            <input
              type="number"
              value={rendaMensal}
              onChange={(e) => setRendaMensal(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-2xl font-extrabold text-white w-40 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex space-x-4 text-center">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Comprometido</span>
            <span className="text-lg font-bold text-amber-400">R$ {totalComprometido.toLocaleString('pt-BR')}</span>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Sobra Livre</span>
            <span className={`text-lg font-bold ${saldoLivre >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              R$ {saldoLivre.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Blocos Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bloco 1: Dízimo e Desfrutes */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" /> Planejamento Familiar
          </h2>

          <div className="space-y-3 text-sm">
            {/* Dízimo */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Church className="w-4 h-4 text-amber-500" />
                <span className="text-slate-200 font-medium">Dízimo ({dizimoPercent}%)</span>
              </div>
              <span className="font-bold text-white">R$ {valorDizimo.toLocaleString('pt-BR')}</span>
            </div>

            {/* Desfrute Marido */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Gamepad2 className="w-4 h-4 text-blue-400" />
                <span className="text-slate-200 font-medium">Desfrute Marido</span>
              </div>
              <input
                type="number"
                value={desfruteMarido}
                onChange={(e) => setDesfruteMarido(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-white w-24 font-mono"
              />
            </div>

            {/* Desfrute Esposa */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-slate-200 font-medium">Desfrute Esposa</span>
              </div>
              <input
                type="number"
                value={desfruteEsposa}
                onChange={(e) => setDesfruteEsposa(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-white w-24 font-mono"
              />
            </div>

            {/* Investimento Loja */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-200 font-medium">Investir no Mercado Livre</span>
              </div>
              <input
                type="number"
                value={investimentoML}
                onChange={(e) => setInvestimentoML(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-white w-24 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Gastos Fixos Editáveis */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-orange-400" /> Gastos Fixos da Casa
          </h2>

          <div className="space-y-2 max-h-52 overflow-y-auto">
            {gastosFixos.map(gasto => (
              <div key={gasto.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-sm">
                <span className="text-slate-200">{gasto.nome}</span>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-white">R$ {gasto.valor.toLocaleString('pt-BR')}</span>
                  <button onClick={() => removerGastoFixo(gasto.id)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Adicionar Novo Gasto Fixo */}
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="Nome do gasto"
              value={novoGastoNome}
              onChange={(e) => setNovoGastoNome(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white flex-1"
            />
            <input
              type="number"
              placeholder="Valor R$"
              value={novoGastoValor}
              onChange={(e) => setNovoGastoValor(e.target.value === '' ? '' : Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white w-24"
            />
            <button onClick={adicionarGastoFixo} className="bg-amber-500 text-slate-950 p-2 rounded-lg font-bold">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bloco 3: Dívidas e Duração */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-rose-400" /> Dívidas e Financiamentos (Duração)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dividas.map(divida => (
            <div key={divida.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">{divida.nome}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    Faltam <strong>{divida.parcelasRestantes} meses</strong> para quitar
                  </p>
                </div>
                <button onClick={() => removerDivida(divida.id)} className="text-slate-500 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-900">
                <span className="text-slate-400">Parcela mensal: <strong className="text-white">R$ {divida.valorParcela}</strong></span>
                <span className="text-slate-400">Saldo devedor: <strong className="text-rose-400">R$ {divida.valorTotalRestante}</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* Adicionar Nova Dívida */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800">
          <input
            type="text"
            placeholder="Ex: Empréstimo, Cartão"
            value={novaDividaNome}
            onChange={(e) => setNovaDividaNome(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white flex-1 min-w-[150px]"
          />
          <input
            type="number"
            placeholder="Valor/mês R$"
            value={novaDividaParcela}
            onChange={(e) => setNovaDividaParcela(e.target.value === '' ? '' : Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white w-28"
          />
          <input
            type="number"
            placeholder="Nº de parcelas"
            value={novaDividaQtdParcelas}
            onChange={(e) => setNovaDividaQtdParcelas(e.target.value === '' ? '' : Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white w-28"
          />
          <button onClick={adicionarDivida} className="bg-rose-500 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1">
            <Plus className="w-4 h-4" /> Adicionar Dívida
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceCenterView;
