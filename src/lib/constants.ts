import { DualPortfolioState, MarketPortfolio } from './types';

const today = new Date().toISOString().split('T')[0];

export const INITIAL_BIST_PORTFOLIO: MarketPortfolio = {
  market: 'BIST',
  currency: 'TRY',
  currencySymbol: '₺',
  initialBalance: 10000,
  cash: 10000,
  totalEquity: 10000,
  realizedPnL: 0,
  unrealizedPnL: 0,
  winRate: 0,
  totalTrades: 0,
  winningTrades: 0,
  losingTrades: 0,
  profitFactor: 0,
  riskPerTradePct: 3.5,
  maxOpenPositions: 8,
  maxHoldingDays: 14,
  autoTrade: true,
  useMarketRegimeFilter: false,
  useBreakevenTrailing: true,
  usePartialTakeProfit: true,
  positions: [],
  history: [],
  equityCurve: [{ date: today, equity: 10000 }]
};

export const INITIAL_US_PORTFOLIO: MarketPortfolio = {
  market: 'US',
  currency: 'USD',
  currencySymbol: '$',
  initialBalance: 500,
  cash: 500,
  totalEquity: 500,
  realizedPnL: 0,
  unrealizedPnL: 0,
  winRate: 0,
  totalTrades: 0,
  winningTrades: 0,
  losingTrades: 0,
  profitFactor: 0,
  riskPerTradePct: 3.5,
  maxOpenPositions: 6,
  maxHoldingDays: 14,
  autoTrade: true,
  useMarketRegimeFilter: false,
  useBreakevenTrailing: true,
  usePartialTakeProfit: true,
  positions: [],
  history: [],
  equityCurve: [{ date: today, equity: 500 }]
};

export const INITIAL_DUAL_STATE: DualPortfolioState = {
  bist: INITIAL_BIST_PORTFOLIO,
  us: INITIAL_US_PORTFOLIO,
  bistRegime: null,
  usRegime: null,
  lastScanTime: null,
  lastCronTime: null,
  activityLogs: []
};
