# SETUP — Sprint -1 ve Sprint 0 Hazırlık Listesi

Sprint -1 ve Sprint 0 senin yapacağın manuel işlerden oluşuyor (hesap aç, domain al, Figma çalış). Aşağıdaki listeyi sırayla takip et.

---

## A. HEMEN BAŞLAYABİLECEK İŞLER (Hafta -1)

### 1. Domain Satın Alma 🔴 ÖNCELİKLİ
- [ ] **airspeak.app** — Cloudflare Registrar veya Namecheap'ten al (~$15-20/yıl)
- [ ] (Opsiyonel) **airspeak.ai** — premium yedek (~$80-100/yıl)
- [ ] (Opsiyonel) **useairspeak.com** — marketing yedek (~$10/yıl)
- [ ] DNS Cloudflare'e taşı (free, hızlı, koruma için)

### 2. Sosyal Medya Kullanıcı Adlarını Kap 🔴 ÖNCELİKLİ
"@airspeak" ya da "@airspeakapp" — birini seç, hepsinde aynı ol:
- [ ] Twitter/X
- [ ] Instagram
- [ ] TikTok
- [ ] YouTube (kanal aç)
- [ ] LinkedIn (sayfa aç)
- [ ] Threads (opsiyonel)

### 3. Hesaplar Açılması Gerekenler

#### 3a. Geliştirme & Backend
- [ ] **Apple Developer Program** — $99/yıl ($) — TC kimlik ile başvur
- [ ] **Google Play Console** — $25 tek seferlik
- [ ] **Supabase** — supabase.com, free tier başla, GitHub ile login
- [ ] **GitHub** — proje repo'su için (yoksa)
- [ ] **EAS (Expo Application Services)** — expo.dev, free tier yeter başlangıçta
- [ ] **Cloudflare** — DNS + Workers (free), domain registrar

#### 3b. AI Servisleri
- [ ] **Anthropic Console** — console.anthropic.com, $5-10 başlangıç kredisi koy (Claude için)
- [ ] **OpenAI Platform** — platform.openai.com, $10 kredi (Whisper STT için)
- [ ] **ElevenLabs** — elevenlabs.io, Creator plan $22/ay (TTS için, içerik üretimi)

#### 3c. Ödeme & Analitik
- [ ] **RevenueCat** — revenuecat.com, free tier <$2.5K MTR yeter
- [ ] **PostHog** — posthog.com, EU bölgesi free tier
- [ ] **Sentry** — sentry.io, free tier

### 4. Tasarım Ön Hazırlık (Sprint -1)

#### 4a. Reference Toplama
- [ ] **Mobbin.com** hesabı aç (free tier)
- [ ] 50 ekran screenshot al — kategoriler:
  - "Language learning" (Duolingo, Babbel, Busuu)
  - "Education" (Khan Academy, Quizlet)
  - "Onboarding"
  - "Pronunciation" (ElsaSpeak)
  - "Subscription paywall"

#### 4b. Figma Kurulum
- [ ] Figma.com hesabı aç (free tier yeter)
- [ ] Yeni dosya: `AirSpeak Design System`
- [ ] Yeni dosya: `AirSpeak Mobile App`
- [ ] Community'den indir (kopyalama, sadece incele):
  - "Language Learning App UI Kit"
  - "Education App Design"
  - "Mobile Onboarding Flow"

#### 4c. Color & Type Style (Figma)
PROJECT_PLAN.md Bölüm 19'daki paleti Figma'ya gir:
- [ ] Color styles: Navy 100-900, Blue 100-500, Amber 100/500, Slate, Semantic
- [ ] Text styles: Inter Bold (32/24/20/18), Inter Regular (16/14/12), JetBrains Mono (14)
- [ ] Spacing tokens: 4/8/12/16/24/32/48/64
- [ ] Radius: 8/12/16/9999

#### 4d. Logo Asset Üretimi
- [ ] Mevcut logo → Vector Magic veya Adobe Illustrator (AI image trace) ile SVG'ye çevir
- [ ] Logo varyantları:
  - `logo-full-light.svg` (mevcut versiyon)
  - `logo-full-dark.svg` (mavi → açık beyaz/mavi)
  - `logo-mark-only.svg` (sadece daire+uçak+balon, wordmark+tagline yok)
  - `wordmark-only.svg` (sadece "airspeak" yazı)
- [ ] App icon export:
  - `app-icon-1024.png` (App Store master)
  - `app-icon-512.png` (Play Store)
  - `app-icon-180.png` (iOS @3x)
  - `app-icon-120.png` (iOS @2x)
  - `favicon.ico` (16/32/48 multi-size)
  - `og-image-1200x630.png` (sosyal paylaşım)
- [ ] Tüm asset'leri `assets/logo/` klasörüne koy

### 5. EN Tagline Kararı
- [ ] Mevcut TR tagline: "Havacılık Dili Öğretici"
- [ ] EN tagline opsiyonları arasından seç:
  - "Aviation English Tutor"
  - "Master Aviation English"
  - "Speak the Sky"
  - "ICAO 4 starts here"

### 6. Wireframe (Sprint -1, Gün 4-5)
Figma'da `AirSpeak Mobile App` dosyasında 6 ana ekran low-fi wireframe:
- [ ] Ana Sayfa (streak, görevler, devam et)
- [ ] Öğren — ders ağacı
- [ ] Egzersiz — multiple choice örneği
- [ ] AI Konuşma — voice-to-voice
- [ ] Paywall — 3 plan kart
- [ ] Profil — istatistikler

---

## B. SPRINT 0 (Hafta 0) — Birlikte Yapacaklarımız

Bu kısım hesaplar açıldıktan sonra Claude ile birlikte yapılır:

### 7. Proje Kurulumu
- [ ] `npx create-expo-app@latest airspeak --template` (TypeScript + expo-router)
- [ ] Git'e ilk commit
- [ ] EAS yapılandırma (`eas init`)
- [ ] App.json: marka rengi, bundle id (com.airspeak.app), icon, splash

### 8. Bağımlılıklar
PROJECT_PLAN.md Bölüm 13'teki tüm paketleri kur

### 9. Çevre Değişkenleri (.env.local)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=
EXPO_PUBLIC_POSTHOG_API_KEY=
EXPO_PUBLIC_POSTHOG_HOST=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
SENTRY_DSN=
```

### 10. Supabase Kurulum
- [ ] Yeni proje aç (Europe West region — TR'ye yakın)
- [ ] İlk migration: profiles tablosu + RLS
- [ ] Auth providers: Email + Google OAuth

### 11. Tasarım Sistemi Kod
- [ ] Tamagui kurulum, theme config (logo paletinden)
- [ ] Inter + JetBrains Mono font yükle
- [ ] Atomic component'ler: Button, Input, Card, Modal, Sheet, Avatar, Badge, Progress

---

## C. ÖNEMLİ NOTLAR

- **Vergi/şirket:** Yıllık gelir 700K TL altı kaldıkça şahıs şirketi yeterli. Aşılırsa LTD'ye geç. Mali müşavir ile konuş.
- **KVKK:** Veri işleme aydınlatma metni + üyelik sözleşmesi + gizlilik politikası **App Store submission'dan önce** hazır olmalı (Sprint 9). Hukukçu danışman gerekir.
- **TC kimlik gereksinimi:** Apple Developer + iyzico (banka ödeme) için TC kimlik şart.
- **Banka hesabı:** Apple/Google ödemelerini alabilmek için **vadesiz TL hesap** + IBAN gerekiyor. Şahıs hesabı yeter.
- **Beta test grubu:** 30 kişi havacılık öğrencisi/profesyoneli. Üniversite gruplarından, LinkedIn'den, Twitter aviation topluluğundan toplanır.

---

## D. SORULARIM (Cevaplaman lazım)

1. **Apple Developer hesabı** açtın mı veya açacak mısın? (TC kimlik + kredi kartı gerekiyor)
2. **Anthropic Console** kredisi koyabiliyor musun? (~$5-10 başlangıç)
3. **ElevenLabs Creator plan** ($22/ay) için ödeme yapabilir misin?
4. **Domain bütçesi** hazır mı? (~$15-20 yıl)
5. **Beta test grubu** için tanıdığın havacılık öğrencisi/eğitmeni var mı?
