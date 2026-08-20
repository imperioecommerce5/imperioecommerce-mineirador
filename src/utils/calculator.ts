import {
  AvantproMetrics,
  CalculatedFinancials,
  FinancialData,
  FullAdvantageEstimate,
  MetricDiagnostic,
  ProductDiagnosis,
  RecommendationStatus,
  ScoreBreakdown,
  SystemSettings,
} from '../types';

export const DEFAULT_SETTINGS: SystemSettings = {
  targetDailySales: 3,
  targetMonthlySales: 90,
  demandMin: 5000,
  ads150Base: 5,
  ads300Base: 3,
  newEntrantBase: 1,
  fullIdealMax: 10,
  scoreMinEntrar: 80,
  scoreMinAnalisar: 60,
  weightDemand: 20,
  weightRate150: 20,
  weightRate300: 15,
  weightNewEntrants: 20,
  weightAdAge: 10,
  weightFullComp: 15,
};

/**
 * Calculates competitive advantage for operating on Mercado Livre Full
 * Question answered: "Estar no Full me dá uma vantagem relevante para entrar neste mercado?"
 */
export function calculateFullAdvantage(metrics: AvantproMetrics): FullAdvantageEstimate {
  const full = metrics.fullCompetitors;
  const demand = metrics.totalPageSales;
  const ads150 = metrics.adsMaking150Plus;

  if (full <= 5) {
    // 0–5 concorrentes Full = MUITO ALTA
    const explanation =
      demand >= 5000 || ads150 >= 4
        ? 'Poucos concorrentes utilizam Full neste mercado (0 a 5). Como sua operação utiliza Full e a demanda é aquecida, existe uma vantagem logística relevante para ranquear rápido.'
        : 'Poucos concorrentes utilizam Full neste mercado (0 a 5). Como sua operação utiliza Full, existe uma vantagem logística relevante.';

    return {
      level: 'MUITO_ALTA',
      label: '🔥 MUITO ALTA',
      explanation,
    };
  } else if (full <= 10) {
    // 6–10 concorrentes Full = ALTA
    const explanation =
      demand >= 5000 || ads150 >= 4
        ? 'Concorrência Full sob controle (6 a 10) em mercado com boa demanda. Operar no Full proporciona excelente diferencial competitivo.'
        : 'Concorrência Full sob controle (6 a 10). Como sua operação utiliza Full, existe boa vantagem logística frente a anúncios convencionais.';

    return {
      level: 'ALTA',
      label: '🟢 ALTA',
      explanation,
    };
  } else if (full <= 15) {
    // 11–15 concorrentes Full = MODERADA
    return {
      level: 'MODERADA',
      label: '🟡 MODERADA',
      explanation:
        'Concorrência relevante no Full (11 a 15). Estar no Full equilibra a disputa logística e assegura paridade nas entregas rápidas frente aos concorrentes.',
    };
  } else if (full <= 20) {
    // 16–20 concorrentes Full = NEUTRA
    return {
      level: 'NEUTRA',
      label: '⚪ NEUTRA',
      explanation:
        '16 a 20 concorrentes já utilizam Full. A entrega rápida é padrão na categoria; sua operação Full garante competitividade, dependendo de diferenciação em preço e kit.',
    };
  } else {
    // 21+ concorrentes Full = BAIXA (sem descartar se a demanda for alta)
    const explanation =
      demand >= 8000 || ads150 >= 6
        ? 'Grande parte da concorrência já utiliza Full (21+), mas a alta demanda do mercado absorve novos vendedores. O Full garante paridade logística com os líderes.'
        : 'Grande parte da concorrência já utiliza Full (21+). Sua operação logística continua competitiva, porém o Full isoladamente oferece pouco diferencial neste mercado.';

    return {
      level: 'BAIXA',
      label: '🟠 BAIXA',
      explanation,
    };
  }
}

/**
 * Calculates deterministic sales potential estimation based on Avantpro metrics
 */
export function calculateSalesPotential(
  metrics: AvantproMetrics
): {
  conservativeDaily: number;
  probableDaily: number;
  optimisticDaily: number;
  conservativeMonthly: number;
  probableMonthly: number;
  optimisticMonthly: number;
  classification: import('../types').PotentialClassification;
  classificationLabel: string;
  confidence: 'ALTA' | 'MEDIA' | 'BAIXA';
  confidenceReason: string;
} {
  const totalAgeAds = metrics.adsUnder180Days + metrics.ads180To365Days + metrics.adsOver365Days;
  const under180Ratio = totalAgeAds > 0 ? metrics.adsUnder180Days / totalAgeAds : 0;
  const over365Ratio = totalAgeAds > 0 ? metrics.adsOver365Days / totalAgeAds : 0;

  // Base daily rate built from active ads making 150+ and 300+, with elevated weight for new entrants <180d
  const baseRate =
    metrics.adsMaking150Plus * 0.4 +
    metrics.adsMaking300Plus * 0.45 +
    metrics.newEntrants300Plus * 1.6;

  // Demand scaling factor (square root curve to balance high/low volume)
  const demandMultiplier = Math.min(
    1.6,
    Math.max(0.3, Math.sqrt((metrics.totalPageSales || 0) / 5000))
  );

  // Full competition multiplier
  let fullMultiplier = 1.0;
  if (metrics.fullCompetitors <= 5) fullMultiplier = 1.2;
  else if (metrics.fullCompetitors <= 10) fullMultiplier = 1.0;
  else if (metrics.fullCompetitors <= 15) fullMultiplier = 0.85;
  else if (metrics.fullCompetitors <= 20) fullMultiplier = 0.7;
  else fullMultiplier = 0.55;

  // Age distribution multiplier
  let ageMultiplier = 1.0;
  if (under180Ratio >= 0.2) ageMultiplier = 1.15;
  else if (over365Ratio >= 0.7) ageMultiplier = 0.85;

  // Calculate raw probable daily
  let rawProbable = (baseRate > 0 ? baseRate : (metrics.totalPageSales / 30) * 0.015) *
    demandMultiplier *
    fullMultiplier *
    ageMultiplier;

  // Safety caps: cannot exceed 12% of total page sales per day, min 0.2
  const maxCap = Math.max(1.0, (metrics.totalPageSales / 30) * 0.12);
  rawProbable = Math.max(0.2, Math.min(rawProbable, maxCap));

  // Round probable daily to 1 decimal
  const probableDaily = Math.round(rawProbable * 10) / 10;
  const conservativeDaily = Math.round(probableDaily * 0.65 * 10) / 10;
  const optimisticDaily = Math.round(probableDaily * 1.5 * 10) / 10;

  // Monthly totals (30 days)
  const conservativeMonthly = Math.round(conservativeDaily * 30);
  const probableMonthly = Math.round(probableDaily * 30);
  const optimisticMonthly = Math.round(optimisticDaily * 30);

  // Classification based on probableDaily
  let classification: import('../types').PotentialClassification = 'BAIXO_POTENCIAL';
  let classificationLabel = '🔴 BAIXO POTENCIAL';

  if (probableDaily >= 10.0) {
    classification = 'ALTO_POTENCIAL';
    classificationLabel = '🔥 ALTO POTENCIAL';
  } else if (probableDaily >= 5.0) {
    classification = 'FORTE_POTENCIAL';
    classificationLabel = '🟢 FORTE POTENCIAL';
  } else if (probableDaily >= 3.0) {
    classification = 'META_ATINGIVEL';
    classificationLabel = '🟡 META ATINGÍVEL';
  } else if (probableDaily >= 2.0) {
    classification = 'ABAIXO_DA_META';
    classificationLabel = '🟠 ABAIXO DA META';
  } else {
    classification = 'BAIXO_POTENCIAL';
    classificationLabel = '🔴 BAIXO POTENCIAL';
  }

  // Confidence calculation
  let confidence: 'ALTA' | 'MEDIA' | 'BAIXA' = 'MEDIA';
  let confidenceReason = 'Demanda moderada e concorrência padrão.';

  if (metrics.totalPageSales >= 5000 && (metrics.adsMaking150Plus >= 4 || metrics.newEntrants300Plus >= 1)) {
    confidence = 'ALTA';
    confidenceReason = 'Alto volume de dados na 1ª página com anúncios validados.';
  } else if (metrics.totalPageSales < 2500 || metrics.adsMaking150Plus <= 1) {
    confidence = 'BAIXA';
    confidenceReason = 'Baixa densidade de vendas ou pouca validação de anúncios.';
  }

  return {
    conservativeDaily,
    probableDaily,
    optimisticDaily,
    conservativeMonthly,
    probableMonthly,
    optimisticMonthly,
    classification,
    classificationLabel,
    confidence,
    confidenceReason,
  };
}

/**
 * Calculates score breakdown and complete diagnosis for a product
 */
export function calculateScoreAndDiagnosis(
  metrics: AvantproMetrics,
  settings: SystemSettings = DEFAULT_SETTINGS,
  financials?: FinancialData
): { scoreBreakdown: ScoreBreakdown; diagnosis: ProductDiagnosis } {
  const recentTotal = Math.max(0, metrics.totalRecentAds ?? metrics.adsUnder180Days ?? 0);
  const recent100 = Math.max(0, metrics.recentAds100Plus ?? metrics.adsMaking150Plus ?? 0);
  const recent300 = Math.max(0, metrics.recentAds300Plus ?? metrics.adsMaking300Plus ?? 0);
  const recent500 = Math.max(0, metrics.recentAds500Plus ?? metrics.newEntrants300Plus ?? 0);
  const full = Math.max(0, metrics.fullCompetitors || 0);
  const pct100 = recentTotal ? Math.min(1,recent100/recentTotal) : 0;
  const pct300 = recentTotal ? Math.min(1,recent300/recentTotal) : 0;
  const pct500 = recentTotal ? Math.min(1,recent500/recentTotal) : 0;
  const pctFull = recentTotal ? Math.min(1,full/recentTotal) : 0;
  const metricDiagnostics: MetricDiagnostic[]=[]; const positivePoints:string[]=[]; const attentionPoints:string[]=[];
  const color=(l:MetricDiagnostic['level']):MetricDiagnostic['statusColor']=>l==='EXCELENTE'||l==='BOM'?'emerald':l==='ACEITAVEL'?'yellow':'rose';

  let tractionScore=Math.round(Math.min(40, Math.min(18,pct100/0.30*18)+Math.min(14,pct300/0.15*14)+Math.min(8,pct500/0.07*8)));
  if(recentTotal>=10&&pct100<0.05) tractionScore=Math.round(tractionScore*0.45); else if(recentTotal>=10&&pct100<0.10) tractionScore=Math.round(tractionScore*0.70);
  const tractionLevel:MetricDiagnostic['level']=tractionScore>=34?'EXCELENTE':tractionScore>=27?'BOM':tractionScore>=18?'ACEITAVEL':'FRACA';
  metricDiagnostics.push({key:'traction180',name:'Tração dos Anúncios Recentes (≤180d)',displayValue:`${recent100} com 100+ • ${recent300} com 300+ • ${recent500} com 500+`,level:tractionLevel,statusColor:color(tractionLevel),summary:recentTotal?`${Math.round(pct100*100)}% chegaram a 100+, ${Math.round(pct300*100)}% a 300+ e ${Math.round(pct500*100)}% a 500+.`:'Informe os resultados do filtro ≤180 dias.',scoreAwarded:tractionScore,maxScore:40});
  if(pct100>=.25) positivePoints.push(`${Math.round(pct100*100)}% dos anúncios recentes ultrapassaram 100 vendas.`);
  if(recentTotal>=10&&pct100<.10) attentionPoints.push('Poucos anúncios recentes passam de 100 vendas: possível concentração da demanda.');

  let competitionScore=0; let competitionLevel:MetricDiagnostic['level']='FRACA';
  if(recentTotal<=0){competitionScore=0}else if(recentTotal<=10){competitionScore=20;competitionLevel='EXCELENTE'}else if(recentTotal<=20){competitionScore=18;competitionLevel='BOM'}else if(recentTotal<=35){competitionScore=15;competitionLevel='BOM'}else if(recentTotal<=50){competitionScore=11;competitionLevel='ACEITAVEL'}else if(recentTotal<=80){competitionScore=7;competitionLevel='ATENCAO'}else{competitionScore=4}
  metricDiagnostics.push({key:'recentCompetition',name:'Concorrência Recente (≤180d)',displayValue:`${recentTotal} anúncios`,level:competitionLevel,statusColor:color(competitionLevel),summary:recentTotal<=20&&recentTotal>0?'Poucos anúncios recentes disputando a palavra-chave.':recentTotal<=50?'Concorrência recente moderada.':'Muitos anúncios recentes disputando a mesma demanda.',scoreAwarded:competitionScore,maxScore:20});

  let fullScore=0; let fullLevel:MetricDiagnostic['level']='FRACA';
  if(recentTotal){if(pctFull<=.15){fullScore=15;fullLevel='EXCELENTE'}else if(pctFull<=.30){fullScore=13;fullLevel='BOM'}else if(pctFull<=.45){fullScore=10;fullLevel='ACEITAVEL'}else if(pctFull<=.60){fullScore=7;fullLevel='ATENCAO'}else{fullScore=4}}
  metricDiagnostics.push({key:'fullPressure',name:'Pressão do Full nos Recentes',displayValue:recentTotal?`${full}/${recentTotal} (${Math.round(pctFull*100)}%)`:'—',level:fullLevel,statusColor:color(fullLevel),summary:recentTotal?`${Math.round(pctFull*100)}% dos anúncios ≤180d estão no Full.`:'Informe a base recente.',scoreAwarded:fullScore,maxScore:15});

  const demand=Math.max(0,metrics.totalPageSales||0); let demandScore=2; let demandLevel:MetricDiagnostic['level']='FRACA';
  if(demand>=15000){demandScore=15;demandLevel='EXCELENTE'}else if(demand>=8000){demandScore=13;demandLevel='BOM'}else if(demand>=5000){demandScore=11;demandLevel='BOM'}else if(demand>=3000){demandScore=8;demandLevel='ACEITAVEL'}else if(demand>=1500){demandScore=5;demandLevel='ATENCAO'}
  metricDiagnostics.push({key:'generalDemand',name:'Vendas Totais da Página (Geral)',displayValue:`${demand.toLocaleString('pt-BR')} vendas`,level:demandLevel,statusColor:color(demandLevel),summary:'Indicador histórico com peso menor, pois o total não é filtrável por 180 dias.',scoreAwarded:demandScore,maxScore:15});

  let financialScore=5, margin=0; let financialLevel:MetricDiagnostic['level']='ACEITAVEL'; let financialSummary='Financeiro não preenchido: pontuação neutra (5/10).';
  if(financials?.enabled){const cf=calculateFinancials(financials,settings);margin=cf.netMarginPercent;if(margin>=30){financialScore=10;financialLevel='EXCELENTE'}else if(margin>=25){financialScore=9;financialLevel='BOM'}else if(margin>=20){financialScore=7;financialLevel='BOM'}else if(margin>=15){financialScore=5}else if(margin>=10){financialScore=3;financialLevel='ATENCAO'}else{financialScore=0;financialLevel='FRACA'}financialSummary=`Margem líquida estimada de ${margin.toFixed(1)}%.`;}
  metricDiagnostics.push({key:'financialViability',name:'Viabilidade Financeira',displayValue:financials?.enabled?`${margin.toFixed(1)}% margem líquida`:'Não preenchido',level:financialLevel,statusColor:color(financialLevel),summary:financialSummary,scoreAwarded:financialScore,maxScore:10});

  let totalScore=Math.round(tractionScore+competitionScore+fullScore+demandScore+financialScore);
  if(recentTotal>=10&&pct100<.05) totalScore=Math.min(totalScore,54); else if(recentTotal>=10&&pct100<.10) totalScore=Math.min(totalScore,64);
  totalScore=Math.max(0,Math.min(100,totalScore));
  const recommendation:RecommendationStatus=totalScore>=80?'ENTRAR':totalScore>=60?'ANALISAR':totalScore>=40?'ALTO_RISCO':'DESCARTAR';
  const chanceGoal5Daily:'ALTA'|'MEDIA'|'BAIXA'=totalScore>=78&&pct100>=.20?'ALTA':totalScore>=58&&pct100>=.10?'MEDIA':'BAIXA';
  const verdictTitle=recommendation==='ENTRAR'?'OPORTUNIDADE FORTE PARA ENTRADA':recommendation==='ANALISAR'?'OPORTUNIDADE PROMISSORA — VALIDAR DETALHES':recommendation==='ALTO_RISCO'?'OPORTUNIDADE COM RISCO ELEVADO':'BAIXA EVIDÊNCIA PARA ENTRADA';
  const verdictText=recommendation==='ENTRAR'?'Os anúncios criados nos últimos 180 dias mostram tração distribuída e condições favoráveis de entrada.':recommendation==='ANALISAR'?'Existem sinais positivos, mas valide margem, oferta e concentração das vendas recentes.':recommendation==='ALTO_RISCO'?'Tração recente, concorrência e/ou pressão Full não oferecem segurança para entrada agressiva.':'Os anúncios recentes não demonstram tração suficiente para justificar a entrada.';
  const nextStep=recommendation==='ENTRAR'?'Validar fornecedor e margem final; preparar lote de teste e anúncio competitivo no Full.':recommendation==='ANALISAR'?'Comparar líderes recentes, validar margem e diferenciação de oferta.':'Priorizar outras oportunidades antes de imobilizar capital.';
  const normalized={...metrics,adsUnder180Days:recentTotal,ads180To365Days:0,adsOver365Days:0,adsMaking150Plus:recent100,adsMaking300Plus:recent300,newEntrants300Plus:recent500};
  const fullAdvantage=calculateFullAdvantage(normalized); const salesPotential=calculateSalesPotential(normalized);
  return {scoreBreakdown:{demandScore,rate150Score:tractionScore,rate300Score:competitionScore,newEntrantsScore:financialScore,adAgeScore:0,fullCompScore:fullScore,totalScore,recommendation},diagnosis:{metricDiagnostics,positivePoints:positivePoints.length?positivePoints:['Dados recentes registrados para análise.'],attentionPoints:attentionPoints.length?attentionPoints:['Validar preço e oferta dos líderes antes da compra.'],chanceGoal5Daily,salesPotential,fullAdvantage,verdictTitle,verdictText,nextStep}};
}

/**
 * Calculates unit and monthly financials on the 150 sales/month target (5 sales/day)
 */
export function calculateFinancials(
  financials: FinancialData,
  settings: SystemSettings = DEFAULT_SETTINGS
): CalculatedFinancials {
  const sellPrice = financials.sellPrice || 0;
  const costPrice = financials.costPrice || 0;
  const fixedFee = financials.fixedFee || 0;
  const shippingFee = financials.shippingFee || 0;
  const otherCosts = financials.otherCosts || 0;

  const mlCommissionAmount = sellPrice * ((financials.mlCommissionPercent || 0) / 100);
  const taxAmount = sellPrice * ((financials.taxPercent || 0) / 100);
  const adsAmount = sellPrice * ((financials.adsPercent || 0) / 100);

  const totalFeesUnit = costPrice + mlCommissionAmount + fixedFee + shippingFee + taxAmount + adsAmount + otherCosts;
  const netProfitUnit = sellPrice - totalFeesUnit;
  const netMarginPercent = sellPrice > 0 ? (netProfitUnit / sellPrice) * 100 : 0;

  const monthlyProfit150Sales = netProfitUnit * settings.targetMonthlySales;
  const monthlyRevenue150Sales = sellPrice * settings.targetMonthlySales;

  return {
    grossRevenueUnit: sellPrice,
    totalFeesUnit,
    mlCommissionAmount,
    taxAmount,
    adsAmount,
    netProfitUnit,
    netMarginPercent,
    monthlyProfit150Sales,
    monthlyRevenue150Sales,
  };
}
