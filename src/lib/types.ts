export type MarketType = 'US' | 'BIST';
export type CurrencyType = 'USD' | 'TRY';
export type StrategyType = 'EMA_PULLBACK' | 'BREAKOUT' | 'OVERSOLD_BOUNCE' | 'MOMENTUM_TREND';
export type SectorType = 
  | 'Technology' 
  | 'Semiconductors' 
  | 'Banking' 
  | 'Aviation' 
  | 'Energy' 
  | 'Retail' 
  | 'Automotive' 
  | 'Industrial' 
  | 'Crypto/Fintech' 
  | 'Defense' 
  | 'Mining/Metals' 
  | 'RealEstate' 
  | 'Telekom' 
  | 'Index';

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume20: number;
  rvol: number;
  ema9: number;
  ema20: number;
  ema50: number;
  ema200: number;
  rsi14: number;
  atr14: number;
  atrPercent: number;
  high20: number;
  low20: number;
}

export interface StockNewsItem {
  id: string;
  ticker: string;
  displayTicker: string;
  title: string;
  summary: string;
  source: string;
  url?: string;
  publishedAt: string;
  category: 'BILANCO' | 'YATIRIM' | 'SOZLESME' | 'ANALIST' | 'GENEL';
  sentiment: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  impactScore: number; // e.g. +15 for earnings beat, +10 for contract, -20 for downgrade
}

export interface StockScanResult {
  ticker: string;
  displayTicker: string;
  name: string;
  sector: SectorType;
  market: MarketType;
  currency: CurrencyType;
  technicals: TechnicalIndicators;
  signal: Signal | null;
  news?: StockNewsItem[];
  catalystScore?: number;
}

export interface MarketRegime {
  market: MarketType;
  ticker: string;
  price: number;
  ema50: number;
  trend: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  changePercent: number;
  rsi14: number;
  allowNewBuys: boolean;
  reason: string;
}

export interface Signal {
  id: string;
  ticker: string;
  displayTicker: string;
  sector: SectorType;
  market: MarketType;
  currency: CurrencyType;
  strategy: StrategyType;
  strategyName: string;
  title: string;
  score: number;
  technicalScore?: number;
  catalystScore?: number;
  catalystSummary?: string;
  activeCatalysts?: StockNewsItem[];
  reason: string;
  suggestedEntry: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskReward: number;
  potentialGainPct: number;
  maxRiskPct: number;
  timestamp: string;
}

export type PositionStatus = 
  | 'OPEN'
  | 'CLOSED_TP1'
  | 'CLOSED_TP2'
  | 'CLOSED_SL'
  | 'CLOSED_BREAKEVEN'
  | 'CLOSED_EXPIRED'
  | 'CLOSED_MANUAL';

export interface TradePosition {
  id: string;
  ticker: string;
  displayTicker: string;
  sector: SectorType;
  market: MarketType;
  currency: CurrencyType;
  strategy: StrategyType;
  strategyName: string;
  entryDate: string;
  entryPrice: number;
  initialShares: number;
  shares: number;
  totalCost: number;
  originalStopLoss: number;
  stopLoss: number;
  target1: number;
  target2: number;
  tp1Hit: boolean;
  isBreakeven: boolean;
  currentPrice: number;
  highestPriceSinceEntry: number;
  lowestPriceSinceEntry: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  realizedPnL: number;
  realizedPnLPct: number;
  status: PositionStatus;
  exitDate?: string;
  exitPrice?: number;
  exitReason?: string;
  daysHeld: number;
  maxHoldingDays: number;
}

export interface MarketPortfolio {
  market: MarketType;
  currency: CurrencyType;
  currencySymbol: string;
  initialBalance: number;
  cash: number;
  totalEquity: number;
  realizedPnL: number;
  unrealizedPnL: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  profitFactor: number;
  riskPerTradePct: number;
  maxOpenPositions: number;
  maxHoldingDays: number;
  autoTrade: boolean;
  useMarketRegimeFilter: boolean;
  useBreakevenTrailing: boolean;
  usePartialTakeProfit: boolean;
  positions: TradePosition[];
  history: TradePosition[];
  equityCurve: { date: string; equity: number }[];
}

export interface DualPortfolioState {
  bist: MarketPortfolio;
  us: MarketPortfolio;
  bistRegime: MarketRegime | null;
  usRegime: MarketRegime | null;
  lastScanTime: string | null;
  lastCronTime: string | null;
  activityLogs: Array<{ id: string; timestamp: string; market: MarketType; message: string; type: 'BUY' | 'SELL' | 'INFO' }>;
}

export interface BacktestParams {
  market: 'ALL' | 'US' | 'BIST';
  periodMonths: number;
  initialBalance: number;
  riskPerTradePct: number;
  maxHoldingDays: number;
  tickers?: string[];
  strategies?: StrategyType[];
}

export interface BacktestResult {
  summary: {
    period: string;
    market: string;
    initialCapital: number;
    finalCapital: number;
    totalReturnPct: number;
    totalTrades: number;
    winRate: number;
    winningTrades: number;
    losingTrades: number;
    profitFactor: number;
    maxDrawdownPct: number;
    avgTradeDays: number;
    avgGainPct: number;
    avgLossPct: number;
  };
  equityCurve: { date: string; equity: number }[];
  trades: TradePosition[];
}
