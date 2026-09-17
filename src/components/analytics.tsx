'use client';

import { Scrip } from '@/types';
import { getRecommendation } from '@/lib/recommendation';
import { Badge, Card } from './ui';
import { useEffect, useState } from 'react';

interface Props {
  scrips: Scrip[];
}

interface RecItem {
  scrip: Scrip;
  rec: { action: string; sentiment: string; score: number; sectorImpact: string; reasons: string[]; geopoliticalFactors: string[]; _meta?: { sector: string; positionAdvice: string; catalysts: string[]; risks: string[]; macroNote: string; factorTilt: string } } | null;
  loading: boolean;
}

export function AnalyticsView({ scrips }: Props) {
  const [items, setItems] = useState<RecItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const results: RecItem[] = [];
      for (const scrip of scrips) {
        if (!scrip.currentPrice) continue;
        try {
          const rec = await getRecommendation(scrip.symbol, scrip.name);
          if (!cancelled) results.push({ scrip, rec, loading: false });
        } catch {
          if (!cancelled) results.push({ scrip, rec: null, loading: false });
        }
      }
      if (!cancelled) setItems(results);
    }
    load();
    return () => { cancelled = true; };
  }, [scrips]);

  const sorted = [...items].sort((a, b) => (b.rec?.score ?? 0) - (a.rec?.score ?? 0));
  const total = items.length;
  const strongBuy = items.filter(i => i.rec?.action === 'Strong Buy').length;
  const buy = items.filter(i => i.rec?.action === 'Buy').length;
  const hold = items.filter(i => i.rec?.action === 'Hold').length;
  const sell = items.filter(i => i.rec?.action === 'Sell' || i.rec?.action === 'Strong Sell').length;
  const bullish = items.filter(i => i.rec?.sentiment === 'Bullish').length;
  const bearish = items.filter(i => i.rec?.sentiment === 'Bearish').length;
  const avgScore = items.length ? items.reduce((s, i) => s + (i.rec?.score ?? 0), 0) / items.length : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Score gauge */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Portfolio Intelligence (Aladdin-Style)</h2>
          <Badge variant={avgScore >= 0.15 ? 'green' : avgScore >= -0.15 ? 'amber' : 'red'}>
            Portfolio Score: {avgScore.toFixed(2)}
          </Badge>
        </div>

        {/* Regime summary */}
        <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)] mb-4">
          <p className="text-xs text-[var(--text-muted)] mb-1.5 font-medium">🌍 Macro Regime (Aladdin Model)</p>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--text-secondary)]">Mid-Cycle Expansion · Risk-On</span>
            <span className="text-xs text-[var(--text-muted)]">India FY26 GDP ~6.8-7.0%</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            FIIs selective; EM ex-China favored. India structural story intact. Crude range-bound $70-90/bbl. RBI cautious — rate cuts uncertain near-term. Constructive for domestics; cautious on export-sensitive & commodity-heavy names.
          </p>
        </div>

        {/* Gauge bar */}
        <div className="mb-4">
          <div className="h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden border border-[var(--border)]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                avgScore >= 0.3 ? 'bg-gradient-to-r from-[var(--green)] to-[var(--green)]' :
                avgScore >= 0 ? 'bg-gradient-to-r from-[var(--green)] to-[var(--blue)]' :
                avgScore >= -0.3 ? 'bg-gradient-to-r from-[var(--amber)] to-[var(--red)]' :
                'bg-gradient-to-r from-[var(--red)] to-[var(--red)]'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, ((avgScore + 1) / 2) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
            <span>Strong Sell (-1)</span>
            <span>Hold (0)</span>
            <span>Strong Buy (+1)</span>
          </div>
        </div>

        {/* Distribution */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center border border-[var(--border)]">
            <p className="text-2xl font-bold text-[var(--green)]">{strongBuy}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Strong Buy</p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center border border-[var(--border)]">
            <p className="text-2xl font-bold text-[var(--blue)]">{buy}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Buy</p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center border border-[var(--border)]">
            <p className="text-2xl font-bold text-[var(--amber)]">{hold}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Hold</p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center border border-[var(--border)]">
            <p className="text-2xl font-bold text-[var(--red)]">{sell}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Sell / Strong Sell</p>
          </div>
        </div>
      </Card>

      {/* Sentiment split */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-3">Sentiment Distribution (News + Factor Blend)</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-[var(--bg-secondary)] rounded-full h-2.5 overflow-hidden border border-[var(--border)] relative">
            <div className="h-full rounded-full bg-[var(--green)] transition-all" style={{ width: `${total ? (bullish / total) * 100 : 0}%` }} />
            <div className="h-full rounded-full bg-[var(--amber)] transition-all absolute" style={{ width: `${total ? (items.filter(i => i.rec?.sentiment === 'Neutral').length / total) * 100 : 0}%`, left: `${total ? (bullish / total) * 100 : 0}%` }} />
            <div className="h-full rounded-full bg-[var(--red)] transition-all absolute" style={{ width: `${total ? (bearish / total) * 100 : 0}%`, left: `${total ? ((bullish + items.filter(i => i.rec?.sentiment === 'Neutral').length) / total) * 100 : 0}%` }} />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-[var(--text-primary)] pointer-events-none">
              {total ? `${Math.round((bullish / total) * 100)}% Bullish` : ''}
            </div>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[var(--green)]" /> Bullish</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[var(--amber)]" /> Neutral</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[var(--red)]" /> Bearish</span>
          </div>
        </div>
      </Card>

      {/* Factor tilt summary */}
      {items.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-3">Factor Tilt by Sector (Portfolio Concentration)</h3>
          <div className="space-y-2">
            {Array.from(new Set(items.map(i => i.rec?._meta?.sector).filter(Boolean) as string[])).sort().map(sector => {
              const sectorItems = items.filter(i => i.rec?._meta?.sector === sector);
              const avg = sectorItems.length ? sectorItems.reduce((s, i) => s + (i.rec?.score ?? 0), 0) / sectorItems.length : 0;
              const count = sectorItems.length;
              return (
                <div key={sector} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-secondary)] w-28 truncate">{sector} ({count})</span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden border border-[var(--border)]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        avg >= 0.3 ? 'bg-[var(--green)]' :
                        avg >= 0 ? 'bg-[var(--blue)]' :
                        avg >= -0.3 ? 'bg-[var(--amber)]' :
                        'bg-[var(--red)]'
                      }`}
                      style={{ width: `${Math.max(2, Math.min(100, ((avg + 1) / 2) * 100))}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)] w-12 text-right">{avg.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3 italic">
            Factor tilt reflects blended score (news sentiment 40% + factor tilt 25% + sector outlook 25% + geopolitics 10%) for each scrip's sector.
            Higher = more constructive; lower = more cautious. Model confidence: {items.length ? Math.round(items.reduce((s,i) => s + (i.rec?.score !== undefined ? Math.min(0.9, 0.4 + Math.abs(i.rec.score) * 0.3), 0), 0) / items.length * 100) : 0}% avg.
          </p>
        </Card>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-3">Scrip-Level Aladdin Recommendations</h3>
        {sorted.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-[var(--text-muted)]">Add scrips with current prices to see Aladdin-style recommendations.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sorted.map(item => (
              <RecommendationCard key={item.scrip.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({ item }: { item: RecItem }) {
  const { scrip, rec, loading } = item;
  if (!rec) return null;

  const actionColors: Record<string, string> = {
    'Strong Buy': 'green',
    'Buy': 'blue',
    'Hold': 'amber',
    'Sell': 'red',
    'Strong Sell': 'red',
  };

  return (
    <Card hover className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--blue-dim)] to-[var(--purple)] flex items-center justify-center text-sm font-bold text-white shrink-0">
          {scrip.symbol.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold">{scrip.symbol}</span>
            <Badge variant={actionColors[rec.action] as 'default' | 'green' | 'red' | 'blue' | 'amber' | 'purple' | undefined}>{rec.action}</Badge>
            <span className="text-xs text-[var(--text-muted)] ml-auto">Score: {rec.score.toFixed(2)}</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-2">{scrip.name}</p>

          {/* Key factors */}
          <div className="flex flex-wrap gap-2 mb-2">
            {rec.sentiment !== 'Neutral' && (
              <Badge variant={rec.sentiment === 'Bullish' ? 'green' : 'red'}>
                {rec.sentiment} Sentiment
              </Badge>
            )}
            {rec._meta?.factorTilt && rec._meta.factorTilt !== 'none' && (
              <Badge variant="default">Factor: {rec._meta.factorTilt}</Badge>
            )}
          </div>

          {/* Position advice */}
          {rec._meta?.positionAdvice && (
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)] mb-2">
              <p className="text-xs text-[var(--text-muted)] font-medium mb-1">🎯 Position Advice</p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{rec._meta.positionAdvice}</p>
            </div>
          )}

          {/* Catalysts & risks */}
          {(rec._meta?.catalysts?.length ?? 0) > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-[var(--green-dim)] rounded-lg p-2.5 border border-[var(--green)]">
                <p className="text-xs text-[var(--green)] font-medium mb-1">▲ Catalysts</p>
                <ul className="space-y-0.5">
                  {rec._meta!.catalysts!.slice(0, 3).map((c, i) => (
                    <li key={i} className="text-xs text-[var(--text-secondary)]">• {c}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-[var(--red-dim)] rounded-lg p-2.5 border border-[var(--red)]">
                <p className="text-xs text-[var(--red)] font-medium mb-1">▼ Risks</p>
                <ul className="space-y-0.5">
                  {rec._meta!.risks!.slice(0, 3).map((r, i) => (
                    <li key={i} className="text-xs text-[var(--text-secondary)]">• {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Macro note */}
          {rec._meta?.macroNote && (
            <div className="bg-[var(--blue-dim)] rounded-lg p-2.5 border border-[var(--blue)] mb-2">
              <p className="text-xs text-[var(--blue)] font-medium mb-1">🌍 Macro Context</p>
              <p className="text-xs text-[var(--text-secondary)]">{rec._meta.macroNote}</p>
            </div>
          )}

          {/* Top reasons (expandable) */}
          <details className="group">
            <summary className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)] transition-colors list-none flex items-center gap-1">
              <span className="group-open:rotate-90 transition-transform duration-150">▶</span>
              View full analysis ({rec.reasons.length} factors)
            </summary>
            <div className="mt-2 space-y-1.5 border-t border-[var(--border)] pt-2">
              {rec.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={r.startsWith('News:') ? 'text-[var(--blue)]' : r.startsWith('Sector:') ? 'text-[var(--purple)]' : r.startsWith('Geo:') ? (r.includes('+') ? 'text-[var(--green)]' : 'text-[var(--red)]') : 'text-[var(--text-secondary)]'}>
                    ●
                  </span>
                  <span className="text-[var(--text-secondary)]">{r}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </Card>
  );
}
