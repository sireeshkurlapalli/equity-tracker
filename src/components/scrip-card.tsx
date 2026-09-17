'use client';

import { Scrip, Pnl, Recommendation } from '@/types';
import { getRecommendation } from '@/lib/recommendation';
import { Badge, Button } from './ui';
import { Card } from './ui';
import { AladdinRecommendation } from '@/lib/aladdin';
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
  const [aladdinRec, setAladdinRec] = useState<AladdinRecommendation | null>(null);
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
        const [r, al] = await Promise.all([
          getRecommendation(scrip.symbol, scrip.name),
          (await import('@/lib/aladdin').then(m => m.buildAladdinRecommendation(scrip.symbol, scrip.name, []))),
        ]);
        if (!cancelled) { setRec(r); setAladdinRec(al); }
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

      {/* Expanded: Aladdin-style analysis */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-[var(--border)]">
          {loadingRec ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] py-2">
              <span className="inline-block w-3 h-3 rounded-full bg-[var(--blue)] animate-pulse-soft" />
              Loading Aladdin-style analysis...
            </div>
          ) : aladdinRec ? (
            <>
              {/* Score + action */}
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={aladdinRec.newsSentimentLabel === 'Bullish' ? 'green' : aladdinRec.newsSentimentLabel === 'Bearish' ? 'red' : 'amber'}>
                  News: {aladdinRec.newsSentimentLabel}
                </Badge>
                <Badge variant={aladdinRec.action === 'Strong Buy' || aladdinRec.action === 'Buy' ? 'green' : aladdinRec.action === 'Strong Sell' || aladdinRec.action === 'Sell' ? 'red' : 'amber'}>
                  {aladdinRec.action}
                </Badge>
                <span className="text-xs text-[var(--text-muted)] ml-auto font-mono">Score: {aladdinRec.score.toFixed(2)} / 1.00</span>
                <span className="text-xs text-[var(--text-muted)]">Confidence: {(aladdinRec.confidence * 100).toFixed(0)}%</span>
              </div>

              {/* Macro regime bar */}
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)] mb-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-[var(--text-muted)] font-medium">🌍 Macro Regime</p>
                  <Badge variant={aladdinRec.regime.overallRiskAppetite === 'Risk-On' ? 'green' : aladdinRec.regime.overallRiskAppetite === 'Risk-Off' ? 'red' : 'amber'}>
                    {aladdinRec.regime.phase} · {aladdinRec.regime.overallRiskAppetite}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2">{aladdinRec.regime.gdpGrowth}</p>
                <div className="flex flex-wrap gap-1.5">
                  {aladdinRec.regime.keyThemes.slice(0, 4).map((t, i) => (
                    <span key={i} className="text-[10px] bg-[var(--bg-card)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Confidence bar */}
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)] mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-[var(--text-muted)] font-medium">📊 Model Confidence</p>
                  <span className="text-xs font-mono text-[var(--text-muted)]">{(aladdinRec.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-card)] overflow-hidden border border-[var(--border)]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[var(--amber)] via-[var(--blue)] to-[var(--green)] transition-all" style={{ width: `${aladdinRec.confidence * 100}%` }} />
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Blend of news sentiment, factor tilt, sector outlook, and geopolitical overlay</p>
              </div>

              {/* Geopolitical overlay */}
              {aladdinRec.geopoliticalFactors.length > 0 && (
                <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)] mb-2">
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1.5">🌏 Geopolitical & Factor Overlay</p>
                  <div className="space-y-1.5">
                    {aladdinRec.geopoliticalFactors.map((g, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className={g.direction === '+' ? 'text-[var(--green)] shrink-0' : g.direction === '-' ? 'text-[var(--red)] shrink-0' : 'text-[var(--amber)] shrink-0'}>
                          {g.direction}
                        </span>
                        <div>
                          <p className="text-xs text-[var(--text-secondary)]">
                            <span className="font-medium text-[var(--text-primary)]">{g.region}</span> · {g.theme}
                            <span className="text-[var(--text-muted)] ml-1">({g.impact}, {g.urgency})</span>
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)]">{g.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sector outlook */}
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)] mb-2">
                <p className="text-xs text-[var(--text-muted)] font-medium mb-1.5">🏭 Sector Outlook — {aladdinRec.sector}</p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="text-center">
                    <p className="text-[10px] text-[var(--text-muted)]">30 Days</p>
                    <p className={`text-xs font-semibold ${
                      aladdinRec.sectorOutlook.outlook30d === 'Positive' ? 'text-[var(--green)]' :
                      aladdinRec.sectorOutlook.outlook30d === 'Negative' ? 'text-[var(--red)]' : 'text-[var(--amber)]'
                    }`}>{aladdinRec.sectorOutlook.outlook30d}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[var(--text-muted)]">90 Days</p>
                    <p className={`text-xs font-semibold ${
                      aladdinRec.sectorOutlook.outlook90d === 'Positive' ? 'text-[var(--green)]' :
                      aladdinRec.sectorOutlook.outlook90d === 'Negative' ? 'text-[var(--red)]' : 'text-[var(--amber)]'
                    }`}>{aladdinRec.sectorOutlook.outlook90d}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[var(--text-muted)]">Long Term</p>
                    <p className={`text-xs font-semibold ${
                      aladdinRec.sectorOutlook.outlookLong === 'Positive' ? 'text-[var(--green)]' :
                      aladdinRec.sectorOutlook.outlookLong === 'Negative' ? 'text-[var(--red)]' : 'text-[var(--amber)]'
                    }`}>{aladdinRec.sectorOutlook.outlookLong}</p>
                  </div>
                </div>
              </div>

              {/* News feed */}
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)] mb-2">
                <p className="text-xs text-[var(--text-muted)] font-medium mb-1.5">📰 Market News & Sentiment</p>
                <p className="text-xs text-[var(--text-secondary)] mb-2 italic">
                  Blended news sentiment: {aladdinRec.newsSentimentLabel} ({(aladdinRec.newsSentiment * 100).toFixed(0)}/100)
                  {aladdinRec.newsSource !== 'EquityPulse' ? ` · Source: ${aladdinRec.newsSource}` : ' · Curated Aladdin analysis'}
                </p>
                <ul className="space-y-1">
                  {aladdinRec.catalysts.slice(0, 3).map((c, i) => (
                    <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                      <span className="text-[var(--blue)] shrink-0">▸</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Factor tilt */}
              {aladdinRec.factorTilt && (
                <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)] mb-2">
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1.5">📊 Factor Tilt — {aladdinRec.factorTilt.factor}</p>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={aladdinRec.factorTilt.tilt === 'Overweight' ? 'green' : aladdinRec.factorTilt.tilt === 'Underweight' ? 'red' : 'amber'}>
                      {aladdinRec.factorTilt.tilt}
                    </Badge>
                    <span className="text-xs text-[var(--text-secondary)]">{aladdinRec.factorTilt.horizon} · Confidence: {(aladdinRec.factorTilt.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{aladdinRec.factorTilt.rationale}</p>
                </div>
              )}

              {/* Position advice */}
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)] mb-2">
                <p className="text-xs text-[var(--text-muted)] font-medium mb-1.5">🎯 Position Sizing Advice</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{aladdinRec.positionSizingAdvice}</p>
              </div>

              {/* Action rationale */}
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)] mb-2">
                <p className="text-xs text-[var(--text-muted)] font-medium mb-1">📝 Why {aladdinRec.action}?</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{aladdinRec.actionRationale}</p>
              </div>

              {/* Risks */}
              {aladdinRec.risks.length > 0 && (
                <div className="bg-[var(--red-dim)] rounded-lg p-3 border border-[var(--red)]">
                  <p className="text-xs text-[var(--red)] font-medium mb-1.5">▼ Key Risks</p>
                  <ul className="space-y-1">
                    {aladdinRec.risks.slice(0, 4).map((r, i) => (
                      <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                        <span className="text-[var(--red)] shrink-0">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-[10px] text-[var(--text-muted)] mt-2 leading-relaxed">
                Aladdin-style analysis blends market news (India focus) with macro regime, factor tilts, sector outlook, and geopolitical overlay.
                For informational purposes only; not SEBI-registered investment advice.
              </p>
            </>
          ) : (
            <p className="text-sm text-[var(--text-muted)] py-2">No analysis data available.</p>
          )}
        </div>
      )}
    </div>
  );
}
