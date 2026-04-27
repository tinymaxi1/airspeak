# PROJECT_PLAN.md — AirSpeak (Havacılık İngilizcesi Mobil Uygulaması)

> **Marka adı: AirSpeak** — "Hava + Konuşma". Net, betimleyici, global anlaşılır, telaffuz vaadini doğrudan iletir.

> Bu dosya onaylandıktan sonra proje kök dizinine `PROJECT_PLAN.md` olarak kopyalanacaktır.

---

## 0. Bağlam (Context)

**Problem:** Türkiye'deki havacılık öğrencileri ve profesyonelleri (pilot adayı, kabin memuru, teknisyen, yer hizmetleri) ICAO Seviye 4, SHGM İngilizce Yeterlilik Sınavı, YDS Havacılık ve sektör mülakatlarına özel hazırlanmış, **Türkçe arayüzlü, rol bazlı, gerçekten öğreten** bir mobil uygulamaya sahip değil. Mevcut çözümler genel İngilizce öğretiyor; havacılık jargonu, sınav simülasyonu, telaffuz analizi yok.

**Hedef:** 16-18 haftada MVP. Premium ürün konumlanması — ₺349/ay çapa fiyat. 1. yıl 1.500 ücretli abone, 2. yıl 4.000 abone hedefi.

**Sonuç:** Havacılık öğrencisinin ve profesyonelin **gerçekten İngilizce öğrendiği**, ICAO 4'ü geçtiği, mülakatta konuşabildiği, fiyatı haklı çıkaran sonuç odaklı bir uygulama.

**Kritik karar (kullanıcıyla):**
- **Üretim modeli:** Solo (Claude) + AI çapraz doğrulama. Eğitmen bütçesi yok.
- **AI konuşma + telaffuz:** MVP'de var (₺349'u haklı çıkarmak için şart).
- **MVP'ye eklenen 7 kritik özellik:** ICAO 4 sözlü AI examiner, sınav günü geri sayım, NOTAM/METAR/ATIS okuma, frazeoloji cep sözlüğü, offline indirme, konuşma kayıt arşivi, referral sistemi.
- **Faz 2 öncelik:** Topluluk + peer practice (sesli oda, kullanıcı eşleşmesi).
- **Risk azaltma:** İçerik doğrulama protokolü (aşağıda detay).

---

## 1. Teknoloji Stack'i

| Katman | Teknoloji | Gerekçe |
|---|---|---|
| Mobil framework | **React Native + Expo (SDK 52+)** | Tek kod tabanı, OTA update |
| Dil | **TypeScript** | Tip güvenliği |
| Backend | **Supabase** (Free → Launch'ta Pro) | Auth + Postgres + Storage + Realtime + RLS |
| State | **Zustand** + **TanStack Query** | Sade UI state + server cache |
| Cache | **react-native-mmkv** | Offline ders verisi |
| Ödeme | **RevenueCat** | iOS/Android abonelik soyutlama; Apple/Google Small Business %15 |
| Bildirim | **expo-notifications** | Edge Function'la trigger |
| Ses oynatma | **expo-av** | Diyalog, dinleme |
| **AI Konuşma** | **Claude Haiku 4.5** (ucuz) + **Sonnet 4.6** (zor sorularda) | Voice-to-voice rol oyna, mülakat simülasyonu |
| **STT (Speech-to-Text)** | **OpenAI Whisper API** ($0.006/dk) | Telaffuz tanıma + transkript |
| **TTS (Text-to-Speech)** | **ElevenLabs Turbo v2.5** veya **Cartesia** | AI cevabı sesli okuma + ses içerik üretimi |
| **Telaffuz analizi** | Whisper word-level confidence + custom phoneme matching | MVP için yeterli; Faz 2'de Speechace |
| Analitik | **PostHog** | Funnel + feature flag |
| Hata izleme | **Sentry** | Crash + perf |
| Form | **react-hook-form** + **zod** | Validasyon |
| Navigasyon | **expo-router** | File-based, deep link |
| UI | **NativeWind** + **react-native-reanimated** + **lottie** | Tailwind RN + animasyon |
| i18n | **i18next** + **expo-localization** | **EN ana dil (global ürün liderliği için)**, TR tam destek MVP'de, AR/RU/ES Faz 2 |
| Reklam (free tier) | **react-native-google-mobile-ads** | AdMob, sadece free kullanıcı |

---

## 2. Klasör Yapısı

```
thy-app/
├── app/                          # expo-router ekranları
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── onboarding/
│   │       ├── role-select.tsx
│   │       ├── level-test.tsx
│   │       └── goals.tsx
│   ├── (tabs)/
│   │   ├── home.tsx
│   │   ├── learn.tsx
│   │   ├── practice.tsx
│   │   ├── league.tsx
│   │   └── profile.tsx
│   ├── lesson/[id].tsx
│   ├── quiz/[id].tsx
│   ├── exam/[type].tsx
│   ├── conversation/[scenario].tsx     # AI konuşma
│   ├── pronunciation/[id].tsx          # telaffuz drill
│   ├── badges.tsx
│   ├── shop.tsx
│   ├── paywall.tsx
│   └── _layout.tsx
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── lesson/                     # 6 egzersiz tipi
│   │   ├── gamification/               # xp, streak, hearts
│   │   ├── ai/                         # voice recorder, conversation bubble
│   │   └── league/
│   ├── features/
│   │   ├── auth/
│   │   ├── lessons/
│   │   ├── srs/                        # SM-2 algoritması
│   │   ├── ai-conversation/            # Claude entegrasyonu
│   │   ├── pronunciation/              # Whisper + analiz
│   │   ├── gamification/
│   │   ├── subscription/
│   │   └── notifications/
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── revenuecat.ts
│   │   ├── claude.ts                   # Anthropic SDK
│   │   ├── whisper.ts
│   │   ├── elevenlabs.ts
│   │   ├── posthog.ts
│   │   ├── storage.ts
│   │   └── queryClient.ts
│   ├── hooks/
│   ├── stores/
│   ├── types/
│   ├── constants/
│   ├── utils/
│   └── locales/
│       ├── tr.json
│       └── en.json
├── supabase/
│   ├── migrations/
│   ├── functions/                      # AI proxy, cron, content review
│   └── seed/
├── content-pipeline/                   # İçerik üretim & doğrulama
│   ├── prompts/                        # Üretim prompt template'leri
│   ├── validation/                     # ICAO Doc 9432 referansı, çapraz LLM kontrol
│   ├── output/                         # JSON ders dosyaları
│   └── scripts/                        # batch generation, import
├── admin/                              # (Faz 2) Next.js admin
├── assets/
├── app.json, eas.json, package.json, tsconfig.json
```

---

## 3. Veritabanı Şeması (Supabase / Postgres)

### 3.1. Kullanıcı & Profil
```sql
profiles (
  id uuid PK references auth.users, username, full_name, avatar_url,
  role text check (role in ('pilot','cabin','technician','ground','student')),
  level text check (level in ('A1','A2','B1','B2','C1')),
  daily_goal_minutes int default 15,
  timezone text default 'Europe/Istanbul',
  active_hours int[] default '{18,19,20,21}',
  is_student bool default false,                   -- .edu.tr doğrulama
  created_at, updated_at
)
user_settings ( user_id PK, notifications_enabled, sound_enabled, language, ... )
```

### 3.2. İçerik
```sql
categories ( id, slug, name_tr, name_en, role, icon, order_index )
courses ( id, category_id, title_tr, level, role, order_index, is_premium )
units ( id, course_id, title_tr, order_index, xp_reward, is_premium )

lessons (
  id, unit_id, title_tr, type,  -- vocabulary|dialogue|listening|reading|pronunciation|conversation
  content jsonb, duration_minutes, xp_reward, is_premium, order_index,
  -- içerik doğrulama metadata
  generated_by text,             -- ai|manual
  validation_status text,        -- pending|cross_validated|user_verified|flagged
  icao_reference text,           -- 'Doc 9432 §4.2.1' gibi
  generated_at timestamptz, validated_at timestamptz
)

exercises (
  id, lesson_id, type,  -- multiple_choice|fill_blank|match|listen|speak|order|conversation
  question jsonb, answer jsonb, explanation_tr text,
  difficulty int, xp_reward int default 10,
  validation_status text
)

audio_assets (
  id, lesson_id, url, transcript_tr, transcript_en,
  duration_seconds, source text  -- elevenlabs|cartesia|liveatc|recorded
)

-- SRS terim havuzu (sütun 1 — terim hafızası)
vocabulary_terms (
  id, term text, term_tr text, definition_en, definition_tr,
  category_id, role, level, audio_url, image_url,
  example_sentences jsonb,            -- 5 örnek cümle
  pronunciation_phonetic text,
  icao_reference text,
  validation_status text
)

-- AI konuşma senaryoları (sütun 3)
conversation_scenarios (
  id, role, level, title_tr, context_prompt text,  -- Claude system prompt
  initial_message text, success_criteria jsonb,
  estimated_duration_minutes, xp_reward, is_premium
)

exam_simulations ( id, type, title_tr, total_questions, time_limit_minutes, is_premium, free_preview_count default 1 )
exam_questions ( id, exam_id, question, options jsonb, correct_answer, explanation, ... )
```

### 3.3. İlerleme + SRS
```sql
user_lesson_progress ( user_id, lesson_id, status, score, attempts, last_attempt_at, PK(user_id, lesson_id) )
user_exercise_attempts ( id, user_id, exercise_id, is_correct, time_spent_seconds, created_at )
user_exam_attempts ( id, user_id, exam_id, score, completed_at, answers jsonb )

-- SRS state (SuperMemo SM-2)
user_term_srs (
  user_id, term_id,
  ease_factor numeric default 2.5,    -- SM-2 EF (1.3-2.5)
  interval_days int default 1,
  repetitions int default 0,
  next_review_at timestamptz,
  last_quality int,                   -- 0-5 (kullanıcı zorluk değerlendirmesi)
  PK(user_id, term_id)
)

-- AI konuşma logları + arşiv (kullanıcı geri dinler, ilerlemeyi görür)
user_conversations (
  id, user_id, scenario_id, started_at, ended_at,
  message_count int, transcript jsonb,
  audio_url text,                     -- tüm konuşma birleşik ses dosyası (replay için)
  scores jsonb,                       -- {fluency, vocabulary, grammar, pronunciation}
  xp_earned int, tokens_used int,     -- maliyet takibi
  is_archived bool default true,      -- premium kullanıcı sınırsız tut, free 7 gün
  exam_mode text                      -- null|icao_oral|interview|story|picture
)

-- ICAO 4 sözlü sınav AI examiner soruları
oral_exam_prompts (
  id, type text,                      -- picture|story|problem|topic
  prompt_tr text, prompt_en text, image_url text,
  expected_duration_seconds int, level text, role text,
  evaluation_rubric jsonb              -- ICAO 4 6 alan: pron, struct, vocab, fluency, comp, interactions
)

-- Sınav günü geri sayım planı
user_exam_schedules (
  id, user_id, exam_type, exam_date,
  daily_plan jsonb,                    -- AI üretilen 30 günlük plan
  status text, created_at
)

-- NOTAM/METAR/ATIS okuma materyalleri
aviation_documents (
  id, type text,                       -- notam|metar|taf|atis|chart
  raw_text text, decoded_tr text, difficulty int,
  comprehension_questions jsonb, audio_url text
)

-- Frazeoloji cep sözlüğü
phraseology_entries (
  id, term text, category text,        -- ground|tower|approach|enroute|emergency
  context text, icao_reference text,
  example_audio_url text, search_vector tsvector
)

-- Offline indirme takibi
offline_downloads (
  id, user_id, content_type, content_id,
  size_bytes, downloaded_at, expires_at
)

-- Referral sistemi
referrals (
  id, referrer_user_id, referred_user_id, code text,
  status text,                         -- pending|signed_up|subscribed
  reward_granted bool, created_at, completed_at
)
referral_codes ( user_id PK, code text unique, total_invites int, total_subscribed int )

-- Telaffuz attempts
user_pronunciation_attempts (
  id, user_id, term_id, audio_url,
  transcript_actual text, target_text text,
  word_accuracy_scores jsonb,         -- her kelime için 0-100
  overall_score int, created_at
)
```

### 3.4. Gamification
```sql
xp_logs ( id, user_id, amount, source, source_id, created_at )
user_xp_summary ( user_id PK, total_xp, current_level, xp_in_level, xp_to_next, weekly_xp )

streaks ( user_id PK, current_streak, longest_streak, last_activity_date, freeze_count default 0 )
streak_freezes_used ( id, user_id, used_on_date, source )

badges ( id, slug, name_tr, description_tr, icon_url, category, requirement jsonb, xp_reward, coin_reward, is_hidden )
user_badges ( user_id, badge_id, earned_at, PK(user_id, badge_id) )

daily_quests ( id, user_id, date, quests jsonb, completed_count, claimed )
quest_templates ( id, type, target_value, xp_reward, coin_reward, description_tr, role )

leagues ( id, name, tier, min_xp, color, icon )
league_seasons ( id, week_start, week_end, status )
user_league_membership ( user_id, season_id, league_tier, weekly_xp, rank, PK(user_id, season_id) )

hearts ( user_id PK, current default 5, max default 5, last_refill_at, refill_interval_minutes default 30 )
coins ( user_id PK, balance default 0 )
coin_transactions ( id, user_id, amount, reason, reference_id, created_at )
shop_items ( id, slug, name_tr, description_tr, cost_coins, type, is_premium_only )
user_purchases ( id, user_id, item_id, purchased_at, used_at )
```

### 3.5. Abonelik
```sql
subscriptions (
  id, user_id, revenuecat_customer_id, product_id,        -- standart_monthly | standart_yearly | student_monthly | student_yearly
  status, started_at, expires_at, will_renew, platform, raw_event jsonb
)
subscription_events ( id, user_id, event_type, raw jsonb, created_at )

-- AI maliyet takibi (premium kullanıcı bile maliyet çıkarır)
ai_usage_logs (
  id, user_id, feature text,           -- conversation|pronunciation|exam_feedback
  model text, tokens_in int, tokens_out int, cost_usd numeric, created_at
)
```

### 3.6. Bildirim, Sosyal, İçerik Doğrulama
```sql
push_tokens ( user_id, token, platform, last_seen_at )
notification_logs ( id, user_id, type, sent_at, opened_at )

content_flags (             -- Kullanıcı "bu yanlış" bildirimi
  id, user_id, content_type, content_id, reason text, status, created_at
)
content_reviews (           -- Solo doğrulama protokolü logları
  id, content_id, content_type, validator text,    -- claude_sonnet|gpt4|human
  result jsonb, created_at
)

friendships, forum_posts, forum_comments  -- Faz 2
```

**RLS:** Tüm tablolar açık. Kullanıcı sadece kendi `user_id`'sine ait kayıtları okur/yazar. İçerik tabloları herkese okunur. AI logları sadece kullanıcının kendi.

---

## 4. Ekran Listesi (44 Ekran)

### Auth & Onboarding (22 — conversion-optimized detaylı versiyon)
1. **Splash**
2-4. **Welcome 3 slayt** (problem-empati / çözüm-magic / acil-CTA, conversion psikolojisi)
5. **Auth method choice** (Apple / Google / Email)
6. **Register form** (canlı şifre güvenlik göstergesi)
7. **Email verification**
8. **"Sen kimsin?"** (5 rol kartı)
9. **"Hangi durumdasın?"** (öğrenci/mezun/çalışan/sektör değiştiren)
10. **"Hedefin ne?"** (multi-select 1-3, 8 seçenek)
11. **"Sınav tarihin var mı?"** (conditional, DatePicker)
12. **"Seviyeni nasıl tarif edersin?"** (4 seçenek + emin değilim)
13. **"Hangi alanlarda zorlanıyorsun?"** (multi-select 7 alan)
14. **"Konularda rahatlık?"** (rol bazlı 4 madde, 1-5 slider)
15. **"Günde ne kadar zaman?"** (5/10/15/30/60+ dk)
16. **"En aktif saatler?"** (multi-select 4 dilim)
17. **Placement test açılışı** (panik yapmama mesajı)
18-26. **Placement test 10 soru** (audio + image + multi-format, A1→C1 progression)
27. **Sonuç ekranı** (level rozet + 6 alan bar grafiği + spesifik vaat)
28. **Kişisel plan önerisi** (timeline + günlük dakika + tahmini sonuç)
29. **Bildirim izni + onay** (3 spesifik trigger seçimi)

### Ana Tab (5)
9. Ana Sayfa (günün görevleri, streak, "Kaldığın yerden devam"), 10. Öğren (ders ağacı), 11. Pratik (quiz + AI konuşma + sınav hub), 12. Lig, 13. Profil

### Ders & Pratik (8)
14. Ders Detayı, 15. Egzersiz Ekranı (6 tip), 16. **AI Konuşma Ekranı** (voice-to-voice, transkript), 17. **Telaffuz Drill**, 18. SRS Tekrar Ekranı, 19. Ders Sonucu, 20. Ünite Tamamlandı, 21. Ders Kilidi (mini paywall)

### Sınav (3)
22. Sınav Listesi (ICAO 4, SHGM, YDS, Mülakat), 23. Sınav Çözme, 24. Sınav Sonuç (band score + AI zayıflık analizi)

### Gamification (4)
25. Rozetler, 26. XP & Level Detay, 27. Mağaza, 28. Can Bekleme

### Premium (3)
29. Paywall (Standart vs Pro karşılaştırma), 30. Trial Aktif, 31. Premium Pro tanıtım

### Yeni MVP Özellikleri (9)
32. **ICAO 4 Sözlü AI Examiner** — picture/story/problem/topic 4 görev, AI değerlendirme, ICAO rubric puanlama
33. **Sınav Günü Geri Sayım & Plan** — sınav tarihi gir, AI 30 günlük plan üretsin, T-7/T-1 özel mod
34. **NOTAM/METAR/ATIS Okuma** — gerçek doküman, decode pratiği, comprehension quiz
35. **Frazeoloji Cep Sözlüğü** — alfabetik + kategori, full-text arama, offline, ICAO Doc 9432 referans
36. **Offline İndirme Yönetimi** — premium: ders/ses/SRS toplu indir, depolama yönetimi
37. **Konuşma Arşivi** — geçmiş AI konuşmalar liste, geri dinle, "1 ay önce vs şimdi" karşılaştırma
38. **Mock Mülakat Stüdyosu** — kayıt al, AI değerlendir, geri izle (sözlü examiner alt modu)
39. **Davet Et / Referral** — kişisel kod, "ikinize 1 ay ücretsiz" akışı, paylaşım sheet
40. **Davet Tablosu** — gönderilen + dönüşen davetler, kazanılan ödül takibi

### Profil & Ayarlar (4)
41. Profil Düzenle, 42. Ayarlar, 43. İlerleme Raporu (AI feedback dahil), 44. Yardım & Destek + İçerik Bildir

---

## 5. Pedagojik Çerçeve — Premium Fiyatın Haklılaştırması

Bu fiyatta (₺349) kullanıcı **eğlence değil sonuç** bekler. 4 sütunlu pedagojik mimari:

### Sütun 1: SRS Terim Hafızası
- 2.500 havacılık terimi (4 rolde)
- SuperMemo SM-2 algoritması ile spaced repetition
- Her terim: TR/EN tanım, 5 örnek cümle, AI ses (ElevenLabs), fonetik, görsel
- "30 gün sonra %85 hatırlama" hedefi

### Sütun 2: Senaryo Bazlı Diyalog
- 200+ gerçek operasyon senaryosu
- Branching dialogue (yanlış cevap konuşmayı yanlış yöne götürür)
- Pilot-kule, kabin-yolcu, teknisyen-mühendis, ground ops

### Sütun 3: AI Konuşma Partneri (Claude Haiku 4.5 + Sonnet 4.6)
- Voice-to-voice: kullanıcı konuşur (Whisper transkript) → Claude cevap → ElevenLabs sesli okur
- Rol oyna: "Sen kulesin, ben pilotum" / "Bana ICAO 4 mülakat yap"
- Spesifik feedback: ICAO frazeoloji uyumu, gramer, kelime, akıcılık 1-6 puan
- System prompt'ta ICAO Doc 9432 + standart frazeoloji enjekte

### Sütun 4: Telaffuz Analizi (Whisper + Phoneme Match)
- Hedef cümle ekrana gelir, kullanıcı söyler
- Whisper word-level confidence + custom fonem karşılaştırma
- Yanlış telaffuz edilen kelimeler kırmızı, doğru olan yeşil
- ICAO Seviye 4 telaffuz rubric'ine göre 1-6 puan

### Sütun 5: ICAO 4 Sözlü Sınav Birebir Simülasyonu (yeni — ana premium farkı)
4 gerçek görev tipi, AI examiner Sonnet 4.6 ile:
- **Picture description** — uçak/havaalanı fotoğrafı, 1-2 dk anlat
- **Story telling** — verilen senaryoyu (acil iniş, türbülans) anlat
- **Problem solving** — kriz durumu, sözlü çöz
- **Common topics** — havacılık serbest konuşma (10 konu havuzu)

ICAO 6 alan rubric'i (pronunciation, structure, vocabulary, fluency, comprehension, interactions) — her biri 1-6.
Konuşma kayıt edilir, **arşivde geri dinlenir**, bir ay sonrasıyla karşılaştırma grafiği.

---

## 6. Gamification Mekaniği — Matematik

### XP Tablosu
| Aksiyon | XP |
|---|---|
| Egzersiz doğru | 10 |
| Ders tamamlama | 50 |
| Quiz tam puan | 100 |
| **AI konuşma 5+ dk + skor 70+** | **80** |
| **Telaffuz drill skor 70+** | **30** |
| **SRS tekrar (10 terim)** | **40** |
| Günlük görev (her biri) | 30 |
| Haftalık meydan okuma | 300 |
| Sınav simülasyonu | 200 |
| Streak 7 gün | 100 |
| Streak 30 gün | 500 |

### Level Eşikleri
`Level N için kümülatif XP = 100 * N^1.5` → L5: 1.118 / L10: 3.162 / L25: 12.500 / L50: 35.355

### Streak
- Günde 1 ders/quiz/AI konuşma → +1
- 24:00 grace, sonra 0
- Premium: ayda 2 otomatik freeze
- Ödüller: 3 gün 30 coin · 7 gün 100 XP + rozet · 30 gün 500 XP + rozet · 100 gün "Centurion"

### Lig
- Haftalık (Pazartesi 00:00 Europe/Istanbul) — pg_cron
- 30'lu grup, weekly_xp DESC sıralama
- 5 tier: Bronz → Gümüş → Altın → Elmas → Usta
- Top 7 yükselir, son 10 düşer (Bronz hariç)
- İlk 3'e bonus coin (200/100/50)

### Hearts, Coins, Shop
- Free: 5 can, 30 dk'da +1
- Coin kazanım: lig sıralama, görev, level atlama
- Shop: streak freeze (100), can (30), hint (20)

---

## 7. Freemium & Paywall — ₺349 Bandı

### Free Tadımlık
- İlk 7 gün: streak freeze ücretsiz
- İlk ünite tüm rolde açık
- AI konuşma: 3 mesaj/gün
- Telaffuz drill: 5 deneme/gün
- Sınav simülasyonu: 1 deneme ücretsiz
- ICAO 4 sözlü AI examiner: 1 görev ücretsiz (4'ten 1'i, premium duvarı)
- Konuşma arşivi: son 7 gün (premium sınırsız)
- Frazeoloji sözlüğü: tam erişim (free hook, retention için)
- NOTAM/METAR okuma: 5 doküman ücretsiz/hafta
- Offline indirme: kapalı (premium özel)
- Reklamlı

### Free Limitleri
- 3 ders/gün (önceki 5'ten düşürüldü — premium itme baskısı)
- SRS tekrar: günlük 20 terim
- 5 can sistemi

### Paywall Tetikleyicileri
| An | Mesaj |
|---|---|
| Onboarding sonrası | "İlk 7 gün ücretsiz" |
| 4. derste ekran kilidi | "Sınırsıza geç" |
| AI 3 mesaj bitince | "Sınırsız AI ile pratik" |
| Telaffuz 5 dolduğunda | "ICAO 4 için sınırsız drill" |
| Sınav 2. denemede | "Tüm sınav setleri" |
| Streak 3 günde | "Kaybetme — premium freeze" |
| 7. gün trial sonu | Ana dönüşüm noktası |
| Lig top 3'te | "Ödülünü 2× al" |
| Rozet kazanımında %20 | Yumuşak hatırlatma |
| ICAO 4 sözlü 1. görev sonrası | "Diğer 3 görevi aç" |
| Sınav günü modu açıldığında | "30 günlük plan premium ile" |
| Offline indir butonuna basınca | "Sınırsız offline ile çalış" |

### Fiyat Yapısı (RevenueCat ürünleri)

| Ürün | RC ID | Fiyat | Hedef |
|---|---|---|---|
| Standart Aylık | `standart_monthly` | **₺349** | Ana dönüşüm |
| Standart Yıllık | `standart_yearly` | **₺2.499** (~₺208/ay) | LTV maksimizasyon |
| Öğrenci Aylık | `student_monthly` | **₺199** | Üniversite/MTAL (.edu.tr) |
| Öğrenci Yıllık | `student_yearly` | **₺1.499** (~₺125/ay) | Genç sadık |
| Pro Yıllık (Faz 1.5) | `pro_yearly` | **₺3.999** | Aktif pilot/ATC, sınırsız her şey |

**7 gün trial** her üründe.

### Net Gelir Beklentisi
- 1.000 Standart aylık abone × ₺349 = ₺349K brüt → **net ~₺175K/ay**
- Apple/Google Small Business: %15 (yıllık <$1M ciro)
- KDV %20 + RevenueCat %1 + altyapı + vergi sonrası

---

## 8. AI Maliyet Modeli (Premium Sürdürülebilirlik)

| Servis | Birim maliyet | Kullanıcı/ay tahmini | Aylık maliyet/kullanıcı |
|---|---|---|---|
| Claude Haiku 4.5 (konuşma) | $1/M in, $5/M out | 60 dk = ~60K token | **~$0.30** = ₺10 |
| Claude Sonnet 4.6 (zor mülakat) | $3/M in, $15/M out | 10 dk = ~10K token | **~$0.15** = ₺5 |
| Whisper STT | $0.006/dk | 30 dk telaffuz + 30 dk konuşma | **~$0.36** = ₺12 |
| ElevenLabs TTS | $0.30/1K karakter | 50K karakter | **~$15/ay flat** (Creator plan amortisman: ₺3/kullanıcı) |
| **Toplam AI maliyet/premium kullanıcı/ay** | | | **~₺30** |

Premium fiyat ₺349 → AI maliyeti %8.6. **Sürdürülebilir.**

**Maliyet kontrolü:**
- AI rate limit: günlük 30 dk konuşma, 30 dk telaffuz drill
- Pro üye: 60 dk + sınırsız drill
- Aşırı kullanım uyarısı + Pro'ya yönlendirme

---

## 9. İçerik Üretim & Doğrulama Protokolü (Eğitmensiz)

**Risk:** Eğitmen yok → yanlış içerik = "bu app yanlış öğretiyor" krizi.
**Çözüm:** 4 katmanlı doğrulama.

### Katman 1: Üretim (Claude)
- Master prompt template'leri `content-pipeline/prompts/`
- ICAO Doc 9432 standart frazeoloji referansı her prompt'ta
- Rol bazlı bağlam: pilot için yer kontrolü vs en-route ayrı

### Katman 2: Çapraz LLM Doğrulama
- Üretilen her içerik **GPT-4** veya **farklı Claude oturumu** ile doğrulanır
- Prompt: "Bu içerikte ICAO frazeolojisi yanlış mı, terim yanlış mı, gramer hatası var mı? JSON döndür."
- Skoru < 90 olan içerik elenir, yeniden üretilir
- `content_reviews` tablosuna log

### Katman 3: Otomatik Kalite Kontrolleri
- Terim listesi kontrol: ICAO 9432 standart sözlüğüyle eşleşme
- Diyalog uzunluk, çeşitlilik, zorluk dağılımı testleri
- Ses üretimi (ElevenLabs) sonrası: Whisper transkripti orijinal metinle %95+ uyuşmalı

### Katman 4: Kullanıcı Geri Bildirim Döngüsü
- Her ders sonunda "🚩 Hata bildir" butonu
- 3+ kullanıcı aynı içeriği bildirirse otomatik flag → senin onayına düşer
- "Topluluk doğrulaması" badge'i — 1.000+ kullanıcı sorunsuz geçtiyse "verified"

### İçerik Üretim Hedefleri (MVP)
| Tip | Hedef adet (MVP) | Üretim süresi |
|---|---|---|
| Vocabulary terim | 800 (Pilot 300 + Kabin 250 + Teknisyen 250) | Sprint 4-6 |
| Diyalog senaryosu | 60 | Sprint 5-7 |
| AI konuşma scenarios | 30 | Sprint 5-6 |
| Telaffuz drill cümle | 200 | Sprint 6 |
| Quiz egzersizi | 600 | Sprint 4-7 |
| ICAO 4 mock sınav | 3 set | Sprint 7 |
| SHGM mock | 2 set | Sprint 7 |
| Mülakat soru bankası | 100 | Sprint 7 |

**Tüm içerik Claude tarafından üretilir, çapraz doğrulanır, ses ElevenLabs ile sentezlenir.**

---

## 10. Push Notification Stratejisi

| Trigger | Zaman | Mesaj |
|---|---|---|
| Streak risk | 20:00 (akıllı) | "Serini kaybetme — 1 ders yeter ✈️" |
| Streak kırıldı | Ertesi sabah | "Yeniden başlamanın vakti" |
| Görev hazır | 09:00 | "Bugünün 3 görevi seni bekliyor" |
| Görev yarım | 21:00 | "1 görev kaldı, 30 XP" |
| Lig sonu | Pazar 18:00 | "Top 7'ye 80 XP — Altın Lig kapıda" |
| Yeni rozet | Anlık | "🏅 [Rozet adı]" |
| SRS tekrar | Kullanıcı saatine göre | "20 terim tekrar zamanı" |
| AI konuşma teşvik | 19:00, 3+ gün hiç konuşmayan | "Bugün 5 dk pilot rolü oyna" |
| Trial T-1 | T-24h | "Üyeliğin yarın başlıyor — istersen iptal" |
| 3 gün inaktif | Sabah | "Kabine dönmenin vakti" |
| Sınav günü | Kullanıcı tarihi girdiyse | "ICAO sınavına 7 gün — son tekrar" |

---

## 11. Analytics Event Listesi

```
auth_signed_up { method, role, level, is_student }
auth_logged_in
onboarding_completed { duration_seconds }
level_test_completed { result_level, score }
lesson_started { lesson_id, type, is_premium }
lesson_completed { lesson_id, score, xp_earned, hearts_lost }
exercise_answered { exercise_id, is_correct, time_spent }
srs_review_completed { count, accuracy }
ai_conversation_started { scenario_id }
ai_conversation_ended { scenario_id, duration, message_count, score, tokens_used }
pronunciation_attempt { term_id, score, attempts }
quiz_completed { quiz_id, score }
exam_started / exam_completed { exam_type, score, band }
streak_increased / streak_lost / streak_freeze_used
badge_earned { badge_slug }
level_up { new_level, total_xp }
league_joined / league_promoted / league_demoted
hearts_depleted / heart_purchased { method }
shop_purchase { item_slug, cost }
paywall_viewed { trigger }
paywall_dismissed { trigger }
trial_started { product }
subscription_started { product, price }
subscription_cancelled { product, reason }
content_flagged { content_id, reason }
notification_opened { type }
ai_cost_threshold_hit                 -- günlük limit
```

**Funnel'lar:** signup → onboarding → 1. ders → 1. AI konuşma → 7 gün streak → paywall → trial → paid → renewal.

---

## 12. Sprint Planı (14-16 Hafta MVP)

### Sprint -1 — Tasarım Reference + Wireframe (Hafta -1) 🆕
**Amaç:** Sprint 0 başlamadan önce tasarım dilini sabitle, 4-6 hafta zaman kazandır.

**Görevler:**
- **Gün 1:** Mobbin.com'da 50 ekran screenshot al — onboarding, ders ekranı, paywall, profil, gamification (Duolingo, ElsaSpeak, Khan Academy, Babbel, Busuu kategorisi)
- **Gün 2:** Figma Community'den 3 template indir + incele (kopyalama, örüntü öğren) — "Language learning UI kit", "Education app", "Mobile onboarding"
- **Gün 3:** Figma'da `AirSpeak Design System` dosyası — color styles + text styles + spacing + radius tokens (logo paletinden)
- **Gün 4-5:** 6 ana ekran low-fi wireframe — Ana sayfa, Ders, Egzersiz, AI Konuşma, Paywall, Profil
- **Gün 6-7:** v0.dev / Galileo AI ile high-fi mockup baseline üret, Figma'ya port

**Çıktı:** Tasarım dosyası, 6 ana ekran hi-fi mockup, color/type style locked.
**Commit:** repo henüz yok — Figma share link.

### Sprint 0 — Hazırlık (Hafta 0)
- Expo + TypeScript + Git + EAS
- Supabase Free, RevenueCat hesap, App Store + Play Console
- PostHog + Sentry kurulum
- Tasarım sistemi temeli (renkler, font, logo)
- Anthropic API key, OpenAI key, ElevenLabs hesap
- **Commit:** `feat: proje iskeleti ve altyapı kurulumu`

### Sprint 1 — Auth & Onboarding (Hafta 1-2)
- Email + Google login (Supabase Auth)
- Profil tablosu, RLS
- Welcome → Kayıt → Rol → Seviye Testi → Hedef
- i18n (TR), tema, navigation, splash, base UI
- **Commit:** `feat: kullanıcı kaydı ve onboarding akışı`

### Sprint 2 — İçerik Şeması & Ders Motoru (Hafta 3-4)
- Tüm content tablo migration'ları
- Seed: Pilot rolü 1 ünite + 5 ders + 30 egzersiz (manuel JSON)
- Ders ağacı UI
- 4 egzersiz tipi: multiple_choice, fill_blank, match, listen
- İlerleme + MMKV cache (offline)
- **Commit:** `feat: ders motoru ve egzersiz tipleri`

### Sprint 3 — Gamification Çekirdeği (Hafta 5-6)
- XP, level (DB trigger), Streak (Edge Function cron), Hearts (refill), Coins
- Shop ekranı (3 ürün)
- Rozet motoru (ilk 10 rozet, otomatik trigger)
- Ana sayfa: streak ateşi, XP bar, can sayısı
- Ders sonucu lottie animasyonu
- **Commit:** `feat: xp, streak, can, coin sistemi ve rozetler`

### Sprint 4 — SRS + Görev + Lig (Hafta 7-8)
- SuperMemo SM-2 SRS implementasyonu
- SRS tekrar ekranı, vocabulary_terms tablosuna 800 terim seed (üretim Sprint paralel)
- Daily quest generator (gece cron, 3 görev)
- Lig algoritması (Edge Function, pg_cron Pazartesi 00:00)
- Lig ekranı, haftalık ödül dağıtımı
- **Commit:** `feat: srs hafıza sistemi, günlük görevler, lig`

### Sprint 5 — AI Konuşma Çekirdeği (Hafta 9-10)
- Claude API entegrasyonu (Anthropic SDK), Edge Function proxy
- Voice recorder bileşeni (expo-av)
- Whisper STT pipeline, ElevenLabs TTS
- AI konuşma ekranı: voice-to-voice, transkript bubble, skor görüntüleme
- 30 conversation_scenarios seed
- AI maliyet logger + günlük limit
- **Commit:** `feat: AI konuşma partneri ve voice-to-voice`

### Sprint 6 — Telaffuz Analizi + Premium (Hafta 11-12)
- Telaffuz drill ekranı, Whisper word-level confidence
- Phoneme matching algoritması (basit MVP versiyonu)
- ICAO Seviye 4 rubric puanlama
- 200 telaffuz cümlesi seed
- RevenueCat SDK entegrasyonu, 5 ürün
- Paywall ekranı + 9 tetikleyici
- Free limitler, reklam (AdMob) entegrasyonu
- Subscription webhook → Supabase
- **Commit:** `feat: telaffuz analizi, abonelik ve paywall`

### Sprint 7 — Sınav Simülasyonu + ICAO 4 AI Examiner + Bildirimler (Hafta 13-14)
- ICAO 4 yazılı mock (3 set × 50 soru), SHGM (2 set × 40), YDS havacılık çıkmış
- Mülakat soru bankası (100 soru)
- **ICAO 4 sözlü AI examiner**: 4 görev tipi, Sonnet 4.6, 6 alan rubric
- **Konuşma arşivi**: tüm AI konuşmalar geri dinlenir
- **Mock mülakat stüdyosu** (oral examiner alt mod)
- Zamanlayıcı, sonuç ekranı, band score, AI zayıflık özeti
- Push token + expo-notifications, 11 bildirim trigger
- İçerik bildir akışı (content_flags)
- **Commit:** `feat: sınav simülasyonu, ICAO 4 sözlü AI examiner, bildirimler`

### Sprint 8 — Frazeoloji + NOTAM + Offline + Sınav Günü Modu (Hafta 15-16)
- **Frazeoloji cep sözlüğü**: 1.000+ entry seed, full-text search, kategorik tarama
- **NOTAM/METAR/ATIS okuma modülü**: 100 doküman seed, decode pratiği, comprehension
- **Sınav günü geri sayım & AI plan üretici**: tarih gir → 30/14/7/1 günlük plan, T-1 özel mod
- **Offline indirme**: ders + ses + SRS toplu indir, depolama yöneticisi, expires kontrolü
- **Referral sistemi**: kişisel kod, paylaşım sheet, davet tablosu, ödül akışı
- **Commit:** `feat: frazeoloji, dokuman okuma, offline, sınav günü modu, referral`

### Sprint 9 — İçerik Üretim Yoğunluk + Cila + Yayın (Hafta 17-18)
- 800 terim üretim + çapraz doğrulama (Claude × GPT-4)
- 60 diyalog senaryosu üretim
- 1.000 frazeoloji entry üretim
- 100 NOTAM/METAR örnek
- 200 telaffuz cümlesi
- 30 ICAO 4 sözlü examiner prompt'u (picture/story/problem/topic)
- Tüm ses dosyaları ElevenLabs ile (~80K karakter)
- KVKK, Üyelik Sözleşmesi, Gizlilik
- Performans optimizasyon, hata düzeltme
- TestFlight + Play Internal
- 30 kişi beta test (havacılık öğrencisi)
- App Store + Play submission
- **Commit:** `chore: içerik seed ve yayın hazırlıkları`

### Faz 2 (MVP sonrası, 8-10 hafta) — Önceliklendirilmiş
**1. öncelik: Topluluk + Peer Practice (kullanıcı seçimi)**
- Sesli oda (10 dk pratik), aynı seviyeden eşleşme
- AI moderatör (Claude) — sessizlik, dengesiz konuşma uyarısı
- Konuşma sonrası karşılıklı puanlama, rozet
- Arkadaş ekleme, arkadaşlarla yarışma
- Topluluk forumu (soru-cevap, mülakat deneyimi paylaşımı)

**Sonraki sıra:**
- Pro tier (₺3.999/yıl) sınırsız + mentor seansı (Cal.com entegrasyon)
- Speechace API ile gerçek fonem analizi
- LiveATC gerçek kule dinleme (telif kontrol sonrası)
- Admin paneli web (Next.js) + içerik onay süreci
- B2B portali (havayolu kurumsal lisans)
- Üniversite SSO (kampüs e-postası)
- CRM İngilizcesi modülü
- Sertifikalı PDF rapor
- Apple Watch / Widget

---

## 13. NPM Paketleri

```jsonc
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "expo-notifications": "~0.29.0",
  "expo-av": "~15.0.0",
  "expo-localization": "~16.0.0",
  "expo-secure-store": "~14.0.0",
  "expo-speech": "~13.0.0",
  "expo-file-system": "~18.0.0",
  "@supabase/supabase-js": "^2.45.0",
  "react-native-mmkv": "^3.0.0",
  "@tanstack/react-query": "^5.50.0",
  "zustand": "^5.0.0",
  "react-native-purchases": "^8.0.0",
  "react-hook-form": "^7.52.0",
  "zod": "^3.23.0",
  "nativewind": "^4.0.0",
  "react-native-reanimated": "~3.16.0",
  "lottie-react-native": "~7.0.0",
  "posthog-react-native": "^3.0.0",
  "@sentry/react-native": "^5.30.0",
  "i18next": "^23.10.0",
  "react-i18next": "^14.0.0",
  "date-fns": "^3.6.0",
  "react-native-google-mobile-ads": "^14.0.0",
  "@react-native-google-signin/google-signin": "^13.0.0",
  "@anthropic-ai/sdk": "^0.30.0",
  "openai": "^4.65.0"
}
```

---

## 14. Risk Noktaları (Eğitmensiz Solo Üretim)

| Risk | Olasılık | Etki | Çözüm |
|---|---|---|---|
| **Yanlış ICAO frazeolojisi → kriz** | **Orta** | **Yüksek** | 4 katmanlı doğrulama protokolü; 🚩 hata bildir; ilk 30 kullanıcıya beta + agresif feedback toplama |
| Apple/Google %15-30 komisyon | Yüksek | Orta | Yıllık fiyatlamada hesaba katıldı; Small Business başvurusu |
| AI maliyet patlaması | Düşük | Orta | Günlük rate limit, Pro tier yönlendirme, ai_usage_logs takip |
| Trial ücret iadesi yüksek olur | Orta | Orta | İlk 7 gün değer hissi tasarım — onboarding'de hemen AI konuşma + telaffuz dene |
| Düşük dönüşüm (<%4) | Orta | Yüksek | A/B test paywall (PostHog), 9 tetikleyici, 7. gün hook |
| ElevenLabs tek nokta arıza | Düşük | Düşük | Cartesia yedek planı (kod soyutlandı) |
| Whisper API gecikme | Orta | Orta | Streaming + local Whisper.cpp fallback (Faz 2) |
| Türkçe içerik yetersizliği | Orta | Yüksek | İlk 4 hafta sadece Pilot, sonra paralel Kabin + Teknisyen |
| KVKK uyumu | Orta | Yüksek | Aydınlatma metni, açık rıza, veri silme akışı |
| Üniversite ödeme gücü düşük | Yüksek | Orta | ₺199 öğrenci tier, .edu.tr doğrulama |
| App Store red (havacılık jargonu) | Düşük | Yüksek | Eğitim kategorisi, açıklayıcı screenshot, ICAO Doc 9432 referansı |
| **AI konuşma yanlış öğretir** | **Orta** | **Yüksek** | System prompt'ta sıkı kural seti, Doc 9432 referansı, "öğretmen onaylı" senaryolar AI'sız |

---

## 15. Doğrulama (Verification)

**Kabul kriterleri (yayın öncesi):**
- [ ] Yeni kullanıcı 5 dakikada onboarding tamamlar
- [ ] 1 ders + 1 quiz + 1 AI konuşma → XP/streak/SRS güncellenir
- [ ] AI konuşma 5 dk pürüzsüz çalışır, transkript doğru
- [ ] Telaffuz drill ICAO rubric'e göre 1-6 puan verir
- [ ] 5 yanlışta canlar biter, 30 dk'da +1
- [ ] Pazartesi 00:00 lig sıfırlanır, kullanıcı doğru tier'a düşer
- [ ] 7 gün streak → rozet otomatik
- [ ] Free 4. derste paywall görür
- [ ] AI 3 mesaj sonrası paywall
- [ ] Trial başlar, 7 gün sonra ödeme alınır (sandbox)
- [ ] 800 terimin %100'ü çapraz doğrulanmış
- [ ] Push streak hatırlatma 20:00'da gelir
- [ ] PostHog'da signup → trial funnel'ı görünür
- [ ] Çevrimdışı son 3 ders açılır
- [ ] AI maliyet günlük limitte durur

**E2E test (Sprint 8):** Detox veya Maestro.

---

## 16. Açık Sorular (Sprint 0 Başlamadan)

1. **Logo & marka adı** — yoksa 3 öneri sunarım
2. **Anthropic API erişimi var mı?** Yoksa hesap açma + faturalama
3. **OpenAI API + ElevenLabs hesap** — kim açacak (sen)?
4. **Apple Developer + Google Play hesabı** — TC kimlik + iyzico için banka var mı?
5. **Domain adı** — landing + admin için
6. **Beta test grubu** — 30 öğrenci (havacılık üniversitesi bağlantısı)?
7. **İlk pazar:** TR App Store + TR Play. Yıl 2'de Orta Doğu/Türki Cumhuriyetler?

---

## 17. Sonraki Adım

Plan onaylandıktan sonra:
1. Bu dosya `PROJECT_PLAN.md` olarak `/Users/ozlemakcin/Desktop/thy app/` altına kopyalanır
2. Git repo başlatılır (`git init`, `.gitignore`)
3. **Sprint 0** başlar: Expo iskelet kurulumu

> "Tamam başla" demediğin sürece kod yazmıyorum. Her sprint sonunda Türkçe commit + sana özet rapor.

---

## 18. Yıl 1 Global Ürün Liderliği Yol Haritası (Solo, Sermayesiz, Tam Zamanlı)

### Stratejik Pozisyon
**Hedef tanımı:** Aviation English kategorisinde **AI-first + mobil-first + gamified** alt-niş'inde dünyada **#1 ürün** olmak. Bu kategori bugün boş — ilk girersen default lider olursun. 12 ay'da kullanıcı sayısında değil, **ürün kalitesi ve niş tanınmada** liderlik.

### 12 Ay Faz Planı

| Ay | Faz | Aksiyon | KPI |
|---|---|---|---|
| 1-4 | **MVP Geliştirme** | Sprint 0-9 mevcut plan, EN-ana UI | Çalışan MVP, 30 beta kullanıcı |
| 5 | **Beta + Cila** | 30 kişi closed beta (10 TR + 20 global aviation forumdan), feedback iterasyonu | Bug-free, NPS >40 |
| 6 | **Lansman Patlama** | ProductHunt (top 5 of the day hedefi), Twitter thread (#avgeek), Reddit r/flying & r/cabincrew, YouTube demo video, Hacker News show | 2K download, 100 paying |
| 7-9 | **İçerik Marketing Maraton** | YouTube channel ("ICAO 4 prep" SEO), TikTok pilot creator işbirliği (5 micro-influencer), Aviation podcast 3 misafir, App Store ASO optimization | 10K download, 500 paying |
| 10-12 | **Konsolidasyon + Yıl 2 Hazırlık** | Yorumlardan ürün iterasyonu, viral kanalı büyüt (YouTube 10K sub, Twitter 5K), Faz 2 başla (peer practice), yatırım turu pitch deck | 25K download, 1.500-2.500 paying |

### EN-First UI Stratejisi
- **Default dil: EN.** Kullanıcı uygulamayı açınca İngilizce görür.
- **Telefon dili Türkçeyse otomatik TR'ye geç** (kullanıcı tercihi)
- Tüm metinler i18next ile, EN/TR paralel
- App Store/Play Store EN ana açıklama, TR ikincil
- ASO anahtar kelimeleri: "ICAO 4", "aviation English", "pilot english", "ATC english", "cabin crew english"

### Marketing Kanalları (Sıfır Bütçe Ağır Top)

**Organik Hub (yıl boyu):**
- **YouTube channel** — "Aviation English with AI" — haftalık 1 video, ICAO 4 ipuçları, gerçek pilot misafir röportaj
- **Twitter (X) hesabı** — günlük havacılık terimi + tweet thread, #avgeek topluluğu etkileşim
- **TikTok** — kısa pilot rolü AI konuşma demosu (viral potansiyel yüksek)
- **Reddit** — r/flying, r/aviation, r/cabincrew, r/ATC topluluğunda değer içerik (paylaş, satma)

**Tek Atış Patlamalar:**
- **ProductHunt launch** — ekipsiz solo geliştirici hikayesi + AI examiner demo
- **Hacker News Show HN** — teknik hikaye (Claude + Whisper aviation)
- **Aviation podcast 3-5 episod** — misafir konuşmacı (Pilot's Discretion, 360 Flight, Aviation Week)

**Topluluk Avantajı:**
- Türkiye havacılık öğrenci grupları (Facebook, Discord) — organik
- Pilot okulu mezun grupları
- THY Akademi kursiyer kanalları
- LinkedIn aviation hashtag'leri

### Yıl 1 Sonu Hedefler
- **25K download global** (15K TR + 10K global)
- **2.000 paying user**
- **₺3.5-5M yıllık run rate**
- **YouTube 10K subscriber, Twitter 5K follower**
- **Niş tanınma:** "AI-first aviation English app" denince akla ilk gelen ürün
- **Yıl 2 yatırım turu** için $300-500K seed pitch hazır

### Solo Sürdürülebilirlik Korunaklılığı
- **Health backup:** sigorta + acil durum 3 ay tampon
- **Toplu satış değil, tekil satış:** App store + RevenueCat = sıfır müşteri yönetimi
- **AI ekip yerine:** Claude code + içerik üretimi, ChatGPT marketing copy, Cursor IDE
- **Yalnızlık:** Indie hacker community (Twitter), monthly call başka solo founder'larla

### Risk: 12 Ay Yeterli mi?
- **%30-40 olasılık:** "Niş içinde #1" başarılı (mütevazı ama gerçek başarı)
- **%50 olasılık:** "İyi ürün ama henüz tanınmıyor" — yıl 2'ye gerçek momentum sarkar
- **%10-20 olasılık:** Ya viral patlama (TikTok pilot creator videoyu yapar, +500K view) ya da viral fiyasko (yanlış ICAO content krizi)

**Plana yansıma:** Bu yol haritası mevcut Sprint 0-9 planını değiştirmez, üzerine **lansman + marketing fazını** ekler.

---

## 19. Tasarım & UX Stratejisi (Solo + AI Tools)

### Felsefe
Premium hissi (₺349) + havacılık estetiği (kokpit panel: lacivert + kehribar) + mobil-first, tek el kullanım. Her ekranda 1 birincil aksiyon. Anlık feedback (haptic + animasyon).

### Tasarım Sistemi (Logo Uyumlu)
**Renk paleti — logodan türetilmiş:**

```
PRIMARY (logo)
  Navy 900     #0A1F3D    en koyu, dark mode başlık
  Navy 700     #0F2D5C    logo "air" + ana marka rengi
  Navy 500     #1E4A8C    button hover, orta tonlar
  Blue 500     #2E7CD6    logo "speak" + ana CTA
  Blue 400     #4F95E0    link, secondary action
  Blue 100     #DCE9F8    BG tint, badge

ACCENT (UI için, %5 kullanım)
  Amber 500    #F59E0B    streak ateşi, kritik uyarı, premium rozet
  Amber 100    #FEF3C7    BG tint

NEUTRAL
  Slate 900    #0A1429    dark BG
  Slate 800    #1A2540    dark surface
  Slate 100    #F1F5F9    light surface
  Slate 50     #FAFBFD    light BG
  Slate 500    #64748B    secondary text

SEMANTIC
  Success      #10B981
  Danger       #EF4444
  Warning      #F59E0B    (= Amber 500)
  Info         #2E7CD6    (= Blue 500)
```

**Kullanım kuralı:** UI'nin %95'i mavi tonları, %5 amber vurgu (sadece streak ateşi, kritik uyarı, premium rozet).

**Tipografi:** Inter (gövde + başlık) + JetBrains Mono (ICAO frazeoloji, METAR). Google Fonts ücretsiz.
**Spacing:** 4px scale (4/8/12/16/24/32/48/64). Radius: 8/12/16/9999. Touch min 44pt.
**Component lib:** **Tamagui** (performans + Expo uyumu) + NativeWind utility class.

### Üretim Akışı
1. **Wireframe** (Figma free, 1 hafta) — 44 ekran low-fi + flow diagram
2. **AI Hi-fi** (v0.dev + Galileo AI, 2 hafta) — yüksek kalite mockup baseline
3. **Reference apps çalış** — Duolingo (gamification UX), ElsaSpeak (telaffuz UI), Khan Academy (ders ağacı), Replika/Character.ai (AI sohbet UI), Linear/Raycast/Arc (premium animasyon kalitesi)
4. **Component library kod** (Sprint 1) — Tamagui ile temel atomic component'ler, Storybook doc
5. **Mikro-etkileşim** (sprintler boyu) — react-native-reanimated 3 + moti + lottie-react-native
6. **Lottie animasyonlar** (LottieFiles ücretsiz) — rozet kazanımı, level up, streak ateşi, kutlama

### Araçlar (Toplam ₺0-1.500/ay)
| Araç | Kullanım | Maliyet |
|---|---|---|
| Figma | Tasarım, prototip | Free |
| v0.dev | AI component üretimi | Free / $20 |
| Galileo AI | Figma AI mockup (opsiyonel) | $19/ay |
| LottieFiles | Animasyon kütüphanesi | Free |
| Phosphor / Lucide | İkon (5K+) | Free |
| Unsplash + Midjourney | Görsel/illüstrasyon | $10-30/ay |
| Coolors.co | Renk paleti tweaks | Free |
| Mockuphone | App Store screenshot | Free |
| Storybook | Component dokümantasyon | Free |

### Kritik UX Akışları
**Onboarding (<2 dk):** Splash → 3 slayt → Kayıt → Rol → 10 soru seviye testi → Hedef → Ana sayfa
**İlk ders (3-5 dk):** Ders kartı → Intro → 5-7 egzersiz → Sonuç (XP+, can, lottie kutlama) → Sıradaki ders CTA
**AI Konuşma (5-10 dk):** Senaryo seç → Brief → Mikrofon basılı tut → Whisper STT → Claude → ElevenLabs TTS → 5-10 round → 6 alan rubric skoru → Arşive kaydet
**Paywall (%5-10 dönüşüm):** Trigger → 3 plan kart (Aylık/Yıllık/Öğrenci) → "İlk 7 gün ücretsiz" → Ödeme sheet → Trial confirm

### Görsel Kimlik
- **Logo:** Looka/Brandmark $20-40 ya da Midjourney + Figma kendin
- **App icon:** belirgin tek sembol (uçak kanadı/kule/mikrofon), light+dark adaptive
- **Tonality:** profesyonel + sıcak, akademik değil, ticari değil

### Sprint'lere Tasarım Yansıması
Sprint 0: paleti + tipografi + ikon + logo + app icon + ana 6 ekran wireframe
Sprint 1-9: her sprintte ilgili ekranların hi-fi tasarımı kod öncesi tamamlanır (Figma → Tamagui implementasyon)
Sprint 9 cila: motion polish, ekran geçişleri, lottie animasyonlar, App Store screenshot mockup

### UX Test
- Sprint 5 sonrası: 5 kişi moderated test (sen yönet, 1 saat × 5)
- Sprint 7 sonrası: 10 kişi Maze.co free tier
- Lansman öncesi: 30 beta + PostHog session replay (paid'e geçince)

### Tasarım Kalitesi Riski
**"Solo geliştirici görüntüsü, premium hissi yok"** riskine karşı:
- Tamagui hazır component → ham görünmez
- v0/Galileo AI baseline → pro başlangıç
- Linear/Raycast/Arc animasyon kalitesini kopyala
- Beta kullanıcıdan UX feedback erken al, iterate

---

## 20. Marka Adı Önerileri

Sprint 0'da domain + App Store + ticari marka kontrolü yapılacak. Aşağıdaki 10 öneri arasından kullanıcı seçecek (bu plan onaylandığında).

| # | Ad | Anlam | Sıralama |
|---|---|---|---|
| 1 | **Climb** | "Tırmanış" + "level up" — pilot jargonu | 🥇 Öneri |
| 2 | **Wilco** | "Will Comply" — radyotelefoni | 🥈 Öneri |
| 3 | **Roger** | "Anlaşıldı" — sıcak | 🥉 Öneri |
| 4 | **AirSpeak** | Hava + konuşma | Net betimleyici |
| 5 | **AeroLingo** | Aviation + linguistics | Duolingo cross-ref |
| 6 | **Tailwind** | Arka rüzgar (CSS framework karışıklığı riski) | Akılda kalır |
| 7 | **Cleared** | "Cleared for takeoff" | Pilot odaklı |
| 8 | **Squawk** | Transponder kodu | Eşsiz, geek |
| 9 | **Final** | "Final approach" + sınav | Çift anlam |
| 10 | **Vector** | ATC yönlendirme + matematik | Modern teknoloji hissi |

**SEÇİLEN MARKA: AirSpeak** ✅
**ANA DOMAIN: airspeak.app** ✅ (`.com` dolu, `.app` Google'ın app-odaklı TLD'si)

### AirSpeak — Sprint 0 Kontrol Listesi
- [ ] Domain satın al: **`airspeak.app`** (ana), `airspeak.ai` (premium yatırım, opsiyonel), `useairspeak.com` (marketing yedek)
- [ ] DNS: Cloudflare üzerinden yönlendir
- [ ] App Store + Play Store arama: "AirSpeak" çakışma yok mu?
- [ ] Sosyal medya kullanıcı adları: @airspeak veya @airspeakapp (Twitter/X, Instagram, TikTok, YouTube, LinkedIn) — toplu kapma
- [ ] Ticari marka taraması: TPMK (Türkiye), USPTO (US), EUIPO (AB) — sınıf 9 (yazılım) + 41 (eğitim)
- [x] **Logo tasarımı tamamlandı** ✅ — Uçak (önden görünüm) + konuşma balonu, açık üst halka (ufuk hissi), lacivert + mavi monokromatik palet, "airspeak" wordmark + "Havacılık Dili Öğretici" TR tagline
- [ ] **EN tagline versiyonu üret:** "Aviation English Tutor" veya "Master Aviation English"
- [ ] **App icon sembol-only varyant** çıkar (wordmark+tagline olmadan, sadece daire+uçak+balon)
- [ ] Asset üret: logo-full-light.svg, logo-full-dark.svg, logo-mark-only.svg, wordmark-only.svg, app-icon-1024.png, app-icon-512.png, app-icon-180.png, app-icon-120.png, favicon.ico, og-image-1200x630.png
- [ ] Logoyu vektörleştir (Vector Magic veya Illustrator AI image trace) — orijinal raster ise SVG'ye çevir
- [ ] Ana web sayfası: `airspeak.app` üzerinde landing (Vercel + Next.js, ücretsiz)

### URL Stratejisi
- **airspeak.app** → ana site, App Store/Play Store yönlendirme, dökümantasyon
- **airspeak.app/blog** → SEO içerik (ICAO 4 prep, aviation English ipuçları)
- **airspeak.app/admin** → admin paneli (Faz 2)
- **api.airspeak.app** → Supabase Edge Functions custom domain (opsiyonel)

### AirSpeak Marka Tonu
- **Tagline opsiyonları:** "Master aviation English." / "Speak the sky." / "ICAO 4'ten kokpite — havacılık İngilizcesi"
- **Marka kişiliği:** Profesyonel + sıcak, kaptan pilot güvenirliği, AI öğretmen sıcaklığı
- **Görsel dil:** lacivert gökyüzü + kehribar kokpit ışığı, minimal sans-serif (Inter), boş alan vurgusu

---

## 21. Faz Mimarisi — Yıllar Süren Seviye Sistemi (Duolingo Modeli)

### Felsefe
Kullanıcı bir paneli (rolü) **3-4 yılda bile bitiremez**. Tekrar yok — her egzersiz eşsiz. SRS sadece terim seviyesinde tekrar yapar. Bu yapı uzun vadeli **premium retention**'ı maksimize eder (3 yıl × ₺2.499 = ₺7.497 LTV/kullanıcı).

### Hiyerarşi
```
Rol → Faz (A1-Captain) → Modül → Ünite → Ders → Egzersiz
```

### Pilot Rolü Sayısal (örnek)
| Faz | Süre | Modül | Ünite | Ders | Egzersiz |
|---|---|---|---|---|---|
| Faz 1 — A1 Foundation | 3-4 ay | 4 | 40 | 200 | ~1.200 |
| Faz 2 — A2 Building | 4-5 ay | 5 | 60 | 300 | ~1.800 |
| Faz 3 — B1 Operational | 5-6 ay | 5 | 70 | 350 | ~2.100 |
| Faz 4 — B2 Professional ⭐ ICAO 4 | 6-8 ay | 6 | 80 | 400 | ~2.400 |
| Faz 5 — C1 Expert | 6-12 ay | 6 | 80 | 400 | ~2.400 |
| Faz 6 — Captain Mastery ♾️ | Sürekli | 4+/yıl | 40+/yıl | 200+/yıl | ~1.200+/yıl |
| **Toplam (Faz 1-5)** | **2-3 yıl** | **26** | **330** | **1.650** | **~9.900** |

### Faz İçerikleri (Pilot)

**Faz 1 — A1 Foundation:**
- Modül 1: Cockpit & Aircraft Basics
- Modül 2: Basic ATC Communication (NATO phonetics, sayılar, frekanslar)
- Modül 3: Pre-Flight Procedures
- Modül 4: Numbers & Time in Aviation

**Faz 2 — A2 Building:**
- Routine ATC Phraseology (60 ünite)
- Aircraft Systems Operational (APU, bleed air, autopilot, FMS)
- Approach & Landing Basics (ILS, VOR, GPS)
- Weather Vocabulary (METAR full decode, TAF, SIGMET)
- Cabin Coordination

**Faz 3 — B1 Operational:**
- Non-Routine ATC (vectors, holding, conflicts)
- Emergency Communication (MAYDAY, PAN-PAN, squawk 7500/7600/7700)
- NOTAM & Weather Advanced
- International Operations Basics (accent variation)
- Critical Thinking Aviation

**Faz 4 — B2 Professional (ICAO 4 ready):**
- ICAO 4 Mock Exam Series (10 set × 4 görev)
- Mülakat hazırlık (THY/Pegasus/Emirates özel)
- Real-World Scenarios (bird strike, engine failure, medical)
- Multi-Aircraft Coordination (TCAS RA)
- Documentation in English (ASR, tech log)
- ICAO 4 Final Prep

**Faz 5 — C1 Expert:**
- Type Rating English (B737/A320/A330)
- International Operations (ETOPS, polar, trans-oceanic, CPDLC)
- CRM & Leadership English
- Incident & Investigation
- Aviation Law & Regulations
- Continuous Professional Development

**Faz 6 — Captain Mastery (sürekli):**
- Aylık 8-12 yeni ders
- Vaka çalışmaları, kaza analizleri
- Industry interview series
- Type-specific updates
- Premium Plus + B2B özel

### Tekrarsızlık Mekanikleri
- **Lesson level:** Bir ders bir kez tamamlanır, "completed" damgası alır. Skor <%80 ise 1 hafta sonra otomatik review queue'ya girer.
- **Term level (SRS):** 9.900 egzersiz eşsiz; aynı terim 3-5 farklı bağlamda. SM-2 algoritması terimi kullanıcının unutma eğrisine göre çıkarır.
- **Skill decay:** 30 gün dokunulmayan skill strength % düşer, refresh rozeti yanar (Duolingo crown sistemi).

### Unlock Mantığı
- Yeni kullanıcı: sadece Faz 1, Modül 1, Ünite 1 açık.
- Ünite tamamlandı → sıradaki ünite + ⭐ rozet
- Modül tamamlandı → 🏆 rozet + 200 XP bonus
- Faz tamamlandı → 🌟 büyük kutlama + level rozeti (örn: "A1 → A2") + paylaşılabilir
- Faz 4 sonu → "ICAO 4 hazırsın" PDF diploması (premium özel)

### Yıllık Tamamlama Hızı
| Kullanıcı | Günlük | Yıllık ders | Tamamlanan |
|---|---|---|---|
| Hafif | 5 dk | 200 | A1 + A2'nin yarısı |
| Düzenli (önerilen) | 15 dk | 600 | A1 + A2 + B1 (3 yıl total) |
| Ciddi | 30 dk | 1.200 | A1-B2'nin yarısı (2 yıl) |
| Yoğun | 60 dk | 2.000 | A1-B2 tamamı (1 yıl) |

### İçerik Üretim Roadmap
- **MVP (Ay 0-4):** Faz 1 tam (200 ders) + Faz 2 ilk modülü (60 ders) = 260 ders
- **Ay 4-12:** Aylık 80-100 yeni ders, Faz 2-3 dolar = ~850 ders
- **Yıl 2:** Faz 4 + mülakat, ICAO 4 ready = ~1.500 ders
- **Yıl 3+:** Faz 5 + Faz 6 + diğer roller paralel
- **Solo + AI üretim kapasitesi:** ~3.000 ders/yıl

### Conversion Etkisi
- Yıllık abone × 3 yıl premium = **₺7.497 LTV** (1 kullanıcı için)
- "Bitmeyen yolculuk" → düzenli streak → düşük churn (yıllık <%15 hedef)
- Faz atlama paylaşılır → organik viral
- ICAO 4 diploması = somut sonuç → ağızdan ağıza

---

## 22. Detaylı Onboarding İçeriği — Conversion Optimized

### Welcome 3 Slayt (Conversion Psikolojisi)

**Slayt 1 — Problem-Empati:**
- Başlık: "ICAO 4'ten geçemeyenlerin %73'ü İngilizce yetersizliğinden."
- Alt: "Sınava çalışmadın değil — havacılığın diliyle çalışmadın."
- Görsel: lacivert gradient + soru işareti lottie

**Slayt 2 — Çözüm-Magic:**
- Başlık: "AI öğretmenle gerçek pilot dilinde konuş."
- Görsel: telefon mockup + canlı AI konuşma demosu (kullanıcı bubble + AI cevap + 6-alan rubric)
- 3 madde: AI konuşma · ICAO 4 simülatörü · Telaffuz analizi

**Slayt 3 — Acil-CTA:**
- Başlık: "İlk 7 gün senden değil. Bizden."
- Alt: "Tüm premium özellikler. Sıfır taahhüt."
- 3 güvence rozeti: kredi kartı şart değil · tek dokunuşta iptal · hatırlatma var
- CTA primary: amber "Hadi başlayalım" (premium hissi)
- Sosyal kanıt: "4.832 kullanıcı şu an öğreniyor"

### 7 Conversion Manivelası
1. Spesifik vaat (5 ayda B1→B2, ICAO 4 geçeceksin)
2. Yatırım psikolojisi / sunk cost (4 dk profil doldurma)
3. Aha anı erken (ilk 60 sn AI demo)
4. Sosyal kanıt (kullanıcı sayısı, üniversite logoları)
5. Loss aversion (streak gün 1'den başlar)
6. Tatlı kapı (7 gün premium ücretsiz tadımlık)
7. Görsel free vs premium karşılaştırma

### Tanıma Soruları (8 ekran, kişiselleştirme verisi)
1. Rol seçimi (5 kart, zorunlu)
2. Durum (öğrenci/mezun/çalışan/sektör değiştiren)
3. Hedef multi-select (1-3, 8 seçenek: ICAO 4, SHGM, mülakat, kariyer, yurtdışı, vs)
4. Sınav tarihi (DatePicker — conditional)
5. Self-reported level (A1-A2 / B1-B2 / C1+ / emin değilim)
6. Zorluk alanları multi-select (7 alan)
7. Konu rahatlığı (rol bazlı 4 madde, 1-5 slider)
8. Günlük süre + aktif saatler

### Placement Test (10 soru, ~3 dk)
- Adaptive zorluk (A1→C1 progression)
- Kategori dağılımı: vocabulary, phraseology, listening, reading, grammar, critical
- Audio + image + multi-format
- "Bilmiyorum" seçeneği (panik önleme)
- Timer YOK (stres azalt)
- Cevap sonrası 2-saniye explanation (öğrenmeden devam etme)

### Sonuç & Plan
- Animasyonlu level rozeti (B1, vs)
- 6 alan bar grafiği (güçlü/zayıf görsel)
- Spesifik vaat: "5 ayda B2'ye, günde 15 dk yeter"
- Kişisel timeline preview
- Bildirim izni 3 spesifik trigger seçimi (streak, görev, lig)

### Toplanan Profil Verisi (14 alan)
```json
{
  "role", "status", "goals[]", "exam_type", "exam_date",
  "self_reported_level", "weak_areas[]", "comfort_levels{}",
  "daily_goal_minutes", "active_hours[]",
  "notification_prefs{}", "placement_test{level, score, by_category}"
}
```

---

## 23. Vocabulary Bankası — Hazır 150 Terim (3 rol)

### Pilot (50)
**Kategori dağılımı:**
- Kokpit & Parçalar: 15 (cockpit, fuselage, wing, flap, aileron, rudder, elevator, throttle, yoke, landing gear, spoiler, winglet, pitot tube...)
- Navigasyon: 8 (heading, altitude, flight level, waypoint, VOR, ILS, holding pattern, magnetic course)
- Hava Durumu: 8 (METAR, TAF, ATIS, turbulence, wind shear, icing, CB, ceiling)
- Acil Durum: 6 (mayday, pan-pan, emergency descent, ditching, squawk 7700, brace position)
- ATC Frazeoloji: 8 (cleared for takeoff, line up and wait, hold short, taxi, pushback, wilco, roger, say again)
- Aletler: 5 (altimeter, attitude indicator, transponder, TCAS, autopilot)

### Kabin Memuru (50)
**Kategori dağılımı:**
- PA Anonsları & Yolcu İletişimi: 12 (boarding, welcome aboard, fasten seatbelt sign, cabin lighting, duty-free, customs form, transfer, baggage claim, local/Zulu time...)
- Acil Durum & Emniyet: 10 (doors armed, brace position, evacuation slide, emergency exit, life vest, oxygen mask, ditching, fire extinguisher, AED, first aid)
- Kabin Servisi & Galley: 8 (galley, trolley, catering, dietary restriction, allergen, crew rest, crew meal)
- Özel Yolcu: 5 (SSR, UM, MEDA, INAD, DEPU, WCHR/WCHS/WCHC)
- Pilot↔Kabin Koordinasyon: 5 (interphone, all-call, cabin secure, ready for takeoff, cabin crew prepare for departure)
- Kalkış & Boarding: 5 (boarding gate, jet bridge, last-minute boarding, headcount)
- Mülakat & Sektör: 5 (competency interview, group exercise, height-reach test, customer service)

### Teknisyen (50)
**Kategori dağılımı:**
- Dokümantasyon: 8 (AMM, CMM, IPC, WDM, TSM, SRM, ATA 100, Service Bulletin)
- ATA Chapter sistemleri: 10 (ATA 21/24/27/28/29/32/33/49/71/79)
- Aletler & Ekipman: 7 (torque wrench, micrometer, caliper, borescope, multimeter, jack, lockwire pliers)
- Muayene & NDT: 7 (NDT, MPI, FPI, eddy current, ultrasonic, visual, borescope inspection)
- Tamir & Hasar: 6 (defect entry, damage limit, structural repair, patch, corrosion, fatigue crack)
- Sertifikasyon & Quality: 6 (EASA Form 1, FAA 8130-3, CRS, CRP, RII, AOG, dirty fingerprint sheet)
- Bağlantı elemanları: 6 (self-locking nut, cotter pin, lockwire, torque seal, shim, bushing)

### Detaylı YAML örneği hazır 13 terim
**Pilot:** cockpit, cleared for takeoff, METAR
**Kabin:** cabin crew prepare for departure, doors armed and cross checked, unruly passenger, brace position, special service request
**Teknisyen:** AMM, torque wrench, NDT, Service Bulletin, EASA Form 1

Her örnek şu alanlarla: term, term_tr, pronunciation, category, difficulty, definition (EN+TR), 5 example sentence, ICAO/AMM reference, related_terms, audio_url, image_url placeholder.

### Sprint 9 Üretim Planı (Kalan 650 Terim)
- Pilot 250 yeni → toplam 300
- Kabin 200 yeni → toplam 250
- Teknisyen 200 yeni → toplam 250
- **Hafta 1:** Claude üretim + GPT-4 cross-validation
- **Hafta 2:** ElevenLabs ses üretimi (~1 saat ses), görsel (Unsplash + Midjourney)
- **Maliyet:** ~$100 (~₺3.700)

---

## 24. Faz 1 Modul 1 Detaylı Müfredat (Pilot — "Cockpit & Aircraft Basics")

### Özet
- 10 ünite × 5 ders = 50 ders, ~300 egzersiz, ~80 yeni terim, ~10-12 saat çalışma
- Free: Ünite 1-5 (50%), Ünite 6+ premium gate
- Tamamlama rozeti: "Cockpit Master" + 1000 XP bonus

### Ünite Yapısı

| # | Ünite | Hedef | Yeni Terim |
|---|---|---|---|
| 1 | Aircraft Anatomy | Uçak temel parçaları | fuselage, wing, tail, cockpit, engine, landing gear |
| 2 | Cockpit Components | Yoke, throttle, instruments | yoke, throttle, altimeter, attitude indicator |
| 3 | Engine Basics | Jet vs turboprop, başlat seq | jet engine, turboprop, RPM, EGT |
| 4 | Landing Gear & Brakes | Gear ops, anti-skid | nose gear, main gear, three greens, anti-skid |
| 5 | Wings & Control Surfaces | Lift, flap, spoiler, slat | lift, flap, spoiler, slat, angle of attack |
| 6 | Mid-Module Quiz Checkpoint | Tekrar + paywall hook | 0 (recap) |
| 7 | Fuel System Basics | Jet A, FOB, refuel | Jet A, FOB, fuel burn, refueler |
| 8 | Electrical System Basics | Power, busses | generator, APU, AC/DC bus, GPU |
| 9 | Hydraulic System Basics | Hydraulic ops, pump | EDP, EMP, 3000 PSI, manual reversion |
| 10 | Final Test + Cockpit Master | Modül recap + AI roleplay + 100q test | 0 (recap) |

### Her Derste Standart Yapı (5-6 egzersiz)
1. Image labeling / matching (görsel anlama)
2. Multiple choice (vocabulary)
3. Boşluk doldurma (dialog context)
4. Audio listening (ATC veya kokpit konuşması)
5. Pronunciation drill (Whisper analizi)
6. Mini quiz (drag-drop sentence)

### Conversion Hook'ları
- Ünite 1-5: tamamen free → aha anı + alışkanlık
- Ünite 6 mini paywall: "Modülün yarısı bitti"
- Ünite 7+ premium gate: tam ekran trial CTA
- Ünite 10 rozeti: paylaşılabilir kart (sosyal viral)
- Trial → paid dönüşüm beklenti: %65 (sunk cost + completion bias)

### Ders 1.1 Örnek Detay (referans)
**Ders:** "Main Aircraft Parts" · 50 XP · 5 dk · 6 egzersiz
1. Görsel + isim eşleştirme (6 part, 6 kelime)
2. Multiple choice — fuselage tanımı
3. Dialog boşluk — Captain & engineer
4. Listening — ATC clip "request taxi"
5. Pronunciation — fuselage /ˈfjuː.zəˌlɑːʒ/
6. Sentence build — "The pilot is in the cockpit"

### Üretim Maliyeti (Modül 1)
- 50 ders × 6 egzersiz = 300 egzersiz
- Claude: ~$15 · GPT-4 valid: ~$10 · ElevenLabs ses: ~$8 · Görsel: ~$25
- **Toplam: ~$60 (~₺2.200), 2-3 günlük üretim**

### Modul 2 Detayı (Basic ATC Communication)
10 ünite × 5 ders = 50 ders, ~12-14 saat. **Modul 2 rozet: "Radio Operator"** + 1.500 XP.

| # | Ünite | Anahtar İçerik |
|---|---|---|
| 11 | NATO Phonetic Alphabet | Alpha-Zulu (26 kelime) |
| 12 | Numbers Pronunciation | "tree", "fife", "niner" |
| 13 | Call Signs | Turkish, Speedbird, tail number |
| 14 | Roger / Wilco / Affirmative | Standart cevap kelimeleri |
| 15 | Frequency Reading | "one one eight decimal one" |
| 16 | Time Reading | UTC / Zulu / local |
| 17 | Basic Greetings | Initial contact, polite forms |
| 18 | First Contact Phrases | Position, intent, squawk |
| 19 | Ending Communication | Sign-off, 121.5 emergency |
| 20 | Recap + Final Test | 75 soru + AI roleplay (premium) |

### Modul 3 Detayı (Pre-Flight Procedures)
10 ünite × 5 ders = 50 ders, ~12-14 saat. **Modul 3 rozet: "Pre-Flight Pro"** + 2.000 XP.

| # | Ünite | Anahtar İçerik |
|---|---|---|
| 21 | Flight Plan Basics | ICAO 4444 format, sections |
| 22 | Weather Briefing | METAR full decode, TAF |
| 23 | NOTAM Vocabulary | Q-code, abbreviations |
| 24 | Walk-around Inspection | Damage vocab, defect entry |
| 25 | Cabin Briefing | Captain's brief, doors armed |
| 26 | Pushback Communication | "request push and start" |
| 27 | Engine Start | Sequence, hot start, hung start |
| 28 | Taxi Phrases | Taxiway IDs, intersection |
| 29 | Holding Short | "hold short", "line up and wait" |
| 30 | Recap + Final Test | 100 soru + AI ground roleplay (premium) |

### Modul 1+2+3 Birlikte (MVP Faz 1 ilk %50)
- 30 ünite × 5 ders = **150 ders, ~900 egzersiz, ~280 yeni terim, ~36 saat içerik**
- Free içerik: 75 ders (her modülün ilk 5 ünitesi) → kullanıcı 1 ay bağlanır
- Premium gate'leri: her modülün 6. ünitesi + 10. ünite AI roleplay
- 3 rozet: Cockpit Master + Radio Operator + Pre-Flight Pro
- Free → trial dönüşüm: ~%50 (3 modül sonu kümülatif)
- Trial → paid: %65-75 (sunk cost yüksek)
- **Üretim maliyeti: ~$170 (₺6.300), 1 hafta solo + Claude**

### Modul 4 Detayı (Numbers & Time in Aviation) — Faz 1 Final
10 ünite × 5 ders = 50 ders, ~12-14 saat. **Modul 4 rozet: "Numbers Specialist"** + 2.500 XP. Ünite 40 = **A1 → A2 level up** event (paylaşılabilir, yıllık %25 indirim teklifi).

| # | Ünite | Anahtar İçerik |
|---|---|---|
| 31 | Heading (000-360) | Compass, "two seven zero", reciprocal |
| 32 | Altitude (Feet, FL) | Transition altitude, climb/descend phraseology |
| 33 | Speed (Knots, Mach) | KTS, Mach .78, indicated/ground/true airspeed |
| 34 | Distance (NM, SM) | Nautical mile, DME, RVR |
| 35 | Frequency Advanced | Multi-channel, comm loss, 7600 squawk |
| 36 | Time Conversion | UTC math, daylight saving, duty time |
| 37 | Date Format | DDMMYY, NOTAM validity, schedule days |
| 38 | Quantity & Volume | MTOW, ZFW, fuel lbs/kg/L, CG |
| 39 | Mathematical Operations | %, ratio, pilot math (GS × time = distance) |
| 40 | Module Recap + **A1 Final Test** | Faz 1 sentezi + level-up ceremony |

### Faz 1 (Pilot) Tamamlanma Özeti
- **40 ünite × 5 ders = 200 ders, ~1.200 egzersiz, ~350 yeni terim, ~50 saat**
- 4 büyük rozet: Cockpit Master, Radio Operator, Pre-Flight Pro, Numbers Specialist
- A1 Graduate sertifikası + paylaşılabilir kart
- Free içerik: 100 ders (her modülün ilk 5 ünitesi)
- Faz 1 boyunca conversion noktaları: 4 modül paywall + 1 mega level-up
- **Beklenen free → trial: %55-60 (Faz 1 sonu kümülatif)**
- **Trial → paid: %75-80 (50 saat yatırım = yüksek sunk cost)**

### Faz 1 Üretim Maliyeti
- 200 ders × 6 egzersiz = 1.200 egzersiz
- Claude + GPT-4 + ElevenLabs + görsel + lisanslı ATC clips: **~$230 (~₺8.500)**
- Üretim süresi: **2 hafta solo + Claude**

### Modul 5 Detayı (Routine ATC Phraseology) — Faz 2 başlangıç (A2)
10 ünite × 5 ders = 50 ders, ~14-16 saat. **Modul 5 rozet: "ATC Master"** + 2.500 XP. A2 sertifikasına %20 ilerleme.

**Faz 2 farkı:** Faz 1 tek tek kelime/cümle öğretti. Faz 2 **dialog akışında 5-7 mesajlık ATC senaryolarında** doğru cevap seçilir. AI konuşma egzersizleri ~25 (Faz 1'de ~10 idi).

| # | Ünite | Anahtar İçerik |
|---|---|---|
| 41 | Departure Phraseology | Pushback → cruise tam dialog |
| 42 | Climb Phraseology | "Climb to FL", step climbs, restrictions |
| 43 | Cruise & En-Route | Position reports, freq change, direct routing |
| 44 | Descent Phraseology | TOD, speed restrictions, stepped descent |
| 45 | Approach Phraseology | ILS, vectors to final, established |
| 46 | Landing Phraseology | "Cleared to land", go-around, taxi to gate |
| 47 | Vector Instructions | Headings, vector reasons, resume own nav |
| 48 | Speed & Altitude Restrictions | Cross at/above/below, "unable" usage |
| 49 | Route Changes & Re-Routing | Hold patterns, EFC, diversion, fuel emergency |
| 50 | Recap + ATC Master Final | **Pilot↔AI ATC** full flight roleplay (premium) + 100 soru test |

### Modul 5 Üretim Maliyeti
- 50 ders × 7 egzersiz = 350 egzersiz + 25 AI konuşma scenario
- Claude + GPT-4 + ElevenLabs + görsel + ATC lisans: **~$110 (~₺4.000)**
- Üretim süresi: **1 hafta solo + Claude**

### Modul 6-26 (Faz 2-5 Geri Kalan)
Aynı yapı, A2→C1 progression. **MVP'de Modul 4 (Faz 1 final) + Modul 5 üretilir.** Sonrası MVP yayın sonrası aylık 1-2 modül.

**Yıl 1 sonu hedef içerik:**
- Faz 1 tam (Modul 1-4, 200 ders)
- Faz 2'nin %50'si (Modul 5-7, ~150 ders)
- **Toplam: ~350 ders Pilot rolünde ulaşılabilir içerik**

**Yıl 2 sonu hedef:**
- Faz 1-3 tam (Modul 1-14, ~700 ders)
- B1 + ICAO 4 hazırlık başlangıç

**Yıl 3 sonu hedef:**
- Faz 1-5 tam (Modul 1-26, ~1.650 ders)
- A1→C1 tam yolculuk, Captain Mastery (Faz 6) sürekli ekleme

---

## 25. Marketing & ASO Copy — Lansman Paketi

### App Store / Play Store Listing
**Title:** AirSpeak: ICAO Hazırlık (TR) / AirSpeak: Aviation English (EN)
**Subtitle:** Pilot İngilizcesi ve sınav (TR) / AI tutor for ICAO 4 + pilots (EN)
**Promotional Text (170c):** Yapay zeka öğretmenle pilot İngilizcesi öğren. ICAO Seviye 4 simülatörü, telaffuz analizi, Türkçe arayüz. İlk 7 gün ücretsiz.
**Keywords:** ICAO,havacılık,ingilizce,pilot,kabin memuru,SHGM,YDS,THY,mülakat,uçak (TR) / ICAO,aviation,english,pilot,ATC,airline,interview,phraseology,flight (EN)
**Description (4000c):** Tam metin TR + EN, 5 ana özellik vurgusu (AI konuşma, ICAO 4 simülatörü, telaffuz, SRS, sınav günü modu) + 3 fiyat planı + güvence cümleleri.

### Landing Page (airspeak.app)
**Hero H1:** "Pilot İngilizcesinde Ustalaş. ICAO 4'ü Geç." / "Master Aviation English. Pass ICAO 4."
**Subhead:** Yapay zeka öğretmenle gerçek pilot dilinde konuş. ICAO Seviye 4 simülatörü. Telaffuz analizi. İlk 7 gün ücretsiz.
**3 Feature kolon:** AI konuşma · ICAO 4 simülatörü · Telaffuz analizi
**Testimonial:** 3 ⭐⭐⭐⭐⭐ alıntı (THY pilot, ATC trainee, kabin memuru)
**Pricing:** 3 plan kart yan yana (Standart ₺349, Yıllık ₺2.499 EN POPÜLER, Öğrenci ₺1.499)
**FAQ:** 6 sık sorulan (yeterlilik, free içerik, KVKK, cihaz, içerik tazeliği, eğitmen onayı)

### ProductHunt Launch
**Tagline:** "AI tutor for aviation English & ICAO 4 prep" (45c)
**Description:** 260c hikaye anlatımı (problem-çözüm-CTA)
**Maker comment:** Solo founder hikayesi + Claude/Whisper teknik detay + ilk 50 yoruma 1 ay premium

### Sosyal Medya Bios
- **Twitter (160c):** ✈️ AI tutor for aviation English & ICAO 4 prep · @AnthropicAI ile · airspeak.app
- **Instagram (150c):** ✈️ Havacılık İngilizcesi mobil uygulaması · AI öğretmen + ICAO 4 · İlk 7 gün ücretsiz
- **TikTok (80c):** ✈️ Pilot olmak için İngilizce öğret bizim AI'mız · 👇 İndir
- **LinkedIn:** Şirket sayfası, AI-first aviation English platform tanımı, KVKK + GDPR vurgusu
- **YouTube:** Kanal description: ICAO 4 prep + ATC phraseology + pilot interviews + pronunciation tutorials

### YouTube/TikTok İlk Video Script (45 sn)
- Hook (0-5s): "Pilot olmak istiyorsun ama ICAO 4'ten geçemiyorsun?" → "ÇÜNKÜ HAVACILIĞIN DİLİNİ ÖĞRENMİYORSUN"
- Problem (5-15s): %73 istatistiği + Duolingo/Cambly limitleri
- Solution (15-30s): AirSpeak özetlenir, AI konuşma + ICAO 4 sim demo
- Demo (30-40s): Telefonda canlı kullanım
- CTA (40-45s): airspeak.app + indir butonları
- Aviation hashtag setiyle (#pilot #icao #avgeek #thy)

### Email Sequence (5 e-posta, trial cycle)
1. **Welcome (saat 0):** "Hoş geldin Kaptan" + ilk dersi başlat CTA
2. **Day 3:** "Streak 3. günde — kaybetme" + bilim+başarı oranı
3. **Day 6 (trial son):** "Yarın trial bitiyor" + 3 seçenek + yıllık %40 indirim
4. **Trial bitti (downgrade):** "Ücretsiz tier'a düştün" + sınır karşılaştırması + hızlı geri dönüş CTA
5. **30 gün inaktif (winback):** "Seni özledik" + 1 ay ücretsiz teklif

### Press Release (TR)
**Başlık:** "Türkiye'nin İlk Yapay Zeka Destekli Havacılık İngilizcesi Uygulaması AirSpeak Yayında"
**Lid + kurucu alıntısı + 3 istatistik + özellikler + fiyat + iletişim**

### Influencer Outreach Şablonu
- Hedef: aviation TikTok creators (50K-500K), pilot YouTuber'lar, kabin Instagram'cıları
- Teklif: 1 yıl ücretsiz Premium + opsiyonel %30 referral komisyonu
- Cold mail formatı: kişiselleştirme + ürün özeti + iki teklif + Loom demo opsiyonu

### SEO Blog Post Konuları (Yıl 1)
1. "ICAO Level 4 Sınavı: Tam Hazırlık Rehberi 2026"
2. "THY Pilot Mülakatı Soruları ve Cevapları"
3. "METAR Decode: Pilotların Bilmesi Gereken 50 Kısaltma"
4. "NATO Fonetik Alfabesi Tam Liste"
5. "Pegasus / AnadoluJet / Sun Express Mülakat Karşılaştırması"
6. "ICAO 4 Telaffuz Tuzakları: Türk Pilotların En Çok Yaptığı Hatalar"
7. "Kabin Memuru THY Mülakat Kılavuzu"
8. "Ücretsiz vs Ücretli Aviation English Uygulamaları"

Her blog post 1500-2500 kelime, app download CTA içerir. Yıl 1 hedef: 24 blog post (haftalık 1).

### Lansman Önceliği (Hangi Kanal Önce?)
1. **Hafta 1:** App Store + Play Store submission, landing page live
2. **Hafta 2:** ProductHunt launch (Pazartesi sabahı 00:01 PST)
3. **Hafta 3:** Aviation TikTok 5 micro-influencer outreach
4. **Hafta 4:** İlk press release Türk teknoloji ve havacılık medyasına
5. **Sürekli:** Twitter/Instagram günlük post, blog 2 hafta 1 post

---

## 26. Teknisyen Faz 1 Detaylı Müfredat (A1 Foundation)

### Özet
- 4 Modul × 10 Ünite × 5 Ders = **200 ders, ~1.200 egzersiz, ~400 yeni terim, ~55 saat**
- 4 büyük rozet + A1 Graduation
- Üretim maliyeti: ~$220 (~₺8.100), 2 hafta solo + Claude

### Modul Yapısı

**Modul T1 — Tools & Workshop Basics**
| # | Ünite | Anahtar İçerik |
|---|---|---|
| 1 | Hand Tools | wrench, spanner, screwdriver, hammer, pliers, ratchet |
| 2 | Measuring Tools | micrometer, vernier caliper, dial gauge, feeler gauge |
| 3 | Power Tools | drill, grinder, impact wrench, rivet gun, torque wrench |
| 4 | Safety Equipment (PPE) | safety shoes, gloves, goggles, ear protection, hard hat |
| 5 | Workshop Layout | workbench, tool board, hangar bay |
| 6 | Quiz Checkpoint | recap |
| 7 | Tool Storage & FOD Prevention | FOD walk, magnetic pickup, shadow board |
| 8 | Tool Calibration | calibration sticker, due date, expired |
| 9 | Tool Requisition & Return | sign out, return, log book |
| 10 | Final + "Tools Specialist" rozet | recap |

**Modul T2 — AMM & Documentation**
| # | Ünite | Anahtar İçerik |
|---|---|---|
| 11 | What is AMM? | OEM, manufacturer, revision |
| 12 | ATA 100 Chapter System | ATA 21/24/27/28/29/32/49/71 |
| 13 | Reading AMM Tasks | job card, sub-task, prerequisites |
| 14 | IPC | part number, figure, item, effectivity |
| 15 | WDM Basics | schematic, wire bundle, connector |
| 16 | Quiz Checkpoint | recap |
| 17 | Service Bulletins | SB, alert, recommended, modification |
| 18 | Airworthiness Directives | AD, FAA, EASA, compliance, deadline |
| 19 | Document Revisions | effective date, withdrawn, superseded |
| 20 | Final + "Documentation Pro" rozet | recap |

**Modul T3 — Aircraft Systems Overview**
| # | Ünite | Anahtar İçerik |
|---|---|---|
| 21 | Powerplant Basics | jet engine, fan, compressor, turbine, N1/N2 |
| 22 | Hydraulic System | reservoir, pump, accumulator, actuator |
| 23 | Electrical System | battery, generator, bus, circuit breaker |
| 24 | Pneumatic / Bleed Air | bleed air, pressurization, air conditioning |
| 25 | Fuel System | fuel tank, pump, filter, vent, drain |
| 26 | Quiz Checkpoint | recap |
| 27 | Flight Controls | aileron, elevator, rudder, cable, surface |
| 28 | Landing Gear | strut, wheel, tire, brake, retraction |
| 29 | Avionics Intro | radio, navigation, autopilot, instruments |
| 30 | Final + "Systems Aware" rozet | recap |

**Modul T4 — Inspection & Hardware (Faz 1 Final)**
| # | Ünite | Anahtar İçerik |
|---|---|---|
| 31 | Visual Inspection | visual check, abnormal, anomaly |
| 32 | Common Defects | crack, corrosion, dent, scratch, fatigue |
| 33 | Fasteners | bolt, nut, washer, thread, hex, grip length |
| 34 | Lockwire & Torque Seal | safety wire, witness mark |
| 35 | Cotter Pins & Self-Locking Nuts | castle nut, prevailing torque |
| 36 | Quiz Checkpoint | recap |
| 37 | NDT Introduction | non-destructive, MPI, FPI, eddy current |
| 38 | Quality Control Basics | RSQM, inspector, hold tag, release |
| 39 | Defect Reporting | dirty fingerprint, write-up, report |
| 40 | Final + **"A1 Technician Apprentice"** rozet 🌟 | A1 graduation |

### Conversion Strategy
- Free içerik: 100 ders (her modulün ilk 5 ünitesi)
- Premium gate'leri: 6. + 10. ünite (×4 modül = 8 paywall hook)
- A1 Graduation event: paylaşılabilir kart + yıllık %25 indirim
- Free → trial: %50-55, Trial → paid: %70-75
- Pilot'a göre Pro tier yükseltme oranı daha düşük (mentor ihtiyacı az)

### Pilot vs Teknisyen Karşılaştırma
| | Pilot Faz 1 | Teknisyen Faz 1 |
|---|---|---|
| Ders | 200 | 200 |
| Yeni terim | ~350 | ~400 |
| Süre | ~50 saat | ~55 saat |
| AI konuşma egzersiz | ~10 (Faz 1) | ~5 (daha az dialog) |
| Görsel ihtiyacı | Orta | **Yüksek** (alet, AMM, hasar foto) |
| Üretim maliyeti | ~$230 | ~$220 |
| Conversion vurgusu | ATC simülasyon | AMM/RSQM derinlik |

### MVP'de Yer Alacak İçerik (Toplam)
- **Pilot Faz 1:** 200 ders ✅ Detaylı planlandı
- **Pilot Faz 2 Modul 5:** 50 ders ✅ Detaylı planlandı
- **Teknisyen Faz 1:** 200 ders ✅ Detaylı planlandı
- **TOPLAM MVP içerik haritası: 450 ders** (Sprint 9 üretim hedefi)

---

## 27. İçerik Üretim Şablonları (Sprint 9 İçin Hazır)

### Vocabulary Term Şeması
```yaml
id, term, term_tr, pronunciation_phonetic
category, difficulty (1-5)
definition_en, definition_tr
examples: 5 cümle (en + tr)
icao_reference
related_terms[]
audio_url (ElevenLabs üretim)
image_url
```

### Placement Test Question Şeması
```typescript
{
  id, level (A1-C1), category, role,
  question_en, options[4], correct_id,
  audio_url?, image_url?,
  explanation_tr, icao_reference?
}
```

### Lesson Şeması (yeni — faz mimarisinde)
```typescript
{
  id, unit_id, faz, modul, unite, lesson_order,
  title_tr, title_en,
  type: 'vocabulary' | 'dialogue' | 'listening' | 'reading' | 'pronunciation' | 'conversation',
  prerequisite_lessons[],
  estimated_minutes,
  xp_reward, is_premium,
  exercises: Exercise[],
  validation_status, generated_by, icao_reference
}
```

### Üretim Prompt (Claude için)
```
Generate {count} aviation English lesson(s) for AirSpeak.
Faz: {A1|A2|B1|B2|C1|Captain}
Role: {pilot|cabin|technician|ground|student}
Module: {moduleSlug}
Topic: {topicDescription}

Constraints:
- Reference ICAO Doc 9432 standard phraseology
- Each lesson has 5-7 exercises (mix of types)
- Realistic aviation context, no political/sensitive scenarios
- Cultural neutrality
- A1: simple vocabulary, present tense
- A2: routine scenarios
- B1: non-routine, emergency intro
- B2: ICAO 4 calibrated
- C1: complex, type-specific, leadership

Output: JSON Lesson schema
```

### Kalite Kontrolleri (4 katman)
1. Master prompt (Claude üretim)
2. Çapraz LLM (GPT-4 doğrulama, score < 90 elenir)
3. Otomatik test (ICAO 9432 sözlüğü match, ses-transkript %95+ uyum)
4. Kullanıcı flag → 3+ rapor sonrası manuel review

---

## 24. Wireframe Referansları (Figma'da Çizilecek)

6 ana ekran ASCII layout sahibinin elinde (sohbet geçmişi). Figma'da bunlar uygulanacak:
1. Welcome Slayt (problem/çözüm/CTA)
2. Onboarding Soru Ekranı (kart seçimli, progress bar)
3. Placement Test Sorusu (audio + 4 cevap kartı)
4. Sonuç Ekranı (level rozet + 6 alan bar grafiği + spesifik vaat)
5. İlk Ana Sayfa (streak + countdown + 3 görev + sana özel ders)
6. Paywall (4 fayda + 3 plan kart + 3 güvence rozeti)

Conversion özellikleri her wireframe'de gömülü (premium etiket, kilit ikonu, anchor pricing, social proof sayacı).

---

## 25. Özet Değişiklikler (Önceki Plan'a Göre)

| Konu | Önceki | Yeni |
|---|---|---|
| Ana fiyat | ₺99/ay | **₺349/ay** (₺199 öğrenci) |
| AI konuşma | Faz 2 | **MVP Sprint 5** |
| Telaffuz analizi | Faz 2 | **MVP Sprint 6** |
| MVP süresi | 12 hafta | **14-16 hafta** (Sprint 8 eklendi) |
| Free ders limiti | 5/gün | **3/gün** (premium itme baskısı) |
| Pedagojik temel | Gamification öncelikli | **4 sütunlu pedagoji** (SRS, senaryo, AI, telaffuz) |
| İçerik üretimi | Tanımsız | **Solo Claude + 4 katmanlı doğrulama protokolü** |
| Eğitmen | Önerilmişti | Yok — AI çapraz doğrulama + kullanıcı feedback |
| MVP içerik hacmi | 1 rol başlangıç | **800 terim + 60 senaryo + 30 AI scenario + 200 telaffuz cümle + 600 quiz** |
| Sprint sayısı | 7 | **9** |
| MVP ekstra özellikler | — | **ICAO 4 sözlü AI examiner, sınav günü modu, NOTAM/METAR okuma, frazeoloji sözlüğü, offline, konuşma arşivi, referral** |
| Faz 2 önceliği | — | **Topluluk + peer practice (sesli oda)** |
| Ekran sayısı | 35 | **44** |
| Pedagojik sütun sayısı | 4 | **5** (ICAO 4 sözlü simülasyonu eklendi) |
