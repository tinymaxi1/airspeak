# 06 · Fiyatlandırma Stratejisi

Bölgesel pricing, IAP yapısı, A/B fiyat testi, sezonsal indirimler.

## 6.1 Mevcut Yapı (Baseline)

| Plan | TL | USD | Aylık eşdeğer |
|---|---|---|---|
| Pro Yıllık | ₺2.499 | ~$77 | ₺208/ay |
| Pro Aylık | ₺349 | ~$11 | ₺349/ay |
| Student (.edu.tr) | ₺1.499/yıl | ~$46 | ₺125/ay |

---

## 6.2 Bölgesel Fiyatlandırma (App Store/Play Store)

### Fiyat tier matrisi

| Bölge | Aylık | Yıllık | Yıllık tasarruf | App Store tier |
|---|---|---|---|---|
| **Türkiye (TR)** | ₺349 | ₺2.499 | %50 | TR-50, TR-249 |
| **AB EU (DE/FR/IT/ES/NL/PL/EL/PT)** | €9.99 | €69.99 | %42 | EU-Tier 9.99/69.99 |
| **UK** | £8.99 | £59.99 | %44 | UK |
| **ABD/Kanada** | $9.99 | $69.99 | %42 | US/CA |
| **Orta Doğu (AE/SA/QA)** | AED 39 ($10.6) | AED 269 ($73) | %42 | AED |
| **Asya — Premium (JP/KR/SG/HK)** | ¥1.500 / ₩12.900 / S$13.99 | ¥9.900 / ₩84.000 / S$89.99 | %45 | Tier 14.99/99.99 |
| **Asya — Emerging (IN/ID/TH/MY/PH)** | ₹399 / Rp 79.000 / ฿119 / RM 19.99 / ₱199 | ₹2.499 / Rp 549.000 / ฿829 / RM 139 / ₱1.399 | %48 | Tier 4.99/29.99 |
| **Latin America (BR/AR/MX/CL)** | R$ 24.99 / ARS 5.999 / MXN 199 | R$ 169 / ARS 35.999 / MXN 1.299 | %42 | LATAM tiers |
| **Africa (EG/NG/ZA)** | EGP 199 / NGN 4.500 / ZAR 199 | EGP 1.299 / NGN 29.999 / ZAR 1.299 | %46 | AF tiers |

### Fiyat psikolojisi
- "9.99" düz "10" yerine (charm pricing — %15 daha çok dönüşüm)
- "₺2.499" yerine "₺2.499/yıl" → kullanıcı süreyi anlasın
- "Tasarruf %50" üst etiketi → yıllık vurgu
- "₺208/ay" ek hesap → yıllık ucuz hissedilsin

### Apple App Store Tier Sistemi
Apple kendi fiyat tier sistemini dayatır (87 tier). Doğru tier seçimi:

| Tier | Aylık iOS | Yıllık iOS |
|---|---|---|
| Tier A.49 ($0.49) | — | — |
| Tier 9.99 ($9.99) | ✅ EN/EU | — |
| Tier 14.99 ($14.99) | ✅ JP/KR | — |
| Tier 49.99 ($49.99) | — | — |
| Tier 69.99 ($69.99) | — | ✅ EN/EU |
| Tier 99.99 ($99.99) | — | ✅ JP/KR |

---

## 6.3 IAP (In-App Purchase) Yapısı

### App Store Connect IAP Products

```
App: AirSpeak
├── Subscriptions
│   ├── Pro Pilot Annual
│   │   - Product ID: pro_pilot_annual
│   │   - Tier: 69.99 ($)
│   │   - Subscription Group: AirSpeak Pro
│   │   - Free Trial: 7 days
│   │   - Family Sharing: Yes
│   ├── Pro Pilot Monthly
│   │   - Product ID: pro_pilot_monthly
│   │   - Tier: 9.99 ($)
│   │   - Free Trial: 7 days
│   │   - Family Sharing: Yes
│   └── Student Annual
│       - Product ID: pro_student_annual
│       - Tier: 49.99 ($)
│       - Eligibility: .edu.tr verification
│       - Free Trial: 14 days (öğrenci avantaj)
└── Consumables
    ├── 100 coins ($0.99)
    ├── 500 coins ($3.99)
    ├── 1500 coins ($9.99) ⭐ best value
    └── 5000 coins ($24.99)
```

### Subscription Group Stratejisi
"AirSpeak Pro" group altında:
- Annual + Monthly aynı grupta → kullanıcı upgrade/downgrade kolay
- Student ayrı grupta → eligibility kontrolü
- Apple iCloud Family Sharing açık → "1 abonelik 6 kişi"

---

## 6.4 Pro Free Tier Sınırları

### Free user kısıtları (kullanıcı PROYE itmek için)

| Özellik | Free | Pro |
|---|---|---|
| Dersler | Sınırsız | Sınırsız |
| Vocab (1300 terim) | Tüm | Tüm |
| AI Co-pilot conversation | 5/gün | Sınırsız |
| ICAO 4 mock exam | 1/ay | Sınırsız |
| Examiner-graded recording | ❌ | ✅ |
| Adaptive review | ✅ | ✅ + boost |
| Read-back drill | 5/gün | Sınırsız |
| Pronunciation drill | 10/gün | Sınırsız |
| Hearts | 5 (30dk refill) | Sınırsız |
| Streak freeze | 1 (mağaza) | 3/ay otomatik |
| 41 Airline interview detayı | İlk 5 (TR fokus) | Tüm 41 |
| Offline lessons download | Disable | ✅ |
| Reklamsız | ❌ banner | ✅ |
| 2× XP boost | Mağaza coin | Hediye 1/hafta |

### "Premium feel" prensibi
Pro = "kısıtsız" hissettir, free = "yeterince" değil ama "rastgele" kapatma yok.

---

## 6.5 Trial Stratejisi

### 7-day free trial (default)
- Tam Pro erişim 7 gün
- Day 5: bildirim "Trial 2 gün sonra bitiyor — iptal edebilirsin"
- Day 6: bildirim "Yarın Pro başlayacak — iptal etmek için ayarlardan"
- Day 7: otomatik fatura (kullanıcı iptal etmediyse)

### 14-day trial (kampanya)
- Eylül (back-to-school) + Ocak (yıl başı) kampanyası
- Aynı dosya, sadece duration değişimi App Store Connect'ten

### "Cancel anytime" iletişimi
- Paywall altında: "İstediğin zaman iptal et. Dönem bitiminden 24sa öncesine kadar."
- Trust signal — refund/iptal kolaylığı seti

---

## 6.6 Fiyat A/B Testleri

### Test 1: Yıllık fiyat
**Hipotez**: ₺2.999 yıllık fiyat ile %15 fazla revenue (artış aylık tasarruf yüzdesini bozmaz)
- A: ₺2.499 (₺208/ay, %50 tasarruf)
- B: ₺2.999 (₺250/ay, %40 tasarruf)
- Süre: 30 gün
- Pazar: TR sadece (App Store Connect doesn't support price A/B globally)
- KPI: ARPU + conversion rate

### Test 2: Trial süresi
**Hipotez**: 14 günde dönüşüm 7 günden %5 yüksek
- A: 7-day trial
- B: 14-day trial
- Süre: 60 gün
- Pazar: tek pazar (eg. DE)

### Test 3: Ay bazlı vs yıl vurgu
**Hipotez**: Ay bazlı vurgu yıllık abonelik conversion'ını arttırır
- A: "₺2.499/yıl"
- B: "₺208/ay (yıllık)"
- Süre: 30 gün
- KPI: yıllık plan seçim oranı

---

## 6.7 Sezonsal Kampanyalar

### Eylül — Back-to-school
- Öğrenci tier %50 indirim → ₺749/yıl (3 ay sınırlı)
- "Üniversite havacılık ilk hafta — AirSpeak ile başla" kampanya
- Kanal: Üniversite IK ofisleri, Instagram öğrenci hesapları

### Ekim — World Pilot's Day
- "Pilot olmak için 41 havayolu mülakat hazırlığı" sosyal medya
- Pro yıllık -%20 → ₺1.999

### Aralık — Black Friday
- Yıllık plan -%30 → ₺1.749 (en agresif indirim)
- Single sales event (24 saat sınırlı)
- KPI: günlük 50 install / 20 trial-to-pro

### Ocak — New Year
- "Yeni yıl, yeni kariyer" kampanyası
- Bedava 14-gün trial 7-gün yerine
- Streak özendiren mesaj: "Yeni yıl streak'i koru"

### Mart — Dubai Air Show / Aviation conferences
- Orta Doğu pazara odaklı
- AED 199 yıllık (normal AED 269) → -%26

---

## 6.8 Refund Stratejisi

### Kullanıcı refund isterse
- Apple/Google üzerinden 14 gün otomatik (kanun)
- Bizim politikamız: **şüphesiz refund** — kötü duyuru değil iyi referans
- Email template:
  ```
  Merhaba,
  Refund'ın işleme alındı, 3-5 iş günü içinde kartında olur.

  AirSpeak'ten ne bekledin de bulamadın?
  Geri bildirim çok değerli, geliştirmeye yardımcı oluyor.

  Yine deneme isteyince ücretsiz aktive ederiz.

  — AirSpeak ekibi
  ```

### Apple/Google refund stats hedefi
- Refund rate < %2 (sektör ortalama %3-5)
- App Store Connect → Sales → Refunds rapor

---

## 6.9 Promotional Pricing

### App Store Connect Promotional Codes
- 100 promo code/ay (Apple verilir)
- Kullanım: influencer review, akademik kullanım, podcast sponsor
- "Free 1 month Pro" code'ları + tarih damgası

### Volume / Enterprise Pricing (B2B)
- 10+ lisans → %30 indirim
- 50+ lisans → %50 indirim
- 100+ lisans → custom (THY/Pegasus academy gibi)
- Email: enterprise@airspeak.io

---

## 6.10 Pricing Display Optimization

### Paywall ekranında nasıl gösterilir
1. **Annual üstte** (default seçili) — "BEST VALUE" badge
2. Monthly altında
3. Student "öğrenci misin?" linki, gerekirse açılır

### Visual hiyerarşi
- Annual: 3D card, gold badge, fiyat büyük
- Monthly: ince card, fiyat orta
- Student: dipnot link

### CTA copy
- "İlk 7 gün ücretsiz" üstte (fear-of-loss yok, "denemeye değer" hissi)
- "Trial sonrası ₺349/ay" küçük altta (transparent ama vurgulanmaz)

### Urgency creation (gerektiğinde)
- "Kampanya 2 gün kaldı" — ancak gerçek tarih, fake urgency YAPMA
- "1.247 pilot bu ay Pro'ya geçti" — sosyal proof

---

## 6.11 Predicted Revenue (Yıl 1)

### Senaryolar

**Konservatif** (15K install):
- 15.000 install × %12 trial-to-pro = 1.800 abonelik
- Mix: %70 yıllık (₺2.499) + %25 aylık (₺349 × 4 ay) + %5 student (₺1.499)
- Revenue: 1.260 × ₺2.499 + 450 × ₺1.396 + 90 × ₺1.499
- = ₺3.149K + ₺628K + ₺135K = **₺3.91M (~$120K)** Yıl 1

**Hedef** (20K install):
- 20.000 × %15 = 3.000 abonelik
- Aynı mix
- Revenue: ₺6.5M (~$200K) Yıl 1

**Aspirational** (35K install + Yıl 2):
- 35.000 × %18 = 6.300 abonelik
- Revenue: ₺13.5M (~$415K) Yıl 2

---

## 6.12 Aksiyonlar

| Aksiyon | Sahip | Süre |
|---|---|---|
| App Store Connect IAP product setup | Product | Hafta 1 |
| Subscription group + free trial config | Product | Hafta 1 |
| Bölgesel fiyat tier seçimi | Marketing | Hafta 2 |
| Promo code system (100 prepare) | Marketing | Hafta 3 |
| Refund policy yazımı | Legal + Support | Hafta 3 |
| Black Friday kampanyası planı | Marketing | Ay 6 |
| Fiyat A/B test 1 başla | Marketing | Ay 3 |
| Enterprise pricing tier | Sales | Ay 4 |

---

*v1.0 · 2026-04-29*
