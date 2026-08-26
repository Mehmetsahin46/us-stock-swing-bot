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
