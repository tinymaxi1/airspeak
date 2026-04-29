# AirSpeak

> Aviation English mobile app — ICAO Level 4 prep · 41 airline interviews · AI co-pilot · 1300+ vocab · 20 languages.

**Hedef kullanıcı:** Türk pilot adayları, kabin memurları, uçak teknisyenleri, yer hizmetleri operatörleri, havacılık öğrencileri.
**Pazar:** Türkiye odaklı, 20 dilde lokalize, global pazara açık.
**Fiyat:** ₺349/ay · ₺199/ay (öğrenci) · ₺2.499/yıl (Pro Pilot)

---

## ✈ Özellikler

| Modül | Detay |
|---|---|
| **AI Co-pilot** | 5+ scripted ATC senaryosu (holding, taxi, go-around, MAYDAY). Pattern matching + on-device STT — sıfır API maliyeti. |
| **ICAO Level 4 Mock** | 4 task tipi (picture, story, problem, topic) · 6-descriptor rule-based scoring · ICAO Doc 9835 uyumlu. |
| **41 Havayolu Mülakat** | THY · Pegasus · Emirates · Qatar · Lufthansa · Singapore + 35 daha. STAR formatlı detaylı cevap rehberleri. |
| **1300+ Vocab** | Rol bazlı havacılık terminolojisi. Kategori filtre + tam metin arama + bookmark + SRS (SuperMemo SM-2). |
| **Pronunciation Drills** | On-device STT (iOS Speech / Android SpeechRecognizer) + Levenshtein scoring. Sesin internete hiç çıkmaz. |
| **Read-back Drills** | 20+ ATC clearance. Anlama + tekrarlama + skor. |
| **Gamification** | XP · Streak · Hearts · Coins · 7-tier League · Squadron cohort · Quests. |
| **Offline-first** | Tüm dersler + vocab + senaryolar offline çalışır. NetInfo monitoring. |
| **20 Dil** | EN/TR ana dil, 18 dil DeepL Free + Argos. ICAO frazeoloji (Mayday, Squawk) tüm dillerde standart İngilizce. |

---

## 🛠 Stack

| Katman | Teknoloji |
|---|---|
| Mobile | **React Native + Expo SDK 52** + TypeScript |
| State | **Zustand** + persist (MMKV storage) |
| Routing | **expo-router** (file-based) |
| Speech | `expo-speech-recognition` (STT) + `expo-speech` (TTS) |
| Audio | `expo-av` |
| Notifications | `expo-notifications` (local push, sunucusuz) |
| Network | `@react-native-community/netinfo` |
| i18n | `i18next` + `react-i18next` |
| UI | Custom design system (`@/components/airspeak`) — Plus Jakarta Sans + Space Grotesk + JetBrains Mono |
| Analytics | PostHog (anonim) |
| Errors | Sentry |
| Translation | DeepL Free (16 lang) + Argos (offline fallback) |

**Backend:** Şu an offline-first, sunucusuz. Tüm state cihazda persisted (`MMKV`). İleride Supabase'e senkronize edilecek.

---

## 🚀 Hızlı Başlangıç

```bash
# 1. Bağımlılıklar
npm install

# 2. Geliştirme sunucusu
npx expo start

# 3. Type check
npx tsc --noEmit

# 4. iOS simulator
npx expo run:ios

# 5. Android
npx expo run:android
```

---

## 📁 Proje Yapısı

```
airspeak/
├── app/                          # Expo Router ekranları (file-based)
│   ├── (auth)/                   # Welcome → Register → Onboarding
│   ├── (tabs)/                   # Home, Learn, Practice, League, Profile
│   ├── conversation/             # AI Co-pilot scenario screens
│   ├── exam/                     # ICAO 4 mock + 41 havayolu
│   ├── lesson/[id].tsx           # Dynamic lesson runner
│   ├── settings/                 # Profile, language, privacy, help
│   └── _layout.tsx               # Stack navigator + i18n init
├── src/
│   ├── components/airspeak/      # Design system (typography, primitives, composites, lesson)
│   ├── stores/                   # Zustand stores (12+ persisted)
│   │   ├── authStore.ts
│   │   ├── gamificationStore.ts
│   │   ├── progressStore.ts
│   │   ├── srsStore.ts
│   │   ├── lessonHistoryStore.ts
│   │   ├── activityStore.ts
│   │   ├── bookmarkStore.ts
│   │   ├── coachMarkStore.ts
│   │   └── ...
│   ├── features/
│   │   ├── lessons/              # Generator + 1300+ vocab seed
│   │   ├── conversation/         # Scripted dialog tree + pattern matching
│   │   ├── exams/                # 41 airlines + interview Q bank (155 sorular)
│   │   ├── icao4/                # 6-descriptor scorer
│   │   ├── league/               # NPC simulator (deterministic Mulberry32 PRNG)
│   │   └── readback/             # Clearance drills
│   ├── lib/                      # i18n, posthog, sentry, storage, a11y, notifications
│   └── locales/                  # 20 dil JSON (en, tr, de, fr, es, it, pt, nl, pl, el, zh, ja, ko, id, ru, ar, fa, hi, th, ms)
├── scripts/
│   └── i18n/                     # Translation pipeline (DeepL + Argos + glossary + quality)
├── docs/
│   └── aso/                      # 16-doc App Store Optimization plan
└── assets/                       # Icons, fonts, sounds
```

---

## 🌍 i18n Pipeline

20 dilde tam çeviri:
- **EN/TR**: Manuel orijinal
- **13 dil DeepL Free**: DE/FR/ES/IT/PT/NL/PL/EL/ZH/JA/KO/ID/RU/AR
- **5 dil Argos**: FA/HI/TH/MS (offline)

```bash
npm run translate:check      # Quality skoru
npm run translate:usage      # DeepL kota
```

ICAO frazeolojisi (`Mayday`, `Squawk 7700`) tüm dillerde standart İngilizce kalır — uluslararası havacılık standardı.

---

## ♿ Accessibility

- **VoiceOver / TalkBack**: Tüm ana ekranlarda label + role
- **Dynamic Type**: iOS Larger Text desteği (H1/H2/H3/Body için scaleFont)
- **Reduce Motion**: AccessibilityInfo desteği
- **Color contrast**: WCAG AA (4.5:1 minimum)
- **44pt hit slop**: Tüm dokunma hedefleri

---

## 🔒 Gizlilik

- **Mikrofon kayıtları cihazda işlenir** — sunucuya gitmez (on-device STT).
- **KVKK + GDPR uyumlu**: Hesap silme + veri export + 30 gün grace period.
- **Anonim analitik**: PostHog opt-in.
- **Hata izleme**: Sentry (PII'siz).

---

## 📊 Sprint Durumu

| Sprint | Konu | Durum |
|---|---|---|
| 0 | Auth + onboarding | ✅ Tamamlandı |
| 1 | Lesson engine + 1300 vocab | ✅ Tamamlandı |
| 2 | Gamification (XP, streak, hearts) | ✅ Tamamlandı |
| 3 | SRS + League + Quests | ✅ Tamamlandı |
| 4 | AI Co-pilot (5 senaryo) | ✅ Tamamlandı |
| 5 | Pronunciation + ICAO 4 | ✅ Tamamlandı |
| 6 | 41 Airline + interview bank | ✅ Tamamlandı |
| 7 | Squadron + offline + referral | ✅ Tamamlandı |
| UX-1..7 | Accessibility + bookmarks + recents + coach marks | ✅ Tamamlandı |
| 8 | 4-boyutlu placement test | ⏳ Planlandı |
| 9 | İçerik üretim + cila + yayın | ⏳ |

---

## 📜 Disclaimer

AirSpeak resmi ICAO sertifikası **vermez** — pratik aracıdır. Resmi ICAO Level 4 sınavı SHGM yetkili merkezlerinde yapılır. AI değerlendirme kural-tabanlıdır, gerçek examiner sonucu değildir.

---

## 📧 İletişim

- Email: ops@airspeak.io
- Discord: discord.gg/airspeak
- Privacy: privacy@airspeak.io · KVKK: kvkk@airspeak.io

---

🤖 Geliştirme ortağı: [Claude](https://claude.com/claude-code) (Anthropic)
