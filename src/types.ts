export type RecommendationStatus = 'ENTRAR' | 'ANALISAR' | 'ALTO_RISCO' | 'DESCARTAR';

export interface AvantproMetrics {
  totalRecentAds: number; // Quantidade de resultados após filtrar anúncios criados há <=180 dias
  recentAds100Plus: number; // Entre os <=180d, quantos possuem 100+ vendas acumuladas
  recentAds300Plus: number; // Entre os <=180d, quantos possuem 300+ vendas acumuladas
  recentAds500Plus: number; // Entre os <=180d, quantos possuem 500+ vendas acumuladas
  totalPageSales: number; // Demanda total da página 1 (ex: 8500)
  adsMaking150Plus: number; // Anúncios fazendo 150+ vendas/mês (~5 vendas/dia)
  adsMaking300Plus: number; // Anúncios fazendo 300+ vendas/mês (~10 vendas/dia)
  newEntrants300Plus: number; // Anúncios < 180 dias fazendo 300+ vendas/mês
  adsUnder180Days: number; // Qtd anúncios com menos de 180 dias
  ads180To365Days: number; // Qtd anúncios entre 180 e 365 dias
  adsOver365Days: number; // Qtd anúncios com mais de 365 dias
  fullCompetitors: number; // Quantidade de anúncios utilizando Full
}

export interface FinancialData {
  enabled: boolean;
  costPrice: number; // Custo do produto (R$)
  sellPrice: number; // Preço de venda (R$)
  mlCommissionPercent: number; // Comissão ML (%)
  fixedFee: number; // Taxa fixa ML (R$)
  shippingFee: number; // Frete / Envio (R$)
  taxPercent: number; // Impostos (%)
  adsPercent: number; // Tráfego Pago / Ads estimado (%)
  otherCosts: number; // Embalagem / outros custos unitários (R$)
}

export interface CalculatedFinancials {
  grossRevenueUnit: number;
  totalFeesUnit: number;
  mlCommissionAmount: number;
  taxAmount: number;
  adsAmount: number;
  netProfitUnit: number; // Lucro líquido por unidade
  netMarginPercent: number; // Margem líquida (%)
  monthlyProfit150Sales: number; // Projeção de lucro mensal (150 vendas)
  monthlyRevenue150Sales: number; // Projeção de faturamento mensal (150 vendas)
}

export interface ScoreBreakdown {
  demandScore: number;
  rate150Score: number;
  rate300Score: number;
  newEntrantsScore: number;
  adAgeScore: number;
  fullCompScore: number;
  totalScore: number; // 0 a 100
  recommendation: RecommendationStatus;
}

export interface MetricDiagnostic {
  key: string;
  name: string;
  displayValue: string;
  level: 'EXCELENTE' | 'BOM' | 'ACEITAVEL' | 'FRACA' | 'ATENCAO' | 'DIFICIL' | 'SATURADO';
  statusColor: 'emerald' | 'amber' | 'rose' | 'yellow';
  summary: string;
  scoreAwarded: number;
  maxScore: number;
}

export type PotentialClassification =
  | 'BAIXO_POTENCIAL'
  | 'ABAIXO_DA_META'
  | 'META_ATINGIVEL'
  | 'FORTE_POTENCIAL'
  | 'ALTO_POTENCIAL';

export type FullAdvantageLevel = 'MUITO_ALTA' | 'ALTA' | 'MODERADA' | 'NEUTRA' | 'BAIXA';

export interface FullAdvantageEstimate {
  level: FullAdvantageLevel;
  label: string; // '🔥 MUITO ALTA' | '🟢 ALTA' | '🟡 MODERADA' | '⚪ NEUTRA' | '🟠 BAIXA'
  explanation: string;
}

export interface SalesPotentialEstimate {
  conservativeDaily: number;
  probableDaily: number;
  optimisticDaily: number;
  conservativeMonthly: number;
  probableMonthly: number;
  optimisticMonthly: number;
  classification: PotentialClassification;
  classificationLabel: string;
  confidence: 'ALTA' | 'MEDIA' | 'BAIXA';
  confidenceReason: string;
}

export interface ProductDiagnosis {
  metricDiagnostics: MetricDiagnostic[];
  positivePoints: string[];
  attentionPoints: string[];
  chanceGoal5Daily: 'ALTA' | 'MEDIA' | 'BAIXA';
  salesPotential?: SalesPotentialEstimate;
  fullAdvantage?: FullAdvantageEstimate;
  verdictTitle: string;
  verdictText: string;
  nextStep: string;
}

export interface ProductAnalysis {
  id: string;
  name: string;
  keyword: string;
  mlLink?: string;
  supplierLink?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  metrics: AvantproMetrics;
  financials: FinancialData;
  scoreBreakdown: ScoreBreakdown;
  diagnosis: ProductDiagnosis;
  salesPotential?: SalesPotentialEstimate;
  fullAdvantage?: FullAdvantageEstimate;
  calculatedFinancials?: CalculatedFinancials;
}

export interface SystemSettings {
  targetDailySales: number; // Meta: 5 vendas/dia
  targetMonthlySales: number; // Meta: 150 vendas/mês
  demandMin: number; // 5000
  ads150Base: number; // 5
  ads300Base: number; // 3
  newEntrantBase: number; // 1
  fullIdealMax: number; // 10
  scoreMinEntrar: number; // 80
  scoreMinAnalisar: number; // 60
  // Pesos do Score (soma = 100)
  weightDemand: number; // 20
  weightRate150: number; // 20
  weightRate300: number; // 15
  weightNewEntrants: number; // 20
  weightAdAge: number; // 10
  weightFullComp: number; // 15
}


export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  unitCost: number;
  localStock: number;
  fullStock: number;
  supplierInbound: number;
  fullInbound: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
}


export type InventoryMovementType =
  | 'PURCHASE_SUPPLIER'
  | 'RECEIVE_SUPPLIER'
  | 'SEND_TO_FULL'
  | 'FULL_RECEIVED'
  | 'SALE_LOCAL'
  | 'SALE_FULL'
  | 'RETURN_LOCAL'
  | 'RETURN_FULL'
  | 'ADJUST_LOCAL'
  | 'ADJUST_FULL';

export interface InventoryMovement {
  id: string;
  inventoryId: string;
  sku: string;
  productName: string;
  type: InventoryMovementType;
  quantity: number;
  note: string;
  createdAt: string;
  before: {
    localStock: number;
    fullStock: number;
    supplierInbound: number;
    fullInbound: number;
  };
  after: {
    localStock: number;
    fullStock: number;
    supplierInbound: number;
    fullInbound: number;
  };
}


export interface SaleRecord {
  id: string;
  orderNumber: string;
  soldAt: string;
  inventoryId: string;
  sku: string;
  productName: string;
  quantity: number;
  source: 'LOCAL' | 'FULL';
  salePriceUnit: number;
  receivedAmount: number;
  unitCostSnapshot: number;
  cmv: number;
  extraCosts: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export type CashArea='BUSINESS'|'PERSONAL';
export type CashKind='INCOME'|'EXPENSE'|'TRANSFER'|'INVESTMENT'|'DEBT_PAYMENT';
export interface CashEntry{id:string;area:CashArea;kind:CashKind;category:string;description:string;amount:number;date:string;createdAt:string;}
export interface DebtRecord{id:string;name:string;balance:number;installment:number;dueDay:number;note:string;createdAt:string;updatedAt:string;}
export interface FinancePlan{id:string;mercadoPagoBalance:number;businessCash:number;personalCash:number;personalSpendPct:number;debtPct:number;reservePct:number;investPct:number;businessReinvestPct:number;businessReservePct?:number;businessWithdrawalPct?:number;businessOtherPct?:number;personalEssentialPct?:number;personalFreePct?:number;businessMinCash:number;updatedAt:string;}
