'use client';

import { Pnl, PortfolioSummary } from '@/types';
import { Badge } from './ui';

interface Props {
  summary: Pnl;
  full: PortfolioSummary;
  scrips: { id: string; symbol: string; name: string; currentPrice: number | null; buyPrice: number; buyQuantity: number }[];
}

export function PortfolioSummaryCard({ summary, full, scrips }: Props) {
  const pnlClass = summary.grossPnl >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]';
  const bgClass = summary.grossPnl >= 0 ? 'bg-[var(--green-dim)]' : 'bg-[var(--red-dim)]';
  const pnlAdjClass = summary.adjustedPnl >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]';

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)] border border-[var(--border)] p-5 animate-fade-in">
      {/* Hero numbers */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] mb-1">Total Invested</p>
          <p className="text-xl font-bold tracking-tight">₹{(summary.invested / 100000).toFixed(2)} Cr</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {full.scripCount} {full.scripCount === 1 ? 'scrip' : 'scrips'} in portfolio
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] mb-1">Current Value</p>
          <p className="text-xl font-bold tracking-tight text-[var(--blue)]">₹{(summary.currentValue / 100000).toFixed(2)} Cr</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {((summary.currentValue / summary.invested - 1) * 100).toFixed(2)}% total return
          </p>
        </div>
      </div>

      {/* P&L bar */}
      <div className={`rounded-xl p-4 border ${bgClass} mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Gross P&L</span>
          <span className={`text-lg font-bold ${pnlClass}`}>
            {summary.grossPnl >= 0 ? '+' : ''}{summary.grossPnl.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">Return on Investment</span>
          <span className={`text-sm font-semibold ${pnlClass}`}>
            {summary.grossPnlPercent >= 0 ? '+' : ''}{summary.grossPnlPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* 60% Adjusted P&L — expert analyst convention */}
      <div className="rounded-xl p-4 border border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Adjusted P&L (60% Haircut)</p>
            <p className="text-xs text-[var(--text-muted)]">Conservative risk-adjusted view per analyst convention</p>
          </div>
          <span className={`text-lg font-bold ${pnlAdjClass}`}>
            {summary.adjustedPnl >= 0 ? '+' : ''}{summary.adjustedPnl.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--text-secondary)]">Adjusted ROI</span>
          <span className={`text-sm font-semibold ${pnlAdjClass}`}>
            {summary.adjustedPnlPercent >= 0 ? '+' : ''}{summary.adjustedPnlPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Top / Worst performer */}
      {full.topPerformer && full.worstPerformer && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-[var(--bg-secondary)] rounded-lg px-3 py-2 border border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)]">🏆 Top Performer</p>
            <p className="text-sm font-semibold text-[var(--green)]">{full.topPerformer.symbol}</p>
            <p className="text-xs text-[var(--text-secondary)]">
              {(full.topPerformer.currentPrice! * full.topPerformer.buyQuantity - full.topPerformer.buyPrice * full.topPerformer.buyQuantity).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg px-3 py-2 border border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)]">⚠ Worst Performer</p>
            <p className="text-sm font-semibold text-[var(--red)]">{full.worstPerformer.symbol}</p>
            <p className="text-xs text-[var(--text-secondary)]">
              {(full.worstPerformer.currentPrice! * full.worstPerformer.buyQuantity - full.worstPerformer.buyPrice * full.worstPerformer.buyQuantity).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function MiniScripRow({
  symbol,
  name,
  currentPrice,
  buyPrice,
  buyQuantity,
  pnl,
  onClick,
}: {
  symbol: string;
  name: string;
  currentPrice: number | null;
  buyPrice: number;
  buyQuantity: number;
  pnl: Pnl;
  onClick: () => void;
}) {
  const isUp = pnl.grossPnl >= 0;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] hover:bg-[var(--bg-card)] hover:border-[var(--border-light)] transition-all text-left"
    >
      <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] flex items-center justify-center text-sm font-bold text-[var(--text-secondary)] shrink-0">
        {symbol.slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{symbol}</p>
        <p className="text-xs text-[var(--text-muted)] truncate">{name}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium">{currentPrice ? `₹${currentPrice.toLocaleString('en-IN')}` : '—'}</p>
        <p className={`text-xs font-medium ${isUp ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
          {pnl.grossPnlPercent >= 0 ? '+' : ''}{pnl.grossPnlPercent.toFixed(2)}%
        </p>
      </div>
    </button>
  );
}
