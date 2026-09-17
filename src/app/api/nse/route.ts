import { NextRequest, NextResponse } from 'next/server';

const NSE_BASE = 'https://www.nseindia.com/api';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 15 * 60 * 1000;

async function nseFetch(path: string, retries = 3): Promise<unknown> {
  const url = `${NSE_BASE}${path}`;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
          'Referer': 'https://www.nseindia.com/',
        },
      });
      if (res.ok) return await res.json();
      if (res.status === 401 || res.status === 403) {
        await new Promise(r => setTimeout(r, 2000 * (i + 1)));
        continue;
      }
      return null;
    } catch {
      if (i === retries - 1) return null;
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
  return null;
}

function getC(key: string): unknown | null {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() - e.ts > CACHE_TTL) { cache.delete(key); return null; }
  return e.data;
}

function setC(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = (searchParams.get('action') || 'quote') as string;
  const symbolRaw = (searchParams.get('symbol') || '') as string;
  const symbol = symbolRaw.toUpperCase();
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 });

  const cacheKey = `${action}:${symbol}`;
  const cached = getC(cacheKey);
  if (cached) return NextResponse.json(cached);

  let result: unknown = null;
  if (action === 'quote') {
    result = await nseFetch(`/quote-equity?symbol=${symbol}`);
    if (!result) result = await nseFetch(`/get-quotes/equity?symbol=${symbol}`);
    if (!result) result = await nseFetch(`/equity?symbol=${symbol}`);
  } else if (action === 'batch') {
    const symbols = symbol.split(',');
    const quotes: Record<string, unknown> = {};
    for (const s of symbols) {
      const q = await nseFetch(`/quote-equity?symbol=${s}`);
      if (q) quotes[s] = q;
    }
    result = quotes;
  }

  if (result) setC(cacheKey, result);
  return NextResponse.json(result || { error: 'could not fetch', symbol });
}
