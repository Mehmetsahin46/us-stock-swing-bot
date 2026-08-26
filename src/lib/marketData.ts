import { Candle, CurrencyType, MarketRegime, MarketType, SectorType, StockScanResult, TechnicalIndicators } from './types';
import { evaluateSignal } from './strategyEngine';

export interface UniverseItem {
  ticker: string;
  displayTicker: string;
  name: string;
  sector: SectorType;
  market: MarketType;
  currency: CurrencyType;
}

export const US_UNIVERSE: UniverseItem[] = [
  // Big Tech & Semis
  { ticker: 'NVDA', displayTicker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'TSLA', displayTicker: 'TSLA', name: 'Tesla, Inc.', sector: 'Automotive', market: 'US', currency: 'USD' },
  { ticker: 'AAPL', displayTicker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'MSFT', displayTicker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'AMZN', displayTicker: 'AMZN', name: 'Amazon.com, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'META', displayTicker: 'META', name: 'Meta Platforms, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'GOOGL', displayTicker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'AMD', displayTicker: 'AMD', name: 'Advanced Micro Devices', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'AVGO', displayTicker: 'AVGO', name: 'Broadcom Inc.', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'NFLX', displayTicker: 'NFLX', name: 'Netflix, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'PLTR', displayTicker: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'ARM', displayTicker: 'ARM', name: 'Arm Holdings plc', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'SMCI', displayTicker: 'SMCI', name: 'Super Micro Computer', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'MU', displayTicker: 'MU', name: 'Micron Technology', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'QCOM', displayTicker: 'QCOM', name: 'Qualcomm Inc.', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'TSM', displayTicker: 'TSM', name: 'Taiwan Semiconductor', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'INTC', displayTicker: 'INTC', name: 'Intel Corporation', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'MRVL', displayTicker: 'MRVL', name: 'Marvell Technology', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'LRCX', displayTicker: 'LRCX', name: 'Lam Research', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'KLAC', displayTicker: 'KLAC', name: 'KLA Corporation', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'ON', displayTicker: 'ON', name: 'ON Semiconductor', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'DELL', displayTicker: 'DELL', name: 'Dell Technologies', sector: 'Technology', market: 'US', currency: 'USD' },

  // Crypto / Fintech / Momentum
  { ticker: 'COIN', displayTicker: 'COIN', name: 'Coinbase Global', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'MSTR', displayTicker: 'MSTR', name: 'MicroStrategy Inc.', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'HOOD', displayTicker: 'HOOD', name: 'Robinhood Markets', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'MARA', displayTicker: 'MARA', name: 'MARA Holdings', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'RIOT', displayTicker: 'RIOT', name: 'Riot Platforms', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'CLSK', displayTicker: 'CLSK', name: 'CleanSpark, Inc.', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'SOFI', displayTicker: 'SOFI', name: 'SoFi Technologies', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'PYPL', displayTicker: 'PYPL', name: 'PayPal Holdings', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'SQ', displayTicker: 'SQ', name: 'Block, Inc.', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'AFRM', displayTicker: 'AFRM', name: 'Affirm Holdings', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'UPST', displayTicker: 'UPST', name: 'Upstart Holdings', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },

  // High Growth / Cloud / Cyber
  { ticker: 'APP', displayTicker: 'APP', name: 'AppLovin Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'CRWD', displayTicker: 'CRWD', name: 'CrowdStrike Holdings', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'PANW', displayTicker: 'PANW', name: 'Palo Alto Networks', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'NET', displayTicker: 'NET', name: 'Cloudflare, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'DDOG', displayTicker: 'DDOG', name: 'Datadog, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'SNOW', displayTicker: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'NOW', displayTicker: 'NOW', name: 'ServiceNow, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'CRM', displayTicker: 'CRM', name: 'Salesforce, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'ORCL', displayTicker: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'UBER', displayTicker: 'UBER', name: 'Uber Technologies', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'SHOP', displayTicker: 'SHOP', name: 'Shopify Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'RBLX', displayTicker: 'RBLX', name: 'Roblox Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'DKNG', displayTicker: 'DKNG', name: 'DraftKings Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'CELH', displayTicker: 'CELH', name: 'Celsius Holdings', sector: 'Retail', market: 'US', currency: 'USD' },

  // EV / Solar / Energy
  { ticker: 'RIVN', displayTicker: 'RIVN', name: 'Rivian Automotive', sector: 'Automotive', market: 'US', currency: 'USD' },
  { ticker: 'LCID', displayTicker: 'LCID', name: 'Lucid Group', sector: 'Automotive', market: 'US', currency: 'USD' },
  { ticker: 'NIO', displayTicker: 'NIO', name: 'NIO Inc.', sector: 'Automotive', market: 'US', currency: 'USD' },
  { ticker: 'LI', displayTicker: 'LI', name: 'Li Auto Inc.', sector: 'Automotive', market: 'US', currency: 'USD' },
  { ticker: 'XPEV', displayTicker: 'XPEV', name: 'XPeng Inc.', sector: 'Automotive', market: 'US', currency: 'USD' },
  { ticker: 'BABA', displayTicker: 'BABA', name: 'Alibaba Group', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'ENPH', displayTicker: 'ENPH', name: 'Enphase Energy', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'FSLR', displayTicker: 'FSLR', name: 'First Solar, Inc.', sector: 'Energy', market: 'US', currency: 'USD' },

  // Healthcare / Biotech
  { ticker: 'LLY', displayTicker: 'LLY', name: 'Eli Lilly and Company', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'UNH', displayTicker: 'UNH', name: 'UnitedHealth Group', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'ABBV', displayTicker: 'ABBV', name: 'AbbVie Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'JNJ', displayTicker: 'JNJ', name: 'Johnson & Johnson', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'MRK', displayTicker: 'MRK', name: 'Merck & Co.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'PFE', displayTicker: 'PFE', name: 'Pfizer Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'MRNA', displayTicker: 'MRNA', name: 'Moderna, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'AMGN', displayTicker: 'AMGN', name: 'Amgen Inc.', sector: 'Technology', market: 'US', currency: 'USD' },

  // Finance / Banking
  { ticker: 'JPM', displayTicker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'GS', displayTicker: 'GS', name: 'Goldman Sachs Group', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'V', displayTicker: 'V', name: 'Visa Inc.', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'MA', displayTicker: 'MA', name: 'Mastercard Incorporated', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'BAC', displayTicker: 'BAC', name: 'Bank of America Corp', sector: 'Banking', market: 'US', currency: 'USD' },

  // Energy
  { ticker: 'XOM', displayTicker: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'CVX', displayTicker: 'CVX', name: 'Chevron Corporation', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'SLB', displayTicker: 'SLB', name: 'Schlumberger Limited', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'OXY', displayTicker: 'OXY', name: 'Occidental Petroleum', sector: 'Energy', market: 'US', currency: 'USD' },

  // Aerospace / Defense
  { ticker: 'BA', displayTicker: 'BA', name: 'The Boeing Company', sector: 'Defense', market: 'US', currency: 'USD' },
  { ticker: 'LMT', displayTicker: 'LMT', name: 'Lockheed Martin Corporation', sector: 'Defense', market: 'US', currency: 'USD' },
  { ticker: 'RTX', displayTicker: 'RTX', name: 'RTX Corporation', sector: 'Defense', market: 'US', currency: 'USD' },
  { ticker: 'GD', displayTicker: 'GD', name: 'General Dynamics', sector: 'Defense', market: 'US', currency: 'USD' },
  { ticker: 'NOC', displayTicker: 'NOC', name: 'Northrop Grumman', sector: 'Defense', market: 'US', currency: 'USD' },

  // Industrial
  { ticker: 'CAT', displayTicker: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'DE', displayTicker: 'DE', name: 'Deere & Company', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'GE', displayTicker: 'GE', name: 'GE Aerospace', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'HON', displayTicker: 'HON', name: 'Honeywell International', sector: 'Industrial', market: 'US', currency: 'USD' },

  // Consumer / Retail
  { ticker: 'WMT', displayTicker: 'WMT', name: 'Walmart Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'COST', displayTicker: 'COST', name: 'Costco Wholesale', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'HD', displayTicker: 'HD', name: 'The Home Depot', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'MCD', displayTicker: 'MCD', name: "McDonald's Corporation", sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'SBUX', displayTicker: 'SBUX', name: 'Starbucks Corporation', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'NKE', displayTicker: 'NKE', name: 'Nike, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'DIS', displayTicker: 'DIS', name: 'The Walt Disney Company', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'PEP', displayTicker: 'PEP', name: 'PepsiCo, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'KO', displayTicker: 'KO', name: 'The Coca-Cola Company', sector: 'Retail', market: 'US', currency: 'USD' },

  // Other Tech & Growth
  { ticker: 'IONQ', displayTicker: 'IONQ', name: 'IonQ, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'SOUN', displayTicker: 'SOUN', name: 'SoundHound AI', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'AI', displayTicker: 'AI', name: 'C3.ai, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'PATH', displayTicker: 'PATH', name: 'UiPath Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'MNDY', displayTicker: 'MNDY', name: 'monday.com Ltd.', sector: 'Technology', market: 'US', currency: 'USD' },

  // Biotech Momentum
  { ticker: 'HIMS', displayTicker: 'HIMS', name: 'Hims & Hers Health', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'RXRX', displayTicker: 'RXRX', name: 'Recursion Pharmaceuticals', sector: 'Technology', market: 'US', currency: 'USD' },

  // ETFs
  { ticker: 'QQQ', displayTicker: 'QQQ', name: 'Invesco QQQ Trust', sector: 'Index', market: 'US', currency: 'USD' },
  { ticker: 'SPY', displayTicker: 'SPY', name: 'SPDR S&P 500 ETF', sector: 'Index', market: 'US', currency: 'USD' },
  { ticker: 'IWM', displayTicker: 'IWM', name: 'iShares Russell 2000 ETF', sector: 'Index', market: 'US', currency: 'USD' }
];

export const BIST_UNIVERSE: UniverseItem[] = [
  // BIST Ana Tahtalar & Bankacılık
  { ticker: 'THYAO.IS', displayTicker: 'THYAO', name: 'Türk Hava Yolları', sector: 'Aviation', market: 'BIST', currency: 'TRY' },
  { ticker: 'ASELS.IS', displayTicker: 'ASELS', name: 'Aselsan Elektronik', sector: 'Defense', market: 'BIST', currency: 'TRY' },
  { ticker: 'GARAN.IS', displayTicker: 'GARAN', name: 'Garanti BBVA', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'EREGL.IS', displayTicker: 'EREGL', name: 'Ereğli Demir Çelik', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },
  { ticker: 'TUPRS.IS', displayTicker: 'TUPRS', name: 'Tüpraş Rafinerileri', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'BIMAS.IS', displayTicker: 'BIMAS', name: 'BİM Birleşik Mağazalar', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'KCHOL.IS', displayTicker: 'KCHOL', name: 'Koç Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'AKBNK.IS', displayTicker: 'AKBNK', name: 'Akbank T.A.Ş.', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'YKBNK.IS', displayTicker: 'YKBNK', name: 'Yapı ve Kredi Bankası', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'ISCTR.IS', displayTicker: 'ISCTR', name: 'İş Bankası (C)', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'VAKBN.IS', displayTicker: 'VAKBN', name: 'VakıfBank', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'HALKB.IS', displayTicker: 'HALKB', name: 'Türkiye Halk Bankası', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'TSKB.IS', displayTicker: 'TSKB', name: 'T.S.K.B.', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'ALBRK.IS', displayTicker: 'ALBRK', name: 'Albaraka Türk', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'QNBFB.IS', displayTicker: 'QNBFB', name: 'QNB Finansbank', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'DENIZ.IS', displayTicker: 'DENIZ', name: 'Denizbank', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'SKBNK.IS', displayTicker: 'SKBNK', name: 'Şekerbank', sector: 'Banking', market: 'BIST', currency: 'TRY' },

  // Havacılık, Otomotiv, Sanayi & Holding
  { ticker: 'PGSUS.IS', displayTicker: 'PGSUS', name: 'Pegasus Hava Taşımacılığı', sector: 'Aviation', market: 'BIST', currency: 'TRY' },
  { ticker: 'TAVHL.IS', displayTicker: 'TAVHL', name: 'TAV Havalimanları', sector: 'Aviation', market: 'BIST', currency: 'TRY' },
  { ticker: 'CLEBI.IS', displayTicker: 'CLEBI', name: 'Çelebi Hava Servisi', sector: 'Aviation', market: 'BIST', currency: 'TRY' },
  { ticker: 'FROTO.IS', displayTicker: 'FROTO', name: 'Ford Otosan', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'TOASO.IS', displayTicker: 'TOASO', name: 'Tofaş Türk Otomobil', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'DOAS.IS', displayTicker: 'DOAS', name: 'Doğuş Otomotiv', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'OTKAR.IS', displayTicker: 'OTKAR', name: 'Otokar Otomotiv', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'TTRAK.IS', displayTicker: 'TTRAK', name: 'Türk Traktör', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'BFREN.IS', displayTicker: 'BFREN', name: 'Bosch Fren Sistemleri', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'EGEEN.IS', displayTicker: 'EGEEN', name: 'Ege Endüstri', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'KARSN.IS', displayTicker: 'KARSN', name: 'Karsan Otomotiv', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'SISE.IS', displayTicker: 'SISE', name: 'Şişecam', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'ENKAI.IS', displayTicker: 'ENKAI', name: 'Enka İnşaat', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'SAHOL.IS', displayTicker: 'SAHOL', name: 'Sabancı Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'AGHOL.IS', displayTicker: 'AGHOL', name: 'Anadolu Grubu Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'DOHOL.IS', displayTicker: 'DOHOL', name: 'Doğan Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'ALARK.IS', displayTicker: 'ALARK', name: 'Alarko Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'TKFEN.IS', displayTicker: 'TKFEN', name: 'Tekfen Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'GLYHO.IS', displayTicker: 'GLYHO', name: 'Global Yatırım Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'NTHOL.IS', displayTicker: 'NTHOL', name: 'Net Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'BINHO.IS', displayTicker: 'BINHO', name: '1000 Yatırımlar Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'KRDMD.IS', displayTicker: 'KRDMD', name: 'Kardemir (D)', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },
  { ticker: 'BRSAN.IS', displayTicker: 'BRSAN', name: 'Borusan Boru', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },
  { ticker: 'KCAER.IS', displayTicker: 'KCAER', name: 'Kocaer Çelik', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },
  { ticker: 'KOZAL.IS', displayTicker: 'KOZAL', name: 'Koza Altın', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },
  { ticker: 'KOZAA.IS', displayTicker: 'KOZAA', name: 'Koza Anadolu Metal', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'OYAKC.IS', displayTicker: 'OYAKC', name: 'Oyak Çimento', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'CIMSA.IS', displayTicker: 'CIMSA', name: 'Çimsa Çimento', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'KLMSN.IS', displayTicker: 'KLMSN', name: 'Klimasan Klima', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'BIENY.IS', displayTicker: 'BIENY', name: 'Bien Yapı Ürünleri', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'MPARK.IS', displayTicker: 'MPARK', name: 'MLP Sağlık', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'CEMAS.IS', displayTicker: 'CEMAS', name: 'Çemaş Döküm', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'QUAGR.IS', displayTicker: 'QUAGR', name: 'QUA Granite', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'KORDS.IS', displayTicker: 'KORDS', name: 'Kordsa Teknik Tekstil', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'VESBE.IS', displayTicker: 'VESBE', name: 'Vestel Beyaz Eşya', sector: 'Industrial', market: 'BIST', currency: 'TRY' },

  // Enerji & Yenilenebilir
  { ticker: 'ASTOR.IS', displayTicker: 'ASTOR', name: 'Astor Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'EUPWR.IS', displayTicker: 'EUPWR', name: 'Europower Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'GESAN.IS', displayTicker: 'GESAN', name: 'Girişim Elektrik', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'ALFAS.IS', displayTicker: 'ALFAS', name: 'Alfa Solar Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'CWENE.IS', displayTicker: 'CWENE', name: 'CW Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'GWIND.IS', displayTicker: 'GWIND', name: 'Galata Wind Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'AKSEN.IS', displayTicker: 'AKSEN', name: 'Aksa Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'ENJSA.IS', displayTicker: 'ENJSA', name: 'Enerjisa Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'ODAS.IS', displayTicker: 'ODAS', name: 'Odaş Elektrik', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'CANTE.IS', displayTicker: 'CANTE', name: 'Çan2 Termik', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'AYEN.IS', displayTicker: 'AYEN', name: 'Ayen Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'ZOREN.IS', displayTicker: 'ZOREN', name: 'Zorlu Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'AKFYE.IS', displayTicker: 'AKFYE', name: 'Akfen Yenilenebilir Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'BIOEN.IS', displayTicker: 'BIOEN', name: 'Biotrend Çevre ve Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'IPEKE.IS', displayTicker: 'IPEKE', name: 'İpek Doğal Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'PETKM.IS', displayTicker: 'PETKM', name: 'Petkim Petrokimya', sector: 'Energy', market: 'BIST', currency: 'TRY' },

  // Teknoloji & Savunma
  { ticker: 'KONTR.IS', displayTicker: 'KONTR', name: 'Kontrolmatik Teknoloji', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'MIATK.IS', displayTicker: 'MIATK', name: 'Mia Teknoloji', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'REEDR.IS', displayTicker: 'REEDR', name: 'Reeder Teknoloji', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'LOGO.IS', displayTicker: 'LOGO', name: 'Logo Yazılım', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'ARDYZ.IS', displayTicker: 'ARDYZ', name: 'ARD Grup Bilişim', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'INDES.IS', displayTicker: 'INDES', name: 'İndeks Bilgisayar', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'KAREL.IS', displayTicker: 'KAREL', name: 'Karel Elektronik', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'PAPIL.IS', displayTicker: 'PAPIL', name: 'Papilon Savunma', sector: 'Defense', market: 'BIST', currency: 'TRY' },
  { ticker: 'SDTTR.IS', displayTicker: 'SDTTR', name: 'SDT Uzay ve Savunma', sector: 'Defense', market: 'BIST', currency: 'TRY' },
  { ticker: 'VESTL.IS', displayTicker: 'VESTL', name: 'Vestel Elektronik', sector: 'Technology', market: 'BIST', currency: 'TRY' },

  // Perakende, Gıda & Tüketim
  { ticker: 'MGROS.IS', displayTicker: 'MGROS', name: 'Migros Ticaret', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'SOKM.IS', displayTicker: 'SOKM', name: 'Şok Marketler', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'CCOLA.IS', displayTicker: 'CCOLA', name: 'Coca-Cola İçecek', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'ULKER.IS', displayTicker: 'ULKER', name: 'Ülker Bisküvi', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'MAVI.IS', displayTicker: 'MAVI', name: 'Mavi Giyim', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'TABGD.IS', displayTicker: 'TABGD', name: 'Tab Gıda', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'AEFES.IS', displayTicker: 'AEFES', name: 'Anadolu Efes', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'KRVGD.IS', displayTicker: 'KRVGD', name: 'Kervan Gıda', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'BANVT.IS', displayTicker: 'BANVT', name: 'Banvit', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'TKNSA.IS', displayTicker: 'TKNSA', name: 'Teknosa', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'ARCLK.IS', displayTicker: 'ARCLK', name: 'Arçelik A.Ş.', sector: 'Industrial', market: 'BIST', currency: 'TRY' },

  // Kimya, GYO, Telekom & Sigorta
  { ticker: 'SASA.IS', displayTicker: 'SASA', name: 'Sasa Polyester', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'HEKTS.IS', displayTicker: 'HEKTS', name: 'Hektaş Ticaret', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'GUBRF.IS', displayTicker: 'GUBRF', name: 'Gübre Fabrikaları', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'EKGYO.IS', displayTicker: 'EKGYO', name: 'Emlak Konut GYO', sector: 'RealEstate', market: 'BIST', currency: 'TRY' },
  { ticker: 'ISGYO.IS', displayTicker: 'ISGYO', name: 'İş GYO', sector: 'RealEstate', market: 'BIST', currency: 'TRY' },
  { ticker: 'ENERY.IS', displayTicker: 'ENERY', name: 'Enerya Enerji', sector: 'RealEstate', market: 'BIST', currency: 'TRY' },
  { ticker: 'TRGYO.IS', displayTicker: 'TRGYO', name: 'Torunlar GYO', sector: 'RealEstate', market: 'BIST', currency: 'TRY' },
  { ticker: 'SNGYO.IS', displayTicker: 'SNGYO', name: 'Sinpaş GYO', sector: 'RealEstate', market: 'BIST', currency: 'TRY' },
  { ticker: 'TTKOM.IS', displayTicker: 'TTKOM', name: 'Türk Telekom', sector: 'Telekom', market: 'BIST', currency: 'TRY' },
  { ticker: 'TCELL.IS', displayTicker: 'TCELL', name: 'Turkcell İletişim', sector: 'Telekom', market: 'BIST', currency: 'TRY' },
  { ticker: 'TURSG.IS', displayTicker: 'TURSG', name: 'Türkiye Sigorta', sector: 'Banking', market: 'BIST', currency: 'TRY' }
];

export const COMBINED_UNIVERSE = [...US_UNIVERSE, ...BIST_UNIVERSE];

export async function fetchStockCandles(ticker: string, range: string = '6mo'): Promise<Candle[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=${range}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${ticker}: status ${res.status}`);
    }

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      return [];
    }

    const timestamps: number[] = result.timestamp;
    const quote = result.indicators.quote[0];
    const opens = quote.open || [];
    const highs = quote.high || [];
    const lows = quote.low || [];
    const closes = quote.close || [];
    const volumes = quote.volume || [];

    const candles: Candle[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (
        closes[i] !== null &&
        opens[i] !== null &&
        highs[i] !== null &&
        lows[i] !== null &&
        !isNaN(closes[i])
      ) {
        const dateStr = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
        candles.push({
          date: dateStr,
          open: Number(Number(opens[i]).toFixed(2)),
          high: Number(Number(highs[i]).toFixed(2)),
          low: Number(Number(lows[i]).toFixed(2)),
          close: Number(Number(closes[i]).toFixed(2)),
          volume: Number(volumes[i] || 0)
        });
      }
    }

    return candles;
  } catch (error) {
    console.error(`Error fetching candles for ${ticker}:`, error);
    return [];
  }
}

export function calculateEMA(data: number[], period: number): number[] {
  if (data.length === 0) return [];
  const k = 2 / (period + 1);
  const emaArray: number[] = new Array(data.length);
  
  let initialSum = 0;
  const seedPeriod = Math.min(period, data.length);
  for (let i = 0; i < seedPeriod; i++) {
    initialSum += data[i];
  }
  let prevEMA = initialSum / seedPeriod;
  emaArray[seedPeriod - 1] = prevEMA;

  for (let i = seedPeriod; i < data.length; i++) {
    prevEMA = data[i] * k + prevEMA * (1 - k);
    emaArray[i] = prevEMA;
  }

  return emaArray;
}

export function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) {
      gains += diff;
    } else {
      losses -= diff;
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Number((100 - (100 / (1 + rs))).toFixed(1));
}

export function calculateATR(candles: Candle[], period: number = 14): number {
  if (candles.length < 2) return 0;
  const trueRanges: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }

  const recentTRs = trueRanges.slice(-period);
  const sum = recentTRs.reduce((acc, val) => acc + val, 0);
  return Number((sum / recentTRs.length).toFixed(2));
}

export function calculateTechnicals(candles: Candle[]): TechnicalIndicators | null {
  if (candles.length < 35) return null;

  const closes = candles.map(c => c.close);
  const volumes = candles.map(c => c.volume);
  const len = candles.length;
  const latestCandle = candles[len - 1];
  const prevCandle = candles[len - 2];

  const price = latestCandle.close;
  const change = Number((price - prevCandle.close).toFixed(2));
  const changePercent = Number(((change / prevCandle.close) * 100).toFixed(2));

  const ema9Series = calculateEMA(closes, 9);
  const ema20Series = calculateEMA(closes, 20);
  const ema50Series = calculateEMA(closes, 50);
  const ema200Series = calculateEMA(closes, 200);

  const ema9 = Number(ema9Series[len - 1]?.toFixed(2) || price);
  const ema20 = Number(ema20Series[len - 1]?.toFixed(2) || price);
  const ema50 = Number(ema50Series[len - 1]?.toFixed(2) || price);
  const ema200 = Number((ema200Series[len - 1] || ema50Series[len - 1])?.toFixed(2) || price);

  const rsi14 = calculateRSI(closes, 14);
  const atr14 = calculateATR(candles, 14);
  const atrPercent = Number(((atr14 / price) * 100).toFixed(2));

  const recentVols = volumes.slice(-21, -1);
  const avgVolume20 = Math.round(
    recentVols.reduce((sum, v) => sum + v, 0) / Math.max(recentVols.length, 1)
  );
  const rvol = avgVolume20 > 0 ? Number((latestCandle.volume / avgVolume20).toFixed(2)) : 1.0;

  const recentHighs = candles.slice(-21, -1).map(c => c.high);
  const recentLows = candles.slice(-21, -1).map(c => c.low);
  const high20 = Number(Math.max(...recentHighs).toFixed(2));
  const low20 = Number(Math.min(...recentLows).toFixed(2));

  return {
    price,
    change,
    changePercent,
    volume: latestCandle.volume,
    avgVolume20,
    rvol,
    ema9,
    ema20,
    ema50,
    ema200,
    rsi14,
    atr14,
    atrPercent,
    high20,
    low20
  };
}

export async function fetchMarketRegime(market: MarketType): Promise<MarketRegime> {
  const indexTicker = market === 'BIST' ? 'THYAO.IS' : 'SPY';
  const candles = await fetchStockCandles(indexTicker, '6mo');
  const tech = calculateTechnicals(candles);

  if (!tech) {
    return {
      market,
      ticker: indexTicker,
      price: 0,
      ema50: 0,
      trend: 'NEUTRAL',
      changePercent: 0,
      rsi14: 50,
      allowNewBuys: true,
      reason: 'Piyasa fırsat taraması aktif.'
    };
  }

  // Softened regime: Allow trading always unless severe crash (RSI < 25)
  const isBullish = tech.price >= tech.ema50;
  const isSevereCrash = tech.rsi14 < 25;

  return {
    market,
    ticker: indexTicker,
    price: tech.price,
    ema50: tech.ema50,
    trend: isBullish ? 'BULLISH' : 'NEUTRAL',
    changePercent: tech.changePercent,
    rsi14: tech.rsi14,
    allowNewBuys: !isSevereCrash, // Always allow high-potential individual stocks
    reason: isBullish
      ? `Genel Piyasa (${indexTicker}) pozitif trendde. Fırsatlar taranıyor.`
      : `Piyasa konsolidasyonda. Güçlü hisselerde seçici alımlar serbest.`
  };
}

export async function scanUniverse(marketFilter: 'ALL' | 'US' | 'BIST' = 'ALL'): Promise<StockScanResult[]> {
  // 1. Base Universe
  let baseUniverse = marketFilter === 'US' 
    ? [...US_UNIVERSE]
    : marketFilter === 'BIST' 
    ? [...BIST_UNIVERSE]
    : [...COMBINED_UNIVERSE];

  // 2. Fetch & Merge Custom Stocks if configured
  try {
    const { isSupabaseConfigured, supabase } = await import('./supabaseClient');
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('portfolio_state')
        .select('state')
        .eq('id', 'custom_stocks')
        .single();
      if (data && data.state && Array.isArray(data.state)) {
        const customList = data.state as UniverseItem[];
        for (const item of customList) {
          if (marketFilter === 'ALL' || item.market === marketFilter) {
            if (!baseUniverse.some(u => u.ticker === item.ticker)) {
              baseUniverse.push(item);
            }
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }

  const targetUniverse = baseUniverse;
  const results: StockScanResult[] = [];
  const chunkSize = 15;

  for (let i = 0; i < targetUniverse.length; i += chunkSize) {
    const chunk = targetUniverse.slice(i, i + chunkSize);
    const promises = chunk.map(async (item) => {
      const candles = await fetchStockCandles(item.ticker, '6mo');
      const technicals = calculateTechnicals(candles);
      if (!technicals) return null;

      const signal = evaluateSignal(item.ticker, item.displayTicker, item.sector, item.market, item.currency, technicals, candles);
      return {
        ticker: item.ticker,
        displayTicker: item.displayTicker,
        name: item.name,
        sector: item.sector,
        market: item.market,
        currency: item.currency,
        technicals,
        signal
      };
    });

    const chunkResults = await Promise.all(promises);
    for (const res of chunkResults) {
      if (res) results.push(res);
    }
  }

  return results;
}
