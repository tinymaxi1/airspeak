# 05C · App Preview Video — 30 saniye Storyboard

App Store + Google Play için 30 saniye App Preview video. Detaylı storyboard, her saniye karelenmiş.

## Specs

| Format | Apple | Google Play |
|---|---|---|
| Süre | 15-30 sn | 30 sn |
| Resolution | 1080×1920 portrait | 1080×1920 |
| Frame rate | 30 fps | 30 fps |
| Codec | H.264 | H.264 |
| Audio | optional ama önerilen | required |
| File format | .mov, .mp4 | .mp4 |
| Dil | her dil için ayrı video (max 3 farklı) | aynı |

**Apple kuralları**:
- App ekranlarının %80'i app içi (gerçek)
- Stock video / actor sınırlı
- Ses: cihazda kayıtlı veya stock audio (lisanslı)
- Caption / overlay: telif gerekçeli (font lisans)

---

## Master Storyboard (TR — birincil pazar)

### Saniye 0:00-0:02 — Açılış logo (2 sn)

**Görsel**:
- Bg: navy `#0F1E47` + topo line pattern
- Logo: AirSpeak monogram + uçak (gold)
- Text: "AIRSPEAK" alt + "Aviation English" eyebrow
- Animasyon: logo fade-in 0.5sn + topo pulse

**Ses**:
- Cockpit ambient (alçak frekans hum)
- 0.5sn'de "ding" notification sesi

**Caption**: yok (logo kendi konuşur)

### Saniye 0:02-0:06 — Hook: ICAO 4 problemi (4 sn)

**Görsel**:
- Pilot uniform actor (mock veya stock royalty-free)
- Yüz odaklı, ciddi ifade
- Üst caption: "ICAO 4 sınavın yaklaşıyor mu?"
- Alt: "Kabin/pilot mülakatına gerçek hazırlık ister misin?"

**Ses**:
- ATC frekans karışık + cockpit
- Voice over (TR, profesyonel kadın ses):
  > "ICAO 4 sınavın yaklaşıyor mu? Mülakat günü yaklaşıyor mu?"

**Caption**:
```
[üst, beyaz, 64px Plus Jakarta Bold]
ICAO 4 yaklaşıyor mu?
```

### Saniye 0:06-0:10 — Çözüm: AirSpeak app içi (4 sn)

**Görsel**:
- iPhone mockup (sağ alt)
- App'te welcome ekranı → home → tabs scroll (hızlı kesik)
- Üst caption: "Türk pilotların #1 uygulaması"

**Ses**:
- Tap sounds (iOS native)
- VO devam: "AirSpeak gerçek mikrofonla pratik yaptırır."

**Caption**:
```
Türk pilotların #1
havacılık İngilizcesi appi
```

### Saniye 0:10-0:14 — Read-back drill demo (4 sn)

**Görsel**:
- Read-back drill ekranı (recording stage)
- ATC bubble: "Turkish 1453, taxi to runway 35 left"
- Mic active animasyonu (kırmızı pulse)
- Live transcript yazılıyor: "Taxi to runway three five left, Turkish 1453"
- Sağ köşe: "92% MATCH" yeşil badge animate

**Ses**:
- ATC voice: "Turkish 1453, taxi to runway 35 left via Echo Six"
- 1 sn pause
- Kullanıcı sesi (mock) reading back
- "ding" success sound

**Caption**:
```
Gerçek mikrofonla
read-back pratiği
```

### Saniye 0:14-0:18 — AI Co-pilot demo (4 sn)

**Görsel**:
- Conversation screen (cockpit theme)
- Üst gauges (ALT/HDG/SPD/FREQ)
- ATC bubble holding pattern senaryosu
- User reply bubble (kırmızı)
- "READ-BACK CORRECT" feedback

**Ses**:
- ATC voice: "Hold at VECON, expect further clearance one-two-four-five Zulu"
- VO: "AI Co-pilot ile sınırsız ATC roleplay, 7/24."

**Caption**:
```
AI Co-pilot 7/24
sınırsız pratik
```

### Saniye 0:18-0:22 — ICAO 4 sonuç (4 sn)

**Görsel**:
- ICAO mock result ekranı animate
- L4 gold display fade-in
- PASSED damgası rotated stamp animation
- 6 descriptor bar fill animations

**Ses**:
- "Notification" success ding
- VO: "ICAO 4 sınavına 14 haftada hazırlan."

**Caption**:
```
ICAO 4 — 14 haftada hazır
```

### Saniye 0:22-0:26 — Liga + sosyal motivasyon (4 sn)

**Görsel**:
- League ekranı (gold tier header)
- Top 3 podium animate up
- Leaderboard scroll: kullanıcı 4. sırada highlight
- "240 XP daha lazım" alt mesaj

**Ses**:
- Crowd cheer (subtle)
- VO: "Captain liga ile diğer pilotlarla yarış."

**Caption**:
```
Captain liga · 49 pilot
haftalık yarış
```

### Saniye 0:26-0:30 — CTA (4 sn)

**Görsel**:
- Logo center (zoomed)
- Alt: "İlk 7 GÜN ÜCRETSİZ" red 3D button (welcome ekranındaki)
- App Store badge altta
- "airspeak.app" URL

**Ses**:
- Triumph musical sting
- VO: "İlk 7 gün ücretsiz. AirSpeak'i dene."

**Caption**:
```
İlk 7 gün ücretsiz
AirSpeak.io
```

---

## Üretim Workflow

### Pre-production
1. Ses: Türkçe VO için yetkin pilot/havacılık eğitmeni (Fiverr veya Voices.com, $80-150)
2. Müzik: Royalty-free (Artlist.io $20/ay veya Storyblocks)
3. Stock video: Pexels Free (havacılık sahneleri) veya Pond5 (premium)

### Recording
- App ekranları: simulator screenrecording (XCode → Capture device)
- Cihaz mockup: Mockuuups Studio veya AppMockup ($30/ay)
- Edit: Final Cut Pro veya DaVinci Resolve (free)

### Post-production
- Ses normalize (-14 LUFS)
- Color grading (mockup'larda screen brightness consistency)
- Export 1080×1920 H.264 30fps

### QA
- App Store Connect Sandbox preview test
- Sessiz cihazda da CTA mesajı anlaşılıyor mu (caption yedek)
- Subtitles: SRT dosyası ekstra (engelsiz erişim)

---

## Maliyet Tahmini

| Kalem | Fiyat |
|---|---|
| VO Türkçe (Fiverr) | $120 |
| Stock video lisans (5 clip) | $80 |
| Müzik lisansı (1 yıl) | $60 |
| Tasarımcı edit (8 saat × $40) | $320 |
| **TOPLAM ilk video** | **~$580** |

### 18 dilde caption versiyonu
- VO yeniden çekim 18 dil = $120 × 18 = $2.160 (pahalı)
- **Alternatif**: TR VO ana + 17 dilde sadece **subtitle** + müzik (edit $50/dil)
- Subtitle workflow: $50 × 17 = $850

**Toplam tüm dil video**: ~$1.430

---

## A/B Test Pipeline

### Varyant 1 (default): Yukarıdaki storyboard
### Varyant 2: Hook'u "Mülakat günü" olarak değiştir
- Saniye 0:02-0:06 farklı: "THY mülakatı 2 hafta sonra mı?"
### Varyant 3: Hook'u "Gerçek mikrofonla" iletmek
- Saniye 0:02-0:06: kullanıcı stress testi (pilot mic'e cevap verirken duruyor)

A/B 14 gün, KPI: video tamamlanma oranı + sonraki tap-through.

---

## Pazara Özel Adaptasyonlar

### Türkiye (default)
- VO Türkçe
- Caption Türkçe
- Müzik dramatik (Hans Zimmer-vari hava)
- Hook: ICAO 4 + THY mülakat ikileme

### Orta Doğu (AR)
- VO Arapça (Egyptian dialect, yaygın)
- Caption Arapça (RTL)
- Müzik daha melodik (Levant style)
- Hook: Emirates + Qatar mülakat vurgu

### Almanya (DE)
- VO Almanca
- Caption Almanca
- Müzik düz, kurumsal
- Hook: Lufthansa Pilotenausbildung + EASA vurgu

### Japonya (JA)
- VO Japonca (kibar form)
- Caption Japonca + İngilizce alt yazı
- Müzik minimalist
- Hook: ANA/JAL + ICAO 5 hedef vurgu

---

## App Preview Submission Notları

### Apple App Store
- App Store Connect → My Apps → Version → App Previews
- 6.9" / 6.7" / 5.5" / iPad ayrı upload (Apple kendi scale ETMEZ)
- Localized: TR, EN, AR, DE, FR, ES, JP, KO, ZH ana hedef pazarlar — bunlar için ayrı dil
- Diğer 12 dil için global EN versiyonu yeter

### Google Play
- Console → Main store listing → Graphics → Promo video
- YouTube link (unlisted) zorunlu — direct upload yok
- Çoklu dil için her dile ayrı YouTube video

---

## Sonraki versiyonlar (Roadmap)

### v2 — Influencer endorsement (3 ay sonra)
- Captain Ali Hoca (Türk pilot eğitmeni) endorsement clip ekle
- "Bu app ICAO 4'e gerçekten hazırlıyor" testimonial

### v3 — Kabin başvurusu sezonu (Eylül 2027)
- Hostess hedefli yeni storyboard
- "PA anonsları + emergency commands" odak

---

*v1.0 · 2026-04-29*
