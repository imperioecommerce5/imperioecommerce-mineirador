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
  settings: SystemSettings = DEFAULT_SETTINGS
): { scoreBreakdown: ScoreBreakdown; diagnosis: ProductDiagnosis } {
  const metricDiagnostics: MetricDiagnostic[] = [];
  const positivePoints: string[] = [];
  const attentionPoints: string[] = [];

  // 1. DEMANDA TOTAL DA PÁGINA (Max: weightDemand, default 20)
  let demandScore = 0;
  let demandLevel: MetricDiagnostic['level'] = 'FRACA';
  let demandColor: MetricDiagnostic['statusColor'] = 'rose';
  let demandSummary = '';

  if (metrics.totalPageSales >= 10000) {
    demandScore = settings.weightDemand;
    demandLevel = 'EXCELENTE';
    demandColor = 'emerald';
    demandSummary = 'Demanda massiva na primeira página (> 10.000 vendas/mês). Amplo espaço para novos vendedores.';
    positivePoints.push('Volume total de vendas da página é excelente (> 10.000 un/mês), facilitando tração rápida.');
  } else if (metrics.totalPageSales >= 5000) {
    demandScore = settings.weightDemand * 0.8;
    demandLevel = 'BOM';
    demandColor = 'emerald';
    demandSummary = 'Boa demanda total (5.000 a 10.000 vendas/mês). Volume saudável para bater meta.';
    positivePoints.push('Demanda total saudável (5k a 10k vendas/mês) dentro do padrão ideal.');
  } else if (metrics.totalPageSales >= 3000) {
    demandScore = settings.weightDemand * 0.5;
    demandLevel = 'ACEITAVEL';
    demandColor = 'yellow';
    demandSummary = 'Demanda aceitável (3.000 a 5.000 vendas/mês). Exige diferenciação para capturar fatia.';
    attentionPoints.push('Demanda moderada (3k a 5k vendas/mês); nicho pode ser mais sensível a preço.');
  } else {
    demandScore = settings.weightDemand * 0.2;
    demandLevel = 'FRACA';
    demandColor = 'rose';
    demandSummary = 'Demanda baixa (< 3.000 vendas/mês). Risco de não atingir a meta mínima de 150 vendas/mês.';
    attentionPoints.push('Demanda total da página muito baixa (< 3.000 vendas/mês), dificultando atingir 5 vendas/dia.');
  }

  metricDiagnostics.push({
    key: 'demand',
    name: 'Demanda Total da Página',
    displayValue: `${metrics.totalPageSales.toLocaleString('pt-BR')} vendas`,
    level: demandLevel,
    statusColor: demandColor,
    summary: demandSummary,
    scoreAwarded: Math.round(demandScore),
    maxScore: settings.weightDemand,
  });

  // 2. RITMO ATUAL: ANÚNCIOS COM 150+ VENDAS/MÊS (Max: weightRate150, default 20)
  let rate150Score = 0;
  let rate150Level: MetricDiagnostic['level'] = 'FRACA';
  let rate150Color: MetricDiagnostic['statusColor'] = 'rose';
  let rate150Summary = '';

  if (metrics.adsMaking150Plus >= 9) {
    rate150Score = settings.weightRate150;
    rate150Level = 'EXCELENTE';
    rate150Color = 'emerald';
    rate150Summary = '9+ anúncios batendo a meta de 150/mês. Mercado altamente distribuído.';
    positivePoints.push('Vários anúncios (9+) atingem a meta de 5 vendas/dia, provando que o volume não é monopólio de um só.');
  } else if (metrics.adsMaking150Plus >= 5) {
    rate150Score = settings.weightRate150 * 0.8;
    rate150Level = 'BOM';
    rate150Color = 'emerald';
    rate150Summary = '5 a 8 anúncios batendo a meta de 150/mês. Boa consistência de giro.';
    positivePoints.push('Entre 5 e 8 anúncios já atingem a meta de 150 vendas/mês.');
  } else if (metrics.adsMaking150Plus >= 3) {
    rate150Score = settings.weightRate150 * 0.5;
    rate150Level = 'ACEITAVEL';
    rate150Color = 'yellow';
    rate150Summary = '3 a 4 anúncios com 150+/mês. Mercado viável, porém mais concorrido entre os líderes.';
  } else {
    rate150Score = settings.weightRate150 * 0.15;
    rate150Level = 'FRACA';
    rate150Color = 'rose';
    rate150Summary = 'Apenas 0 a 2 anúncios batem a meta. Nicho extremamente concentrado ou sem liquidez.';
    attentionPoints.push('Pouquíssimos anúncios (menos de 3) atingem 150 vendas/mês; alta concentração.');
  }

  metricDiagnostics.push({
    key: 'rate150',
    name: 'Ritmo Atual (150+ vendas/mês)',
    displayValue: `${metrics.adsMaking150Plus} anúncios`,
    level: rate150Level,
    statusColor: rate150Color,
    summary: rate150Summary,
    scoreAwarded: Math.round(rate150Score),
    maxScore: settings.weightRate150,
  });

  // 3. RITMO FORTE: ANÚNCIOS COM 300+ VENDAS/MÊS (Max: weightRate300, default 15)
  let rate300Score = 0;
  let rate300Level: MetricDiagnostic['level'] = 'FRACA';
  let rate300Color: MetricDiagnostic['statusColor'] = 'rose';
  let rate300Summary = '';

  if (metrics.adsMaking300Plus >= 6) {
    rate300Score = settings.weightRate300;
    rate300Level = 'EXCELENTE';
    rate300Color = 'emerald';
    rate300Summary = '6+ anúncios vendem 300+/mês (~10 vendas/dia). Potencial de escala muito alto.';
    positivePoints.push('Existe teto alto de escala no nicho com múltiplos anúncios acima de 300 vendas/mês.');
  } else if (metrics.adsMaking300Plus >= 3) {
    rate300Score = settings.weightRate300 * 0.8;
    rate300Level = 'BOM';
    rate300Color = 'emerald';
    rate300Summary = '3 a 5 anúncios com 300+/mês. Mercado saudável com capacidade de escala.';
    positivePoints.push('Mercado com capacidade comprovada de escala (3+ anúncios com 300+/mês).');
  } else if (metrics.adsMaking300Plus >= 1) {
    rate300Score = settings.weightRate300 * 0.5;
    rate300Level = 'ACEITAVEL';
    rate300Color = 'yellow';
    rate300Summary = '1 a 2 anúncios com 300+/mês. Escala viável mas concentrada.';
  } else {
    rate300Score = 0;
    rate300Level = 'FRACA';
    rate300Color = 'rose';
    rate300Summary = 'Nenhum anúncio atinge 300 vendas/mês. Teto de crescimento limitado.';
    attentionPoints.push('Nenhum anúncio atinge 300 vendas/mês, indicando teto de crescimento reduzido.');
  }

  metricDiagnostics.push({
    key: 'rate300',
    name: 'Ritmo Forte (300+ vendas/mês)',
    displayValue: `${metrics.adsMaking300Plus} anúncios`,
    level: rate300Level,
    statusColor: rate300Color,
    summary: rate300Summary,
    scoreAwarded: Math.round(rate300Score),
    maxScore: settings.weightRate300,
  });

  // 4. NOVOS ENTRANTES (< 180 DIAS COM 300+ VENDAS/MÊS) (Max: weightNewEntrants, default 20)
  let newEntrantsScore = 0;
  let newEntrantsLevel: MetricDiagnostic['level'] = 'FRACA';
  let newEntrantsColor: MetricDiagnostic['statusColor'] = 'rose';
  let newEntrantsSummary = '';

  if (metrics.newEntrants300Plus >= 2) {
    newEntrantsScore = settings.weightNewEntrants;
    newEntrantsLevel = 'EXCELENTE';
    newEntrantsColor = 'emerald';
    newEntrantsSummary = '2+ anúncios novos (<180d) já vendem 300+/mês. Prova definitiva de entrada rápida.';
    positivePoints.push('Comprovação de novos entrantes (< 180 dias) já ranqueando com mais de 300 vendas/mês.');
  } else if (metrics.newEntrants300Plus === 1) {
    newEntrantsScore = settings.weightNewEntrants * 0.75;
    newEntrantsLevel = 'BOM';
    newEntrantsColor = 'emerald';
    newEntrantsSummary = '1 anúncio recente (<180d) escalando rápido. Valida possibilidade de entrada.';
    positivePoints.push('Há pelo menos 1 anúncio recente (< 180 dias) com tração forte (300+/mês).');
  } else {
    newEntrantsScore = settings.weightNewEntrants * 0.15;
    newEntrantsLevel = 'FRACA';
    newEntrantsColor = 'amber';
    newEntrantsSummary = 'Nenhum anúncio novo com 300+/mês. Exigirá estratégia agressiva de preço e Full.';
    attentionPoints.push('Sem novos entrantes (< 180 dias) no topo com 300+/mês; barreira de entrada dos antigos é mais forte.');
  }

  metricDiagnostics.push({
    key: 'newEntrants',
    name: 'Novos Entrantes (<180d com 300+/mês)',
    displayValue: `${metrics.newEntrants300Plus} anúncios`,
    level: newEntrantsLevel,
    statusColor: newEntrantsColor,
    summary: newEntrantsSummary,
    scoreAwarded: Math.round(newEntrantsScore),
    maxScore: settings.weightNewEntrants,
  });

  // 5. IDADE DOS ANÚNCIOS (Max: weightAdAge, default 10)
  const totalAgeAds = metrics.adsUnder180Days + metrics.ads180To365Days + metrics.adsOver365Days;
  let adAgeScore = 0;
  let adAgeLevel: MetricDiagnostic['level'] = 'ACEITAVEL';
  let adAgeColor: MetricDiagnostic['statusColor'] = 'yellow';
  let adAgeSummary = '';

  const under180Ratio = totalAgeAds > 0 ? metrics.adsUnder180Days / totalAgeAds : 0;
  const over365Ratio = totalAgeAds > 0 ? metrics.adsOver365Days / totalAgeAds : 0;

  if (under180Ratio >= 0.25) {
    adAgeScore = settings.weightAdAge;
    adAgeLevel = 'EXCELENTE';
    adAgeColor = 'emerald';
    adAgeSummary = 'Forte renovação na 1ª página (mais de 25% de anúncios recentes). Mercado dinâmico.';
    positivePoints.push('Mercado altamente dinâmico com alta rotatividade de anúncios na 1ª página.');
  } else if (under180Ratio >= 0.1) {
    adAgeScore = settings.weightAdAge * 0.7;
    adAgeLevel = 'BOM';
    adAgeColor = 'emerald';
    adAgeSummary = 'Presença moderada de anúncios novos (10% a 25%). Renovação contínua.';
  } else if (over365Ratio > 0.7) {
    adAgeScore = settings.weightAdAge * 0.3;
    adAgeLevel = 'ATENCAO';
    adAgeColor = 'rose';
    adAgeSummary = 'Mais de 70% dos anúncios têm mais de 1 ano. Mercado dominado por sellers consolidados.';
    attentionPoints.push('Mercado dominado por anúncios muito antigos (> 1 ano), exigindo diferencial claro ou preço competitivo.');
  } else {
    adAgeScore = settings.weightAdAge * 0.5;
    adAgeLevel = 'ACEITAVEL';
    adAgeColor = 'yellow';
    adAgeSummary = 'Distribuição de idade equilibrada entre anúncios antigos e intermediários.';
  }

  metricDiagnostics.push({
    key: 'adAge',
    name: 'Distribuição de Idade dos Anúncios',
    displayValue: `${metrics.adsUnder180Days} novos (<180d) / ${metrics.adsOver365Days} antigos (>1 ano)`,
    level: adAgeLevel,
    statusColor: adAgeColor,
    summary: adAgeSummary,
    scoreAwarded: Math.round(adAgeScore),
    maxScore: settings.weightAdAge,
  });

  // 6. VANTAGEM COMPETITIVA NO FULL (Max: weightFullComp, default 15)
  // O fato de operar no Full é tratado como vantagem competitiva potencial e analisado relativamente ao mercado.
  let fullCompScore = 0;
  let fullCompLevel: MetricDiagnostic['level'] = 'ACEITAVEL';
  let fullCompColor: MetricDiagnostic['statusColor'] = 'yellow';
  let fullCompSummary = '';

  const fullAdvantage = calculateFullAdvantage(metrics);

  if (metrics.fullCompetitors <= 5) {
    // 0–5 concorrentes Full = GRANDE VANTAGEM
    fullCompScore = settings.weightFullComp;
    fullCompLevel = 'EXCELENTE';
    fullCompColor = 'emerald';
    fullCompSummary = '0 a 5 concorrentes no Full (Grande Vantagem). Amplo espaço para dominar a logística rápida e ranquear com agilidade.';
    positivePoints.push('Pouquíssimos concorrentes no Full (0 a 5): grande vantagem competitiva logística para novos anúncios.');
  } else if (metrics.fullCompetitors <= 10) {
    // 6–10 concorrentes Full = BOA VANTAGEM
    fullCompScore = settings.weightFullComp * 0.85;
    fullCompLevel = 'BOM';
    fullCompColor = 'emerald';
    fullCompSummary = '6 a 10 concorrentes no Full (Boa Vantagem). Concorrência Full sob controle com espaço para novos vendedores.';
    positivePoints.push('Concorrência no Full saudável (6 a 10 vendedores): boa vantagem competitiva.');
  } else if (metrics.fullCompetitors <= 15) {
    // 11–15 concorrentes Full = VANTAGEM MODERADA
    fullCompScore = settings.weightFullComp * 0.70;
    fullCompLevel = 'ACEITAVEL';
    fullCompColor = 'yellow';
    fullCompSummary = '11 a 15 concorrentes no Full (Vantagem Moderada). Estar no Full garante paridade nas entregas rápidas frente aos concorrentes.';
  } else if (metrics.fullCompetitors <= 20) {
    // 16–20 concorrentes Full = NEUTRO
    fullCompScore = settings.weightFullComp * 0.55;
    fullCompLevel = 'ACEITAVEL';
    fullCompColor = 'yellow';
    fullCompSummary = '16 a 20 concorrentes no Full (Neutro). O Full é padrão na categoria; o diferencial dependerá de preço, foto e kit.';
  } else {
    // 20+ concorrentes Full = BAIXO DIFERENCIAL
    // Não significa automaticamente produto ruim. Se a demanda for alta e vários vendem acima da meta, pontua proporcionalmente.
    if (metrics.totalPageSales >= 6000 && metrics.adsMaking150Plus >= 5) {
      fullCompScore = settings.weightFullComp * 0.50;
      fullCompLevel = 'ACEITAVEL';
      fullCompColor = 'yellow';
      fullCompSummary = '20+ concorrentes no Full (Baixo Diferencial Logístico). Porém, a forte demanda do nicho absorve múltiplos vendedores ativos.';
      positivePoints.push('Alta demanda global do nicho sustenta múltiplos vendedores no Full simultaneamente.');
    } else {
      fullCompScore = settings.weightFullComp * 0.35;
      fullCompLevel = 'ATENCAO';
      fullCompColor = 'amber';
      fullCompSummary = '20+ concorrentes no Full (Baixo Diferencial). Logística Full é paridade comum no nicho, exigindo diferenciação na oferta.';
      attentionPoints.push('Muitos concorrentes no Full (> 20): o Full funciona como paridade básica, exigindo oferta afiada.');
    }
  }

  metricDiagnostics.push({
    key: 'fullComp',
    name: 'Vantagem Competitiva no Full',
    displayValue: `${metrics.fullCompetitors} no Full (${fullAdvantage.label})`,
    level: fullCompLevel,
    statusColor: fullCompColor,
    summary: fullCompSummary,
    scoreAwarded: Math.round(fullCompScore),
    maxScore: settings.weightFullComp,
  });

  // TOTAL SCORE
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(demandScore + rate150Score + rate300Score + newEntrantsScore + adAgeScore + fullCompScore)
    )
  );

  // RECOMMENDATION
  let recommendation: RecommendationStatus = 'DESCARTAR';
  if (totalScore >= settings.scoreMinEntrar) {
    recommendation = 'ENTRAR';
  } else if (totalScore >= settings.scoreMinAnalisar) {
    recommendation = 'ANALISAR';
  } else if (totalScore >= 40) {
    recommendation = 'ALTO_RISCO';
  } else {
    recommendation = 'DESCARTAR';
  }

  // CHANCE OF GOAL
  let chanceGoal5Daily: 'ALTA' | 'MEDIA' | 'BAIXA' = 'BAIXA';
  if (totalScore >= 75 && metrics.adsMaking150Plus >= 4) {
    chanceGoal5Daily = 'ALTA';
  } else if (totalScore >= 55 || metrics.adsMaking150Plus >= 3) {
    chanceGoal5Daily = 'MEDIA';
  }

  // VERDICT & NEXT STEP
  let verdictTitle = '';
  let verdictText = '';
  let nextStep = '';

  if (recommendation === 'ENTRAR') {
    verdictTitle = 'OPORTUNIDADE RECOMENDADA COM ALTO POTENCIAL';
    verdictText =
      'O produto atende com folga aos critérios de demanda, distribuição de vendas e viabilidade no Mercado Livre Full. As métricas indicam forte probabilidade de atingir e ultrapassar a meta mínima de 3 vendas/dia (90/mês).';
    nextStep = 'Cotar fornecedores confiáveis, validar margem líquida unitária (>20%) e preparar envio de lote de teste para o Full.';
  } else if (recommendation === 'ANALISAR') {
    verdictTitle = 'PRODUTO PROMISSOR COM PONTOS DE ATENÇÃO';
    verdictText =
      'O nicho possui demanda comprovada, mas apresenta algumas restrições (ex: concorrência Full moderada ou necessidade de diferenciação de oferta). Vale a pena validar a viabilidade financeira.';
    nextStep = 'Simular os custos unitários na calculadora financeira. Se a margem for superior a 25%, vale montar anúncio com diferencial competitivo.';
  } else if (recommendation === 'ALTO_RISCO') {
    verdictTitle = 'ALTO RISCO DE OPERAÇÃO';
    verdictText =
      'O produto apresenta métricas frágeis: baixa liquidez para novos vendedores ou forte saturação no Full. Risco de estoque parado ou margem corroída.';
    nextStep = 'Buscar variações menos concorridas deste nicho, kits exclusivos ou focar em outros produtos minerados.';
  } else {
    verdictTitle = 'PRODUTO DESCARTADO';
    verdictText =
      'As métricas da primeira página não sustentam a meta mínima no Full. O volume é muito baixo ou o mercado é totalmente monopolizado por anúncios antigos.';
    nextStep = 'Descartar este produto e continuar a mineração no Avantpro em novas palavras-chave.';
  }

  const salesPotential = calculateSalesPotential(metrics);

  return {
    scoreBreakdown: {
      demandScore: Math.round(demandScore),
      rate150Score: Math.round(rate150Score),
      rate300Score: Math.round(rate300Score),
      newEntrantsScore: Math.round(newEntrantsScore),
      adAgeScore: Math.round(adAgeScore),
      fullCompScore: Math.round(fullCompScore),
      totalScore,
      recommendation,
    },
    diagnosis: {
      metricDiagnostics,
      positivePoints: positivePoints.length > 0 ? positivePoints : ['Demanda existente na categoria.'],
      attentionPoints: attentionPoints.length > 0 ? attentionPoints : ['Monitorar variação de preços e sazonalidade.'],
      chanceGoal5Daily,
      salesPotential,
      fullAdvantage,
      verdictTitle,
      verdictText,
      nextStep,
    },
  };
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
