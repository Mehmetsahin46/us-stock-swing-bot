const https = require('https');

const BASE_URL = 'https://us-stock-swing-bot.vercel.app/api/portfolio';
const SUPABASE_URL = 'https://cmoufesovihdbwaljutu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtb3VmZXNvdmloZGJ3YWxqdXR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY2MDQ0NSwiZXhwIjoyMTAzMjM2NDQ1fQ.d9nG3FUBntfa0WrVXxhLZ75J_syqXCOkiUyHq7J2-Go';

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opt = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };
    if (body) {
      const data = JSON.stringify(body);
      opt.headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = https.request(opt, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Save closed trade directly to Supabase trade_history table
async function saveDirectToTradeHistory(trade) {
  try {
    await request(`${SUPABASE_URL}/rest/v1/trade_history`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      }
    }, {
      id: trade.id,
      market: trade.market,
      ticker: trade.ticker,
      display_ticker: trade.displayTicker,
      strategy: trade.strategy,
      entry_date: trade.entryDate,
      exit_date: trade.exitDate,
      entry_price: trade.entryPrice,
      exit_price: trade.exitPrice,
      shares: trade.initialShares,
      realized_pnl: trade.realizedPnL,
      status: trade.status,
      exit_reason: trade.exitReason,
      raw_data: trade
    });
    console.log(`📌 [SUPABASE TABLOSUNA EKLENDI] trade_history tablosuna "${trade.displayTicker}" satırı eklendi!`);
  } catch (err) {
    console.error('Supabase trade_history kayit hatasi:', err.message);
  }
}

const BIST_STOCKS = [
  { ticker: 'THYAO.IS', name: 'THYAO', price: 308.50, sector: 'Aviation', st: 'EMA 20 Pullback' },
  { ticker: 'ASELS.IS', name: 'ASELS', price: 64.20, sector: 'Defense', st: 'Breakout Momentum' },
  { ticker: 'EREGL.IS', name: 'EREGL', price: 52.80, sector: 'Mining/Metals', st: 'Oversold Bounce' },
  { ticker: 'TUPRS.IS', name: 'TUPRS', price: 178.40, sector: 'Energy', st: 'EMA 20 Pullback' },
  { ticker: 'BIMAS.IS', name: 'BIMAS', price: 485.00, sector: 'Retail', st: 'Momentum Trend' },
  { ticker: 'KCHOL.IS', name: 'KCHOL', price: 220.00, sector: 'Industrial', st: 'EMA 20 Pullback' },
  { ticker: 'FROTO.IS', name: 'FROTO', price: 1050.00, sector: 'Automotive', st: 'Breakout Momentum' },
  { ticker: 'GARAN.IS', name: 'GARAN', price: 135.50, sector: 'Banking', st: 'EMA 20 Pullback' },
  { ticker: 'AKBNK.IS', name: 'AKBNK', price: 73.15, sector: 'Banking', st: 'Momentum Trend' },
  { ticker: 'SISE.IS', name: 'SISE', price: 46.20, sector: 'Industrial', st: 'Oversold Bounce' }
];

const US_STOCKS = [
  { ticker: 'NVDA', name: 'NVDA', price: 128.50, sector: 'Semiconductors', st: 'EMA 20 Pullback' },
  { ticker: 'AAPL', name: 'AAPL', price: 224.30, sector: 'Technology', st: 'Breakout Momentum' },
  { ticker: 'TSLA', name: 'TSLA', price: 215.80, sector: 'Automotive', st: 'Momentum Trend' },
  { ticker: 'MSFT', name: 'MSFT', price: 445.00, sector: 'Technology', st: 'EMA 20 Pullback' },
  { ticker: 'AMZN', name: 'AMZN', price: 178.50, sector: 'Retail', st: 'Oversold Bounce' },
  { ticker: 'META', name: 'META', price: 512.00, sector: 'Technology', st: 'Breakout Momentum' },
  { ticker: 'AMD', name: 'AMD', price: 154.00, sector: 'Semiconductors', st: 'EMA 20 Pullback' },
  { ticker: 'GOOGL', name: 'GOOGL', price: 176.20, sector: 'Technology', st: 'Breakout Momentum' }
];

async function runFastStep(step) {
  console.log(`\n⚡ [ADIM ${step}/50 - Her 4 Saniyede Bir İşlem]`);

  try {
    const res = await request(BASE_URL);
    if (!res.success || !res.state) return;

    const state = res.state;
    const bist = state.bist;
    const us = state.us;
    const nowStr = new Date().toISOString().split('T')[0];
    const timeIso = new Date().toISOString();

    // BIST ISLEMI (Alim veya Satim)
    if (bist.positions.length >= 4 && Math.random() > 0.4) {
      // KAR SATISI
      const pos = bist.positions.shift();
      const pnlPct = +(3.5 + Math.random() * 5.5).toFixed(2);
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
      console.log(`🎯 [BIST SATIŞ] ${pos.displayTicker} -> +₺${pnlAmount} (%${pnlPct})`);

      // Dogrudan trade_history tablosuna da kaydet!
      await saveDirectToTradeHistory(pos);
    } else {
      // YENI ALIM
      const available = BIST_STOCKS.filter(s => !bist.positions.some(p => p.ticker === s.ticker));
      if (available.length > 0 && bist.cash > 400) {
        const pick = available[Math.floor(Math.random() * available.length)];
        const targetAlloc = Math.min(bist.cash * 0.22, 1800);
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

    // US ISLEMI
    if (us.positions.length >= 3 && Math.random() > 0.4) {
      const pos = us.positions.shift();
      const pnlPct = +(2.8 + Math.random() * 4.5).toFixed(2);
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
      console.log(`🎯 [US SATIŞ] ${pos.displayTicker} -> +$${pnlAmount} (%${pnlPct})`);

      await saveDirectToTradeHistory(pos);
    } else {
      const available = US_STOCKS.filter(s => !us.positions.some(p => p.ticker === s.ticker));
      if (available.length > 0 && us.cash > 80) {
        const pick = available[Math.floor(Math.random() * available.length)];
        const targetAlloc = Math.min(us.cash * 0.35, 120);
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

    // Dalgalanma & Recalculate
    bist.positions.forEach(p => {
      const fl = +((-1.0 + Math.random() * 3.0)).toFixed(2);
      p.currentPrice = +(p.entryPrice * (1 + fl / 100)).toFixed(2);
      p.unrealizedPnL = +((p.currentPrice - p.entryPrice) * p.shares).toFixed(2);
      p.unrealizedPnLPct = fl;
    });
    us.positions.forEach(p => {
      const fl = +((-1.0 + Math.random() * 3.0)).toFixed(2);
      p.currentPrice = +(p.entryPrice * (1 + fl / 100)).toFixed(2);
      p.unrealizedPnL = +((p.currentPrice - p.entryPrice) * p.shares).toFixed(2);
      p.unrealizedPnLPct = fl;
    });

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

    await request(BASE_URL, { method: 'POST' }, { state });
    console.log(`💾 [SUPABASE STATE GÜNCELLENDİ] BIST: ₺${bist.totalEquity} (Gerçekleşen Kâr: +₺${bist.realizedPnL}) | US: $${us.totalEquity}`);
  } catch (err) {
    console.error('Adim hatasi:', err.message);
  }
}

async function start() {
  console.log('⚡ HIZLI DEMO TİCARET SİMÜLASYONU BAŞLADI (HER 4 SANİYEDE BİR İŞLEM)');
  console.log('Supabase Table Editor ve web sitenizi yan yana açıp izleyin!\n');

  for (let i = 1; i <= 40; i++) {
    await runFastStep(i);
    await new Promise(r => setTimeout(r, 4000)); // 4 saniye
  }
  console.log('\n=== HIZLI SİMÜLASYON TAMAMLANDI ===');
}

start();