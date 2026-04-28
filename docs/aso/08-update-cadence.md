# 08 · Update Cadence — Sürüm Ritmi

Major / Minor / Patch sürüm planı, "What's New" şablonları, App Store algoritması bonus.

## 8.1 Versiyon Numaralandırma

### Semantik versioning

```
1.2.3
│ │ │
│ │ └── Patch (bug fix, küçük dokunuşlar)
│ └──── Minor (yeni feature, geriye uyumlu)
└────── Major (büyük değişim, breaking change yapma — ama hissi)
```

### Cadence hedef
- **Major** (1.0 → 2.0): 6-9 ayda 1
- **Minor** (1.0 → 1.1): 4-6 haftada 1
- **Patch** (1.0.0 → 1.0.1): 2 haftada 1

### Release calendar (12 ay)
```
v1.0.0 — Lansman (Eylül 2026)
v1.0.1 — Patch (2 hafta sonra)
v1.0.2 — Patch (4 hafta)
v1.1.0 — Minor: kabin sezonu (6 hafta — Ekim)
v1.1.1 — Patch
v1.1.2 — Patch
v1.2.0 — Minor: ICAO 4 mock improvements (Aralık)
v1.2.1 — Patch
v1.3.0 — Minor: Asya genişleme + 7 havayolu (Ocak)
v1.3.1, v1.3.2 — Patches
v1.4.0 — Minor: Apple Watch app (Mart)
v1.5.0 — Minor: Squadron B2B + cohort sync (Mayıs)
v2.0.0 — Major: Anniversary release (Eylül 2027)
```

---

## 8.2 What's New / Release Notes

### Yapı (4000 char limit)

```
[1 satır kalın hook]

🆕 [Yeni feature 1]
🚀 [Yeni feature 2]
💎 [İyileştirme 1]
🐛 [Bug fix 1]

[CTA]
```

### v1.0.0 — Lansman (TR)
```
🛫 Kalkış!

🆕 41 havayolu mülakat bankası (THY, Pegasus, Emirates, Qatar...)
🆕 AI Co-pilot 5 senaryo aktif — sınırsız ATC roleplay
🆕 ICAO 4 mock sınav 6-descriptor değerlendirme
🆕 1.300 vocab × 5 rol (Pilot, Kabin, Teknisyen, Yer, Öğrenci)
🆕 20 dil arayüz — telefonun dilinde otomatik
🆕 Adaptive review (SuperMemo SM-2)
🆕 Local push notifications

🎁 İlk 7 gün ücretsiz!

Geri bildirim: ops@airspeak.io
```

### v1.0.1 — İlk patch
```
İlk haftanın geri bildirimi sıcak — teşekkürler!

🐛 Pronunciation skor bazen 50'de takılıyordu — düzeldi
🐛 Streak donumu bildirim dilinde glitch — TR güncellendi
💎 Read-back drill ATC sesi %20 daha net (TTS profil)
💎 SRS card animasyonu yumuşatıldı
🌐 18 dil çevirisi gözden geçirildi (45 string fix)

Ekibinin kullandığı app — daha iyi olalım.
```

### v1.1.0 — Kabin sezonu
```
👜 Kabin sezonu güncellemesi

🆕 THY 2027 başvuru bilgileri eklendi (3 yeni aşama)
🆕 Pegasus kabin mülakat 8 yeni soru
🆕 PA anonsları için 12 yeni senaryo
🆕 MEDA acil tıbbi vocab pack
🆕 Streak Freeze otomatik kullanım — bir gün kaçırırsan auto-protect

💎 Performance %25 hızlı (cold start 1.8sn)
💎 Lesson tree iOS 17+ Liquid Glass uyumu
🐛 12 küçük bug

Hızlı geçmişlere şans!
```

### v1.2.0 — ICAO 4 boost
```
🎯 ICAO 4 mock yenilendi

🆕 5 yeni senaryo: thunderstorm divert, hydraulic failure, depressurization
🆕 6 descriptor için detaylı Türkçe açıklama
🆕 Sertifika PDF export — kayıt tut
🆕 ICAO 4 hazırlık 14 haftalık plan otomatik üretimi

💎 Pronunciation accuracy +%15 (yeni glossary)
💎 Read-back drill 18 yeni clearance

🐛 ICAO sonuç ekranı L4 üstü skor düzgün hesaplanmıyordu — fixed
```

### v1.3.0 — Asya genişleme
```
🌏 Asya genişlemesi

🆕 7 yeni havayolu: Singapore, Cathay, JAL, ANA, Korean, AirAsia, Garuda Indonesia
🆕 Asya pazar için Çince/Japonca/Korece çeviri %100
🆕 Cross-cultural ATC senaryoları (8 yeni)
🆕 Apple Watch glance widget (akıllı saat)

💎 Performance %30 hız artışı (yeni JS engine Hermes 2)
💎 Offline mode artık tüm vocab + 50 ders dahil

🌐 41 havayolu artık 48
```

### v1.4.0 — Apple Watch
```
⌚ Apple Watch'a özel

🆕 Apple Watch app — streak + dailygoal + 1 minute drill
🆕 Watch'tan SRS card hızlı incele
🆕 Sesli not "Captain, your streak is at risk"
🆕 Heart rate detection: stres altında pratik (mülakat hazırlık)

💎 iOS 18 Live Activities — streak Lock Screen'de
💎 Dynamic Island progress streak

iPhone + Watch + iPad senkronize.
```

### v1.5.0 — Squadron B2B
```
👥 Squadron tam aktif

🆕 Kohort eşleşme: TK Akademi, Pegasus Cadet, Emirates Future Pilots
🆕 Eğitmen dashboard — haftalık ilerleme
🆕 Squad leaderboard — kendi kohort'unla yarış
🆕 Course completion sertifika

🌐 ICAO Annex 1 uyumlu logbook export
💎 Performance audit tamamlandı (60fps her ekran)

İlk yılımızda 20K pilot bizimle uçtu.
```

### v2.0.0 — Anniversary
```
🎉 1 Yaşına Girdik

🆕 AI 2.0: 50+ yeni senaryo, çok-tur dialog tree
🆕 Sertifika programı: AirSpeak Aviation English Certificate
🆕 Live tutor sessions (Pro+)
🆕 Hava trafik kontrolör rolü eklendi
🆕 AR/VR cockpit simülasyon (Apple Vision Pro)

💎 Tasarım yenilenmesi (cinematic 2.0)
🌐 50.000 pilot 1 yılda

Teşekkürler!
```

---

## 8.3 What's New Optimization

### App Store algoritması bonus
- **Yeni sürüm = freshness boost** (her 30 günde 1 sürüm = optimum)
- "What's new" indekslenir (keyword field gibi 100 char değil ama description gibi 2000 char)
- Major version değişimi Apple Editorial team radar'a girer

### Yazma kuralları
- İlk satır: hook (max 60 char) — App Store'da preview olarak görünür
- 1-3 yeni feature (emoji prefix)
- 1-2 iyileştirme (💎 emoji)
- 1-2 bug fix (🐛 emoji)
- Son satır: CTA veya kişisel mesaj

### Kelime seçimi
- "Yeni" yerine "🆕" emoji kullan (sayfada öne çıkar)
- "Hız" yerine "%25 daha hızlı" (somut)
- "Düzeltildi" yerine "{{spesifik bug}} fixed" (developer credibility)

---

## 8.4 Localized Release Notes

### Strateji
- TR ana dil — full release notes
- EN — full translation
- 18 dil — özet (1-2 line) + DeepL otomatik çeviri

### Otomatik çeviri pipeline
```
ana TR notes (manuel yazılan) →
DeepL translate to EN, AR, DE, FR... →
review by glossary script →
App Store Connect API upload
```

### Version sync
- TR sürüm açıklaması = EN tam ekvivalan
- Diğer 18 dil için DeepL çeviri (yine glossary check)

---

## 8.5 Release Promotion

### Major release: PR push
1. Press release hazırla (TR + EN)
2. Tech press outreach (15 publication)
3. Sosyal medya teaser (1 hafta öncesi)
4. Newsletter announce
5. Discord live demo
6. App Store Connect Promotional Text güncelle

### Minor release: marketing push
1. Sosyal medya + newsletter
2. App Store Promotional Text güncelle

### Patch: silent
- Sadece release notes

---

## 8.6 Beta Channel Strategy

### TestFlight Public Beta
- 100 kişi ile başla, lansman + 30 günde 1.000'e
- Power user + havacılık community + feedback aktif
- Beta sürümleri: v1.1.0-beta.1, beta.2 → v1.1.0 release

### Public Beta accept
- Discord'da "Beta Tester" rolü
- TestFlight invite link
- Geri bildirim formu zorunlu (haftada 1)

### Reward
- Beta tester'lara ücretsiz Pro Pilot 6 ay
- "Beta Tester" badge in-app (gold)
- Public release'te "Thank You" listesi

---

## 8.7 Roll-out Strategy

### Phased rollout (Google Play)
- %5 → 24 saat → bug yok mu?
- %20 → 48 saat
- %50 → 72 saat
- %100

### Apple App Store
- Apple "Phased Release" özelliği var (7 gün, otomatik)
- Default açık olsun

### Crash threshold
- Sentry crash rate > 1% olursa rollout durdur
- Hızlı patch hazırla, eski sürümü hold et

---

## 8.8 Aksiyonlar

| Aksiyon | Sahip | Süre |
|---|---|---|
| Release calendar (12 ay roadmap) | Product | Hafta 2 |
| TestFlight public beta link | Eng | Hafta 4 |
| Press release şablonu (major) | Marketing | Hafta 6 |
| Phased rollout policy | Eng | Hafta 8 |
| Sentry alert rules (1% crash) | Eng | Hafta 1 |
| What's new TR/EN sablon paketi | Marketing | Hafta 2 |
| Localized release notes pipeline | Eng | Ay 2 |

---

*v1.0 · 2026-04-29*
