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
  ArrowUpRight,
  AlertTriangle,
  User,
  Award,
  ShieldCheck
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

declare global {
  interface Window { firebaseErrorShown?: boolean; }
}

interface ContaFixa { id: string; nome: string; valor: number; mesesTotales: number; mesesRestantes: number; }
interface Pote { id: string; nome: string; percentual: number; cor: string; iconeEmoji: string; retencaoAutomatica?: boolean; }
interface Transacao { id: string; descricao: string; valor: number; tipo: 'entrada' | 'saida'; origemEntrada?: 'CLT' | 'Mercado Livre'; poteId: string; poteNome?: string; data: string; }
interface Meta { id: string; nome: string; valorAlvo: number; valorGuardado: number; meses: number; }
interface ItemPatrimonio { id: string; nome: string; valor: number; tipo: 'automatico' | 'manual'; }
interface FinanceCenterViewProps { emailUsuario?: string; onLogout?: () => void; }

export const FinanceCenterView: React.FC<FinanceCenterViewProps> = ({ onLogout }) => {
  const docId = 'familia_imperio';

  const [telaAtiva, setTelaAtiva] = useState<'onboarding' | 'dashboard' | 'extrato' | 'patrimonio' | 'metas' | 'dividas' | 'perfil'>('dashboard');
  const [carregandoNuvem, setCarregandoNuvem] = useState<boolean>(true);
  const [erroFirebase, setErroFirebase] = useState<boolean>(false);

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

  const todosPotesDisponiveis: Pote[] = [
    { id: 'nosso_patrimonio', nome: 'Nosso Patrimônio', percentual: 0, cor: '#10B981', iconeEmoji: '🐷', retencaoAutomatica: true },
    { id: 'patrimonio_manuela', nome: 'Poupança Manuela (Futuro)', percentual: 0, cor: '#06B6D4', iconeEmoji: '👶', retencaoAutomatica: true },
    { id: 'supermercado', nome: 'Supermercado', percentual: 0, cor: '#F97316', iconeEmoji: '🧺' },
    { id: 'transporte', nome: 'Transporte', percentual: 0, cor: '#3B82F6', iconeEmoji: '🚗' },
    { id: 'desfrute_familia', nome: 'Desfrute Família', percentual: 0, cor: '#8B5CF6', iconeEmoji: '🎮' },
    { id: 'desfrute_dele', nome: 'Desfrute Dele', percentual: 0, cor: '#3B82F6', iconeEmoji: '🧔‍♂️' },
    { id: 'desfrute_dela', nome: 'Desfrute Dela', percentual: 0, cor: '#EC4899', iconeEmoji: '👩' },
  ];

  const salvarDadosNaNuvem = async (novosDados: Partial<{ rendaMensal: number; aportePendenteValor: number | ''; contasFixasObrigatorias: ContaFixa[]; potesAtivos: Pote[]; transacoes: Transacao[]; itensPatrimonioManuais: ItemPatrimonio[]; metas: Meta[]; }>) => {
    const backupCompleto = { rendaMensal, aportePendenteValor, contasFixasObrigatorias, potesAtivos, transacoes, itensPatrimonioManuais, metas, ...novosDados };
    localStorage.setItem('meu_imperio_backup', JSON.stringify(backupCompleto));
    try {
      const docRef = doc(db, 'imperio_finance', docId);
      await setDoc(docRef, backupCompleto, { merge: true });
      setErroFirebase(false);
    } catch (error) {
      console.error("ERRO FIREBASE:", error);
      setErroFirebase(true);
      if (!window.firebaseErrorShown) {
        alert("⚠️ ATENÇÃO: Salvo localmente, mas bloqueado no Firebase. Verifique as regras no Firestore.");
        window.firebaseErrorShown = true;
      }
    }
  };

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
        if (!dados.potesAtivos || dados.potesAtivos.length === 0) setTelaAtiva('onboarding');
      } else {
        const localBackup = localStorage.getItem('meu_imperio_backup');
        if (localBackup) {
          const dados = JSON.parse(localBackup);
          setRendaMensal(dados.rendaMensal ?? 0);
          setAportePendenteValor(dados.aportePendenteValor ?? '');
          setContasFixasObrigatorias(dados.contasFixasObrigatorias ?? []);
          setPotesAtivos(dados.potesAtivos ?? []);
          setTransacoes(dados.transacoes ?? []);
          setItensPatrimonioManuais(dados.itensPatrimonioManuais ?? []);
          setMetas(dados.metas ?? []);
          setDoc(docRef, dados, { merge: true }).catch(() => setErroFirebase(true));
        } else {
          setTelaAtiva('onboarding');
        }
      }
      setCarregandoNuvem(false);
    }, (error) => {
      console.error("Erro Snapshot:", error);
      setErroFirebase(true);
      const localBackup = localStorage.getItem('meu_imperio_backup');
      if (localBackup) {
        const dados = JSON.parse(localBackup);
        setRendaMensal(dados.rendaMensal ?? 0);
        setContasFixasObrigatorias(dados.contasFixasObrigatorias ?? []);
        setPotesAtivos(dados.potesAtivos ?? []);
        setTransacoes(dados.transacoes ?? []);
        setMetas(dados.metas ?? []);
      } else {
        setTelaAtiva('onboarding');
      }
      setCarregandoNuvem(false);
    });
    return () => unsubscribe();
  }, [docId]);

  const [potePendente, setPotePendente] = useState<Pote | null>(null);
  const [percentualPendente, setPercentualPendente] = useState<number>(10);
  const [novaContaNome, setNovaContaNome] = useState('');
  const [novaContaValor, setNovaContaValor] = useState<number | ''>('');
  const [novaContaMeses, setNovaContaMeses] = useState<number | ''>('');

  const [modalAportePendente, setModalAportePendente] = useState<boolean>(false);
  const [modalLancamento, setModalLancamento] = useState<boolean>(false);
  const [tipoLancamento, setTipoLancamento] = useState<'saida' | 'entrada'>('saida');
  const [valorLancamento, setValorLancamento] = useState<number | ''>('');
  const [origemEntradaModal, setOrigemEntradaModal] = useState<'CLT' | 'Mercado Livre'>('Mercado Livre');
  
  // Novo estado para a descrição livre da saída
  const [descricaoSaidaManual, setDescricaoSaidaManual] = useState<string>('');
  const [poteSelecionadoId, setPoteSelecionadoId] = useState<string>('divida_fixa');

  const [filtroExtrato, setFiltroExtrato] = useState<'todos' | 'entradas' | 'saidas'>('todos');
  
  const [modalNovoPatrimonio, setModalNovoPatrimonio] = useState<boolean>(false);
  const [nomeNovoPatrimonio, setNomeNovoPatrimonio] = useState('');
  const [valorNovoPatrimonio, setValorNovoPatrimonio] = useState<number | ''>('');
  
  const [modalAporteSobra, setModalAporteSobra] = useState<boolean>(false);
  const [valorAporteSobra, setValorAporteSobra] = useState<number | ''>('');
  const [destinoAporteSobra, setDestinoAporteSobra] = useState<'nosso_patrimonio' | 'patrimonio_manuela'>('nosso_patrimonio');

  const [modalNovaMeta, setModalNovaMeta] = useState<boolean>(false);
  const [nomeNovaMeta, setNomeNovaMeta] = useState('');
  const [valorNovaMeta, setValorNovaMeta] = useState<number | ''>('');
  const [guardadoNovaMeta, setGuardadoNovaMeta] = useState<number | ''>('');
  const [mesesNovaMeta, setMesesNovaMeta] = useState<number | ''>('');

  const [modalDepositoMeta, setModalDepositoMeta] = useState<boolean>(false);
  const [metaSelecionadaId, setMetaSelecionadaId] = useState<string>('');
  const [valorDepositoMeta, setValorDepositoMeta] = useState<number | ''>('');
  const [origemDepositoMeta, setOrigemDepositoMeta] = useState<'disponivel' | 'nosso_patrimonio' | 'patrimonio_manuela'>('disponivel');

  const [animacaoEntrada, setAnimacaoEntrada] = useState<{ ativo: boolean; valorTotal: number; detalhes: { nome: string; icone: string; valor: number; percentual: number; cor: string }[]; } | null>(null);

  const reiniciarSistemaGeral = async () => {
    if (window.confirm("Deseja realmente reiniciar o plano? Todos os dados serão apagados.")) {
      const dadosVazios = { rendaMensal: 0, aportePendenteValor: '', contasFixasObrigatorias: [], potesAtivos: [], transacoes: [], itensPatrimonioManuais: [], metas: [] };
      localStorage.removeItem('meu_imperio_backup');
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
  const totalEntradasTransacoes = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const totalEntradasGeral = totalEntradasTransacoes + valorAporteNumerico;
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  
  const percentualRetencaoTotal = potesAtivos.filter(p => p.retencaoAutomatica).reduce((acc, p) => acc + p.percentual, 0);
  const valorRetidoAutomaticoAcumulado = (totalEntradasGeral * percentualRetencaoTotal) / 100;
  const saldoUnicoReal = (totalEntradasGeral - valorRetidoAutomaticoAcumulado) - totalSaidas;

  const aportesExtrasNossoPatrimonio = transacoes.filter(t => t.poteId === 'aporte_extra_nosso_patrimonio').reduce((acc, t) => acc + t.valor, 0);
  const aportesExtrasManuela = transacoes.filter(t => t.poteId === 'aporte_extra_patrimonio_manuela').reduce((acc, t) => acc + t.valor, 0);

  const pctNossoPatrimonio = potesAtivos.find(p => p.id === 'nosso_patrimonio')?.percentual || 0;
  const saldoNossoPatrimonio = ((totalEntradasGeral * pctNossoPatrimonio) / 100) + aportesExtrasNossoPatrimonio;

  const pctPatrimonioManuela = potesAtivos.find(p => p.id === 'patrimonio_manuela')?.percentual || 0;
  const saldoPatrimonioManuela = ((totalEntradasGeral * pctPatrimonioManuela) / 100) + aportesExtrasManuela;

  const totalPatrimonioManual = itensPatrimonioManuais.reduce((acc, item) => acc + item.valor, 0);
  const patrimonioTotalConsolidado = saldoNossoPatrimonio + saldoPatrimonioManuela + totalPatrimonioManual;

  const transacoesFiltradas = transacoes.filter(t => {
    if (filtroExtrato === 'entradas') return t.tipo === 'entrada';
    if (filtroExtrato === 'saidas') return t.tipo === 'saida';
    return true;
  });

  const getSaldoDisponivelPorPote = (pId: string) => {
    if (pId === 'divida_fixa') return saldoUnicoReal;
    if (pId === 'nosso_patrimonio') return saldoNossoPatrimonio;
    if (pId === 'patrimonio_manuela') return saldoPatrimonioManuela;
    const p = potesAtivos.find(x => x.id === pId);
    if (!p) return 0;
    const valorDiluido = (totalEntradasGeral * p.percentual) / 100;
    const gastos = transacoes.filter(t => t.tipo === 'saida' && t.poteId === p.id).reduce((acc, t) => acc + t.valor, 0);
    return valorDiluido - gastos;
  };

  const adicionarContaFixaObrigatoria = async () => {
    if (!novaContaNome || !novaContaValor || Number(novaContaValor) <= 0 || !novaContaMeses || Number(novaContaMeses) <= 0) return;
    const novasContas = [...contasFixasObrigatorias, { id: Date.now().toString(), nome: novaContaNome, valor: Number(novaContaValor), mesesTotales: Number(novaContaMeses), mesesRestantes: Number(novaContaMeses) }];
    setContasFixasObrigatorias(novasContas); setNovaContaNome(''); setNovaContaValor(''); setNovaContaMeses('');
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
    if (window.confirm(`Registrar pagamento de ${formatarGrana(conta.valor)} para "${conta.nome}"? O valor sairá do saldo.`)) {
      const novasContas = contasFixasObrigatorias.map(c => c.id === idConta ? { ...c, mesesRestantes: Math.max(0, c.mesesRestantes - 1) } : c);
      const novaSaida: Transacao = { id: Date.now().toString(), descricao: `Pagamento: ${conta.nome}`, valor: conta.valor, tipo: 'saida', poteId: 'divida_fixa', poteNome: 'Saldo Real', data: new Date().toLocaleDateString('pt-BR') };
      const novasTransacoes = [novaSaida, ...transacoes];
      setContasFixasObrigatorias(novasContas); setTransacoes(novasTransacoes);
      await salvarDadosNaNuvem({ contasFixasObrigatorias: novasContas, transacoes: novasTransacoes });
    }
  };

  const solicitarAdicaoPote = (pote: Pote) => {
    if (!potesAtivos.some(p => p.id === pote.id)) {
      if (disponivelGeral <= 0) { alert("100% do saldo já foi mapeado! Reduza outro pote primeiro."); return; }
      setPotePendente(pote); setPercentualPendente(Math.min(10, disponivelGeral));
    }
  };

  const confirmarAdicionarPote = async () => {
    if (potePendente) {
      const poteAtualizado = { ...potePendente, percentual: percentualPendente };
      const novoConjunto = [...potesAtivos.filter(p => p.id !== potePendente.id), poteAtualizado];
      if (novoConjunto.reduce((acc, p) => acc + p.percentual, 0) > 100) { alert("A soma dos potes ultrapassa 100%!"); return; }
      setPotesAtivos(novoConjunto); setPotePendente(null);
      await salvarDadosNaNuvem({ potesAtivos: novoConjunto });
    }
  };

  const removerPote = async (id: string) => {
    const novoConjunto = potesAtivos.filter(p => p.id !== id);
    setPotesAtivos(novoConjunto);
    await salvarDadosNaNuvem({ potesAtivos: novoConjunto });
  };

  const processarEntradaComAnimacao = async (valor: number, origem: 'CLT' | 'Mercado Livre') => {
    const novaEntrada: Transacao = { id: Date.now().toString(), descricao: `Entrada (${origem})`, valor: valor, tipo: 'entrada', origemEntrada: origem, poteId: 'geral', poteNome: `Origem: ${origem}`, data: new Date().toLocaleDateString('pt-BR') };
    const novasTransacoes = [novaEntrada, ...transacoes];
    setTransacoes(novasTransacoes);
    const detalhes = potesAtivos.map(pote => ({ nome: pote.nome, icone: pote.iconeEmoji, valor: (valor * pote.percentual) / 100, percentual: pote.percentual, cor: pote.cor }));
    setAnimacaoEntrada({ ativo: true, valorTotal: valor, detalhes });
    await salvarDadosNaNuvem({ transacoes: novasTransacoes });
  };

  const salvarLancamento = async () => {
    if (!valorLancamento || Number(valorLancamento) <= 0) return;
    const valorGasto = Number(valorLancamento);
    if (tipoLancamento === 'entrada') {
      await processarEntradaComAnimacao(valorGasto, origemEntradaModal);
      setValorLancamento(''); setModalLancamento(false);
    } else {
      if (poteSelecionadoId !== 'divida_fixa') {
        const poteAlvo = potesAtivos.find(p => p.id === poteSelecionadoId);
        if (poteAlvo) {
          const saldoDisp = getSaldoDisponivelPorPote(poteAlvo.id);
          if (!poteAlvo.retencaoAutomatica && valorGasto > saldoDisp) {
            alert(`⚠️ Trava de Segurança!\n\nO gasto (${formatarGrana(valorGasto)}) é maior que o saldo disponível no pote "${poteAlvo.nome}" (${formatarGrana(saldoDisp)}).`);
            return;
          }
        }
      }
      const poteAlvo = potesAtivos.find(p => p.id === poteSelecionadoId);
      const descFinal = descricaoSaidaManual.trim() !== '' ? descricaoSaidaManual.trim() : 'Gasto Geral';
      
      const novaSaida: Transacao = { 
        id: Date.now().toString(), 
        descricao: descFinal, 
        valor: valorGasto, 
        tipo: 'saida', 
        poteId: poteSelecionadoId, 
        poteNome: poteAlvo ? poteAlvo.nome : 'Saldo Real', 
        data: new Date().toLocaleDateString('pt-BR') 
      };
      
      const novasTransacoes = [novaSaida, ...transacoes];
      setTransacoes(novasTransacoes); 
      setValorLancamento(''); 
      setDescricaoSaidaManual('');
      setModalLancamento(false);
      await salvarDadosNaNuvem({ transacoes: novasTransacoes });
    }
  };

  const efetivarAporteSobraPatrimonio = async () => {
    if (!valorAporteSobra || Number(valorAporteSobra) <= 0) return;
    const valorTransf = Number(valorAporteSobra);
    if (valorTransf > saldoUnicoReal) { alert("Valor escolhido maior que o Saldo Real atual!"); return; }
    const novaSaida: Transacao = { id: Date.now().toString(), descricao: `Aporte Extra em Patrimônio`, valor: valorTransf, tipo: 'saida', poteId: destinoAporteSobra === 'nosso_patrimonio' ? 'aporte_extra_nosso_patrimonio' : 'aporte_extra_patrimonio_manuela', poteNome: destinoAporteSobra === 'nosso_patrimonio' ? 'Nosso Patrimônio (Aporte)' : 'Poupança Manuela (Aporte)', data: new Date().toLocaleDateString('pt-BR') };
    const novasTransacoes = [novaSaida, ...transacoes];
    setTransacoes(novasTransacoes); setValorAporteSobra(''); setModalAporteSobra(false);
    await salvarDadosNaNuvem({ transacoes: novasTransacoes });
  };

  const adicionarPatrimonioManual = async () => {
    if (!nomeNovoPatrimonio || !valorNovoPatrimonio || Number(valorNovoPatrimonio) <= 0) return;
    const novosItens = [...itensPatrimonioManuais, { id: Date.now().toString(), nome: nomeNovoPatrimonio, valor: Number(valorNovoPatrimonio), tipo: 'manual' as const }];
    setItensPatrimonioManuais(novosItens); setNomeNovoPatrimonio(''); setValorNovoPatrimonio(''); setModalNovoPatrimonio(false);
    await salvarDadosNaNuvem({ itensPatrimonioManuais: novosItens });
  };

  const removerPatrimonioManual = async (id: string) => {
    const novosItens = itensPatrimonioManuais.filter(x => x.id !== id);
    setItensPatrimonioManuais(novosItens);
    await salvarDadosNaNuvem({ itensPatrimonioManuais: novosItens });
  };

  const adicionarMeta = async () => {
    if (!nomeNovaMeta || !valorNovaMeta || Number(valorNovaMeta) <= 0 || !mesesNovaMeta || Number(mesesNovaMeta) <= 0) return;
    const valorIni = guardadoNovaMeta !== '' ? Number(guardadoNovaMeta) : 0;
    let novasTransacoes = [...transacoes];
    if (valorIni > 0) {
      if (valorIni > saldoUnicoReal) { alert("Valor inicial maior que o Saldo Real disponível!"); return; }
      novasTransacoes = [{ id: Date.now().toString(), descricao: `Aporte inicial Meta: ${nomeNovaMeta}`, valor: valorIni, tipo: 'saida', poteId: 'meta_aporte', poteNome: `Meta: ${nomeNovaMeta}`, data: new Date().toLocaleDateString('pt-BR') }, ...novasTransacoes];
      setTransacoes(novasTransacoes);
    }
    const novasMetas = [...metas, { id: Date.now().toString(), nome: nomeNovaMeta, valorAlvo: Number(valorNovaMeta), valorGuardado: valorIni, meses: Number(mesesNovaMeta) }];
    setMetas(novasMetas); setNomeNovaMeta(''); setValorNovaMeta(''); setGuardadoNovaMeta(''); setMesesNovaMeta(''); setModalNovaMeta(false);
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
      if (valorTransf > saldoUnicoReal) { alert("Valor superior ao Saldo Real disponível!"); return; }
      novasTransacoes = [{ id: Date.now().toString(), descricao: `Transferência para Meta`, valor: valorTransf, tipo: 'saida', poteId: 'meta_transf', poteNome: 'Depósito Meta', data: new Date().toLocaleDateString('pt-BR') }, ...novasTransacoes];
    } else {
      const nomeOrigemPatri = origemDepositoMeta === 'nosso_patrimonio' ? 'Nosso Patrimônio' : 'Poupança Manuela';
      const saldoMaxPatri = origemDepositoMeta === 'nosso_patrimonio' ? saldoNossoPatrimonio : saldoPatrimonioManuela;
      if (valorTransf > saldoMaxPatri) { alert(`Valor superior ao disponível em ${nomeOrigemPatri}!`); return; }
      novasTransacoes = [{ id: Date.now().toString(), descricao: `Resgate de ${nomeOrigemPatri} para Meta`, valor: valorTransf, tipo: 'saida', poteId: origemDepositoMeta, poteNome: nomeOrigemPatri, data: new Date().toLocaleDateString('pt-BR') }, ...novasTransacoes];
    }
    setTransacoes(novasTransacoes);
    const novasMetas = metas.map(m => m.id === metaSelecionadaId ? { ...m, valorGuardado: m.valorGuardado + valorTransf } : m);
    setMetas(novasMetas); setModalDepositoMeta(false); setValorDepositoMeta(''); setMetaSelecionadaId('');
    await salvarDadosNaNuvem({ metas: novasMetas, transacoes: novasTransacoes });
  };

  const removerTransacao = async (id: string) => {
    const novasTransacoes = transacoes.filter(x => x.id !== id);
    setTransacoes(novasTransacoes);
    await salvarDadosNaNuvem({ transacoes: novasTransacoes });
  };

  const formatarGrana = (valor: number) => tamparValores ? 'R$ •••••' : `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const isDark = tema === 'escuro';
  const bgClasse = isDark ? 'bg-[#0B0F17] text-slate-100' : 'bg-[#F4F7F6] text-slate-900';
  const cardClasse = isDark ? 'bg-[#121824] border-slate-800/80 shadow-2xl text-slate-100' : 'bg-white border-slate-200/80 shadow-md text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-600';
  const inputBg = isDark ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-slate-100 text-slate-900 border-slate-300';

  if (carregandoNuvem) return <div className={`min-h-screen ${bgClasse} flex items-center justify-center font-bold animate-pulse text-emerald-500`}><Sparkles className="w-8 h-8 mr-2 animate-spin" /> Sincronizando Cofre...</div>;

  return (
    <div className={`min-h-screen ${bgClasse} font-sans tracking-tight flex flex-col justify-between transition-colors duration-500 pb-28 select-none relative overflow-x-hidden`}>
      
      <style>{`
        @keyframes slideInUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes popIn { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        @keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        
        .animate-slide-up { animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float { animation: floatY 3s ease-in-out infinite; }
        
        .btn-magic { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .btn-magic:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4); }
        .btn-magic:active { transform: translateY(1px) scale(0.98); }
        
        .card-magic { transition: all 0.4s ease; }
        .card-magic:hover { transform: translateY(-4px); border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 20px 30px -10px rgba(0,0,0,0.3); }
        
        .text-shimmer {
          background: linear-gradient(to right, #10B981 20%, #34D399 40%, #34D399 60%, #10B981 80%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {erroFirebase && (
        <div className="bg-rose-500 text-white text-[10px] md:text-xs font-bold p-2 text-center flex items-center justify-center gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4" /> Firebase bloqueado (Regras). Dados salvos apenas localmente!
        </div>
      )}

      <header className={`p-3 md:p-4 border-b flex justify-between items-center sticky top-0 z-30 transition-colors duration-500 ${isDark ? 'border-slate-800 bg-[#0B0F17]/90 backdrop-blur-md' : 'border-slate-200 bg-white/90 backdrop-blur-md'}`}>
        <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => navegarPara('dashboard')}>
          <Sparkles className="w-6 h-6 text-emerald-500 group-hover:animate-spin transition-all" />
          <span className="text-xl md:text-2xl font-black text-emerald-500 tracking-tight">MEU IMPÉRIO</span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setTamparValores(!tamparValores)} className={`p-2 rounded-2xl border ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'} hover:text-emerald-500 transition-all cursor-pointer hover:rotate-12`}>
            {tamparValores ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={() => setTema(isDark ? 'claro' : 'escuro')} className={`p-2 rounded-2xl border ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'} hover:text-emerald-500 transition-all cursor-pointer hover:-rotate-12`}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMenuAberto(!menuAberto)} className="p-2 rounded-2xl bg-emerald-500 text-slate-950 btn-magic cursor-pointer shadow-emerald-500/30">
            <Menu className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      <main className="w-full flex-grow animate-slide-up" key={telaAtiva}>
        
      {telaAtiva === 'perfil' && (() => {
        let nivelTexto = "Iniciante Aprendiz";
        let nivelCor = "text-slate-400";
        if (patrimonioTotalConsolidado > 5000) { nivelTexto = "Poupador Focado"; nivelCor = "text-cyan-400"; }
        if (patrimonioTotalConsolidado > 20000) { nivelTexto = "Construtor de Riqueza"; nivelCor = "text-emerald-400"; }
        if (patrimonioTotalConsolidado > 100000) { nivelTexto = "Mestre do Patrimônio"; nivelCor = "text-amber-400"; }
        if (patrimonioTotalConsolidado > 500000) { nivelTexto = "Imperador Financeiro"; nivelCor = "text-purple-400"; }

        const totalGuardadoMetas = metas.reduce((acc, m) => acc + m.valorGuardado, 0);
        const totalAlvoMetas = metas.reduce((acc, m) => acc + m.valorAlvo, 0);
        const progressoMetasGeral = totalAlvoMetas > 0 ? (totalGuardadoMetas / totalAlvoMetas) * 100 : 0;
        const saudeDividas = 100 - percentualComprometidoDividas;
        const saudeCor = saudeDividas > 70 ? 'text-emerald-500' : saudeDividas > 40 ? 'text-amber-500' : 'text-rose-500';

        return (
          <div className="max-w-3xl mx-auto p-4 md:p-8 w-full space-y-6">
            <div className="flex flex-col items-center text-center space-y-3 pt-4">
              <div className="relative animate-float">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-1 shadow-lg shadow-emerald-500/40">
                  <div className={`w-full h-full rounded-full ${isDark ? 'bg-slate-900' : 'bg-white'} flex items-center justify-center`}>
                    <User className="w-10 h-10 text-emerald-500" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-slate-800 text-white p-2 rounded-full border-2 border-emerald-500">
                  <Award className={`w-5 h-5 ${nivelCor}`} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black">Meu Império</h2>
                <span className={`text-sm font-extrabold tracking-widest uppercase ${nivelCor}`}>{nivelTexto}</span>
              </div>
            </div>

            <div className={`${cardClasse} rounded-3xl p-6 md:p-10 text-center relative overflow-hidden card-magic border-2 border-emerald-500/30`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500"></div>
              <span className={`text-xs uppercase font-extrabold tracking-widest block ${textMuted} mb-2`}>Conquista Acumulada (Patrimônio)</span>
              <div className="text-5xl md:text-6xl font-black font-mono text-shimmer drop-shadow-xl">
                {formatarGrana(patrimonioTotalConsolidado)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`${cardClasse} rounded-3xl p-6 flex flex-col justify-between card-magic space-y-4`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500"><Target className="w-6 h-6"/></div>
                  <div>
                    <span className="font-black text-base block">Poder de Realização</span>
                    <span className={`text-[10px] uppercase font-bold ${textMuted}`}>Progresso de todas as metas</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-black mb-1">
                    <span>{progressoMetasGeral.toFixed(1)}%</span>
                    <span className="text-cyan-500">{formatarGrana(totalGuardadoMetas)}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1000" style={{ width: `${progressoMetasGeral}%` }}></div>
                  </div>
                </div>
              </div>

              <div className={`${cardClasse} rounded-3xl p-6 flex flex-col justify-between card-magic space-y-4`}>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl bg-opacity-10 ${saudeDividas > 70 ? 'bg-emerald-500 text-emerald-500' : saudeDividas > 40 ? 'bg-amber-500 text-amber-500' : 'bg-rose-500 text-rose-500'}`}><ShieldCheck className="w-6 h-6"/></div>
                  <div>
                    <span className="font-black text-base block">Escudo Financeiro</span>
                    <span className={`text-[10px] uppercase font-bold ${textMuted}`}>Livre de Dívidas</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-black mb-1">
                    <span className={saudeCor}>{saudeDividas.toFixed(1)}% Livre</span>
                    <span className="text-rose-400">{percentualComprometidoDividas.toFixed(1)}% Preso</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000" style={{ width: `${saudeDividas}%` }}></div>
                    <div className="h-full bg-rose-500/50 transition-all duration-1000" style={{ width: `${percentualComprometidoDividas}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <h3 className="font-black text-sm uppercase tracking-wider pl-2 border-l-4 border-emerald-500">Mural de Troféus</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`${cardClasse} p-4 rounded-2xl flex flex-col items-center text-center gap-2 card-magic ${saldoNossoPatrimonio > 0 ? 'border-emerald-500/30' : 'opacity-50 grayscale'}`}>
                  <span className="text-3xl">🐷</span>
                  <span className="text-[10px] font-bold">Investidor Base</span>
                </div>
                <div className={`${cardClasse} p-4 rounded-2xl flex flex-col items-center text-center gap-2 card-magic ${saldoPatrimonioManuela > 0 ? 'border-cyan-500/30' : 'opacity-50 grayscale'}`}>
                  <span className="text-3xl">👶</span>
                  <span className="text-[10px] font-bold">Guardião do Futuro</span>
                </div>
                <div className={`${cardClasse} p-4 rounded-2xl flex flex-col items-center text-center gap-2 card-magic ${metas.length > 0 ? 'border-amber-500/30' : 'opacity-50 grayscale'}`}>
                  <span className="text-3xl">🎯</span>
                  <span className="text-[10px] font-bold">Visionário</span>
                </div>
                <div className={`${cardClasse} p-4 rounded-2xl flex flex-col items-center text-center gap-2 card-magic ${percentualComprometidoDividas === 0 && rendaMensal > 0 ? 'border-purple-500/30' : 'opacity-50 grayscale'}`}>
                  <span className="text-3xl">👑</span>
                  <span className="text-[10px] font-bold">Zero Dívidas</span>
                </div>
              </div>
            </div>
            
            <button onClick={() => navegarPara('onboarding')} className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white font-bold p-4 rounded-3xl flex items-center justify-center gap-2 text-sm transition-colors card-magic">
              <Sliders className="w-4 h-4" /> Ajustar Renda e Plano Base
            </button>
          </div>
        );
      })()}

      {telaAtiva === 'onboarding' && (
        <div className="max-w-4xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              {potesAtivos.length > 0 ? 'Editar Plano Financeiro' : 'Montar seu Plano Financeiro'}
            </h1>
            <button onClick={reiniciarSistemaGeral} className="text-xs text-rose-400 hover:text-rose-500 font-bold underline cursor-pointer transition-colors">Zerar Tudo</button>
          </div>

          <div className={`${cardClasse} rounded-3xl p-4 md:p-6 space-y-4 card-magic`}>
            <div className="flex justify-between items-center">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider block ${textMuted}`}>Meta de Renda Mensal</span>
              </div>
              <div className="flex items-center text-lg md:text-xl font-black">
                <span className={`text-xs md:text-sm mr-1 ${textMuted}`}>R$</span>
                <input type="number" value={rendaMensal === 0 ? '' : rendaMensal} placeholder="0" onChange={async (e) => { const val = e.target.value === '' ? 0 : Number(e.target.value); setRendaMensal(val); await salvarDadosNaNuvem({ rendaMensal: val }); }} className="w-24 md:w-32 text-right bg-transparent focus:outline-none border-b-2 border-emerald-500 font-black" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider block ${textMuted}`}>Valor Inicial / Aporte Caixa</span>
              </div>
              <div className="flex items-center text-lg md:text-xl font-black">
                <span className={`text-xs md:text-sm mr-1 ${textMuted}`}>R$</span>
                <input type="number" value={aportePendenteValor === 0 ? '' : aportePendenteValor} placeholder="0" onChange={async (e) => { const val = e.target.value === '' ? '' : Number(e.target.value); setAportePendenteValor(val); await salvarDadosNaNuvem({ aportePendenteValor: val }); }} className="w-24 md:w-32 text-right bg-transparent focus:outline-none border-b-2 border-emerald-500 font-black" />
              </div>
            </div>
          </div>

          <div className={`${cardClasse} rounded-3xl p-4 md:p-6 space-y-4 border-2 border-rose-500/20 card-magic`}>
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-rose-400">Passo 1: Dívidas & Contas (R$)</h3>
              <span className="text-xs font-mono font-black text-rose-400">{formatarGrana(totalContasFixasValor)}</span>
            </div>
            <div className="space-y-2">
              <input type="text" placeholder="Nome (Ex: Aluguel)" value={novaContaNome} onChange={(e) => setNovaContaNome(e.target.value)} className={`w-full ${inputBg} p-3 rounded-2xl text-xs font-bold border`} />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Mensal R$" value={novaContaValor} onChange={(e) => setNovaContaValor(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full ${inputBg} p-3 rounded-2xl text-xs font-bold border font-mono`} />
                <input type="number" placeholder="Duração (Meses)" value={novaContaMeses} onChange={(e) => setNovaContaMeses(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full ${inputBg} p-3 rounded-2xl text-xs font-bold border font-mono`} />
              </div>
              <button type="button" onClick={adicionarContaFixaObrigatoria} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer btn-magic">
                <Plus className="w-4 h-4" /> Adicionar Dívida / Conta Fixa
              </button>
            </div>
            {contasFixasObrigatorias.length > 0 && (
              <div className="space-y-2 pt-2 max-h-48 overflow-y-auto pr-1">
                {contasFixasObrigatorias.map(c => (
                  <div key={c.id} className={`${inputBg} p-3 rounded-2xl flex justify-between items-center text-xs border animate-pop-in`}>
                    <div><span className="font-black block">{c.nome}</span><span className="text-[10px] text-slate-400">{formatarGrana(c.valor)}/mês • {c.mesesTotales}x</span></div>
                    <button onClick={() => removerContaFixaObrigatoria(c.id)} className="text-rose-500 cursor-pointer hover:scale-125 transition-transform"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-xs font-bold">
              <span>Restante após Dívidas:</span><span className="font-mono font-black text-emerald-400 text-sm">{formatarGrana(rendaRestanteAposDividas)}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 md:p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 card-magic">
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
                    return <circle key={pote.id} cx="50" cy="50" r="40" fill="transparent" stroke={pote.cor} strokeWidth="11" strokeDasharray={dashArray} strokeDashoffset={dashOffset} className="transition-all duration-1000 ease-out" />;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl md:text-4xl font-black tracking-tight animate-pulse">{totalMapeado}%</span>
                <span className={`text-[10px] font-semibold max-w-[80px] ${textMuted}`}>{disponivelGeral > 0 ? `${disponivelGeral}% livre` : '100% preenchido'}</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <h3 className="text-base font-black">Passo 2: Dividir Potes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 w-full">
                {potesAtivos.map(pote => (
                  <div key={pote.id} onClick={() => { setPotePendente(pote); setPercentualPendente(pote.percentual); }} className={`${cardClasse} p-3.5 rounded-2xl flex flex-col items-center text-center cursor-pointer relative group transition-all active:scale-95 hover:border-emerald-500/50 animate-pop-in hover:-translate-y-1`}>
                    <button onClick={(e) => { e.stopPropagation(); removerPote(pote.id); }} className="absolute top-1.5 right-1.5 text-slate-400 hover:text-rose-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3.5 h-3.5" /></button>
                    <span className="text-2xl md:text-3xl mb-1 group-hover:scale-110 transition-transform">{pote.iconeEmoji}</span>
                    <span className="text-[11px] md:text-xs font-bold truncate w-full">{pote.nome}</span>
                    <span className="text-xs font-black text-emerald-500">{pote.percentual}%</span>
                  </div>
                ))}
              </div>
              {totalMapeado === 100 ? (
                <button onClick={() => navegarPara('dashboard')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl btn-magic text-sm md:text-base cursor-pointer">Salvar Plano e Ir para o Painel</button>
              ) : (
                <div className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold py-3 px-4 rounded-2xl text-center">⚠️ A soma dos potes precisa atingir exatamente 100%.</div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className={`text-xs font-bold text-center md:text-left ${textMuted}`}>Adicionar potes:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {todosPotesDisponiveis.map((pote, idx) => {
                const selecionado = potesAtivos.some(p => p.id === pote.id);
                return (
                  <button key={pote.id} disabled={selecionado} onClick={() => solicitarAdicaoPote(pote)} style={{animationDelay: `${idx * 50}ms`}} className={`p-3 rounded-2xl border text-center flex flex-col items-center space-y-1.5 transition-all animate-pop-in ${selecionado ? 'opacity-40 border-slate-200 grayscale cursor-not-allowed bg-slate-900/40' : `${cardClasse} hover:border-emerald-500 active:scale-95 cursor-pointer hover:-translate-y-1`}`}>
                    <span className="text-2xl">{pote.iconeEmoji}</span>
                    <span className="text-[11px] font-bold truncate w-full">{pote.nome}</span>
                    <span className="text-[10px] font-extrabold text-emerald-500">{selecionado ? 'Adicionado' : '+ Adicionar'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {telaAtiva === 'dashboard' && (
        <div className="max-w-5xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          
          {aportePendenteValor !== '' && Number(aportePendenteValor) > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-400 animate-slide-up">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-emerald-500 shrink-0 animate-pulse" />
                <div>
                  <span className="font-black text-sm block">Aporte / Valor Inicial em Caixa Ativo</span>
                  <span className="text-xs text-emerald-300/80">Valor considerado no saldo real: {formatarGrana(Number(aportePendenteValor))}</span>
                </div>
              </div>
              <button onClick={() => setModalAportePendente(true)} className="bg-emerald-500 text-slate-950 font-black px-4 py-2 rounded-2xl text-xs btn-magic shrink-0">Ajustar Valor</button>
            </div>
          )}

          <div className={`${cardClasse} rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-4 border-2 border-emerald-500/40 relative overflow-hidden card-magic`}>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div>
              <span className={`text-xs uppercase font-extrabold tracking-widest block ${textMuted} flex items-center gap-1`}><Vault className="w-3.5 h-3.5 text-emerald-500"/> SALDO REAL DISPONÍVEL NA CONTA</span>
              <div className="text-4xl md:text-5xl font-black text-emerald-500 mt-2 font-mono tracking-tight drop-shadow-lg">
                {formatarGrana(saldoUnicoReal)}
              </div>
            </div>
            <span className={`text-[10px] md:text-xs font-semibold ${textMuted}`}>Valores retidos, gastos manuais e aportes extras já subtraídos. O que está aqui é dinheiro livre.</span>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button onClick={() => setModalAporteSobra(true)} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 btn-magic">
                <TrendingUp className="w-4 h-4" /> Aportar Sobra no Patrimônio
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`${cardClasse} rounded-3xl p-4 flex items-center justify-between border-l-4 border-l-emerald-500 card-magic hover:pl-5 transition-all cursor-pointer`} onClick={() => navegarPara('patrimonio')}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl drop-shadow-md">🐷</span>
                <div>
                  <span className={`text-[10px] uppercase font-extrabold ${textMuted}`}>Alocação em Patrimônio</span>
                  <span className="font-black text-sm block">Nosso Patrimônio ({pctNossoPatrimonio}%)</span>
                </div>
              </div>
              <span className="font-mono font-black text-emerald-500 text-base">{formatarGrana(saldoNossoPatrimonio)}</span>
            </div>
            <div className={`${cardClasse} rounded-3xl p-4 flex items-center justify-between border-l-4 border-l-cyan-500 card-magic hover:pl-5 transition-all cursor-pointer`} onClick={() => navegarPara('patrimonio')}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl drop-shadow-md">👶</span>
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
              <h3 className="text-lg font-black flex items-center gap-1.5"><LayoutGrid className="w-5 h-5 text-emerald-500"/> Limites de Gastos:</h3>
              <div className={`flex ${inputBg} p-1 rounded-xl border`}>
                <button onClick={() => setModoVisualizacaoPotes('coluna')} className={`p-1.5 rounded-lg transition-all ${modoVisualizacaoPotes === 'coluna' ? 'bg-emerald-500 text-white shadow-md' : textMuted}`}><Columns2 className="w-4 h-4" /></button>
                <button onClick={() => setModoVisualizacaoPotes('grid')} className={`p-1.5 rounded-lg transition-all ${modoVisualizacaoPotes === 'grid' ? 'bg-emerald-500 text-white shadow-md' : textMuted}`}><LayoutGrid className="w-4 h-4" /></button>
              </div>
            </div>
            <button onClick={() => setModalLancamento(true)} className="bg-emerald-500 text-white font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 btn-magic text-xs md:text-sm shadow-emerald-500/20">
              <Plus className="w-4 h-4" /> + Lançamento
            </button>
          </div>

          <div className={modoVisualizacaoPotes === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" : "space-y-4 max-w-2xl mx-auto"}>
            {potesAtivos.map((pote, idx) => {
              const saldoRealPote = getSaldoDisponivelPorPote(pote.id);
              const valorDiluidoNoPote = (totalEntradasGeral * pote.percentual) / 100;
              const percentualProgresso = pote.retencaoAutomatica ? pote.percentual : (valorDiluidoNoPote > 0 ? Math.max(0, Math.min(100, (saldoRealPote / valorDiluidoNoPote) * 100)) : 100);
              const dashOffset = 251.327 - (percentualProgresso * 2.51327);

              return (
                <div key={pote.id} style={{animationDelay: `${idx * 100}ms`}} className={`${cardClasse} rounded-3xl p-5 md:p-6 flex flex-col items-center text-center space-y-4 relative overflow-hidden card-magic animate-pop-in`}>
                  {pote.retencaoAutomatica && (
                    <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 shadow-sm">Automático</span>
                  )}
                  <div className="flex items-center space-x-2 font-black text-sm md:text-base">
                    <span className="text-2xl drop-shadow-md">{pote.iconeEmoji}</span>
                    <span>{pote.nome}</span>
                  </div>
                  <div className="relative w-32 h-32 md:w-36 md:h-36 flex items-center justify-center drop-shadow-xl group">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 absolute inset-0">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke={isDark ? "#1E293B" : "#E2E8F0"} strokeWidth="10" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke={saldoRealPote < 0 ? '#EF4444' : pote.cor} strokeWidth="10" strokeDasharray="251.327" strokeDashoffset={dashOffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="flex flex-col items-center justify-center z-10 group-hover:scale-110 transition-transform duration-300">
                      <span className={`text-sm md:text-base font-black font-mono ${saldoRealPote < 0 ? 'text-rose-500 animate-pulse' : ''}`}>{formatarGrana(saldoRealPote)}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Disponível</span>
                    </div>
                  </div>
                  <div className="space-y-0.5 w-full bg-slate-800/30 p-2 rounded-xl">
                    <span className={`text-[11px] font-bold block ${textMuted}`}>Alocado: {formatarGrana(valorDiluidoNoPote)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {telaAtiva === 'patrimonio' && (
        <div className="max-w-2xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-black flex items-center gap-2"><Vault className="w-6 h-6 text-emerald-500" /> Patrimônio</h2>
            <div className="flex gap-2">
              <button onClick={() => setModalAporteSobra(true)} className="bg-emerald-500/10 text-emerald-500 px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer hidden md:block border border-emerald-500/30 btn-magic">+ Aportar Sobra</button>
              <button onClick={() => setModalNovoPatrimonio(true)} className="bg-emerald-500 text-white px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer btn-magic">+ Item Manual</button>
            </div>
          </div>
          <button onClick={() => setModalAporteSobra(true)} className="w-full md:hidden bg-emerald-500/10 text-emerald-500 px-3.5 py-3 rounded-2xl text-xs font-bold cursor-pointer border border-emerald-500/30 flex items-center justify-center gap-2 btn-magic"><Vault className="w-4 h-4" /> + Aportar Sobra Aqui</button>
          <div className={`${cardClasse} rounded-3xl p-5 md:p-6 text-center space-y-2 border-2 border-emerald-500/30 card-magic shadow-emerald-500/5`}>
            <span className={`text-xs uppercase font-bold font-mono tracking-wider ${textMuted}`}>Patrimônio Total Consolidado</span>
            <div className="text-3xl md:text-4xl font-black text-emerald-500 font-mono drop-shadow-md">{formatarGrana(patrimonioTotalConsolidado)}</div>
          </div>
          <div className="space-y-3">
            <div className={`${cardClasse} rounded-2xl p-4 flex justify-between items-center border-l-4 border-l-emerald-500 animate-pop-in`} style={{animationDelay: '100ms'}}>
              <div className="flex items-center space-x-3"><span className="text-2xl">🐷</span><div><span className="font-bold block text-sm">Nosso Patrimônio (Pote)</span></div></div>
              <span className="font-mono font-black text-emerald-500 text-sm md:text-base">{formatarGrana(saldoNossoPatrimonio)}</span>
            </div>
            <div className={`${cardClasse} rounded-2xl p-4 flex justify-between items-center border-l-4 border-l-cyan-500 animate-pop-in`} style={{animationDelay: '200ms'}}>
              <div className="flex items-center space-x-3"><span className="text-2xl">👶</span><div><span className="font-bold block text-sm">Poupança Manuela</span></div></div>
              <span className="font-mono font-black text-cyan-500 text-sm md:text-base">{formatarGrana(saldoPatrimonioManuela)}</span>
            </div>
            {itensPatrimonioManuais.map((item, idx) => (
              <div key={item.id} className={`${cardClasse} rounded-2xl p-4 flex justify-between items-center border-l-4 border-l-amber-500 animate-pop-in`} style={{animationDelay: `${(idx+3)*100}ms`}}>
                <div className="flex items-center space-x-3"><span className="text-2xl">💎</span><div><span className="font-bold block text-sm">{item.nome}</span></div></div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-black text-amber-500 text-sm md:text-base">{formatarGrana(item.valor)}</span>
                  <button onClick={() => removerPatrimonioManual(item.id)} className="text-slate-400 hover:text-rose-500 cursor-pointer hover:scale-125 transition-transform"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {telaAtiva === 'dividas' && (
        <div className="max-w-2xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-black flex items-center gap-2"><CreditCard className="w-6 h-6 text-rose-500" /> Dívidas</h2>
            <button onClick={() => navegarPara('onboarding')} className="bg-emerald-500 text-white px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer btn-magic">+ Ajustar</button>
          </div>
          <div className={`${cardClasse} rounded-3xl p-5 md:p-6 text-center space-y-2 border-2 border-rose-500/30 card-magic shadow-rose-500/5`}>
            <span className={`text-xs uppercase font-bold font-mono tracking-wider ${textMuted}`}>Comprometido Mensalmente</span>
            <div className="text-3xl md:text-4xl font-black text-rose-500 font-mono drop-shadow-md">{formatarGrana(totalContasFixasValor)}</div>
          </div>
          <div className="space-y-3">
            {contasFixasObrigatorias.map((c, idx) => {
              const progressoMeses = c.mesesTotales > 0 ? ((c.mesesTotales - c.mesesRestantes) / c.mesesTotales) * 100 : 0;
              return (
                <div key={c.id} className={`${cardClasse} rounded-3xl p-5 space-y-3 border border-rose-500/20 animate-pop-in`} style={{animationDelay: `${idx*100}ms`}}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2"><span className="text-2xl">💳</span><div><span className="font-black text-base block">{c.nome}</span><span className="text-[10px] text-slate-400">Parcela: {formatarGrana(c.valor)} / mês</span></div></div>
                    <button onClick={() => pagarParcelaDivida(c.id)} disabled={c.mesesRestantes <= 0} className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 btn-magic shadow-md ${c.mesesRestantes <= 0 ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-rose-500 text-white'}`}><Check className="w-4 h-4" /> Pagar</button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold"><span className={textMuted}>{progressoMeses.toFixed(0)}% quitado</span><span className="font-mono text-rose-400">{c.mesesRestantes} / {c.mesesTotales} restam</span></div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-1000" style={{ width: `${progressoMeses}%` }}></div></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {telaAtiva === 'metas' && (
        <div className="max-w-2xl mx-auto p-3 md:p-6 w-full space-y-4 md:space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-black flex items-center gap-2"><Target className="w-6 h-6 text-emerald-500" /> Metas</h2>
            <button onClick={() => setModalNovaMeta(true)} className="bg-emerald-500 text-white px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer btn-magic">+ Nova Meta</button>
          </div>
          <div className="space-y-3">
            {metas.map((meta, idx) => {
              const progressoPct = Math.min(100, (meta.valorGuardado / meta.valorAlvo) * 100);
              return (
                <div key={meta.id} className={`${cardClasse} rounded-3xl p-5 space-y-3 border border-emerald-500/20 animate-pop-in card-magic`} style={{animationDelay: `${idx*100}ms`}}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2"><span className="text-2xl">🎯</span><span className="font-black text-base">{meta.nome}</span></div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => { setMetaSelecionadaId(meta.id); setModalDepositoMeta(true); }} className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 btn-magic"><ArrowUpRight className="w-3.5 h-3.5" /> Depositar</button>
                      <button onClick={() => removerMeta(meta.id)} className="text-slate-400 hover:text-rose-500 cursor-pointer hover:scale-125 transition-transform"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold"><span className={textMuted}>{progressoPct.toFixed(1)}%</span><span className="font-mono text-emerald-500">{formatarGrana(meta.valorGuardado)} / {formatarGrana(meta.valorAlvo)}</span></div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000" style={{ width: `${progressoPct}%` }}></div></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {telaAtiva === 'extrato' && (
        <div className="max-w-xl mx-auto p-3 md:p-6 w-full space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black flex items-center gap-2"><List className="w-6 h-6 text-emerald-500"/> Extrato</h2>
            <div className={`flex ${inputBg} p-1 rounded-xl border text-xs`}>
              <button onClick={() => setFiltroExtrato('todos')} className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${filtroExtrato === 'todos' ? 'bg-emerald-500 text-white' : textMuted}`}>Todos</button>
              <button onClick={() => setFiltroExtrato('entradas')} className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${filtroExtrato === 'entradas' ? 'bg-emerald-500 text-white' : textMuted}`}>Entradas</button>
              <button onClick={() => setFiltroExtrato('saidas')} className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${filtroExtrato === 'saidas' ? 'bg-emerald-500 text-white' : textMuted}`}>Saídas</button>
            </div>
          </div>
          <div className="space-y-2">
            {transacoesFiltradas.length === 0 && <p className="text-center text-xs py-8 text-slate-500">Nenhuma transação.</p>}
            {transacoesFiltradas.map((t, idx) => (
              <div key={t.id} className={`${cardClasse} rounded-2xl p-3.5 flex justify-between items-center text-xs md:text-sm animate-pop-in hover:-translate-y-0.5 transition-transform`} style={{animationDelay: `${Math.min(idx*50, 500)}ms`}}>
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-full ${t.tipo==='entrada'?'bg-emerald-500/10 text-emerald-500':'bg-rose-500/10 text-rose-500'}`}>
                    {t.tipo === 'entrada' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold block">{t.descricao}</span>
                    <span className={`text-[10px] font-semibold text-emerald-500 block`}>
                      {t.tipo === 'entrada' ? `Origem: ${t.origemEntrada}` : `Saiu de: ${t.poteNome}`}
                    </span>
                    <span className={`text-[9px] ${textMuted}`}>{t.data}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className={`font-black font-mono ${t.tipo === 'entrada' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.tipo === 'entrada' ? '+' : '-'} {formatarGrana(t.valor)}</span>
                  <button onClick={() => removerTransacao(t.id)} className="text-slate-400 hover:text-rose-500 cursor-pointer hover:scale-125 transition-transform"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      </main>

      {/* MODAL DE LANÇAMENTO ATUALIZADO COM CAIXA DE DESCRIÇÃO LIVRE */}
      {modalLancamento && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 md:p-6 max-w-sm w-full space-y-4 relative shadow-2xl animate-pop-in border border-emerald-500/20`}>
            <button onClick={() => setModalLancamento(false)} className="absolute top-4 right-4 text-slate-400 hover:rotate-90 transition-transform"><X className="w-5 h-5" /></button>
            <h3 className="text-base md:text-lg font-black flex items-center gap-2"><Sparkles className="w-5 h-5 text-emerald-500"/> Novo Lançamento</h3>
            
            <div className={`flex ${inputBg} p-1 rounded-xl border`}>
              <button onClick={() => setTipoLancamento('saida')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tipoLancamento === 'saida' ? 'bg-rose-500 text-white shadow-md' : textMuted}`}>Gasto (Saída)</button>
              <button onClick={() => setTipoLancamento('entrada')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tipoLancamento === 'entrada' ? 'bg-emerald-500 text-white shadow-md' : textMuted}`}>Renda (Entrada)</button>
            </div>

            {tipoLancamento === 'entrada' ? (
              <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
                <label className={`text-xs font-bold block ${textMuted}`}>Origem da Entrada:</label>
                <div className={`flex ${inputBg} p-1 rounded-xl border`}>
                  <button onClick={() => setOrigemEntradaModal('Mercado Livre')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${origemEntradaModal === 'Mercado Livre' ? 'bg-emerald-500 text-white shadow-md' : textMuted}`}>Mercado Livre</button>
                  <button onClick={() => setOrigemEntradaModal('CLT')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${origemEntradaModal === 'CLT' ? 'bg-emerald-500 text-white shadow-md' : textMuted}`}>CLT</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in slide-in-from-left-4 duration-300">
                <div className="space-y-1">
                  <label className={`text-xs font-bold block ${textMuted}`}>Descrição do Gasto:</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Jantar, Uber, Supermercado..." 
                    value={descricaoSaidaManual} 
                    onChange={(e) => setDescricaoSaidaManual(e.target.value)} 
                    className={`w-full ${inputBg} p-3 rounded-2xl text-xs md:text-sm font-bold border focus:border-emerald-500 transition-colors`} 
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold block ${textMuted}`}>Retirar de Onde:</label>
                  <select value={poteSelecionadoId} onChange={(e) => setPoteSelecionadoId(e.target.value)} className={`w-full ${inputBg} p-3 rounded-2xl text-xs md:text-sm font-bold border focus:border-emerald-500 transition-colors`}>
                    <option value="divida_fixa">💳 Direto do Saldo Livre (Disp: {formatarGrana(getSaldoDisponivelPorPote('divida_fixa'))})</option>
                    {potesAtivos.map(p => (
                      <option key={p.id} value={p.id}>{p.iconeEmoji} {p.nome} (Disp: {formatarGrana(getSaldoDisponivelPorPote(p.id))})</option>
                    ))}
                  </select>
                  <div className={`text-[10px] text-right font-black pt-1 ${getSaldoDisponivelPorPote(poteSelecionadoId) < 0 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>
                    Disponível neste pote: {formatarGrana(getSaldoDisponivelPorPote(poteSelecionadoId))}
                  </div>
                </div>
              </div>
            )}

            <input type="number" placeholder="Valor R$" value={valorLancamento} onChange={(e) => setValorLancamento(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full ${inputBg} p-3 rounded-2xl font-black text-lg font-mono border focus:border-emerald-500 transition-colors text-center`} />
            <button onClick={salvarLancamento} className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg btn-magic flex items-center justify-center gap-2"><Check className="w-5 h-5"/> Registrar Lançamento</button>
          </div>
        </div>
      )}

      {/* OUTROS MODAIS */}
      {potePendente && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`${cardClasse} rounded-3xl p-5 md:p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative animate-pop-in border border-emerald-500/20`}>
            <button onClick={() => setPotePendente(null)} className="absolute top-4 right-4 text-slate-400 hover:rotate-90 transition-transform"><X className="w-5 h-5" /></button>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl">{potePendente.iconeEmoji}</div>
            <div><h3 className="text-base md:text-lg font-black">{potePendente.nome}</h3><span className="text-xs text-slate-400">Arraste a porcentagem</span></div>
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className={`w-24 h-24 rounded-full border-8 border-emerald-500 flex flex-col items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-100'} shadow-inner`}>
                <span className="text-xl font-black">{percentualPendente}%</span>
                <span className="text-[9px] font-bold text-emerald-500">{formatarGrana((rendaRestanteAposDividas * percentualPendente) / 100)}</span>
              </div>
            </div>
            <input type="range" min="0" max={100 - potesAtivos.filter(p => p.id !== potePendente.id).reduce((acc, p) => acc + p.percentual, 0)} value={percentualPendente} onChange={(e) => setPercentualPendente(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            <button onClick={confirmarAdicionarPote} className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg btn-magic flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Confirmar</button>
          </div>
        </div>
      )}

      {animacaoEntrada && animacaoEntrada.ativo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-6 max-w-md w-full text-center space-y-5 shadow-2xl relative border-2 border-emerald-500/50 animate-pop-in max-h-[90vh] overflow-y-auto`}>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center animate-bounce shadow-[0_0_30px_rgba(16,185,129,0.3)]"><Sparkles className="w-8 h-8" /></div>
            <div><span className="text-xs uppercase font-extrabold text-emerald-500 tracking-wider">Entrada Registrada! Dinheiro Distribuído</span><h3 className="text-3xl font-black font-mono mt-2 drop-shadow-md">{formatarGrana(animacaoEntrada.valorTotal)}</h3></div>
            <div className="space-y-2 text-left">
              {animacaoEntrada.detalhes.map((item, idx) => (
                <div key={idx} style={{animationDelay: `${idx*100}ms`}} className={`${inputBg} p-3 rounded-2xl border flex justify-between items-center text-xs font-bold animate-slide-up`}>
                  <span>{item.icone} {item.nome} ({item.percentual}%)</span><span className="font-mono text-emerald-500">{formatarGrana(item.valor)}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setAnimacaoEntrada(null)} className="w-full bg-emerald-500 text-white font-black py-3.5 rounded-2xl shadow-lg btn-magic mt-4">Concluir</button>
          </div>
        </div>
      )}

      {modalAporteSobra && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 max-w-sm w-full space-y-4 relative shadow-2xl animate-pop-in border border-emerald-500/20`}>
            <button onClick={() => setModalAporteSobra(false)} className="absolute top-4 right-4 text-slate-400 hover:rotate-90 transition-transform"><X className="w-5 h-5" /></button>
            <h3 className="text-base md:text-lg font-black text-emerald-500 flex items-center gap-2"><Vault className="w-5 h-5" /> Aportar Sobra</h3>
            <div className="space-y-3">
              <select value={destinoAporteSobra} onChange={(e) => setDestinoAporteSobra(e.target.value as any)} className={`w-full ${inputBg} p-3 rounded-2xl text-xs font-bold border focus:border-emerald-500 transition-colors`}>
                <option value="nosso_patrimonio">🐷 Nosso Patrimônio</option>
                <option value="patrimonio_manuela">👶 Poupança Manuela</option>
              </select>
              <label className={`text-[10px] font-bold block text-right ${textMuted}`}>Máximo disponível: {formatarGrana(saldoUnicoReal)}</label>
              <input type="number" placeholder="Valor R$" value={valorAporteSobra} onChange={(e) => setValorAporteSobra(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full ${inputBg} p-3 rounded-2xl font-black text-lg text-center font-mono border focus:border-emerald-500 transition-colors`} />
            </div>
            <button onClick={efetivarAporteSobraPatrimonio} className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg btn-magic"><Check className="w-5 h-5 inline mr-1"/> Confirmar Aporte</button>
          </div>
        </div>
      )}

      {modalAportePendente && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 max-w-sm w-full space-y-4 relative shadow-2xl animate-pop-in border border-emerald-500/20`}>
            <button onClick={() => setModalAportePendente(false)} className="absolute top-4 right-4 text-slate-400 hover:rotate-90 transition-transform"><X className="w-5 h-5" /></button>
            <h3 className="text-base md:text-lg font-black">Ajustar Saldo em Caixa</h3>
            <input type="number" placeholder="Valor R$" value={aportePendenteValor} onChange={(e) => setAportePendenteValor(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full ${inputBg} p-3 rounded-2xl font-black text-lg text-center font-mono border focus:border-emerald-500 transition-colors`} />
            <button onClick={async () => { await salvarDadosNaNuvem({ aportePendenteValor }); setModalAportePendente(false); }} className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg btn-magic">Salvar Alteração</button>
          </div>
        </div>
      )}

      {modalNovoPatrimonio && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 max-w-sm w-full space-y-4 relative shadow-2xl animate-pop-in border border-emerald-500/20`}>
            <button onClick={() => setModalNovoPatrimonio(false)} className="absolute top-4 right-4 text-slate-400 hover:rotate-90 transition-transform"><X className="w-5 h-5" /></button>
            <h3 className="text-base md:text-lg font-black flex items-center gap-2">💎 Item de Patrimônio</h3>
            <input type="text" placeholder="Nome (Ex: Casa, Carro)" value={nomeNovoPatrimonio} onChange={(e) => setNomeNovoPatrimonio(e.target.value)} className={`w-full ${inputBg} p-3 rounded-2xl text-xs font-bold border focus:border-emerald-500 transition-colors`} />
            <input type="number" placeholder="Valor Atualizado R$" value={valorNovoPatrimonio} onChange={(e) => setValorNovoPatrimonio(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full ${inputBg} p-3 rounded-2xl font-black text-lg text-center font-mono border focus:border-emerald-500 transition-colors`} />
            <button onClick={adicionarPatrimonioManual} className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg btn-magic"><Check className="w-5 h-5 inline mr-1"/> Adicionar</button>
          </div>
        </div>
      )}

      {modalNovaMeta && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 max-w-sm w-full space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto animate-pop-in border border-emerald-500/20`}>
            <button onClick={() => setModalNovaMeta(false)} className="absolute top-4 right-4 text-slate-400 hover:rotate-90 transition-transform"><X className="w-5 h-5" /></button>
            <h3 className="text-base md:text-lg font-black flex items-center gap-2"><Target className="w-5 h-5 text-emerald-500"/> Criar Meta</h3>
            <input type="text" placeholder="Nome (Ex: Viagem)" value={nomeNovaMeta} onChange={(e) => setNomeNovaMeta(e.target.value)} className={`w-full ${inputBg} p-3 rounded-2xl text-xs font-bold border focus:border-emerald-500`} />
            <input type="number" placeholder="Valor Alvo Total R$" value={valorNovaMeta} onChange={(e) => setValorNovaMeta(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full ${inputBg} p-3 rounded-2xl font-black font-mono border focus:border-emerald-500`} />
            <div className="space-y-1">
              <label className={`text-[10px] font-bold block text-right ${textMuted}`}>Puxar do Saldo Livre (Máx: {formatarGrana(saldoUnicoReal)})</label>
              <input type="number" placeholder="Aporte Inicial R$ (Opcional)" value={guardadoNovaMeta} onChange={(e) => setGuardadoNovaMeta(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full ${inputBg} p-3 rounded-2xl font-black font-mono border focus:border-emerald-500`} />
            </div>
            <input type="number" placeholder="Prazo Estimado (Meses)" value={mesesNovaMeta} onChange={(e) => setMesesNovaMeta(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full ${inputBg} p-3 rounded-2xl font-black font-mono border focus:border-emerald-500`} />
            <button onClick={adicionarMeta} className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg btn-magic"><Check className="w-5 h-5 inline mr-1"/> Salvar Meta</button>
          </div>
        </div>
      )}

      {modalDepositoMeta && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${cardClasse} rounded-3xl p-5 max-w-sm w-full space-y-4 relative shadow-2xl animate-pop-in border border-emerald-500/20`}>
            <button onClick={() => setModalDepositoMeta(false)} className="absolute top-4 right-4 text-slate-400 hover:rotate-90 transition-transform"><X className="w-5 h-5" /></button>
            <h3 className="text-base md:text-lg font-black flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-emerald-500"/> Depositar na Meta</h3>
            <div className="space-y-3">
              <select value={origemDepositoMeta} onChange={(e) => setOrigemDepositoMeta(e.target.value as any)} className={`w-full ${inputBg} p-3 rounded-2xl text-xs font-bold border focus:border-emerald-500 transition-colors`}>
                <option value="disponivel">💳 Tirar do Saldo Real ({formatarGrana(saldoUnicoReal)})</option>
                <option value="nosso_patrimonio">🐷 Resgatar Nosso Patrimônio ({formatarGrana(saldoNossoPatrimonio)})</option>
                <option value="patrimonio_manuela">👶 Resgatar Poup. Manuela ({formatarGrana(saldoPatrimonioManuela)})</option>
              </select>
              <input type="number" placeholder="Valor do Depósito R$" value={valorDepositoMeta} onChange={(e) => setValorDepositoMeta(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full ${inputBg} p-3 rounded-2xl font-black text-lg text-center font-mono border focus:border-emerald-500 transition-colors`} />
            </div>
            <button onClick={efetivarTransferenciaMeta} className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg btn-magic"><Check className="w-5 h-5 inline mr-1"/> Efetivar Depósito</button>
          </div>
        </div>
      )}

      {menuAberto && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex justify-end animate-in fade-in duration-200" onClick={() => setMenuAberto(false)}>
          <div className={`${cardClasse} w-72 md:w-80 h-full p-5 space-y-5 overflow-y-auto relative border-l flex flex-col justify-between animate-in slide-in-from-right duration-300 shadow-2xl`} onClick={(e) => e.stopPropagation()}>
            <div className="space-y-5">
              <button onClick={() => setMenuAberto(false)} className="absolute top-4 right-4 text-slate-400 hover:rotate-90 transition-transform"><X className="w-5 h-5" /></button>
              <h3 className="text-lg font-black text-emerald-500 flex items-center gap-2"><Sparkles className="w-5 h-5"/> MEU IMPÉRIO</h3>
              <div className="space-y-1.5 text-xs md:text-sm font-bold">
                <button onClick={() => navegarPara('perfil')} className={`w-full text-left p-3 rounded-2xl btn-magic flex items-center gap-2.5 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} text-emerald-500 border border-emerald-500/20`}><User className="w-4 h-4" /> Ver Meu Perfil Gamificado</button>
                <button onClick={() => navegarPara('dashboard')} className={`w-full text-left p-3 rounded-2xl btn-magic flex items-center gap-2.5 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}><Home className="w-4 h-4 text-emerald-500" /> Início / Dashboard</button>
                <button onClick={() => navegarPara('onboarding')} className={`w-full text-left p-3 rounded-2xl btn-magic flex items-center gap-2.5 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} text-amber-500`}><Sliders className="w-4 h-4" /> Editar Configurações</button>
                <button onClick={() => navegarPara('dividas')} className={`w-full text-left p-3 rounded-2xl btn-magic flex items-center gap-2.5 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}><CreditCard className="w-4 h-4 text-rose-500" /> Controle de Dívidas</button>
                <button onClick={() => navegarPara('metas')} className={`w-full text-left p-3 rounded-2xl btn-magic flex items-center gap-2.5 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}><Target className="w-4 h-4 text-emerald-500" /> Metas Financeiras</button>
                <button onClick={() => navegarPara('patrimonio')} className={`w-full text-left p-3 rounded-2xl btn-magic flex items-center gap-2.5 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}><Vault className="w-4 h-4 text-emerald-500" /> Patrimônio Geral</button>
                <button onClick={() => navegarPara('extrato')} className={`w-full text-left p-3 rounded-2xl btn-magic flex items-center gap-2.5 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}><List className="w-4 h-4 text-emerald-500" /> Extrato de Lançamentos</button>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button onClick={reiniciarSistemaGeral} className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold p-3 rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors"><Trash2 className="w-4 h-4" /> Reiniciar (Zerar Tudo)</button>
              {onLogout && <button onClick={onLogout} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold p-3 rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors"><LogOut className="w-4 h-4" /> Sair da Conta</button>}
            </div>
          </div>
        </div>
      )}

      <nav className={`fixed bottom-0 inset-x-0 border-t p-1.5 flex justify-around items-center z-40 transition-colors duration-500 ${isDark ? 'bg-slate-950/95 border-slate-800' : 'bg-white/95 border-slate-200'} backdrop-blur-lg`}>
        <button onClick={() => navegarPara('dashboard')} className={`flex flex-col items-center p-1.5 text-[10px] font-bold cursor-pointer hover:-translate-y-1 transition-transform ${telaAtiva === 'dashboard' ? 'text-emerald-500 scale-110' : 'opacity-70 hover:opacity-100'}`}><Home className="w-5 h-5" /> Início</button>
        <button onClick={() => navegarPara('extrato')} className={`flex flex-col items-center p-1.5 text-[10px] font-bold cursor-pointer hover:-translate-y-1 transition-transform ${telaAtiva === 'extrato' ? 'text-emerald-500 scale-110' : 'opacity-70 hover:opacity-100'}`}><List className="w-5 h-5" /> Extrato</button>
        <button onClick={() => setModalLancamento(true)} className="p-3 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/40 -mt-6 btn-magic"><Plus className="w-5 h-5" /></button>
        <button onClick={() => navegarPara('metas')} className={`flex flex-col items-center p-1.5 text-[10px] font-bold cursor-pointer hover:-translate-y-1 transition-transform ${telaAtiva === 'metas' ? 'text-emerald-500 scale-110' : 'opacity-70 hover:opacity-100'}`}><Target className="w-5 h-5" /> Metas</button>
        <button onClick={() => navegarPara('perfil')} className={`flex flex-col items-center p-1.5 text-[10px] font-bold cursor-pointer hover:-translate-y-1 transition-transform ${telaAtiva === 'perfil' ? 'text-emerald-500 scale-110' : 'opacity-70 hover:opacity-100'}`}><User className="w-5 h-5" /> Perfil</button>
      </nav>
    </div>
  );
};

export default FinanceCenterView;
