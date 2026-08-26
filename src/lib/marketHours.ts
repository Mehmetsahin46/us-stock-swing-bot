export function isBISTOpen(): boolean {
  const now = new Date();
  // Convert to Istanbul time (UTC+3)
  const istanbulOffset = 3 * 60; // minutes
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istanbulMinutes = utcMinutes + istanbulOffset;
  
  // BIST hours: 10:00-18:00 Istanbul time (Monday-Friday)
  const dayOfWeek = now.getUTCDay();
  // Adjust day for timezone
  const istanbulHour = Math.floor(istanbulMinutes / 60) % 24;
  
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isMarketHours = istanbulMinutes >= 600 && istanbulMinutes <= 1080; // 10:00-18:00
  
  return isWeekday && isMarketHours;
}

export function isUSOpen(): boolean {
  const now = new Date();
  // Convert to New York time (UTC-4 during EDT, UTC-5 during EST)
  // Simplified: use UTC-4 (EDT, most of the trading year)
  const nyOffset = -4 * 60; // minutes
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const nyMinutes = ((utcMinutes + nyOffset) % 1440 + 1440) % 1440;
  
  const dayOfWeek = now.getUTCDay();
  
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isMarketHours = nyMinutes >= 570 && nyMinutes <= 960; // 9:30-16:00
  
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
