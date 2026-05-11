# 15 · Launch Playbook — 12 Hafta Hareket Planı

Pre-launch (4 hafta) + Launch (1 hafta) + Post-launch (8 hafta) tam playbook.

## 15.1 Genel Lansman Stratejisi

### Lansman tarihi: 15 Eylül 2026 (akademik yıl başı)
**Sebep**: Türkiye'de havacılık fakülteleri açılır + yeni mezunlar başvuru sezonuna girer.

### Soft launch ne zaman?
- **Aralık 2026**: TestFlight beta (100 kullanıcı)
- **Mart 2027**: Public beta TR sadece (1.000 kullanıcı)
- **Eylül 2027**: Resmi global lansman

### Lansman ölçütleri (success criteria)

| Metrik | Soft launch | Public beta | Resmi lansman |
|---|---|---|---|
| Install | 100 | 1.000 | 5.000 ilk hafta |
| 7-day retention | %30 | %35 | %45 |
| Trial-to-pro | %5 | %10 | %15 |
| App Store rating | 4.0★ | 4.4★ | 4.6★+ |
| Crash rate | <%2 | <%1 | <%0.5 |
| Paying customers Day 30 | 5 | 100 | 750 |

---

## 15.2 PRE-LAUNCH (Hafta 1-4)

### Hafta 1 — Temel hazırlık

**Pazartesi**:
- [ ] App Store Connect + Google Play Console hesap aç
- [ ] Apple Developer Program $99/yıl (kişisel) veya $299/yıl (kurumsal)
- [ ] DUNS number kayıt (kurumsal Apple Dev için)

**Salı**:
- [ ] Bundle ID: `app.airspeak.mobile` reserve
- [ ] Apple Search Ads account başlat
- [ ] Google Play Console business verification

**Çarşamba**:
- [ ] AppTweak Premium $120/ay aboneliği başlat
- [ ] Sensor Tower trial
- [ ] Ahrefs $129/ay aboneliği

**Perşembe**:
- [ ] App icon final 3 varyant (V1/V2/V3) tasarla
- [ ] Screenshot frame template (Figma)

**Cuma**:
- [ ] Marketing site `airspeak.app` deploy (Next.js)
- [ ] Landing page: ICAO 4, mülakat, telaffuz
- [ ] SEO sitemap.xml + robots.txt

### Hafta 2 — İçerik üretim

**Pazartesi-Salı**:
- [ ] App Store Listing TR + EN tam yazımı (description, keywords, subtitle)
- [ ] 10 screenshot tasarım (TR caption)
- [ ] 30sn App Preview video edit (TR ses)

**Çarşamba-Perşembe**:
- [ ] 15 dilin keyword araştırması (DeepL + native review)
- [ ] 18 dilin description (otomatik) + manuel review
- [ ] 18 dilin caption (DeepL + check)

**Cuma**:
- [ ] Privacy policy + Terms yazımı (TR/EN, KVKK uyumlu)
- [ ] Aydınlatma metni
- [ ] In-app legal screen (kayıt sırasında "Okudum" checkbox)

### Hafta 3 — Teknik hazırlık

**Pazartesi**:
- [ ] App Store Connect IAP product setup (3 plan + 4 coin pack)
- [ ] Subscription group + free trial config
- [ ] Family Sharing açık

**Salı**:
- [ ] Google Play in-app billing entegrasyon test
- [ ] Apple StoreKit 2 entegrasyon test
- [ ] RevenueCat ($179/ay) entegrasyon (subscription analytics)

**Çarşamba**:
- [ ] Sentry account + DSN
- [ ] PostHog account + key (EU server)
- [ ] AppsFlyer attribution ($79/ay) — Search Ads tracking için

**Perşembe**:
- [ ] In-app review prompt logic implement (`expo-store-review`)
- [ ] Review trigger conditions test
- [ ] Pre-prompt modal tasarım

**Cuma**:
- [ ] Final Build (production)
- [ ] TestFlight upload + internal testing 10 kişi

### Hafta 4 — Beta & son hazırlık

**Pazartesi**:
- [ ] TestFlight Public Beta link create
- [ ] 100 beta tester invite (havacılık community)
- [ ] Beta feedback form (Google Form)

**Salı**:
- [ ] Press kit website hazır (`airspeak.app/press`)
- [ ] Logo pack export (5 varyant × 5 format)
- [ ] Press release v1.0 yazımı (TR/EN)

**Çarşamba**:
- [ ] Influencer outreach 15 Tier 3 kişiye (mail draft)
- [ ] Conference partner outreach (THY Akademi Career Day)
- [ ] Üniversite outreach 5 kişiye

**Perşembe**:
- [ ] App Store final submission (Apple review 1-3 gün)
- [ ] Google Play final submission

**Cuma**:
- [ ] Launch checklist final review
- [ ] Discord server hazır
- [ ] Newsletter signup form aktive

---

## 15.3 LAUNCH (Hafta 5)

### Lansman günü (15 Eylül 2026, Pazartesi)

**08:00**:
- [ ] Apple App Store + Google Play yayında doğrula
- [ ] Web sitesinden link aktif
- [ ] Sosyal medya post: "AirSpeak yayında!" (IG/TikTok/LinkedIn)

**09:00**:
- [ ] Press release distribution
  - PR Newswire (paid)
  - Email 15 Türk tech press
  - LinkedIn announcement
- [ ] Newsletter blast (eğer pre-launch list var)

**10:00**:
- [ ] Apple Search Ads campaign 1-3 aktive (TR)
- [ ] Bütçe day 1: $50 (test)

**11:00**:
- [ ] Influencer 5 sponsored post yayını (kombi posting)
- [ ] Discord server announcement
- [ ] Reddit r/turkey + r/aviation (organic post)

**12:00**:
- [ ] Founder LinkedIn post + 2 hour reply window
- [ ] Sales call 5 önemli press contact

**14:00**:
- [ ] Launch Day live AMA Discord (Founder + Lead Engineer)
- [ ] Instagram live demo (havacılık influencer co-host)

**16:00**:
- [ ] İlk 50 install metric review
- [ ] Crash log temiz mi check (Sentry)
- [ ] Apple Search Ads bid adjust

**18:00**:
- [ ] Day 1 metrics:
  - Install
  - Conversion (signup)
  - Crash rate
  - Rating

**20:00**:
- [ ] Founder kapanış post: teşekkürler + gelecek günler ne olacak

### Lansman haftası (Salı-Pazar)

**Salı**:
- [ ] Press follow-up (yayın olmadıysa hatırlatma)
- [ ] Influencer 5 daha post atsın

**Çarşamba**:
- [ ] Apple Search Ads optimization (top performing keyword'ler bid +%30)
- [ ] Apple Editorial pitch submission

**Perşembe**:
- [ ] Webrazzi + WebTekno makale yayınladı mı? Sosyal medya share
- [ ] Discord membership 200 hedef
- [ ] 1.000 install milestone tweet (achieved değilse, ona doğru push)

**Cuma**:
- [ ] Hafta 1 metric report
- [ ] İlk patch v1.0.1 hazırlık (eğer crash varsa)

**Cumartesi-Pazar**:
- [ ] Sosyal medya organic content (öğretici tone, "ICAO 4 nedir" karusel)
- [ ] Discord active engagement

---

## 15.4 POST-LAUNCH (Hafta 6-12)

### Hafta 6 — Optimization

- [ ] App Store Connect Analytics deep dive
- [ ] Top 10 keyword AppTweak ranking review
- [ ] Negatif keyword Search Ads ekle
- [ ] In-app review prompt tetik analizi
- [ ] Crash, ANR, hot fix v1.0.2

### Hafta 7 — Press push 2

- [ ] Aviation press outreach (Pilotcafe, Havayolu101)
- [ ] Aviation Week (international)
- [ ] Coverage stats topla
- [ ] Influencer Tier 2 (Captain Ali Hoca) onaylı mi?

### Hafta 8 — Conversion optimization

- [ ] Paywall A/B test başla (Annual vs Monthly default)
- [ ] Trial-to-pro %5 → %10 hedef
- [ ] Email retention sequence (Beehiiv) launch
- [ ] Discord moderator hire ($400/ay)

### Hafta 9 — Feature update v1.1.0

- [ ] Cabin sezonu features (THY 2027 başvuru bilgisi)
- [ ] Push notification calibrasyon
- [ ] Major release press push

### Hafta 10 — International expansion

- [ ] AE/SA pazarlarında Apple Search Ads
- [ ] Arabic native review tester 3 kişi
- [ ] Localization quality check 18 dil

### Hafta 11 — Editorial submission güncellemesi

- [ ] Apple Editorial pitch v2 (1.000+ install verisi ile)
- [ ] Google Play Editor's Choice submission
- [ ] Awards (Webrazzi 2026) submission

### Hafta 12 — Strategic review

- [ ] Day-90 retention rate
- [ ] LTV calculation
- [ ] Q4 roadmap (Aralık-Şubat)
- [ ] Bütçe review + Q1 2027 planning

---

## 15.5 Risk Mitigation

### Risk 1: App Store reject
- **Önlem**: 4 hafta önceden TestFlight stable, Apple Reviewer için demo notes
- **Plan B**: 24 saat içinde fix + re-submission

### Risk 2: Day 1 crash
- **Önlem**: Sentry alert <%1
- **Plan B**: Server-side feature flag ile broken feature kapat

### Risk 3: Düşük install Day 1
- **Önlem**: Press + influencer + Search Ads aynı gün koordineli
- **Plan B**: Apple Search Ads bütçeyi 5x'e çıkar (tek hafta)

### Risk 4: Negative review patlaması
- **Önlem**: Beta'da test, in-app feedback toplantı
- **Plan B**: Hızlı patch + kişisel email cevap her 1★'a

### Risk 5: Rakip taklitçi (Pilot ICAO 4 Test eskisini güncelliyor)
- **Önlem**: Apple Search Ads brand defense
- **Plan B**: PR push "AirSpeak orijinal" mesajı

---

## 15.6 Lansman Bütçesi

### Pre-launch (4 hafta)
| Kalem | Bütçe |
|---|---|
| Apple Dev + Google Play | $400 |
| AppTweak Premium 4 ay peşin | $480 |
| Ahrefs 4 ay | $516 |
| Sensor Tower 4 ay | $480 |
| Tasarım (icon + screenshot + video) | $1.200 |
| Web tasarım + dev | $2.000 |
| Native voice over (TR/EN) | $300 |
| Stock video lisans | $200 |
| Legal review (KVKK + Terms) | $1.500 |
| **Toplam pre-launch** | **$7.076** |

### Launch hafta
| Kalem | Bütçe |
|---|---|
| PR Newswire distribution | $300 |
| Apple Search Ads ilk hafta | $1.000 |
| 5 influencer Tier 3 sponsored | $2.500 |
| Discord server boost (Nitro) | $50 |
| **Toplam launch** | **$3.850** |

### Post-launch ay 1
| Kalem | Bütçe |
|---|---|
| Apple Search Ads sürekli | $4.000 |
| Influencer Tier 2 ambassador | $5.000 |
| Content team (editor + writer) | $3.500 |
| Tools sürekli | $300 |
| **Aylık total** | **$12.800** |

### TOPLAM 12 hafta lansman
$7.076 + $3.850 + $12.800 × 2.5 = **$42.926** (~₺1.4M)

---

## 15.7 KPI Targets — Lansman Süresi

### Hafta 1 sonu
| Metrik | Hedef | Stretch |
|---|---|---|
| Install | 500 | 1.500 |
| Signup | 350 | 1.100 |
| Trial start | 200 | 700 |
| Pro convert | 25 | 100 |
| Rating | 4.3★ | 4.6★ |
| Crash rate | <%1 | <%0.5 |

### Hafta 4 sonu
| Metrik | Hedef |
|---|---|
| Install | 3.000 |
| Trial-to-pro | %10 |
| Day-7 retention | %35 |
| Discord üye | 500 |
| Press coverage | 5 articles |
| Apple Search Ads ROAS | 3:1 |

### Hafta 12 sonu
| Metrik | Hedef |
|---|---|
| Install | 8.000 |
| Pro paying | 800 |
| Day-30 retention | %25 |
| Rating | 4.6★ (200 review) |
| Apple "Apps We Love" inclusion | ✅ |

---

## 15.8 Lansman Sonrası Roadmap (Ay 4-12)

### Ay 4-6: Türkiye Dominasyonu
- Top 5 "havacılık ingilizcesi" keyword
- THY HR pilot programı (B2B)
- 2 brand ambassador hire

### Ay 7-9: Avrupa Genişleme
- DE/FR/ES Apple Search Ads
- Lufthansa Aviation Training partnership
- ITB Berlin sponsorship

### Ay 10-12: Asya Hazırlık
- ZH/JA/KO localization perfect
- Cathay Pacific community engagement
- Dubai Air Show sponsor (Kasım 2027)

---

## 15.9 Aksiyonlar

| Aksiyon | Sahip | Süre |
|---|---|---|
| Lansman calendar Notion'a aktar | Marketing | Hafta 1 |
| Stand-up daily 9am | All | Hafta 1+ |
| Slack channel #launch | All | Hafta 1 |
| War room (lansman günü, Discord) | All | Lansman günü |
| Daily metric dashboard | Eng | Hafta 1 |
| Risk mitigation drill | All | Hafta 4 |

---

*v1.0 · 2026-04-29*
