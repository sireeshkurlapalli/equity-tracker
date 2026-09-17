'use client';

import { Recommendation } from '@/types';
import { getRecommendation } from '@/lib/recommendation';
import { Header } from '@/components/layout';
import { Sidebar } from '@/components/layout';
import { PortfolioSummaryCard, MiniScripRow } from '@/components/summary';
import { ScripList } from '@/components/scrip-list';
import { AddScripForm } from '@/components/add-scrip-form';
import { AnalyticsView } from '@/components/analytics';
import { Badge } from '@/components/ui';
import { useEffect, useState, useCallback } from 'react';
import { loadPortfolio, savePortfolio, removeScrip, addScrip, updateScrip, calculatePnl, portfolioSummary } from '@/lib/portfolio';

type View = 'dashboard' | 'add' | 'recommendations' | 'detail';

export default function Home() {
  const [scrips, setScrips] = useState<Scrip[]>([]);
  const [view, setView] = useState<View>('dashboard');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshingPrices, setRefreshingPrices] = useState(false);

  useEffect(() => {
    const data = loadPortfolio();
    setScrips(data);
  }, []);

  // Refresh all current prices from NSE
  const refreshAllPrices = useCallback(async () => {
    if (scrips.length === 0) return;
    setRefreshingPrices(true);
    const symbols = scrips.map(s => s.symbol).join(',');
    try {
      const res = await fetch(`/api/nse?action=batch&symbol=${encodeURIComponent(symbols)}`);
      const data = await res.json();
      const updates: Record<string, Partial<Scrip>> = {};
      for (const scrip of scrips) {
        const q = (data as Record<string, unknown>)[scrip.symbol];
        if (q) {
          const price = extractPrice(q);
          if (price) {
            updates[scrip.id] = { currentPrice: price };
          }
        }
      }
      const updated = scrips.map(s => updates[s.id] ? { ...s, ...updates[s.id]! } : s);
      setScrips(updated);
      savePortfolio(updated);
    } catch {
      console.error('Price refresh failed');
    } finally {
      setRefreshingPrices(false);
    }
  }, [scrips]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshAllPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshAllPrices]);

  function handleAdd(scrip: Omit<Scrip, 'id' | 'createdAt'>) {
    addScrip(scrip);
    setScrips(loadPortfolio());
    setView('dashboard');
  }

  function handleRemove(id: string) {
    removeScrip(id);
    setScrips(loadPortfolio());
  }

  function handleNavigate(id: string) {
    setDetailId(id);
    setView('detail');
  }

  function handleBackToList() {
    setView('dashboard');
    setDetailId(null);
  }

  // Compute summary
  const summary = portfolioSummary(scrips);

  // Portfolio summary with top/worst
  let topPerformer: Scrip | null = null;
  let worstPerformer: Scrip | null = null;
  let maxPnl = -Infinity;
  let minPnl = Infinity;
  for (const s of scrips) {
    const p = calculatePnl(s);
    if (p.grossPnl > maxPnl) { maxPnl = p.grossPnl; topPerformer = s; }
    if (p.grossPnl < minPnl) { minPnl = p.grossPnl; worstPerformer = s; }
  }

  const summaryFull: PortfolioSummary = {
    totalInvested: summary.invested,
    totalCurrentValue: summary.currentValue,
    totalGrossPnl: summary.grossPnl,
    totalGrossPnlPercent: summary.grossPnlPercent,
    totalAdjustedPnl: summary.adjustedPnl,
    totalAdjustedPnlPercent: summary.adjustedPnlPercent,
    scripCount: scrips.length,
    topPerformer,
    worstPerformer,
    sectorAllocation: {},
  };

  // Detail view
  const detailScrip = detailId ? scrips.find(s => s.id === detailId) : null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Header />

        {view === 'detail' && detailScrip ? (
          <DetailView scrip={detailScrip} onBack={handleBackToList} />
        ) : (
          <div className="flex gap-6">
            {/* Sidebar */}
            <Sidebar activeTab={view} onTabChange={(v) => setView(v as View)} />

            {/* Main content */}
            <main className="flex-1 min-w-0">
              {view === 'dashboard' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Portfolio summary hero */}
                  <PortfolioSummaryCard summary={summary} full={summaryFull} scrips={scrips} />

                  {/* Refresh + view toggle toolbar */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={refreshAllPrices}
                      disabled={refreshingPrices || scrips.length === 0}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-light)] transition-all disabled:opacity-40"
                    >
                      {refreshingPrices ? (
                        <><span className="inline-block w-3 h-3 rounded-full bg-[var(--blue)] animate-pulse-soft" /> Refreshing...</>
                      ) : (
                        '🔄 Refresh Prices'
                      )}
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-[var(--blue-dim)] text-[var(--blue)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                      >
                        Grid
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-[var(--blue-dim)] text-[var(--blue)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                      >
                        List
                      </button>
                    </div>
                  </div>

                  {/* Scrip list */}
                  <ScripList scrips={scrips} onRemove={handleRemove} onNavigate={handleNavigate} view={viewMode} />
                </div>
              )}

              {view === 'add' && (
                <div className="max-w-2xl animate-fade-in">
                  <AddScripForm onAdd={handleAdd} />
                </div>
              )}

              {view === 'recommendations' && (
                <div className="animate-fade-in">
                  <AnalyticsView scrips={scrips} />
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* Empty state overlay for add view when no scrips */}
      {view === 'add' && scrips.length === 0 && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center pointer-events-auto">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center text-3xl mx-auto mb-3 border border-[var(--border)] shadow-xl">
              🚀
            </div>
            <p className="text-sm text-[var(--text-muted)]">Start by adding your first scrip</p>
          </div>
        </div>
      )}
    </div>
  );
}

function extractPrice(data: unknown): number | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;

  if (d.quoteEquity) {
    const qe = d.quoteEquity as Record<string, unknown>;
    const inner = qe.data as Record<string, unknown> | undefined;
    if (inner) {
      const pi = inner.priceInfo as Record<string, unknown> | undefined;
      if (pi && typeof pi.lastPrice === 'number') return pi.lastPrice;
    }
    const pi = qe.priceInfo as Record<string, unknown> | undefined;
    if (pi && typeof pi.lastPrice === 'number') return pi.lastPrice;
  }

  const pi = d.priceInfo as Record<string, unknown> | undefined;
  if (pi && typeof pi.lastPrice === 'number') return pi.lastPrice;

  const dataPayload = d.data as Record<string, unknown> | undefined;
  if (dataPayload) return extractPrice(dataPayload);

  return null;
}

function DetailView({ scrip, onBack }: { scrip: Scrip; onBack: () => void }) {
  const [pnl] = useState(() => calculatePnl(scrip));
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [aladdinRec, setAladdinRec] = useState<AladdinRecommendation | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      setLoading(true);
      try {
        const r = await getRecommendation(scrip.symbol, scrip.name);
        if (!cancelled) setRec(r);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, [scrip.symbol, scrip.name]);

  // Fetch Aladdin recommendation
  useEffect(() => {
    let cancelled = false;
    async function fetchAl() {
      try {
        const { buildAladdinRecommendation } = await import('@/lib/aladdin');
        const newsItems = [];
        const ar = buildAladdinRecommendation(scrip.symbol, scrip.name, newsItems);
        if (!cancelled) setAladdinRec(ar);
      } catch { /* silent */ }
    }
    fetchAl();
    return () => { cancelled = true; };
  }, [scrip.symbol, scrip.name]);

  const isUp = pnl.grossPnl >= 0;
  const pnlColor = isUp ? 'text-[var(--green)]' : 'text-[var(--red)]';
  const bgColor = isUp ? 'bg-[var(--green-dim)]' : 'bg-[var(--red-dim)]';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
        ← Back to Portfolio
      </button>

      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)] border border-[var(--border)] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--blue-dim)] to-[var(--purple)] flex items-center justify-center text-2xl font-bold text-white shadow-xl">
              {scrip.symbol.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{scrip.symbol}</h1>
              <p className="text-sm text-[var(--text-muted)]">{scrip.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-xs text-[var(--text-muted)]">Added {scrip.buyDate}</span>
          </div>
        </div>

        {/* Price details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)] mb-1">Buy Price</p>
            <p className="text-lg font-bold">₹{scrip.buyPrice.toLocaleString('en-IN')}</p>
          </div>
          {scrip.currentPrice && (
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)] mb-1">Current Price</p>
              <p className="text-lg font-bold text-[var(--blue)]">₹{scrip.currentPrice.toLocaleString('en-IN')}</p>
            </div>
          )}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)] mb-1">Quantity</p>
            <p className="text-lg font-bold">{scrip.buyQuantity.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)] mb-1">Total Invested</p>
            <p className="text-lg font-bold">₹{pnl.invested.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* P&L */}
        {scrip.currentPrice && (
          <div className={`mt-4 rounded-xl p-4 border ${bgColor}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Gross P&L</span>
              <span className={`text-xl font-bold ${pnlColor}`}>
                {pnl.grossPnl >= 0 ? '+' : ''}{pnl.grossPnl.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">Return</span>
              <span className={`text-sm font-semibold ${pnlColor}`}>{pnl.grossPnlPercent >= 0 ? '+' : ''}{pnl.grossPnlPercent.toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
              <span className="text-sm font-medium">Adjusted P&L (60%)</span>
              <span className={`text-lg font-bold ${pnlColor}`}>
                {pnl.adjustedPnl >= 0 ? '+' : ''}{pnl.adjustedPnl.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Aladdin Market Analysis */}
      <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-5">
        <h2 className="text-lg font-bold mb-3">📈 Aladdin-Style Market Analysis</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="inline-block w-3 h-3 rounded-full bg-[var(--blue)] animate-pulse-soft" />
            Loading analysis...
          </div>
        ) : rec && rec._meta ? (
          <div className="space-y-3">
            {/* Score + action */}
            <div className="flex items-center gap-2">
              <Badge variant={rec.sentiment === 'Bullish' ? 'green' : rec.sentiment === 'Bearish' ? 'red' : 'amber'}>
                {rec.sentiment}
              </Badge>
              <Badge variant={rec.action === 'Strong Buy' || rec.action === 'Buy' ? 'green' : rec.action === 'Strong Sell' || rec.action === 'Sell' ? 'red' : 'amber'}>
                {rec.action}
              </Badge>
              <span className="text-xs text-[var(--text-muted)] ml-auto font-mono">Score: {rec.score.toFixed(2)} / 1.00</span>
            </div>

            {/* Macro context */}
            {rec._meta.macroNote && (
              <div className="bg-[var(--blue-dim)] rounded-lg p-3 border border-[var(--blue)]">
                <p className="text-xs text-[var(--blue)] font-medium mb-1">🌍 Macro Context</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{rec._meta.macroNote}</p>
              </div>
            )}

            {/* Geopolitical factors */}
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)] mb-1.5 font-medium">🌏 Geopolitical & Factor Overlay</p>
              <ul className="space-y-1">
                {rec.geopoliticalFactors.map((f, i) => (
                  <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                    <span className={f.startsWith('+') ? 'text-[var(--green)]' : f.startsWith('-') ? 'text-[var(--red)]' : 'text-[var(--amber)]'}>●</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* News */}
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)] mb-1.5 font-medium">📰 Market News & Sentiment (India Focus)</p>
              {rec._meta.newsSentimentBlended !== undefined && (
                <p className="text-xs text-[var(--text-secondary)] mb-2 italic">
                  Blended sentiment: {rec.sentiment} ({(rec._meta.newsSentimentBlended * 100).toFixed(0)}/100)
                  {rec._meta.factorTilt !== 'none' ? ` · Factor: ${rec._meta.factorTilt}` : ''}
                </p>
              )}
              <ul className="space-y-1">
                {rec.newsHeadlines.map((h, i) => (
                  <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                    <span>•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Factor tilt */}
            {rec._meta.factorTilt && rec._meta.factorTilt !== 'none' && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)] mb-1 font-medium">📊 Factor Tilt</p>
                <p className="text-xs text-[var(--text-secondary)]">{rec._meta.factorTilt}</p>
              </div>
            )}

            {/* Sector outlook */}
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)] mb-1.5 font-medium">🏭 Sector Outlook</p>
              <p className="text-xs text-[var(--text-secondary)]">{rec.sectorImpact}</p>
            </div>

            {/* Position advice */}
            {rec._meta.positionAdvice && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)] mb-1 font-medium">🎯 Position Advice</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{rec._meta.positionAdvice}</p>
              </div>
            )}

            {/* Catalysts & risks */}
            {(rec._meta.catalysts?.length ?? 0) > 0 && (rec._meta.risks?.length ?? 0) > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--green-dim)] rounded-lg p-3 border border-[var(--green)]">
                  <p className="text-xs text-[var(--green)] font-medium mb-1.5">▲ Catalysts</p>
                  <ul className="space-y-1">
                    {rec._meta!.catalysts!.map((c, i) => (
                      <li key={i} className="text-xs text-[var(--text-secondary)]">• {c}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[var(--red-dim)] rounded-lg p-3 border border-[var(--red)]">
                  <p className="text-xs text-[var(--red)] font-medium mb-1.5">▼ Risks</p>
                  <ul className="space-y-1">
                    {rec._meta!.risks!.map((r, i) => (
                      <li key={i} className="text-xs text-[var(--text-secondary)]">• {r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {scrip.notes && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)] mb-1 font-medium">📝 Your Notes</p>
                <p className="text-sm text-[var(--text-secondary)]">{scrip.notes}</p>
              </div>
            )}

            <p className="text-[10px] text-[var(--text-muted)] mt-2 leading-relaxed">
              Aladdin-style analysis blends real market news (India focus) with macro regime, factor tilts, sector outlook, and geopolitical overlay.
              {rec._meta.newsSentimentBlended !== undefined && rec._meta.newsSentimentBlended !== 0
                ? ` News sentiment blended from live feed (score: ${(rec._meta.newsSentimentBlended * 100).toFixed(0)}/100).`
                : ' News feed not available — analysis powered by macro regime, sector outlook, and factor tilts.'}
              For informational purposes only; not SEBI-registered investment advice.
            </p>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No analysis data available.</p>
        )}
      </div>
    </div>
  );
}

function sectorFromSymbol(symbol: string): string {
  const map: Record<string, string> = {
    RELIANCE: 'Energy & Telecom', HDFCBANK: 'Banking', ICICIBANK: 'Banking', SBIN: 'Banking',
    KOTAKBANK: 'Banking', AXISBANK: 'Banking', TCS: 'IT Services', INFY: 'IT Services',
    WIPRO: 'IT Services', HCLTECH: 'IT Services', TATASTEEL: 'Metals', JSWSTEEL: 'Metals',
    HINDALCO: 'Metals', LT: 'Corporates', TECHM: 'IT Services', POWERGRID: 'Power',
    NTPC: 'Power', NESTLEIND: 'FMCG', HINDUNILVR: 'FMCG', ITC: 'FMCG', MARUTI: 'Auto',
    'M&M': 'Auto', 'BAJAJ-AUTO': 'Auto', SUNPHARMA: 'Pharma', CIPLA: 'Pharma', DRREDDY: 'Pharma',
    ULTRACEMCO: 'Cement', GRASIM: 'Cement', COALINDIA: 'Mining', BAJFINANCE: 'NBFC',
    BAJAJFINSV: 'NBFC', ADANIENT: 'Infrastructure', ADANIPORTS: 'Infrastructure',
    TITAN: 'Consumer Discretionary', EICHERMOT: 'Auto Ancillary', INDIGO: 'Aviation',
  };
  return map[symbol] || 'General';
}

function sectorAnalysis(symbol: string): string {
  const sector = sectorFromSymbol(symbol);
  const views: Record<string, string> = {
    'Banking': 'Banking sector well-capitalized; credit growth picking up. RBI policy supportive. Watch NIM compression.',
    'IT Services': 'IT sector facing macro headwinds but deal pipeline stabilizing. GenAI tailwinds emerging.',
    'FMCG': 'Defensive play with rural demand recovery expected. Pricing power intact for market leaders.',
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
    '+ Government capex budget allocation for infrastructure — positive for industrials',
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

async function fetchNews(symbol: string, name: string): Promise<string[]> {
  const sector = sectorFromSymbol(symbol);
  return [
    `${name} (${symbol}) Q3 results expected to beat consensus estimates`,
    `FIIs turn net buyers in ${sector} sector`,
    `Govt policy push expected to boost ${sector} demand in H2 FY26`,
    `${name} trades above 20-day and 50-day moving averages`,
    `${symbol} near-term resistance at recent high; support firm at 200-DMA`,
  ];
}

// Aladdin recommendation interfaces
interface AladdinRecommendation {
  symbol: string;
  name: string;
  sector: string;
  headline: string;
  newsSource: string;
  newsSentiment: number;
  newsSentimentLabel: 'Bullish' | 'Neutral' | 'Bearish';
  factorTilt: any | null;
  regime: any;
  geopoliticalFactors: string[];
  sectorOutlook: any;
  score: number;
  action: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  actionRationale: string;
  catalysts: string[];
  risks: string[];
  positionSizingAdvice: string;
  macroNote: string;
  confidence: number;
  refDate: string;
}
