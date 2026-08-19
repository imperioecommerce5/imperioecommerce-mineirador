import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { NewAnalysisView } from './components/NewAnalysisView';
import { ProductsListView } from './components/ProductsListView';
import { RankingView } from './components/RankingView';
import { ComparatorView } from './components/ComparatorView';
import { SettingsView } from './components/SettingsView';
import { AnalysisResultModal } from './components/AnalysisResultModal';
import { ProductAnalysis, SystemSettings } from './types';
import {
  getStoredProducts,
  getStoredSettings,
  saveProductAnalysis,
  saveStoredSettings,
  deleteProductAnalysis,
  duplicateProductAnalysis,
} from './utils/storage';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [products, setProducts] = useState<ProductAnalysis[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(getStoredSettings());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal / Selection states
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductAnalysis | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductAnalysis | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial data
  const refreshProducts = () => {
    const loaded = getStoredProducts();
    setProducts(loaded);
  };

  useEffect(() => {
    refreshProducts();
    const loadedSettings = getStoredSettings();
    setSettings(loadedSettings);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handlers
  const handleSaveProduct = (
    productData: Omit<
      ProductAnalysis,
      'id' | 'createdAt' | 'updatedAt' | 'scoreBreakdown' | 'diagnosis' | 'calculatedFinancials'
    > & { id?: string }
  ) => {
    const saved = saveProductAnalysis(productData);
    refreshProducts();
    setEditingProduct(null);
    setSelectedProductForModal(saved);
    setIsResultModalOpen(true);
    showToast(`Produto "${saved.name}" salvo e analisado com sucesso!`);
  };

  const handleEditProduct = (product: ProductAnalysis) => {
    setEditingProduct(product);
    setCurrentView('nova-analise');
    setIsResultModalOpen(false);
  };

  const handleDuplicateProduct = (id: string) => {
    const duplicated = duplicateProductAnalysis(id);
    if (duplicated) {
      refreshProducts();
      showToast(`Produto duplicado com sucesso: "${duplicated.name}"`);
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteProductAnalysis(id);
    refreshProducts();
    setSelectedForCompare((prev) => prev.filter((item) => item !== id));
    showToast('Produto excluído com sucesso.');
  };

  const handleSelectProduct = (product: ProductAnalysis) => {
    setSelectedProductForModal(product);
    setIsResultModalOpen(true);
  };

  const handleToggleCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        showToast('Máximo de 3 produtos para comparação simultânea.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleGoToCompare = () => {
    setCurrentView('comparador');
  };

  const handleSaveSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    refreshProducts();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-amber-300 selection:text-slate-950 transition-colors duration-150">
      {/* Top Header */}
      <Header
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onNavigate={(view) => {
          if (view === 'nova-analise') setEditingProduct(null);
          setCurrentView(view);
        }}
        currentView={currentView}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            if (view === 'nova-analise') setEditingProduct(null);
            setCurrentView(view);
          }}
          products={products}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentView === 'dashboard' && (
            <DashboardView
              products={products}
              onNavigate={(view) => {
                if (view === 'nova-analise') setEditingProduct(null);
                setCurrentView(view);
              }}
              onSelectProduct={handleSelectProduct}
            />
          )}

          {currentView === 'nova-analise' && (
            <NewAnalysisView
              initialData={editingProduct}
              settings={settings}
              onSave={handleSaveProduct}
              onCancel={() => {
                setEditingProduct(null);
                setCurrentView('dashboard');
              }}
            />
          )}

          {currentView === 'produtos' && (
            <ProductsListView
              products={products}
              onSelectProduct={handleSelectProduct}
              onEditProduct={handleEditProduct}
              onDuplicateProduct={handleDuplicateProduct}
              onDeleteProduct={handleDeleteProduct}
              onNavigate={(view) => {
                if (view === 'nova-analise') setEditingProduct(null);
                setCurrentView(view);
              }}
              selectedForCompare={selectedForCompare}
              onToggleCompare={handleToggleCompare}
              onGoToCompare={handleGoToCompare}
            />
          )}

          {currentView === 'ranking' && (
            <RankingView
              products={products}
              onSelectProduct={handleSelectProduct}
              onNavigate={(view) => {
                if (view === 'nova-analise') setEditingProduct(null);
                setCurrentView(view);
              }}
            />
          )}

          {currentView === 'comparador' && (
            <ComparatorView
              products={products}
              initialSelectedIds={selectedForCompare}
              onSelectProduct={handleSelectProduct}
              onNavigate={(view) => {
                if (view === 'nova-analise') setEditingProduct(null);
                setCurrentView(view);
              }}
            />
          )}

          {currentView === 'configuracoes' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onReloadData={refreshProducts}
            />
          )}
        </main>
      </div>

      {/* Product Detailed Result Modal */}
      {selectedProductForModal && (
        <AnalysisResultModal
          product={selectedProductForModal}
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          onEdit={(p) => handleEditProduct(p)}
          onDuplicate={(p) => handleDuplicateProduct(p.id)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
