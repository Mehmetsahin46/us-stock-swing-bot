export function isBISTOpen(): boolean {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Istanbul',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  });
  const parts = formatter.formatToParts(now);
  const weekday = parts.find(p => p.type === 'weekday')?.value || '';
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  const totalMinutes = hour * 60 + minute;

  const isWeekday = !['Sat', 'Sun'].includes(weekday);
  // BIST trading hours: 10:00 to 18:00 Istanbul time (600 to 1080 mins)
  const isMarketHours = totalMinutes >= 600 && totalMinutes < 1080;

  return isWeekday && isMarketHours;
}

export function isUSOpen(): boolean {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  });
  const parts = formatter.formatToParts(now);
  const weekday = parts.find(p => p.type === 'weekday')?.value || '';
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  const totalMinutes = hour * 60 + minute;

  const isWeekday = !['Sat', 'Sun'].includes(weekday);
  // US Regular Trading Hours: 09:30 to 16:00 Eastern Time (570 to 960 mins)
  const isMarketHours = totalMinutes >= 570 && totalMinutes < 960;

  return isWeekday && isMarketHours;
}

// ⏱️ SEANS AÇILIŞ/KAPANIŞ KORUMASI (SESSION VOLATILITY MUTE)
// Açılış ilk 15 dk (Gap sahteleri) ve kapanış son 10 dk (Karanlık oda manipülasyonu) sinyal üretme, sadece izle.
export function isSessionMuteActive(market: 'BIST' | 'US'): { isMuted: boolean; reason?: string } {
  const now = new Date();

  if (market === 'BIST') {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Istanbul',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
    const totalMinutes = hour * 60 + minute;

    // 10:00 - 10:15 (Opening Gap Mute)
    if (totalMinutes >= 600 && totalMinutes < 615) {
      return { isMuted: true, reason: '⏳ BIST Seans Açılışı (10:00-10:15): Gap açılış volatilitesi nedeniyle sinyaller beklemede.' };
    }
    // 17:50 - 18:00 (Closing Cross Mute)
    if (totalMinutes >= 1070 && totalMinutes < 1080) {
      return { isMuted: true, reason: '⏳ BIST Kapanış Öncesi (17:50-18:00): Karanlık oda kapanış oynaklığı nedeniyle sinyal üretimi donduruldu.' };
    }
  } else {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
    const totalMinutes = hour * 60 + minute;

    // 09:30 - 09:45 (Opening Bell Mute)
    if (totalMinutes >= 570 && totalMinutes < 585) {
      return { isMuted: true, reason: '⏳ NYSE Açılış Çanı (09:30-09:45 NY): İlk 15 dakika sahte kırılım filtresi aktif.' };
    }
    // 15:50 - 16:00 (Market On Close Imbalance Mute)
    if (totalMinutes >= 950 && totalMinutes < 960) {
      return { isMuted: true, reason: '⏳ NYSE Kapanış Öncesi (15:50-16:00 NY): MOC dengesizlikleri nedeniyle sinyal üretimi donduruldu.' };
    }
  }

  return { isMuted: false };
}

export function isAnyMarketOpen(): boolean {
  return isBISTOpen() || isUSOpen();
}

export function getMarketStatus(): { bistOpen: boolean; usOpen: boolean; message: string } {
  const bistOpen = isBISTOpen();
  const usOpen = isUSOpen();
  
  if (bistOpen && usOpen) {
    return { bistOpen, usOpen, message: 'BIST ve ABD piyasaları açık.' };
  } else if (bistOpen) {
    return { bistOpen, usOpen, message: 'BIST açık, ABD kapalı.' };
  } else if (usOpen) {
    return { bistOpen, usOpen, message: 'ABD açık, BIST kapalı.' };
  } else {
    return { bistOpen, usOpen, message: 'Tüm piyasalar kapalı. Sadece mevcut pozisyonlar güncelleniyor.' };
  }
}