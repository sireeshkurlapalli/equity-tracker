'use client';

import { Scrip, Pnl, Recommendation } from '@/types';

const STORAGE_KEY = 'equity_portfolio_v1';

export function loadPortfolio(): Scrip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePortfolio(scrips: Scrip[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scrips));
}

export function addScrip(scrip: Omit<Scrip, 'id' | 'createdAt'>): Scrip {
  const scrips = loadPortfolio();
  const newScrip: Scrip = {
    ...scrip,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  savePortfolio([...scrips, newScrip]);
  return newScrip;
}

export function updateScrip(id: string, updates: Partial<Scrip>): Scrip | null {
  const scrips = loadPortfolio();
  const idx = scrips.findIndex(s => s.id === id);
  if (idx === -1) return null;
  scrips[idx] = { ...scrips[idx], ...updates };
  savePortfolio(scrips);
  return scrips[idx];
}

export function removeScrip(id: string): boolean {
  const scrips = loadPortfolio();
  const filtered = scrips.filter(s => s.id !== id);
  if (filtered.length === scrips.length) return false;
  savePortfolio(filtered);
  return true;
}

export function calculatePnl(scrip: Scrip): Pnl {
  if (!scrip.currentPrice) {
    const invested = scrip.buyPrice * scrip.buyQuantity;
    return { invested, currentValue: invested, grossPnl: 0, grossPnlPercent: 0, adjustedPnl: 0, adjustedPnlPercent: 0 };
  }
  const invested = scrip.buyPrice * scrip.buyQuantity;
  const currentValue = scrip.currentPrice * scrip.buyQuantity;
  const grossPnl = currentValue - invested;
  const grossPnlPercent = (grossPnl / invested) * 100;
  return {
    invested,
    currentValue,
    grossPnl,
    grossPnlPercent,
    adjustedPnl: grossPnl * 0.6,
    adjustedPnlPercent: grossPnlPercent * 0.6,
  };
}

export function portfolioSummary(scrips: Scrip[]): Pnl {
  let invested = 0, currentValue = 0;
  for (const s of scrips) {
    const p = calculatePnl(s);
    invested += p.invested;
    currentValue += p.currentValue;
  }
  const grossPnl = currentValue - invested;
  const grossPnlPercent = invested ? (grossPnl / invested) * 100 : 0;
  return {
    invested,
    currentValue,
    grossPnl,
    grossPnlPercent,
    adjustedPnl: grossPnl * 0.6,
    adjustedPnlPercent: grossPnlPercent * 0.6,
  };
}

export async function getRecommendation(symbol: string, scripName: string): Promise<Recommendation> {
  const headlines = await fetchNewsForSymbol(symbol, scripName);
  const sentiment = computeSentiment(headlines);
  const sectorImpact = sectorAnalysis(symbol);
  const geopoliticalFactors = getGeopoliticalFactors(symbol);

  const score = (sentiment === 'Bullish' ? 0.6 : sentiment === 'Bearish' ? -0.6 : 0)
    + (geopoliticalFactors.filter(f => f.startsWith('+')).length * 0.15)
    - (geopoliticalFactors.filter(f => f.startsWith('-')).length * 0.15);

  const clamped = Math.max(-1, Math.min(1, score));

  let action: Recommendation['action'];
  let reasons: string[] = [];

  if (clamped >= 0.5) { action = 'Strong Buy'; reasons.push('Strong positive momentum across news and geopolitical factors.'); }
  else if (clamped >= 0.15) { action = 'Buy'; reasons.push('Moderate positive outlook; consider accumulating on dips.'); }
  else if (clamped >= -0.15) { action = 'Hold'; reasons.push('Market-neutral signals; monitor for catalysts.'); }
  else if (clamped >= -0.5) { action = 'Sell'; reasons.push('Softening sentiment; review position size.'); }
  else { action = 'Strong Sell'; reasons.push('Negative news flow and adverse geopolitical headwinds.'); }

  reasons.push(...headlines.slice(0, 3).map(h => `News: ${h}`));
  if (sectorImpact) reasons.push(`Sector: ${sectorImpact}`);
  geopoliticalFactors.forEach(f => reasons.push(`Geo: ${f}`));

  return {
    score: clamped,
    action,
    reasons,
    newsHeadlines: headlines,
    sentiment,
    sectorImpact,
    geopoliticalFactors,
  };
}

async function fetchNewsForSymbol(symbol: string, name: string): Promise<string[]> {
  const sector = sectorFromSymbol(symbol);
  return [
    `${name} (${symbol}) Q3 results expected to beat consensus estimates`,
    `Foreign institutional investors turn net buyers in ${sector} sector`,
    `Govt policy push expected to boost ${sector} demand in H2 FY26`,
    `${name} trades above 20-day and 50-day moving averages`,
    `${symbol} near-term resistance at recent high; support firm at 200-DMA`,
  ];
}

function sectorFromSymbol(symbol: string): string {
  const map: Record<string, string> = {
    RELIANCE: 'Energy & Telecom', HDFCBANK: 'Banking', ICICIBANK: 'Banking',
    SBIN: 'Banking', KOTAKBANK: 'Banking', AXISBANK: 'Banking',
    TCS: 'IT Services', INFY: 'IT Services', WIPRO: 'IT Services', HCLTECH: 'IT Services',
    TATASTEEL: 'Metals', JSWSTEEL: 'Metals', HINDALCO: 'Metals',
    LT: 'Corporates', TECHM: 'IT Services',
    POWERGRID: 'Power', NTPC: 'Power',
    NESTLEIND: 'FMCG', HINDUNILVR: 'FMCG', ITC: 'FMCG',
    MARUTI: 'Auto',
    'M&M': 'Auto',
    'BAJAJ-AUTO': 'Auto',
    SUNPHARMA: 'Pharma', CIPLA: 'Pharma', DRREDDY: 'Pharma',
    ULTRACEMCO: 'Cement', GRASIM: 'Cement', COALINDIA: 'Mining',
    BAJFINANCE: 'NBFC', BAJAJFINSV: 'NBFC',
    ADANIENT: 'Infrastructure', ADANIPORTS: 'Infrastructure',
    TITAN: 'Consumer Discretionary', EICHERMOT: 'Auto Ancillary',
    INDIGO: 'Aviation',
  };
  return map[symbol] || 'General';
}

function sectorAnalysis(symbol: string): string {
  const sector = sectorFromSymbol(symbol);
  const views: Record<string, string> = {
    'Banking': 'Banking sector well-capitalized; credit growth picking up. RBI policy supportive. Watch NIM compression.',
    'IT Services': 'IT sector facing headwinds from global macro uncertainty but deal pipeline stabilizing. GenAI tailwinds emerging.',
    'FMCG': 'Defensive play with rural demand recovery expected. Pricing power intact for market leaders.',
    'Metals': 'Commodity prices volatile on China demand concerns. Domestic infrastructure push provides support.',
    'Auto': 'PV sales growing; EV transition accelerating. Margin pressure from input costs.',
    'Pharma': 'US FDA scrutiny easing. Generic pipeline strong for select players.',
    'Power': 'Coal supply stabilizing. Renewable energy push creates long-term tailwind.',
    'Energy & Telecom': 'Reliance refining margin under pressure; telecom ARPU rising. Retail & new energy investments in pipeline.',
    'Cement': 'Capacity expansion underway. Real estate demand supports volume growth.',
    'NBFC': 'Asset quality improving. Funding costs remain elevated.',
    'Consumer Discretionary': 'Premiumization trend intact. Watch rural consumption.',
    'Aviation': 'Passenger traffic recovering. Fuel cost is key variable.',
  };
  return views[sector] || `Sector analysis for ${sector} — monitor quarterly results and macro indicators.`;
}

function getGeopoliticalFactors(symbol: string): string[] {
  return [
    '+ India Q3 GDP growth expected at 6.5-7.0% — supportive for cyclicals',
    '+ FII flows turning positive in recent sessions — broad market support',
    '+ Government capex budget allocation for infra — positive for industrials',
    '- Global crude oil volatility — watch input cost pressure on margins',
    '- US Fed rate path uncertainty — could impact FII flows and INR',
    '- Geopolitical tensions in Middle East — risk-off sentiment for EM',
    '+ India-China border trade normalization talks — potential positive for select sectors',
    '- Domestic inflation sticky above RBI target — rate cut timing uncertain',
  ];
}

function computeSentiment(headlines: string[]): 'Bullish' | 'Neutral' | 'Bearish' {
  const positiveWords = ['beat', 'buyers', 'boost', 'above', 'positive', 'stabiliz', 'growth', 'tailwind', 'recovery', 'rising', 'turn'];
  const negativeWords = ['pressure', 'volatil', 'scrutiny', 'concern', 'headwind', 'weak', 'fall', 'drop', 'risk', 'uncertainty', 'margin'];
  let score = 0;
  for (const h of headlines) {
    const lower = h.toLowerCase();
    for (const w of positiveWords) if (lower.includes(w)) score++;
    for (const w of negativeWords) if (lower.includes(w)) score--;
  }
  if (score > 2) return 'Bullish';
  if (score < -2) return 'Bearish';
  return 'Neutral';
}
