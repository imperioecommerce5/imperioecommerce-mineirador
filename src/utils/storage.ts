import { ProductAnalysis, SystemSettings } from '../types';
import { calculateScoreAndDiagnosis, calculateFinancials, DEFAULT_SETTINGS } from './calculator';

const STORAGE_KEY_PRODUCTS = 'imperio_mineirador_products_v2';
const STORAGE_KEY_SETTINGS = 'imperio_mineirador_settings_v1';

export function getStoredSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load stored settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: SystemSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function getStoredProducts(): ProductAnalysis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (!raw) {
      return [];
    }

    const parsed: ProductAnalysis[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter out any demo data if present
    const userProducts = parsed.filter((p) => p && p.id && !p.id.startsWith('prod-demo-'));
    const settings = getStoredSettings();

    // Recalculate scores and financials in case settings changed
    return userProducts.map((p) => {
      const { scoreBreakdown, diagnosis } = calculateScoreAndDiagnosis(p.metrics, settings);
      const calculatedFinancials = p.financials?.enabled
        ? calculateFinancials(p.financials, settings)
        : undefined;

      return {
        ...p,
        scoreBreakdown,
        diagnosis,
        calculatedFinancials,
      };
    });
  } catch (err) {
    console.error('Failed to get stored products:', err);
    return [];
  }
}

export function saveProductAnalysis(
  productData: Omit<
    ProductAnalysis,
    'id' | 'createdAt' | 'updatedAt' | 'scoreBreakdown' | 'diagnosis' | 'calculatedFinancials'
  > & { id?: string }
): ProductAnalysis {
  const settings = getStoredSettings();
  const products = getStoredProducts();
  const now = new Date().toISOString();

  const { scoreBreakdown, diagnosis } = calculateScoreAndDiagnosis(productData.metrics, settings);
  const calculatedFinancials = productData.financials.enabled
    ? calculateFinancials(productData.financials, settings)
    : undefined;

  let savedProduct: ProductAnalysis;

  if (productData.id) {
    // Update existing
    const existingIndex = products.findIndex((p) => p.id === productData.id);
    savedProduct = {
      ...productData,
      id: productData.id,
      createdAt: existingIndex >= 0 ? products[existingIndex].createdAt : now,
      updatedAt: now,
      scoreBreakdown,
      diagnosis,
      calculatedFinancials,
    };

    if (existingIndex >= 0) {
      products[existingIndex] = savedProduct;
    } else {
      products.unshift(savedProduct);
    }
  } else {
    // Create new
    const id = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    savedProduct = {
      ...productData,
      id,
      createdAt: now,
      updatedAt: now,
      scoreBreakdown,
      diagnosis,
      calculatedFinancials,
    };
    products.unshift(savedProduct);
  }

  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to save product list:', err);
  }

  return savedProduct;
}

export function deleteProductAnalysis(id: string): void {
  const products = getStoredProducts().filter((p) => p.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to delete product:', err);
  }
}

export function duplicateProductAnalysis(id: string): ProductAnalysis | null {
  const products = getStoredProducts();
  const original = products.find((p) => p.id === id);
  if (!original) return null;

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

export function exportDataAsJson(): string {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    settings: getStoredSettings(),
    products: getStoredProducts(),
  };
  return JSON.stringify(data, null, 2);
}

export function importDataFromJson(jsonString: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.products)) {
      return { success: false, message: 'Formato de arquivo JSON inválido. Estrutura incorreta.' };
    }

    if (parsed.settings) {
      saveStoredSettings(parsed.settings);
    }

    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(parsed.products));
    return {
      success: true,
      message: `${parsed.products.length} produtos importados com sucesso!`,
    };
  } catch (err) {
    return {
      success: false,
      message: 'Falha ao processar arquivo JSON. Verifique se o arquivo está corrompido.',
    };
  }
}

export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
  } catch (err) {
    console.error('Failed to clear data:', err);
  }
}
