import { NextRequest, NextResponse } from 'next/server';
import { getSecurityState, toggleKillSwitch, approveQuarantinedSignal } from '@/lib/signalSecurityEngine';
import { getSecurityAuditLogs, LOCKED_RISK_CONSTANTS } from '@/lib/configSecurity';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const state = getSecurityState();
    const logs = getSecurityAuditLogs();

    return NextResponse.json({
      success: true,
      securityState: state,
      auditLogs: logs.slice(0, 50),
      lockedConstants: LOCKED_RISK_CONSTANTS
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, active, reason, signalId } = body;

    if (action === 'TOGGLE_KILL_SWITCH') {
      const result = toggleKillSwitch(Boolean(active), reason);
      return NextResponse.json({ success: true, state: result.state });
    }

    if (action === 'APPROVE_QUARANTINE' && signalId) {
      const ok = approveQuarantinedSignal(signalId);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ success: false, error: 'Bilinmeyen güvenlik aksiyonu.' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}