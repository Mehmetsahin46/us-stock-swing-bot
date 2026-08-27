import os

file_path = r"C:\Users\Administrator\.gemini\antigravity\scratch\us-stock-swing-bot\src\lib\marketData.ts"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# find where COMBINED_UNIVERSE is
combined_idx = -1
for i, line in enumerate(lines):
    if "export const COMBINED_UNIVERSE" in line:
        combined_idx = i
        break

rest_of_code = "".join(lines[combined_idx:])

# Now we need to generate BIST (140) and US (350)
bist = """
// 🇹🇷 140 SEÇKİN & LİKİT BIST HİSSESİ (BIST 100 + En Hacimli Yan Tahtalar & Güçlü Şirketler)
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
  { ticker: 'GLMD.IS', displayTicker: 'GLMD', name: 'Global Menkul Değerler', sector: 'Banking', market: 'BIST', currency: 'TRY' },

  // Havacılık & Ulaştırma
  { ticker: 'THYAO.IS', displayTicker: 'THYAO', name: 'Türk Hava Yolları', sector: 'Aviation', market: 'BIST', currency: 'TRY' },
  { ticker: 'PGSUS.IS', displayTicker: 'PGSUS', name: 'Pegasus Hava Taşımacılığı', sector: 'Aviation', market: 'BIST', currency: 'TRY' },
  { ticker: 'TAVHL.IS', displayTicker: 'TAVHL', name: 'TAV Havalimanları', sector: 'Aviation', market: 'BIST', currency: 'TRY' },
  { ticker: 'CLEBI.IS', displayTicker: 'CLEBI', name: 'Çelebi Hava Servisi', sector: 'Aviation', market: 'BIST', currency: 'TRY' },
  { ticker: 'DOCO.IS', displayTicker: 'DOCO', name: 'DO & CO', sector: 'Aviation', market: 'BIST', currency: 'TRY' },

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
  { ticker: 'NTHOL.IS', displayTicker: 'NTHOL', name: 'Net Holding', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'GOZDE.IS', displayTicker: 'GOZDE', name: 'Gözde Girişim Sermayesi', sector: 'Industrial', market: 'BIST', currency: 'TRY' },

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
  { ticker: 'NATEN.IS', displayTicker: 'NATEN', name: 'Naturel Yenilenebilir Enerji', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'AYGAZ.IS', displayTicker: 'AYGAZ', name: 'Aygaz', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'GESAN.IS', displayTicker: 'GESAN', name: 'Girişim Elektrik', sector: 'Energy', market: 'BIST', currency: 'TRY' },
  { ticker: 'SMRTG.IS', displayTicker: 'SMRTG', name: 'Smart Güneş Enerjisi', sector: 'Energy', market: 'BIST', currency: 'TRY' },

  // Otomotiv & Sanayi & Cam
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
  { ticker: 'ASUZU.IS', displayTicker: 'ASUZU', name: 'Anadolu Isuzu', sector: 'Automotive', market: 'BIST', currency: 'TRY' },
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
  { ticker: 'INDES.IS', displayTicker: 'INDES', name: 'İndeks Bilgisayar', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'TCELL.IS', displayTicker: 'TCELL', name: 'Turkcell', sector: 'Telekom', market: 'BIST', currency: 'TRY' },
  { ticker: 'TTKOM.IS', displayTicker: 'TTKOM', name: 'Türk Telekom', sector: 'Telekom', market: 'BIST', currency: 'TRY' },
  { ticker: 'KFEIN.IS', displayTicker: 'KFEIN', name: 'Kafein Yazılım', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'VBTYZ.IS', displayTicker: 'VBTYZ', name: 'VBT Yazılım', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'LINK.IS', displayTicker: 'LINK', name: 'Link Bilgisayar', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'ARENA.IS', displayTicker: 'ARENA', name: 'Arena Bilgisayar', sector: 'Technology', market: 'BIST', currency: 'TRY' },

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
  { ticker: 'ISDMR.IS', displayTicker: 'ISDMR', name: 'İskenderun Demir ve Çelik', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },
  { ticker: 'ALBRK.IS', displayTicker: 'ALBRK', name: 'Albaraka', sector: 'Mining/Metals', market: 'BIST', currency: 'TRY' },

  // Perakende & Gıda & İçecek & Tarım
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
  { ticker: 'ULKER.IS', displayTicker: 'ULKER', name: 'Ülker Bisküvi', sector: 'Retail', market: 'BIST', currency: 'TRY' },
  { ticker: 'FROTO.IS', displayTicker: 'FROTO', name: 'Ford Otosan', sector: 'Retail', market: 'BIST', currency: 'TRY' },

  // Sağlık & İlaç & Medikal
  { ticker: 'MPARK.IS', displayTicker: 'MPARK', name: 'MLP Sağlık (Medical Park)', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'GENIL.IS', displayTicker: 'GENIL', name: 'Gen İlaç', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'ECILC.IS', displayTicker: 'ECILC', name: 'Eczacıbaşı İlaç', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'DEVA.IS', displayTicker: 'DEVA', name: 'Deva Holding', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'LKMNH.IS', displayTicker: 'LKMNH', name: 'Lokman Hekim', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'TRILC.IS', displayTicker: 'TRILC', name: 'Türk İlaç ve Serum', sector: 'Technology', market: 'BIST', currency: 'TRY' },
  { ticker: 'MEDTR.IS', displayTicker: 'MEDTR', name: 'Medikalpark', sector: 'Technology', market: 'BIST', currency: 'TRY' },

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
  { ticker: 'OYAKC.IS', displayTicker: 'OYAKC', name: 'Oyak Çimento', sector: 'Industrial', market: 'BIST', currency: 'TRY' },
  { ticker: 'NUGYO.IS', displayTicker: 'NUGYO', name: 'Nurol GYO', sector: 'RealEstate', market: 'BIST', currency: 'TRY' },
  { ticker: 'HLGYO.IS', displayTicker: 'HLGYO', name: 'Halk GYO', sector: 'RealEstate', market: 'BIST', currency: 'TRY' },
  { ticker: 'VKGYO.IS', displayTicker: 'VKGYO', name: 'Vakıf GYO', sector: 'RealEstate', market: 'BIST', currency: 'TRY' },
  { ticker: 'OZKGY.IS', displayTicker: 'OZKGY', name: 'Özak GYO', sector: 'RealEstate', market: 'BIST', currency: 'TRY' },
  { ticker: 'SNGYO.IS', displayTicker: 'SNGYO', name: 'Sinpaş GYO', sector: 'RealEstate', market: 'BIST', currency: 'TRY' }
];
"""

# Let's write a generator for US Stocks to make ~350 stocks across all sectors
import pandas as pd

us_tickers = [
  # Technology & Semis & Software & Cyber & Cloud
  'AAPL', 'MSFT', 'NVDA', 'AVGO', 'ORCL', 'ADBE', 'CRM', 'AMD', 'QCOM', 'INTC', 'TXN', 'IBM', 'NOW', 'INTU', 'AMAT', 'LRCX', 'ADI', 'MU', 'PANW', 'SNOW', 'KLAC', 'CRWD', 'SYMC', 'FTNT', 'WDAY', 'CDNS', 'SNPS', 'ROP', 'MARV', 'MCHP', 'NXPI', 'ASML', 'ARM', 'ON', 'MPWR', 'TER', 'DELL', 'HPQ', 'SMCI', 'DDOG', 'NET', 'ZS', 'MDB', 'TEAM', 'SPLK', 'APP', 'ANET', 'ANSS', 'TYL', 'PTC', 'FICO', 'HUBS', 'MSTR', 'COIN', 'PAL', 'PLTR', 'PLUG',
  # Communications & Media
  'GOOGL', 'GOOG', 'META', 'NFLX', 'DIS', 'CMCSA', 'TMUS', 'VZ', 'T', 'CHTR', 'EA', 'TTWO', 'LYV', 'WBD', 'FOXA', 'FOX', 'PARA', 'SIRI', 'OMC', 'IPG',
  # Consumer Discretionary & Retail
  'AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'SBUX', 'LOW', 'BKNG', 'TJX', 'CMG', 'ORLY', 'MAR', 'HLT', 'YUM', 'ROST', 'AZO', 'LEN', 'DHI', 'TSCO', 'LVS', 'EXPE', 'HAS', 'MAT', 'KMX', 'BBY', 'EBAY', 'ETSY', 'VFC', 'TPR', 'RL', 'UAA', 'HOG', 'M', 'KSS', 'GPS', 'JWN', 'FL', 'BBWI', 'CROX', 'DECK', 'LULU', 'PTON', 'RIVN', 'LCID', 'F', 'GM',
  # Consumer Staples
  'WMT', 'PG', 'COST', 'KO', 'PEP', 'PM', 'TGT', 'MO', 'EL', 'KMB', 'CL', 'SYY', 'GIS', 'K', 'HSY', 'MNST', 'CHD', 'CLX', 'SJM', 'CPB', 'CAG', 'TSN', 'MKC', 'HRL', 'TAP', 'BF.B', 'STZ', 'KR', 'DG', 'DLTR', 'WBA', 'RAD', 'UNFI', 'SYY', 'USFD',
  # Financials
  'JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'BLK', 'SCHW', 'BRK.B', 'V', 'MA', 'AXP', 'PYPL', 'SPGI', 'CME', 'ICE', 'MCO', 'CB', 'PGR', 'TRV', 'AIG', 'ALL', 'AFL', 'PRU', 'MET', 'MMC', 'AON', 'AJG', 'TFC', 'USB', 'PNC', 'COF', 'DFS', 'SYF', 'ALLY', 'CFG', 'FITB', 'HBAN', 'KEY', 'RF', 'MTB', 'ZION', 'CMA',
  # Healthcare & Biotech
  'LLY', 'UNH', 'JNJ', 'ABBV', 'MRK', 'PFE', 'AMGN', 'ISRG', 'GILD', 'VRTX', 'REGN', 'BMY', 'MDT', 'TMO', 'DHR', 'ABT', 'SYK', 'BSX', 'ZTS', 'BDX', 'EW', 'ILMN', 'BIIB', 'VRTX', 'IDXX', 'ALGN', 'RMD', 'MTD', 'WAT', 'A', 'IQV', 'CRL', 'PRAH', 'MCK', 'CAH', 'ABC', 'CNC', 'CI', 'HUM', 'ELV', 'MOH', 'HCA', 'UHS', 'THC',
  # Industrials & Aerospace/Defense
  'BA', 'LMT', 'RTX', 'NOC', 'GD', 'GE', 'CAT', 'DE', 'HON', 'UNP', 'UPS', 'FDX', 'CSX', 'NSC', 'WM', 'RSG', 'ETN', 'EMR', 'ROK', 'CMI', 'PH', 'TT', 'CARR', 'OTIS', 'JCI', 'IR', 'AME', 'DOV', 'ITW', 'MMM', 'TXT', 'LHX', 'TDG', 'HII', 'LDOS', 'BAH', 'CHRW', 'EXPD', 'JBHT', 'ODFL', 'SNA', 'SWK', 'PNR', 'AOS', 'MAS',
  # Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'OXY', 'MPC', 'VLO', 'PSX', 'PXD', 'HES', 'BKR', 'HAL', 'DVN', 'FANG', 'TRGP', 'WMB', 'KMI', 'OKE', 'CTRA', 'EQT', 'MRO', 'APA', 'OVV', 'MUR',
  # Materials
  'LIN', 'SHW', 'ECL', 'APD', 'NEM', 'FCX', 'DD', 'DOW', 'CE', 'EMN', 'HUN', 'PPG', 'ALB', 'FMC', 'CTVA', 'MOS', 'CF', 'NUE', 'STLD', 'RS', 'VMC', 'MLM', 'PKG', 'IP', 'WRK', 'BLL', 'SEE', 'AMCR',
  # Utilities
  'NEE', 'DUK', 'SO', 'D', 'SRE', 'AEP', 'EXC', 'XEL', 'ED', 'PEG', 'WEC', 'EIX', 'AWK', 'ES', 'ETR', 'FE', 'CMS', 'CNP', 'LNT', 'ATO', 'NI',
  # Real Estate
  'PLD', 'AMT', 'EQIX', 'CCI', 'PSA', 'O', 'SPG', 'WELL', 'DLR', 'AVB', 'EQR', 'VTR', 'ARE', 'WY', 'CBRE', 'EXR', 'MAA', 'UDR', 'IRM', 'CPT'
]

us_universe_lines = ["export const US_UNIVERSE: UniverseItem[] = ["]
for i, ticker in enumerate(set(us_tickers)):
    sector = 'Technology'
    if ticker in ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'BLK', 'SCHW', 'BRK.B', 'V', 'MA', 'AXP', 'PYPL']: sector = 'Banking'
    elif ticker in ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'OXY', 'MPC', 'VLO', 'PSX', 'PXD']: sector = 'Energy'
    elif ticker in ['BA', 'LMT', 'RTX', 'NOC', 'GD', 'GE', 'CAT', 'DE', 'HON', 'UNP', 'UPS']: sector = 'Industrial'
    elif ticker in ['WMT', 'PG', 'COST', 'KO', 'PEP', 'PM', 'TGT', 'MO', 'EL', 'KMB']: sector = 'Retail'
    elif ticker in ['AAPL', 'MSFT', 'NVDA', 'AVGO', 'ORCL', 'ADBE', 'CRM', 'AMD', 'QCOM', 'INTC']: sector = 'Technology'
    
    us_universe_lines.append(f"  {{ ticker: '{ticker}', displayTicker: '{ticker.replace('.','-')}', name: '{ticker} Corp.', sector: '{sector}', market: 'US', currency: 'USD' }},")
us_universe_lines.append("];\n")

us_universe_code = "\n".join(us_universe_lines)

top_code = """import { Candle, CurrencyType, MarketRegime, MarketType, SectorType, StockScanResult, TechnicalIndicators } from './types';
import { evaluateSignal } from './strategyEngine';

export interface UniverseItem {
  ticker: string;
  displayTicker: string;
  name: string;
  sector: SectorType;
  market: MarketType;
  currency: CurrencyType;
}

"""

new_file_content = top_code + bist + us_universe_code + rest_of_code

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_file_content)

print("Total US stocks:", len(set(us_tickers)))
