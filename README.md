# AirSpeak

> Aviation English Tutor — havacılık İngilizcesi mobil öğrenme uygulaması.

**Domain:** [airspeak.app](https://airspeak.app) (satın alınacak)
**Hedef pazar:** Türkiye + global (EN-ana UI, TR tam destek)
**Hedef kullanıcı:** Pilot adayı, kabin memuru, teknisyen, yer hizmetleri, havacılık öğrencisi
**Fiyat:** ₺349/ay standart, ₺199/ay öğrenci, ₺2.499/yıl

## Mevcut Durum

- ✅ Plan onaylandı — bkz. [PROJECT_PLAN.md](./PROJECT_PLAN.md)
- ✅ Logo tasarlandı (vektörleştirilecek)
- ✅ **Sprint 0 kod iskeleti hazır** — Expo + TS + Tamagui + Supabase + i18n + auth + onboarding + tabs
- ⏳ Sprint -1: Figma tasarım + wireframe (paralel, kullanıcı tarafı)
- ⏳ Sprint 0 geri kalan: hesaplar, domain, npm install, ilk run
- ⏳ Sprint 1-9: MVP geliştirme

## Proje Yapısı (Sprint 0'da Oluşacak)

```
airspeak/
├── PROJECT_PLAN.md          # Ana plan dokümanı
├── README.md                # Bu dosya
├── app/                     # Expo Router ekranları
├── src/                     # Komponent, feature, lib, hook
├── supabase/                # Migration, edge function, seed
├── content-pipeline/        # AI içerik üretim + doğrulama
├── assets/                  # Logo, ikon, lottie, ses
└── docs/                    # Tasarım, architecture, runbook
```

## Hızlı Başlangıç

Henüz kod kurulumu yapılmadı. Sırayla:

1. [`SETUP.md`](./SETUP.md) — Hesaplar, domain, Figma ön hazırlık
2. [`SPRINTS.md`](./SPRINTS.md) — Sprint sprint görev listesi
3. PROJECT_PLAN.md — Kapsamlı teknik plan

## Stack Özet

- **Mobile:** React Native + Expo (SDK 52+) + TypeScript
- **Backend:** Supabase (Postgres + Auth + Storage + Realtime + Edge Functions)
- **State:** Zustand + TanStack Query
- **Ödeme:** RevenueCat
- **AI:** Claude (Haiku 4.5 + Sonnet 4.6) + Whisper STT + ElevenLabs TTS
- **Analitik:** PostHog
- **Hata izleme:** Sentry
- **UI:** Tamagui + NativeWind + react-native-reanimated + Lottie
- **i18n:** i18next (EN ana, TR tam destek)

## Sprint Durumu

| Sprint | Hafta | Durum |
|---|---|---|
| -1: Tasarım reference + wireframe | -1 | ⏳ Hazır |
| 0: Hesaplar + iskelet | 0 | ⏳ |
| 1: Auth + onboarding | 1-2 | ⏳ |
| 2: İçerik motoru | 3-4 | ⏳ |
| 3: Gamification | 5-6 | ⏳ |
| 4: SRS + lig + görev | 7-8 | ⏳ |
| 5: AI konuşma | 9-10 | ⏳ |
| 6: Telaffuz + premium | 11-12 | ⏳ |
| 7: Sınav + ICAO 4 sözlü | 13-14 | ⏳ |
| 8: Frazeoloji + offline + referral | 15-16 | ⏳ |
| 9: İçerik + cila + yayın | 17-18 | ⏳ |

## İletişim

Proje sahibi: Özlem Akçın
Geliştirme ortağı: Claude (Anthropic)
