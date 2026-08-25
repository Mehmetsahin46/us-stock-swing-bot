# US Stock Swing Bot (1-14 Günlük Demo & Otomatik Al-Sat Simülatörü)

ABD Borsası (NYSE / NASDAQ) için geliştirilmiş, teknik indikatörlere (EMA Desteği, Kırılım/Momentum, Aşırı Satım Tepkisi) göre hisseleri tarayan, **1 ila 14 gün** elde tutma kurallarıyla sanal (demo) alım-satım yapan ve analiz doğruluğunu ölçen modern bir Web Dashboard & Bot uygulamasıdır.

## 🚀 Özellikler

1. **Otomatik Tarayıcı & Sinyal Motoru:**
   - S&P 500 ve Nasdaq'ın en likit 30 hissesini tarar.
   - EMA 9/20/50/200, RSI 14, ATR, RVOL (Göreceli Hacim) ve 20 Günlük Zirve hesaplar.
   - 3 Strateji Sinyali üretir:
     - **EMA 20 Trend Desteği (Pullback)**
     - **Yüksek Hacimli Kırılım (Breakout)**
     - **Aşırı Satım Tepki Alımı (Oversold Mean Reversion)**

2. **1-14 Günlük Sanal Portföy Simülatörü:**
   - $10.000 sanal bakiye.
   - İşlem başına %2 risk kuralı ile dinamik lot hesabı (Position Sizing).
   - Otomatik **Stop-Loss**, **Hedef 1 (TP1)**, **Hedef 2 (TP2)** ve **14 Günlük Vade Dolumu** çıkışı.

3. **Geçmiş Test (Backtest) Simülatörü:**
   - Son 3, 6 veya 12 ayın gerçek piyasa verileri üzerinde stratejileri test eder.
   - Kazanma Oranı (Win Rate %), Toplam Kâr/Zarar ve Maksimum Düşüş (Drawdown) metriklerini çıkarır.

4. **Vercel & GitHub Entegrasyonu:**
   - Vercel Serverless ve Vercel Cron ile tam uyumlu (`vercel.json`).

---

## 💻 VS Code'da Çalıştırma

Proje klasörünü VS Code ile açın:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda `http://localhost:3000` adresine gidin.

---

## 🐙 GitHub'a Gönderme (Push)

Projeyi GitHub'a yüklemek için:

```bash
git init
git add .
git commit -m "feat: US stock swing paper trading bot and dashboard"

# GitHub üzerinde yeni bir repo oluşturup:
git remote add origin https://github.com/KULLANICI_ADINIZ/us-stock-swing-bot.git
git branch -M main
git push -u origin main
```

---

## ☁️ Vercel'e Dağıtım (Deploy)

1. [vercel.com](https://vercel.com) adresine gidin ve GitHub hesabınızla giriş yapın.
2. **Add New Project** diyerek GitHub reponuzu seçin.
3. **Deploy** butonuna tıklayın.
4. `vercel.json` içindeki Cron konfigürasyonu sayesinde borsa günlerinde otomatik tarama yapılacaktır.

---

*Not: Bu uygulama tamamen simülasyon ve eğitim amaçlıdır. Yatırım tavsiyesi içermez.*
