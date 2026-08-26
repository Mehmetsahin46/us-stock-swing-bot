import { NextRequest, NextResponse } from 'next/server';
import { recordSecurityAuditLog } from '@/lib/configSecurity';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let blacklistedIPs = new Set<string>();

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown IP';
  blacklistedIPs.add(ip);

  recordSecurityAuditLog(
    'ANOMALY_DETECTED',
    'CRITICAL',
    `🍯 HONEYPOT TUZAĞI TETİKLENDİ: Yetkisiz bot/tarayıcı yakalandı ve IP (${ip}) kara listeye alındı.`,
    { ip, url: request.nextUrl.pathname, userAgent: request.headers.get('user-agent') }
  );

  return NextResponse.json(
    { error: 'Forbidden: Access denied. Your IP has been blacklisted and reported to security.' },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  return GET(request);
}