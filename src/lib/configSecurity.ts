import crypto from 'crypto';
import { Signal, StockNewsItem, TechnicalIndicators } from './types';

// 🧱 CRITICAL SERVER-SIDE LOCKED RISK CONSTANTS (Cannot be modified by frontend/API)
export const LOCKED_RISK_CONSTANTS = Object.freeze({
  MAX_STOP_LOSS_PCT: 3.5,            // Maksimum zarar kesme tavanı
  RSI_OVERBOUGHT_CEILING: 72,         // FOMO / Tepe mal kilitleme sınırı
  MIN_DATA_CONFIDENCE_THRESHOLD: 80,  // Minimum veri güvenilirliği eşiği (%)
  MAX_CONCENTRATION_PER_TRADE_PCT: 25,// Tek hisseye maksimum A+ bütçe tavanı (%)
  MAX_SECTOR_POSITIONS: 3,            // Sektör başına pozisyon sınırı
  CIRCUIT_BREAKER_DRAWDOWN_PCT: 2.5   // Günlük devre kesici sınırı (%)
});

export interface ImmutableSignalSnapshot {
  signalId: string;
  ticker: string;
  timestamp: string;
  priceAtSignal: number;
  rsi14: number;
  ema20: number;
  ema50: number;
  rvol: number;
  quantScore: number;
  stopLoss: number;
  target1: number;
  target2: number;
  catalysts: string[];
  dataConfidenceScore: number;
  integrityHash: string;
}

export function generateSignalSnapshotAndHash(
  signal: Signal,
  tech?: TechnicalIndicators,
  news?: StockNewsItem[],
  dataConfidence: number = 99
): { snapshot: ImmutableSignalSnapshot; integrityHash: string } {
  const payloadToHash = {
    ticker: signal.ticker,
    timestamp: signal.timestamp,
    suggestedEntry: signal.suggestedEntry,
    stopLoss: signal.stopLoss,
    target2: signal.target2,
    score: signal.score,
    rsi14: tech?.rsi14 || 50,
    rvol: tech?.rvol || 1.0,
    dataConfidence
  };

  // Generate SHA-256 Hash
  const hashString = JSON.stringify(payloadToHash);
  const integrityHash = crypto.createHash('sha256').update(hashString).digest('hex');

  const snapshot: ImmutableSignalSnapshot = {
    signalId: signal.id,
    ticker: signal.ticker,
    timestamp: signal.timestamp,
    priceAtSignal: signal.suggestedEntry,
    rsi14: tech?.rsi14 || 50,
    ema20: tech?.ema20 || 0,
    ema50: tech?.ema50 || 0,
    rvol: tech?.rvol || 1.0,
    quantScore: signal.score,
    stopLoss: signal.stopLoss,
    target1: signal.target1,
    target2: signal.target2,
    catalysts: news?.map(n => n.title) || [],
    dataConfidenceScore: dataConfidence,
    integrityHash
  };

  return { snapshot, integrityHash };
}

export function verifySignalIntegrity(
  snapshot: ImmutableSignalSnapshot
): boolean {
  const payloadToHash = {
    ticker: snapshot.ticker,
    timestamp: snapshot.timestamp,
    suggestedEntry: snapshot.priceAtSignal,
    stopLoss: snapshot.stopLoss,
    target2: snapshot.target2,
    score: snapshot.quantScore,
    rsi14: snapshot.rsi14,
    rvol: snapshot.rvol,
    dataConfidence: snapshot.dataConfidenceScore
  };

  const hashString = JSON.stringify(payloadToHash);
  const recomputedHash = crypto.createHash('sha256').update(hashString).digest('hex');
  return recomputedHash === snapshot.integrityHash;
}

export interface SecurityAuditEntry {
  id: string;
  timestamp: string;
  eventType: 'SIGNAL_GENERATED' | 'ANOMALY_DETECTED' | 'KILL_SWITCH_TOGGLED' | 'QUARANTINE_ACTION' | 'DATA_BLOCKED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  details?: Record<string, any>;
}

let memoryAuditLogs: SecurityAuditEntry[] = [];

export function recordSecurityAuditLog(
  eventType: SecurityAuditEntry['eventType'],
  severity: SecurityAuditEntry['severity'],
  message: string,
  details?: Record<string, any>
): SecurityAuditEntry {
  const entry: SecurityAuditEntry = {
    id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    eventType,
    severity,
    message,
    details
  };
  memoryAuditLogs.unshift(entry);
  if (memoryAuditLogs.length > 300) {
    memoryAuditLogs = memoryAuditLogs.slice(0, 300);
  }
  return entry;
}

export function getSecurityAuditLogs(): SecurityAuditEntry[] {
  return memoryAuditLogs;
}