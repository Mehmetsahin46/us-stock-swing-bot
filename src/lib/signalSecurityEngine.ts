import { Signal } from './types';
import { recordSecurityAuditLog } from './configSecurity';

export interface QuarantinedSignalItem {
  signal: Signal;
  quarantinedAt: string;
  reason: string;
  anomalyScore: number;
  status: 'PENDING_VALIDATION' | 'APPROVED' | 'REJECTED';
}

export interface SecurityEngineState {
  killSwitchActive: boolean;
  killSwitchReason?: string;
  lastAnomalyAt?: string;
  totalAnomaliesDetected: number;
  quarantinedSignals: QuarantinedSignalItem[];
}

let securityState: SecurityEngineState = {
  killSwitchActive: false,
  totalAnomaliesDetected: 0,
  quarantinedSignals: []
};

export function isKillSwitchActive(): boolean {
  return securityState.killSwitchActive;
}

export function toggleKillSwitch(active: boolean, reason?: string): { success: boolean; state: SecurityEngineState } {
  securityState.killSwitchActive = active;
  securityState.killSwitchReason = reason || (active ? 'Manuel acil durum kilit anahtarı etkinleştirildi.' : undefined);

  recordSecurityAuditLog(
    'KILL_SWITCH_TOGGLED',
    active ? 'CRITICAL' : 'INFO',
    active ? `🛑 ACİL DURUM KİLİT ANAHTARI (KILL SWITCH) AÇILDI: ${reason}` : '🟢 Kill switch devreden çıkarıldı, normal operasyona dönüldü.'
  );

  return { success: true, state: securityState };
}

export function filterAndQuarantineSignals(signals: Signal[]): {
  approvedSignals: Signal[];
  quarantinedSignals: Signal[];
  anomalyDetected: boolean;
  alertMessage?: string;
} {
  // 1. Kill switch check
  if (securityState.killSwitchActive) {
    recordSecurityAuditLog('SIGNAL_GENERATED', 'WARNING', `Kill Switch aktif olduğu için ${signals.length} adet sinyal üretimi engellendi.`);
    return {
      approvedSignals: [],
      quarantinedSignals: signals,
      anomalyDetected: true,
      alertMessage: `🛑 Kill Switch Aktif: ${securityState.killSwitchReason || 'Tüm yeni sinyaller geçici olarak durduruldu.'}`
    };
  }

  // 2. Anomaly Spike Check (If single scan produces > 25 signals, it indicates a market data glitch or extreme spike)
  if (signals.length >= 25) {
    securityState.totalAnomaliesDetected++;
    securityState.lastAnomalyAt = new Date().toISOString();

    const alertMessage = `🚨 ANORMAL SİNYAL PATLAMASI: Tek taramada ${signals.length} adet sinyal üretildi! Olası veri hatası nedeniyle tüm sinyaller güvenlik karantinasına alındı.`;

    recordSecurityAuditLog('ANOMALY_DETECTED', 'CRITICAL', alertMessage, { signalCount: signals.length });

    const now = new Date().toISOString();
    for (const sig of signals) {
      securityState.quarantinedSignals.unshift({
        signal: sig,
        quarantinedAt: now,
        reason: 'Anormal toplu sinyal patlaması filtresi',
        anomalyScore: 88,
        status: 'PENDING_VALIDATION'
      });
    }

    if (securityState.quarantinedSignals.length > 50) {
      securityState.quarantinedSignals = securityState.quarantinedSignals.slice(0, 50);
    }

    return {
      approvedSignals: [],
      quarantinedSignals: signals,
      anomalyDetected: true,
      alertMessage
    };
  }

  // 3. Normal signal flow
  return {
    approvedSignals: signals,
    quarantinedSignals: [],
    anomalyDetected: false
  };
}

export function getSecurityState(): SecurityEngineState {
  return securityState;
}

export function approveQuarantinedSignal(signalId: string): boolean {
  const item = securityState.quarantinedSignals.find(q => q.signal.id === signalId);
  if (item) {
    item.status = 'APPROVED';
    recordSecurityAuditLog('QUARANTINE_ACTION', 'INFO', `${item.signal.displayTicker} karantinadan onaylanarak serbest bırakıldı.`);
    return true;
  }
  return false;
}