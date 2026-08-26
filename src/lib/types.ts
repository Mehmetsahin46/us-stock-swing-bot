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

export type SignalGrade = 'A+' | 'A' | 'B' | 'C';

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
  grade: SignalGrade;
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
  expectedValuePct?: number; // Expected Value EV%
  relativeStrength?: number; // RS relative to market
  dataConfidenceScore?: number; // 0 - 100% (Veri Güvenilirliği)
  dataConfidenceStatus?: 'HIGH' | 'MEDIUM' | 'LOW';
  integrityHash?: string; // SHA-256 Signal Snapshot Hash
  isQuarantined?: boolean; // Signal Under Validation
  estimatedDays?: number;
  estimatedTimeframe?: string;
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
  estimatedDays?: number;
  estimatedTimeframe?: string;
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
    benchmarkName: string; // e.g. BIST 100 or S&P 500
    benchmarkReturnPct: number; // Endeks getirisi %
    alphaPct: number; // Endeks üstü getiri % (Strateji - Endeks)
    initialCapital: number;
    finalCapital: number;
    totalReturnPct: number;
    totalTrades: number;
    winRate: number;
    winningTrades: number;
    losingTrades: number;
    profitFactor: number;
    maxDrawdownPct: number;
    indexMaxDrawdownPct: number; // Endeksin yaşadığı max drawdown %
    avgTradeDays: number;
    avgGainPct: number;
    avgLossPct: number;
    payoffRatio: number; // Ortalama Kazanç / Ortalama Kayıp Oranı (Asimetrik Getiri)
  };
  walkForward: {
    inSampleWinRate: number;
    inSampleProfitFactor: number;
    outSampleWinRate: number;
    outSampleProfitFactor: number;
    wfePct: number; // Walk Forward Efficiency % (Normalized 0-100%)
    status: 'YÜKSEK TUTARLILIK (ROBUST)' | 'DENGELİ (GÜÇLÜ)' | 'AŞIRI UYARLAMA RİSKİ';
    validationVerdict: string;
    asymmetricEdgeNote: string;
  };
  equityCurve: { date: string; equity: number }[];
  trades: TradePosition[];
}

export type SignalTrackStatus = 
  | 'ACTIVE' 
  | 'SUCCESS_TP1' 
  | 'SUCCESS_TP2' 
  | 'STOPPED_SL' 
  | 'INVALIDATED' 
  | 'EXPIRED';

export interface SignalTrackItem {
  id: string;
  ticker: string;
  displayTicker: string;
  market: MarketType;
  currency: CurrencyType;
  strategy: StrategyType;
  strategyName: string;
  grade: SignalGrade;
  initialScore: number;
  currentScore: number;
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  currentPrice: number;
  highestPrice: number;
  lowestPrice: number;
  status: SignalTrackStatus;
  resultPnLPct: number;
  createdAt: string;
  closedAt?: string;
  invalidationReason?: string;
  reasons: string[];
  catalystSummary?: string;
  expectedValuePct: number;
}

export interface StrategyPerformanceStat {
  strategy: StrategyType;
  strategyName: string;
  totalSignals: number;
  winningSignals: number;
  losingSignals: number;
  winRate: number;
  profitFactor: number;
  avgReturnPct: number;
}

export interface SignalPerformanceMetrics {
  totalSignals: number;
  activeSignals: number;
  winRateAllTime: number;
  winRate7d: number;
  winRate30d: number;
  winRate90d: number;
  profitFactor: number;
  maxDrawdownPct: number;
  totalRealizedProfitPct: number;
  avgWinningTradePct: number;
  avgLosingTradePct: number;
  strategyBreakdown: StrategyPerformanceStat[];
}

export interface GlobalMacroRegime {
  vix: number;
  vixStatus: 'LOW' | 'NORMAL' | 'ELEVATED' | 'EXTREME';
  dxy: number;
  spyTrend: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  qqqTrend: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  usdTryRate: number;
  riskAppetite: 'RISK_ON' | 'NEUTRAL' | 'RISK_OFF';
  summary: string;
}

export interface WatchlistItem {
  ticker: string;
  displayTicker: string;
  market: MarketType;
  currency: CurrencyType;
  name: string;
  sector: SectorType;
  addedAt: string;
  notes?: string;
  targetPriceAlert?: number;
  scoreAlert?: number;
}
