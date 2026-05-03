# Apple App Store Privacy Nutrition Labels

> Sprint 8.E — App Store Connect submission'da kullanılacak veri-toplama deklarasyonu.
> Apple gereksinimleri: https://developer.apple.com/app-store/app-privacy-details/
> Son güncelleme: 2026-05-01

---

## Data Used to Track You

**None.** AirSpeak başka şirketlerin uygulamaları/web siteleriyle veri eşleştirmek
için tracking yapmaz. Reklam ID kullanımı yok, third-party tracking SDK (Meta,
TikTok, AppsFlyer vb.) yok.

---

## Data Linked to You

Aşağıdaki veriler kullanıcı kimliğine bağlı toplanır:

### Contact Info
- **Email Address** — hesap kayıt + giriş + KVKK başvuruları
  - Purpose: App Functionality, Account Management

### User Content
- **Audio Data** — ICAO sözlü egzersiz ses kayıtları
  - Saklama: 30 gün, sonra otomatik silinir
  - Purpose: App Functionality (sözlü değerlendirme)
- **Customer Support** — destek talepleri (email iletişimi)
  - Purpose: App Functionality
- **Other User Content** — komünite postları, yorumlar, profil bio
  - Purpose: App Functionality

### Identifiers
- **User ID** — Supabase auth kullanıcı ID'si (uygulama içi)
  - Purpose: App Functionality
- **Device ID** — push notification token (Expo)
  - Purpose: App Functionality

### Usage Data
- **Product Interaction** — tamamlanan dersler, XP, streak, lig sıralaması,
  ICAO değerlendirme sonuçları
  - Purpose: App Functionality, Analytics

### Diagnostics
- **Crash Data** — Sentry üzerinden hata raporları
  - Purpose: App Functionality, Analytics
- **Performance Data** — yüklenme süreleri, hata oranları
  - Purpose: Analytics

---

## Data Not Linked to You

Aşağıdaki veriler anonim toplanır (kullanıcı ID'siyle eşleştirilmez):

### Analytics
- **Product Interaction** (anonim) — PostHog üzerinden ekran ziyaretleri,
  buton tıklama event'leri. Kullanıcı ID hash'lenmiş olarak gönderilir,
  PostHog tarafında re-identify edilemez.
  - Purpose: Analytics, Product Personalization (aggregate)

---

## Data Sharing with Third Parties

KVKK + GDPR uyumlu standart sözleşme klozları (SCCs) altında:

| Vendor | Data | Region | Purpose |
|---|---|---|---|
| Supabase | Hesap, ilerleme, ses kayıtları | EU (Frankfurt) | Database, Auth, Storage |
| Anthropic (Claude) | Yazıya dökülmüş transcript | US | ICAO sözlü değerlendirmesi |
| OpenAI (Whisper) | Geçici ses (cihaz STT yoksa) | US | STT fallback |
| Expo Push | Push token | US | Notification delivery |
| Apple App Store | Faturalandırma | Global | IAP / abonelik |
| Sentry | Hata raporları | EU/US | Diagnostics |
| PostHog | Anonim analytics | EU | Product analytics |

---

## Age Rating

- **Apple Age Rating: 4+** (eğitim uygulaması, şiddet/cinsellik/sigara/alkol yok)
- **Google Play Content Rating: Everyone** (IARC: General Audience)
- Komünite alanında auto-moderation (banned words) + report sistemi aktif
- 13 yaş altı hesap engellidir (kayıt sırasında doğum tarihi opsiyonel ama
  Terms of Service md.2'de belirtilmiştir)

---

## Permissions Requested

| Permission | Purpose | Required |
|---|---|---|
| Microphone (NSMicrophoneUsageDescription) | ICAO sözlü, telaffuz, AI conversation | Optional (kullanıcı dilerse) |
| Speech Recognition (NSSpeechRecognitionUsageDescription) | Cihaz STT (kayıt sunucuya gitmez) | Optional |
| Notifications | Streak, lig, komünite bildirim | Optional |
| Photos (image picker) | Profil fotoğrafı + komünite post resmi | Optional |

---

## Pre-Submission Checklist

- [ ] App Store Connect → App Privacy → Data Types listesi doldur
- [ ] Privacy Policy URL: https://airspeak.io/privacy (veya app içi `/legal/privacy`)
- [ ] Terms of Use URL: https://airspeak.io/terms
- [ ] Account Deletion: app içi mevcut (Settings → Privacy → Hesabı kalıcı sil)
- [ ] Demo Account Apple Reviewer için: review@airspeak.io / DemoPass2026
- [ ] Age Rating: 4+
- [ ] Encryption Export Compliance: ITSAppUsesNonExemptEncryption = false (zaten app.json'da)

---

## Google Play Data Safety

Aynı veriler Google Play Console → Data Safety formunda:
- Data collected: Email, App activity (in-app actions), Audio (voice recordings),
  Crash logs, Performance data
- Data shared: Audio (Anthropic), Crash (Sentry)
- Data is encrypted in transit: Yes (HTTPS)
- Users can request data deletion: Yes (Settings → Privacy)
- Independent security review: TBD
- Adheres to Google Play Families Policy: N/A (target 13+)

---

## Yenileme Tetikleyicileri

Bu doküman aşağıdaki durumlarda güncellenmeli:
- Yeni 3rd-party SDK eklendiğinde
- Yeni veri toplandığında (yeni feature)
- Saklama süreleri değiştiğinde
- Vendor değiştiğinde (örn. Sentry → DataDog)
