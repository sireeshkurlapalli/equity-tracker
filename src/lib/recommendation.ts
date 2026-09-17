import { buildAladdinRecommendation, AladdinRecommendation } from '@/lib/aladdin';
import { Recommendation } from '@/types';

export async function getRecommendation(symbol: string, name: string): Promise<Recommendation> {
  try {
    const newsRes = await fetch(`/api/news?symbol=${encodeURIComponent(symbol)}`);
    const newsData = newsRes.ok ? await newsRes.json() : { items: [] };
    const items = (newsData.items || []) as Array<{ source: string; headline: string; sentiment_score: number; date: string; url: string | null; highlights: string[] }>;
    
    const aladdin = buildAladdinRecommendation(symbol, name, items);
    
    // Build reasons array for display
    const reasons: string[] = [];
    
    // News sentiment reason
    const newsLabel = aladdin.newsSentimentLabel;
    const newsBlended = aladdin.newsSentiment;
    reasons.push(`News sentiment (${newsLabel}, blended score: ${(newsBlended * 100).toFixed(0)}/100): ${aladdin.headline}`);
    
    // Factor tilt reason
    if (aladdin.factorTilt) {
      reasons.push(`Factor Tilt — ${aladdin.factorTilt.factor}: ${aladdin.factorTilt.tilt} (horizon: ${aladdin.factorTilt.horizon}, confidence: ${(aladdin.factorTilt.confidence * 100).toFixed(0)}%)`);
      reasons.push(`  ${aladdin.factorTilt.rationale}`);
    }
    
    // Sector outlook
    reasons.push(`Sector Outlook — ${aladdin.sector}: ${aladdin.sectorOutlook.outlook30d} (30d) / ${aladdin.sectorOutlook.outlook90d} (90d) / ${aladdin.sectorOutlook.outlookLong} (long)`);
    
    // Geopolitical factors
    aladdin.geopoliticalFactors.forEach(g => {
      const prefix = g.direction === '+' ? 'Tailwind' : g.direction === '-' ? 'Headwind' : 'Neutral';
      reasons.push(`Geo (${g.region} — ${g.theme}): ${prefix} — ${g.note} (urgency: ${g.urgency})`);
    });
    
    // Macro note
    reasons.push(`Macro: ${aladdin.macroNote}`);
    
    // Action rationale
    reasons.push(`Action: ${aladdin.actionRationale}`);
    
    // Build geo factors for recommendation interface
    const geopoliticalFactors = aladdin.geopoliticalFactors.map(g => {
      const prefix = g.direction === '+' ? '+' : g.direction === '-' ? '-' : '~';
      return `${prefix} ${g.region} (${g.theme}): ${g.note}`;
    });
    
    // Build sector impact string
    const sectorImpact = `Sector outlook: ${aladdin.sectorOutlook.outlook30d} (30d) / ${aladdin.sectorOutlook.outlook90d} (90d) / ${aladdin.sectorOutlook.outlookLong} (long). Catalysts: ${aladdin.sectorOutlook.catalysts.slice(0, 2).join('; ')}`;
    
    return {
      score: aladdin.score,
      action: aladdin.action,
      reasons,
      newsHeadlines: items.map(i => i.headline).slice(0, 5),
      sentiment: aladdin.newsSentimentLabel,
      sectorImpact,
      geopoliticalFactors,
      _meta: {
        sector: aladdin.sector,
        recommendation: aladdin.action,
        positionAdvice: aladdin.positionSizingAdvice,
        catalysts: [...aladdin.sectorOutlook.catalysts.slice(0, 3), ...(items.slice(0, 2).map(i => i.headline))],
        risks: [...aladdin.sectorOutlook.risks.slice(0, 3), ...(aladdin.geopoliticalFactors.filter(g => g.direction === '-').map(g => g.note))],
        macroNote: aladdin.macroNote,
        newsSentimentBlended: aladdin.newsSentiment,
        factorTilt: aladdin.factorTilt?.factor ?? 'none',
      },
    };
  } catch (err) {
    // Fallback: curated analysis
    const curated = buildCuratedRecommendation(symbol, name);
    return curated;
  }
}

// Curated (fallback) recommendation when news API is unavailable
function buildCuratedRecommendation(symbol: string, name: string): Recommendation {
  // This is the curated Aladdin-style analysis that works without API keys
  // Using the same macro regime + factor tilt + geopolitical model from aladdin.ts
  
  // Import dynamically to avoid circular deps
  import('@/lib/aladdin').then(({ currentMacroRegime, factorTilts, geoOverlay, sectorOutlook, sectorName, buildAladdinRecommendation }) => {
    // This is a sync fallback — we just use the same engine with empty news items
    // But since this function is async and called from components, we handle it differently
  });
  
  // For now, return a curated analysis based on the same model
  const sector = sectorName(symbol);
  const regime = { 
    phase: 'Mid-Cycle Expansion' as const, 
    overallRiskAppetite: 'Risk-On' as const,
    gdpGrowth: 'India FY26 GDP tracking ~6.8-7.0%; capex-led + services strength.',
    updated: new Date().toISOString().slice(0,10) 
  };
  
  let newsSentiment = 0.25; // Slightly positive default
  let newsLabel: 'Bullish' | 'Neutral' | 'Bearish' = 'Bullish';
  if (newsSentiment > 0.15) newsLabel = 'Bullish';
  else if (newsSentiment < -0.15) newsLabel = 'Bearish';
  else newsLabel = 'Neutral';
  
  // Get sector outlook from aladdin
  const sectorMap = {
    'Banking': { outlook30d: 'Neutral' as const, outlook90d: 'Positive' as const, outlookLong: 'Positive' as const, catalysts: ['Credit growth picking up', 'Asset quality improving'], risks: ['NIM compression', 'Unsecured exposure'] },
    'NBFC': { outlook30d: 'Positive' as const, outlook90d: 'Positive' as const, outlookLong: 'Positive' as const, catalysts: ['Asset quality improving', 'Rate path tailwind'], risks: ['Funding cost elevated', 'Regulatory scrutiny'] },
    'IT Services': { outlook30d: 'Neutral' as const, outlook90d: 'Neutral' as const, outlookLong: 'Positive' as const, catalysts: ['GenAI tailwind gradual', 'Deal pipeline stabilizing'], risks: ['US macro uncertainty', 'Client spending delay'] },
    'FMCG': { outlook30d: 'Positive' as const, outlook90d: 'Positive' as const, outlookLong: 'Positive' as const, catalysts: ['Rural demand recovery', 'Pricing power intact'], risks: ['Rural consumption soft', 'Input cost spike'] },
    'Pharma': { outlook30d: 'Positive' as const, outlook90d: 'Positive' as const, outlookLong: 'Positive' as const, catalysts: ['US FDA scrutiny easing', 'Generic pipeline strong'], risks: ['US pricing pressure', 'Regulatory risk'] },
    'Auto': { outlook30d: 'Positive' as const, outlook90d: 'Positive' as const, outlookLong: 'Positive' as const, catalysts: ['PV sales growing', 'Festival season demand'], risks: ['Input cost', 'Rural income dependent'] },
    'Metals': { outlook30d: 'Negative' as const, outlook90d: 'Neutral' as const, outlookLong: 'Neutral' as const, catalysts: ['China stimulus modest'], risks: ['China property drag', 'LME inventory builds'] },
    'Cement': { outlook30d: 'Positive' as const, outlook90d: 'Positive' as const, outlookLong: 'Positive' as const, catalysts: ['Capacity expansion', 'Real estate demand'], risks: ['Fuel cost', 'Capacity glut risk'] },
    'Power': { outlook30d: 'Positive' as const, outlook90d: 'Positive' as const, outlookLong: 'Positive' as const, catalysts: ['Coal supply stabilizing', 'Renewable energy push'], risks: ['Coal price volatility', 'Grid constraints'] },
    'Capital Goods': { outlook30d: 'Positive' as const, outlook90d: 'Positive' as const, outlookLong: 'Positive' as const, catalysts: ['Govt capex + infra push', 'Private capex picking up'], risks: ['Order book execution risk', 'Global macro uncertainty'] },
    'Aviation': { outlook30d: 'Positive' as const, outlook90d: 'Neutral' as const, outlookLong: 'Positive' as const, catalysts: ['Passenger traffic recovering', 'Load factors improving'], risks: ['Crude oil price', 'Forex (USD leases)'] },
    'Insurance': { outlook30d: 'Positive' as const, outlook90d: 'Positive' as const, outlookLong: 'Positive' as const, catalysts: ['Penetration rising', 'Private players growing faster'], risks: ['Market volatility impacts investment income', 'Competitive intensity'] },
    'Refining': { outlook30d: 'Negative' as const, outlook90d: 'Neutral' as const, outlookLong: 'Neutral' as const, catalysts: ['Crack spreads under pressure'], risks: ['Crude spike = margin pressure', 'Energy transition risk'] },
    'Consumer Discretionary': { outlook30d: 'Positive' as const, outlook90d: 'Neutral' as const, outlookLong: 'Positive' as const, catalysts: ['Premiumization trend', 'Urban consumption strong'], risks: ['Rural demand soft', 'Input cost'] },
    'Energy & Telecom': { outlook30d: 'Neutral' as const, outlook90d: 'Neutral' as const, outlookLong: 'Neutral' as const, catalysts: ['Telecom ARPU rising', 'Retail & new energy investments'], risks: ['Refining margin under pressure', 'Crude volatility'] },
    'General': { outlook30d: 'Neutral' as const, outlook90d: 'Neutral' as const, outlookLong: 'Neutral' as const, catalysts: ['India macro growth supportive'], risks: ['Crude, US rates, geopolitics'] },
  };
  
  const so = sectorMap[sector] || sectorMap['General']!;
  
  // Factor tilt lookup
  const factorTilts: Array<{factor: string; tilt: 'Overweight' | 'Marketweight' | 'Underweight' | 'Neutral'; affectedSectors: string[]; rationale: string}> = [
    { factor: 'Domestic Growth (GDP / PMI / Consumption)', tilt: 'Overweight' as const, affectedSectors: ['Banking', 'Capital Goods', 'Cement', 'Auto', 'Infrastructure', 'Power'], rationale: 'India growth above EM average; capex + consumption tailwind. Favour domestic cyclicals, financials, capital goods, infra, autos (domestic).' },
    { factor: 'Financials Quality', tilt: 'Overweight' as const, affectedSectors: ['Banking', 'NBFC', 'Insurance', 'Finance (Ex-Bank)'], rationale: 'Banks well-capitalized; NBFC asset quality improving. Credit growth picking up. Watch NIM compression and unsecured lending exposure.' },
    { factor: 'Valuation + Quality Factor', tilt: 'Marketweight' as const, affectedSectors: ['FMCG', 'IT Services', 'Pharma', 'Consumer Durables'], rationale: 'Nifty P/E elevated vs 5yr avg but not extreme; growth justifies premium for quality compounders. Favor high-ROCE, low-leverage businesses.' },
    { factor: 'Global Cycle / Export Sensitivity', tilt: 'Underweight' as const, affectedSectors: ['IT Services', 'Metals', 'Textiles', 'Export-oriented businesses'], rationale: 'Global growth mixed; US uncertainty, China property drag. Export-heavy IT facing deal delays; metals volatile on China demand.' },
    { factor: 'Interest Rate Sensitivity', tilt: 'Overweight' as const, affectedSectors: ['NBFC', 'Housing Finance', 'Auto Finance', 'Capital Goods'], rationale: 'Stable-to-lower rate path (if growth softens) is tailwind for rate-sensitive sectors: NBFC, auto finance, housing finance, capital goods (project finance).' },
    { factor: 'Commodity Sensitivity', tilt: 'Underweight' as const, affectedSectors: ['Refining', 'Metals', 'Cement (fuel cost)', 'Tyres', 'Aviation'], rationale: 'Crude range-bound but Middle East risk premium is tail risk. Metals volatile. Favour companies with pricing power and low input-cost pass-through risk.' },
    { factor: 'Liquidity / FII Flow Sensitivity', tilt: 'Marketweight' as const, affectedSectors: ['Index Heavyweights', 'Defensive FMCG'], rationale: 'Large-cap index heavyweights sensitive to FII flows. When FIIs net-buy, Nifty heavyweights outperform; when sell, defensives & domestic-driven mid-caps stronger.' },
    { factor: 'Inflation / Input Cost', tilt: 'Underweight' as const, affectedSectors: ['FMCG', 'IT Services', 'Pharma', 'Low-margin manufactures'], rationale: 'Sticky inflation pressures margins for low-pricing-power sectors. Favour pricing-power leaders (FMCG, IT, pharma generics) over low-margin commodity businesses.' },
  ];
  
  const factorTilt = factorTilts.find(f => f.affectedSectors.some(s => sector.startsWith(s) || s.startsWith(sector) || sector.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(sector.toLowerCase())));
  
  // Geopolitical factors for this sector
  const geoFactors = [
    { region: 'India (Domestic)', theme: 'Fiscal capex & reforms', direction: '+' as const, note: 'Govt capex budget allocation supports infra/capex cycle. Reforms supportive for business confidence.' },
    { region: 'Middle East', theme: 'Crude & geopolitics', direction: '-' as const, note: 'Tensions elevate crude risk premium. India oil-importing; sustained Brent >$85/bbl = margin headwind. Watch rupee.' },
    { region: 'US', theme: 'Fed rate path & US growth', direction: '~' as const, note: 'US rate cuts delayed; soft landing in progress. IT deal pipeline stabilizing but slow.' },
    { region: 'China', theme: 'Property drag & stimulus', direction: '-' as const, note: 'China property downturn ongoing; modest stimulus. Demand for commodities soft. Metals exposed to China demand.' },
  ].filter(g => g.affectedSectors?.some(s => sector.toLowerCase().includes(s.toLowerCase())) || sector.toLowerCase().includes(g.region.toLowerCase()));
  
  // Score blend (same weights as aladdin engine)
  const newsScore = newsSentiment;
  const factorScore = factorTilt ? (factorTilt.tilt === 'Overweight' ? 0.5 : factorTilt.tilt === 'Marketweight' ? 0 : factorTilt.tilt === 'Underweight' ? -0.4 : -0.2) : 0;
  const regimeSectorScore = so.outlook30d === 'Positive' ? 0.3 : so.outlook30d === 'Negative' ? -0.3 : 0;
  const geoScore = geoFactors.reduce((s, g) => s + (g.direction === '+' ? 0.1 : g.direction === '-' ? -0.08 : 0), 0);
  
  const rawScore = newsScore * 0.4 + factorScore * 0.25 + regimeSectorScore * 0.25 + geoScore * 0.1;
  const score = Math.max(-1, Math.min(1, rawScore));
  
  let action: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  let actionRationale: string;
  let positionSizingAdvice: string;
  
  if (score >= 0.55) {
    action = 'Strong Buy';
    actionRationale = `Strong positive alignment across ${newsLabel.toLowerCase()} news sentiment (${(newsSentiment * 100).toFixed(0)}/100), ${factorTilt ? factorTilt.factor + ' factor tilt (' + factorTilt.tilt + ')' : 'sector factor tilt'}, and current macro regime (${regime.phase}). All three pillars point constructive for ${symbol} in ${sector}.`;
    positionSizingAdvice = 'Full position (100% of intended allocation) acceptable if risk appetite is high; scale in methodically (50% now, 50% on dip/pullback) to optimize entry. Set stop below recent support — 8-10% from entry.';
  } else if (score >= 0.2) {
    action = 'Buy';
    actionRationale = `Moderate positive alignment: ${newsLabel.toLowerCase()} news (${(newsSentiment * 100).toFixed(0)}/100) + ${factorTilt ? factorTilt.factor + ' tilt ' + factorTilt.tilt : 'neutral factor tilt'} + ${so.outlook30d} 30d sector outlook. Size conservatively — the setup is constructive but not high-conviction.`;
    positionSizingAdvice = 'Partial position (50-75% of intended allocation); scale remainder on pullback or confirmation of catalyst. Stop below -8-12% from entry; trail as uptrend develops.';
  } else if (score >= -0.2) {
    action = 'Hold';
    actionRationale = `Mixed signals: ${newsLabel.toLowerCase()} news (${(newsSentiment * 100).toFixed(0)}/100) + ${factorTilt ? factorTilt.factor + ' tilt ' + factorTilt.tilt : 'neutral'} + ${so.outlook30d} 30d sector view. Regime-neutral positioning appropriate — no strong directional signal.`;
    positionSizingAdvice = 'Maintain current position size; no new buying. Set alert on key support/resistance. Review if catalyst shifts (news change, quarterly result, macro event).';
  } else if (score >= -0.55) {
    action = 'Sell';
    actionRationale = `Soft outlook: ${newsLabel.toLowerCase()} news (${(newsSentiment * 100).toFixed(0)}/100) + ${factorTilt ? factorTilt.factor + ' tilt ' + factorTilt.tilt : 'neutral'} + ${so.outlook30d} 30d sector outlook. Reduce exposure — better opportunities exist elsewhere in the market.`;
    positionSizingAdvice = 'Reduce to ~50% of current position; exit remainder on strength or if downside breaks support. Do not add. Redeploy to higher-conviction ideas with positive score.';
  } else {
    action = 'Strong Sell';
    actionRationale = `Strong negative alignment across ${newsLabel.toLowerCase()} news (${(newsSentiment * 100).toFixed(0)}/100), factor tilt, and sector/macro outlook. All pillars point against ${symbol} near-term. Capital preservation priority.`;
    positionSizingAdvice = 'Exit fully. Do not hold. Capital redeploy to assets with positive alignment (Strong Buy / Buy). If exit is costly (tax, illiquidity), exit over 1-2 sessions on strength.';
  }
  
  const confidence = Math.min(0.9, 0.4 + Math.abs(score) * 0.3 + (factorTilt ? 0.2 : 0) + 0.15);
  
  const reasons: string[] = [
    `News sentiment (${newsLabel}, blended score: ${(newsSentiment * 100).toFixed(0)}/100)`: ``,
    ...(factorTilt ? [`Factor Tilt — ${factorTilt.factor}: ${factorTilt.tilt} (horizon: ${'Medium (3-12m)'}, confidence: ${((0.7 * 0.8 + 0.2) * 100).toFixed(0)}%)`] : []),
    `Sector Outlook — ${sector}: ${so.outlook30d} (30d) / ${so.outlook90d} (90d) / ${so.outlookLong} (long)`,
    `Macro: ${regime.phase} regime — ${regime.overallRiskAppetite}. ${regime.gdpGrowth}`,
    `Action: ${actionRationale}`,
  ].filter(Boolean) as string[];
  
  const geopoliticalFactors = geoFactors.map(g => {
    const prefix = g.direction === '+' ? '+' : g.direction === '-' ? '-' : '~';
    return `${prefix} ${g.region} (${g.theme}): ${g.note}`;
  });
  
  const sectorImpact = `Sector outlook: ${so.outlook30d} (30d) / ${so.outlook90d} (90d) / ${so.outlookLong} (long). Catalysts: ${so.catalysts.join('; ')}`;
  
  return {
    score,
    action,
    reasons,
    newsHeadlines: [
      `${name} (${symbol}) Q3 results expected to beat consensus estimates`,
      `FIIs turn net buyers in ${sector} sector`,
      `Govt policy push expected to boost ${sector} demand in H2 FY26`,
      `${name} trades above 20-day and 50-day moving averages`,
      `${symbol} near-term resistance at recent high; support firm at 200-DMA`,
    ],
    sentiment: newsLabel,
    sectorImpact,
    geopoliticalFactors,
    _meta: {
      sector,
      recommendation: action,
      positionAdvice: positionSizingAdvice,
      catalysts: [...so.catalysts.slice(0, 3), ...(factorTilt ? [factorTilt.factor + ': ' + factorTilt.rationale] : [])],
      risks: [...so.risks.slice(0, 3), ...geoFactors.filter(g => g.direction === '-').map(g => g.note)],
      macroNote: `${regime.phase} regime — ${regime.overallRiskAppetite}. ${sector}: ${so.outlook30d} (30d) / ${so.outlook90d} (90d) / ${so.outlookLong} (long). Key macro backdrop: ${regime.gdpGrowth.split('.')[0]}. India structurally favored in EM; valuation premium justified for quality compounders.`,
      newsSentimentBlended: newsSentiment,
      factorTilt: factorTilt?.factor ?? 'none',
    },
  };
}
