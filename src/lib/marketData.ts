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

// 🇹🇷 140 SEÇKİN & LİKİT BIST HİSSESİ
export const BIST_UNIVERSE: UniverseItem[] = [
  // Bankacılık & Finans
  { ticker: 'GARAN.IS', displayTicker: 'GARAN', name: 'Garanti BBVA', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'AKBNK.IS', displayTicker: 'AKBNK', name: 'Akbank', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'ISCTR.IS', displayTicker: 'ISCTR', name: 'İş Bankası (C)', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'YKBNK.IS', displayTicker: 'YKBNK', name: 'Yapı Kredi', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'VAKBN.IS', displayTicker: 'VAKBN', name: 'Vakıfbank', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'HALKB.IS', displayTicker: 'HALKB', name: 'Halkbank', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'TSKB.IS', displayTicker: 'TSKB', name: 'T.S.K.B.', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'ALBRK.IS', displayTicker: 'ALBRK', name: 'Albaraka Türk', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'SKBNK.IS', displayTicker: 'SKBNK', name: 'Şekerbank', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'ISMEN.IS', displayTicker: 'ISMEN', name: 'İş Yatırım Menkul', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'OYYAT.IS', displayTicker: 'OYYAT', name: 'Oyak Yatırım', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'GEDIK.IS', displayTicker: 'GEDIK', name: 'Gedik Yatırım', sector: 'Banking', market: 'BIST', currency: 'TRY' },
  { ticker: 'INFO.IS', displayTicker: 'INFO', name: 'İnfo Yatırım', sector: 'Banking', market: 'BIST', currency: 'TRY' },

  // Havacılık & Ulaştırma
  { ticker: 'THYAO.IS', displayTicker: 'THYAO', name: 'Türk Hava Yolları', sector: 'Aviation', market: 'BIST', currency: 'TRY' },
  { ticker: 'PGSUS.IS', displayTicker: 'PGSUS', name: 'Pegasus Hava Taşımacılığı', sector: 'Aviation', market: 'BIST', currency: 'TRY' },
  { ticker: 'TAVHL.IS', displayTicker: 'TAVHL', name: 'TAV Havalimanları', sector: 'Aviation', market: 'BIST', currency: 'TRY' },
  { ticker: 'CLEBI.IS', displayTicker: 'CLEBI', name: 'Çelebi Hava Servisi', sector: 'Aviation', market: 'BIST', currency: 'TRY' },

  // Holdingler & Yatırım
  { ticker: 'KCHOL.IS', displayTicker: 'KCHOL', name: 'Koç Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'SAHOL.IS', displayTicker: 'SAHOL', name: 'Sabancı Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'SISE.IS', displayTicker: 'SISE', name: 'Şişecam', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'ENKAI.IS', displayTicker: 'ENKAI', name: 'Enka İnşaat', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'ALARK.IS', displayTicker: 'ALARK', name: 'Alarko Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'TKFEN.IS', displayTicker: 'TKFEN', name: 'Tekfen Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'DOHOL.IS', displayTicker: 'DOHOL', name: 'Doğan Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'AGHOL.IS', displayTicker: 'AGHOL', name: 'Anadolu Grubu Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'GLYHO.IS', displayTicker: 'GLYHO', name: 'Global Yatırım Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'INVES.IS', displayTicker: 'INVES', name: 'Investco Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'GSDHO.IS', displayTicker: 'GSDHO', name: 'GSD Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },

  // Enerji & Petrol & Kimya
  { ticker: 'TUPRS.IS', displayTicker: 'TUPRS', name: 'Tüpraş', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'PETKM.IS', displayTicker: 'PETKM', name: 'Petkim', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'SASA.IS', displayTicker: 'SASA', name: 'SASA Polyester', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'HEKTS.IS', displayTicker: 'HEKTS', name: 'Hektaş', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'ASTOR.IS', displayTicker: 'ASTOR', name: 'Astor Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'EUPWR.IS', displayTicker: 'EUPWR', name: 'Europower Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'CWENE.IS', displayTicker: 'CWENE', name: 'CW Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'ALFAS.IS', displayTicker: 'ALFAS', name: 'Alfa Solar Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'ENJSA.IS', displayTicker: 'ENJSA', name: 'Enerjisa Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'AKSA.IS', displayTicker: 'AKSA', name: 'Aksa Akrilik', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'AKSEN.IS', displayTicker: 'AKSEN', name: 'Aksa Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'AYDEM.IS', displayTicker: 'AYDEM', name: 'Aydem Yenilenebilir', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'GWIND.IS', displayTicker: 'GWIND', name: 'Galata Wind Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'ODAS.IS', displayTicker: 'ODAS', name: 'Odaş Elektrik', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'ZOREN.IS', displayTicker: 'ZOREN', name: 'Zorlu Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'CANTE.IS', displayTicker: 'CANTE', name: 'Çan2 Termik', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'BIOEN.IS', displayTicker: 'BIOEN', name: 'Biotrend Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'ENERY.IS', displayTicker: 'ENERY', name: 'Enerya Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'AHGAZ.IS', displayTicker: 'AHGAZ', name: 'Ahlatcı Doğal Gaz', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'MAGEN.IS', displayTicker: 'MAGEN', name: 'Margün Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'ESEN.IS', displayTicker: 'ESEN', name: 'Esenboğa Elektrik', sector: 'Energy', market: 'BIST', currency: 'TRY' },

  // Otomotiv & Sanayi
  { ticker: 'FROTO.IS', displayTicker: 'FROTO', name: 'Ford Otosan', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'TOASO.IS', displayTicker: 'TOASO', name: 'Tofaş Oto Fabrikaları', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'DOAS.IS', displayTicker: 'DOAS', name: 'Doğuş Otomotiv', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'TTRAK.IS', displayTicker: 'TTRAK', name: 'Türk Traktör', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'OTKAR.IS', displayTicker: 'OTKAR', name: 'Otokar', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'BFREN.IS', displayTicker: 'BFREN', name: 'Bosch Fren Sistemleri', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'EGEEN.IS', displayTicker: 'EGEEN', name: 'Ege Endüstri', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'BRISA.IS', displayTicker: 'BRISA', name: 'Brisa Lastik', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'KARSN.IS', displayTicker: 'KARSN', name: 'Karsan Otomotiv', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'TMSN.IS', displayTicker: 'TMSN', name: 'Tümosan Motor', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
  { ticker: 'ARCLK.IS', displayTicker: 'ARCLK', name: 'Arçelik', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'VESBE.IS', displayTicker: 'VESBE', name: 'Vestel Beyaz Eşya', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'VESTL.IS', displayTicker: 'VESTL', name: 'Vestel Elektronik', sector: 'Industrial', market: 'BIST', currency: 'TRY' },

  // Savunma & Teknoloji & Yazılım
  { ticker: 'ASELS.IS', displayTicker: 'ASELS', name: 'Aselsan', sector: 'Defense', market: 'BIST', currency: 'TRY' },
  { ticker: 'KAREL.IS', displayTicker: 'KAREL', name: 'Karel Elektronik', sector: 'Defense', market: 'BIST', currency: 'TRY' },
  { ticker: 'SDTTR.IS', displayTicker: 'SDTTR', name: 'SDT Uzay ve Savunma', sector: 'Defense', market: 'BIST', currency: 'TRY' },
  { ticker: 'PAPIL.IS', displayTicker: 'PAPIL', name: 'Papilon Savunma', sector: 'Defense', market: 'BIST', currency: 'TRY' },
  { ticker: 'MIATK.IS', displayTicker: 'MIATK', name: 'Mia Teknoloji', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'REEDR.IS', displayTicker: 'REEDR', name: 'Reeder Teknoloji', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'AGROT.IS', displayTicker: 'AGROT', name: 'Agrotech Yüksek Teknoloji', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'ARDYZ.IS', displayTicker: 'ARDYZ', name: 'ARD Bilişim', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'LOGO.IS', displayTicker: 'LOGO', name: 'Logo Yazılım', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'KONTR.IS', displayTicker: 'KONTR', name: 'Kontrolmatik Teknoloji', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'YEOTK.IS', displayTicker: 'YEOTK', name: 'YEO Teknoloji', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'SMRTG.IS', displayTicker: 'SMRTG', name: 'Smart Güneş Enerjisi', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'INDES.IS', displayTicker: 'INDES', name: 'İndeks Bilgisayar', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'TCELL.IS', displayTicker: 'TCELL', name: 'Turkcell', sector: 'Telekom', market: 'BIST', currency: 'TRY' },
  { ticker: 'TTKOM.IS', displayTicker: 'TTKOM', name: 'Türk Telekom', sector: 'Telekom', market: 'BIST', currency: 'TRY' },

  // Madencilik & Demir Çelik & Metal
  { ticker: 'EREGL.IS', displayTicker: 'EREGL', name: 'Ereğli Demir Çelik', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },
  { ticker: 'KRDMD.IS', displayTicker: 'KRDMD', name: 'Kardemir (D)', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },
  { ticker: 'KOZAL.IS', displayTicker: 'KOZAL', name: 'Koza Altın', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },
  { ticker: 'KOZAA.IS', displayTicker: 'KOZAA', name: 'Koza Anadolu Madencilik', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },
  { ticker: 'IPEKE.IS', displayTicker: 'IPEKE', name: 'İpek Doğal Enerji', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },
  { ticker: 'CVKMD.IS', displayTicker: 'CVKMD', name: 'CVK Madencilik', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },
  { ticker: 'KCAER.IS', displayTicker: 'KCAER', name: 'Kocaer Çelik', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },
  { ticker: 'BRSAN.IS', displayTicker: 'BRSAN', name: 'Borusan Boru', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },
  { ticker: 'CEMTS.IS', displayTicker: 'CEMTS', name: 'Çemtaş Çelik', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },
  { ticker: 'SARKY.IS', displayTicker: 'SARKY', name: 'Sarkuysan Elektrolitik', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },

  // Perakende & Gıda & İçecek
  { ticker: 'BIMAS.IS', displayTicker: 'BIMAS', name: 'BİM Mağazalar', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'MGROS.IS', displayTicker: 'MGROS', name: 'Migros Ticaret', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'SOKM.IS', displayTicker: 'SOKM', name: 'Şok Marketler', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'CCOLA.IS', displayTicker: 'CCOLA', name: 'Coca-Cola İçecek', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'AEFES.IS', displayTicker: 'AEFES', name: 'Anadolu Efes', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'TABGD.IS', displayTicker: 'TABGD', name: 'TAB Gıda', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'EBEBK.IS', displayTicker: 'EBEBK', name: 'Ebebek Mağazacılık', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'MAVI.IS', displayTicker: 'MAVI', name: 'Mavi Giyim', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'VAKKO.IS', displayTicker: 'VAKKO', name: 'Vakko Tekstil', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'GOKNR.IS', displayTicker: 'GOKNR', name: 'Göknur Gıda', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'TATGD.IS', displayTicker: 'TATGD', name: 'Tat Gıda', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'TUKAS.IS', displayTicker: 'TUKAS', name: 'Tukaş Gıda', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'ULUUN.IS', displayTicker: 'ULUUN', name: 'Ulusoy Un', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'GUBRF.IS', displayTicker: 'GUBRF', name: 'Gübre Fabrikaları', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'KMPUR.IS', displayTicker: 'KMPUR', name: 'Kimteks Poliüretan', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'KORDS.IS', displayTicker: 'KORDS', name: 'Kordsa Teknik Tekstil', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'YUNSA.IS', displayTicker: 'YUNSA', name: 'Yünsa', sector: 'Industrial', market: 'BIST', currency: 'TRY' },

  // Sağlık & İlaç
  { ticker: 'MPARK.IS', displayTicker: 'MPARK', name: 'MLP Sağlık (Medical Park)', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'GENIL.IS', displayTicker: 'GENIL', name: 'Gen İlaç', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'ECILC.IS', displayTicker: 'ECILC', name: 'Eczacıbaşı İlaç', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'DEVA.IS', displayTicker: 'DEVA', name: 'Deva Holding', sector: 'Technology', market: 'BIST', currency: 'TRY' },

  // Gayrimenkul & Çimento & Yapı
  { ticker: 'EKGYO.IS', displayTicker: 'EKGYO', name: 'Emlak Konut GYO', sector: 'RealEstate', market: 'BIST', currency: 'TRY' },
  { ticker: 'ISGYO.IS', displayTicker: 'ISGYO', name: 'İş GYO', sector: 'RealEstate', market: 'BIST', currency: 'TRY' },
  { ticker: 'TRGYO.IS', displayTicker: 'TRGYO', name: 'Torunlar GYO', sector: 'RealEstate', market: 'BIST', currency: 'TRY' },
  { ticker: 'ZRGYO.IS', displayTicker: 'ZRGYO', name: 'Ziraat GYO', sector: 'RealEstate', market: 'BIST', currency: 'TRY' },
  { ticker: 'PSGYO.IS', displayTicker: 'PSGYO', name: 'Pasifik GYO', sector: 'RealEstate', market: 'BIST', currency: 'TRY' },
  { ticker: 'QUAGR.IS', displayTicker: 'QUAGR', name: 'QUA Granite', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'BIENY.IS', displayTicker: 'BIENY', name: 'Bien Yapı Ürünleri', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'KALES.IS', displayTicker: 'KALES', name: 'Kale Seramik', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'CIMSA.IS', displayTicker: 'CIMSA', name: 'Çimsa Çimento', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'AKCNS.IS', displayTicker: 'AKCNS', name: 'Akçansa Çimento', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'OYAKC.IS', displayTicker: 'OYAKC', name: 'Oyak Çimento', sector: 'Industrial', market: 'BIST', currency: 'TRY' }
];

// 🇺🇸 340+ SEÇKİN & KURUMSAL ABD S&P 500 / NASDAQ 100 HİSSESİ (TÜM GICS SEKTÖRLERİ)
export const US_UNIVERSE: UniverseItem[] = [
  // 1. Mega-Cap Tech & AI
  { ticker: 'NVDA', displayTicker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'AAPL', displayTicker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'MSFT', displayTicker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'AMZN', displayTicker: 'AMZN', name: 'Amazon.com, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'GOOGL', displayTicker: 'GOOGL', name: 'Alphabet Inc. (Class A)', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'GOOG', displayTicker: 'GOOG', name: 'Alphabet Inc. (Class C)', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'META', displayTicker: 'META', name: 'Meta Platforms, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'TSLA', displayTicker: 'TSLA', name: 'Tesla, Inc.', sector: 'Automotive', market: 'US', currency: 'USD' },
  { ticker: 'AVGO', displayTicker: 'AVGO', name: 'Broadcom Inc.', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'ORCL', displayTicker: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'NFLX', displayTicker: 'NFLX', name: 'Netflix, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'PLTR', displayTicker: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', market: 'US', currency: 'USD' },

  // 2. Semiconductors & Equipment (Gelişmiş Yarı İletken Havuzu)
  { ticker: 'AMD', displayTicker: 'AMD', name: 'Advanced Micro Devices', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'TSM', displayTicker: 'TSM', name: 'Taiwan Semiconductor', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'QCOM', displayTicker: 'QCOM', name: 'Qualcomm Inc.', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'TXN', displayTicker: 'TXN', name: 'Texas Instruments', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'INTC', displayTicker: 'INTC', name: 'Intel Corporation', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'MU', displayTicker: 'MU', name: 'Micron Technology', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'AMAT', displayTicker: 'AMAT', name: 'Applied Materials', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'LRCX', displayTicker: 'LRCX', name: 'Lam Research', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'ADI', displayTicker: 'ADI', name: 'Analog Devices', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'KLAC', displayTicker: 'KLAC', name: 'KLA Corporation', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'MRVL', displayTicker: 'MRVL', name: 'Marvell Technology', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'ASML', displayTicker: 'ASML', name: 'ASML Holding N.V.', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'ARM', displayTicker: 'ARM', name: 'Arm Holdings plc', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'NXPI', displayTicker: 'NXPI', name: 'NXP Semiconductors', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'ON', displayTicker: 'ON', name: 'ON Semiconductor', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'MPWR', displayTicker: 'MPWR', name: 'Monolithic Power', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'TER', displayTicker: 'TER', name: 'Teradyne, Inc.', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'MCHP', displayTicker: 'MCHP', name: 'Microchip Technology', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'SWKS', displayTicker: 'SWKS', name: 'Skyworks Solutions', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'QRVO', displayTicker: 'QRVO', name: 'Qorvo, Inc.', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'ENTG', displayTicker: 'ENTG', name: 'Entegris, Inc.', sector: 'Semiconductors', market: 'US', currency: 'USD' },
  { ticker: 'WDC', displayTicker: 'WDC', name: 'Western Digital', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'STX', displayTicker: 'STX', name: 'Seagate Technology', sector: 'Technology', market: 'US', currency: 'USD' },

  // 3. Software, Cloud & Cybersecurity (Genişletilmiş SaaS)
  { ticker: 'CRM', displayTicker: 'CRM', name: 'Salesforce, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'ADBE', displayTicker: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'NOW', displayTicker: 'NOW', name: 'ServiceNow, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'INTU', displayTicker: 'INTU', name: 'Intuit Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'IBM', displayTicker: 'IBM', name: 'IBM Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'SNOW', displayTicker: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'WDAY', displayTicker: 'WDAY', name: 'Workday, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'PANW', displayTicker: 'PANW', name: 'Palo Alto Networks', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'CRWD', displayTicker: 'CRWD', name: 'CrowdStrike Holdings', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'FTNT', displayTicker: 'FTNT', name: 'Fortinet, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'DDOG', displayTicker: 'DDOG', name: 'Datadog, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'NET', displayTicker: 'NET', name: 'Cloudflare, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'ZS', displayTicker: 'ZS', name: 'Zscaler, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'MDB', displayTicker: 'MDB', name: 'MongoDB, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'TEAM', displayTicker: 'TEAM', name: 'Atlassian Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'SPLK', displayTicker: 'SPLK', name: 'Splunk Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'APP', displayTicker: 'APP', name: 'AppLovin Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'ANET', displayTicker: 'ANET', name: 'Arista Networks', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'HUBS', displayTicker: 'HUBS', name: 'HubSpot, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'SNPS', displayTicker: 'SNPS', name: 'Synopsys, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'CDNS', displayTicker: 'CDNS', name: 'Cadence Design Systems', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'PATH', displayTicker: 'PATH', name: 'UiPath Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'MNDY', displayTicker: 'MNDY', name: 'monday.com Ltd.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'DELL', displayTicker: 'DELL', name: 'Dell Technologies', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'HPQ', displayTicker: 'HPQ', name: 'HP Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'SMCI', displayTicker: 'SMCI', name: 'Super Micro Computer', sector: 'Technology', market: 'US', currency: 'USD' },

  // 4. Finance, Banking & Fintech (Geniş Finans Havuzu)
  { ticker: 'JPM', displayTicker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'BAC', displayTicker: 'BAC', name: 'Bank of America', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'WFC', displayTicker: 'WFC', name: 'Wells Fargo & Co.', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'C', displayTicker: 'C', name: 'Citigroup Inc.', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'GS', displayTicker: 'GS', name: 'Goldman Sachs Group', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'MS', displayTicker: 'MS', name: 'Morgan Stanley', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'BLK', displayTicker: 'BLK', name: 'BlackRock, Inc.', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'SCHW', displayTicker: 'SCHW', name: 'Charles Schwab Corp.', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'BRK-B', displayTicker: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'V', displayTicker: 'V', name: 'Visa Inc.', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'MA', displayTicker: 'MA', name: 'Mastercard Inc.', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'AXP', displayTicker: 'AXP', name: 'American Express', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'PYPL', displayTicker: 'PYPL', name: 'PayPal Holdings', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'SQ', displayTicker: 'SQ', name: 'Block, Inc.', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'COIN', displayTicker: 'COIN', name: 'Coinbase Global', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'HOOD', displayTicker: 'HOOD', name: 'Robinhood Markets', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'MSTR', displayTicker: 'MSTR', name: 'MicroStrategy Inc.', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'SOFI', displayTicker: 'SOFI', name: 'SoFi Technologies', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'AFRM', displayTicker: 'AFRM', name: 'Affirm Holdings', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'MARA', displayTicker: 'MARA', name: 'MARA Holdings', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'RIOT', displayTicker: 'RIOT', name: 'Riot Platforms', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'CLSK', displayTicker: 'CLSK', name: 'CleanSpark, Inc.', sector: 'Crypto/Fintech', market: 'US', currency: 'USD' },
  { ticker: 'CME', displayTicker: 'CME', name: 'CME Group Inc.', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'ICE', displayTicker: 'ICE', name: 'Intercontinental Exchange', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'SPGI', displayTicker: 'SPGI', name: 'S&P Global Inc.', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'MCO', displayTicker: 'MCO', name: 'Moody\'s Corporation', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'PGR', displayTicker: 'PGR', name: 'Progressive Corporation', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'TRV', displayTicker: 'TRV', name: 'The Travelers Companies', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'CB', displayTicker: 'CB', name: 'Chubb Limited', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'MET', displayTicker: 'MET', name: 'MetLife, Inc.', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'PRU', displayTicker: 'PRU', name: 'Prudential Financial', sector: 'Banking', market: 'US', currency: 'USD' },

  // 5. Healthcare, Pharma & Biotech (Büyük Sağlık Havuzu)
  { ticker: 'LLY', displayTicker: 'LLY', name: 'Eli Lilly and Company', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'UNH', displayTicker: 'UNH', name: 'UnitedHealth Group', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'JNJ', displayTicker: 'JNJ', name: 'Johnson & Johnson', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'ABBV', displayTicker: 'ABBV', name: 'AbbVie Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'MRK', displayTicker: 'MRK', name: 'Merck & Co., Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'PFE', displayTicker: 'PFE', name: 'Pfizer Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'AMGN', displayTicker: 'AMGN', name: 'Amgen Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'TMO', displayTicker: 'TMO', name: 'Thermo Fisher Scientific', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'ABT', displayTicker: 'ABT', name: 'Abbott Laboratories', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'DHR', displayTicker: 'DHR', name: 'Danaher Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'BMY', displayTicker: 'BMY', name: 'Bristol-Myers Squibb', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'ISRG', displayTicker: 'ISRG', name: 'Intuitive Surgical', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'GILD', displayTicker: 'GILD', name: 'Gilead Sciences', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'VRTX', displayTicker: 'VRTX', name: 'Vertex Pharmaceuticals', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'REGN', displayTicker: 'REGN', name: 'Regeneron Pharmaceuticals', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'MDT', displayTicker: 'MDT', name: 'Medtronic plc', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'SYK', displayTicker: 'SYK', name: 'Stryker Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'ELV', displayTicker: 'ELV', name: 'Elevance Health', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'CI', displayTicker: 'CI', name: 'The Cigna Group', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'CVS', displayTicker: 'CVS', name: 'CVS Health Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'HUM', displayTicker: 'HUM', name: 'Humana Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'BDX', displayTicker: 'BDX', name: 'Becton, Dickinson and Co.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'BSX', displayTicker: 'BSX', name: 'Boston Scientific Corp.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'ZTS', displayTicker: 'ZTS', name: 'Zoetis Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'MCK', displayTicker: 'MCK', name: 'McKesson Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'COR', displayTicker: 'COR', name: 'Cencora, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'CAH', displayTicker: 'CAH', name: 'Cardinal Health, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'EW', displayTicker: 'EW', name: 'Edwards Lifesciences', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'DXCM', displayTicker: 'DXCM', name: 'DexCom, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'IDXX', displayTicker: 'IDXX', name: 'IDEXX Laboratories', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'HIMS', displayTicker: 'HIMS', name: 'Hims & Hers Health', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'MRNA', displayTicker: 'MRNA', name: 'Moderna, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'BIIB', displayTicker: 'BIIB', name: 'Biogen Inc.', sector: 'Technology', market: 'US', currency: 'USD' },

  // 6. Industrials, Aerospace & Defense (Sanayi & Savunma)
  { ticker: 'BA', displayTicker: 'BA', name: 'Boeing Company', sector: 'Defense', market: 'US', currency: 'USD' },
  { ticker: 'LMT', displayTicker: 'LMT', name: 'Lockheed Martin', sector: 'Defense', market: 'US', currency: 'USD' },
  { ticker: 'RTX', displayTicker: 'RTX', name: 'RTX Corporation', sector: 'Defense', market: 'US', currency: 'USD' },
  { ticker: 'NOC', displayTicker: 'NOC', name: 'Northrop Grumman', sector: 'Defense', market: 'US', currency: 'USD' },
  { ticker: 'GD', displayTicker: 'GD', name: 'General Dynamics', sector: 'Defense', market: 'US', currency: 'USD' },
  { ticker: 'LHX', displayTicker: 'LHX', name: 'L3Harris Technologies', sector: 'Defense', market: 'US', currency: 'USD' },
  { ticker: 'AXON', displayTicker: 'AXON', name: 'Axon Enterprise', sector: 'Defense', market: 'US', currency: 'USD' },
  { ticker: 'HWM', displayTicker: 'HWM', name: 'Howmet Aerospace', sector: 'Defense', market: 'US', currency: 'USD' },
  { ticker: 'TDG', displayTicker: 'TDG', name: 'TransDigm Group', sector: 'Defense', market: 'US', currency: 'USD' },
  { ticker: 'GE', displayTicker: 'GE', name: 'GE Aerospace', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'CAT', displayTicker: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'DE', displayTicker: 'DE', name: 'Deere & Company', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'HON', displayTicker: 'HON', name: 'Honeywell International', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'UNP', displayTicker: 'UNP', name: 'Union Pacific Corp.', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'UPS', displayTicker: 'UPS', name: 'United Parcel Service', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'FDX', displayTicker: 'FDX', name: 'FedEx Corporation', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'EMR', displayTicker: 'EMR', name: 'Emerson Electric Co.', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'ETN', displayTicker: 'ETN', name: 'Eaton Corporation plc', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'ITW', displayTicker: 'ITW', name: 'Illinois Tool Works', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'PH', displayTicker: 'PH', name: 'Parker-Hannifin Corp.', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'WM', displayTicker: 'WM', name: 'Waste Management, Inc.', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'RSG', displayTicker: 'RSG', name: 'Republic Services, Inc.', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'CSX', displayTicker: 'CSX', name: 'CSX Corporation', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'NSC', displayTicker: 'NSC', name: 'Norfolk Southern Corp.', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'PCAR', displayTicker: 'PCAR', name: 'PACCAR Inc', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'CMI', displayTicker: 'CMI', name: 'Cummins Inc.', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'PWR', displayTicker: 'PWR', name: 'Quanta Services, Inc.', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'URI', displayTicker: 'URI', name: 'United Rentals, Inc.', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'FAST', displayTicker: 'FAST', name: 'Fastenal Company', sector: 'Industrial', market: 'US', currency: 'USD' },

  // 7. Energy & Materials (Enerji & Emtia Devleri)
  { ticker: 'XOM', displayTicker: 'XOM', name: 'Exxon Mobil Corp.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'CVX', displayTicker: 'CVX', name: 'Chevron Corporation', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'COP', displayTicker: 'COP', name: 'ConocoPhillips', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'SLB', displayTicker: 'SLB', name: 'Schlumberger N.V.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'EOG', displayTicker: 'EOG', name: 'EOG Resources', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'OXY', displayTicker: 'OXY', name: 'Occidental Petroleum', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'MPC', displayTicker: 'MPC', name: 'Marathon Petroleum', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'PSX', displayTicker: 'PSX', name: 'Phillips 66', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'VLO', displayTicker: 'VLO', name: 'Valero Energy Corp.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'KMI', displayTicker: 'KMI', name: 'Kinder Morgan, Inc.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'WMB', displayTicker: 'WMB', name: 'Williams Companies', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'BKR', displayTicker: 'BKR', name: 'Baker Hughes Company', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'HAL', displayTicker: 'HAL', name: 'Halliburton Company', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'DVN', displayTicker: 'DVN', name: 'Devon Energy Corp.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'LIN', displayTicker: 'LIN', name: 'Linde plc', sector: 'Mining/Metals', market: 'US', currency: 'USD' },
  { ticker: 'SHW', displayTicker: 'SHW', name: 'Sherwin-Williams Company', sector: 'Mining/Metals', market: 'US', currency: 'USD' },
  { ticker: 'FCX', displayTicker: 'FCX', name: 'Freeport-McMoRan Inc.', sector: 'Mining/Metals', market: 'US', currency: 'USD' },
  { ticker: 'NEM', displayTicker: 'NEM', name: 'Newmont Corporation', sector: 'Mining/Metals', market: 'US', currency: 'USD' },
  { ticker: 'NUE', displayTicker: 'NUE', name: 'Nucor Corporation', sector: 'Mining/Metals', market: 'US', currency: 'USD' },
  { ticker: 'STLD', displayTicker: 'STLD', name: 'Steel Dynamics, Inc.', sector: 'Mining/Metals', market: 'US', currency: 'USD' },
  { ticker: 'DOW', displayTicker: 'DOW', name: 'Dow Inc.', sector: 'Mining/Metals', market: 'US', currency: 'USD' },
  { ticker: 'DD', displayTicker: 'DD', name: 'DuPont de Nemours', sector: 'Mining/Metals', market: 'US', currency: 'USD' },
  { ticker: 'ALB', displayTicker: 'ALB', name: 'Albemarle Corporation', sector: 'Mining/Metals', market: 'US', currency: 'USD' },
  { ticker: 'CF', displayTicker: 'CF', name: 'CF Industries Holdings', sector: 'Mining/Metals', market: 'US', currency: 'USD' },

  // 8. Consumer Discretionary & Retail (Perakende & Tüketim)
  { ticker: 'WMT', displayTicker: 'WMT', name: 'Walmart Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'COST', displayTicker: 'COST', name: 'Costco Wholesale', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'HD', displayTicker: 'HD', name: 'The Home Depot', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'LOW', displayTicker: 'LOW', name: 'Lowe\'s Companies, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'MCD', displayTicker: 'MCD', name: 'McDonald\'s Corp.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'SBUX', displayTicker: 'SBUX', name: 'Starbucks Corporation', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'NKE', displayTicker: 'NKE', name: 'NIKE, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'TGT', displayTicker: 'TGT', name: 'Target Corporation', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'TJX', displayTicker: 'TJX', name: 'The TJX Companies', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'ROST', displayTicker: 'ROST', name: 'Ross Stores, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'BKNG', displayTicker: 'BKNG', name: 'Booking Holdings', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'ABNB', displayTicker: 'ABNB', name: 'Airbnb, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'MAR', displayTicker: 'MAR', name: 'Marriott International', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'HLT', displayTicker: 'HLT', name: 'Hilton Worldwide Holdings', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'YUM', displayTicker: 'YUM', name: 'Yum! Brands, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'CMG', displayTicker: 'CMG', name: 'Chipotle Mexican Grill', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'DPZ', displayTicker: 'DPZ', name: 'Domino\'s Pizza, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'DRI', displayTicker: 'DRI', name: 'Darden Restaurants', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'LULU', displayTicker: 'LULU', name: 'Lululemon Athletica', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'ORLY', displayTicker: 'ORLY', name: 'O\'Reilly Automotive', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'AZO', displayTicker: 'AZO', name: 'AutoZone, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'BBY', displayTicker: 'BBY', name: 'Best Buy Co., Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'EBAY', displayTicker: 'EBAY', name: 'eBay Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'ETSY', displayTicker: 'ETSY', name: 'Etsy, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'UBER', displayTicker: 'UBER', name: 'Uber Technologies', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'DASH', displayTicker: 'DASH', name: 'DoorDash, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'SHOP', displayTicker: 'SHOP', name: 'Shopify Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'MELI', displayTicker: 'MELI', name: 'MercadoLibre, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'SE', displayTicker: 'SE', name: 'Sea Limited', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'DKNG', displayTicker: 'DKNG', name: 'DraftKings Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'LVS', displayTicker: 'LVS', name: 'Las Vegas Sands Corp.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'WYNN', displayTicker: 'WYNN', name: 'Wynn Resorts, Limited', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'MGM', displayTicker: 'MGM', name: 'MGM Resorts International', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'RCL', displayTicker: 'RCL', name: 'Royal Caribbean Group', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'CCL', displayTicker: 'CCL', name: 'Carnival Corporation', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'NCLH', displayTicker: 'NCLH', name: 'Norwegian Cruise Line', sector: 'Retail', market: 'US', currency: 'USD' },

  // 9. Consumer Staples & Food (Temel Tüketim & Gıda)
  { ticker: 'PG', displayTicker: 'PG', name: 'Procter & Gamble', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'KO', displayTicker: 'KO', name: 'Coca-Cola Company', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'PEP', displayTicker: 'PEP', name: 'PepsiCo, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'PM', displayTicker: 'PM', name: 'Philip Morris International', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'MO', displayTicker: 'MO', name: 'Altria Group, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'CL', displayTicker: 'CL', name: 'Colgate-Palmolive Co.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'KMB', displayTicker: 'KMB', name: 'Kimberly-Clark Corp.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'MDLZ', displayTicker: 'MDLZ', name: 'Mondelez International', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'GIS', displayTicker: 'GIS', name: 'General Mills, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'HSY', displayTicker: 'HSY', name: 'The Hershey Company', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'KHC', displayTicker: 'KHC', name: 'The Kraft Heinz Company', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'STZ', displayTicker: 'STZ', name: 'Constellation Brands', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'SYY', displayTicker: 'SYY', name: 'Sysco Corporation', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'ADM', displayTicker: 'ADM', name: 'Archer-Daniels-Midland', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'TSN', displayTicker: 'TSN', name: 'Tyson Foods, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'CLX', displayTicker: 'CLX', name: 'The Clorox Company', sector: 'Retail', market: 'US', currency: 'USD' },

  // 10. Utilities, Real Estate & Telecom/Media
  { ticker: 'NEE', displayTicker: 'NEE', name: 'NextEra Energy, Inc.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'DUK', displayTicker: 'DUK', name: 'Duke Energy Corporation', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'SO', displayTicker: 'SO', name: 'The Southern Company', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'D', displayTicker: 'D', name: 'Dominion Energy, Inc.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'AEP', displayTicker: 'AEP', name: 'American Electric Power', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'EXC', displayTicker: 'EXC', name: 'Exelon Corporation', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'SRE', displayTicker: 'SRE', name: 'Sempra', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'AMT', displayTicker: 'AMT', name: 'American Tower Corp.', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'PLD', displayTicker: 'PLD', name: 'Prologis, Inc.', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'CCI', displayTicker: 'CCI', name: 'Crown Castle Inc.', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'EQIX', displayTicker: 'EQIX', name: 'Equinix, Inc.', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'PSA', displayTicker: 'PSA', name: 'Public Storage', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'SPG', displayTicker: 'SPG', name: 'Simon Property Group', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'O', displayTicker: 'O', name: 'Realty Income Corp.', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'DLR', displayTicker: 'DLR', name: 'Digital Realty Trust', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'CBRE', displayTicker: 'CBRE', name: 'CBRE Group, Inc.', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'T', displayTicker: 'T', name: 'AT&T Inc.', sector: 'Telekom', market: 'US', currency: 'USD' },
  { ticker: 'VZ', displayTicker: 'VZ', name: 'Verizon Communications', sector: 'Telekom', market: 'US', currency: 'USD' },
  { ticker: 'TMUS', displayTicker: 'TMUS', name: 'T-Mobile US, Inc.', sector: 'Telekom', market: 'US', currency: 'USD' },
  { ticker: 'CMCSA', displayTicker: 'CMCSA', name: 'Comcast Corporation', sector: 'Telekom', market: 'US', currency: 'USD' },
  { ticker: 'DIS', displayTicker: 'DIS', name: 'The Walt Disney Company', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'WBD', displayTicker: 'WBD', name: 'Warner Bros. Discovery', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'SPOT', displayTicker: 'SPOT', name: 'Spotify Technology S.A.', sector: 'Technology', market: 'US', currency: 'USD' },

  // 11. Additional S&P 500 & Mid-Cap Liquid Leaders (Diversified Expansion)
  { ticker: 'AFL', displayTicker: 'AFL', name: 'Aflac Incorporated', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'HIG', displayTicker: 'HIG', name: 'The Hartford Financial', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'BRO', displayTicker: 'BRO', name: 'Brown & Brown, Inc.', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'FITB', displayTicker: 'FITB', name: 'Fifth Third Bancorp', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'HBAN', displayTicker: 'HBAN', name: 'Huntington Bancshares', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'RF', displayTicker: 'RF', name: 'Regions Financial Corp.', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'KEY', displayTicker: 'KEY', name: 'KeyCorp', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'CFG', displayTicker: 'CFG', name: 'Citizens Financial Group', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'MTB', displayTicker: 'MTB', name: 'M&T Bank Corporation', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'NTRS', displayTicker: 'NTRS', name: 'Northern Trust Corp.', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'STT', displayTicker: 'STT', name: 'State Street Corporation', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'RJF', displayTicker: 'RJF', name: 'Raymond James Financial', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'MKTX', displayTicker: 'MKTX', name: 'MarketAxess Holdings', sector: 'Banking', market: 'US', currency: 'USD' },
  { ticker: 'CARR', displayTicker: 'CARR', name: 'Carrier Global Corp.', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'OTIS', displayTicker: 'OTIS', name: 'Otis Worldwide Corp.', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'JCI', displayTicker: 'JCI', name: 'Johnson Controls International', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'ROK', displayTicker: 'ROK', name: 'Rockwell Automation', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'DOV', displayTicker: 'DOV', name: 'Dover Corporation', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'GGG', displayTicker: 'GGG', name: 'Graco Inc.', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'SWK', displayTicker: 'SWK', name: 'Stanley Black & Decker', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'ODFL', displayTicker: 'ODFL', name: 'Old Dominion Freight Line', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'JBHT', displayTicker: 'JBHT', name: 'J.B. Hunt Transport Services', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'EXPD', displayTicker: 'EXPD', name: 'Expeditors International', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'DAL', displayTicker: 'DAL', name: 'Delta Air Lines, Inc.', sector: 'Aviation', market: 'US', currency: 'USD' },
  { ticker: 'UAL', displayTicker: 'UAL', name: 'United Airlines Holdings', sector: 'Aviation', market: 'US', currency: 'USD' },
  { ticker: 'LUV', displayTicker: 'LUV', name: 'Southwest Airlines Co.', sector: 'Aviation', market: 'US', currency: 'USD' },
  { ticker: 'ALK', displayTicker: 'ALK', name: 'Alaska Air Group', sector: 'Aviation', market: 'US', currency: 'USD' },
  { ticker: 'ALGN', displayTicker: 'ALGN', name: 'Align Technology, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'PODD', displayTicker: 'PODD', name: 'Insulet Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'RMD', displayTicker: 'RMD', name: 'ResMed Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'HOLX', displayTicker: 'HOLX', name: 'Hologic, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'COO', displayTicker: 'COO', name: 'The Cooper Companies', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'TECH', displayTicker: 'TECH', name: 'Bio-Techne Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'WST', displayTicker: 'WST', name: 'West Pharmaceutical Services', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'IQV', displayTicker: 'IQV', name: 'IQVIA Holdings Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'MEDP', displayTicker: 'MEDP', name: 'Medpace Holdings, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'EXAS', displayTicker: 'EXAS', name: 'Exact Sciences Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'NTRA', displayTicker: 'NTRA', name: 'Natera, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'TSCO', displayTicker: 'TSCO', name: 'Tractor Supply Company', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'FIVE', displayTicker: 'FIVE', name: 'Five Below, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'DLTR', displayTicker: 'DLTR', name: 'Dollar Tree, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'DG', displayTicker: 'DG', name: 'Dollar General Corp.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'KMX', displayTicker: 'KMX', name: 'CarMax, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'TPR', displayTicker: 'TPR', name: 'Tapestry, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'RL', displayTicker: 'RL', name: 'Ralph Lauren Corporation', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'HAS', displayTicker: 'HAS', name: 'Hasbro, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'MAT', displayTicker: 'MAT', name: 'Mattel, Inc.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'POOL', displayTicker: 'POOL', name: 'Pool Corporation', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'WHR', displayTicker: 'WHR', name: 'Whirlpool Corporation', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'MHK', displayTicker: 'MHK', name: 'Mohawk Industries, Inc.', sector: 'Industrial', market: 'US', currency: 'USD' },
  { ticker: 'CHD', displayTicker: 'CHD', name: 'Church & Dwight Co.', sector: 'Retail', market: 'US', currency: 'USD' },
  { ticker: 'AKAM', displayTicker: 'AKAM', name: 'Akamai Technologies', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'FFIV', displayTicker: 'FFIV', name: 'F5, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'JNPR', displayTicker: 'JNPR', name: 'Juniper Networks', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'CIEN', displayTicker: 'CIEN', name: 'Ciena Corporation', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'GEN', displayTicker: 'GEN', name: 'Gen Digital Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'CYBR', displayTicker: 'CYBR', name: 'CyberArk Software Ltd.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'TENB', displayTicker: 'TENB', name: 'Tenable Holdings, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'VRNS', displayTicker: 'VRNS', name: 'Varonis Systems, Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'ZBRA', displayTicker: 'ZBRA', name: 'Zebra Technologies', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'KEYS', displayTicker: 'KEYS', name: 'Keysight Technologies', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'IPGP', displayTicker: 'IPGP', name: 'IPG Photonics Corp.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'COHR', displayTicker: 'COHR', name: 'Coherent Corp.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'LITE', displayTicker: 'LITE', name: 'Lumentum Holdings Inc.', sector: 'Technology', market: 'US', currency: 'USD' },
  { ticker: 'ENPH', displayTicker: 'ENPH', name: 'Enphase Energy, Inc.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'FSLR', displayTicker: 'FSLR', name: 'First Solar, Inc.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'SEDG', displayTicker: 'SEDG', name: 'SolarEdge Technologies', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'RUN', displayTicker: 'RUN', name: 'Sunrun Inc.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'PLUG', displayTicker: 'PLUG', name: 'Plug Power Inc.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'VST', displayTicker: 'VST', name: 'Vistra Corp.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'CEG', displayTicker: 'CEG', name: 'Constellation Energy Corp.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'NRG', displayTicker: 'NRG', name: 'NRG Energy, Inc.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'AES', displayTicker: 'AES', name: 'The AES Corporation', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'ETR', displayTicker: 'ETR', name: 'Entergy Corporation', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'FE', displayTicker: 'FE', name: 'FirstEnergy Corp.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'PPL', displayTicker: 'PPL', name: 'PPL Corporation', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'WEC', displayTicker: 'WEC', name: 'WEC Energy Group', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'CMS', displayTicker: 'CMS', name: 'CMS Energy Corporation', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'DTE', displayTicker: 'DTE', name: 'DTE Energy Company', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'EVRG', displayTicker: 'EVRG', name: 'Evergy, Inc.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'NI', displayTicker: 'NI', name: 'NiSource Inc.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'LNT', displayTicker: 'LNT', name: 'Alliant Energy Corp.', sector: 'Energy', market: 'US', currency: 'USD' },
  { ticker: 'INVH', displayTicker: 'INVH', name: 'Invitation Homes Inc.', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'MAA', displayTicker: 'MAA', name: 'Mid-America Apartment', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'UDR', displayTicker: 'UDR', name: 'UDR, Inc.', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'AVB', displayTicker: 'AVB', name: 'AvalonBay Communities', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'EQR', displayTicker: 'EQR', name: 'Equity Residential', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'VTR', displayTicker: 'VTR', name: 'Ventas, Inc.', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'WELL', displayTicker: 'WELL', name: 'Welltower Inc.', sector: 'RealEstate', market: 'US', currency: 'USD' },
  { ticker: 'HST', displayTicker: 'HST', name: 'Host Hotels & Resorts', sector: 'RealEstate', market: 'US', currency: 'USD' }
];

export const COMBINED_UNIVERSE: UniverseItem[] = [...BIST_UNIVERSE, ...US_UNIVERSE];

// 💾 10 DAKİKALIK AKILLI BELLEK ÖNBELLEĞİ (RATE LIMIT KALKANI)
const candleMemoryCache = new Map<string, { candles: Candle[]; cachedAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 dakika

export async function fetchStockCandles(ticker: string, range: string = '6mo'): Promise<Candle[]> {
  const cacheKey = `${ticker}_${range}`;
  const cached = candleMemoryCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.candles;
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=1d&includePrePost=false`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 300 }
    });

    if (!res.ok) return cached ? cached.candles : [];

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) return cached ? cached.candles : [];

    const timestamps: number[] = result.timestamp;
    const quote = result.indicators.quote[0];
    const opens: number[] = quote.open || [];
    const highs: number[] = quote.high || [];
    const lows: number[] = quote.low || [];
    const closes: number[] = quote.close || [];
    const volumes: number[] = quote.volume || [];

    const candles: Candle[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const close = closes[i];
      if (close === null || close === undefined || isNaN(close)) continue;
      const open = opens[i] ?? close;
      const high = highs[i] ?? Math.max(open, close);
      const low = lows[i] ?? Math.min(open, close);
      const volume = volumes[i] ?? 0;

      const dateStr = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
      candles.push({
        date: dateStr,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume
      });
    }

    if (candles.length > 0) {
      candleMemoryCache.set(cacheKey, { candles, cachedAt: now });
    }

    return candles;
  } catch (err) {
    return cached ? cached.candles : [];
  }
}

export function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  if (prices.length < period) period = prices.length;
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return Number(ema.toFixed(2));
}

export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length <= period) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(diff)) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Number((100 - 100 / (1 + rs)).toFixed(1));
}

export function calculateATR(candles: Candle[], period: number = 14): number {
  if (candles.length <= 1) return 1.0;
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trs.push(tr);
  }
  if (trs.length === 0) return 1.0;
  const slice = trs.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return Number((sum / slice.length).toFixed(2));
}

export function calculateTechnicals(candles: Candle[]): TechnicalIndicators | null {
  if (candles.length < 20) return null;
  const closes = candles.map(c => c.close);
  const current = closes[closes.length - 1];
  const prev = closes[closes.length - 2];
  const change = Number((current - prev).toFixed(2));
  const changePercent = Number((((current - prev) / prev) * 100).toFixed(2));

  const ema9 = calculateEMA(closes, 9);
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, 200);
  const rsi14 = calculateRSI(closes, 14);
  const atr14 = calculateATR(candles, 14);
  const atrPercent = Number(((atr14 / current) * 100).toFixed(2));

  const lastVolumes = candles.slice(-20).map(c => c.volume);
  const currentVolume = lastVolumes[lastVolumes.length - 1] || 0;
  const avgVolume20 = lastVolumes.length > 1
    ? lastVolumes.slice(0, -1).reduce((a, b) => a + b, 0) / (lastVolumes.length - 1)
    : currentVolume;
  const rvol = avgVolume20 > 0 ? Number((currentVolume / avgVolume20).toFixed(2)) : 1.0;

  const last20Highs = candles.slice(-20).map(c => c.high);
  const high20 = Math.max(...last20Highs);
  const last20Lows = candles.slice(-20).map(c => c.low);
  const low20 = Math.min(...last20Lows);

  return {
    price: current,
    change,
    changePercent,
    volume: currentVolume,
    avgVolume20: Math.round(avgVolume20),
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
  const ticker = market === 'BIST' ? 'XU100.IS' : '^GSPC';
  const candles = await fetchStockCandles(ticker, '6mo');
  if (candles.length < 50) {
    return {
      market,
      ticker,
      price: 0,
      ema50: 0,
      trend: 'NEUTRAL',
      changePercent: 0,
      rsi14: 50,
      allowNewBuys: true,
      reason: 'Endeks verisi hazırlanıyor.'
    };
  }

  const closes = candles.map(c => c.close);
  const current = closes[closes.length - 1];
  const prev = closes[closes.length - 2];
  const changePercent = Number((((current - prev) / prev) * 100).toFixed(2));
  const ema50 = calculateEMA(closes, 50);
  const rsi14 = calculateRSI(closes, 14);
  const isBullish = current >= ema50;
  const trend = isBullish ? (changePercent > 0.5 ? 'BULLISH' : 'NEUTRAL') : 'BEARISH';
  const allowNewBuys = current >= ema50 * 0.97; // %3 tolerans

  return {
    market,
    ticker,
    price: current,
    ema50,
    trend,
    changePercent,
    rsi14,
    allowNewBuys,
    reason: isBullish ? 'Endeks 50 EMA üzerinde, alım stratejileri aktif.' : 'Endeks 50 EMA altında, savunmacı mod devrede.'
  };
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ⚡ 15'ERLİ PAKETLEME (CHUNKED CONCURRENCY POOL) - Rate Limit Önleyici
export async function scanUniverse(marketFilter: 'ALL' | 'US' | 'BIST' = 'ALL'): Promise<StockScanResult[]> {
  let baseUniverse = marketFilter === 'US'
    ? [...US_UNIVERSE]
    : marketFilter === 'BIST'
    ? [...BIST_UNIVERSE]
    : [...COMBINED_UNIVERSE];

  // Supabase Custom Stocks
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
  } catch (e) {}

  const targetUniverse = baseUniverse;
  const results: StockScanResult[] = [];
  const chunkSize = 15;

  const { fetchStockNewsAndCatalysts } = await import('./newsEngine');

  for (let i = 0; i < targetUniverse.length; i += chunkSize) {
    const chunk = targetUniverse.slice(i, i + chunkSize);
    const promises = chunk.map(async (item) => {
      const candles = await fetchStockCandles(item.ticker, '6mo');
      const technicals = calculateTechnicals(candles);
      if (!technicals) return null;

      let catalystInfo;
      try {
        catalystInfo = await fetchStockNewsAndCatalysts(item.ticker, item.displayTicker, item.market);
      } catch (e) {}

      const signal = evaluateSignal(
        item.ticker,
        item.displayTicker,
        item.sector,
        item.market,
        item.currency,
        technicals,
        candles,
        catalystInfo
      );

      return {
        ticker: item.ticker,
        displayTicker: item.displayTicker,
        name: item.name,
        sector: item.sector,
        market: item.market,
        currency: item.currency,
        technicals,
        signal,
        news: catalystInfo?.news,
        catalystScore: catalystInfo?.catalystScore
      };
    });

    const chunkResults = await Promise.all(promises);
    for (const res of chunkResults) {
      if (res) results.push(res);
    }

    if (i + chunkSize < targetUniverse.length) {
      await sleep(35); // 35ms mikro gecikme (Yahoo Finance rate limit koruması)
    }
  }

  return results;
}
