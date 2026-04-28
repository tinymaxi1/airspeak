# 05A · Screenshot Specification — Detaylı Mockup Rehberi

10 screenshot, her biri için: layout, copy, görsel kompozisyon, pazara özel varyantlar.

## Boyut & Format

| Cihaz | Boyut | Format | Min/Max |
|---|---|---|---|
| iPhone 6.9" (15 Pro Max, 16 Pro Max) | 1290×2796 | PNG/JPEG | 3-10 screenshot |
| iPhone 6.7" (14 Plus, 15 Plus) | 1284×2778 | PNG/JPEG | Aynı |
| iPhone 5.5" (8 Plus) | 1242×2208 | PNG/JPEG | Aynı |
| iPad 13" (Pro M2) | 2064×2752 (portrait) | PNG/JPEG | 3-10 |
| iPad 12.9" (legacy) | 2048×2732 | PNG/JPEG | Aynı |
| Android Phone | 1080×1920 (16:9) veya 1080×2400 (20:9) | PNG/JPEG | 2-8 |
| Android Tablet 10" | 1200×1920 | PNG/JPEG | Aynı |

**Apple zorunlu**: 6.9" iPhone screenshot SET zorunlu, kalanlar otomatik scale.
**Google zorunlu**: 1080×1920 phone + 1200×1920 tablet zorunlu.

---

## Genel Tasarım Sistemi

### Renk paleti
- Bg: navy `#0F1E47` veya paper `#FAFAF7`
- Accent: kırmızı `#E63946` (CTA, vurgular)
- Gold: `#FFD56B` (premium, ICAO)
- Mono: JetBrains Mono (eyebrow, sayılar)
- Display: Space Grotesk Bold (caption, hero)

### Layout grid
```
┌─────────────────────────────────┐
│  STATUS BAR (gerçek görünür)   │  60px
├─────────────────────────────────┤
│                                 │
│   CAPTION TEXT (200px)         │  200px (üstten %15)
│   Plus Jakarta Bold 64px        │
│                                 │
├─────────────────────────────────┤
│                                 │
│   APP SCREENSHOT (gerçek)       │  ~2336px (cihazın geri kalanı)
│   iOS frame içinde              │
│                                 │
└─────────────────────────────────┘
```

### Typography hierarchy
- **Caption (üst)**: 64px Plus Jakarta Bold, 1.1 line height, color #FFFFFF veya #0F1E47
- **Subline** (gerekirse): 32px Plus Jakarta Medium
- **Eyebrow tag** (badge): 24px JetBrains Mono Uppercase, letter spacing 1.8

### Eylem prensibi
1. Her caption max 8 kelime (göz tarama 1.5 saniye)
2. CTA emoji + kelime kombinasyonu
3. App screenshot büyük, gerçek device frame
4. Sol-üst-orta okunabilir alan (göz hareketi)

---

## Screenshot 1: HERO

### Amaç
İlk izlenim. App'in ne olduğunu 1 saniyede anlatmak.

### Layout
```
[Üst caption] "Türk pilotların #1 havacılık İngilizcesi"
[Subline] "ICAO 4 sınavına 14 haftada hazırlan"
[Sub-eyebrow] CLEARED FOR TAKEOFF • 7-DAY FREE
[App screenshot] Welcome screen — navy + topo + "Speak like a captain"
```

### Copy varyantları (A/B test)

**A** (default):
- Caption: "Türk pilotların #1 havacılık İngilizcesi"
- Subline: "ICAO 4 sınavına 14 haftada hazırlan"

**B** (sınav vurgusu):
- Caption: "ICAO 4'e 14 haftada hazırla"
- Subline: "Gerçek mikrofonla, gerçek değerlendirme"

**C** (havayolu vurgusu):
- Caption: "41 havayolu mülakat tek uygulamada"
- Subline: "THY, Pegasus, Emirates, Qatar..."

### Tasarım kompozisyon
- Bg: navy `#0F1E47` + topo line pattern (mevcut TopoBackground)
- Üst bölge: caption (60% width, sol hizalı, beyaz)
- Alt: device frame içinde gerçek welcome screenshot
- Sağ alt köşe: küçük "v1.0" badge (mono, opaklık 30%)

---

## Screenshot 2: READ-BACK DRILL (Tek farklılaştırıcı)

### Amaç
"Diğer apps'ten farkımız" — gerçek mic + STT match.

### Copy
```
Caption: "Gerçek mikrofonla read-back pratiği"
Subline: "STT cihazda · sıfır API maliyeti"
Eyebrow: REAL VOICE EVALUATION
```

### Layout
- Üstte caption + emoji 🎙
- Altta read-back drill ekranı (recording stage):
  - ATC bubble: "Turkish 1453, taxi to runway 35 left via Echo Six"
  - Live transcript (kırmızı dashed): "Taxi to runway three five left, Turkish..."
  - Mic button kırmızı
- Sağ köşe: "92% MATCH" yeşil badge

### Pazara özel varyantlar
- **AR pazarı**: caption sağ hizalı (RTL)
- **JP pazarı**: caption Japon karakter set, "リアルマイク" vurgu

---

## Screenshot 3: AI CO-PILOT

### Amaç
"AI" satış argümanı — kullanıcı sınırsız pratik anlasın.

### Copy
```
Caption: "AI Co-pilot ile sınırsız ATC roleplay"
Subline: "5 senaryo, 7/24, sıfır maliyet"
Eyebrow: HOLDING PATTERN · VECON
```

### Layout
- ConversationScreen mocked
- ATC bubble + user reply + sayı badge "%94 match"
- Cockpit gauges üst (ALT/HDG/SPD/FREQ)

### Vurgu
- Gold çerçeve "PREMIUM" badge yok (free user'a da var)
- "Sınırsız" kelimesi yeşil renkli vurgu

---

## Screenshot 4: PRONUNCIATION SCORE

### Amaç
"Telaffuzun 0-100 arası ölçülür" — somut metric

### Copy
```
Caption: "Telaffuzun 0-100 arası ölçülür"
Subline: "Phoneme-level analiz, anında geri bildirim"
Eyebrow: PRONUNCIATION DRILL
```

### Layout
- 168px score ring (87 numarası ortada)
- Phoneme tiles altta (4 fon, 1 kırmızı = zayıf)
- "Native (US)" replay button
- "FOCUS · /mɪ/" tip card (kırmızı 3D)

### Vurgu
- Score 87 (good but not perfect — kullanıcı "ben de 90'lık olabilirim" diye düşünür)
- 1 kırmızı phoneme: "düzeltilebilir hata var" psikolojisi

---

## Screenshot 5: ICAO 4 MOCK RESULT (Etik vurgu)

### Amaç
"Gerçek ICAO değerlendirme" — diğer rakiplerde basit pass/fail var, biz 6-descriptor.

### Copy
```
Caption: "ICAO 4 sınavı 6 descriptor üzerinden gerçek değerlendirme"
Subline: "Pronunciation, Structure, Vocabulary, Fluency, Comprehension, Interactions"
Eyebrow: EXAM COMPLETE · L4 OPERATIONAL
```

### Layout
- Top: navy header + "L4" gold display 80px + "OPERATIONAL · ICAO Annex 1"
- Sağ üst: PASSED damgası (yeşil rotated)
- 6 descriptor bars (renk kodlu)
- Alt: "EXAMINER NOTE" detaylı geri bildirim

### Vurgu
- L4 başarılı ama düşük descriptor (Fluency 3) → kullanıcı "geliştirebilirim" hisseder
- "PASSED" damgası satılabilirlik

---

## Screenshot 6: 41 AIRLINES (USP — pazarlama açısından en güçlü)

### Amaç
"Rakipler 25 havayoluna kadar gidiyor, biz 41" — niceliksel üstünlük.

### Copy
```
Caption: "41 havayolu mülakat detayı"
Subline: "THY, Pegasus, Emirates, Qatar, Lufthansa, Singapore..."
Eyebrow: AIRLINE INTERVIEW BANK
```

### Layout
- Üst: caption + havayolu logosu sıralı (TK + PGS + EK + QR + LH + SQ)
- Alt: airlines listesinin scroll'u (region grouped: 🇹🇷 4 + 🕌 12 + 🏛 18 + 🏯 7)
- Sağ alt: "Daha fazlası →" CTA

### Pazara özel varyantlar
- **TR**: TK + PGS vurgu (logolar belirgin)
- **AE/SA**: EK + QR + EY öne (Emirates başta)
- **DE**: LH + LX + OS öne (Lufthansa)
- **JP**: NH + JL öne

---

## Screenshot 7: DAILY FLIGHT PLAN (Engagement)

### Amaç
Daily habit = retention. Streak + günlük plan = "her gün açıyorum".

### Copy
```
Caption: "Günlük plan + streak + günlük görev"
Subline: "Duolingo seviye gamification, havacılık temalı"
Eyebrow: DAY 12 · STREAK 🔥
```

### Layout
- Home navy header (Good morning, captain + 4 stat pill: streak/hearts/XP/level)
- Daily Flight Plan card (IST→JFK pattern, 2/3 progress)
- Week strip (M T W T F S S)

### Vurgu
- Streak "12" gold badge
- 2 lesson "done" yeşil çek

---

## Screenshot 8: ADAPTIVE REVIEW (SRS)

### Amaç
"Yarın yanlışlarını sana getirir" — bilim destekli öğrenme.

### Copy
```
Caption: "Yarın yanlışlarını sana getirir"
Subline: "SuperMemo SM-2 algoritması — Anki tarzı"
Eyebrow: ADAPTIVE REVIEW
```

### Layout
- Home ekranı (top: navy header)
- Gold review card vurgu: "🧠 BUGÜNKÜ TEKRAR · 12 kart hazır"
- Alt: "~3 dk · zayıf alanlarını sağlamlaştır"

### Vurgu
- 🧠 emoji ön plana (öğrenme bilim)
- Gold card kontrast (paper bg üzerinde)

---

## Screenshot 9: LEAGUE / LEADERBOARD

### Amaç
"Yarış" — sosyal motivasyon.

### Copy
```
Caption: "Captain ligine katıl"
Subline: "7 tier · haftalık reset · global yarış"
Eyebrow: TIER 4 OF 7 · 28h LEFT
```

### Layout
- League ekranı (gold tier header)
- Top 3 podium (gold/silver/bronze)
- Leaderboard rows + "EK · YOU" highlight (kırmızı)
- Alt: SAFE ZONE divider (yeşil dashed)

### Vurgu
- Kullanıcı 4. sırada — top 10 sınırına yakın
- "240 XP daha" alt mesaj (motive edici)

---

## Screenshot 10: PRO PILOT (Conversion)

### Amaç
"Pro nedir, ne kadar kazandırır" — paywall direct açıklama.

### Copy
```
Caption: "Sınırsız uçuş saati"
Subline: "AI co-pilot · ICAO mock · Examiner-graded"
Eyebrow: PRO PILOT · 7-DAY FREE
```

### Layout
- Paywall gold-on-navy (PRO PILOT badge)
- Hero "Unlimited flight hours."
- 3 plan cards (Annual / Monthly / Student)
- "BEST VALUE" badge gold

### Vurgu
- "İlk 7 gün ücretsiz" üst banner
- "₺2.499/yıl (₺208/ay — %50 tasarruf)" yıllık vurgu

---

## A/B Test Pipeline

### App Store Connect — Product Page Optimization (PPO)
3 alt-listing varyant olarak hazırla:

**Varyant 1 (default)**: tüm 10 screenshot mevcut sıra ile
**Varyant 2 (havayolu odaklı)**: screenshot 6 (Airlines) ilk sıraya
**Varyant 3 (sınav odaklı)**: screenshot 5 (ICAO PASSED) ilk sıraya

A/B 14 gün, %33-33-33 split. KPI: page view → install conversion rate.

### Beklenen sonuç
- **Hipotez 1**: Hero + Read-back + AI = en yüksek conversion (default)
- **Hipotez 2**: Sınav odaklı = ICAO 4 candidate'ları kazanır (sınav döneminde +%15)
- **Hipotez 3**: Havayolu odaklı = mülakat candidate'ları kazanır (alım dönemleri +%20)

---

## Localization (Per-Pazar Caption)

### TR (mevcut yukarıda)

### EN
1. "The #1 Aviation English app" → 1
2. "Real-mic read-back practice" → 2
3. "Unlimited AI Co-pilot ATC roleplay" → 3
4. "Pronunciation scored 0-100" → 4
5. "ICAO 4 evaluated on 6 descriptors" → 5
6. "41 airline interview details" → 6
7. "Daily plan + streak + quests" → 7
8. "Tomorrow brings your mistakes back" → 8
9. "Compete in the Captain league" → 9
10. "Unlimited flight hours" → 10

### AR (RTL)
- Caption sağ hizalı
- Sayılar Hindi-Arabic yerine Western (1, 2, 3 — havacılık standardı)
- Renk paleti aynı

### Pazarlama bölgesel kaydırma
- **TR**: Screenshot 6 öne (THY/Pegasus vurgu)
- **AE**: Screenshot 6 + 5 (Emirates + ICAO)
- **DE**: Screenshot 5 + 4 (sınav + telaffuz)
- **JP**: Screenshot 8 + 4 (öğrenme bilim + telaffuz)

---

## Üretim & Workflow

### Tools
- **Figma** (mockup tasarımı)
- **Hot Shot** veya **Mockuuups Studio** ($30/ay) — device frame mockup
- **Photoshop** veya **Affinity Designer** — final export
- **App Store Screenshot Generator** (Apple Configurator) — toplu export

### Pipeline
1. Figma'da template hazırla (1 master file, 10 frame)
2. Her frame'e uygun simulator screenshot embed
3. Caption text overlay
4. Export PNG (cihaz başına 10 dosya)
5. App Store Connect upload

### Süre tahmini
- İlk versiyonu: 8 saat tasarım + 2 saat test (TR + EN)
- A/B varyantları: 4 saat
- 18 dile localized caption: 6 saat (toplu güncellemeyle)

### Maliyet
- Designer (freelance): 8 saat × $50 = $400
- Pro tools subscription: $30/ay
- Native review (caption-level, 18 dil × $10): $180
- **Toplam ilk batch**: ~$610

---

## Quality Checklist

Her screenshot için:

- [ ] Caption ≤ 8 kelime
- [ ] Caption native speaker tarafından onaylı
- [ ] App screenshot gerçek (rendering, mockup değil)
- [ ] Status bar saat 9:41 (Apple convention)
- [ ] Carrier "AirSpeak" değil (default Verizon/T-Mobile/EE)
- [ ] Battery 100% görünür
- [ ] No personal data (gerçek email/isim)
- [ ] Resolution doğru (1290x2796 vs)
- [ ] Filename: `01_hero_tr.png` formatında
- [ ] App Store Connect Sandbox preview test

---

*v1.0 · 2026-04-29*
