'use client';

import { Scrip } from '@/types';
import { ScripCard } from './scrip-card';
import { useState } from 'react';

interface Props {
  scrips: Scrip[];
  onRemove: (id: string) => void;
  onNavigate: (id: string) => void;
  view: 'grid' | 'list';
}

export function ScripList({ scrips, onRemove, onNavigate, view }: Props) {
  const [localView, setLocalView] = useState<'grid' | 'list'>(view);

  if (scrips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center text-3xl mb-4 border border-[var(--border)]">
          📭
        </div>
        <h3 className="text-lg font-semibold mb-1">No scrips yet</h3>
        <p className="text-sm text-[var(--text-muted)] max-w-xs">
          Add your first equity scrip to start tracking your portfolio with live NSE prices and analyst recommendations.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* View toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--text-secondary)]">
          {scrips.length} {scrips.length === 1 ? 'scrip' : 'scrips'} in portfolio
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => setLocalView('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              localView === 'grid' ? 'bg-[var(--blue-dim)] text-[var(--blue)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setLocalView('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              localView === 'list' ? 'bg-[var(--blue-dim)] text-[var(--blue)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {localView === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scrips.map(scrip => (
            <ScripCard key={scrip.id} scrip={scrip} onRemove={onRemove} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {scrips.map(scrip => (
            <div key={scrip.id} className="p-0 overflow-hidden">
              <ScripCard scrip={scrip} onRemove={onRemove} onNavigate={onNavigate} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
