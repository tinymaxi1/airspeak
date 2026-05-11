# 09 · Apple Search Ads — Kampanya Yapısı

Apple Search Ads (App Store içinde reklam) detaylı kampanya planı.

## 9.1 Apple Search Ads Modeli

### 2 ürün
- **Search Ads Basic**: $5/install max bid, otomatik
- **Search Ads Advanced**: keyword bazlı, manuel bid, daha kontrollü ⭐ kullanıyoruz

### Pricing
- **Cost-per-tap (CPT)**: bid bazlı, $0.30-$3.00
- **Conversion rate**: tap → install ortalama %50 (Apple ortalama %52)
- **CPI (Cost-per-install)**: TR pazarında $1-$3 hedef, US/EU $5-$15

### Bütçe önerisi
- Aylık $1.000 (Türkiye odaklı)
- Aylık $3.000 (Türkiye + Orta Doğu + AB)
- Aylık $10.000 (global)

---

## 9.2 Kampanya Yapısı (Hierarchy)

```
Account: AirSpeak
├── Campaign 1: Brand Defense (TR)
│   └── Ad Group: Brand Keywords
│       └── Keywords: airspeak, airspeak app, airspeak indir
├── Campaign 2: Generic — Aviation English (TR)
│   ├── Ad Group: Core Aviation Terms
│   │   └── havacılık ingilizcesi, pilot ingilizce
│   └── Ad Group: ICAO 4 Specific
│       └── ICAO 4, ICAO seviye 4, ICAO 4 hazırlık
├── Campaign 3: Generic — Interview Prep (TR)
│   ├── Ad Group: THY Interview
│   │   └── THY mülakat, THY pilot, THY kabin
│   ├── Ad Group: Pegasus Interview
│   │   └── pegasus mülakat, pegasus pilot, pegasus kabin
│   └── Ad Group: Other Airlines
│       └── sunexpress mülakat, anadolujet, ...
├── Campaign 4: Competitor Conquest (TR)
│   └── Ad Group: Rakip Markalar
│       └── pilot ICAO 4 test, mayflower aviation, aerlingua
├── Campaign 5: Discovery (auto)
│   └── Apple otomatik öneri keyword'leri
├── Campaign 6: Brand Defense (Global)
├── Campaign 7-12: AB ülkeleri (DE/FR/ES/IT/NL/PT)
├── Campaign 13-14: Orta Doğu (AE/SA)
├── Campaign 15-16: Asya premium (JP/KR)
```

---

## 9.3 Detaylı Campaign Setup

### Campaign 1: Brand Defense — TR

**Amaç**: kullanıcı "AirSpeak" yazdığında rakip değil bizim ad göstersin.

**Setup**:
- Bütçe: $50/ay
- Daily cap: $2
- CPM target: yok, organik tıklamayı koru
- Bid: max $0.30 (cheap, brand niche)

**Keywords**:
- `airspeak` (exact match)
- `airspeak app` (exact)
- `airspeak indir` (exact)
- `airspeak nedir` (exact)
- `havacılık app` (broad — geniş)

**Ad assets**:
- Custom Product Page: standard listing
- Creative: hero screenshot

**Negatif keywords**:
- `airspeak premium crack`
- `airspeak free download`

---

### Campaign 2: Generic — Aviation English (TR)

**Amaç**: havacılık İngilizcesi arayanları yakala.

**Setup**:
- Bütçe: $400/ay
- Daily cap: $20
- CPI target: < $3
- Bid strategy: max CPT bid $0.80-$2.00

**Ad Group A**: Core terms
| Keyword | Match | Bid | Volume |
|---|---|---|---|
| havacılık ingilizcesi | Exact | $1.50 | High |
| pilot ingilizce | Exact | $1.20 | High |
| pilot ingilizce öğren | Phrase | $1.00 | Medium |
| havacılık ingilizcesi app | Exact | $1.80 | Low |

**Ad Group B**: ICAO 4
| Keyword | Match | Bid | Volume |
|---|---|---|---|
| ICAO 4 | Exact | $1.00 | High |
| ICAO seviye 4 | Exact | $0.90 | Medium |
| ICAO 4 hazırlık | Phrase | $0.80 | Medium |
| ICAO 4 nedir | Exact | $0.70 | Medium |
| ICAO 4 sınav | Phrase | $1.10 | High |

**Custom Product Page**: ICAO 4 odaklı varyant (screenshot 5 ilk sıra)

**Negatif keywords**:
```
free, bedava, crack, torrent
duolingo, babbel, busuu
TOEFL, IELTS, YDS hazırlık (genel İngilizce, niş değil)
youtube
```

---

### Campaign 3: Interview Prep (TR)

**Amaç**: havayolu mülakat hazırlığı arayanları yakala.

**Setup**:
- Bütçe: $300/ay (yüksek dönüşüm)
- Daily cap: $15
- CPI target: < $2 (yüksek intent)

**Ad Group A**: THY
| Keyword | Match | Bid |
|---|---|---|
| THY mülakat | Exact | $2.00 |
| THY pilot mülakatı | Exact | $1.80 |
| THY kabin mülakatı | Exact | $1.80 |
| THY pilot başvuru | Phrase | $1.50 |
| THY hostess | Exact | $1.40 |

**Ad Group B**: Pegasus
| Keyword | Match | Bid |
|---|---|---|
| pegasus mülakat | Exact | $1.50 |
| pegasus pilot | Exact | $1.30 |
| pegasus kabin başvuru | Phrase | $1.20 |

**Ad Group C**: Diğer
| Keyword | Match | Bid |
|---|---|---|
| sunexpress pilot | Exact | $0.80 |
| anadolujet kabin | Exact | $0.80 |
| havayolu mülakat | Phrase | $1.00 |
| havayolu mülakat hazırlık | Phrase | $1.10 |

**Custom Product Page**: 41 airlines odaklı (screenshot 6 ilk)

---

### Campaign 4: Competitor Conquest (TR)

**Amaç**: Rakip arayanları kapma.

**Setup**:
- Bütçe: $150/ay
- Daily cap: $8
- CPI target: < $5 (sert rekabet)
- Bid strategy: yüksek bid for brand match

**Keywords**:
| Keyword | Match | Bid | Sebep |
|---|---|---|---|
| pilot icao 4 test | Exact | $3.00 | doğrudan rakip |
| icao 4 test app | Exact | $2.50 | rakip kategorisi |
| mayflower aviation | Exact | $2.00 | rakip marka |
| aerlingua | Exact | $1.50 | rakip marka |
| aviation english app | Exact | $1.80 | EN rakipleri |

**Negatif**: kendi marka kelimelerimiz (paralel cost önleme)

**Ad copy ipucu**: "AirSpeak: Türk pilotlar için %60 ucuz alternatif"

---

### Campaign 5: Discovery (Apple otomatik)

**Amaç**: Apple algoritması bizim için yeni keyword keşfetsin.

**Setup**:
- Bütçe: $200/ay
- Daily cap: $10
- Match type: broad
- Bid: $1.00 (CPI cap)

**Keyword seed**: ad group olmadan, sadece **search ads default** keyword'leri otomatik test eder.

**Performance review**: hafta sonu top performing keywords'i Campaign 2-3'e taşı (bid optimize).

---

## 9.4 Geographic Expansion

### Faz 1 (Ay 1-3): TR sadece
- Toplam bütçe: $1.000/ay

### Faz 2 (Ay 4-6): + AE, SA, DE
- TR $1.200, AE $400, SA $300, DE $500
- Toplam: $2.400/ay

### Faz 3 (Ay 7-12): + Global
- TR + 12 ülke
- Toplam: $5.000-$10.000/ay

### Country-specific nuans

**AE (Birleşik Arap Emirlikleri)**:
- Premium pazar, CPI $5-8 normal
- Keyword: Arabic (طيار) + English mix (Emirates pilot)
- Apple Search Ads AE'de yüksek conversion

**DE (Almanya)**:
- "Lufthansa Pilotenausbildung" yüksek rekabet
- CPI $3-5
- Localize ad creative (Almanca caption)

**JP (Japonya)**:
- En pahalı CPI ($8-15)
- Yüksek LTV (yıllık plan ortalama 1.5 yıl kalış)
- Sadece premium kullanıcı

---

## 9.5 Custom Product Pages (CPP)

### Standart listing + 3 CPP varyant

**CPP 1: ICAO 4 odaklı**
- URL: `airspeak.app/icao4`
- Hero: ICAO 4 PASSED stamp screenshot
- Caption: "ICAO 4 sınavı 14 haftada"
- Search Ads campaign 2 → bu CPP'ye link

**CPP 2: Mülakat odaklı**
- URL: `airspeak.app/mulakat`
- Hero: 41 airline screenshot
- Caption: "41 havayolu mülakat tek uygulamada"
- Search Ads campaign 3 → bu CPP'ye link

**CPP 3: AI Co-pilot odaklı**
- URL: `airspeak.app/ai`
- Hero: AI Co-pilot conversation screenshot
- Caption: "AI ile sınırsız ATC roleplay"
- Generic / discovery campaign

**CPP 4: Telaffuz odaklı**
- Hero: Score ring 87 + phonemes
- Caption: "Telaffuzun 0-100 ölçülür"

---

## 9.6 Optimization & Bid Management

### Hafta 1: Launch
- Conservative bids ($0.50-$1.00)
- Tüm keyword'lere eşit bütçe
- 7 gün veri topla

### Hafta 2: İlk optimization
- En iyi conversion keyword'leri (>%50 tap-to-install) bid +%30
- Düşük CR (<%30) keyword'leri bid -%50 veya pause
- Search Term Report'tan negatif keyword bul

### Hafta 4: Major optimization
- Top 20% keyword için bütçe %60'ını ata
- Long-tail discovery'den gelen yeni keyword'leri Campaign 2-3'e taşı

### Aylık review
- ROAS (Return on Ad Spend) hesapla:
  - Revenue from ads / Ad spend
  - Hedef: 3:1 (her $1 reklam → $3 revenue)

### CPI vs LTV
- TR LTV ~$45, hedef CPI $3 → 15:1 LTV/CPI ratio (sağlıklı)
- DE LTV ~$50, CPI $5 → 10:1 (kabul edilebilir)
- JP LTV ~$70, CPI $12 → 5.8:1 (sınırda, yıllık plan'a dönüşüm önemli)

---

## 9.7 Reporting Dashboard

### Apple Search Ads UI metrikleri
- Impressions
- Taps (tıklama)
- Tap-Through Rate (TTR) — hedef >5%
- Installs
- Cost-per-Install (CPI)
- Average Cost-per-Tap (CPT)
- Conversion Rate (CR) — hedef >50%

### Custom KPI'lar (Apple SDK + AppsFlyer)
- Trial-to-pro conversion (per campaign)
- Day-7 retention
- LTV per campaign
- ROAS

### Haftalık rapor template
```
Apple Search Ads — Hafta {{N}}
================================
Toplam spend: $XXX
Toplam install: XXX
CPI: $X.XX
Conversion rate: X%

Top 5 keyword (CPI):
1. {{keyword}} — $X.XX × XX install
...

Top 5 keyword (volume):
1. {{keyword}} — XX install
...

Negatif keyword eklendi: 5
Bid ↑: 8 keyword
Bid ↓: 3 keyword
Pause: 2 keyword

Sonraki hafta odak:
- {{action}}
```

---

## 9.8 A/B Testing within Search Ads

### Test 1: Custom Product Page karşılaştırma
- Hipotez: "Mülakat odaklı CPP %15 fazla CR"
- A: standart listing
- B: Mülakat odaklı CPP
- Süre: 14 gün, %50/%50 split

### Test 2: Bid strategy
- A: max CPT $1.50
- B: max CPT $2.50 + daha çok daily cap
- Süre: 7 gün
- KPI: install volume vs efficiency

### Test 3: Keyword match type
- A: Exact match only
- B: Broad match for top 20 keyword
- KPI: discovery yeni keyword + conversion

---

## 9.9 Off-Apple Search Ads (Google ASA + Diğer)

### Google App Campaigns (UAC)
- Apple Search Ads kadar etkili değil iOS'ta
- Android için zorunlu
- Bütçe: $500/ay (Android pazara giriş)
- Apple ekosistemine ROI %200 düşük (mobile gaming odaklı)

### Apple TV + iPad ad'leri
- iPad: useful pilot/öğrenci için (büyük ekran çalışma)
- Apple TV: ROI low for niş app

### Search Ads — bizim için fokus
**Tercihimiz**: Apple Search Ads ana kanal, Google UAC tamamlayıcı.
Sebep: TR/AE/EU pazarlarımız iOS heavy (cabin crew + pilot Apple kullanır).

---

## 9.10 Aksiyonlar

| Aksiyon | Sahip | Süre | Bütçe |
|---|---|---|---|
| Apple Search Ads account aç | Marketing | Hafta 1 | $0 |
| Campaign 1-5 setup (TR) | Marketing | Hafta 2 | $1.000/ay |
| Custom Product Pages 4 hazırla | Marketing+Design | Hafta 3 | $200 (tasarım) |
| AppsFlyer entegrasyonu (campaign attribution) | Eng | Hafta 4 | $79/ay |
| Hafta 1 launch | Marketing | Hafta 5 | $1.000 |
| Hafta 2-4 optimize | Marketing | Ay 2 | $1.500 |
| Faz 2 expansion (AE/SA/DE) | Marketing | Ay 4 | $2.400/ay |
| Faz 3 global expansion | Marketing | Ay 7 | $5.000+/ay |

---

*v1.0 · 2026-04-29*
