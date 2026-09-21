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
  Vault,
  Sparkles,
  LayoutGrid,
  Columns2,
  LogOut,
  Target,
  ArrowUpRight
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDQTXuzRMDP4vtpvpzvkTBd5Cl_0_aCM5g",
  authDomain: "imperioecommerce-mineirador.firebaseapp.com",
  projectId: "imperioecommerce-mineirador",
  storageBucket: "imperioecommerce-mineirador.firebasestorage.app",
  messagingSenderId: "805172672001",
  appId: "1:805172672001:web:77e71eddea97aa9550f200"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

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
  valorGuardado: number;
  meses: number;
}

interface ItemPatrimonio {
  id: string;
  nome: string;
  valor: number;
  tipo: 'automatico' | 'manual';
}

interface FinanceCenterViewProps {
  emailUsuario?: string;
  onLogout?: () => void;
}

export const FinanceCenterView: React.FC<FinanceCenterViewProps> = ({ onLogout }) => {
  const docId = 'familia_imperio';

  const [telaAtiva, setTelaAtiva] = useState<'onboarding' | 'dashboard' | 'extrato' | 'patrimonio' | 'metas' | 'dividas' | 'perfil'>('dashboard');
  const [carregandoNuvem, setCarregandoNuvem] = useState<boolean>(true);

  const navegarPara = (tela: 'onboarding' | 'dashboard' | 'extrato' | 'patrimonio' | 'metas' | 'dividas' | 'perfil') => {
    setTelaAtiva(tela);
    setMenuAberto(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [rendaMensal, setRendaMensal] = useState<number>(0);
  const [aportePendenteValor, setAportePendenteValor] = useState<number | ''>('');
  const [contasFixasObrigatorias, setContasFixasObrigatorias] = useState<ContaFixa[]>([]);
  const [potesAtivos, setPotesAtivos] = useState<Pote[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [itensPatrimonioManuais, setItensPatrimonioManuais] = useState<ItemPatrimonio[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);

  const [tema, setTema] = useState<'claro' | 'escuro'>('escuro');
  const [tamparValores, setTamparValores] = useState<boolean>(false);
  const [menuAberto, setMenuAberto] = useState<boolean>(false);
  const [modoVisualizacaoPotes, setModoVisualizacaoPotes] = useState<'grid' | 'coluna'>('coluna');
  const [modalAportePendente, setModalAportePendente] = useState<boolean>(false);

  const todosPotesDisponiveis: Pote[] = [
    { id: 'nosso_patrimonio', nome: 'Nosso Patrimônio', percentual: 0, cor: '#10B981', iconeEmoji: '🐷', retencaoAutomatica: true },
    { id: 'patrimonio_manuela', nome: 'Poupança Manuela (Futuro Filha)', percentual: 0, cor: '#06B6D4', iconeEmoji: '👶', retencaoAutomatica: true },
    { id: 'supermercado', nome: 'Supermercado', percentual: 0, cor: '#F97316', iconeEmoji: '🧺' },
    { id: 'transporte', nome: 'Transporte', percentual: 0, cor: '#3B82F6', iconeEmoji: '🚗' },
    { id: 'desfrute_familia', nome: 'Desfrute Família', percentual: 0, cor: '#8B5CF6', iconeEmoji: '🎮' },
    { id: 'dizimo', nome: 'Dízimo', percentual: 0, cor: '#84CC16', iconeEmoji: '✉️', retencaoAutomatica: true },
  ];

  useEffect(() => {
    const docRef = doc(db, 'imperio_finance', docId);
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const dados = docSnapshot.data();
        setRendaMensal(dados.rendaMensal ?? 0);
        setAportePendenteValor(dados.aportePendenteValor ?? '');
        setContasFixasObrigatorias(dados.contasFixasObrigatorias ?? []);
        setPotesAtivos(dados.potesAtivos ?? []);
        setTransacoes(dados.transacoes ?? []);
        setItensPatrimonioManuais(dados.itensPatrimonioManuais ?? []);
        setMetas(dados.metas ?? []);

        if (!dados.potesAtivos || dados.potesAtivos.length === 0) {
          setTelaAtiva('onboarding');
        }
      } else {
        setTelaAtiva('onboarding');
      }
      setCarregandoNuvem(false);
    }, (error) => {
      console.error("Erro ao sincronizar com o Firebase:", error);
      setCarregandoNuvem(false);
    });

    return () => unsubscribe();
  }, [docId]);

  const salvarDadosNaNuvem = async (novosDados: {
    rendaMensal?: number;
    aportePendenteValor?: number | '';
    contasFixasObrigatorias?: ContaFixa[];
    potesAtivos?: Pote[];
    transacoes?: Transacao[];
    itensPatrimonioManuais?: ItemPatrimonio[];
    metas?: Meta[];
  }) => {
    try {
      const docRef = doc(db, 'imperio_finance', docId);
      await setDoc(docRef, {
        rendaMensal,
        aportePendenteValor,
        contasFixasObrigatorias,
        potesAtivos,
        transacoes,
        itensPatrimonioManuais,
        metas,
        ...novosDados
      }, { merge: true });
    } catch (error) {
      console.error("Erro ao salvar dados no Firebase:", error);
    }
  };

  const [potePendente, setPotePendente] = useState<Pote | null>(null);
  const [percentualPendente, setPercentualPendente] = useState<number>(10);
  
  const [novaContaNome, setNovaContaNome] = useState('');
  const [novaContaValor, setNovaContaValor] = useState<number | ''>('');
  const [novaContaMeses, setNovaContaMeses] = useState<number | ''>('');

  const [modalLancamento, setModalLancamento] = useState<boolean>(false);
  const [tipoLancamento, setTipoLancamento] = useState<'saida' | 'entrada'>('saida');
  const [valorLancamento, setValorLancamento] = useState<number | ''>('');
  const [origemEntradaModal, setOrigemEntradaModal] = useState<'CLT' | 'Mercado Livre'>('Mercado Livre');
  const [categoriaSaidaSelecionada, setCategoriaSaidaSelecionada] = useState<string>('Supermercado / Compras');
  const [poteSelecionadoId, setPoteSelecionadoId] = useState<string>('divida_fixa');

  const [filtroExtrato, setFiltroExtrato] = useState<'todos' | 'entradas' | 'saidas'>('todos');
  const [modalNovoPatrimonio, setModalNovoPatrimonio] = useState<boolean>(false);
  const [nomeNovoPatrimonio, setNomeNovoPatrimonio] = useState('');
  const [valorNovoPatrimonio, setValorNovoPatrimonio] = useState<number | ''>('');

  const [modalNovaMeta, setModalNovaMeta] = useState<boolean>(false);
  const [nomeNovaMeta, setNomeNovaMeta] = useState('');
  const [valorNovaMeta, setValorNovaMeta] = useState<number | ''>('');
  const [guardadoNovaMeta, setGuardadoNovaMeta] = useState<number | ''>('');
  const [mesesNovaMeta, setMesesNovaMeta] = useState<number | ''>('');

  const [modalDepositoMeta, setModalDepositoMeta] = useState<boolean>(false);
  const [metaSelecionadaId, setMetaSelecionadaId] = useState<string>('');
  const [valorDepositoMeta, setValorDepositoMeta] = useState<number | ''>('');
  const [origemDepositoMeta, setOrigemDepositoMeta] = useState<'disponivel' | 'nosso_patrimonio' | 'patrimonio_manuela'>('disponivel');

  const [animacaoEntrada, setAnimacaoEntrada] = useState<{
    ativo: boolean;
    valorTotal: number;
    detalhes: { nome: string; icone: string; valor: number; percentual: number; cor: string }[];
  } | null>(null);

  const reiniciarSistemaGeral = async () => {
    if (window.confirm("Deseja realmente reiniciar o plano? Todos os dados e transações serão limpos.")) {
      const dadosVazios = {
        rendaMensal: 0,
        aportePendenteValor: '',
        contasFixasObrigatorias: [],
        potesAtivos: [],
        transacoes: [],
        itensPatrimonioManuais: [],
        metas: []
      };
      await salvarDadosNaNuvem(dadosVazios);
      setTelaAtiva('onboarding');
      setMenuAberto(false);
    }
  };

  const totalContasFixasValor = contasFixasObrigatorias.reduce((acc, c) => acc + c.valor, 0);
  const percentualComprometidoDividas = rendaMensal > 0 ? (totalContasFixasValor / rendaMensal) * 100 : 0;
  const rendaRestanteAposDividas = Math.max(0, rendaMensal - totalContasFixasValor);

  const totalMapeado = potesAtivos.reduce((acc, p) => acc + p.percentual, 0);
  const disponivelGeral = Math.max(0, 100 - totalMapeado);

  const valorAporteNumerico = aportePendenteValor !== '' ? Number(aportePendenteValor) : 0;
  const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0) + valorAporteNumerico;
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  
  // Percentual total de retenções automáticas ativas
  const percentualRetencaoTotal = potesAtivos
    .filter(p => p.retencaoAutomatica)
    .reduce((acc, p) => acc + p.percentual, 0);

  // Valor total retido automaticamente com base em todas as entradas registradas
  const valorTotalEntradasBrutas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const valorRetidoAutomaticoAcumulado = (valorTotalEntradasBrutas * percentualRetencaoTotal) / 100;

  // Saldo Real Disponível desconta as saídas manuais e as retenções automáticas de poupança/patrimônio/dízimo
  const saldoUnicoReal = (totalEntradas - valorRetidoAutomaticoAcumulado) - totalSaidas;

  const poteNossoPatrimonio = potesAtivos.find(p => p.id === 'nosso_patrimonio');
  const pctNossoPatrimonio = poteNossoPatrimonio ? poteNossoPatrimonio.percentual : 0;
  const saldoNossoPatrimonio = (rendaRestanteAposDividas * pctNossoPatrimonio) / 100;

  const potePatrimonioManuela = potesAtivos.find(p => p.id === 'patrimonio_manuela');
  const pctPatrimonioManuela = potePatrimonioManuela ? potePatrimonioManuela.percentual : 0;
  const saldoPatrimonioManuela = (rendaRestanteAposDividas * pctPatrimonioManuela) / 100;

  const totalPatrimonioManual = itensPatrimonioManuais.reduce((acc, item) => acc + item.valor, 0);
  const patrimonioTotalConsolidado = saldoNossoPatrimonio + saldoPatrimonioManuela + totalPatrimonioManual;

  const adicionarContaFixaObrigatoria = async () => {
    if (!novaContaNome || !novaContaValor || Number(novaContaValor) <= 0 || !novaContaMeses || Number(novaContaMeses) <= 0) return;
    const meses = Number(novaContaMeses);
    const novasContas = [...contasFixasObrigatorias, {
      id: Date.now().toString(),
      nome: novaContaNome,
      valor: Number(novaContaValor),
      mesesTotales: meses,
      mesesRestantes: meses
    }];
    setContasFixasObrigatorias(novasContas);
    setNovaContaNome('');
    setNovaContaValor('');
    setNovaContaMeses('');
    await salvarDadosNaNuvem({ contasFixasObrigatorias: novasContas });
  };

  const removerContaFixaObrigatoria = async (id: string) => {
    const novasContas = contasFixasObrigatorias.filter(c => c.id !== id);
    setContasFixasObrigatorias(novasContas);
    await salvarDadosNaNuvem({ contasFixasObrigatorias: novasContas });
  };

  const pagarParcelaDivida = async (idConta: string) => {
    const conta = contasFixasObrigatorias.find(c => c.id === idConta);
    if (!conta || conta.mesesRestantes <= 0) return;

    if (window.confirm(`Registrar pagamento de ${formatarGrana(conta.valor)} para "${conta.nome}"? O valor sairá do saldo e abaterá 1 mês.`)) {
      const novasContas = contasFixasObrigatorias.map(c => {
        if (c.id === idConta) {
          return { ...c, mesesRestantes: Math.max(0, c.mesesRestantes - 1) };
        }
        return c;
      });

      const novaSaida: Transacao = {
        id: Date.now().toString(),
        descricao: `Pagamento Dívida: ${conta.nome}`,
        valor: conta.valor,
        tipo: 'saida',
        poteId: 'divida_fixa',
        poteNome: 'Direto do Saldo (Dívida / Conta)',
        data: new Date().toLocaleDateString('pt-BR')
      };

      const novasTransacoes = [novaSaida, ...transacoes];

      setContasFixasObrigatorias(novasContas);
      setTransacoes(novasTransacoes);

      await salvarDadosNaNuvem({ 
        contasFixasObrigatorias: novasContas, 
        transacoes: novasTransacoes 
      });
    }
  };

  const solicitarAdicaoPote = (pote: Pote) => {
    if (!potesAtivos.some(p => p.id === pote.id)) {
      if (disponivelGeral <= 0) {
        alert("100% do saldo restante já foi mapeado! Reduza a porcentagem de outro pote primeiro.");
        return;
      }
      setPotePendente(pote);
      setPercentualPendente(Math.min(10, disponivelGeral));
    }
  };

  const confirmarAdicionarPote = async () => {
    if (potePendente) {
      const poteAtualizado = {
        ...potePendente,
        percentual: percentualPendente
      };
      const novoConjunto = [...potesAtivos.filter(p => p.id !== potePendente.id), poteAtualizado];
      const somaNova = novoConjunto.reduce((acc, p) => acc + p.percentual, 0);
      if (somaNova > 100) {
        alert("A soma dos potes não pode ultrapassar 100%!");
        return;
      }
      setPotesAtivos(novoConjunto);
      setPotePendente(null);
      await salvarDadosNaNuvem({ potesAtivos: novoConjunto });
    }
  };

  const removerPote = async (id: string) => {
    const novoConjunto = potesAtivos.filter(p => p.id !== id);
    setPotesAtivos(novoConjunto);
    await salvarDadosNaNuvem({ potesAtivos: novoConjunto });
  };

  const processarEntradaComAnimacao = async (valor: number, origem: 'CLT' | 'Mercado Livre') => {
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
    const novasTransacoes = [novaEntrada, ...transacoes];
    setTransacoes(novasTransacoes);

    const detalhes = potesAtivos.map(pote => ({
      nome: pote.nome,
      icone: pote.iconeEmoji,
      valor: (rendaRestanteAposDividas * pote.percentual) / 100,
      percentual: pote.percentual,
      cor: pote.cor
    }));

    setAnimacaoEntrada({
      ativo: true,
      valorTotal: valor,
      detalhes
    });

    await salvarDadosNaNuvem({ transacoes: novasTransacoes });
  };

  const salvarLancamento = async () => {
    if (!valorLancamento || Number(valorLancamento) <= 0) return;
    const valorGasto = Number(valorLancamento);

    if (tipoLancamento === 'entrada') {
      await processarEntradaComAnimacao(valorGasto, origemEntradaModal);
      setValorLancamento(''); setModalLancamento(false);
    } else {
      // TRAVA DE SEGURANÇA DE GASTOS
      if (poteSelecionadoId !== 'divida_fixa') {
        const poteAlvo = potesAtivos.find(p => p.id === poteSelecionadoId);
        if (poteAlvo) {
          const valorDiluidoNoPote = (rendaRestanteAposDividas * poteAlvo.percentual) / 100;
          const gastosPote = transacoes.filter(t => t.tipo === 'saida' && t.poteId === poteAlvo.id).reduce((acc, t) => acc + t.valor, 0);
          const saldoDisponivelNoPote = poteAlvo.retencaoAutomatica ? valorDiluidoNoPote : Math.max(0, valorDiluidoNoPote - gastosPote);

          if (!poteAlvo.retencaoAutomatica && valorGasto > saldoDisponivelNoPote) {
            alert(`⚠️ Trava de Segurança Ativada!\n\nO valor do gasto (${formatarGrana(valorGasto)}) é superior ao saldo disponível no pote "${poteAlvo.nome}" (${formatarGrana(saldoDisponivelNoPote)}). Reduza o valor ou ajuste o orçamento.`);
            return;
          }
        }
      }

      const poteAlvo = potesAtivos.find(p => p.id === poteSelecionadoId);
      const nomePoteFinal = poteAlvo ? poteAlvo.nome : 'Gasto Geral';

      const novaSaida: Transacao = {
        id: Date.now().toString(),
        descricao: categoriaSaidaSelecionada,
        valor: valorGasto,
        tipo: 'saida',
        poteId: poteSelecionadoId,
        poteNome: nomePoteFinal,
        data: new Date().toLocaleDateString('pt-BR')
      };
      const novasTransacoes = [novaSaida, ...transacoes];
      setTransacoes(novasTransacoes);
      setValorLancamento(''); setModalLancamento(false);
      await salvarDadosNaNuvem({ transacoes: novasTransacoes });
    }
  };

  const adicionarPatrimonioManual = async () => {
    if (!nomeNovoPatrimonio || !valorNovoPatrimonio || Number(valorNovoPatrimonio) <= 0) return;
    const novosItens = [...itensPatrimonioManuais, {
      id: Date.now().toString(),
      nome: nomeNovoPatrimonio,
      valor: Number(valorNovoPatrimonio),
      tipo: 'manual' as const
    }];
    setItensPatrimonioManuais(novosItens);
    setNomeNovoPatrimonio(''); setValorNovoPatrimonio(''); setModalNovoPatrimonio(false);
    await salvarDadosNaNuvem({ itensPatrimonioManuais: novosItens });
  };

  const removerPatrimonioManual = async (id: string) => {
    const novosItens = itensPatrimonioManuais.filter(x => x.id !== id);
    setItensPatrimonioManuais(novosItens);
    await salvarDadosNaNuvem({ itensPatrimonioManuais: novosItens });
  };

  const adicionarMeta = async () => {
    if (!nomeNovaMeta || !valorNovaMeta || Number(valorNovaMeta) <= 0 || !mesesNovaMeta || Number(mesesNovaMeta) <= 0) return;
    const valorGuardadoInicial = guardadoNovaMeta !== '' ? Number(guardadoNovaMeta) : 0;

    let novasTransacoes = [...transacoes];
    if (valorGuardadoInicial > 0) {
      if (valorGuardadoInicial > saldoUnicoReal) {
        alert("O valor inicial guardado não pode ser maior que o Saldo Real disponível!");
        return;
      }
      const novaSaida: Transacao = {
        id: Date.now().toString(),
        descricao: `Aporte inicial Meta: ${nomeNovaMeta}`,
        valor: valorGuardadoInicial,
        tipo: 'saida',
        poteId: 'meta_aporte',
        poteNome: `Meta: ${nomeNovaMeta}`,
        data: new Date().toLocaleDateString('pt-BR')
      };
      novasTransacoes = [novaSaida, ...novasTransacoes];
      setTransacoes(novasTransacoes);
    }

    const novasMetas = [...metas, {
      id: Date.now().toString(),
      nome: nomeNovaMeta,
      valorAlvo: Number(valorNovaMeta),
      valorGuardado: valorGuardadoInicial,
      meses: Number(mesesNovaMeta)
    }];
    setMetas(novasMetas);

    setNomeNovaMeta(''); setValorNovaMeta(''); setGuardadoNovaMeta(''); setMesesNovaMeta(''); setModalNovaMeta(false);
    await salvarDadosNaNuvem({ metas: novasMetas, transacoes: novasTransacoes });
  };

  const removerMeta = async (id: string) => {
    const novasMetas = metas.filter(m => m.id !== id);
    setMetas(novasMetas);
    await salvarDadosNaNuvem({ metas: novasMetas });
  };

  const efetivarTransferenciaMeta = async () => {
    if (!metaSelecionadaId || valorDepositoMeta === '' || Number(valorDepositoMeta) <= 0) return;
    const valorTransf = Number(valorDepositoMeta);

    let novasTransacoes = [...transacoes];
    if (origemDepositoMeta === 'disponivel') {
      if (valorTransf > saldoUnicoReal) {
        alert("Valor superior ao Saldo Real disponível!");
        return;
      }
      const novaSaida: Transacao = {
        id: Date.now().toString(),
        descricao: `Transferência para Meta`,
        valor: valorTransf,
        tipo: 'saida',
        poteId: 'meta_transf',
        poteNome: 'Depósito em Meta',
        data: new Date().toLocaleDateString('pt-BR')
      };
      novasTransacoes = [novaSaida, ...novasTransacoes];
    } else {
      const nomeOrigemPatri = origemDepositoMeta === 'nosso_patrimonio' ? 'Nosso Patrimônio' : 'Poupança Manuela';
      const saldoMaxPatri = origemDepositoMeta === 'nosso_patrimonio' ? saldoNossoPatrimonio : saldoPatrimonioManuela;

      if (valorTransf > saldoMaxPatri) {
        alert(`Valor superior ao disponível em ${nomeOrigemPatri}!`);
        return;
      }

      const saidaPatri: Transacao = {
        id: Date.now().toString(),
        descricao: `Resgate de ${nomeOrigemPatri} para Meta`,
        valor: valorTransf,
        tipo: 'saida',
        poteId: origemDepositoMeta,
        poteNome: nomeOrigemPatri,
        data: new Date().toLocaleDateString('pt-BR')
      };
      novasTransacoes = [saidaPatri, ...novasTransacoes];
    }

    setTransacoes(novasTransacoes);
    const novasMetas = metas.map(m => m.id === metaSelecionadaId ? { ...m, valorGuardado: m.valorGuardado + valorTransf } : m);
    setMetas(novasMetas);

    setModalDepositoMeta(false);
    setValorDepositoMeta('');
    setMetaSelecionadaId('');
    await salvarDadosNaNuvem({ metas: novasMetas, transacoes: novasTransacoes });
  };

  const removerTransacao = async (id: string) => {
    const novasTransacoes = transacoes.filter(x => x.id !== id);
    setTransacoes(novasTransacoes);
    await salvarDadosNaNuvem({ transacoes: novasTransacoes });
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

  if (carregandoNuvem) {
    return (
      <div className={`min-h-screen ${bgClasse} flex items-center justify-center font-bold text-sm`}>
        Carregando...
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClasse} font-sans tracking-tight flex flex-col justify-between transition-colors duration-300 pb-28 select-none`}>
      
      <header className={`p-3 md:p-4 border-b flex justify-between items-center sticky top-0 z-30 transition-colors duration-300 ${isDark ? 'border-slate-800 bg-[#0B0F17]/90 backdrop-blur-md' : 'border-slate-200 bg-white/90 backdrop-blur-md'}`}>
        <div className="flex items-center space-x-2">
          <span className="text-xl md:text-2xl font-black text-emerald-500 tracking-tight">MEU IMPÉRIO</span>
          <span className="text-[9px] md:text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold uppercase">Real-Time</span>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => setTamparValores(!tamparValores)} className={`p-2 md:p-2.5 rounded-2xl border ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'} hover:text-emerald-500 transition-all cursor-pointer`}>
            {tamparValores ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={() => setTema(isDark ? 'claro' : 'escuro')} className={`p-2 md:p-2.5 rounded-2xl border ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'} hover:text-emerald-500 transition-all cursor-pointer`}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMenuAberto(!menuAberto)} className="p-2 md:p-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black shadow-md shadow-emerald-500/20 transition-all cursor-pointer">
            <Menu className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      {telaAtiva === 'onboarding' && (
        <main className="max-w-4xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              {potesAtivos.length > 0 ? 'Editar Plano Financeiro' : 'Montar seu Plano Financeiro'}
            </h1>
            <button onClick={reiniciarSistemaGeral} className="text-xs text-rose-400 hover:text-rose-500 font-bold underline cursor-pointer">
              Reiniciar Sistema Zera Tudo
            </button>
          </div>

          <div className={`${cardClasse} rounded-3xl p-4 md:p-6 space-y-4`}>
            <div className="flex justify-between items-center">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider block ${textMuted}`}>Meta de Renda Mensal</span>
                <span className={`text-[10px] md:text-[11px] ${textMuted}`}>Ponto de partida dos cálculos</span>
              </div>
              <div className="flex items-center text-lg md:text-xl font-black">
                <span className={`text-xs md:text-sm mr-1 ${textMuted}`}>R$</span>
                <input
                  type="number"
                  value={rendaMensal === 0 ? '' : rendaMensal}
                  placeholder="0"
                  onChange={async (e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                    setRendaMensal(val);
                    await salvarDadosNaNuvem({ rendaMensal: val });
                  }}
                  className="w-24 md:w-32 text-right bg-transparent focus:outline-none border-b-2 border-emerald-500 font-black"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider block ${textMuted}`}>Valor Inicial / Aporte em Caixa</span>
                <span className={`text-[10px] md:text-[11px] ${textMuted}`}>Deixe 0 se não houver aporte inicial</span>
              </div>
              <div className="flex items-center text-lg md:text-xl font-black">
                <span className={`text-xs md:text-sm mr-1 ${textMuted}`}>R$</span>
                <input
                  type="number"
                  value={aportePendenteValor === 0 ? '' : aportePendenteValor}
                  placeholder="0"
                  onChange={async (e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setAportePendenteValor(val);
                    await salvarDadosNaNuvem({ aportePendenteValor: val });
                  }}
                  className="w-24 md:w-32 text-right bg-transparent focus:outline-none border-b-2 border-emerald-500 font-black"
                />
              </div>
            </div>
          </div>

          <div className={`${cardClasse} rounded-3xl p-4 md:p-6 space-y-4 border-2 border-rose-500/20`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-rose-400">Passo 1: Dívidas & Contas Fixas (Em R$)</h3>
                <span className={`text-xs ${textMuted}`}>Insira os valores exatos para subtrair da renda primeiro.</span>
              </div>
              <span className="text-xs font-mono font-black text-rose-400">{formatarGrana(totalContasFixasValor)} ({percentualComprometidoDividas.toFixed(1)}% da renda)</span>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nome da Dívida / Conta Fixa (Ex: Aluguel, Empréstimo)"
                value={novaContaNome}
                onChange={(e) => setNovaContaNome(e.target.value)}
                className={`w-full ${inputBg} p-3 rounded-2xl text-xs font-bold border`}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Valor Mensal R$"
                  value={novaContaValor}
                  onChange={(e) => setNovaContaValor(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-full ${inputBg} p-3 rounded-2xl text-xs font-bold border font-mono`}
                />
                <input
                  type="number"
                  placeholder="Duração (Meses)"
                  value={novaContaMeses}
                  onChange={(e) => setNovaContaMeses(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-full ${inputBg} p-3 rounded-2xl text-xs font-bold border font-mono`}
                />
              </div>
              <button
                type="button"
                onClick={adicionarContaFixaObrigatoria}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Adicionar Dívida / Conta Fixa
              </button>
            </div>

            {contasFixasObrigatorias.length > 0 && (
              <div className="space-y-2 pt-2 max-h-48 overflow-y-auto">
                {contasFixasObrigatorias.map(c => (
                  <div key={c.id} className={`${inputBg} p-3 rounded-2xl flex justify-between items-center text-xs border`}>
                    <div>
                      <span className="font-black block">{c.nome}</span>
                      <span className="text-[10px] text-slate-400">{formatarGrana(c.valor)}/mês • {c.mesesTotales} meses</span>
                    </div>
                    <button onClick={() => removerContaFixaObrigatoria(c.id)} className="text-rose-500 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-xs font-bold">
              <span>Renda Restante após Dívidas:</span>
              <span className="font-mono font-black text-emerald-400 text-sm">{formatarGrana(rendaRestanteAposDividas)}</span>
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
              <h3 className="text-base font-black">Passo 2: Dividir o Restante ({formatarGrana(rendaRestanteAposDividas)})</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 w-full">
                {potesAtivos.map(pote => (
                  <div 
                    key={pote.id} 
                    onClick={() => {
                      setPotePendente(pote);
                      setPercentualPendente(pote.percentual);
                    }}
                    className={`${cardClasse} p-3.5 rounded-2xl flex flex-col items-center text-center cursor-pointer relative group transition-all active:scale-95 hover:border-emerald-500/50`}
                  >
                    <button onClick={(e) => { e.stopPropagation(); removerPote(pote.id); }} className="absolute top-1.5 right-1.5 text-slate-400 hover:text-rose-500 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-2xl md:text-3xl mb-1">{pote.iconeEmoji}</span>
                    <span className="text-[11px] md:text-xs font-bold truncate w-full">{pote.nome}</span>
                    <span className="text-xs font-black text-emerald-500">{pote.percentual}%</span>
                  </div>
                ))}
              </div>

              {totalMapeado === 100 ? (
                <button 
                  onClick={async () => {
                    navegarPara('dashboard');
                  }} 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all text-sm md:text-base cursor-pointer"
                >
                  Salvar Plano e Ir para o Painel
                </button>
              ) : (
                <div className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold py-3 px-4 rounded-2xl text-center">
                  ⚠️ A soma dos potes do restante precisa atingir exatamente 100% ({totalMapeado}% preenchido).
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className={`text-xs font-bold text-center md:text-left ${textMuted}`}>Adicionar potes para dividir o restante:</p>
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

      {potePendente && (() => {
        const outrosPotesSoma = potesAtivos.filter(p => p.id !== potePendente.id).reduce((acc, p) => acc + p.percentual, 0);
        const maxPermitido = 100 - outrosPotesSoma;
        const valorMapeadoPote = (rendaRestanteAposDividas * percentualPendente) / 100;

        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className={`${cardClasse} rounded-3xl p-5 md:p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative`}>
              <button onClick={() => setPotePendente(null)} className="absolute top-4 right-4 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl">
                {potePendente.iconeEmoji}
              </div>

              <div>
                <h3 className="text-base md:text-lg font-black">{potePendente.nome}</h3>
                <span className="text-xs text-slate-400">Porcentagem do saldo restante (Máx: {maxPermitido}%)</span>
              </div>

              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className={`w-24 h-24 rounded-full border-8 border-emerald-500 flex flex-col items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-100'} shadow-inner`}>
                  <span className="text-xl font-black">{percentualPendente}%</span>
                  <span className="text-[9px] font-bold text-emerald-500">{formatarGrana(valorMapeadoPote)}/mês</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max={maxPermitido}
                value={percentualPendente}
                onChange={(e) => setPercentualPendente(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />

              <button
                onClick={confirmarAdicionarPote}
                className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Check className="w-4 h-4" /> Confirmar Porcentagem
              </button>
            </div>
          </div>
        );
      })()}

      {animacaoEntrada && animacaoEntrada.ativo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-6 max-w-md w-full text-center space-y-5 shadow-2xl relative border-2 border-emerald-500/40 animate-fade-in max-h-[90vh] overflow-y-auto`}>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold text-emerald-500 tracking-wider">Entrada Registrada e Retenções Descontadas!</span>
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
              className="w-full bg-emerald-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 text-sm cursor-pointer"
            >
              Ver Meu Painel
            </button>
          </div>
        </div>
      )}

      {telaAtiva === 'dashboard' && (
        <main className="max-w-5xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          
          {aportePendenteValor !== '' && Number(aportePendenteValor) > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-400">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-black text-sm block">Aporte / Valor Inicial em Caixa Ativo</span>
                  <span className="text-xs text-emerald-300/80">Valor considerado no saldo real: {formatarGrana(Number(aportePendenteValor))}</span>
                </div>
              </div>
              <button 
                onClick={() => setModalAportePendente(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-4 py-2 rounded-2xl text-xs transition-all shrink-0 shadow-md cursor-pointer"
              >
                Ajustar Valor
              </button>
            </div>
          )}

          {/* ÚNICO SALDO REAL DA CONTA */}
          <div className={`${cardClasse} rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-3 border-2 border-emerald-500/40`}>
            <div>
              <span className={`text-xs uppercase font-extrabold tracking-widest block ${textMuted}`}>SALDO REAL DISPONÍVEL NA CONTA</span>
              <div className="text-4xl md:text-5xl font-black text-emerald-500 mt-2 font-mono">
                {formatarGrana(saldoUnicoReal)}
              </div>
            </div>
            <span className={`text-xs font-semibold ${textMuted}`}>
              Entradas menos retenções automáticas (poupança, dízimo, patrimônio), saídas e gastos realizados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`${cardClasse} rounded-3xl p-4 flex items-center justify-between border-l-4 border-l-emerald-500`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🐷</span>
                <div>
                  <span className={`text-[10px] uppercase font-extrabold ${textMuted}`}>Alocação em Patrimônio</span>
                  <span className="font-black text-sm block">Nosso Patrimônio ({pctNossoPatrimonio}%)</span>
                </div>
              </div>
              <span className="font-mono font-black text-emerald-500 text-base">{formatarGrana(saldoNossoPatrimonio)}</span>
            </div>

            <div className={`${cardClasse} rounded-3xl p-4 flex items-center justify-between border-l-4 border-l-cyan-500`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👶</span>
                <div>
                  <span className={`text-[10px] uppercase font-extrabold ${textMuted}`}>Poupança Exclusiva</span>
                  <span className="font-black text-sm block">Poupança Manuela ({pctPatrimonioManuela}%)</span>
                </div>
              </div>
              <span className="font-mono font-black text-cyan-500 text-base">{formatarGrana(saldoPatrimonioManuela)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black">Limites de Gastos por Pote:</h3>
              <div className={`flex ${inputBg} p-1 rounded-xl border`}>
                <button onClick={() => setModoVisualizacaoPotes('coluna')} className={`p-1.5 rounded-lg cursor-pointer ${modoVisualizacaoPotes === 'coluna' ? 'bg-emerald-500 text-white' : textMuted}`} title="Modo Coluna Única">
                  <Columns2 className="w-4 h-4" />
                </button>
                <button onClick={() => setModoVisualizacaoPotes('grid')} className={`p-1.5 rounded-lg cursor-pointer ${modoVisualizacaoPotes === 'grid' ? 'bg-emerald-500 text-white' : textMuted}`} title="Modo Grid / Colunas">
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button onClick={() => setModalLancamento(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-xs md:text-sm cursor-pointer">
              <Plus className="w-4 h-4" /> + Registrar Entrada / Gasto
            </button>
          </div>

          <div className={modoVisualizacaoPotes === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" : "space-y-4 max-w-2xl mx-auto"}>
            {potesAtivos.map(pote => {
              const valorDiluidoNoPote = (rendaRestanteAposDividas * pote.percentual) / 100;
              const gastosPote = transacoes.filter(t => t.tipo === 'saida' && t.poteId === pote.id).reduce((acc, t) => acc + t.valor, 0);
              
              const saldoRealPote = pote.retencaoAutomatica ? valorDiluidoNoPote : Math.max(0, valorDiluidoNoPote - gastosPote);

              const percentualProgresso = pote.retencaoAutomatica 
                ? pote.percentual 
                : (valorDiluidoNoPote > 0 ? Math.max(0, Math.min(100, (saldoRealPote / valorDiluidoNoPote) * 100)) : 100);
              
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
                      <span className="text-[9px] text-slate-400">Limite disponível</span>
                    </div>
                  </div>

                  <div className="space-y-0.5 w-full">
                    <span className={`text-xs font-bold block ${textMuted}`}>
                      Alocado ({pote.percentual}% do restante): {formatarGrana(valorDiluidoNoPote)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {telaAtiva === 'patrimonio' && (
        <main className="max-w-2xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
              <Vault className="w-6 h-6 text-emerald-500" /> Patrimônio da Família
            </h2>
            <button onClick={() => setModalNovoPatrimonio(true)} className="bg-emerald-500 text-white px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer">
              + Item Manual
            </button>
          </div>

          <div className={`${cardClasse} rounded-3xl p-5 md:p-6 text-center space-y-2 border-2 border-emerald-500/30`}>
            <span className={`text-xs uppercase font-bold font-mono tracking-wider ${textMuted}`}>Patrimônio Total Consolidado</span>
            <div className="text-3xl md:text-4xl font-black text-emerald-500 font-mono">
              {formatarGrana(patrimonioTotalConsolidado)}
            </div>
            <span className={`text-[10px] ${textMuted}`}>Soma dos potes de patrimônio automático + bens manuais</span>
          </div>

          <div className="space-y-3">
            <div className={`${cardClasse} rounded-2xl p-4 flex justify-between items-center border-l-4 border-l-emerald-500`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🐷</span>
                <div>
                  <span className="font-bold block text-sm">Nosso Patrimônio (Automático)</span>
                  <span className={`text-[10px] ${textMuted}`}>{pctNossoPatrimonio}% do saldo restante</span>
                </div>
              </div>
              <span className="font-mono font-black text-emerald-500 text-sm md:text-base">{formatarGrana(saldoNossoPatrimonio)}</span>
            </div>

            <div className={`${cardClasse} rounded-2xl p-4 flex justify-between items-center border-l-4 border-l-cyan-500`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👶</span>
                <div>
                  <span className="font-bold block text-sm">Poupança Manuela (Futuro da Filha)</span>
                  <span className={`text-[10px] text-cyan-400 font-bold`}>🔒 Valor guardado intocável ({pctPatrimonioManuela}%)</span>
                </div>
              </div>
              <span className="font-mono font-black text-cyan-500 text-sm md:text-base">{formatarGrana(saldoPatrimonioManuela)}</span>
            </div>

            {itensPatrimonioManuais.map(item => (
              <div key={item.id} className={`${cardClasse} rounded-2xl p-4 flex justify-between items-center border-l-4 border-l-amber-500`}>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💎</span>
                  <div>
                    <span className="font-bold block text-sm">{item.nome} (Manual)</span>
                    <span className={`text-[10px] ${textMuted}`}>Item cadastrado</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-black text-amber-500 text-sm md:text-base">{formatarGrana(item.valor)}</span>
                  <button onClick={() => removerPatrimonioManual(item.id)} className="text-slate-400 hover:text-rose-500 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {telaAtiva === 'dividas' && (
        <main className="max-w-2xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-rose-500" /> Acompanhamento de Dívidas
            </h2>
            <button onClick={() => navegarPara('onboarding')} className="bg-emerald-500 text-white px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer">
              + Adicionar / Editar Dívidas
            </button>
          </div>

          <div className={`${cardClasse} rounded-3xl p-5 md:p-6 text-center space-y-2 border-2 border-rose-500/30`}>
            <span className={`text-xs uppercase font-bold font-mono tracking-wider ${textMuted}`}>Total Comprometido Mensal com Dívidas</span>
            <div className="text-3xl md:text-4xl font-black text-rose-500 font-mono">
              {formatarGrana(totalContasFixasValor)}
            </div>
            <span className={`text-[10px] ${textMuted}`}>({percentualComprometidoDividas.toFixed(1)}% da renda mensal)</span>
          </div>

          <div className="space-y-3">
            {contasFixasObrigatorias.length === 0 ? (
              <p className={`text-center text-xs py-10 ${textMuted}`}>Nenhuma dívida ou conta fixa cadastrada. Vá em "Editar / Ajustar Plano" para cadastrar.</p>
            ) : (
              contasFixasObrigatorias.map(c => {
                const progressoMeses = c.mesesTotales > 0 ? ((c.mesesTotales - c.mesesRestantes) / c.mesesTotales) * 100 : 0;
                const valorTotalDividaRestante = c.valor * c.mesesRestantes;

                return (
                  <div key={c.id} className={`${cardClasse} rounded-3xl p-5 space-y-3 border border-rose-500/20`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">💳</span>
                        <div>
                          <span className="font-black text-base block">{c.nome}</span>
                          <span className="text-[10px] text-slate-400">Parcela: {formatarGrana(c.valor)} / mês</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => pagarParcelaDivida(c.id)}
                        disabled={c.mesesRestantes <= 0}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md ${c.mesesRestantes <= 0 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 text-white'}`}
                      >
                        <Check className="w-4 h-4" /> Pagar Parcela
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className={textMuted}>Progresso ({progressoMeses.toFixed(0)}% quitado)</span>
                        <span className="font-mono text-rose-400">{c.mesesRestantes} de {c.mesesTotales} meses restantes</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${progressoMeses}%` }}></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                      <span className={textMuted}>Valor Total Restante da Dívida:</span>
                      <span className="font-mono font-black text-rose-400 text-sm">{formatarGrana(valorTotalDividaRestante)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      )}

      {telaAtiva === 'metas' && (
        <main className="max-w-2xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-500" /> Metas Financeiras
            </h2>
            <button onClick={() => setModalNovaMeta(true)} className="bg-emerald-500 text-white px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer">
              + Nova Meta
            </button>
          </div>

          <div className="space-y-3">
            {metas.length === 0 ? (
              <p className={`text-center text-xs py-10 ${textMuted}`}>Nenhuma meta cadastrada ainda. Clique em "+ Nova Meta" para começar.</p>
            ) : (
              metas.map(meta => {
                const valorFaltante = Math.max(0, meta.valorAlvo - meta.valorGuardado);
                const progressoPct = Math.min(100, (meta.valorGuardado / meta.valorAlvo) * 100);
                const mesesRestantes = meta.meses > 0 ? meta.meses : 1;
                const valorMensalNecessario = valorFaltante / mesesRestantes;

                return (
                  <div key={meta.id} className={`${cardClasse} rounded-3xl p-5 space-y-3 border border-emerald-500/20`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🎯</span>
                        <span className="font-black text-base">{meta.nome}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setMetaSelecionadaId(meta.id);
                            setModalDepositoMeta(true);
                          }} 
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" /> + Depositar
                        </button>
                        <button onClick={() => removerMeta(meta.id)} className="text-slate-400 hover:text-rose-500 cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className={textMuted}>Progresso ({progressoPct.toFixed(1)}%)</span>
                        <span className="font-mono text-emerald-500">{formatarGrana(meta.valorGuardado)} / {formatarGrana(meta.valorAlvo)}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressoPct}%` }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                      <div>
                        <span className={`text-[10px] uppercase font-bold block ${textMuted}`}>Falta Concluir</span>
                        <span className="font-mono font-black text-rose-400 text-sm">{formatarGrana(valorFaltante)}</span>
                      </div>
                      <div>
                        <span className={`text-[10px] uppercase font-bold block ${textMuted}`}>Prazo Restante</span>
                        <span className="font-mono font-black text-sm">{meta.meses} meses</span>
                      </div>
                    </div>

                    <div className={`${inputBg} p-3 rounded-2xl flex justify-between items-center border`}>
                      <span className="text-xs font-bold">Necessário guardar por mês:</span>
                      <span className="font-mono font-black text-emerald-400 text-sm">{formatarGrana(valorMensalNecessario)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      )}

      {telaAtiva === 'extrato' && (
        <main className="max-w-xl mx-auto p-3 md:p-6 w-full space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black">Extrato</h2>
            <div className={`flex ${inputBg} p-1 rounded-xl border text-xs`}>
              <button onClick={() => setFiltroExtrato('todos')} className={`px-3 py-1.5 font-bold rounded-lg cursor-pointer ${filtroExtrato === 'todos' ? 'bg-emerald-500 text-white' : textMuted}`}>Todos</button>
              <button onClick={() => setFiltroExtrato('entradas')} className={`px-3 py-1.5 font-bold rounded-lg cursor-pointer ${filtroExtrato === 'entradas' ? 'bg-emerald-500 text-white' : textMuted}`}>Entradas</button>
              <button onClick={() => setFiltroExtrato('saidas')} className={`px-3 py-1.5 font-bold rounded-lg cursor-pointer ${filtroExtrato === 'saidas' ? 'bg-emerald-500 text-white' : textMuted}`}>Saídas</button>
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
                    <button onClick={() => removerTransacao(t.id)} className="text-slate-400 hover:text-rose-500 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      )}

      {modalAportePendente && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 max-w-sm w-full space-y-4 relative shadow-2xl`}>
            <button onClick={() => setModalAportePendente(false)} className="absolute top-4 right-4 text-slate-400 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base md:text-lg font-black">Ajustar Valor Inicial em Caixa</h3>
            <p className={`text-xs ${textMuted}`}>Atualize o valor inicial caso necessário:</p>
            <input
              type="number"
              placeholder="Valor R$"
              value={aportePendenteValor}
              onChange={(e) => setAportePendenteValor(e.target.value === '' ? '' : Number(e.target.value))}
              className={`w-full ${inputBg} p-3 rounded-2xl font-black text-lg focus:outline-none font-mono border`}
            />
            <button 
              onClick={async () => {
                await salvarDadosNaNuvem({ aportePendenteValor });
                setModalAportePendente(false);
              }} 
              className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg text-sm cursor-pointer"
            >
              Salvar Alteração
            </button>
          </div>
        </div>
      )}

      {modalNovoPatrimonio && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 max-w-sm w-full space-y-4 relative shadow-2xl`}>
            <button onClick={() => setModalNovoPatrimonio(false)} className="absolute top-4 right-4 text-slate-400 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base md:text-lg font-black">Adicionar Item ao Patrimônio</h3>
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
            <button onClick={adicionarPatrimonioManual} className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg text-sm cursor-pointer">
              Salvar
            </button>
          </div>
        </div>
      )}

      {modalNovaMeta && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 max-w-sm w-full space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <button onClick={() => setModalNovaMeta(false)} className="absolute top-4 right-4 text-slate-400 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base md:text-lg font-black">Nova Meta Financeira</h3>
            <input
              type="text"
              placeholder="Nome da Meta (Ex: Viagem, Carro)"
              value={nomeNovaMeta}
              onChange={(e) => setNomeNovaMeta(e.target.value)}
              className={`w-full ${inputBg} p-3 rounded-2xl text-xs font-bold focus:outline-none border`}
            />
            <input
              type="number"
              placeholder="Valor Alvo R$"
              value={valorNovaMeta}
              onChange={(e) => setValorNovaMeta(e.target.value === '' ? '' : Number(e.target.value))}
              className={`w-full ${inputBg} p-3 rounded-2xl font-black text-base focus:outline-none font-mono border`}
            />
            
            <div className="space-y-1">
              <label className={`text-[11px] font-bold block ${textMuted}`}>
                Aportar Valor Inicial (Disponível: {formatarGrana(saldoUnicoReal)})
              </label>
              <input
                type="number"
                placeholder="Valor inicial para esta meta R$"
                value={guardadoNovaMeta}
                onChange={(e) => setGuardadoNovaMeta(e.target.value === '' ? '' : Number(e.target.value))}
                className={`w-full ${inputBg} p-3 rounded-2xl font-black text-base focus:outline-none font-mono border`}
              />
            </div>

            <input
              type="number"
              placeholder="Tempo de Conclusão (Meses)"
              value={mesesNovaMeta}
              onChange={(e) => setMesesNovaMeta(e.target.value === '' ? '' : Number(e.target.value))}
              className={`w-full ${inputBg} p-3 rounded-2xl font-black text-base focus:outline-none font-mono border`}
            />
            <button onClick={adicionarMeta} className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg text-sm cursor-pointer">
              Salvar Meta com Aporte
            </button>
          </div>
        </div>
      )}

      {modalDepositoMeta && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 max-w-sm w-full space-y-4 relative shadow-2xl`}>
            <button onClick={() => setModalDepositoMeta(false)} className="absolute top-4 right-4 text-slate-400 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base md:text-lg font-black">Transferir para Meta</h3>
            
            <div className="space-y-3">
              <label className={`text-xs font-bold block ${textMuted}`}>Origem dos Fundos:</label>
              <select 
                value={origemDepositoMeta} 
                onChange={(e) => setOrigemDepositoMeta(e.target.value as any)} 
                className={`w-full ${inputBg} p-3 rounded-2xl text-xs font-bold border`}
              >
                <option value="disponivel">💳 Saldo Real Disponível ({formatarGrana(saldoUnicoReal)})</option>
                <option value="nosso_patrimonio">🐷 Nosso Patrimônio ({formatarGrana(saldoNossoPatrimonio)})</option>
                <option value="patrimonio_manuela">👶 Poupança Manuela ({formatarGrana(saldoPatrimonioManuela)})</option>
              </select>

              <input
                type="number"
                placeholder="Valor a Transferir R$"
                value={valorDepositoMeta}
                onChange={(e) => setValorDepositoMeta(e.target.value === '' ? '' : Number(e.target.value))}
                className={`w-full ${inputBg} p-3 rounded-2xl font-black text-lg focus:outline-none font-mono border`}
              />
            </div>

            <button onClick={efetivarTransferenciaMeta} className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg text-sm cursor-pointer">
              Efetivar Transferência
            </button>
          </div>
        </div>
      )}

      <nav className={`fixed bottom-0 inset-x-0 border-t p-1.5 flex justify-around items-center z-40 transition-colors duration-300 ${isDark ? 'bg-slate-950/95 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
        <button onClick={() => navegarPara('dashboard')} className="flex flex-col items-center p-1.5 text-[10px] font-bold opacity-80 hover:opacity-100 cursor-pointer">
          <Home className="w-5 h-5 text-emerald-500" /> Início
        </button>
        <button onClick={() => navegarPara('extrato')} className="flex flex-col items-center p-1.5 text-[10px] font-bold opacity-80 hover:opacity-100 cursor-pointer">
          <List className="w-5 h-5 text-emerald-500" /> Extrato
        </button>
        <button onClick={() => setModalLancamento(true)} className="p-3 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/30 -mt-5 active:scale-95 transition-transform cursor-pointer">
          <Plus className="w-5 h-5" />
        </button>
        <button onClick={() => navegarPara('metas')} className="flex flex-col items-center p-1.5 text-[10px] font-bold opacity-80 hover:opacity-100 cursor-pointer">
          <Target className="w-5 h-5 text-emerald-500" /> Metas
        </button>
        <button onClick={() => setMenuAberto(!menuAberto)} className="flex flex-col items-center p-1.5 text-[10px] font-bold opacity-80 hover:opacity-100 cursor-pointer">
          <MoreHorizontal className="w-5 h-5 text-emerald-500" /> Mais
        </button>
      </nav>

      {modalLancamento && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 md:p-6 max-w-sm w-full space-y-4 relative shadow-2xl`}>
            <button onClick={() => setModalLancamento(false)} className="absolute top-4 right-4 text-slate-400 cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base md:text-lg font-black">Novo Lançamento</h3>

            <div className={`flex ${inputBg} p-1 rounded-xl border`}>
              <button onClick={() => setTipoLancamento('saida')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${tipoLancamento === 'saida' ? 'bg-rose-500 text-white' : textMuted}`}>
                Gasto (Saída)
              </button>
              <button onClick={() => setTipoLancamento('entrada')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${tipoLancamento === 'entrada' ? 'bg-emerald-500 text-white' : textMuted}`}>
                Renda (Entrada)
              </button>
            </div>

            {tipoLancamento === 'entrada' ? (
              <div className="space-y-3">
                <label className={`text-xs font-bold block ${textMuted}`}>Origem da Entrada:</label>
                <div className={`flex ${inputBg} p-1 rounded-xl border`}>
                  <button onClick={() => setOrigemEntradaModal('Mercado Livre')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${origemEntradaModal === 'Mercado Livre' ? 'bg-emerald-500 text-white' : textMuted}`}>
                    Mercado Livre
                  </button>
                  <button onClick={() => setOrigemEntradaModal('CLT')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${origemEntradaModal === 'CLT' ? 'bg-emerald-500 text-white' : textMuted}`}>
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
                  <option value="Desfrute Família">🎮 Desfrute Família</option>
                  <option value="Pagamento de Dívida / Conta Fixa">💳 Pagamento de Dívida / Conta Fixa</option>
                  <option value="Outros Gastos">📦 Outros Gastos</option>
                </select>

                <label className={`text-xs font-bold block ${textMuted}`}>Retirar de Onde:</label>
                <select value={poteSelecionadoId} onChange={(e) => setPoteSelecionadoId(e.target.value)} className={`w-full ${inputBg} p-3 rounded-2xl text-xs md:text-sm focus:outline-none font-bold border`}>
                  <option value="divida_fixa">💳 Direto do Saldo Real (Geral / Dívidas / Contas)</option>
                  {potesAtivos.map(p => (
                    <option key={p.id} value={p.id}>{p.iconeEmoji} {p.nome}</option>
                  ))}
                </select>
              </div>
            )}

            <input type="number" placeholder="Valor R$" value={valorLancamento} onChange={(e) => setValorLancamento(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full ${inputBg} p-3 rounded-2xl font-black text-lg focus:outline-none font-mono border`} />

            <button onClick={salvarLancamento} className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-500/20 text-sm cursor-pointer">
              Registrar Lançamento
            </button>
          </div>
        </div>
      )}

      {menuAberto && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex justify-end" onClick={() => setMenuAberto(false)}>
          <div className={`${cardClasse} w-72 md:w-80 h-full p-5 space-y-5 overflow-y-auto relative border-l flex flex-col justify-between`} onClick={(e) => e.stopPropagation()}>
            <div className="space-y-5">
              <button onClick={() => setMenuAberto(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-black text-emerald-500">MEU IMPÉRIO</h3>

              <div className="space-y-1.5 text-xs md:text-sm font-bold">
                <button onClick={() => navegarPara('dashboard')} className={`w-full text-left p-3 rounded-2xl cursor-pointer ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} flex items-center gap-2.5`}>
                  <Home className="w-4 h-4 text-emerald-500" /> Início / Dashboard
                </button>
                <button onClick={() => navegarPara('onboarding')} className={`w-full text-left p-3 rounded-2xl cursor-pointer ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} flex items-center gap-2.5`}>
                  <Sliders className="w-4 h-4 text-emerald-500" /> Editar / Ajustar Plano
                </button>
                <button onClick={() => navegarPara('dividas')} className={`w-full text-left p-3 rounded-2xl cursor-pointer ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} flex items-center gap-2.5`}>
                  <CreditCard className="w-4 h-4 text-rose-500" /> Acompanhamento de Dívidas
                </button>
                <button onClick={() => navegarPara('metas')} className={`w-full text-left p-3 rounded-2xl cursor-pointer ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} flex items-center gap-2.5`}>
                  <Target className="w-4 h-4 text-emerald-500" /> Metas Financeiras
                </button>
                <button onClick={() => navegarPara('patrimonio')} className={`w-full text-left p-3 rounded-2xl cursor-pointer ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} flex items-center gap-2.5`}>
                  <Vault className="w-4 h-4 text-emerald-500" /> Patrimônio da Família
                </button>
                <button onClick={() => navegarPara('extrato')} className={`w-full text-left p-3 rounded-2xl cursor-pointer ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} flex items-center gap-2.5`}>
                  <List className="w-4 h-4 text-emerald-500" /> Extrato Completo
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button 
                onClick={reiniciarSistemaGeral}
                className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold p-3 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Reiniciar Sistema (Zerar Tudo)
              </button>
              {onLogout && (
                <button 
                  onClick={onLogout} 
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold p-3 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sair da Conta (Bloquear)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FinanceCenterView;
