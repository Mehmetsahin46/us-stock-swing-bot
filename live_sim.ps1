$url = "https://us-stock-swing-bot.vercel.app/api/portfolio"

Write-Host "=== 5 DAKIKALIK CANLI DEMO TICARET SIMULASYONU BASLIYOR ==="
Write-Host "Tarayici ekraninizi acik tutun ve yenileyerek/izleyerek takip edin!"

$bistSample = @(
    @{ ticker="THYAO.IS"; name="THYAO"; price=308.50; sector="Aviation"; st="EMA 20 Pullback" },
    @{ ticker="ASELS.IS"; name="ASELS"; price=64.20; sector="Defense"; st="Breakout Momentum" },
    @{ ticker="EREGL.IS"; name="EREGL"; price=52.80; sector="Mining/Metals"; st="Oversold Bounce" },
    @{ ticker="TUPRS.IS"; name="TUPRS"; price=178.40; sector="Energy"; st="EMA 20 Pullback" },
    @{ ticker="BIMAS.IS"; name="BIMAS"; price=485.00; sector="Retail"; st="Momentum Trend" },
    @{ ticker="KCHOL.IS"; name="KCHOL"; price=220.00; sector="Industrial"; st="EMA 20 Pullback" },
    @{ ticker="FROTO.IS"; name="FROTO"; price=1050.00; sector="Automotive"; st="Breakout Momentum" },
    @{ ticker="SAHOL.IS"; name="SAHOL"; price=94.50; sector="Industrial"; st="Momentum Trend" }
)

$usSample = @(
    @{ ticker="NVDA"; name="NVDA"; price=128.50; sector="Semiconductors"; st="EMA 20 Pullback" },
    @{ ticker="AAPL"; name="AAPL"; price=224.30; sector="Technology"; st="Breakout Momentum" },
    @{ ticker="TSLA"; name="TSLA"; price=215.80; sector="Automotive"; st="Momentum Trend" },
    @{ ticker="MSFT"; name="MSFT"; price=445.00; sector="Technology"; st="EMA 20 Pullback" },
    @{ ticker="AMZN"; name="AMZN"; price=178.50; sector="Retail"; st="Oversold Bounce" },
    @{ ticker="META"; name="META"; price=512.00; sector="Technology"; st="Breakout Momentum" },
    @{ ticker="AMD"; name="AMD"; price=154.00; sector="Semiconductors"; st="EMA 20 Pullback" }
)

# 12 iterasyon * 22 saniye = yaklasik 4.5 - 5 Dakika
for ($i = 1; $i -le 12; $i++) {
    Write-Host "`n--- DONGU $i / 12 ---"
    
    try {
        $stateRes = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 15
        $state = $stateRes.state
        
        # 1. BIST Islemi Yap
        $bist = $state.bist
        if ($bist.positions.Count -ge 4) {
            # Kar Al / Pozisyon Kapat
            $posToClose = $bist.positions[0]
            $pnlRate = (Get-Random -Minimum 30 -Maximum 85) / 1000 # +3% ile +8.5% kar
            $exitPrice = [math]::Round($posToClose.entryPrice * (1 + $pnlRate), 2)
            $pnl = [math]::Round(($exitPrice - $posToClose.entryPrice) * $posToClose.shares, 2)
            
            $posToClose.status = "CLOSED_TP2"
            $posToClose.exitPrice = $exitPrice
            $posToClose.exitDate = (Get-Date).ToString("yyyy-MM-dd")
            $posToClose.exitReason = "Ana Kar Hedefi (TP2) gerceklesti! Kar: +$([math]::Round($pnlRate*100, 2))%"
            $posToClose.realizedPnL = $pnl
            $posToClose.realizedPnLPct = [math]::Round($pnlRate * 100, 2)
            $posToClose.unrealizedPnL = 0
            
            $bist.cash = [math]::Round($bist.cash + ($posToClose.shares * $exitPrice), 2)
            $bist.positions = @($bist.positions | Where-Object { $_.id -ne $posToClose.id })
            $bist.history = @($posToClose) + @($bist.history)
            
            $state.activityLogs = @(@{
                id = "log_$(Get-Date -UFormat %s)_$($posToClose.ticker)"
                timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                market = "BIST"
                message = "🎯 TP2: $($posToClose.displayTicker) ₺$exitPrice fiyattan kârla kapatıldı (+₺$pnl kâr!)."
                type = "SELL"
            }) + @($state.activityLogs)
            
            Write-Host "✅ [BIST SATIS] $($posToClose.displayTicker) karla satildi: +TL $pnl"
        } else {
            # Yeni Hisse Al
            $pick = $bistSample | Get-Random
            $already = $bist.positions | Where-Object { $_.ticker -eq $pick.ticker }
            if (-not $already -and $bist.cash -gt ($pick.price * 2)) {
                $targetAlloc = [math]::Min($bist.cash * 0.25, 2000)
                $shares = [math]::Max(1, [math]::Floor($targetAlloc / $pick.price))
                $cost = [math]::Round($shares * $pick.price, 2)
                $bist.cash = [math]::Round($bist.cash - $cost, 2)
                
                $newPos = @{
                    id = "pos_$($pick.name)_$(Get-Date -UFormat %s)"
                    ticker = $pick.ticker
                    displayTicker = $pick.name
                    sector = $pick.sector
                    market = "BIST"
                    currency = "TRY"
                    strategy = "EMA_PULLBACK"
                    strategyName = $pick.st
                    entryDate = (Get-Date).ToString("yyyy-MM-dd")
                    entryPrice = $pick.price
                    initialShares = $shares
                    shares = $shares
                    totalCost = $cost
                    originalStopLoss = [math]::Round($pick.price * 0.96, 2)
                    stopLoss = [math]::Round($pick.price * 0.96, 2)
                    target1 = [math]::Round($pick.price * 1.04, 2)
                    target2 = [math]::Round($pick.price * 1.08, 2)
                    tp1Hit = $false
                    isBreakeven = $false
                    currentPrice = $pick.price
                    highestPriceSinceEntry = $pick.price
                    lowestPriceSinceEntry = $pick.price
                    unrealizedPnL = 0
                    unrealizedPnLPct = 0
                    realizedPnL = 0
                    realizedPnLPct = 0
                    status = "OPEN"
                    daysHeld = 1
                    maxHoldingDays = 14
                }
                $bist.positions = @($newPos) + @($bist.positions)
                
                $state.activityLogs = @(@{
                    id = "log_$(Get-Date -UFormat %s)_$($pick.name)"
                    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                    market = "BIST"
                    message = "$shares adet $($pick.name) (BIST) ₺$($pick.price) fiyattan alındı (Tutar: ₺$cost)."
                    type = "BUY"
                }) + @($state.activityLogs)
                
                Write-Host "🛒 [BIST ALIM] $shares adet $($pick.name) alindi (Tutar: TL $cost)"
            }
        }
        
        # 2. US Islemi Yap
        $us = $state.us
        if ($us.positions.Count -ge 3) {
            # US Kar Al
            $uPos = $us.positions[0]
            $pnlRate = (Get-Random -Minimum 25 -Maximum 70) / 1000
            $exitPrice = [math]::Round($uPos.entryPrice * (1 + $pnlRate), 2)
            $pnl = [math]::Round(($exitPrice - $uPos.entryPrice) * $uPos.shares, 2)
            
            $uPos.status = "CLOSED_TP2"
            $uPos.exitPrice = $exitPrice
            $uPos.exitDate = (Get-Date).ToString("yyyy-MM-dd")
            $uPos.exitReason = "Ana Kar Hedefi (TP2) gerceklesti! Kar: +$([math]::Round($pnlRate*100, 2))%"
            $uPos.realizedPnL = $pnl
            $uPos.realizedPnLPct = [math]::Round($pnlRate * 100, 2)
            $uPos.unrealizedPnL = 0
            
            $us.cash = [math]::Round($us.cash + ($uPos.shares * $exitPrice), 2)
            $us.positions = @($us.positions | Where-Object { $_.id -ne $uPos.id })
            $us.history = @($uPos) + @($us.history)
            
            $state.activityLogs = @(@{
                id = "log_$(Get-Date -UFormat %s)_$($uPos.ticker)"
                timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                market = "US"
                message = "🎯 TP2: $($uPos.displayTicker) `$$exitPrice fiyattan kârla kapatıldı (+`$$pnl kâr!)."
                type = "SELL"
            }) + @($state.activityLogs)
            
            Write-Host "✅ [US SATIS] $($uPos.displayTicker) karla satildi: +$ $pnl"
        } else {
            # US Alim
            $uPick = $usSample | Get-Random
            $alreadyU = $us.positions | Where-Object { $_.ticker -eq $uPick.ticker }
            if (-not $alreadyU -and $us.cash -gt $uPick.price) {
                $targetAlloc = [math]::Min($us.cash * 0.35, 120)
                $shares = [math]::Max(1, [math]::Floor($targetAlloc / $uPick.price))
                $cost = [math]::Round($shares * $uPick.price, 2)
                $us.cash = [math]::Round($us.cash - $cost, 2)
                
                $newUPos = @{
                    id = "pos_$($uPick.name)_$(Get-Date -UFormat %s)"
                    ticker = $uPick.ticker
                    displayTicker = $uPick.name
                    sector = $uPick.sector
                    market = "US"
                    currency = "USD"
                    strategy = "BREAKOUT"
                    strategyName = $uPick.st
                    entryDate = (Get-Date).ToString("yyyy-MM-dd")
                    entryPrice = $uPick.price
                    initialShares = $shares
                    shares = $shares
                    totalCost = $cost
                    originalStopLoss = [math]::Round($uPick.price * 0.95, 2)
                    stopLoss = [math]::Round($uPick.price * 0.95, 2)
                    target1 = [math]::Round($uPick.price * 1.05, 2)
                    target2 = [math]::Round($uPick.price * 1.10, 2)
                    tp1Hit = $false
                    isBreakeven = $false
                    currentPrice = $uPick.price
                    highestPriceSinceEntry = $uPick.price
                    lowestPriceSinceEntry = $uPick.price
                    unrealizedPnL = 0
                    unrealizedPnLPct = 0
                    realizedPnL = 0
                    realizedPnLPct = 0
                    status = "OPEN"
                    daysHeld = 1
                    maxHoldingDays = 14
                }
                $us.positions = @($newUPos) + @($us.positions)
                
                $state.activityLogs = @(@{
                    id = "log_$(Get-Date -UFormat %s)_$($uPick.name)"
                    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                    market = "US"
                    message = "$shares adet $($uPick.name) (US) `$$($uPick.price) fiyattan alındı (Tutar: `$$cost)."
                    type = "BUY"
                }) + @($state.activityLogs)
                
                Write-Host "🛒 [US ALIM] $shares adet $($uPick.name) alindi (Tutar: $ $cost)"
            }
        }
        
        # Canli Fiyat Dalgalanmasi & PnL Guncelleme
        foreach ($p in $bist.positions) {
            $fluct = (Get-Random -Minimum -15 -Maximum 25) / 1000
            $p.currentPrice = [math]::Round($p.entryPrice * (1 + $fluct), 2)
            $p.unrealizedPnL = [math]::Round(($p.currentPrice - $p.entryPrice) * $p.shares, 2)
            $p.unrealizedPnLPct = [math]::Round($fluct * 100, 2)
        }
        foreach ($p in $us.positions) {
            $fluct = (Get-Random -Minimum -10 -Maximum 30) / 1000
            $p.currentPrice = [math]::Round($p.entryPrice * (1 + $fluct), 2)
            $p.unrealizedPnL = [math]::Round(($p.currentPrice - $p.entryPrice) * $p.shares, 2)
            $p.unrealizedPnLPct = [math]::Round($fluct * 100, 2)
        }
        
        # Equity ve PnL yeniden hesaplama
        $bistOpenVal = 0; $bistUnreal = 0
        foreach ($p in $bist.positions) { $bistOpenVal += ($p.shares * $p.currentPrice); $bistUnreal += $p.unrealizedPnL }
        $bist.unrealizedPnL = [math]::Round($bistUnreal, 2)
        $bist.totalEquity = [math]::Round($bist.cash + $bistOpenVal, 2)
        
        $bistRealized = 0; $bistWins = 0
        foreach ($h in $bist.history) { $bistRealized += $h.realizedPnL; if ($h.realizedPnL -gt 0) { $bistWins++ } }
        $bist.realizedPnL = [math]::Round($bistRealized, 2)
        $bist.totalTrades = $bist.history.Count
        $bist.winningTrades = $bistWins
        if ($bist.totalTrades -gt 0) { $bist.winRate = [math]::Round(($bistWins / $bist.totalTrades) * 100, 1) }
        
        $usOpenVal = 0; $usUnreal = 0
        foreach ($p in $us.positions) { $usOpenVal += ($p.shares * $p.currentPrice); $usUnreal += $p.unrealizedPnL }
        $us.unrealizedPnL = [math]::Round($usUnreal, 2)
        $us.totalEquity = [math]::Round($us.cash + $usOpenVal, 2)
        
        $usRealized = 0; $usWins = 0
        foreach ($h in $us.history) { $usRealized += $h.realizedPnL; if ($h.realizedPnL -gt 0) { $usWins++ } }
        $us.realizedPnL = [math]::Round($usRealized, 2)
        $us.totalTrades = $us.history.Count
        $us.winningTrades = $usWins
        if ($us.totalTrades -gt 0) { $us.winRate = [math]::Round(($usWins / $us.totalTrades) * 100, 1) }
        
        $state.lastScanTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        $state.lastCronTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        
        # Sunucuya ve Supabase'e Kaydet
        $body = @{ state = $state } | ConvertTo-Json -Depth 6
        $postRes = Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json" -TimeoutSec 15
        Write-Host "💾 [SUPABASE GUNCELLENDI] BIST Bakiye: TL $($bist.totalEquity) | US Bakiye: `$$($us.totalEquity)"
        
    } catch {
        Write-Host "Hata: $($_.Exception.Message)"
    }
    
    Start-Sleep -Seconds 22
}

Write-Host "=== 5 DAKIKALIK SIMULASYON TAMAMLANDI! ==="