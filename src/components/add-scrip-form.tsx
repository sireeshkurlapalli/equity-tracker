'use client';

import { Scrip } from '@/types';
import { Button, Input, NumberInput } from './ui';
import { useState, useRef } from 'react';

interface Props {
  onAdd: (scrip: Omit<Scrip, 'id' | 'createdAt'>) => void;
}

export function AddScripForm({ onAdd }: Props) {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [buyPrice, setBuyPrice] = useState(0);
  const [buyQuantity, setBuyQuantity] = useState(0);
  const [notes, setNotes] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function lookupPrice() {
    if (!symbol.trim()) {
      setPriceError('Enter a scrip symbol first');
      return;
    }
    setLoadingPrice(true);
    setPriceError('');
    try {
      const res = await fetch(`/api/nse?symbol=${encodeURIComponent(symbol.toUpperCase())}`);
      const data = await res.json();
      if (data.error || !data) {
        setPriceError('Could not fetch price. Check symbol or try again.');
        return;
      }
      // NSE response shape varies — try multiple paths
      const price = extractPrice(data);
      if (price) {
        setBuyPrice(price);
      } else {
        setPriceError('Price not found in NSE response. Symbol may be invalid.');
      }
    } catch {
      setPriceError('Network error fetching NSE data');
    } finally {
      setLoadingPrice(false);
    }
  }

  function extractPrice(data: unknown): number | null {
    if (!data || typeof data !== 'object') return null;
    const d = data as Record<string, unknown>;

    // Try quoteEquity response path
    if (d.quoteEquity) {
      const qe = d.quoteEquity as Record<string, unknown>;
      const priceInfo = qe.priceInfo as Record<string, unknown> | undefined;
      if (priceInfo && typeof priceInfo.lastPrice === 'number') return priceInfo.lastPrice;
      // Also try data path
      const inner = qe.data as Record<string, unknown> | undefined;
      if (inner) return extractPrice(inner);
    }

    // Try priceInfo directly
    const priceInfo = d.priceInfo as Record<string, unknown> | undefined;
    if (priceInfo && typeof priceInfo.lastPrice === 'number') return priceInfo.lastPrice;

    // Try data > priceInfo
    const dataPayload = d.data as Record<string, unknown> | undefined;
    if (dataPayload) return extractPrice(dataPayload);

    // Try response > data
    const response = d.response as Record<string, unknown> | undefined;
    if (response) return extractPrice(response);

    return null;
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result as string);
      setImageError('');
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol.trim()) return;
    const scrip: Omit<Scrip, 'id' | 'createdAt'> = {
      symbol: symbol.toUpperCase().trim(),
      name: name.trim() || symbol.toUpperCase().trim(),
      buyPrice,
      buyQuantity,
      currentPrice: buyPrice, // use latest as current initially
      buyDate: new Date().toISOString().slice(0, 10),
      notes: notes.trim() || undefined,
      imageData: imageData || undefined,
    };
    onAdd(scrip);
    setSymbol('');
    setName('');
    setBuyPrice(0);
    setBuyQuantity(0);
    setNotes('');
    setImageData(null);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-5 animate-fade-in">
      <h2 className="text-lg font-bold mb-4">➕ Add Scrip to Portfolio</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Scrip Symbol (NSE)"
          value={symbol}
          onChange={setSymbol}
          placeholder="e.g. RELIANCE, HDFCBANK"
          error={priceError || undefined}
        />
        <NumberInput
          label="Buy Price (₹)"
          value={buyPrice}
          onChange={setBuyPrice}
          placeholder="Auto-fetch from NSE or enter manually"
          suffix="₹"
          error={priceError || undefined}
        />
        <NumberInput
          label="Buy Quantity"
          value={buyQuantity}
          onChange={setBuyQuantity}
          placeholder="Number of shares"
          error={buyQuantity <= 0 ? 'Quantity must be > 0' : undefined}
        />
        <Input
          label="Scrip Name (optional)"
          value={name}
          onChange={setName}
          placeholder="Full name, e.g. Reliance Industries"
        />
      </div>

      {/* NSE Price Lookup */}
      <div className="mt-4 flex items-center gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={lookupPrice} disabled={loadingPrice || !symbol.trim()}>
          {loadingPrice ? (
            <><span className="inline-block w-3 h-3 rounded-full bg-[var(--blue)] animate-pulse-soft" /> Fetching from NSE...</>
          ) : (
            '🔄 Fetch Latest Price (NSE)'
          )}
        </Button>
        <span className="text-xs text-[var(--text-muted)]">
          Pulls live price from NSE India. Free, no API key needed.
        </span>
      </div>

      {/* Image Upload */}
      <div className="mt-4">
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Attach Image (optional)</label>
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-xs text-[var(--text-muted)] file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--bg-secondary)] file:text-[var(--text-secondary)] hover:file:bg-[var(--bg-card)]"
          />
          {imageData && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--border)]">
              <img src={imageData} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setImageData(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        {imageError && <p className="text-xs text-[var(--red)] mt-1">{imageError}</p>}
      </div>

      {/* Notes */}
      <div className="mt-4">
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any additional notes about this position..."
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)] transition-colors resize-none h-20"
        />
      </div>

      {/* Submit */}
      <div className="mt-5 flex items-center gap-3">
        <Button type="submit" variant="primary" size="lg" disabled={!symbol.trim() || buyQuantity <= 0}>
          Add to Portfolio
        </Button>
        <span className="text-xs text-[var(--text-muted)]">
          P&L will be tracked at 60% of actual (analyst-conservative convention)
        </span>
      </div>
    </form>
  );
}
