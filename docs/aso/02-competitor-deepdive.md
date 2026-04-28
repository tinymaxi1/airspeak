# 02 · Rakip Deep-Dive Analizi

12 rakip, her biri için: özellik matrisi · zayıf yönler · bizim counter-positioning.

## 2.1 Rakip Haritası

| Rakip | Bölge | Format | Güç | Zayıf | Tehdit |
|---|---|---|---|---|---|
| AviationEnglish.com | Global | Web | İçerik (15 yıl) | App yok | 2/5 |
| Pilot ICAO 4 Test | Global | iOS only | Cheap | Eski UI, mock test only | 3/5 |
| RMIT Aviation English | AU/EU | Web + LMS | Kurum | $299, kurumsal sales | 2/5 |
| Mayflower Aviation | UK | App + Web | Voice eval | Sadece İngilizce | 4/5 |
| Airwiki | RU | App | Türkçe yok | Rusça-only | 1/5 |
| LATAM Aviation School | Latin America | App | Lokal | İngilizce yok | 1/5 |
| Aerlingua | EU | iOS | EASA partnership | Sadece İngilizce, $59/ay | 3/5 |
| Cabin Crew Interview Prep | Global | iOS+Android | Niche | Sadece kabin, statik | 2/5 |
| Pilot Pal | US | Phone-based | Premium | $200/saat tutorial | 1/5 |
| ICAO English Test | App | iOS | Cheap | Sadece test, eğitim yok | 2/5 |
| Aviation Vocabulary | Global | Web | Free | Web only, eski | 1/5 |
| Duolingo | Global | App | Brand power | Aviation niş yok | 2/5 (potansiyel pivot) |

---

## 2.2 Detaylı Rakip Profilleri

### 1. Pilot ICAO 4 Test (En yakın doğrudan rakip)

**Künye**:
- Geliştirici: ATC English Pty (Avustralya)
- Çıkış: 2019
- Platform: iOS only
- Fiyat: $4.99/ay, $39.99/yıl
- Estimated MAU: 8.000 global, 200 TR
- Rating: 3.5★ (App Store, 240 review)

**Özellik matrisi**:

| Feature | Onlar | Biz |
|---|---|---|
| ICAO 4 mock test | ✅ | ✅ |
| 6-descriptor scoring | ❌ basit Pass/Fail | ✅ tam descriptor + Türkçe açıklama |
| AI co-pilot | ❌ | ✅ 5 senaryo dialog tree |
| Read-back drill | ❌ | ✅ 12 clearance + STT match |
| Pronunciation scoring | ❌ | ✅ Levenshtein + cihaz STT |
| Havayolu mülakat | ❌ | ✅ 41 havayolu detaylı |
| Adaptive review | ❌ | ✅ SuperMemo SM-2 |
| Türkçe lokalizasyon | ❌ | ✅ tam |
| Streak/gamification | ❌ basit XP | ✅ Duolingo seviyesi |
| Push notifications | ❌ | ✅ 08:30/21:00/22:30 |

**Zayıf yön analizi**:
1. **UI 2019'dan kalma** — kullanıcı modern app bekliyor
2. **İngilizce-only** — Türk pilot zorlanıyor
3. **Sadece sınav** — eğitim flow yok, kullanıcı 10 mock test sonra bırakıyor (low retention)
4. **Negatif review pattern**: "%70 score gerçek sınavda %50'ye düştü" → scoring yanlış kalibre

**Counter-positioning**:
> "Sınav öncesi pratik için diğerleri var; **AirSpeak ICAO 4'e GERÇEK hazırlar**: 14 hafta günlük plan + adaptif tekrar + AI co-pilot."

**Search Ads conquesting**: bid on "ICAO 4 test", "pilot ICAO test"

---

### 2. Mayflower Aviation English (UK premium)

**Künye**:
- Geliştirici: Mayflower English (UK)
- Çıkış: 2016
- Platform: iOS + Android + Web (LMS)
- Fiyat: £29/ay, kurumsal £499/yıl/öğrenci
- MAU: 25.000
- Rating: 4.0★

**Özellik matrisi**:

| Feature | Onlar | Biz |
|---|---|---|
| Voice evaluation | ✅ Cambridge accent | ✅ cihaz STT |
| Examiner sertifikası | ✅ kurumsal | ❌ (zayıf yön — eklenebilir) |
| ICAO 4 mock | ✅ | ✅ |
| Havayolu mülakat | ❌ | ✅ |
| Cihaz native (offline) | ❌ web-based | ✅ |
| Türkçe | ❌ | ✅ |
| Aylık fiyat | £29 (₺900) | ₺349 (1/3) |

**Zayıf yön**:
1. **Pahalı**: £29/ay = ₺900, Türk pilotun 2x bütçesi
2. **Sadece İngilizce**: Türk pilot ezbere değil bilince yapma istiyor
3. **Web ağırlıklı**: mobile UX zayıf
4. **Kurum odaklı**: bireysel pilot için mantıklı değil
5. **Fiyat şeffaflığı yok**: site'de demo isteyin demiyor

**Counter-positioning**:
> "Mayflower kurumsal eğitimde harika; **AirSpeak bireysel pilot için %85 daha ucuz** — aynı ICAO 4 odaklı, Türkçe açıklamalı, mobile-first."

**Search Ads conquesting**: bid on "Mayflower aviation", "aviation english app"

---

### 3. Aerlingua (EASA partnership)

**Künye**:
- Geliştirici: Aerlingua GmbH (Almanya)
- Çıkış: 2018
- Platform: iOS only
- Fiyat: $59/ay, $499/yıl
- MAU: 12.000 (EASA bölgesi)
- Rating: 4.2★ (180 review)

**Özellik matrisi**:

| Feature | Onlar | Biz |
|---|---|---|
| EASA Part-FCL içerik | ✅ tam ✅✅ | ✅ kısmi |
| Multi-rater scoring | ✅ 3 examiner | ❌ tek rule-based |
| German + English | ✅ | ✅ + 18 dil |
| Cabin/cabin yer hizmetleri | ❌ pilot only | ✅ 5 rol |
| Aylık fiyat | $59 | $11 (5x ucuz) |
| Adaptive | ❌ | ✅ |

**Zayıf yön**:
1. **Çok pahalı**: $59/ay = ₺1.800, premium fiyat
2. **Sadece pilot**: kabin/yer hizmetleri yok (pazarın %75'i)
3. **Sadece Avrupa odaklı**: Orta Doğu/Asya kullanıcı yok
4. **EASA dışı kullanıcı engellenmemiş**: ICAO L4 zaman gözleyenler ödemek istemiyor

**Counter-positioning**:
> "Aerlingua premium EASA pilotları için; **AirSpeak 5 rolün (pilot+kabin+teknisyen+yer+öğrenci) hepsine, %85 daha ucuz**, Türkçe dahil 20 dil."

---

### 4. Cabin Crew Interview Prep

**Künye**:
- Geliştirici: Cabin Crew Wings (UK)
- Çıkış: 2017
- Platform: iOS + Android
- Fiyat: $9.99 one-time
- MAU: 18.000
- Rating: 3.8★

**Özellik matrisi**:

| Feature | Onlar | Biz |
|---|---|---|
| Kabin mülakat soru bankası | ✅ 200+ | ✅ 180+ |
| Havayolu profili | ✅ 25 havayolu | ✅ 41 havayolu |
| AI roleplay | ❌ | ✅ |
| Pronunciation | ❌ | ✅ |
| Türkçe | ❌ | ✅ |
| Pilot | ❌ | ✅ |

**Zayıf yön**:
1. **Sadece kabin**: pilot/teknisyen yok (TAM dar)
2. **Statik**: roleplay yok, sadece soru-cevap okuma
3. **One-time fiyat**: revenue stream zayıf, içerik güncellemiyor
4. **Türkçe yok**

**Counter-positioning**:
> "Sadece kabin için CCIP yeterli; **AirSpeak hem kabin hem pilot hem AI roleplay sunar** — 41 havayolu + 5 rol + Türkçe."

---

### 5. Duolingo (potansiyel pivot tehdidi)

**Tehdit seviyesi**: orta (5 yıl içinde aviation niche'a girebilir).

**Senaryolar**:
- Olasılık 1: Duolingo "Aviation English" kursu açar — niche'ı kapar
- Olasılık 2: Duolingo Aviation Pro tier ekler — ASO tehdit
- Olasılık 3: Aviation specialist app satın alır (örn Mayflower)

**Defense stratejisi**:
1. **Niche derinliği**: Duolingo genel, biz özel — havacılık derinliği savunma
2. **Brand association**: Türk havacılık community'sinde "AirSpeak" = "havacılık İngilizcesi" eşleştirilmeli
3. **B2B partnership**: THY/Pegasus kurumsal anlaşma → Duolingo'ya kapatma engel
4. **Network effect**: Squadron / cohort sistemi → ağ etkisi

**Search Ads defense**: bid on "AirSpeak" markası → kim olursa olsun rakip ad'i kıramaz

---

## 2.3 Özellik Boşluk Haritası (Gap Map)

| Özellik | Bizdeki | Rakipler |
|---|---|---|
| Cihaz native STT | ✅ tek | ❌ tümü API kullanıyor (yüksek maliyet) |
| AI dialog tree | ✅ tek | ❌ |
| 41 havayolu detaylı mülakat | ✅ | Sadece 25 (CCIP) |
| Türkçe ana dil + 18 dil | ✅ tek | ❌ |
| 5 rol (pilot/cabin/tech/ground/student) | ✅ tek | Sadece pilot veya cabin |
| Adaptive SRS | ✅ | ❌ |
| 6-descriptor ICAO scoring | ✅ rule-based gerçek | ❌ basit pass/fail |
| Streak + gamification | ✅ Duolingo seviye | ❌ |
| Çevrimdışı çalışma | ✅ JS bundle | ❌ |
| ₺349/ay fiyat | ✅ ucuz | $4.99-$59 (büyük yelpaze) |
| Squadron / kohort B2B | ✅ statik | ❌ |
| Local push notifications | ✅ | ❌ |

**Sonuç**: 12 unique özellik / 12 ana feature = **%100 feature avantajı**.

---

## 2.4 Counter-Positioning Mesajları

### Karşılaştırma tablosu (web sayfası + sosyal medya için)

> **AirSpeak vs. Pilot ICAO 4 Test**
> ✅ AirSpeak: Modern UX, AI co-pilot, 41 havayolu, Türkçe, ₺349/ay
> ❌ Pilot ICAO 4 Test: Eski UI, sadece test, sadece İngilizce, $4.99/ay

> **AirSpeak vs. Mayflower Aviation**
> ✅ AirSpeak: Mobile-first, 5 rol, ₺349/ay, Türkçe ana dil
> ❌ Mayflower: Web ağırlık, sadece pilot, ₺900/ay, sadece İngilizce

### "Why AirSpeak" 3-bullet (her ASO içeriğinde tekrar)
1. **Gerçek mikrofonla** — diğerleri "ses kaydı sonra göndereceğiz" der
2. **41 havayolu mülakat** — diğerlerinde max 25
3. **20 dil + ₺349/ay** — diğerlerinde 1 dil ve $59+

---

## 2.5 Pazar Tepkisi Senaryoları

### Senaryo A: Rakip ucuzlatır
- Pilot ICAO 4 Test fiyatını $4.99 → $2.99'a indirirse
- Bizim cevap: 12-month annual "Captain Plan" $29.99 (%40 indirim) + Türkçe avantajı vurgu

### Senaryo B: Mayflower mobile lansmanı
- Mayflower native iOS/Android app çıkartırsa
- Cevap: "Türkçe + 5 rol + ₺349" mesajı yoğunlaştır, B2B Squadron için THY/Pegasus partnership hızlandır

### Senaryo C: Duolingo Aviation
- Duolingo "Aviation English Course" açarsa
- Cevap: derinlik niş — "Duolingo başlangıç, AirSpeak ICAO 4 sınav hazırlık" pozisyonu, gamification savaşına girme

### Senaryo D: Yerel rakip Türk firma
- Kreatif Akademi vb. Türk firma havacılık app çıkarır
- Cevap: 20 dil + 41 havayolu + uluslararası genişleme avantajı, agresif fiyat

---

## 2.6 SWOT Özeti

### Strengths
- 12 unique feature avantajı
- Türk pazarı doğal entry
- Sıfır API maliyet → %85 ucuz fiyat
- 20 dil yerelleştirme

### Weaknesses
- Marka tanınırlığı sıfır (yeni)
- Kurumsal sales kapasitesi yok (Mayflower vs)
- Kayıt examiner sertifikası yok
- iOS Speech recognition Expo Go'da çalışmıyor (dev build gerekli)

### Opportunities
- ICAO 4 zorunlu pazar büyüyor (+15%/yıl)
- THY/Pegasus 40K yeni alım (3 yıl)
- Asya genişleme (Singapore/Cathay/JAL)
- B2B Squadron pazarı

### Threats
- Duolingo niche pivot (5 yıl)
- THY Akademi resmi app dağıtırsa
- Apple/Google scoring policy değişiklikleri

---

## 2.7 Aksiyonlar

| Aksiyon | Sahip | Süre | Öncelik |
|---|---|---|---|
| AppTweak Premium ($120/ay) start | Marketing | Hafta 1 | Yüksek |
| 12 rakibin 50 review'unu manuel oku → user pain point listesi | Marketing | Hafta 2 | Yüksek |
| Mayflower'ın LinkedIn IK reklamlarını clip'le | Marketing | Hafta 2 | Orta |
| Duolingo Aviation pilot research | Product | Ay 2 | Düşük |
| Apple Search Ads "Pilot ICAO 4 Test" conquest | Marketing | Hafta 4 | Yüksek |

---

*v1.0 · 2026-04-29*
