# 16 · KPI Dashboard & Analytics

Metrikler, A/B test pipeline, kohort analizi, churn analiz.

## 16.1 KPI Pyramid

```
        🎯 NORTH STAR
        Pro paying users
              ↑
    ────────────────────────
    Conversion (Trial → Pro)
              ↑
    ────────────────────────
    Activation (Trial start)
              ↑
    ────────────────────────
       Acquisition (Install)
              ↑
    ────────────────────────
    Awareness (Impression, PPV)
```

### Her kademe için KPI

| Layer | KPI | Hedef Yıl 1 |
|---|---|---|
| Awareness | App Store impression | 250.000 |
| Awareness | Product page view | 60.000 |
| Acquisition | Install | 20.000 |
| Activation | Account creation | 17.000 (%85) |
| Activation | Lesson 1 complete | 12.000 (%70) |
| Activation | Trial start | 8.000 (%47) |
| Conversion | Trial-to-pro | 1.440 (%18) |
| Retention | Day-7 retention | %55 |
| Retention | Day-30 retention | %35 |
| Retention | Day-90 retention | %20 |
| Revenue | ARPU | $50 |
| Revenue | Total ARR | $72.000 |

---

## 16.2 Acquisition Metrics

### Channel attribution

| Kaynak | Yıl 1 install | CPI | LTV/CPI ratio |
|---|---|---|---|
| Apple Search Ads (TR) | 4.000 | $2.50 | 18:1 |
| Apple Search Ads (Global) | 2.000 | $5.00 | 10:1 |
| Organic search (App Store) | 5.000 | $0 | ∞ |
| Editorial featured (Apple) | 3.000 | $0 | ∞ |
| Press coverage | 1.500 | $0 (+PR cost) | high |
| Influencer | 2.500 | $4 | 12:1 |
| Blog/SEO | 1.000 | $0 (content cost) | high |
| Web direct (airspeak.app) | 500 | $0 | ∞ |
| Referral (squadron) | 500 | $0 | ∞ |
| **Toplam** | **20.000** | **$2.20 avg** | **22:1** |

### Tracking
- **AppsFlyer** (mobile attribution) — Apple Search Ads + Search Ads
- **PostHog** (web → app) — UTM tracking
- **App Store Connect Analytics** — organic
- **Google Analytics 4** — web traffic

---

## 16.3 Activation Funnel

### Step-by-step funnel

```
Install (100%)
   ↓ (-15%)
Account Created (85%)
   ↓ (-15%)
Onboarding Complete (70%)
   ↓ (-23%)
Lesson 1 Complete (47%)
   ↓ (-?)
Trial Started (47%)
   ↓ (-72%)
Pro Subscribed (13%)
```

### Drop-off analiz

| Adım | Drop-off | Sebep | Optimization |
|---|---|---|---|
| Install → Signup | %15 | Kayıt çok uzun | Single-tap Apple/Google sign-in |
| Signup → Onboarding | %15 | Onboarding 6 step çok | 3 step'e indir |
| Onboarding → Lesson 1 | %23 | İlk ders çok karmaşık | İlk ders 3 dakika basit (vocab match) |
| Trial → Pro | %72 | Free tier yeterince kısıtlı değil | AI co-pilot 5/gün → 3/gün düşür |

---

## 16.4 Retention Cohort Analysis

### Tipik SaaS app retention

| Day | Sektör ort | AirSpeak hedef |
|---|---|---|
| Day 0 (install) | %100 | %100 |
| Day 1 | %38 | %50 |
| Day 7 | %15 | %35 |
| Day 14 | %10 | %25 |
| Day 30 | %6 | %18 |
| Day 60 | %4 | %12 |
| Day 90 | %3 | %8 |

### Her cohort için tracking
- Acquisition channel (organic vs paid)
- Onboarding tamamlanma
- İlk ders score
- Streak gün sayısı
- Pro/Free segment

### PostHog Cohort Tool
- Funnel: install → lesson 1 → trial → pro
- Cohort: bu hafta install → 4 hafta sonra ne kadar kalır?
- Retention table

---

## 16.5 Revenue Metrics

### MRR (Monthly Recurring Revenue)

| Ay | Yeni Pro | Churn | Net MRR | MRR cumulative |
|---|---|---|---|---|
| Ay 1 | 50 | 0 | $1.500 | $1.500 |
| Ay 2 | 80 | 5 | $2.250 | $3.750 |
| Ay 3 | 120 | 10 | $3.300 | $7.050 |
| Ay 6 | 200 | 30 | $5.100 | $25.000 |
| Ay 12 | 350 | 60 | $8.700 | $80.000 |

### ARPU (Average Revenue Per User)
- Aylık plan: ₺349/ay × 12 = ₺4.188/yıl = $129
- Yıllık plan: ₺2.499/yıl = $77
- Student: ₺1.499/yıl = $46
- **Mix bazlı ortalama**: $75 (ay 1) → $50 (ay 12, daha çok yıllık plan tercih)

### LTV (Lifetime Value)
- Aylık abone ortalama 8 ay kalır → 8 × $11 = $88
- Yıllık abone ortalama 1.4 yıl kalır → 1.4 × $77 = $108
- Student 9 ay kalır → 9/12 × $46 = $35
- **Blended LTV**: ~$85

### LTV/CAC ratio
- Hedef: 3:1 minimum
- AirSpeak: $85 / $4 = 21:1 (çok sağlıklı)

---

## 16.6 Engagement Metrics

### DAU / MAU oranı (Daily Active / Monthly Active)
- Sektör ortalaması: %20 (Duolingo: %50, en iyi)
- AirSpeak hedef: %35 (gamification + streak güçlü)

### Session metrics
- Session/user/day: 1.5 (sektör 1.0)
- Session length: 12 dk (sektör 8 dk)
- Lessons/user/week: 8 (sektör 4)

### Streak distribution
- 0 gün streak: %40 kullanıcı
- 1-6 gün: %30
- 7-29 gün: %20
- 30+ gün: %10 (power user, en yüksek LTV)

---

## 16.7 Churn Analiz

### Churn pyramid
```
     Hard churn (cancel)
              ↑
     ──────────────
     Passive (didn't use)
              ↑
     ──────────────
     Active (used, churned)
```

### Sebep analiz (kullanıcı feedback'i)

| Sebep | %  | Önlem |
|---|---|---|
| "Pahalı" | %35 | Student tier vurgu, yıllık discount |
| "Yeterli içerik yok" | %20 | İçerik takvimi, weekly new |
| "Mülakatım bitti" | %15 | Post-interview "Pro pilot için kal" kampanya |
| "AI co-pilot beklediğim gibi değil" | %12 | UX iyileştirme, expected behavior eğitimi |
| "Telaffuz skoru güvenmiyorum" | %8 | Calibration dökümanı + improvements |
| Diğer | %10 | Random, kategorize edilemez |

### Retention campaigns

**Day 5 abandonement**:
- Email: "AirSpeak'i bıraktın mı? 3 dakikalık bir ders olur mu?"
- Discount: %20 ilk ay

**Trial canceled**:
- Email: "Geri bildirim verir misin? Ne eksikti?"
- Reactivation campaign: %40 indirim 30 gün sonra

**Pro canceled**:
- Exit survey
- Win-back: %50 indirim 60 gün sonra

---

## 16.8 A/B Test Pipeline

### Test öncelik matrisi

| Test | Beklenen impact | Effort | Priority |
|---|---|---|---|
| Paywall yıllık vs aylık default | ₺50K ARR | Low | ⭐⭐⭐ |
| App Store icon V1 vs V2 | %15 conversion | Low | ⭐⭐⭐ |
| Onboarding 6 step vs 3 step | %20 activation | Medium | ⭐⭐⭐ |
| First lesson easy vs hard | %15 day-1 retention | Low | ⭐⭐ |
| Pre-prompt review modal copy | %10 review rate | Low | ⭐⭐ |
| Subtitle "Pilot..." vs "ICAO..." | %8 conversion | Low | ⭐⭐ |
| Trial 7 days vs 14 days | %5 trial-to-pro | Medium | ⭐ |

### Test plan template

```markdown
# A/B Test: {{name}}

**Hipotez**: {{statement}}
**Metric**: {{primary KPI}}
**Hedef**: {{change %}}
**Süre**: {{days}}
**Sample size**: {{n}}
**Audience**: {{segment}}
**Stat sig threshold**: 95% confidence

## Variants
- A (control): {{description}}
- B (test): {{description}}

## Results
- A: {{n}} kullanıcı, {{metric}}
- B: {{n}} kullanıcı, {{metric}}
- Lift: {{%}}
- Confidence: {{%}}

## Decision
- Ship B / Ship A / Inconclusive

## Learning
- {{insight}}
```

---

## 16.9 Tools & Setup

### Analytics stack
- **PostHog** (event analytics, free for 1M events) — primary
- **Sentry** (crash analytics) — primary
- **AppsFlyer** ($79/ay) — mobile attribution
- **App Store Connect Analytics** — App Store native
- **Google Play Console** — Android native
- **AppTweak Premium** ($120/ay) — ASO + competitor
- **RevenueCat** ($179/ay) — subscription analytics

### Dashboard merkezi
- **Notion / Airtable** master KPI sheet (haftalık)
- **Looker Studio** (free, Google) — visual dashboard
- **Metabase** (open source) — SQL dashboard

### Daily metrics email
- Otomatik PostHog → Slack #metrics
- Format: install, signup, trial, pro, churn, rating

---

## 16.10 Reporting Cadence

### Daily (auto)
- Slack #metrics: install, signup, trial start, pro
- Crash rate alert (>1%)

### Weekly (manual, Pazartesi)
- Marketing review: keyword ranking, ad performance
- Product review: feature usage, A/B test progress
- Customer success: NPS, support ticket volume

### Monthly (1. iş günü)
- Founder dashboard: MRR, ARR, churn, LTV/CAC
- Team review: roadmap progress, OKR check
- Investor update (if applicable)

### Quarterly
- Strategic review: market share, competitive analysis
- Roadmap review: hangi feature başardı/başaramadı
- Budget reallocation

---

## 16.11 Bütçe & ROI Tablosu

### Yıl 1 bütçe dağılımı

| Kategori | Bütçe | Ayar |
|---|---|---|
| Engineering (3 dev) | $90.000 | Düşük TR rate |
| Marketing | $60.000 | Apple Ads + influencer + content |
| Product (designer + PM) | $30.000 | |
| Tools (analytics, ASO) | $5.000 | |
| Legal | $5.000 | |
| Office + misc | $10.000 | Remote-first |
| **Toplam YIL 1** | **$200.000** | |

### Yıl 1 revenue
- Hedef: $80.000 (8.000 paying × $10/ay × 12 ay × ortalama 1.5 ay = approx)
- Aspirational: $120.000

### Yıl 1 net
- Loss: -$80.000 to -$120.000 (yatırım dönemi)
- Yıl 2 break-even bekleniyor (60K ARR + 20K user)
- Yıl 3 profitability ($300K ARR, 100K user)

---

## 16.12 OKR Templates

### Q1 2026 (Lansman dahil)
**O1**: Lansman başarısı
- KR1: 5.000 install (ay 4 sonu)
- KR2: 4.5★ rating (200 review)
- KR3: %10 trial-to-pro

**O2**: Marka kurulumu
- KR1: 5.000 Discord member
- KR2: 10K Instagram follower
- KR3: 5 press feature (TR)

### Q2 2026
**O1**: Türkiye dominasyonu
- KR1: 12.000 install
- KR2: Top 5 "havacılık ingilizcesi"
- KR3: 1.500 paying users

**O2**: International prep
- KR1: AE/SA Apple Search Ads aktif
- KR2: 18 dil store listing yayın
- KR3: 3 international press feature

### Q3 2026
**O1**: Apple Editorial featured
- KR1: Apple "Apps We Love" inclusion
- KR2: Day-30 retention %25
- KR3: ARPU $55+

### Q4 2026
**O1**: Yıl 1 close
- KR1: 20.000 install (kümülatif)
- KR2: $80.000 ARR
- KR3: %18 trial-to-pro

---

## 16.13 Aksiyonlar

| Aksiyon | Sahip | Süre |
|---|---|---|
| PostHog event taxonomy | Eng | Hafta 2 |
| AppsFlyer setup | Eng | Hafta 3 |
| RevenueCat integration | Eng | Hafta 4 |
| Daily Slack metric bot | Eng | Hafta 5 |
| Weekly KPI dashboard (Looker) | Marketing | Hafta 6 |
| A/B test framework (PostHog feature flags) | Eng | Hafta 8 |
| Cohort retention table | Marketing | Hafta 10 |
| Churn survey email automation | Marketing | Hafta 12 |
| OKR Q1 2027 review | All | Yıl sonu |

---

*v1.0 · 2026-04-29*
