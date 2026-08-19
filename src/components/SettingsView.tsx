import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  RotateCcw,
  Save,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Target,
  Truck,
  Database,
  FileJson,
} from 'lucide-react';
import { SystemSettings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/calculator';
import { exportDataAsJson, importDataFromJson, clearAllData } from '../utils/storage';

interface SettingsViewProps {
  settings: SystemSettings;
  onSaveSettings: (newSettings: SystemSettings) => void;
  onReloadData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onReloadData,
}) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleChange = (field: keyof SystemSettings, val: string | number) => {
    const num = Math.max(0, Number(val) || 0);
    setFormData((prev) => ({
      ...prev,
      [field]: num,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSuccessMsg('Configurações da régua salvas com sucesso!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleResetDefaults = () => {
    setFormData(DEFAULT_SETTINGS);
    onSaveSettings(DEFAULT_SETTINGS);
    setSuccessMsg('Configurações restauradas para os valores padrão de fábrica.');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `imperio-mineirador-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataFromJson(content);
      setImportStatus(res);
      if (res.success) {
        onReloadData();
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmClear = () => {
    clearAllData();
    onReloadData();
    setShowClearConfirm(false);
    setSuccessMsg('Todos os dados foram resetados.');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const totalWeights =
    Number(formData.weightDemand) +
    Number(formData.weightRate150) +
    Number(formData.weightRate300) +
    Number(formData.weightNewEntrants) +
    Number(formData.weightAdAge) +
    Number(formData.weightFullComp);

  return (
    <div className="w-full max-w-none space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Parametrização do Algoritmo
            </span>
            <span className="text-2xs text-slate-400 font-semibold">• Régua Editável</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-amber-500" />
            <span>Configurações da Régua e Sistema</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Ajuste os números-base, metas diárias (5 vendas/dia) e pesos da pontuação sem necessidade de mexer no código.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restaurar Padrões</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Import Status Notification */}
      {importStatus && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            importStatus.success
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300'
          }`}
        >
          {importStatus.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{importStatus.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: BENCHMARKS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Target className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">
              1. Metas e Números-Base de Corte
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-2xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                Meta Diária (vendas/dia)
              </label>
              <input
                type="number"
                min="1"
                value={formData.targetDailySales}
                onChange={(e) => handleChange('targetDailySales', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
              />
              <span className="text-2xs text-slate-400 dark:text-slate-500">Padrão: 5 vendas</span>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                Meta Mensal (vendas/mês)
              </label>
              <input
                type="number"
                min="1"
                value={formData.targetMonthlySales}
                onChange={(e) => handleChange('targetMonthlySales', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
              />
              <span className="text-2xs text-slate-400 dark:text-slate-500">Padrão: 150 vendas</span>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                Demanda Mínima (Base)
              </label>
              <input
                type="number"
                min="100"
                value={formData.demandMin}
                onChange={(e) => handleChange('demandMin', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
              />
              <span className="text-2xs text-slate-400 dark:text-slate-500">Padrão: 5.000 vendas</span>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                Anúncios 150+/mês (Base)
              </label>
              <input
                type="number"
                min="1"
                value={formData.ads150Base}
                onChange={(e) => handleChange('ads150Base', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
              />
              <span className="text-2xs text-slate-400 dark:text-slate-500">Padrão: 5 anúncios</span>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                Anúncios 300+/mês (Base)
              </label>
              <input
                type="number"
                min="1"
                value={formData.ads300Base}
                onChange={(e) => handleChange('ads300Base', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
              />
              <span className="text-2xs text-slate-400 dark:text-slate-500">Padrão: 3 anúncios</span>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                Novo Entrante &lt;180d 300+ (Base)
              </label>
              <input
                type="number"
                min="1"
                value={formData.newEntrantBase}
                onChange={(e) => handleChange('newEntrantBase', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
              />
              <span className="text-2xs text-slate-400 dark:text-slate-500">Padrão: 1 anúncio</span>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                Concorrência Full Ideal Máxima
              </label>
              <input
                type="number"
                min="1"
                value={formData.fullIdealMax}
                onChange={(e) => handleChange('fullIdealMax', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
              />
              <span className="text-2xs text-slate-400 dark:text-slate-500">Padrão: 10 concorrentes</span>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                Score Mínimo para ENTRAR
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.scoreMinEntrar}
                onChange={(e) => handleChange('scoreMinEntrar', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
              />
              <span className="text-2xs text-slate-400 dark:text-slate-500">Padrão: 80 pontos</span>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                Score Mínimo para ANALISAR
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.scoreMinAnalisar}
                onChange={(e) => handleChange('scoreMinAnalisar', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
              />
              <span className="text-2xs text-slate-400 dark:text-slate-500">Padrão: 60 pontos</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: WEIGHTS (SUM TO 100) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">
                2. Pesos do Score de Oportunidade
              </h2>
            </div>
            <span
              className={`text-2xs font-black px-2.5 py-1 rounded-md border ${
                totalWeights === 100
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-800'
              }`}
            >
              Soma: {totalWeights} / 100 pts
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-2xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                Demanda Total (pts)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.weightDemand}
                onChange={(e) => handleChange('weightDemand', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
              />
              <span className="text-2xs text-slate-400 dark:text-slate-500">Padrão: 20 pts</span>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                Ritmo 150+/mês (pts)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.weightRate150}
                onChange={(e) => handleChange('weightRate150', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
              />
              <span className="text-2xs text-slate-400 dark:text-slate-500">Padrão: 20 pts</span>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                Ritmo 300+/mês (pts)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.weightRate300}
                onChange={(e) => handleChange('weightRate300', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
              />
              <span className="text-2xs text-slate-400 dark:text-slate-500">Padrão: 15 pts</span>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                Novo Entrante &lt;180d (pts)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.weightNewEntrants}
                onChange={(e) => handleChange('weightNewEntrants', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
              />
              <span className="text-2xs text-slate-400 dark:text-slate-500">Padrão: 20 pts</span>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                Idade dos Anúncios (pts)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.weightAdAge}
                onChange={(e) => handleChange('weightAdAge', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
              />
              <span className="text-2xs text-slate-400 dark:text-slate-500">Padrão: 10 pts</span>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                Concorrência Full (pts)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.weightFullComp}
                onChange={(e) => handleChange('weightFullComp', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60"
              />
              <span className="text-2xs text-slate-400 dark:text-slate-500">Padrão: 15 pts</span>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black text-sm shadow-xs transition-all border border-amber-300 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Parâmetros da Régua</span>
          </button>
        </div>
      </form>

      {/* SECTION 3: BACKUP & DATA MANAGEMENT */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">
            3. Backup, Exportação e Importação de Dados
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Exportar Backup (JSON)</span>
            </div>
            <p className="text-2xs text-slate-500 dark:text-slate-400">
              Baixe todos os produtos analisados e suas configurações salvas em um arquivo JSON.
            </p>
            <button
              type="button"
              onClick={handleExportBackup}
              className="mt-2 w-full py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileJson className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Baixar Arquivo de Backup</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Importar Backup (JSON)</span>
            </div>
            <p className="text-2xs text-slate-500 dark:text-slate-400">
              Restaure análises e configurações a partir de um backup previamente gerado.
            </p>
            <label className="mt-2 w-full py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Selecionar Arquivo JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Clear Database danger button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Redefinir Base de Dados</p>
            <p className="text-2xs text-slate-400 dark:text-slate-500">Limpar todos os produtos e recarregar dados iniciais.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Banco</span>
          </button>
        </div>
      </div>

      {/* Clear Database Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Limpar Todos os Dados?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Esta ação redefinirá o armazenamento local e restaurará os produtos demonstrativos.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
