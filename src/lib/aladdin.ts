// Aladdin-style macro regime + factor tilt model for Indian equity markets
// This models how a sophisticated institutional system (like BlackRock's Aladdin)
// would view the Indian market: regime detection, factor tilts, geopolitical overlay,
// and per-sector outlooks — then blend them into a per-scrip recommendation.

export interface MacroRegime {
  phase: 'Early Recovery' | 'Mid-Cycle Expansion' | 'Late Cycle' | 'Slowdown' | 'Subdued';
  gdpGrowth: string;
  inflationOutlook: string;
  rbiPolicy: string;
  fiscalStance: string;
  fiiFlowOutlook: string;
  crudeOutlook: string;
  rupeeOutlook: string;
  overallRiskAppetite: 'Risk-On' | 'Risk-Off' | 'Neutral';
  keyThemes: string[];
  updated: string;
}

export function currentMacroRegime(): MacroRegime {
  return {
    phase: 'Mid-Cycle Expansion',
    gdpGrowth: 'India FY26 GDP tracking ~6.8-7.0%; capex-led + services strength. PMI manufacturing ~56, services sticky. Above EM avg.',
    inflationOutlook: 'CPI ~4.5-5.0%; food & fuel volatile; sticky above RBI target. Core easing slowly. Rate cuts uncertain near-term.',
    rbiPolicy: 'RBI cautious; on hold through H2 FY26 unless growth softens sharply or inflation breaches. 1-2 cuts priced in by market if growth flags.',
    fiscalStance: 'Govt capex continues; fiscal deficit ~4.8-5.0% of GDP. Capital expenditure focus supportive for infra/capex cycle.',
    fiiFlowOutlook: 'FIIs selective; EM ex-China favored structurally. India structural story intact (demographics, capex, financialization). Flows positive when USD soft + US clarity.',
    crudeOutlook: 'Range-bound $70-90/bbl; OPEC+ discipline + Middle East risk premium. India import pressure if Brent >$85 sustained.',
    rupeeOutlook: 'USD/INR ~83-84; managed float; stable near-term but vulnerable to crude spike + FII outflow + USD strength.',
    overallRiskAppetite: 'Risk-On',
    keyThemes: [
      'Domestic demand (consumption + capex) primary earnings driver — favor domestic cyclicals.',
      'Financials (banks + NBFCs) well-capitalized; credit growth picking up; NIM watch.',
      'Infrastructure + capital goods tailwind from govt capex + private capex recovery.',
      'Crude spike above $85 = headwind for margins (refining, paints, tyres, airlines, FMCG).',
      'Rate-sensitive sectors (NBFC, real estate, auto finance) benefit from stable-to-lower rate path.',
      'FII flow reversals caveat: if USD strengthens + US rates stay higher, large-caps under pressure.',
      'India structurally favored in EM; valuation premium justified for quality compounders.',
    ],
    updated: new Date().toISOString().slice(0, 10),
  };
}

// Factor tilts — like Aladdin's factor risk model
export interface FactorTilt {
  factor: string;
  tilt: 'Overweight' | 'Marketweight' | 'Underweight' | 'Neutral';
  rationale: string;
  affectedSectors: string[];
  horizon: 'Short (0-3m)' | 'Medium (3-12m)' | 'Long (12m+)';
  confidence: number; // 0-1
}

export function factorTilts(): FactorTilt[] {
  return [
    { factor: 'Domestic Growth (GDP / PMI / Consumption)', tilt: 'Overweight', rationale: 'India growth above EM average; capex + consumption tailwind. Favour domestic cyclicals, financials, capital goods, infra, autos (domestic).', affectedSectors: ['Banking', 'Capital Goods', 'Cement', 'Auto (Domestic)', 'Infrastructure', 'Power'], horizon: 'Medium (3-12m)', confidence: 0.8 },
    { factor: 'Financials Quality', tilt: 'Overweight', rationale: 'Banks well-capitalized; NBFC asset quality improving. Credit growth picking up. Watch NIM compression and unsecured lending exposure.', affectedSectors: ['Banking', 'NBFC', 'Insurance', 'Finance (Ex-Bank)'], horizon: 'Medium (3-12m)', confidence: 0.7 },
    { factor: 'Valuation + Quality Factor', tilt: 'Marketweight', rationale: 'Nifty P/E elevated vs 5yr avg but not extreme; growth justifies premium for quality compounders. Favor high-ROCE, low-leverage, consistent compounding businesses.', affectedSectors: ['FMCG', 'IT Services', 'Pharma', 'Consumer Durables'], horizon: 'Long (12m+)', confidence: 0.6 },
    { factor: 'Global Cycle / Export Sensitivity', tilt: 'Underweight', rationale: 'Global growth mixed; US uncertainty, China property drag. Export-heavy IT facing deal delays; metals volatile on China demand. Selective structural winners only.', affectedSectors: ['IT Services', 'Metals', 'Textiles', 'Export-oriented'], horizon: 'Short (0-3m)', confidence: 0.65 },
    { factor: 'Interest Rate Sensitivity', tilt: 'Overweight', rationale: 'Stable-to-lower rate path tailwind for rate-sensitive sectors: NBFC, auto finance, housing finance, capital goods (project finance).', affectedSectors: ['NBFC', 'Housing Finance', 'Auto Finance', 'Capital Goods'], horizon: 'Medium (3-12m)', confidence: 0.7 },
    { factor: 'Commodity Sensitivity', tilt: 'Underweight', rationale: 'Crude range-bound but Middle East risk premium is tail risk. Metals volatile. Favour companies with pricing power and low input-cost pass-through risk.', affectedSectors: ['Refining', 'Metals', 'Cement (fuel cost)', 'Tyres', 'Aviation'], horizon: 'Short (0-3m)', confidence: 0.6 },
    { factor: 'Liquidity / FII Flow Sensitivity', tilt: 'Marketweight', rationale: 'Large-cap index heavyweights sensitive to FII flows. When FIIs net-buy, Nifty heavyweights outperform; when sell, defensives & domestic-driven mid-caps relatively stronger.', affectedSectors: ['Index Heavyweights', 'Defensive FMCG'], horizon: 'Short (0-3m)', confidence: 0.55 },
    { factor: 'Inflation / Input Cost', tilt: 'Underweight', rationale: 'Sticky inflation pressures margins for low-pricing-power sectors. Favour pricing-power leaders (FMCG, IT, pharma generics) over low-margin commodity businesses.', affectedSectors: ['FMCG', 'IT Services', 'Pharma', 'Low-margin manufactures'], horizon: 'Medium (3-12m)', confidence: 0.55 },
  ];
}

// Geopolitical overlay — Blackrock-style global macro + geopolitical risk map
export interface GeoOverlay {
  region: string;
  theme: string;
  direction: '+' | '-' | '~';
  impact: 'Direct' | 'Indirect' | 'Watch';
  affectedSectors: string[];
  note: string;
  urgency: 'High' | 'Medium' | 'Low';
}

export function geoOverlay(): GeoOverlay[] {
  return [
    { region: 'India (Domestic)', theme: 'Fiscal capex & reforms', direction: '+', impact: 'Direct', affectedSectors: ['Capital Goods', 'Cement', 'Infrastructure', 'Power', 'Banking (credit growth)'], note: 'Govt capex budget allocation supports infra/capex cycle. Reforms supportive for business confidence.', urgency: 'Medium' },
    { region: 'India (Domestic)', theme: 'Inflation & RBI policy', direction: '~', impact: 'Direct', affectedSectors: ['NBFC', 'Banking', 'Housing Finance', 'Aviation', 'FMCG input cost'], note: 'CPI sticky above target; RBI cautious. Rate cuts deferred. Sector impact depends on rate path.', urgency: 'Medium' },
    { region: 'US', theme: 'Fed rate path & US growth', direction: '~', impact: 'Indirect', affectedSectors: ['IT Services (US clients)', 'Pharma (US generics)', 'FMCG (exports)'], note: 'US rate cuts delayed; soft landing in progress. IT deal pipeline stabilizing but slow; pharma US exposure stable.', urgency: 'Medium' },
    { region: 'Middle East', theme: 'Crude & geopolitics', direction: '-', impact: 'Direct', affectedSectors: ['Refining', 'Aviation', 'FMCG input cost', 'Paints', 'Tyres', 'Logistics'], note: 'Tensions elevate crude risk premium. India oil-importing; sustained Brent >$85/bbl = margin headwind. Watch rupee.', urgency: 'High' },
    { region: 'China', theme: 'Property drag & stimulus', direction: '-', impact: 'Indirect', affectedSectors: ['Metals (steel, aluminium, iron ore demand)', 'Cement (export)', 'IT hardware'], note: 'China property downturn ongoing; modest stimulus. Demand for commodities soft. Metals exposed to China demand.', urgency: 'Medium' },
    { region: 'Asia (ex-China/Japan)', theme: 'EM ex-China growth', direction: '+', impact: 'Indirect', affectedSectors: ['IT (global clients)', 'Pharma'], note: 'EM ex-China growth mixed but India relative outperformance on reforms + demographics.', urgency: 'Low' },
    { region: 'India–China', theme: 'Border & trade normalization', direction: '+', impact: 'Watch', affectedSectors: ['Pharma (API sourcing)', 'IT', 'General trade'], note: 'India-China border talks ongoing; normalization would reduce risk premium on Indian assets.', urgency: 'Low' },
    { region: 'Global Trade', theme: 'Tariffs & supply chain shifts', direction: '~', impact: 'Indirect', affectedSectors: ['IT', 'Pharma (generics)', 'Textiles', 'Auto ancillaries'], note: 'Global trade tensions create supply chain reconfiguration. India benefits from "China+1" in select manufacturing but tariff risk on exports remains.', urgency: 'Medium' },
  ];
}

// Sector-level outlook matrix (30d, 90d, long-term)
export interface SectorOutlook {
  sector: string;
  outlook30d: 'Positive' | 'Neutral' | 'Negative';
  outlook90d: 'Positive' | 'Neutral' | 'Negative';
  outlookLong: 'Positive' | 'Neutral' | 'Negative';
  catalysts: string[];
  risks: string[];
}

export function sectorOutlook(): Record<string, SectorOutlook> {
  return {
    'Banking': { outlook30d: 'Neutral', outlook90d: 'Positive', outlookLong: 'Positive', catalysts: ['Credit growth picking up', 'Asset quality improving', 'Banks well-capitalized', 'Rate path stable supports NIM clarity'], risks: ['NIM compression from deposit re-pricing', 'Unsecured lending exposure in select banks', 'FII flow impact on large banks'] },
    'NBFC': { outlook30d: 'Positive', outlook90d: 'Positive', outlookLong: 'Positive', catalysts: ['Asset quality improving', 'Rate path stable-to-lower tailwind', 'Funding cost easing', 'Unsecured exposure scrutiny easing for quality players'], risks: ['Funding cost still elevated vs banks', 'Regulatory scrutiny on consumer lending', 'Liquidity stress in niche segments'] },
    'IT Services': { outlook30d: 'Neutral', outlook90d: 'Neutral', outlookLong: 'Positive', catalysts: ['GenAI adoption tailwind gradual', 'Deal pipeline stabilizing', 'Large deal wins needed for sentiment shift'], risks: ['US macro uncertainty', 'Client spending delay', 'Deal elongation', 'GenAI disruption risk to legacy services'] },
    'FMCG': { outlook30d: 'Positive', outlook90d: 'Positive', outlookLong: 'Positive', catalysts: ['Defensive; rural demand recovery expected', 'Pricing power intact for leaders', 'Input cost manageable'], risks: ['Rural consumption still soft', 'Premiumization may slow if rural income weak', 'Input cost spike from crude/commodities'] },
    'Pharma': { outlook30d: 'Positive', outlook90d: 'Positive', outlookLong: 'Positive', catalysts: ['US FDA scrutiny easing', 'Generic pipeline strong for select players', 'Specialty pharma growth', 'Patents expiring create generic opportunity'], risks: ['US pricing pressure (IRA)', 'Regulatory risk (FDA warning letters)', 'API sourcing from China', 'Forex (USD/INR)'] },
    'Auto (Domestic)': { outlook30d: 'Positive', outlook90d: 'Positive', outlookLong: 'Positive', catalysts: ['PV sales growing', 'Festival season demand', 'Rural recovery boosts UVs', 'EV transition accelerating with policy support'], risks: ['Input cost (steel, aluminium, rubber)', 'Rural income dependent for UVs', 'EV margin pressure', 'Competition intensifying'] },
    'Metals': { outlook30d: 'Negative', outlook90d: 'Neutral', outlookLong: 'Neutral', catalysts: ['China stimulus modest', 'Domestic infra demand provides support'], risks: ['China property drag on steel/aluminium/iron ore demand', 'LME inventory builds', 'Global recession risk if US slows sharply'] },
    'Cement': { outlook30d: 'Positive', outlook90d: 'Positive', outlookLong: 'Positive', catalysts: ['Capacity expansion underway', 'Real estate demand supports volume', 'Infra + housing tailwind', 'Pricing discipline in regional markets'], risks: ['Fuel cost (coal, petcoke)', 'Power cost', 'Real estate slowdown in some regions', 'Capacity glut risk if expansion outpaces demand'] },
    'Power': { outlook30d: 'Positive', outlook90d: 'Positive', outlookLong: 'Positive', catalysts: ['Coal supply stabilizing', 'Renewable energy push (policy + economics)', 'Power demand growing with industrialization + data centers + EV charging'], risks: ['Coal price volatility', 'Renewable integration costs', 'Tariff regulation', 'Grid constraints'] },
    'Capital Goods': { outlook30d: 'Positive', outlook90d: 'Positive', outlookLong: 'Positive', catalysts: ['Govt capex + infra push', 'Manufacturing PMI strong', 'Private capex picking up gradually', 'Export markets (defence, railways, power equipment) growth'], risks: ['Order book execution risk', 'Input cost', 'Global macro uncertainty for export-oriented'] },
    'Aviation': { outlook30d: 'Positive', outlook90d: 'Neutral', outlookLong: 'Positive', catalysts: ['Passenger traffic recovering', 'Load factors improving', 'New routes', 'Market consolidation'], risks: ['Crude oil price (fuel is largest cost)', 'Forex (USD-denominated leases)', 'Competition', 'Capacity additions may pressure yields'] },
    'Insurance': { outlook30d: 'Positive', outlook90d: 'Positive', outlookLong: 'Positive', catalysts: ['Penetration rising', 'Private players growing faster', 'Digital distribution', 'Sticky liability; long-term compounding'], risks: ['Market volatility impacts investment income for general insurers', 'Regulations', 'Competitive intensity'] },
    'Refining / Oil & Gas': { outlook30d: 'Negative', outlook90d: 'Neutral', outlookLong: 'Neutral', catalysts: ['Crack spreads under pressure'], risks: ['Crude spike = margin pressure + rupee headwind', 'Energy transition long-term risk', 'Policy (fuel pricing)'] },
    'Consumer Durables': { outlook30d: 'Positive', outlook90d: 'Neutral', outlookLong: 'Positive', catalysts: ['Premiumization trend', 'Urban consumption strong', 'Festive season demand', 'Credit availability for discretionary'], risks: ['Rural demand soft', 'Input cost', 'Competition', 'Discretionary spend vulnerable to macro slowdown'] },
    'Textiles': { outlook30d: 'Neutral', outlook90d: 'Neutral', outlookLong: 'Positive', catalysts: ['China+1 beneficiary for exports', 'Domestic consumption', 'Technical textiles growing'], risks: ['Global demand (US/EU retail)', 'Cotton price volatility', 'Competition from Bangladesh/Vietnam', 'Tariff risk on exports'] },
    'Real Estate': { outlook30d: 'Positive', outlook90d: 'Positive', outlookLong: 'Positive', catalysts: ['Housing demand strong (urban)', 'Pricing power improving', 'Execution capacity building', 'Inventory levels healthy vs prior cycles'], risks: ['Interest rate sensitivity (home loan affordability)', 'Input cost', 'Overexpansion in select pockets', 'Macro slowdown if credit tightens'] },
    'Energy & Telecom': { outlook30d: 'Neutral', outlook90d: 'Neutral', outlookLong: 'Neutral', catalysts: ['Telecom ARPU rising', 'Retail & new energy investments in pipeline'], risks: ['Reliance refining margin under pressure', 'Crude volatility', 'Energy transition risk'] },
    'General': { outlook30d: 'Neutral', outlook90d: 'Neutral', outlookLong: 'Neutral', catalysts: ['India macro growth supportive', 'FII flows depend on USD/US rates'], risks: ['Crude, US rates, geopolitics', 'Valuation premium for large-caps'] },
  };
}

// Blend news + macro + factor + sector into an Aladdin-style actionable recommendation
export interface AladdinRecommendation {
  symbol: string;
  name: string;
  sector: string;
  headline: string;               // the news headline that drove this
  newsSource: string;
  newsSentiment: number;          // -1..1 from news
  newsSentimentLabel: 'Bullish' | 'Neutral' | 'Bearish';
  factorTilt: FactorTilt | null;  // best-matching factor tilt
  regime: MacroRegime;
  geopoliticalFactors: GeoOverlay[];
  sectorOutlook: SectorOutlook;
  score: number;                  // -1..1 blended
  action: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  actionRationale: string;
  catalysts: string[];
  risks: string[];
  positionSizingAdvice: string;
  macroNote: string;
  confidence: number;
  refDate: string;
}

export function buildAladdinRecommendation(
  symbol: string,
  name: string,
  newsItems: { source: string; headline: string; sentiment_score: number; date: string; url: string | null; highlights: string[] }[],
): AladdinRecommendation {
  const regime = currentMacroRegime();
  const factors = factorTilts();
  const geo = geoOverlay();
  const sectorMap = sectorOutlook();
  const sector = sectorName(symbol);
  const sectorOut = sectorMap[sector] || sectorMap['General']!;

  // News sentiment (blended)
  let newsSentiment = 0;
  const today = new Date();
  const weightedSum = newsItems.reduce((acc, item) => {
    const ageDays = (today.getTime() - new Date(item.date).getTime()) / 86400000;
    const recencyWeight = Math.max(0.2, 1 - ageDays / 30); // 0.2 floor, decays over 30 days
    return acc + (item.sentiment_score || 0) * recencyWeight;
  }, 0);
  const weightSum = newsItems.reduce((acc, item) => {
    const ageDays = (today.getTime() - new Date(item.date).getTime()) / 86400000;
    return acc + Math.max(0.2, 1 - ageDays / 30);
  }, 0);
  if (weightSum > 0) newsSentiment = weightedSum / weightSum;

  newsSentiment = Math.max(-1, Math.min(1, newsSentiment));
  let newsLabel: 'Bullish' | 'Neutral' | 'Bearish';
  if (newsSentiment > 0.15) newsLabel = 'Bullish';
  else if (newsSentiment < -0.15) newsLabel = 'Bearish';
  else newsLabel = 'Neutral';

  // Headline that drove (max abs sentiment, recent)
  let headline = `${name} (${symbol}) — no news items available; analysis based on macro regime, sector outlook, and factor tilts.`;
  if (newsItems.length > 0) {
    const ranked = [...newsItems].sort((a, b) => {
      const ageA = (today.getTime() - new Date(a.date).getTime()) / 86400000;
      const ageB = (today.getTime() - new Date(b.date).getTime()) / 86400000;
      return Math.abs(b.sentiment_score || 0) - Math.abs(a.sentiment_score || 0) || ageA - ageB;
    });
    headline = ranked[0].headline;
  }

  // Best-matching factor tilt for this sector
  let factorTilt: FactorTilt | null = null;
  for (const f of factors) {
    if (f.affectedSectors.some(s => sector.startsWith(s) || s.startsWith(sector) || sector.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(sector.toLowerCase()))) {
      factorTilt = f;
      break;
    }
  }

  // Geopolitical factors relevant to this sector
  const geopoliticalFactors = geo.filter(g =>
    g.affectedSectors.some(s => sector.startsWith(s) || s.startsWith(sector) || sector.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(sector.toLowerCase()))
  ).slice(0, 4);

  // Score blend: news 40%, factor tilt 25%, regime/sector 25%, geopolitics 10%
  const newsScore = newsSentiment;
  const factorScore = factorTilt ? (factorTilt.tilt === 'Overweight' ? 0.5 : factorTilt.tilt === 'Marketweight' ? 0 : factorTilt.tilt === 'Underweight' ? -0.4 : -0.2) : 0;
  const regimeSectorScore = sectorOut.outlook30d === 'Positive' ? 0.3 : sectorOut.outlook30d === 'Negative' ? -0.3 : 0;
  const geoScore = geopoliticalFactors.reduce((s, g) => s + (g.direction === '+' ? 0.1 : g.direction === '-' ? -0.08 : 0), 0);

  const rawScore = newsScore * 0.4 + factorScore * 0.25 + regimeSectorScore * 0.25 + geoScore * 0.1;
  const score = Math.max(-1, Math.min(1, rawScore));

  let action: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  let actionRationale: string;
  let positionSizingAdvice: string;

  if (score >= 0.55) {
    action = 'Strong Buy';
    actionRationale = `Strong positive alignment across ${newsLabel.toLowerCase()} news sentiment (${newsSentiment.toFixed(2)}), ${factorTilt ? factorTilt.factor + ' factor tilt (' + factorTilt.tilt + ')' : 'sector factor tilt'}, and current macro regime (${regime.phase}). All three pillars point constructive for ${symbol} in ${sector}.`;
    positionSizingAdvice = 'Full position (100% of intended allocation) acceptable if risk appetite is high; scale in methodically (50% now, 50% on dip/pullback) to optimize entry. Set stop below recent support — 8-10% from entry.';
  } else if (score >= 0.2) {
    action = 'Buy';
    actionRationale = `Moderate positive alignment: ${newsLabel.toLowerCase()} news (${newsSentiment.toFixed(2)}) + ${factorTilt ? factorTilt.factor + ' tilt ' + factorTilt.tilt : 'neutral factor tilt'} + ${sectorOut.outlook30d} 30d sector outlook. Size conservatively — the setup is constructive but not high-conviction.`;
    positionSizingAdvice = 'Partial position (50-75% of intended allocation); scale remainder on pullback or confirmation of catalyst. Stop below -8-12% from entry; trail as uptrend develops.';
  } else if (score >= -0.2) {
    action = 'Hold';
    actionRationale = `Mixed signals: ${newsLabel.toLowerCase()} news (${newsSentiment.toFixed(2)}) + ${factorTilt ? factorTilt.factor + ' tilt ' + factorTilt.tilt : 'neutral'} + ${sectorOut.outlook30d} 30d sector view. Regime-neutral positioning appropriate — no strong directional signal.`;
    positionSizingAdvice = 'Maintain current position size; no new buying. Set alert on key support/resistance. Review if catalyst shifts (news change, quarterly result, macro event).';
  } else if (score >= -0.55) {
    action = 'Sell';
    actionRationale = `Soft outlook: ${newsLabel.toLowerCase()} news (${newsSentiment.toFixed(2)}) + ${factorTilt ? factorTilt.factor + ' tilt ' + factorTilt.tilt : 'neutral'} + ${sectorOut.outlook30d} 30d sector outlook. Reduce exposure — better opportunities exist elsewhere in the market.`;
    positionSizingAdvice = 'Reduce to ~50% of current position; exit remainder on strength or if downside breaks support. Do not add. Redeploy to higher-conviction ideas with positive score.';
  } else {
    action = 'Strong Sell';
    actionRationale = `Strong negative alignment across ${newsLabel.toLowerCase()} news (${newsSentiment.toFixed(2)}), factor tilt, and sector/macro outlook. All pillars point against ${symbol} near-term. Capital preservation priority.`;
    positionSizingAdvice = 'Exit fully. Do not hold. Capital redeploy to assets with positive alignment (Strong Buy / Buy). If exit is costly (tax, illiquidity), exit over 1-2 sessions on strength.';
  }

  // Catalysts & risks
  const catalysts = [
    ...newsItems.slice(0, 2).map(n => n.headline),
    ...sectorOut.catalysts.slice(0, 2),
    factorTilt ? `${factorTilt.factor}: ${factorTilt.rationale}` : null,
  ].filter(Boolean) as string[];

  const risks = [
    ...newsItems.slice(0, 2).filter(n => n.sentiment_score < -0.1).map(n => n.headline),
    ...sectorOut.risks.slice(0, 2),
    geopoliticalFactors.find(g => g.direction === '-')?.note || null,
  ].filter(Boolean) as string[];

  const macroNote = `${regime.phase} regime — ${regime.overallRiskAppetite}. ${sector}: ${sectorOut.outlook30d} (30d) / ${sectorOut.outlook90d} (90d) / ${sectorOut.outlookLong} (long). Key macro backdrop: ${regime.gdpGrowth.split('.')[0]}. ${regime.crudeOutlook.split('.')[0]}.`;
  const confidence = Math.min(0.9, 0.4 + Math.abs(score) * 0.3 + (factorTilt ? factorTilt.confidence * 0.2 : 0) + (newsItems.length > 0 ? 0.15 : 0));

  return {
    symbol, name, sector, headline,
    newsSource: newsItems.length > 0 ? newsItems[0].source : 'EquityPulse',
    newsSentiment, newsSentimentLabel: newsLabel,
    factorTilt, regime, geopoliticalFactors, sectorOutlook: sectorOut,
    score, action, actionRationale, catalysts, risks, positionSizingAdvice,
    macroNote, confidence, refDate: new Date().toISOString().slice(0, 10),
  };
}
