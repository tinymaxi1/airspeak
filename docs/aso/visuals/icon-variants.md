# 05B · App Icon — A/B Variants & Tasarım Notları

## Mevcut Icon (V1 — baseline)
**Dosya**: `assets/logo/app-icon-1024.png`
**Konsept**: Navy circle + altın uçak silüeti + minimal monogram

---

## A/B Test Adayları

### V2: Türk Bayrağı Renkleri
**Konsept**: Kırmızı zemin + beyaz uçak (Türk pazarına yerel his)
- Bg: `#E63946` (Türk kırmızısı)
- Foreground: beyaz uçak silüeti
- Köşe: altın yıldız
- Avantaj: Türk pazarda %15+ hatırlama (psikolojik)
- Risk: Türkiye dışı pazarda yanıltıcı

### V3: Minimalist Monogram
**Konsept**: "AS" tipografi + havacılık altları
- Bg: koyu navy `#06091A`
- Foreground: "AS" Space Grotesk Bold beyaz
- Alt: küçük gold uçak ikonu
- Avantaj: scalable (Apple Watch, sıkışık görünümler)
- Risk: havacılık çağrışımı zayıf

### V4: Cinematic — Topo Background
**Konsept**: Logo + topo line pattern arka plan (welcome screen tasarımı)
- Bg: navy + radial gradient + topo lines
- Foreground: gold uçak (mevcut V1'in evrimi)
- Avantaj: brand consistency (welcome screen ile bağlantı)
- Risk: 1024x1024'da fazla detay → küçükte bulanık

### V5: ICAO L4 Badge Stili
**Konsept**: Boarding pass veya ICAO sertifikası tasarımı
- Bg: gold + navy stripe
- Foreground: "L4" + uçak
- Avantaj: ICAO sınav hazırlık vurgusu doğrudan
- Risk: niş anlam, genel kullanıcıya kapalı

---

## Test Plan (App Store Connect PPO)

### Varyant rotasyonu
**Test 1** (Hafta 1-4): V1 (default) vs V2 (Türk bayrağı)
- TR pazarda
- KPI: impression → product page click rate
- Beklenen: V2 +%12 (yerel his)

**Test 2** (Hafta 5-8): V1 vs V3 (monogram)
- Global pazarda
- KPI: PPV → install conversion
- Beklenen: V1 wins (havacılık çağrışımı)

**Test 3** (Hafta 9-12): Kazanan vs V4 (cinematic)
- Global
- KPI: install + retention day-7
- Beklenen: V4 brand consistency boost

### Metric ölçümler
- App Store Connect Analytics: "Impressions" → "Tap-through rate"
- AppTweak Premium: Search Tap Rate (sıralama × tıklama)
- App Annie/data.ai: kategori ranking değişim

---

## Tasarım Kuralları (her varyant için)

### Apple guidelines
- 1024×1024 px PNG (RGB, no alpha)
- No rounded corners (Apple kendi yapar)
- No transparency
- Dynamic Island / Notch dikkate al (üst kısım kritik)
- Light + Dark mode test (ayrı asset DEĞİL, tek)

### Google Play guidelines
- 512×512 px (master) → otomatik scale
- Adaptive icon (foreground + background ayrı katman) zorunlu
- Foreground: 432×432 safe zone
- Background: 512×512 düz renk veya gradient

### Genel ASO en iyi
- 1.5 sn göz testi: konsept anlaşılıyor mu?
- App Store search results küçük (60×60) — okunabilir mi?
- Yan yana 5 rakiple: ayrışıyor mu?
- Color contrast: light + dark theme'da görünür mü?

---

## Marka Tutarlılığı

### Renk paleti — yalnızca bunlardan
- Navy: `#0F1E47` (primary), `#06091A` (deep), `#0A1430` (ink)
- Red: `#E63946` (signature accent)
- Gold: `#FFD56B` (premium, ICAO)
- Paper: `#FAFAF7` (light bg)

### Tipografi
- Display: Space Grotesk Bold
- Body: Plus Jakarta Sans
- Mono: JetBrains Mono

### Form dili
- Boarding pass cutouts (yan yarım daireler)
- Topo line patterns
- Runway zig-zag (lesson tree'de)
- Cockpit gauge style

---

## Maliyet & Süre

### Tasarımcı freelance
- 5 varyant tasarım × 2 saat × $50 = $500
- A/B test sonrası 1 final + variants = $200
- **Toplam**: ~$700

### In-house
- Tasarım yetkin biri 3 gün
- App Store Connect upload + test 1 gün

---

## App Store Connect Upload Ayarları

### iOS
- App Store Connect → My Apps → AirSpeak → App Store → App Information
- Icon dosyası: 1024×1024 PNG
- Build edildikten sonra Xcode'dan otomatik küçültülür

### Google Play Console
- Console → Main store listing → Graphics → App icon
- 512×512 PNG + adaptive icon ayrı upload

---

## Future Roadmap

### Christmas / New Year özel
- Aralık'ta sınırlı süreli "❄️ kar tanesi" + uçak versiyonu
- Apple Search Ads "winter aviation" kampanya

### Pegasus partnership
- Eğer THY anlaşması olursa: özel co-branded icon (geçici)

### App Store Featured potansiyel
- "Apps We Love" inclusion için: clean V1 öneririm (Apple cinematic seven)

---

*v1.0 · 2026-04-29*
