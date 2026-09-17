export interface Scrip {
  id: string;
  symbol: string;
  name: string;
  buyPrice: number;
  buyQuantity: number;
  currentPrice: number | null;
  buyDate: string;
  notes?: string;
  imageData?: string;
  createdAt: string;
}

export interface Pnl {
  invested: number;
  currentValue: number;
  grossPnl: number;
  grossPnlPercent: number;
  adjustedPnl: number;
  adjustedPnlPercent: number;
}

export interface Recommendation {
  score: number;
  action: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  reasons: string[];
  newsHeadlines: string[];
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  sectorImpact: string;
  geopoliticalFactors: string[];
}

export interface PortfolioSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalGrossPnl: number;
  totalGrossPnlPercent: number;
  totalAdjustedPnl: number;
  totalAdjustedPnlPercent: number;
  scripCount: number;
  topPerformer: Scrip | null;
  worstPerformer: Scrip | null;
  sectorAllocation: Record<string, number>;
}
