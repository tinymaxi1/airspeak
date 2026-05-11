# 07 · Rating & Review Stratejisi

In-app review prompt timing, response template, negatif review playbook.

## 7.1 In-App Review Prompt — Tetikleyici Logic

### Kural: kullanıcı sevdi sinyali olunca iste, yoksa hiç isteme

### Tetikleyiciler (any 1)

| Sinyal | Eşik | Mantık |
|---|---|---|
| Lesson tamamlama | 5+ ders, ortalama %80+ score | "İçeriği seviyor + iyi performans" |
| ICAO mock pass | L4 üstü skor (PASSED) | "Hedefe ulaştı, mutlu" |
| Streak | 7+ gün | "Sürekli kullanıyor" |
| AI conversation | 3+ senaryo tamamlandı | "Premium feature kullanıyor" |
| Mağaza purchase | Coin/streak freeze sat alma | "Para harcıyor = engaged" |
| Paywall purchase | Pro Pilot abone oldu | "Maximum komitisyon" |

### Kullanılan kütüphane
**`expo-store-review`** veya **`react-native-store-review`** (in-app review API)

```ts
import * as StoreReview from 'expo-store-review';

if (await StoreReview.hasAction()) {
  await StoreReview.requestReview();
}
```

### Frekans Limitleri
- iOS: native API günlük max 1 prompt, yıllık 3 prompt (Apple kısıtlaması)
- Android: in-app review API yıllık ~1 prompt

### Bizim ekstra kontrol
- İlk istek: tetikleyici sonrası
- Reddedildi (review yok) → 60 gün bekle, tekrar dene
- Toplam max 3 istek (Apple zaten kısıtlıyor)

### State (Zustand persist)

```ts
interface ReviewState {
  hasReviewed: boolean;
  promptShownCount: number;
  lastPromptAt: number; // epoch ms
  triggerHistory: { type: string; date: number }[];
}
```

---

## 7.2 Custom Pre-Prompt Modal

Apple'ın native review sheet'i göstermeden önce **bizim kendi modalımız**:

### Akış
1. Kullanıcı bir tetikleyiciyi tamamladı
2. **Bizim modal**: "AirSpeak'i seviyor musun?" (basit Yes/No)
3. Yes → Apple native review sheet
4. No → in-app feedback formu (rating'e gitmez!)

### Modal görseli
```
┌─────────────────────┐
│        🎯           │
│                     │
│  AirSpeak'i        │
│  seviyor musun?     │
│                     │
│  Geri bildirimin    │
│  bizim için değerli │
│                     │
│  [ Evet, harika! ]  │
│  [ Geliştirmeli ]   │
└─────────────────────┘
```

### Niye pre-prompt
- Apple guideline: review prompt fairly used (Apple banlayabilir kötü kullanım)
- Memnun olmayanların **App Store'a gitmesini engelle** → in-app feedback'e yönlendir
- Bu pattern legal + Apple onayı çerçevesinde, dürüst kullanım

---

## 7.3 In-App Feedback Form (Negatif review yakalama)

### Akış
"Geliştirmeli" tıklayan kullanıcıya form:

```
Senin için neyi düzeltebiliriz?

[▼ Konu seç]
- AI Co-pilot çalışmıyor
- Pronunciation skor yanlış
- Ders içeriği yetersiz
- App donuyor / yavaş
- Fiyat çok yüksek
- Diğer

[Mesajın (opsiyonel)]
[          ]

[Gönder]
```

### Backend
- Form gönderilince:
  1. PostHog event: `feedback_submitted` + category
  2. Email: `ops@airspeak.app` notification
  3. Discord webhook'a #feedback channel
  4. Kullanıcıya "Mesajın alındı, 24 saat içinde dönüş yapacağız."

### Yanıt SLA
- 24 saat içinde personalised email
- Sorun çözüldükçe kullanıcıya bildir
- Çözüldü → "App Store'da review yazma" linki (ama dayatma)

---

## 7.4 Review Response Stratejisi

### App Store Connect → Reviews Bölümü
Apple developer response özelliği — public yanıt kullanıcıya görünür.

### Response Templates

#### 5★ olumlu
```
Çok teşekkürler {{name}}! 🎯
ICAO 4 yolculuğunda yanında olduğumuz için mutluyuz.
Önümüzdeki sürümlerde {{spesifik feature}} de eklenecek.
İyi uçuşlar — AirSpeak ekibi
```

#### 4★ orta
```
Geri bildirimin değerli {{name}}.
{{spesifik şikayete cevap}} konusunda {{çözüm}} planlıyoruz.
Update'te düzeldi mi diye dönüş yaparsan, çok seviniriz.
— AirSpeak ekibi
```

#### 3★ ve altı
**Kişisel email gönder ÖNCE** (App Store dışında):
```
{{name}} merhaba,

App Store yorumunu okuduk. {{specific issue}} bizim için kritik bir konu.

{{spesifik çözüm planı}} yaptık ve {{tarih}} sürümünde aktive olacak.
İstersen şu kodu kullan: AIRSPEAK-FREE3MO (3 ay ücretsiz Pro).

Kişisel olarak çözmek istiyoruz. Konuşalım mı?
ops@airspeak.app

— AirSpeak ekibi
```

Sonra App Store'da yanıt:
```
Merhaba {{name}}, kişisel email gönderdik. Konuyu çözmek için yanıtını bekliyoruz.
— AirSpeak ekibi
```

#### 1★ trolling/spam
- App Store Connect → Report a Concern (Apple inceler, çoğunlukla siler)
- Cevap verme — diğer kullanıcılara "AirSpeak savunmacı" görünmesin

---

## 7.5 Negatif Review Playbook

### Pattern 1: "Mock pronunciation, gerçek değil"
**Kullanıcı bu hâli farkettiyse** = bizim "gerçek STT" iddiamız onaylandı, kötü değil.

Yanıt:
> "Tamamen haklısın {{name}} — pronunciation'da kullandığımız iOS Speech framework cihazda işliyor. Eğer sonuçlar yanlış geliyorsa email at, model parametresini gözden geçirelim."

### Pattern 2: "Bedava mock test çalışmıyor"
Sebep: muhtemelen Pro user'ın kalan free quota'sı bitti.

Yanıt:
> "Free user'lar ayda 1 mock alabiliyor. {{name}}, 7-day trial'a giriş yaparsan tüm mock'lara erişimin olur. Discord'a yaz, manual aç bakalım."

### Pattern 3: "Çok pahalı"
**Bu beklenen şikayet** — niş app.

Yanıt:
> "Anladık {{name}}. Mayflower Aviation €29/ay alıyor, Aerlingua $59/ay — biz ₺349'la başlattık. Eğer öğrencisin .edu.tr ile ₺125/ay var. Yardım edebiliriz."

### Pattern 4: "App donuyor"
- Sentry crash log incele (kullanıcı email'i biliniyorsa device + version log)
- Hızlı patch
- Yanıt:
> "{{name}} crash logunu aldık, {{version}} fix ile çözüldü. Update et, OK olmazsa email."

### Pattern 5: "Türkçe çevirisi yanlış"
- Çeviri DeepL otomatik oluşturulmuş — bazı havacılık terimi yanlış olabilir
- Hızlıca glossary güncelle
- Yanıt:
> "Çevirideki {{spesifik problem}} için teşekkürler. v{{X}}'te düzeltildi. Glossary'mize eklendi, bir daha olmaz."

---

## 7.6 Rating Distribution Hedefi

### Yıl 1 hedef
- 5★: %75
- 4★: %18
- 3★: %5
- 2★: %1
- 1★: %1
- **Average**: 4.7★

### Karşılaştırma (sektör ortalama)
- Duolingo: 4.7★
- Babbel: 4.6★
- Pilot ICAO 4 Test: 3.5★ (rakip)
- Mayflower: 4.0★

### Yıl 1 hedef rakam
- 1.500 review (ASO için kritik kütle)
- App Store kategorisinde "popular reviews" için en az 200 gerekir

---

## 7.7 Review Generation Stratejisi

### Beta launch (pre-public)
- 100 beta tester (TestFlight)
- 80'i pilot/cabin/student profilinde
- Gönüllü feedback talep
- App Store launch günü ilk 30 review hazır

### Influencer review
- 10 pilot/havacılık influencer (Instagram TR)
- Free Pro Pilot 6 ay → 1 honest review
- Disclosure: "@AirSpeak ücretsiz hesap verdi"

### Retention reward
- 30+ gün streak'i kıran ya da sınava giren kullanıcılara: "App Store'da review yaz, 1 hafta Pro" promo
- Apple guidelines: review için maddi karşılık yasak — alternatif: "in-app reward"

### Email kampanyası
- 14 günde aktif kalanlara haftalık digest email
- İçinde "Review yazsana" minimal CTA (zorlamadan)

---

## 7.8 App Store Algoritması Bonus

### Apple Search Ranking için Review etkisi
- Yüksek rating (4.5★+) = kategori ranking boost
- Review count yüksek = "popular" badge
- Recency: son 90 günde review = freshness boost

### Optimum review posting
- Kullanıcı app'i indirdikten 2-7 gün arası → "fresh" review
- Major güncelleme sonrası 1-2 hafta → "what's new" boost

### Rating manipulation = ban
- Apple/Google yapay review tespiti AI ile çok güçlü
- Asla fake review satın ALMA
- Friends/family review legal ama disclosure gerekir

---

## 7.9 Review Tracking Dashboard

### App Store Connect Analytics
- Reviews → Region/Version filter
- Sentiment trend (Apple ML otomatik)
- Top issues kategorize

### Dış araç
- **AppFollow** ($79/ay) — multi-store review aggregation, sentiment AI
- **Ratings.io** — sentiment analiz, response automation

### Haftalık rapor
| Metrik | Ay 1 | Ay 3 | Ay 6 |
|---|---|---|---|
| Total reviews | 30 | 150 | 500 |
| Average rating | 4.5★ | 4.6★ | 4.6★ |
| Response rate | %100 | %95 | %90 |
| 1-2★ resolved | %100 | %90 | %85 |

---

## 7.10 Aksiyonlar

| Aksiyon | Sahip | Süre |
|---|---|---|
| `expo-store-review` integrate | Eng | Hafta 1 |
| Pre-prompt modal tasarım + implement | Eng | Hafta 2 |
| In-app feedback form (PostHog + email) | Eng | Hafta 3 |
| Response template TR/EN/AR | Marketing | Hafta 4 |
| Beta tester 100 toplama | Marketing | Hafta 4 |
| Influencer 10 outreach | Marketing | Hafta 6 |
| AppFollow abonelik | Marketing | Hafta 8 |
| Discord #feedback channel | Community | Hafta 4 |

---

*v1.0 · 2026-04-29*
