import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { LogIn, LogOut, LoaderCircle } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { NewAnalysisView } from './components/NewAnalysisView';
import { ProductsListView } from './components/ProductsListView';
import { RankingView } from './components/RankingView';
import { ComparatorView } from './components/ComparatorView';
import { SettingsView } from './components/SettingsView';
import { InventoryView } from './components/InventoryView';
import { FinanceView } from './components/FinanceView';
import { FinanceCenterView } from './components/FinanceCenterView';
import { AnalysisResultModal } from './components/AnalysisResultModal';
import { ProductAnalysis, SystemSettings, InventoryItem, InventoryMovement, InventoryMovementType, SaleRecord, FinancePlan, CashEntry, DebtRecord, FinanceCategory } from './types';
import { DEFAULT_SETTINGS } from './utils/calculator';
import { auth, googleProvider } from './firebase';
import { getStoredProducts, getStoredSettings, saveProductAnalysis, saveStoredSettings, deleteProductAnalysis, duplicateProductAnalysis } from './utils/storage';
import { getInventory, saveInventoryItem, deleteInventoryItem, getInventoryMovements, createInventoryMovement, deleteInventoryMovement } from './utils/inventory';
import { getSales, saveSale, deleteSale } from './utils/sales';
import { getFinanceCenter, savePlan, saveCashEntry, deleteCashEntry, saveDebt, deleteDebt, defaultPlan, transferBetweenCashboxes, getFinanceCategories, saveFinanceCategory, deleteFinanceCategory } from './utils/financeCenter';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [products, setProducts] = useState<ProductAnalysis[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [financePlan,setFinancePlan]=useState<FinancePlan>(defaultPlan);
  const [cashEntries,setCashEntries]=useState<CashEntry[]>([]);
  const [debts,setDebts]=useState<DebtRecord[]>([]);
  const [financeCategories,setFinanceCategories]=useState<FinanceCategory[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductAnalysis | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductAnalysis | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setAuthLoading(false); }), []);

  const refreshProducts = async () => {
    if (!auth.currentUser) return;
    try { setProducts(await getStoredProducts()); }
    catch (e) { console.error(e); showToast('Não foi possível carregar o banco. Verifique as regras do Firestore.'); }
  };

  useEffect(() => {
    if (!user) { setProducts([]); setInventory([]); setInventoryMovements([]); setSales([]); setCashEntries([]); setDebts([]); return; }
    (async () => {
      setDataLoading(true);
      try {
        const [loadedProducts, loadedSettings, loadedInventory, loadedMovements, loadedSales, fc] = await Promise.all([getStoredProducts(), getStoredSettings(), getInventory(), getInventoryMovements(), getSales(), getFinanceCenter()]);
        setProducts(loadedProducts); setSettings(loadedSettings); setInventory(loadedInventory); setInventoryMovements(loadedMovements); setSales(loadedSales); setFinancePlan(fc.plan); setCashEntries(fc.entries); setDebts(fc.debts);
        setFinanceCategories(await getFinanceCategories());
      } catch (e) { console.error(e); }
      finally { setDataLoading(false); }
    })();
  }, [user]);

  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3500); };

  if (authLoading) return <div className="min-h-screen grid place-items-center bg-slate-950 text-white"><LoaderCircle className="w-8 h-8 animate-spin text-amber-400" /></div>;

  if (!user) return (
    <div className="min-h-screen bg-slate-950 text-white grid place-items-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl text-center">
        <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-xl">I<span className="text-white text-sm">M</span></div>
        <h1 className="text-2xl font-black">IMPERIO<span className="text-amber-400">ECOMMERCE</span> MINEIRADOR</h1>
        <p className="mt-2 text-sm text-slate-400">Acesso privado ao sistema de análise e mineração.</p>
        <button onClick={() => signInWithPopup(auth, googleProvider)} className="mt-7 w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-4 py-3 cursor-pointer">
          <LogIn className="w-4 h-4" /> Entrar com Google
        </button>
      </div>
    </div>
  );

  const handleSaveProduct = async (productData: any) => {
    try { const saved = await saveProductAnalysis(productData); await refreshProducts(); setEditingProduct(null); setSelectedProductForModal(saved); setIsResultModalOpen(true); showToast(`Produto "${saved.name}" salvo e analisado com sucesso!`); }
    catch (e) { console.error(e); showToast('Erro ao salvar no Firestore.'); }
  };
  const handleEditProduct = (product: ProductAnalysis) => { setEditingProduct(product); setCurrentView('nova-analise'); setIsResultModalOpen(false); };
  const handleDuplicateProduct = async (id: string) => { const duplicated = await duplicateProductAnalysis(id); if (duplicated) { await refreshProducts(); showToast(`Produto duplicado com sucesso: "${duplicated.name}"`); } };
  const handleDeleteProduct = async (id: string) => { await deleteProductAnalysis(id); await refreshProducts(); setSelectedForCompare((prev) => prev.filter((item) => item !== id)); showToast('Produto excluído com sucesso.'); };
  const handleSelectProduct = (product: ProductAnalysis) => { setSelectedProductForModal(product); setIsResultModalOpen(true); };
  const handleToggleCompare = (id: string) => setSelectedForCompare((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : prev.length >= 3 ? (showToast('Máximo de 3 produtos para comparação simultânea.'), prev) : [...prev, id]);
  const handleSaveSettings = async (newSettings: SystemSettings) => { setSettings(newSettings); await saveStoredSettings(newSettings); await refreshProducts(); };
  const refreshInventory = async () => { if (auth.currentUser) { const [items,movs]=await Promise.all([getInventory(),getInventoryMovements()]); setInventory(items); setInventoryMovements(movs); } };
  const handleSaveInventory = async (data: any) => { try { await saveInventoryItem(data); await refreshInventory(); showToast(`SKU ${data.sku} salvo com sucesso!`); } catch(e){ console.error(e); showToast('Erro ao salvar estoque no Firestore.'); throw e; } };
  const handleDeleteInventory = async (id: string) => { await deleteInventoryItem(id); await refreshInventory(); showToast('SKU excluído do estoque.'); };
  const handleInventoryMovement = async (data: {inventoryId:string; type:InventoryMovementType; quantity:number; note?:string}) => {
    try { await createInventoryMovement(data); await refreshInventory(); showToast('Movimentação registrada e estoque atualizado!'); }
    catch(e:any){ console.error(e); showToast(e?.message || 'Erro ao movimentar estoque.'); throw e; }
  };
  const handleDeleteInventoryMovement = async (id:string) => {
    try { await deleteInventoryMovement(id); await refreshInventory(); showToast('Movimentação excluída e estoque revertido!'); }
    catch(e:any){ console.error(e); showToast(e?.message || 'Erro ao excluir movimentação.'); throw e; }
  };

  const refreshSalesAndInventory = async () => { const [ss,ii]=await Promise.all([getSales(),getInventory()]); setSales(ss); setInventory(ii); };
  const handleSaveSale = async (data:any) => { try { await saveSale(data); await refreshSalesAndInventory(); showToast('Venda salva e estoque atualizado!'); } catch(e:any){ console.error(e); showToast(e?.message||'Erro ao salvar venda.'); throw e; } };
  const handleDeleteSale = async (id:string) => { try { await deleteSale(id); await refreshSalesAndInventory(); showToast('Venda excluída e estoque devolvido!'); } catch(e:any){ showToast(e?.message||'Erro ao excluir venda.'); throw e; } };

  const refreshFinanceCenter=async()=>{const x=await getFinanceCenter();setFinancePlan(x.plan);setCashEntries(x.entries);setDebts(x.debts);};
  const handlePlan=async(p:FinancePlan)=>{await savePlan(p);await refreshFinanceCenter();showToast('Planejamento financeiro salvo!');};
  const handleCash=async(x:any)=>{await saveCashEntry(x);await refreshFinanceCenter();showToast('Movimentação financeira salva!');};
  const handleDeleteCash=async(id:string)=>{await deleteCashEntry(id);await refreshFinanceCenter();showToast('Movimentação excluída.');};
  const handleDebt=async(x:any)=>{await saveDebt(x);await refreshFinanceCenter();showToast('Dívida cadastrada!');};
  const handleDeleteDebt=async(id:string)=>{await deleteDebt(id);await refreshFinanceCenter();showToast('Dívida excluída.');};
  const handleTransfer=async(direction:'BUSINESS_TO_PERSONAL'|'PERSONAL_TO_BUSINESS',amount:number,date:string,note:string)=>{await transferBetweenCashboxes(direction,amount,date,note);await refreshFinanceCenter();showToast('Transferência realizada!');};

  const refreshFinanceCategories=async()=>setFinanceCategories(await getFinanceCategories());
  const handleFinanceCategory=async(x:any)=>{await saveFinanceCategory(x);await refreshFinanceCategories();showToast('Categoria salva!');};
  const handleDeleteFinanceCategory=async(id:string)=>{await deleteFinanceCategory(id);await refreshFinanceCategories();showToast('Categoria excluída.');};


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-amber-300 selection:text-slate-950 transition-colors duration-150">
      <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} onNavigate={(view) => { if (view === 'nova-analise') setEditingProduct(null); setCurrentView(view); }} currentView={currentView} />
      <div className="fixed bottom-5 left-5 z-40 hidden sm:flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 shadow-lg text-xs">
        <span className="max-w-44 truncate font-semibold">{user.email}</span><button onClick={() => signOut(auth)} title="Sair" className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><LogOut className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 flex w-full min-w-0 overflow-x-hidden">
        <Sidebar currentView={currentView} onNavigate={(view) => { if (view === 'nova-analise') setEditingProduct(null); setCurrentView(view); }} products={products} isMobileOpen={isMobileMenuOpen} onCloseMobile={() => setIsMobileMenuOpen(false)} />
        <main className="flex-1 w-full max-w-full p-3 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {dataLoading ? <div className="min-h-[50vh] grid place-items-center"><LoaderCircle className="w-7 h-7 animate-spin text-amber-500" /></div> : <>
            {currentView === 'dashboard' && <DashboardView products={products} onNavigate={(view) => { if (view === 'nova-analise') setEditingProduct(null); setCurrentView(view); }} onSelectProduct={handleSelectProduct} />}
            {currentView === 'nova-analise' && <NewAnalysisView initialData={editingProduct} settings={settings} onSave={handleSaveProduct} onCancel={() => { setEditingProduct(null); setCurrentView('dashboard'); }} />}
            {currentView === 'produtos' && <ProductsListView products={products} onSelectProduct={handleSelectProduct} onEditProduct={handleEditProduct} onDuplicateProduct={handleDuplicateProduct} onDeleteProduct={handleDeleteProduct} onNavigate={(view) => { if (view === 'nova-analise') setEditingProduct(null); setCurrentView(view); }} selectedForCompare={selectedForCompare} onToggleCompare={handleToggleCompare} onGoToCompare={() => setCurrentView('comparador')} />}
            {currentView === 'ranking' && <RankingView products={products} onSelectProduct={handleSelectProduct} onNavigate={(view) => { if (view === 'nova-analise') setEditingProduct(null); setCurrentView(view); }} />}
            {currentView === 'comparador' && <ComparatorView products={products} initialSelectedIds={selectedForCompare} onSelectProduct={handleSelectProduct} onNavigate={(view) => { if (view === 'nova-analise') setEditingProduct(null); setCurrentView(view); }} />}
            {currentView === 'estoque' && <InventoryView items={inventory} movements={inventoryMovements} onSave={handleSaveInventory} onDelete={handleDeleteInventory} onMove={handleInventoryMovement} onDeleteMovement={handleDeleteInventoryMovement} />}
            {currentView === 'financeiro' && <FinanceView sales={sales} items={inventory} onSave={handleSaveSale} onDelete={handleDeleteSale} />}
            {currentView === 'centro-financeiro' && <FinanceCenterView plan={financePlan} entries={cashEntries} debts={debts} onPlan={handlePlan} onEntry={handleCash} onDeleteEntry={handleDeleteCash} onDebt={handleDebt} onDeleteDebt={handleDeleteDebt} onTransfer={handleTransfer} categories={financeCategories} onCategory={handleFinanceCategory} onDeleteCategory={handleDeleteFinanceCategory} />}
            {currentView === 'configuracoes' && <SettingsView settings={settings} onSaveSettings={handleSaveSettings} onReloadData={refreshProducts} />}
          </>}
        </main>
      </div>
      {selectedProductForModal && <AnalysisResultModal product={selectedProductForModal} isOpen={isResultModalOpen} onClose={() => setIsResultModalOpen(false)} onEdit={(p) => handleEditProduct(p)} onDuplicate={(p) => handleDuplicateProduct(p.id)} />}
      {toastMessage && <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:bottom-5 sm:right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400" /><span>{toastMessage}</span></div>}
    </div>
  );
}
