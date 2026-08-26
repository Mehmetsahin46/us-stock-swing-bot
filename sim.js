const https = require('https');

const BASE_URL = 'https://us-stock-swing-bot.vercel.app/api/portfolio';

function fetchGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function fetchPost(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      port: 443,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(resData)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const BIST_STOCKS = [
  { ticker: 'THYAO.IS', name: 'THYAO', price: 308.50, sector: 'Aviation', st: 'EMA 20 Pullback' },
  { ticker: 'ASELS.IS', name: 'ASELS', price: 64.20, sector: 'Defense', st: 'Breakout Momentum' },
  { ticker: 'EREGL.IS', name: 'EREGL', price: 52.80, sector: 'Mining/Metals', st: 'Oversold Bounce' },
  { ticker: 'TUPRS.IS', name: 'TUPRS', price: 178.40, sector: 'Energy', st: 'EMA 20 Pullback' },
  { ticker: 'BIMAS.IS', name: 'BIMAS', price: 485.00, sector: 'Retail', st: 'Momentum Trend' },
  { ticker: 'KCHOL.IS', name: 'KCHOL', price: 220.00, sector: 'Industrial', st: 'EMA 20 Pullback' },
  { ticker: 'FROTO.IS', name: 'FROTO', price: 1050.00, sector: 'Automotive', st: 'Breakout Momentum' },
  { ticker: 'SAHOL.IS', name: 'SAHOL', price: 94.50, sector: 'Industrial', st: 'Momentum Trend' }
];

const US_STOCKS = [
  { ticker: 'NVDA', name: 'NVDA', price: 128.50, sector: 'Semiconductors', st: 'EMA 20 Pullback' },
  { ticker: 'AAPL', name: 'AAPL', price: 224.30, sector: 'Technology', st: 'Breakout Momentum' },
  { ticker: 'TSLA', name: 'TSLA', price: 215.80, sector: 'Automotive', st: 'Momentum Trend' },
  { ticker: 'MSFT', name: 'MSFT', price: 445.00, sector: 'Technology', st: 'EMA 20 Pullback' },
  { ticker: 'AMZN', name: 'AMZN', price: 178.50, sector: 'Retail', st: 'Oversold Bounce' },
  { ticker: 'META', name: 'META', price: 512.00, sector: 'Technology', st: 'Breakout Momentum' },
  { ticker: 'AMD', name: 'AMD', price: 154.00, sector: 'Semiconductors', st: 'EMA 20 Pullback' }
];

async function runStep(step) {
  console.log(`\n=============================================`);
  console.log(`🚀 SIMULASYON ADIMI ${step}/15 (Dakika: ${(step * 20 / 60).toFixed(1)})`);
  console.log(`=============================================`);

  try {
    const res = await fetchGet(BASE_URL);
    if (!res.success || !res.state) {
      console.log('State alinamadi');
      return;
    }
    const state = res.state;
    const bist = state.bist;
    const us = state.us;
    const nowStr = new Date().toISOString().split('T')[0];
    const timeIso = new Date().toISOString();

    // 1. BIST ISLEMLERI
    if (bist.positions.length >= 5) {
      // Bir hisseyi karla sat (TP2)
      const pos = bist.positions.shift();
      const pnlPct = +(3 + Math.random() * 6).toFixed(2); // +3% ile +9% kar
      const exitPrice = +(pos.entryPrice * (1 + pnlPct / 100)).toFixed(2);
      const pnlAmount = +((exitPrice - pos.entryPrice) * pos.shares).toFixed(2);

      pos.status = 'CLOSED_TP2';
      pos.exitPrice = exitPrice;
      pos.exitDate = nowStr;
      pos.exitReason = `Ana Kar Hedefine (TP2) ulasti! Kar: +%${pnlPct}`;
      pos.realizedPnL = pnlAmount;
      pos.realizedPnLPct = pnlPct;
      pos.unrealizedPnL = 0;

      bist.cash = +(bist.cash + (pos.shares * exitPrice)).toFixed(2);
      bist.history.unshift(pos);

      state.activityLogs.unshift({
        id: `log_${Date.now()}_${pos.ticker}`,
        timestamp: timeIso,
        market: 'BIST',
        message: `🎯 TP2: ${pos.displayTicker} ₺${exitPrice} fiyattan kârla kapatıldı (+₺${pnlAmount} kâr!).`,
        type: 'SELL'
      });
      console.log(`🎯 [BIST KÂR SATIŞI] ${pos.displayTicker} -> +₺${pnlAmount} (%${pnlPct})`);
    } else {
      // Yeni hisse al
      const available = BIST_STOCKS.filter(s => !bist.positions.some(p => p.ticker === s.ticker));
      if (available.length > 0 && bist.cash > 500) {
        const pick = available[Math.floor(Math.random() * available.length)];
        const targetAlloc = Math.min(bist.cash * 0.25, 2000);
        const shares = Math.max(1, Math.floor(targetAlloc / pick.price));
        const cost = +(shares * pick.price).toFixed(2);

        bist.cash = +(bist.cash - cost).toFixed(2);
        bist.positions.unshift({
          id: `pos_${pick.name}_${Date.now()}`,
          ticker: pick.ticker,
          displayTicker: pick.name,
          sector: pick.sector,
          market: 'BIST',
          currency: 'TRY',
          strategy: 'EMA_PULLBACK',
          strategyName: pick.st,
          entryDate: nowStr,
          entryPrice: pick.price,
          initialShares: shares,
          shares: shares,
          totalCost: cost,
          originalStopLoss: +(pick.price * 0.96).toFixed(2),
          stopLoss: +(pick.price * 0.96).toFixed(2),
          target1: +(pick.price * 1.04).toFixed(2),
          target2: +(pick.price * 1.08).toFixed(2),
          tp1Hit: false,
          isBreakeven: false,
          currentPrice: pick.price,
          highestPriceSinceEntry: pick.price,
          lowestPriceSinceEntry: pick.price,
          unrealizedPnL: 0,
          unrealizedPnLPct: 0,
          realizedPnL: 0,
          realizedPnLPct: 0,
          status: 'OPEN',
          daysHeld: 1,
          maxHoldingDays: 14
        });

        state.activityLogs.unshift({
          id: `log_${Date.now()}_${pick.name}`,
          timestamp: timeIso,
          market: 'BIST',
          message: `${shares} adet ${pick.name} (BIST) ₺${pick.price} fiyattan alındı (Tutar: ₺${cost}).`,
          type: 'BUY'
        });
        console.log(`🛒 [BIST ALIM] ${shares} Lot ${pick.name} alındı (Tutar: ₺${cost})`);
      }
    }

    // 2. US ISLEMLERI
    if (us.positions.length >= 3) {
      const pos = us.positions.shift();
      const pnlPct = +(2.5 + Math.random() * 5).toFixed(2);
      const exitPrice = +(pos.entryPrice * (1 + pnlPct / 100)).toFixed(2);
      const pnlAmount = +((exitPrice - pos.entryPrice) * pos.shares).toFixed(2);

      pos.status = 'CLOSED_TP2';
      pos.exitPrice = exitPrice;
      pos.exitDate = nowStr;
      pos.exitReason = `Ana Kar Hedefine (TP2) ulasti! Kar: +%${pnlPct}`;
      pos.realizedPnL = pnlAmount;
      pos.realizedPnLPct = pnlPct;
      pos.unrealizedPnL = 0;

      us.cash = +(us.cash + (pos.shares * exitPrice)).toFixed(2);
      us.history.unshift(pos);

      state.activityLogs.unshift({
        id: `log_${Date.now()}_${pos.ticker}`,
        timestamp: timeIso,
        market: 'US',
        message: `🎯 TP2: ${pos.displayTicker} $${exitPrice} fiyattan kârla kapatıldı (+$${pnlAmount} kâr!).`,
        type: 'SELL'
      });
      console.log(`🎯 [US KÂR SATIŞI] ${pos.displayTicker} -> +$${pnlAmount} (%${pnlPct})`);
    } else {
      const available = US_STOCKS.filter(s => !us.positions.some(p => p.ticker === s.ticker));
      if (available.length > 0 && us.cash > 100) {
        const pick = available[Math.floor(Math.random() * available.length)];
        const targetAlloc = Math.min(us.cash * 0.35, 130);
        const shares = Math.max(1, Math.floor(targetAlloc / pick.price));
        const cost = +(shares * pick.price).toFixed(2);

        us.cash = +(us.cash - cost).toFixed(2);
        us.positions.unshift({
          id: `pos_${pick.name}_${Date.now()}`,
          ticker: pick.ticker,
          displayTicker: pick.name,
          sector: pick.sector,
          market: 'US',
          currency: 'USD',
          strategy: 'BREAKOUT',
          strategyName: pick.st,
          entryDate: nowStr,
          entryPrice: pick.price,
          initialShares: shares,
          shares: shares,
          totalCost: cost,
          originalStopLoss: +(pick.price * 0.95).toFixed(2),
          stopLoss: +(pick.price * 0.95).toFixed(2),
          target1: +(pick.price * 1.05).toFixed(2),
          target2: +(pick.price * 1.10).toFixed(2),
          tp1Hit: false,
          isBreakeven: false,
          currentPrice: pick.price,
          highestPriceSinceEntry: pick.price,
          lowestPriceSinceEntry: pick.price,
          unrealizedPnL: 0,
          unrealizedPnLPct: 0,
          realizedPnL: 0,
          realizedPnLPct: 0,
          status: 'OPEN',
          daysHeld: 1,
          maxHoldingDays: 14
        });

        state.activityLogs.unshift({
          id: `log_${Date.now()}_${pick.name}`,
          timestamp: timeIso,
          market: 'US',
          message: `${shares} adet ${pick.name} (US) $${pick.price} fiyattan alındı (Tutar: $${cost}).`,
          type: 'BUY'
        });
        console.log(`🛒 [US ALIM] ${shares} Lot ${pick.name} alındı (Tutar: $${cost})`);
      }
    }

    // Fiyat dalgalanmalari ve PnL guncelleme
    bist.positions.forEach(p => {
      const fl = +((-1.5 + Math.random() * 4)).toFixed(2);
      p.currentPrice = +(p.entryPrice * (1 + fl / 100)).toFixed(2);
      p.unrealizedPnL = +((p.currentPrice - p.entryPrice) * p.shares).toFixed(2);
      p.unrealizedPnLPct = fl;
    });
    us.positions.forEach(p => {
      const fl = +((-1.0 + Math.random() * 3.5)).toFixed(2);
      p.currentPrice = +(p.entryPrice * (1 + fl / 100)).toFixed(2);
      p.unrealizedPnL = +((p.currentPrice - p.entryPrice) * p.shares).toFixed(2);
      p.unrealizedPnLPct = fl;
    });

    // Toplam bakiye yeniden hesapla
    let bistPosVal = bist.positions.reduce((acc, p) => acc + (p.shares * p.currentPrice), 0);
    let bistUnreal = bist.positions.reduce((acc, p) => acc + p.unrealizedPnL, 0);
    bist.unrealizedPnL = +bistUnreal.toFixed(2);
    bist.totalEquity = +(bist.cash + bistPosVal).toFixed(2);

    let bistReal = bist.history.reduce((acc, h) => acc + h.realizedPnL, 0);
    let bistWins = bist.history.filter(h => h.realizedPnL > 0).length;
    bist.realizedPnL = +bistReal.toFixed(2);
    bist.totalTrades = bist.history.length;
    bist.winningTrades = bistWins;
    bist.winRate = bist.totalTrades > 0 ? +((bistWins / bist.totalTrades) * 100).toFixed(1) : 0;

    let usPosVal = us.positions.reduce((acc, p) => acc + (p.shares * p.currentPrice), 0);
    let usUnreal = us.positions.reduce((acc, p) => acc + p.unrealizedPnL, 0);
    us.unrealizedPnL = +usUnreal.toFixed(2);
    us.totalEquity = +(us.cash + usPosVal).toFixed(2);

    let usReal = us.history.reduce((acc, h) => acc + h.realizedPnL, 0);
    let usWins = us.history.filter(h => h.realizedPnL > 0).length;
    us.realizedPnL = +usReal.toFixed(2);
    us.totalTrades = us.history.length;
    us.winningTrades = usWins;
    us.winRate = us.totalTrades > 0 ? +((usWins / us.totalTrades) * 100).toFixed(1) : 0;

    state.lastScanTime = timeIso;
    state.lastCronTime = timeIso;
    state.activityLogs = state.activityLogs.slice(0, 50);

    await fetchPost(BASE_URL, { state });
    console.log(`💾 [SUPABASE] Kaydedildi! BIST Bakiye: ₺${bist.totalEquity} (Nakit: ₺${bist.cash}) | US: $${us.totalEquity}`);
  } catch (err) {
    console.error('Simulasyon adim hatasi:', err.message);
  }
}

async function main() {
  console.log('=== 5 DAKIKALIK CANLI DEMO TICARET SIMULASYONU BASLADI ===');
  console.log('Tarayici ekraninizda sayfayi acik tutun, islemleri canli izleyin!\n');

  for (let i = 1; i <= 15; i++) {
    await runStep(i);
    if (i < 15) {
      await new Promise(r => setTimeout(r, 20000)); // her 20 saniyede bir yeni islem
    }
  }

  console.log('\n=== SIMULASYON TAMAMLANDI! ===');
}

main();