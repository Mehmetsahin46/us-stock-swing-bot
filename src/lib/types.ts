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
  name: string;
  technicals: TechnicalIndicators;
  signal: Signal | null;
}

export interface Signal {
  id: string;
  ticker: string;
  strategy: StrategyType;
  strategyName: string;
  title: string;
  score: number; // 0 - 100
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
  maxHoldingDays: number; // default 14
}

export interface BotSettings {
  startingCapital: number;
  riskPerTradePct: number; // e.g. 2.0 (%)
  maxOpenPositions: number; // e.g. 5
  maxHoldingDays: number; // e.g. 14
  autoTrade: boolean;
  minRVOL: number;
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
  periodMonths: number;
  initialBalance: number;
  riskPerTradePct: number;
  maxHoldingDays: number;
  tickers: string[];
  strategies: StrategyType[];
}

export interface BacktestResult {
  summary: {
    period: string;
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
