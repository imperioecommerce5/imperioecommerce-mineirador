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
  const recentTotal=Math.max(0,metrics.totalRecentAds||metrics.adsUnder180Days||0);
  const m30=Math.min(recentTotal,Math.max(0,metrics.recentAds30Monthly||0));
  const m90=Math.min(m30,Math.max(0,metrics.recentAds90Monthly||0));
  const m150=Math.min(m90,Math.max(0,metrics.recentAds150Monthly||metrics.adsMaking150Plus||0));
  const m300=Math.min(m150,Math.max(0,metrics.recentAds300Monthly||metrics.adsMaking300Plus||0));
  const full=Math.min(recentTotal,Math.max(0,metrics.fullCompetitors||0));
  const pct=(v:number)=>recentTotal?Math.min(1,v/recentTotal):0,p30=pct(m30),p90=pct(m90),p150=pct(m150),p300=pct(m300),pFull=pct(full);
  const metricDiagnostics:MetricDiagnostic[]=[],positivePoints:string[]=[],attentionPoints:string[]=[];
  const color=(l:MetricDiagnostic['level']):MetricDiagnostic['statusColor']=>l==='EXCELENTE'||l==='BOM'?'emerald':l==='ACEITAVEL'?'yellow':'rose';

  // Maior peso: anúncios recentes que continuam vendendo AGORA.
  let tractionScore=Math.round(Math.min(45,Math.min(10,p30/.55*10)+Math.min(15,p90/.30*15)+Math.min(12,p150/.18*12)+Math.min(8,p300/.08*8)));
  if(recentTotal>=10&&p90<.08)tractionScore=Math.round(tractionScore*.55);
  const tractionLevel:MetricDiagnostic['level']=tractionScore>=38?'EXCELENTE':tractionScore>=30?'BOM':tractionScore>=20?'ACEITAVEL':'FRACA';
  metricDiagnostics.push({key:'currentPace180',name:'Ritmo Atual dos Anúncios Recentes',displayValue:`${m90} com 90+/mês • ${m150} com 150+/mês • ${m300} com 300+/mês`,level:tractionLevel,statusColor:color(tractionLevel),summary:recentTotal?`${Math.round(p90*100)}% fazem ≥3/dia, ${Math.round(p150*100)}% ≥5/dia e ${Math.round(p300*100)}% ≥10/dia.`:'Informe os anúncios do filtro ≤180d.',scoreAwarded:tractionScore,maxScore:45});
  if(p90>=.30)positivePoints.push(`${Math.round(p90*100)}% dos anúncios recentes mantêm ritmo de pelo menos 3 vendas/dia.`);
  if(recentTotal>=10&&p90<.10)attentionPoints.push('Poucos anúncios recentes mantêm ritmo de 3 vendas/dia: demanda atual pode estar concentrada.');

  let recentScore=0,recentLevel:MetricDiagnostic['level']='FRACA';
  if(recentTotal>0){if(recentTotal<=10){recentScore=15;recentLevel='EXCELENTE'}else if(recentTotal<=25){recentScore=13;recentLevel='BOM'}else if(recentTotal<=50){recentScore=10;recentLevel='ACEITAVEL'}else if(recentTotal<=80){recentScore=6;recentLevel='ATENCAO'}else recentScore=3}
  metricDiagnostics.push({key:'recentCompetition',name:'Concorrência Recente (≤180d)',displayValue:`${recentTotal} anúncios`,level:recentLevel,statusColor:color(recentLevel),summary:recentTotal<=25&&recentTotal>0?'Base recente enxuta.':recentTotal<=50?'Concorrência recente moderada.':'Muitos anúncios recentes disputando a demanda.',scoreAwarded:recentScore,maxScore:15});

  let fullScore=0,fullLevel:MetricDiagnostic['level']='FRACA';if(recentTotal){if(pFull<=.15){fullScore=12;fullLevel='EXCELENTE'}else if(pFull<=.30){fullScore=10;fullLevel='BOM'}else if(pFull<=.50){fullScore=7;fullLevel='ACEITAVEL'}else if(pFull<=.70){fullScore=4;fullLevel='ATENCAO'}else fullScore=2}
  metricDiagnostics.push({key:'fullPressure',name:'Pressão do Full nos Recentes',displayValue:recentTotal?`${full}/${recentTotal} (${Math.round(pFull*100)}%)`:'—',level:fullLevel,statusColor:color(fullLevel),summary:recentTotal?`${Math.round(pFull*100)}% dos anúncios recentes estão no Full.`:'Informe a base recente.',scoreAwarded:fullScore,maxScore:12});

  const results=Math.max(0,metrics.totalSearchResults||0),pages=Math.max(0,metrics.totalResultPages||0);let marketScore=8,marketLevel:MetricDiagnostic['level']='ACEITAVEL';
  if(results>0){if(results<=150){marketScore=13;marketLevel='EXCELENTE'}else if(results<=500){marketScore=11;marketLevel='BOM'}else if(results<=1500){marketScore=8;marketLevel='ACEITAVEL'}else if(results<=4000){marketScore=5;marketLevel='ATENCAO'}else{marketScore=2;marketLevel='SATURADO'}}
  if(pages>=20)marketScore=Math.max(0,marketScore-2); else if(pages>=10)marketScore=Math.max(0,marketScore-1);
  metricDiagnostics.push({key:'marketDepth',name:'Saturação / Profundidade da Busca',displayValue:results?`${results.toLocaleString('pt-BR')} resultados • ${pages||'—'} páginas`:'Não informado',level:marketLevel,statusColor:color(marketLevel),summary:'Resultados têm peso principal; páginas funcionam como confirmação da profundidade, sem duplicar o peso.',scoreAwarded:marketScore,maxScore:13});

  const demand=Math.max(0,metrics.totalPageSales||0);let demandScore=3,demandLevel:MetricDiagnostic['level']='FRACA';if(demand>=15000){demandScore=10;demandLevel='EXCELENTE'}else if(demand>=8000){demandScore=9;demandLevel='BOM'}else if(demand>=5000){demandScore=7;demandLevel='BOM'}else if(demand>=3000){demandScore=5;demandLevel='ACEITAVEL'}
  metricDiagnostics.push({key:'generalDemand',name:'Vendas Gerais (Histórico Auxiliar)',displayValue:`${demand.toLocaleString('pt-BR')} vendas`,level:demandLevel,statusColor:color(demandLevel),summary:'Indicador auxiliar, pois não pode ser limitado aos últimos 180 dias.',scoreAwarded:demandScore,maxScore:10});

  let financialScore=3,margin=0,financialLevel:MetricDiagnostic['level']='ACEITAVEL',financialSummary='Financeiro não preenchido: pontuação neutra.';if(financials?.enabled){const cf=calculateFinancials(financials,settings);margin=cf.netMarginPercent;if(margin>=30){financialScore=5;financialLevel='EXCELENTE'}else if(margin>=20){financialScore=4;financialLevel='BOM'}else if(margin>=15){financialScore=3}else if(margin>=10){financialScore=2;financialLevel='ATENCAO'}else{financialScore=0;financialLevel='FRACA'}financialSummary=`Margem líquida estimada de ${margin.toFixed(1)}%.`}
  metricDiagnostics.push({key:'financialViability',name:'Viabilidade Financeira',displayValue:financials?.enabled?`${margin.toFixed(1)}% margem líquida`:'Não preenchido',level:financialLevel,statusColor:color(financialLevel),summary:financialSummary,scoreAwarded:financialScore,maxScore:5});

  let totalScore=Math.round(tractionScore+recentScore+fullScore+marketScore+demandScore+financialScore);if(recentTotal>=10&&p90<.05)totalScore=Math.min(totalScore,54);else if(recentTotal>=10&&p90<.10)totalScore=Math.min(totalScore,64);totalScore=Math.max(0,Math.min(100,totalScore));
  const recommendation:RecommendationStatus=totalScore>=80?'ENTRAR':totalScore>=60?'ANALISAR':totalScore>=40?'ALTO_RISCO':'DESCARTAR';
  const chanceGoal5Daily:'ALTA'|'MEDIA'|'BAIXA'=totalScore>=78&&p150>=.15?'ALTA':totalScore>=58&&p90>=.12?'MEDIA':'BAIXA';
  const verdictTitle=recommendation==='ENTRAR'?'OPORTUNIDADE FORTE PARA ENTRADA':recommendation==='ANALISAR'?'OPORTUNIDADE PROMISSORA — VALIDAR DETALHES':recommendation==='ALTO_RISCO'?'OPORTUNIDADE COM RISCO ELEVADO':'BAIXA EVIDÊNCIA PARA ENTRADA';
  const verdictText=recommendation==='ENTRAR'?'Vendedores que entraram recentemente continuam apresentando ritmo atual forte, com concorrência administrável.':recommendation==='ANALISAR'?'Há demanda atual comprovada, mas valide saturação, Full, margem e concentração dos vendedores.':recommendation==='ALTO_RISCO'?'O ritmo atual e/ou a concorrência recente não oferecem segurança para uma entrada agressiva.':'Poucos anúncios recentes demonstram ritmo atual suficiente para justificar a entrada.';
  const nextStep=recommendation==='ENTRAR'?'Validar fornecedor e margem final; preparar lote de teste e oferta competitiva.':recommendation==='ANALISAR'?'Comparar os anúncios recentes com maior ritmo, preço e proposta de valor.':'Priorizar outras oportunidades antes de imobilizar capital.';
  const normalized={...metrics,adsUnder180Days:recentTotal,ads180To365Days:0,adsOver365Days:0,adsMaking150Plus:m150,adsMaking300Plus:m300,newEntrants300Plus:m300};
  const fullAdvantage=calculateFullAdvantage(normalized),salesPotential=calculateSalesPotential(normalized);
  return {scoreBreakdown:{demandScore,rate150Score:tractionScore,rate300Score:recentScore,newEntrantsScore:financialScore,adAgeScore:marketScore,fullCompScore:fullScore,totalScore,recommendation},diagnosis:{metricDiagnostics,positivePoints:positivePoints.length?positivePoints:['Dados recentes registrados para análise.'],attentionPoints:attentionPoints.length?attentionPoints:['Valide preço e oferta dos líderes recentes antes da compra.'],chanceGoal5Daily,salesPotential,fullAdvantage,verdictTitle,verdictText,nextStep}};
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
