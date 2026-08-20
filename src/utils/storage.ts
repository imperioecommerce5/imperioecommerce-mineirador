import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { ProductAnalysis, SystemSettings } from '../types';
import { calculateScoreAndDiagnosis, calculateFinancials, DEFAULT_SETTINGS } from './calculator';
import { db } from '../firebase';

const PRODUCTS_COLLECTION = 'products';
const SETTINGS_DOC = doc(db, 'appData', 'settings');

function removeUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefinedDeep(item)) as T;
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, removeUndefinedDeep(item)])
    ) as T;
  }
  return value;
}

function recalculateProduct(p: ProductAnalysis, settings: SystemSettings): ProductAnalysis {
  const { scoreBreakdown, diagnosis } = calculateScoreAndDiagnosis(p.metrics, settings, p.financials);
  const calculatedFinancials = p.financials?.enabled
    ? calculateFinancials(p.financials, settings)
    : undefined;
  return { ...p, scoreBreakdown, diagnosis, calculatedFinancials };
}

export async function getStoredSettings(): Promise<SystemSettings> {
  try {
    const snap = await getDoc(SETTINGS_DOC);
    if (!snap.exists()) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<SystemSettings>) };
  } catch (err) {
    console.error('Failed to load Firestore settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function saveStoredSettings(settings: SystemSettings): Promise<void> {
  await setDoc(SETTINGS_DOC, settings, { merge: true });
}

export async function getStoredProducts(): Promise<ProductAnalysis[]> {
  const settings = await getStoredSettings();
  const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return snap.docs
    .map((d) => d.data() as ProductAnalysis)
    .filter((p) => p && p.id && !p.id.startsWith('prod-demo-'))
    .map((p) => recalculateProduct(p, settings))
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export async function saveProductAnalysis(
  productData: Omit<ProductAnalysis, 'id' | 'createdAt' | 'updatedAt' | 'scoreBreakdown' | 'diagnosis' | 'calculatedFinancials'> & { id?: string }
): Promise<ProductAnalysis> {
  const settings = await getStoredSettings();
  const now = new Date().toISOString();
  const id = productData.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let createdAt = now;

  if (productData.id) {
    const existing = await getDoc(doc(db, PRODUCTS_COLLECTION, id));
    if (existing.exists()) createdAt = (existing.data() as ProductAnalysis).createdAt || now;
  }

  const { scoreBreakdown, diagnosis } = calculateScoreAndDiagnosis(productData.metrics, settings, productData.financials);
  const calculatedFinancials = productData.financials.enabled
    ? calculateFinancials(productData.financials, settings)
    : undefined;

  const savedProduct: ProductAnalysis = {
    ...productData,
    id,
    createdAt,
    updatedAt: now,
    scoreBreakdown,
    diagnosis,
    calculatedFinancials,
  };

  await setDoc(doc(db, PRODUCTS_COLLECTION, id), removeUndefinedDeep(savedProduct));
  return savedProduct;
}

export async function deleteProductAnalysis(id: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
}

export async function duplicateProductAnalysis(id: string): Promise<ProductAnalysis | null> {
  const snap = await getDoc(doc(db, PRODUCTS_COLLECTION, id));
  if (!snap.exists()) return null;
  const original = snap.data() as ProductAnalysis;
  return saveProductAnalysis({
    name: `${original.name} (Cópia)`,
    keyword: original.keyword,
    mlLink: original.mlLink,
    supplierLink: original.supplierLink,
    notes: original.notes,
    metrics: { ...original.metrics },
    financials: { ...original.financials },
  });
}

export async function exportDataAsJson(): Promise<string> {
  const [settings, products] = await Promise.all([getStoredSettings(), getStoredProducts()]);
  return JSON.stringify({ version: '2.0-firestore', exportedAt: new Date().toISOString(), settings, products }, null, 2);
}

export async function importDataFromJson(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.products)) {
      return { success: false, message: 'Formato de arquivo JSON inválido. Estrutura incorreta.' };
    }
    if (parsed.settings) await saveStoredSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
    const batch = writeBatch(db);
    parsed.products.forEach((p: ProductAnalysis) => {
      if (p?.id) batch.set(doc(db, PRODUCTS_COLLECTION, p.id), removeUndefinedDeep(p));
    });
    await batch.commit();
    return { success: true, message: `${parsed.products.length} produtos importados com sucesso!` };
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Falha ao processar arquivo JSON ou gravar no Firestore.' };
  }
}

export async function clearAllData(): Promise<void> {
  const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(SETTINGS_DOC);
  await batch.commit();
}
