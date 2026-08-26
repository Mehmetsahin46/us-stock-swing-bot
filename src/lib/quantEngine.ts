import { GlobalMacroRegime, Signal, SignalGrade, StockNewsItem, TechnicalIndicators } from './types';
import { fetchStockCandles } from './marketData';

export function calculateSignalGrade(
  score: number,
  catalystScore: number = 0,
  rvol: number = 1.0
): SignalGrade {
  if (score >= 90 || (score >= 85 && catalystScore >= 14 && rvol >= 1.2)) {
    return 'A+';
  }
  if (score >= 80 || (score >= 75 && catalystScore >= 10)) {
    return 'A';
  }
  if (score >= 70) {
    return 'B';
  }
  return 'C';
}

export function calculateExpectedValue(
  estimatedWinRatePct: number,
  potentialGainPct: number,
  maxRiskPct: number
): number {
  const winProb = Math.max(0.1, Math.min(0.95, estimatedWinRatePct / 100));
  const lossProb = 1 - winProb;
  const ev = winProb * potentialGainPct - lossProb * maxRiskPct;
  return Number(ev.toFixed(2));
}

export interface SignalFactorAnalysis {
  grade: SignalGrade;
  technicalSummary: string;
  catalystSummary: string;
  riskSummary: string;
  overallVerdict: string;
  factors: Array<{
    title: string;
    description: string;
    impact: 'POSITIVE' | 'NEUTRAL' | 'WARNING';
    score: number;
  }>;
}

export function analyzeSignalFactors(
  signal: Signal,
  tech?: TechnicalIndicators,
  news?: StockNewsItem[]
): SignalFactorAnalysis {
  const factors: SignalFactorAnalysis['factors'] = [];

  // 1. Technical Factor
  if (tech) {
    if (tech.rsi14 >= 45 && tech.rsi14 <= 65) {
      factors.push({
        title: `Dengeli Momentum (RSI ${tech.rsi14})`,
        description: 'Hisse ne aşırı şişmiş ne de aşırı ezilmiş; sağlıklı yükseliş bandında.',
        impact: 'POSITIVE',
        score: +12
      });
    } else if (tech.rsi14 <= 35) {
      factors.push({
        title: `Aşırı Satım & Dip Tepkisi (RSI ${tech.rsi14})`,
        description: 'Hisse tarihi dip destek bölgesinden yukarı yönlü toparlanma emareleri gösteriyor.',
        impact: 'POSITIVE',
        score: +15
      });
    }

    if (tech.rvol >= 1.2) {
      factors.push({
        title: `Kurumsal Hacim Onayı (RVOL ${tech.rvol}x)`,
        description: 'Son 20 günlük ortalama hacmin üzerinde güçlü para girişi mevcut.',
        impact: 'POSITIVE',
        score: +14
      });
    }

    if (tech.price >= tech.ema20 && tech.ema20 >= tech.ema50) {
      factors.push({
        title: 'Pozitif Trend Dizilimi (9 > 20 > 50 EMA)',
        description: 'Hareketli ortalamalar yükseliş trendi formasyonunda sıralanmış durumda.',
        impact: 'POSITIVE',
        score: +15
      });
    }
  }

  // 2. Fundamental & News Catalyst Factor
  if (news && news.length > 0) {
    const topNews = news[0];
    factors.push({
      title: `${topNews.category === 'BILANCO' ? '📊 Bilanço/Kâr' : topNews.category === 'SOZLESME' ? '🤝 İş Sözleşmesi' : '🚀 Şirket Gelişmesi'} Katalizörü`,
      description: topNews.title,
      impact: topNews.impactScore > 0 ? 'POSITIVE' : 'WARNING',
      score: topNews.impactScore
    });
  } else if (signal.catalystSummary) {
    factors.push({
      title: 'Piyasa Katalizörü',
      description: signal.catalystSummary,
      impact: 'POSITIVE',
      score: signal.catalystScore || 10
    });
  }

  // 3. Risk / Reward Factor
  if (signal.riskReward >= 2.0) {
    factors.push({
      title: `Yüksek Risk/Getiri Oranı (${signal.riskReward}x)`,
      description: `Potansiyel kâr (%${signal.potentialGainPct}), göze alınan maksimum riskten (%${signal.maxRiskPct}) iki katından fazla.`,
      impact: 'POSITIVE',
      score: +10
    });
  }

  // Overall verdict
  let verdict = 'Dengeli ve takip edilebilir standart sinyal.';
  if (signal.grade === 'A+') {
    verdict = '🥇 A+ Elit Fırsat: Güçlü teknik destek, yüksek kurumsal hacim ve pozitif bilanço/haber katalizörü birleşti!';
  } else if (signal.grade === 'A') {
    verdict = '🥈 A Sınıfı Fırsat: Güçlü trend ve risk/getiri avantajı ile yüksek başarı potansiyeli.';
  }

  return {
    grade: signal.grade,
    technicalSummary: `Strateji: ${signal.strategyName}`,
    catalystSummary: signal.catalystSummary || 'Dengeli piyasa akışı',
    riskSummary: `Stop: ${signal.stopLoss} | Hedef: ${signal.target2} (R:R ${signal.riskReward}x)`,
    overallVerdict: verdict,
    factors
  };
}

let cachedMacro: { data: GlobalMacroRegime; timestamp: number } | null = null;

export async function fetchGlobalMacroRegime(): Promise<GlobalMacroRegime> {
  const now = Date.now();
  if (cachedMacro && now - cachedMacro.timestamp < 1000 * 60 * 10) {
    return cachedMacro.data;
  }

  let vix = 16.5;
  let dxy = 103.8;
  let usdTry = 38.5;
  let spyTrend: 'BULLISH' | 'NEUTRAL' | 'BEARISH' = 'BULLISH';
  let qqqTrend: 'BULLISH' | 'NEUTRAL' | 'BEARISH' = 'BULLISH';

  try {
    const vixCandles = await fetchStockCandles('^VIX', '1mo');
    if (vixCandles && vixCandles.length > 0) {
      vix = Number(vixCandles[vixCandles.length - 1].close.toFixed(2));
    }
  } catch (e) {}

  try {
    const tryCandles = await fetchStockCandles('TRY=X', '1mo');
    if (tryCandles && tryCandles.length > 0) {
      usdTry = Number(tryCandles[tryCandles.length - 1].close.toFixed(2));
    }
  } catch (e) {}

  let vixStatus: GlobalMacroRegime['vixStatus'] = 'NORMAL';
  let riskAppetite: GlobalMacroRegime['riskAppetite'] = 'NEUTRAL';

  if (vix <= 15) {
    vixStatus = 'LOW';
    riskAppetite = 'RISK_ON';
  } else if (vix <= 22) {
    vixStatus = 'NORMAL';
    riskAppetite = 'RISK_ON';
  } else if (vix <= 30) {
    vixStatus = 'ELEVATED';
    riskAppetite = 'NEUTRAL';
  } else {
    vixStatus = 'EXTREME';
    riskAppetite = 'RISK_OFF';
  }

  const macro: GlobalMacroRegime = {
    vix,
    vixStatus,
    dxy,
    spyTrend,
    qqqTrend,
    usdTryRate: usdTry,
    riskAppetite,
    summary: riskAppetite === 'RISK_ON' 
      ? `🟢 Küresel Risk İştahı Pozitif (VIX: ${vix}, Sakin Piyasa)`
      : `⚠️ Küresel Risk İştahı Temkinli (VIX: ${vix})`
  };

  cachedMacro = { data: macro, timestamp: now };
  return macro;
}