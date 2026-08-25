export type MarketType = 'US' | 'BIST';
export type CurrencyType = 'USD' | 'TRY';
export type StrategyType = 'EMA_PULLBACK' | 'BREAKOUT' | 'OVERSOLD_BOUNCE';

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

export interface StockScanResult {
  ticker: string;
  displayTicker: string;
  name: string;
  market: MarketType;
  currency: CurrencyType;
  technicals: TechnicalIndicators;
  signal: Signal | null;
}

export interface Signal {
  id: string;
  ticker: string;
  displayTicker: string;
  market: MarketType;
  currency: CurrencyType;
  strategy: StrategyType;
  strategyName: string;
  title: string;
  score: number;
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
  | 'CLOSED_EXPIRED'
  | 'CLOSED_MANUAL';

export interface TradePosition {
  id: string;
  ticker: string;
  displayTicker: string;
  market: MarketType;
  currency: CurrencyType;
  strategy: StrategyType;
  strategyName: string;
  entryDate: string;
  entryPrice: number;
  shares: number;
  totalCost: number;
  stopLoss: number;
  target1: number;
  target2: number;
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

export interface BotSettings {
  startingCapital: number;
  riskPerTradePct: number;
  maxOpenPositions: number;
  maxHoldingDays: number;
  autoTrade: boolean;
  minRVOL: number;
  activeMarket: 'ALL' | 'US' | 'BIST';
  allowedStrategies: StrategyType[];
}

export interface PortfolioState {
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
  positions: TradePosition[];
  history: TradePosition[];
  equityCurve: { date: string; equity: number }[];
  lastScanTime: string | null;
  settings: BotSettings;
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
