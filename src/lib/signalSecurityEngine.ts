import { Signal } from './types';
import { recordSecurityAuditLog } from './configSecurity';

export const MAX_CONCURRENT_SIGNAL_CAP = 14; // Eşzamanlı sinyal tavanı (200 hisselik evren için optimize)

export interface PostIncidentRCAReport {
  incidentId: string;
  timestamp: string;
  triggerType: 'CONCURRENT_CAP_EXCEEDED' | 'ANOMALY_SPIKE' | 'MANUAL_KILL_SWITCH' | 'DATA_CORRUPTION';
  rootCause: string;
  affectedSignalsCount: number;
  recoveryAction: string;
  isResolved: boolean;
}

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
  recoveryPhase: 'NORMAL' | 'A_PLUS_ONLY'; // Kademeli karantina çıkış fazı
  lastAnomalyAt?: string;
  totalAnomaliesDetected: number;
  quarantinedSignals: QuarantinedSignalItem[];
  rcaReports: PostIncidentRCAReport[];
}

let securityState: SecurityEngineState = {
  killSwitchActive: false,
  recoveryPhase: 'NORMAL',
  totalAnomaliesDetected: 0,
  quarantinedSignals: [],
  rcaReports: []
};

export function isKillSwitchActive(): boolean {
  return securityState.killSwitchActive;
}

export function toggleKillSwitch(active: boolean, reason?: string): { success: boolean; state: SecurityEngineState } {
  securityState.killSwitchActive = active;
  securityState.killSwitchReason = reason || (active ? 'Manuel acil durum kilit anahtarı etkinleştirildi.' : undefined);

  if (active) {
    securityState.recoveryPhase = 'A_PLUS_ONLY'; // Çıkışta önce A+ elit koruması
    generateRCAReport('MANUAL_KILL_SWITCH', reason || 'Yönetici acil durum anahtarını tetikledi.', 0);
  } else {
    // Kademeli çıkış
    securityState.recoveryPhase = 'A_PLUS_ONLY';
  }

  recordSecurityAuditLog(
    'KILL_SWITCH_TOGGLED',
    active ? 'CRITICAL' : 'INFO',
    active ? `🛑 ACİL DURUM KİLİT ANAHTARI (KILL SWITCH) AÇILDI: ${reason}` : '🟢 Kill switch devreden çıkarıldı. Kademeli kurtarma fazı (Sadece A+) devrede.'
  );

  return { success: true, state: securityState };
}

export function generateRCAReport(
  triggerType: PostIncidentRCAReport['triggerType'],
  rootCause: string,
  affectedSignalsCount: number
): PostIncidentRCAReport {
  const report: PostIncidentRCAReport = {
    incidentId: `rca_${Date.now()}`,
    timestamp: new Date().toISOString(),
    triggerType,
    rootCause,
    affectedSignalsCount,
    recoveryAction: 'Tüm sinyaller karantinaya alındı; kademeli A+ doğrulama sürecine geçildi.',
    isResolved: false
  };

  securityState.rcaReports.unshift(report);
  if (securityState.rcaReports.length > 20) {
    securityState.rcaReports = securityState.rcaReports.slice(0, 20);
  }

  return report;
}

export function filterAndQuarantineSignals(signals: Signal[]): {
  approvedSignals: Signal[];
  quarantinedSignals: Signal[];
  anomalyDetected: boolean;
  alertMessage?: string;
  alertSeverity?: 'INFO' | 'WARNING' | 'CRITICAL';
} {
  // 1. Kill switch check
  if (securityState.killSwitchActive) {
    recordSecurityAuditLog('SIGNAL_GENERATED', 'WARNING', `Kill Switch aktif olduğu için ${signals.length} adet sinyal üretimi engellendi.`);
    const qSigs = signals.map(s => ({
      ...s,
      isQuarantined: true,
      quarantineReason: '🛑 Acil Durum Kill Switch Koruması Devrede',
      quarantineExpiresInSeconds: 0
    }));
    return {
      approvedSignals: [],
      quarantinedSignals: qSigs,
      anomalyDetected: true,
      alertMessage: `🛑 Kill Switch Aktif: ${securityState.killSwitchReason || 'Tüm yeni sinyaller geçici olarak durduruldu.'}`,
      alertSeverity: 'CRITICAL'
    };
  }

  // 2. ⚡ EŞZAMANLI SİNYAL BARAJI (MAX CONCURRENT CAP: 14 Sinyal/Dk)
  if (signals.length > MAX_CONCURRENT_SIGNAL_CAP) {
    securityState.totalAnomaliesDetected++;
    securityState.lastAnomalyAt = new Date().toISOString();

    const rootCause = `1 dakika içinde ${signals.length} adet eşzamanlı sinyal üretildi (Tavan: ${MAX_CONCURRENT_SIGNAL_CAP}). Olası genel piyasa şoku veya API glitch anomalisi.`;
    generateRCAReport('CONCURRENT_CAP_EXCEEDED', rootCause, signals.length);

    recordSecurityAuditLog('ANOMALY_DETECTED', 'CRITICAL', rootCause, { count: signals.length });

    const now = new Date().toISOString();
    const qSigs = signals.map(sig => {
      const qItem = {
        ...sig,
        isQuarantined: true,
        quarantineReason: '⚡ Eşzamanlı Sinyal Barajı (2. Veri Kaynağı & KAP Teyidi Bekleniyor)',
        quarantineExpiresInSeconds: 45
      };
      securityState.quarantinedSignals.unshift({
        signal: qItem,
        quarantinedAt: now,
        reason: 'Eşzamanlı Sinyal Barajı Aşımı (API Glitch Koruması)',
        anomalyScore: 92,
        status: 'PENDING_VALIDATION'
      });
      return qItem;
    });

    return {
      approvedSignals: [],
      quarantinedSignals: qSigs,
      anomalyDetected: true,
      alertMessage: `🚨 EŞZAMANLI SİNYAL BARAJI: Aynı anda ${signals.length} sinyal tespit edildi. İkinci veri kaynağı teyidi için karantinaya alındı.`,
      alertSeverity: 'CRITICAL'
    };
  }

  // 3. 🛡️ KADEMELİ KARANTİNA ÇIKIŞI (PHASED RECOVERY)
  if (securityState.recoveryPhase === 'A_PLUS_ONLY') {
    const eliteSignals = signals.filter(s => s.grade === 'A+');
    const nonElite = signals.filter(s => s.grade !== 'A+').map(s => ({
      ...s,
      isQuarantined: true,
      quarantineReason: '🛡️ Kademeli Kurtarma Modu (Önce A+ Sinyaller Onaylanıyor)',
      quarantineExpiresInSeconds: 30
    }));

    if (nonElite.length > 0) {
      recordSecurityAuditLog('QUARANTINE_ACTION', 'INFO', `Kademeli kurtarma fazında ${nonElite.length} adet standart sinyal bekletildi.`);
    }

    return {
      approvedSignals: eliteSignals,
      quarantinedSignals: nonElite,
      anomalyDetected: false,
      alertMessage: '🟢 Kademeli Kurtarma Modu: Yalnızca A+ Elit Fırsatlara izin veriliyor.',
      alertSeverity: 'INFO'
    };
  }

  // 4. Normal signal flow
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