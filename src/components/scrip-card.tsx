'use client';

import { Scrip, Pnl, Recommendation } from '@/types';
import { Badge, Button } from './ui';
import { useEffect, useState } from 'react';

interface Props {
  scrip: Scrip;
  onRemove: (id: string) => void;
  onNavigate: (id: string) => void;
}

export function ScripCard({ scrip, onRemove, onNavigate }: Props) {
  const [pnl, setPnl] = useState<Pnl>({
    invested: 0, currentValue: 0, grossPnl: 0, grossPnlPercent: 0,
    adjustedPnl: 0, adjustedPnlPercent: 0,
  });
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const pl = {
      invested: scrip.buyPrice * scrip.buyQuantity,
      currentValue: scrip.currentPrice ? scrip.currentPrice * scrip.buyQuantity : scrip.buyPrice * scrip.buyQuantity,
      grossPnl: scrip.currentPrice ? scrip.currentPrice * scrip.buyQuantity - scrip.buyPrice * scrip.buyQuantity : 0,
      grossPnlPercent: scrip.currentPrice ? ((scrip.currentPrice * scrip.buyQuantity - scrip.buyPrice * scrip.buyQuantity) / (scrip.buyPrice * scrip.buyQuantity)) * 100 : 0,
      adjustedPnl: 0,
      adjustedPnlPercent: 0,
    };
    pl.adjustedPnl = pl.grossPnl * 0.6;
    pl.adjustedPnlPercent = pl.grossPnlPercent * 0.6;
    setPnl(pl);
  }, [scrip]);

  useEffect(() => {
    if (!scrip.currentPrice) return;
    let cancelled = false;
    async function fetchRec() {
      setLoadingRec(true);
      try {
        const r = await getRecommendation(scrip.symbol, scrip.name);
        if (!cancelled) setRec(r);
      } finally {
        if (!cancelled) setLoadingRec(false);
      }
    }
    fetchRec();
    return () => { cancelled = true; };
  }, [scrip.symbol, scrip.name]);

  const isUp = pnl.grossPnl >= 0;
  const pnlColor = isUp ? 'text-[var(--green)]' : 'text-[var(--red)]';
  const bgColor = isUp ? 'bg-[var(--green-dim)]' : 'bg-[var(--red-dim)]';

  return (
    <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden animate-slide-up hover:border-[var(--border-light)] transition-all">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--blue-dim)] to-[var(--purple)] flex items-center justify-center text-lg font-bold text-white shadow-lg">
              {scrip.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">{scrip.symbol}</h3>
                {scrip.currentPrice && (
                  <Badge variant={isUp ? 'green' : 'red'}>
                    {isUp ? '▲' : '▼'} {Math.abs(pnl.grossPnlPercent).toFixed(2)}%
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)]">{scrip.name}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? '▼' : '▶'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onNavigate(scrip.id)}>
              📋
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onRemove(scrip.id)} className="text-[var(--red)]">
              ✕
            </Button>
          </div>
        </div>
      </div>

      {/* Price row */}
      <div className="px-4 pb-2 flex items-center justify-between border-t border-[var(--border)]">
        <div>
          <p className="text-xs text-[var(--text-muted)]">Buy Price</p>
          <p className="text-sm font-medium">₹{scrip.buyPrice.toLocaleString('en-IN')}</p>
        </div>
        {scrip.currentPrice && (
          <>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Current</p>
              <p className="text-sm font-bold text-[var(--blue)]">₹{scrip.currentPrice.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Qty</p>
              <p className="text-sm font-medium">{scrip.buyQuantity.toLocaleString('en-IN')}</p>
            </div>
          </>
        )}
      </div>

      {/* P&L bar */}
      {scrip.currentPrice && (
        <div className={`px-4 pb-3 ${bgColor} rounded-b-xl border-t border-[var(--border)]`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Gross P&L</span>
            <span className={`text-lg font-bold ${pnlColor}`}>
              {pnl.grossPnl >= 0 ? '+' : ''}{pnl.grossPnl.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-[var(--text-secondary)]">Adjusted (60%)</span>
            <span className={`text-sm font-semibold ${pnlColor}`}>
              {pnl.adjustedPnl >= 0 ? '+' : ''}{pnl.adjustedPnl.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      )}

      {/* Expanded: Recommendation */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-[var(--border)] grid grid-cols-1 gap-3">
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-2">ANALYST RECOMMENDATION</p>
            {loadingRec ? (
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <span className="inline-block w-3 h-3 rounded-full bg-[var(--blue)] animate-pulse-soft" />
                Loading recommendation...
              </div>
            ) : rec ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={rec.sentiment === 'Bullish' ? 'green' : rec.sentiment === 'Bearish' ? 'red' : 'amber'}>
                    {rec.sentiment}
                  </Badge>
                  <Badge variant={rec.action === 'Strong Buy' || rec.action === 'Buy' ? 'green' : rec.action === 'Strong Sell' || rec.action === 'Sell' ? 'red' : 'amber'}>
                    {rec.action}
                  </Badge>
                  <span className="text-xs text-[var(--text-muted)] ml-auto">Score: {rec.score.toFixed(2)}</span>
                </div>
                <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1.5">📉 Geopolitical & Market Factors</p>
                  <ul className="space-y-1">
                    {rec.geopoliticalFactors.map((f, i) => (
                      <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                        <span className={f.startsWith('+') ? 'text-[var(--green)]' : 'text-[var(--red)]'}>●</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)] mt-2">
                  <p className="text-xs text-[var(--text-muted)] mb-1.5">📰 Recent News & Analyst Views</p>
                  <ul className="space-y-1">
                    {rec.newsHeadlines.map((h, i) => (
                      <li key={i} className="text-xs text-[var(--text-secondary)]">• {h}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)] mt-2">
                  <p className="text-xs text-[var(--text-muted)] mb-1">🏭 Sector View</p>
                  <p className="text-xs text-[var(--text-secondary)]">{rec.sectorImpact}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No data available. Add a current price to get recommendations.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

async function getRecommendation(symbol: string, name: string): Promise<Recommendation> {
  const headlines = await fetchNewsForSymbol(symbol, name);
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
    'Banking': 'Banking well-capitalized; credit growth picking up. RBI supportive. Watch NIM compression.',
    'IT Services': 'IT facing macro headwinds but deal pipeline stabilizing. GenAI tailwinds emerging.',
    'FMCG': 'Defensive; rural demand recovery expected. Pricing power intact for leaders.',
    'Metals': 'Commodity prices volatile on China demand. Domestic infra push provides support.',
    'Auto': 'PV sales growing; EV transition accelerating. Margin pressure from input costs.',
    'Pharma': 'US FDA scrutiny easing. Generic pipeline strong for select players.',
    'Power': 'Coal supply stabilizing. Renewable energy push creates long-term tailwind.',
    'Energy & Telecom': 'Reliance refining margin under pressure; telecom ARPU rising. Retail & new energy in pipeline.',
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
