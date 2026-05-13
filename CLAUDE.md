# AirSpeak — Claude Context

> Bu dosya yeni Claude oturumunun projeyi sıfırdan kavraması için yazıldı. Sprint planları, kararlar, özet altyapı, kullanıcı tercihleri ve kalan işler burada.

## Kullanıcı tercihleri (kuralı bozma)

1. **Yanıtlar Türkçe**, kısa, net, az token. Açıklayıcı paragraf yerine madde işaretleri.
2. **Varsayım yapma — önce kodu kontrol et.** Tespit yapmadan plan değiştirme.
3. **Atomik commit'ler.** A+B birleşik sprint **RED**. Her alt-sprint kendi commit'i.
4. Plan değişikliği önce **tespit + öneri**, kullanıcı onayı sonrası implementasyon.
5. **Mock-first** prensibi: API key/external service yokken sistem hala çalışmalı (graceful fallback).
6. Migration sıra numarası çakışması olursa **uyar ve sonraki numarayı kullan** (kronolojik order).
7. Kullanıcı "devam" derse: planı uygula, açıklama yapma. "yeni sohbete geçiyorum" dediğinde dahi son durumu CLAUDE.md'ye yaz.
8. Yeni dosya yaratırken markdown/docs **yaratma**; istemese kullanıcı.
9. Emoji kullanma kural değil ama kullanıcı kullanıyorsa kibarsa.
10. **CANLI-FIRST PRENSİBİ (CORE RULE — 2026-05-09):**
    - "Geçici çözüm", "placeholder", "şimdilik X, sonra Y" YASAK.
    - "v1.1'de yapılır" tarzı erteleme tek başına KABUL EDİLEMEZ — production-ready
      değilse implementation tamamlanmamıştır.
    - Her özellik canlıya çıkmak için **eksiksiz** kurgulanır: gerçek backend,
      gerçek mail, gerçek auth, gerçek IAP, gerçek monitoring.
    - "Test domain", "test key", "mock email" gibi geçici şeyler **sadece local
      development** için kullanılır — TestFlight veya canlıya asla çıkmaz.
    - Pre-launch checklist'te eksik kalan her item **blocker** sayılır.
    - Bu prensip Sprint 5'in "Mock-first" kuralından farklıdır: Mock-first =
      "API key yoksa local çalışsın". Canlı-First = "Production'a çıkacak şey
      eksiksiz hazırlansın, hiçbir adım atlanmasın."

## App tanımı

**AirSpeak** — Türkiye merkezli aviation English öğrenme uygulaması. THY pilot/kabin/teknisyen/yer hizmetleri/öğrenci hedef kitle. ICAO 4 yazılı + sözlü sınav hazırlık ana motivasyon.

- **Mobile**: Expo SDK 53 + React Native + Tamagui + Zustand+MMKV
- **Backend**: Supabase (DB + Auth + Storage + Edge Functions + pg_cron + pg_net)
- **Admin**: Next.js 14 (App Router, Server Actions, Tailwind)
- **AI**: Anthropic Claude (oral evaluator) + OpenAI Whisper (STT fallback) + native expo-speech-recognition
- **Push**: Expo Push Service (Expo'nun FCM/APNs proxy'si)

## Stack detayı

| Layer | Tool | Versiyon |
|---|---|---|
| Mobile | Expo SDK | 53 |
| Mobile | react-native-reanimated | ~3.16 |
| Mobile | react-native-svg | 15.8 |
| Mobile | expo-av | ~15.0 |
| Mobile | expo-speech-recognition | ^3.1 |
| Mobile | expo-image-picker / image-manipulator | ~16 / ~13 |
| Mobile | @anthropic-ai/sdk | ^0.30 (kullanılmıyor — server-side fetch) |
| Mobile | openai | ^4.65 (kullanılmıyor — Whisper Edge'de) |
| Mobile | @supabase/supabase-js | latest |
| Admin | Next.js | 14 |
| Admin | Tailwind | latest |
| DB | PostgreSQL | Supabase 14.5 |

## 🔑 Hesap bilgileri (KARIŞTIRMA — her zaman tinymaxi1 kullan)

**GitHub:**
- ✅ **`tinymaxi1`** → AirSpeak ANA HESAP (repo sahibi: `github.com/tinymaxi1/airspeak`)
  - Email: **`tatildetatilcom@gmail.com`**
  - **Her GitHub işleminde sadece bu hesabı kullan.** Kullanıcıya başka hesaba geçmediğinden emin olmasını her seferinde hatırlat.
- ❌ `mirissalabkozm...` → başka iş (kozmetik) — AirSpeak ile karıştırma
- ❌ `ozlemkesifte` → eski/kişisel — AirSpeak ile karıştırma

GitHub'a giriş yapacaksa: önce sağ üst avatardan **`tinymaxi1` aktif mi kontrol et**, değilse account switcher veya sign out → login.

**Apple Developer:**
- Team ID: `7964PXR27N` (MIRISSA KOZMETIK VE TICARET LIMITED SIRKETI)
- Apple ID (ASC): `kesfegel@gmail.com`
- ASC App ID: `6766981661`

**EAS (Expo):**
- Hesap: `mirissaapss` (login email: `kesfegel@gmail.com`)
- Project ID: `684b9eaf-123f-4145-89a9-89b235aecb46`

**Supabase:**
- Hesap email: `durakkamil@gmail.com`
- Project ref: `neinhbkdctjtyyoskxpg` (aşağıda detay)

**Google Cloud Console:**
- Hesap email: `kesfegel@gmail.com`
- Project: `AirSpeak` (project_id: `airspeak-496108`)
- OAuth Client'lar:
  - **Web** (Supabase için): `339554480219-l8hlh705hove8ulr2ie8b94hd0h03kmn.apps.googleusercontent.com`
  - **iOS**: `339554480219-e3vvq5lap7bruvmg1rjk8lq6o1o5s9re.apps.googleusercontent.com`
  - Android: PENDING (BUILD 15 sonrası SHA-1 ile)
- Web Client Secret: chat-exposed, v1.0.1'de rotate edilmeli

---

## Supabase project

- **Ref**: `neinhbkdctjtyyoskxpg`
- **Region**: AWS eu-central-1
- **Active branch**: `main` (worktree `claude/adoring-williamson-ccc1e5` 2026-05-01'de merge edildi — `8cfa073`)
- **Worktree path**: `/Users/ozlemakcin/Desktop/thy app/.claude/worktrees/adoring-williamson-ccc1e5/` (history için duruyor; aktif iş ana root'ta)
- **Ana proje root**: `/Users/ozlemakcin/Desktop/thy app/`

### Bilinen problemler

- **Supabase CLI 403**: Kullanıcı zaman zaman başka bir Supabase hesabına geçtiği için CLI 403 alabilir. Çözüm: `supabase logout` → `supabase login` (doğru hesap). `supabase projects list` ile `neinhbkdctjtyyoskxpg` görünmeli. Bu süreç kullanıcıya bırakıldı.
- **Docker not running**: `supabase functions deploy` "Docker is not running" warning verir → normal, deploy yine çalışır (server-side build).

### Push cron / Edge Function aktivasyon (manuel iş — kullanıcı yapacak/yaptı)

Edge Function deploy edildi ama push cron schedule'ları için `app_config`'te şu key'ler dolu olmalı:

```
notifications.edge_url     → "https://neinhbkdctjtyyoskxpg.supabase.co/functions/v1/notification-triggers"
notifications.service_token → service_role secret
```

Sprint 5.D sonrası kullanıcı bunu yaptı (Sprint 5.D commit `f224e58` sonrası talimat verildi). Yeni cron schedule eklenirse aynı config kullanır.

## Tamamlanan sprintler (kronolojik)

Hepsi main branch'te. **Toplam 37 migration · 7 Edge Function · 28 admin sayfası.**

İki paralel iş hattı 2026-05-01'de merge edildi (`8cfa073`):
- **Faz 0-8 hattı** (admin paneli + content DB + monetization runtime control) — main üzerinde sıralı
- **Sprint 3a-7 hattı** (community + oral + stats + placement) — `claude/adoring-williamson-ccc1e5` worktree'sinden merge

### Faz 0-8 — Admin Paneli + İçerik DB Pipeline (TAMAM)

| Faz | Commit | İçerik |
|---|---|---|
| 8 | `3531697` | Monetization & feature flags — admin runtime kontrol (paywall/freemium/ads/competitions admin'den toggle) |
| 7 | `32a339e` | Versioning UI + settings sayfası + Vercel config |
| 4+5+6 | `933303e` | Full CRUD (admin) + audio upload pipeline + user management |
| 3 | `186d1b3` | Admin tree view + tablo listeleme (read-only Faz 0-3'ün son hali) |
| 2 | `9a4297e` | Mobile DB-only refactor — 8 ekran TS seed yerine DB hook'larına bağlandı |
| 1+2+3 | `f0b972e` | TS seed → Supabase migration + content katmanı + admin skeleton |
| 0 | `c0c47a3` | Admin paneli iskeleti + içerik DB schema (5 migration: modules/units/lessons/exercises/vocab) |

Bu hat **content authoring** odaklı — admin tarafından içerik girişi, mobile sadece DB tüketicisi.

### Sprint 1 — Temel altyapı (önceki repo)
- profiles, user_settings, auth trigger
- 6 storage bucket: lesson-audio, vocab-audio, lesson-images, oral-prompt-images, user-avatars, badges

### Sprint 2 — İçerik tabloları
- modules, units, lessons, exercises, vocabulary_terms, placement_questions, oral_exam_prompts
- exam_simulations, exam_question_attempts, oral_exam_attempts (Sprint 7'de genişletildi)
- content_flags (Apple UGC zorunlu)
- admin_actions audit log

### Sprint 3a — Profile genişletme
- profiles ek 14 kolon (bio_short/long, callsign, company, position, base_airport, social links, ICAO level, premium_until, banned_at)
- profile_completion_percent trigger
- ActivityHeatmap component (84 gün)
- Hero, StatStrip, LevelMap, SummaryCard

### Sprint 3e — Detaylı istatistik (DOLU TAMAM)
- Migration `30_user_stats_views.sql`: weekly_user_stats + monthly_user_stats views
- 5 RPC: user_hourly_activity (24h), user_dow_activity (7-DOW, ISODOW), get_peer_comparison (role+level percentile), get_user_goals_progress, update_user_goals
- profiles ek: weekly_goal_xp (1000), monthly_goal_lessons (30)
- app_config: goals.default_*
- Mobile: `app/profile/stats.tsx` 8 görselleştirme bölüm
- Components: `Charts.tsx` (LineChart + BarChart + HourlyHeatmap primitives) + `InfoCards.tsx` (GoalsCard + PeerCard + MonthlyCards)
- Profile entegrasyonu: 📊 mini önizleme kartı (BU HAFTA / BUGÜN / AKRAN)
- 3 commit: 3e.A backend, 3e.B mobile, 3e.E profile entegrasyonu

### Sprint 3f — Placement Test İyileştirme (DOLU TAMAM)
- Migration `31_placement_adaptive.sql`:
  - `user_placement_results` (PK user_id, latest-only)
  - `placement_questions.dimension` whitelist genişletildi: +vocabulary, grammar, listening, reading
  - 3 RPC: get_next_placement_question (adaptive), finalize_placement, can_take_placement
  - 5 app_config (min/max/advance/stop/cooldown — default 30 gün)
- Adaptive logic: 3 ardışık doğru → +1 level, 3 ardışık yanlış → -1 dur. Min 3 max 7 per dim. Avg → A1-C1 mapping.
- Mobile: `src/features/placement/api.ts` (RPC wrapper + AdaptiveSessionState reducer + cryptoRandomUuid)
- `level-test.tsx`'te `finalizePlacement` RPC paralel çağrı (zustand korunur, DB de yazılır). 4 dim CEFR → 4 score band map.
- `PlacementCard` component profile sayfasında: L badge + 4 score pill + cooldown-gated retry buton
- 2 commit: 3f.A backend, 3f.B mobile

### Sprint 4 — Lig sistemi (TAMAM)
- 4B haftalık leaderboard + bumpUserXp RPC
- 4C aylık leaderboard + championships
- 4D yıllık leaderboard + premium gift
- 4E admin lig yönetimi (list + form + detail + group detay)
- 4F competitions (event-based) backend + admin + mobile
- 4G social: friendships + squadrons + squadron leaderboard
- pg_cron: weekly Pazartesi 00:00 UTC, monthly 1. günü, yearly 1 Ocak

### Sprint 5 — Engagement & Conversion (TAMAM)

| Sub | Commit | İçerik |
|---|---|---|
| 5.A.1-3 | `bbcd80b` `3760456` `8faa60f` | Paywall trigger sistemi (14 ID) + soft lock pattern + 5 trigger entegrasyonu |
| 5.B.1-2 | `26391cf` `fb2e9f3` | Coin server-side wallet + streak freeze backend + mobile |
| 5.C.1-2 | `cbb01ba` `d3c6473` | Trial DB tracking + sosyal kanıt + 3 push trigger + mobile |
| 5.D.1-3 | `d3f5de7` `54ef7d4` `f224e58` | Limited offers (DB + admin paneli + mobile + push) |

### Sprint 6 — Komünite (TAMAM, 12 commit)

5 alt-sprint, hepsi atomik bölüm: 6.A foundation (groups+posts+comments+reactions), 6.B mentions+hashtags+bookmarks+search, 6.C moderation (mod role + auto-mod + reports + admin queue), 6.D realtime feed + presence + push, 6.E follows + profile entegrasyonu.

12 mobile ekran, 5 admin sayfası, 5 migration. Ayrıntı: `git log --oneline | grep community`.

### Sprint 7 — ICAO 4 Live + AI Eval + STT (TAMAM, 8 commit)

| Sub | Commit | İçerik |
|---|---|---|
| 7.A.1 | `c76bf69` | Backend: oral-recordings bucket + 9 ai.* config + 4 RPC + 2 Edge Function placeholder |
| 7.B.1 | `591d58b` | Mobile lib: audioRecording (expo-av) + oral/api + oral/stt |
| 7.C | `5025ac1` | Claude API gerçek (tool_use + ICAO Annex 1 6-descriptor rubric) + Whisper API + cost tracking |
| 7.D.1 | `66ff71c` | icao4-live mock'tan gerçeğe (state machine: idle→countdown→recording→uploading→submitting→evaluating→done) + result realtime |
| 7.D.2 | `c6d2ddc` | history ekranı + SkillRadar (6-descriptor) + IcaoTrend + IcaoTimeline |
| 7.E.1 | `3f33d8c` | Admin AI settings sayfası + cost dashboard + secret RLS (api_key satırları admin-only) |
| 7.E.2 | `7528f78` | Manual review queue + AudioPlayer (signed URL) + RubricOverrideDialog |
| 7.F | `e31d0e6` | Profile trend + timeline (Sprint 7'in son rötuşu) |

**3 katman graceful fallback**: provider='mock' default → API key boş → Edge fn `mockEvaluate` deterministik 1-4.5 band + Türkçe feedback. API error → mock_fallback. Daily cost cap aşıldı → mock.

## Backend altyapısı

### Database (37 migration)

Toplam tablo sayısı yüksek. Önemli olanlar:

**Auth & Profile:**
- `profiles` (40+ kolon, 14 ek Sprint 3a + premium_until + community_* + trial_* + last_active_at + mention_privacy + is_moderator + weekly_goal_xp + monthly_goal_lessons)
- `user_settings`

**Content (admin):**
- `modules` / `units` / `lessons` / `exercises` / `vocabulary_terms` / `placement_questions` / `oral_exam_prompts` / `oral_prompts` / `interview_questions` / `airlines` / `conversation_scenarios` / `phraseology_entries`

**Progress / Gamification:**
- `user_xp_summary` (total/week/month/year)
- `streaks` (current/longest, frozen_until)
- `user_lesson_progress` (granular log)
- `user_badges` / `badges`
- `daily_usage` (per-day counter)
- `user_placement_results` (latest-only)

**League (Sprint 4):**
- `league_seasons` / `league_groups` / `league_memberships`
- `championships` (yıllık başarılar)

**Coins / Wallet (5.B):**
- `coin_transactions` (audit log)
- `profiles.coins` + 3 inventory column + xp_boost_until

**Trial (5.C):**
- `profiles.trial_started_at` / `trial_ends_at` / `trial_used` / `subscription_status` / `last_active_at`

**Limited Offers (5.D):**
- `limited_offers` (16 kolon, 6 audience segment)
- `revenue_events` (mevcut, source='promo' kullanılır)

**Community (Sprint 6):**
- `community_groups` / `community_group_members`
- `community_posts` / `community_comments`
- `community_reactions` / `community_bookmarks`
- `community_mentions` / `community_hashtags` / `community_post_hashtags`
- `community_banned_words`
- `community_notifications`
- `community_follows` (asimetrik)
- `friendships` (Sprint 4G — squad/lig için, simetrik) — community_follows ile karışmasın

**Oral Exam (Sprint 7):**
- `exam_simulations` (mevcut, Sprint 7 öncesi)
- `oral_exam_attempts` (Sprint 7'de 12 ek kolon: confidence_score, needs_review, review_status, review_reason, evaluated_at, provider, examiner_model, tokens_in/out, estimated_cost_usd, error)

**Admin & Audit:**
- `admin_actions` (immutable audit log)
- `app_config` (50+ key, kategori bazlı; **api_key + service_token satırları RLS ile admin-only Sprint 7.E.1**)

### Views

| View | İçerik |
|---|---|
| `suspicious_xp_view` | Sprint 4E.A — admin moderation |
| `ai_daily_cost` | Sprint 7.C — günlük AI maliyet |
| `squadron_leaderboard` | Sprint 4G |
| `oral_review_queue` | Sprint 7.A.1 — admin review queue (low_confidence + user_disputed) |
| `weekly_user_stats` | Sprint 3e.A — kullanıcı haftalık rollup |
| `monthly_user_stats` | Sprint 3e.A — aylık rollup |

### Edge Functions (7)

1. `league-weekly-rotation` (Pazartesi cron)
2. `league-monthly-rotation` (1. cron)
3. `league-yearly-rotation` (1 Ocak)
4. `competition-tick` (5 dk cron — competition status)
5. `notification-triggers` — **19 trigger** (streak/league/icao/trial/special_offer/post_mention/mod_warning/comment_reply/post_reaction/inactivity/...)
6. `oral-exam-evaluate` — Claude API ICAO Annex 1 evaluation
7. `whisper-transcribe` — OpenAI Whisper STT

### Storage buckets (8)

| Bucket | Public | Limit | Owner pattern |
|---|---|---|---|
| lesson-audio | public | 5MB | admin write |
| vocab-audio | public | 1MB | admin write |
| lesson-images | public | 2MB | admin write |
| oral-prompt-images | public | 3MB | admin write |
| user-avatars | public | 1MB | `<userId>/*` |
| badges | public | - | admin write |
| post-images | public | 5MB | `<userId>/*` (Sprint 6.A.1) |
| oral-recordings | **PRIVATE** | 10MB | `<userId>/*` (Sprint 7.A.1, KVKK/GDPR) |

## Admin paneli (28 sayfa)

`/admin/` altında: ads, ai (Sprint 7.E.1), airlines, analytics, audio, audit, badges, banned-words (Sprint 6.C.2), competitions, freemium, icao4, import, interviews, leagues, offers (Sprint 5.D.2), oral, oral-review (Sprint 7.E.2), paywall, placement, reports (Sprint 6.C.2), revenue, scenarios, settings, tree, users, vocab.

Pattern: Server Component sayfa + 'use server' actions + 'use client' Dialog form. ConfigField primitive `app_config` field render. Audit log tüm admin aksiyonlarını kaydeder.

## Mobile ekranlar

`app/` (expo-router file-based):

**Onboarding:** welcome, login, signup, role-select, level-test, placement-result, profile-setup, goals
**Tabs:** home, learn, practice, league, profile
**Lesson:** lesson/[id]
**Exam:** index, icao4, icao4-sets, icao4-briefing, icao4-live, icao4-result, icao4-history (3f.B'de eklendi), airline/[id], airlines, mock-studio
**Community:** index, [slug], new-group, post/[id], hashtag/[tag], search, bookmarks, notifications, u/[username]
**Conversation:** index, [scenario]
**Other:** vocab, readback, career, search, bookmarks, pronunciation/[id], settings/*, notifications, offline, mic-denied, squadron-pairing, paywall, shop, srs/index, streak-freeze, heart-refill
**Profile sub:** badges, championships, stats (Sprint 3e.B)

## AI / Mock-first prensibi

Sprint 7'nin temel kararı: **API key olmadan da sistem çalışır.**

`app_config`:
- `ai.examiner_provider` default `mock` (admin claude/gpt'e geçirir)
- `ai.stt_provider` default `native` (cihaz STT, ücretsiz)

Edge Function `oral-exam-evaluate` 3 katman fallback:
1. provider='mock' → deterministik (transcript word count → 1-4.5 band) + Türkçe generic feedback
2. provider='claude' ama key boş → mock'a düş
3. Claude API error → mock_fallback (provider='mock', model='mock-v1-fallback')
4. Daily cost cap aşıldı (`check_ai_daily_cost` RPC) → mock'a düş

Bu sayede dev/test/prod aynı kodla çalışır, kullanıcı (admin) Anthropic API key girene kadar test verisi üretilebilir.

## Önemli kararlar (geri dönülmemeli)

1. **Mock-first AI**: API key olmadan sistem yine çalışır. Asla zorunlu değil.
2. **Atomik commit'ler**: 5.A+5.B birleşik sprint'i kullanıcı RED. Her alt-sprint kendi commit'i.
3. **Migration sıra**: Çakışma olursa kullanıcıya uyar, sonraki numarayı kullan (kronolojik). 3f.A migration kullanıcı 029 dedi ama 029-030 dolu olduğu için 031 kullandı.
4. **Realtime presence Sprint 6'da kuruldu** (chat ile birlikte). 5.C'de "Sprint 6'ya bıraktık" notu vardı, hatırla.
5. **Friendships dokunma**: Squadron/lig için simetrik, korundu. Community için ayrı asimetrik `community_follows` (Sprint 6.E.1).
6. **Audio bucket private**: Sprint 7'de KVKK/GDPR — oral-recordings sadece owner+admin okur.
7. **API key güvenlik**: Sprint 7.E.1 RLS ile `%_api_key` ve `%service_token` satırları admin-only. Mobile/anon okuyamaz.
8. **Detaylı istatistik free**: Engagement+retention için kritik (Sprint 3e). Premium upsell başka yerlerde.
9. **Placement cooldown 30 gün**: admin override mümkün (`can_take_placement` RPC).
10. **mock-studio.tsx ≠ ICAO oral mock**: mock-studio mülakat prep, ICAO live ayrı (Sprint 7'de doğrulandı).

## Kullanıcı manuel görevleri (yapıldı/yapılacak)

- ✅ Sprint 5.D sonrası: `notifications.edge_url` + `service_token` set + push cron schedule (kullanıcı SQL Editor'dan yaptı)
- ⚠️ Sprint 7 sonrası: Admin panel `/admin/ai` üzerinden Anthropic + OpenAI API key gir + Test'le. Admin'de UI hazır, kullanıcı ne zaman aktive ederse o zaman gerçek AI çalışır.
- ⚠️ Sprint 6.B.1 sonrası: notification-triggers Edge Function deploy etmesi gerekti. Kullanıcı `supabase functions deploy notification-triggers --project-ref neinhbkdctjtyyoskxpg` çalıştırdı.

## Sprint 8 — Store Submit Hazırlığı (DEVAM EDİYOR, 2026-05-04)

iOS/Android production submit için altyapı.

| Sub | Durum | İçerik |
|---|---|---|
| 8.A.2 | ✅ | iOS Info.plist permission descriptions |
| 8.A.3 | ✅ | App Tracking Transparency iskelet |
| 8.B.1 | ✅ | Sentry crash monitoring (v6.10 — v8 Xcode 26.4 C++ profiler issue) |
| 8.C.1-3 | ✅ | EAS init + env vars + react-native-google-mobile-ads plugin aktif |
| 13.B.1 | ✅ | eas.json android.production: buildType=app-bundle, submit.track=internal |
| 13.B.2 | ⚠️ | Android production .aab build — versionCode 3, in queue (free tier ~10dk). İlk build Sentry token eksikliği nedeniyle fail oldu, SENTRY_AUTH_TOKEN EAS secret eklendi. |

## Sprint 11 — Aviation Glossary (DEVAM, 2026-05-04)

Kullanıcı-yüzeyli sözlük. 50K terim hedefi.

- 11.A — Schema extension + 6. mobile tab "Sözlük"
- 11.B.1-11 — Bulk import 9 batch, **921 terim** (50K hedef: %1.84)
- ~/airspeak/glossary/ standalone Python duplicate detection (5 conflict level: EXACT, NORMALIZED, FUZZY, ABBREV, INTRA-BATCH)
- Admin RegistryStatus widget + GlossaryForm duplicate check
- Validator import-glossary.mjs içinde gate

## Sprint 12 — Unit Intro + Lesson Theory (TAMAM, 2026-05-04)

Ders öncesi anlatım sistemi (Duolingo/Babbel benzeri).

| Sub | Commit | İçerik |
|---|---|---|
| 12.A | `8556cce` | Migration 50: lessons.theory_md/_en/image_url + units.intro_md/_en + lesson_type 'theory' enum |
| 12.B | `b28e5b5` | Theory ders tipi mobile (types + api left join + theory.tsx + Markdown component + lesson/[id] redirect) |
| 12.C | `54d6252` | Unit intro modal mobile (zustand+MMKV store seenUnitIds + UnitIntroModal + learn.tsx wiring + "i" buton) |
| 12.D | `be9bfc5` | Admin formlar (UnitForm intro alanları + LessonForm theory tipi conditional) |

**Önemli**: useLesson hook `exercises!inner` → `exercises` (left join) — theory dersi exercise olmasa da döner. Markdown renderer custom (~90 satır, 0 dependency): `## başlık`, `**bold**`, `*italic*`, `- bullet`, paragraf.

İçerik henüz boş — DB'de intro_md/theory_md hep NULL. Seed gerekiyor.

## Sprint 13.A — RevenueCat IAP (TAMAM, 2026-05-04)

iOS test key konfigüre edildi (`test_bepbobVLqibOscaAJFmISTcTuMv`), Android key + RevenueCat dashboard config + App Store Connect IAP product'ları kullanıcının yapacağı manuel görevler.

| Sub | Commit | İçerik |
|---|---|---|
| 13.A.1 | `f2638bc` | Migration 51: profiles.revenuecat_app_user_id + 5 app_config seed (revenuecat.ios/android/webhook + iap.entitlement_id="pro" + iap.product_ids) + RLS revenuecat.* admin-only + category_check kaldırıldı |
| 13.A.2-5 | `2d608f5` | src/lib/iap.ts (initIap/linkUser/purchase/restore/sync) + _layout.tsx hooks + paywall.tsx purchase flow + AppState foreground sync + restore butonu |
| 13.A.6 | `8a39a1e` | Edge Function `revenuecat-webhook` (deploy edildi) — 12 RC event mapping → revenue_events + premium_until + subscription_status |
| 13.A.7 | `5a70f2d` | Admin IAP UI (lib/iap/actions.ts + components/iap/IapSettingsForm.tsx + revenue/page.tsx genişletildi) |

**Mock-first**: app_config'te key boşsa SDK init etmez, paywall "Yakında aktif" gösterir. Webhook secret boşsa Edge fn 200 with reason='webhook_disabled'. iOS test key ve webhook secret (`d5c63162ca...`) DB'ye yazıldı (PostgREST üzerinden direkt patch — commit'lenmedi). RevenueCat dashboard'da webhook URL: `https://neinhbkdctjtyyoskxpg.supabase.co/functions/v1/revenuecat-webhook` Authorization: `Bearer <secret>`.

## Kalan / önerilen sprintler

1. **Android build tamamlanması** — queue'da; bittiğinde .aab Play Console internal testing'e
2. **iOS production build** — Apple Developer hesabı + EAS iOS profile + provisioning
3. **App Store Connect IAP product** — 3 product oluşturma (annual/monthly/student)
4. **RevenueCat dashboard config** — entitlement "pro" + offering "default" + product mapping
5. **Sprint 12 içerik seed** — DB'de unit intro + theory dersleri henüz boş
6. **Glossary batch'leri** — 921/50K (%1.84), kategori bazlı devam
7. **AdMob production app ID + ad unit ID** — şu an Google test ID'leri
8. **expo-updates (OTA)** — `npx expo install expo-updates` + `eas update:configure`
9. **Sprint 8 — DM/Chat** (Sprint 6'da 7'ye bırakılmıştı, 7'de 8'e bırakılmıştı)
   - 1:1 mesajlaşma
   - Group chat (squadron/community group içinde)
   - Realtime broadcast channel
   - Push trigger: new_message
   - Storage: chat-images bucket
   - Read receipts, typing indicator

3. **Content management iyileştirmeleri** (admin)
   - Bulk import (zaten var: `/admin/import`)
   - AI-generated lesson exercises (Claude'la)
   - Translation pipeline (DEEPL_API_KEY env'de)

4. **iOS / Android build & store deploy**
   - EAS Build config
   - App Store + Play Store metadata
   - Privacy policy update
   - Push notification certificates

5. **Performance / scale optimizasyonları**
   - Materialized view'lar (1000+ user sonrası)
   - Image CDN optimizasyonları
   - SQL query plan analiz

6. **Sprint 3 alt seriler** (3a/3e/3f tamam, 3b/3c/3d boş — kullanıcı planında olmayabilir)

7. **i18n genişletme** (16 dil mevcut, içerik çevirisi eksik)

## Aktif durum (2026-05-04)

```bash
git log --oneline | head  # son commit: f4ffcd1 (Sprint 13.B.1 eas.json android profile)
```

**51 migration** uygulanmış (son: 20260504000051_revenuecat_iap), **8 Edge Function** deploy edilmiş (son eklenen: revenuecat-webhook). Main branch `origin/main` ile senkron.

Açık background süreç: EAS Android production build queue'da (build ID `2d9d6927-0f2e-49b7-bd4d-9b792af01666`, versionCode 3).

---

## 🔥 SON DURUM (2026-05-09) — DESIGN REFACTOR + PRODUCTION LAUNCH PREP

Bu bölüm en güncel state — yeni sohbet bu yerden devam etmeli.

### 14-Phase Design Refactor + Pre-Launch Fix (TAMAM, push edildi)

**Refactor commit'leri (main HEAD: `ad36c8b` — push edilmedi, GitHub auth conflict):**
- Phase 1-13 design system overhaul (tasarımcı drift report + Block 1/2/3 onaylı kararlarla)
- Apple 1.2 Block User implementation (backend `community_blocks` tablosu + 5 RPC + UI + Terms § 3.1)
- airspeak.io → airspeak.app global replace (50+ dosya)
- Email verification flow (`register.tsx` session check + `app/(auth)/email-verification.tsx` + `app/(auth)/auth-callback.tsx`)
- Apple Universal Links + Android App Links (`app.json` associatedDomains/intentFilters + `docs/.well-known/apple-app-site-association` + `docs/.well-known/assetlinks.json` + `docs/auth/verify.html` brand-pure landing)
- 3 Sentry crash fix: `register.tsx` `.rpc().catch()` → try/catch, `presence.ts` `bumpLastActive` aynı, `AvatarUploader.tsx` `arrayBuffer` guard
- Kotlin 2.0.21 + KSP 2.0.21-1.0.28 (expo-updates compat)
- Version 1.0.0, splash bg #0F1E47, AdMob remove
- iOS EAS submit config: `kesfegel@gmail.com` + ASC App ID `6766981661` + Apple Team `7964PXR27N`
- RevenueCat env: iOS + Android keys (sensitive, EAS production)
- Sentry env: SENTRY_AUTH_TOKEN + EXPO_PUBLIC_SENTRY_DSN
- AspIcon registry shell (50+ custom icon + Lucide fallback)
- TabletShell wrapper (≥768px breakpoint, 560px shell)

**Build geçmişi:**
- BUILD 2 → iOS ✅ + Android ❌ Gradle (Phase 1-4)
- BUILD 3 → iOS ✅ + Android ❌ (Phase 5-7)
- BUILD 4 → iOS ✅ + Android ❌ (Phase 8-9)
- BUILD 5 → iOS ✅ + Android ❌ (Phase 10-13)
- BUILD 6 → Android-only Kotlin fix kanıtlandı ✅
- BUILD 7 — atlandı
- BUILD 8 → iOS `teN9jC8vw...ipa` + Android `5oxEbqRS6...aab` ✅ ikisi de başarılı (commit `ca738a2`)
- BUILD 9 → cancelled (Universal Links eksikti)
- BUILD 10 → cancelled (3 crash fix eksikti)
- BUILD 11 → 🤖 Android ✅ `s5MCBdgzMbQA36FogmUgyf.aab` + 🍏 iOS ❌ FAILED (Associated Domains capability eksik)
- BUILD 12 → 🍏 iOS ❌ FAILED (provisioning profile hala eski) → silindi
- BUILD 13 → 🍏 iOS cancel (kredi kurtar, EAS dashboard'tan provisioning profile reset)
- BUILD 14 → 🍏 iOS ✅ `xaFwQWS9BSKUn3Kc12Z2Yk.ipa` (`fc655acf-09fa-45ba-a998-3b3cfc220e1f`)
  - Build #21, Submitted to TestFlight (`4e11bdb7-dfcf-451b-b877-697cda09c2f6`)
  - Apple/Google Sign-In butonları "Soon" alert (henüz implement değil)
- BUILD 15 → 🍏 iOS ✅ `cwXejsqQj9pNnDU2MnF8kP.ipa` (`5d66dff4-89a8-4525-aa07-5f56d98efb41`)
  - Build #22, Submitted to TestFlight (`049c8ad4-2b4c-4874-b915-7c88af2f98ca`)
  - Provisioning profile yeni: `LZ844ZWKTZ` (Associated Domains + Sign in with Apple capability dahil)
  - Apple Sign-In: gerçek implement ✅
  - Google Sign-In: kod var ama Google env değişkenleri (`EXPO_PUBLIC_GOOGLE_*`) build sırasında eas.json'a yazılmadı → runtime'da fail
  - EAS kredi: %93 kullanıldı, BUILD 16 son kredi olabilir

**Apple Submit hazırlık:**
- iOS BUILD 8 ipa TestFlight'a yüklendi (`eas submit` ile, submission `9e683818-fa5a-4423-a99d-39a6fca2a1a1`)
- ASC App: `https://appstoreconnect.apple.com/apps/6766981661/testflight/ios` — 1.0.0 build 15 "Ready to Submit" (Internal Test for Team Expo)
- iOS app açılınca tester kendini Internal Tester olarak eklemiş

### Domain & Mail Infra (2026-05-09)

- **Domain**: `airspeak.app` (GoDaddy'den alındı)
- **Resend hesabı**: `durakkamil@gmail.com` ile açıldı
  - Domain verified ✅
  - DKIM kayıtları GoDaddy DNS'inde: `resend._domainkey` TXT + `send` MX (`feedback-smtp.eu-west-1.amazonses.com` Priority 10)
  - API key: env'de saklı, chat'e düşen eski key `re_8214GTJH_MMYMfutJuX9Yo4QkLU6Mquur` revoke edilmeli
- **Supabase SMTP** custom config:
  - Host: `smtp.resend.com`, Port: `465`, Username: `resend`, Password: Resend API key
  - Sender: `noreply@airspeak.app`, Name: `AirSpeak`
  - Min interval: 60sn
  - ⚠ Save sonrası password maskelenir ("Reveal" butonu var), bu normal davranış
  - Test signup yapıldı → mail Gmail'e ulaştı ✅ (Resend gerçekten çalıştı)

### Push problemi (çözülmedi)

```
remote: Permission to tinymaxi1/airspeak.git denied to ozlemkesifte.
fatal: HTTP 403
```

Local commit'ler push edilmedi (main `ad36c8b`, origin/main `9317e42`). 8 commit local'de bekliyor:
- `739b109` docs CLAUDE.md canlı-first
- `2b3c32a` feat(auth): email verification + airspeak.app
- `2c8dec2` chore(eas): ASC #6766981661
- `ca738a2` chore(eas): iOS submit PENDING (BUILD 8 sonrası kalan)
- `3a33c32` chore: remove admob + expo-doctor
- 4a4448e feat(community): block user system
- 37d4eb7 feat(ui): block user UI + terms
- 9317e42 phase 13: tablet shell
- ... + 8 ekstra

**Fix:** `gh auth login` veya `git remote set-url` SSH'a → user manuel

### Açık BLOCKER'lar (yeni sohbet bu noktadan devam)

1. **iOS BUILD 11 FAILED — Associated Domains capability** (KRİTİK, ilk yapılacak):
   - Hata: "Provisioning profile doesn't include the Associated Domains capability"
   - Sebep: app.json'a `ios.associatedDomains` yeni eklendi, mevcut provisioning profile bu capability ile generate edilmedi
   - **Çözüm A** (Apple Developer Portal manuel):
     - https://developer.apple.com/account/resources/identifiers/list
     - `app.airspeak.mobile` App ID'sini aç → Capabilities → "Associated Domains" checkbox işaretle → Save
     - Sonra `eas build --platform ios --profile production --clear-cache` (yeni provisioning profile auto-generate)
   - **Çözüm B** (EAS otomatik):
     - `eas credentials -p ios --profile production` → Provisioning Profile → "Set up a new profile" → seç → EAS yeni profile yaratır (Associated Domains dahil)
     - Sonra `eas build --platform ios --profile production` retry
   - **Çözüm C** (geçici, Universal Links'i ertele):
     - app.json'dan `ios.associatedDomains` geçici kaldır
     - BUILD 12 iOS başarılı olur ama Universal Links çalışmaz
     - v1.0.1'de credentials fix + universal links geri

2. **GitHub Pages** — user manuel açacak (verify.html host için):
   - Settings → Pages → Source: `main` / `/docs` folder
   - Custom domain: `airspeak.app`
   - Enforce HTTPS

3. **GoDaddy DNS** — user düzenliyor (TAKILDI 2026-05-09):
   - SİL: `A @ WebsiteBuilder Site` (parking page, çakışma yaratıyor)
   - SİL: `CNAME www airspeak.app.` (default)
   - EKLE: 4× `A @` → `185.199.108.153/.109.153/.110.153/.111.153`
   - EKLE: `CNAME www` → `tinymaxi1.github.io`
   - Mevcut Resend kayıtları KALMALI: `MX send` + `TXT resend._domainkey` + (eksik) `TXT send` SPF `v=spf1 include:amazonses.com ~all`
   - User'ın son hatası: "Kayıt verisi geçersiz." A @ ekleyemiyor → WebsiteBuilder Site kaydı silinmemiş olabilir, screenshot iste

4. **Supabase URL Configuration** — user manuel:
   - Site URL: `https://airspeak.app` (`airspeak://` değil!)
   - Redirect URLs: `https://airspeak.app/auth/verify` + `https://airspeak.app/auth/**`
   - Save

5. **BUILD 12 trigger** — iOS Associated Domains fix sonrası:
   - iOS sadece veya iOS+Android (Android zaten BUILD 11'de başarılı, gerek yok)
   - `eas build --platform ios --profile production` (clear-cache opsiyonel)
   - Beklenen süre ~20 dk

6. **Android BUILD 11 sonrası**:
   - AAB hazır: `s5MCBdgzMbQA36FogmUgyf.aab`
   - Play Console internal track upload (manuel veya `eas submit -p android --latest`)
   - Internal testing

7. **Sentry crash REACT-NATIVE-4 + 5** — realtime postgres_changes duplicate subscribe (ErrorBoundary catches, app crash etmez, sadece component) — v1.0.1 cleanup için bırakıldı

### Resend API key güvenlik

⚠ Chat'e düşen `re_8214GTJH_MMYMfutJuX9Yo4QkLU6Mquur` revoke edilmeli + Supabase SMTP'de yeni key kullanılmalı. Yeni sohbette bu konu açılırsa hatırla.

### Background process'ler

Yeni sohbet açılırken bu background task'lar çalışıyor olabilir:
- BUILD 11 main process: `/tmp/build-11.log` (log)
- BUILD URL detector: tail process (URL geldikten sonra exit)

Yeni sohbet başlangıçta `tail -10 /tmp/build-11.log` ile build durumunu öğren.

### Production Launch Checklist (kapatılmamış)

| Konu | Durum |
|---|---|
| Domain `airspeak.app` | ✅ alındı |
| GitHub Pages aktif + custom domain | ⏳ user yapacak |
| GoDaddy DNS (A records + www CNAME) | ⏳ user TAKILDI |
| Supabase URL Config HTTPS | ⏳ user yapacak |
| Supabase SMTP (Resend) | ✅ kuruldu, test mail geldi |
| Universal Links + assetlinks | ✅ kod hazır, BUILD 11'de |
| Email verification UI flow | ✅ kod hazır |
| Apple 1.2 Block User | ✅ |
| AdMob test ID removed | ✅ |
| AspIcon registry + emoji refactor | ✅ shell, emoji refactor v1.1 |
| TabletShell | ✅ |
| iOS TestFlight upload | ✅ BUILD 8 ipa |
| ASC App Privacy answers | ⏳ user yapacak (manuel) |
| App Store screenshots + listing | ⏳ user yapacak |
| Play Console aab upload | ⏳ BUILD 11 sonrası |
| Custom SMTP rate limit (Resend) | ✅ unlimited (paid kullanım gerekirse) |
| PostHog env | ⏳ eksik (analytics yok) |
| Google SSO env | ⏳ eksik (Apple Sign-In OK) |

## Hızlı komutlar

```bash
# Ana proje root'una geç
cd "/Users/ozlemakcin/Desktop/thy app"

# Migration apply
supabase db push --include-all

# Edge function deploy
supabase functions deploy notification-triggers --project-ref neinhbkdctjtyyoskxpg
supabase functions deploy oral-exam-evaluate --project-ref neinhbkdctjtyyoskxpg
supabase functions deploy whisper-transcribe --project-ref neinhbkdctjtyyoskxpg

# Typecheck
npx tsc --noEmit
cd admin && npx tsc --noEmit  # node_modules yoksa modül not found hatları normal

# Mobile env (gitignored .env)
EXPO_PUBLIC_SUPABASE_URL=https://neinhbkdctjtyyoskxpg.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon>

# Admin env (admin/.env.local)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DEEPL_API_KEY=...
```

## Yeni sprint başlarken iş akışı

1. Kullanıcı sprint adı + alt sprint planı verir
2. **Tespit yap** (paralel grep/find/read) — mevcut altyapı, çakışan yerler
3. Tespit özet sun + kararlar için sorular (5-10 soru tipik)
4. Kullanıcı onayı sonra alt-sprint sıralaması netleşir
5. Her alt-sprint **atomik commit** — bir önceki bitmeden sonrakine geçilmez
6. Migration apply + Edge Function deploy (gerekiyorsa) sprint sonu
7. CLAUDE.md güncellenmeli — kullanıcı talep ederse veya yeni sohbete geçişte

## Kullanıcı talimatına özel notlar

- "İçerik üretimi yok, sadece altyapı" → Sprint 3f.A açılışta belirtildi. Adaptive logic + tablo, mevcut content ile çalışır.
- "API key konfigürasyonu en sona" → Sprint 7.A.1'de uygulandı. Tüm sistem mock'a default; admin sonra gerçek key girer.
- "Premium gating" — kullanıcı genelde "free" tarafında karar veriyor (engagement). Premium upsell paywall + offer + lesson limit + AI conversation limit.

---

**Son güncelleme**: 2026-05-09 — 14-Phase design refactor + production launch prep. Local main `ad36c8b` (push edilmedi — GitHub auth conflict, 8 commit local). BUILD 11 cloud'da. Domain `airspeak.app` + Resend SMTP kuruldu. User GoDaddy DNS aşamasında takılı.

**Tüm tamamlanan iş**: Faz 0-8 (admin/content pipeline) + Sprint 3a, 3e, 3f, 4, 5, 6, 7 (gamification, community, oral exam, stats, placement adaptive) + Sprint 8.A.2/A.3/B.1/C.1-3 (store hazırlık) + Sprint 11.A/B.1-11 (glossary 921 terim) + Sprint 12.A-D (theory + unit intro) + Sprint 13.A.1-7 (RevenueCat IAP) + Sprint 13.B.1 (eas.json Android profil).

---

## İçerik Üretimi Sprint (Lansman öncesi — PLANLI)

**Tarih**: 2026-05-13 sonrası planlanır. Lansmandan 4 ay önce başlat, 1-2 hafta her rol.

### Mevcut Durum (v1.0 UX REAL FIX Pack sonrası)

- 7 rol sistemde: pilot, atc, cabin, technician, ground, student, **dispatcher** (eklendi)
- `profiles_role_check` + `modules_role_check` 7 rolü destekler (migration `20260513000001`)
- **Eksik CHECK constraint'ler** (içerik üretimi öncesi ek migration gerekli):
  - `interview_questions_role_check` (eski 5 rol, atc + dispatcher YOK)
  - `league_groups_role_check` (eski 5 rol + 'all')
  - `scenarios_role_check` (eski 5 rol + 'all')
  - `vocab_terms_role_check` (eski 5 rol + 'all')
  - `word_of_the_day_target_roles_check` (6 rol, dispatcher YOK)

### Eksik İçerik

| Rol | scenarios | vocab_terms | interview_qns | modules |
|---|---|---|---|---|
| **pilot** | ✅ mevcut | ✅ mevcut | ✅ mevcut | ✅ mevcut |
| **atc** | 0 | az | 0 | az |
| **dispatcher** | 0 | 0 | 0 | 0 |
| **technician** | az | mevcut | mevcut | az |
| **ground** | az | mevcut | mevcut | az |
| **student** | az | mevcut | mevcut | az |
| **cabin** | ✅ mevcut | ✅ mevcut | ✅ mevcut | ✅ mevcut |

### Hedef (her rol için minimum)

- 5 module × 3 unit × 3 lesson = **45 lesson**
- **5-10 conversation scenario**
- **30-50 vocab term**
- **10-20 interview question**
- **1 league group seed**

### Tahmini Süre

- Rol başına: 8-15 saat
- Toplam (6 eksik rol × 10 saat): **~60 saat**
  (pilot mevcut, cabin mevcut, diğerleri kısmi veya sıfır)

### Yöntem

1. **Admin paneli `/admin/tree` ile manuel CRUD** (slow but quality control)
2. **Claude ile lesson generation pipeline**:
   - Role + module spec input
   - Generation script (Anthropic API) + admin import endpoint
   - Tahmini hızlandırma: 5-10x

### Bağlantılı Eksik Altyapı (içerik üretimi başlamadan ÖNCE ~2 saat)

1. **Ek CHECK constraint migration** — 5 tabloya 7 rol kabul ettir
2. **`/readback?category=xxx` param desteği** + `getRandomClearances(count, category?)` filter
3. **`/practice` DRILLS array genişletme** — yeni category enum değerleri
4. **`/pronunciation/alphabet` + `/pronunciation/numbers` static route'lar** (veya `[id].tsx` alphabet/numbers ID handle)
5. **`AtcClearance.category` enum genişletme** — fault_reporting, marshalling, conflict_resolution, pa_announcement, vb.

### Sprint Aşamaları (önerilen)

- **Hafta 1**: Altyapı (constraint migration + route param + clearance category) + dispatcher cards minimum content
- **Hafta 2-3**: ATC content (en kritik eksik)
- **Hafta 4**: Dispatcher content
- **Hafta 5-6**: Technician + Ground content güçlendirme
- **Hafta 7**: Student content güçlendirme + cross-rol vocab
- **Hafta 8**: QA + admin review

---

## Sentry Workflow (FAZ 7 — Observability)

**Setup**:
- Org: `airspeak` · Project: `react-native`
- Mobile init: `src/lib/sentry.ts` → `Sentry.init()` + `setExpoUpdateTags()` (OTA #17 sonrası her event'te `expo-update-id`, `expo-channel`, `expo-runtime-version`, `expo-update-embedded` tag'leri attach edilir)
- Auth token env: `SENTRY_AUTH_TOKEN` (write scope dahil: `event:admin`, `event:write`, `org:read`, `project:read`)
- ⚠️ Token'ı **dosyaya yazma** — sadece env var (in-memory)

### Helper Script: `scripts/sentry-helper.sh`

```bash
export SENTRY_AUTH_TOKEN="sntryu_..."
./scripts/sentry-helper.sh list 24h           # son 24h unresolved (14d, 7d, 24h)
./scripts/sentry-helper.sh latest             # en son crash özeti
./scripts/sentry-helper.sh trace <event_id>   # tam stack trace + breadcrumbs + tag'ler
./scripts/sentry-helper.sh issue <id>         # issue summary JSON
./scripts/sentry-helper.sh resolve <id>       # status=resolved
./scripts/sentry-helper.sh unresolve <id>     # status=unresolved (test)
```

`<id>` formatı: `REACT-NATIVE-7` (shortId, case-insensitive) veya `119572632` (numeric).

### Yeni Crash Bildirimi → Akış

1. Kullanıcı: "Sentry'de crash var, event_id X" der
2. `./scripts/sentry-helper.sh trace X` → tam stack trace + tag'ler (expo-update-id ile hangi OTA tespit)
3. `./scripts/sentry-helper.sh issue <groupId>` → issue history (kaç event, kaç user, ilk/son seen)
4. Kod incele → fix yaz → commit + push + OTA
5. OTA telefonlara inince 10-15 dk bekle → yeni event yoksa `./scripts/sentry-helper.sh resolve <id>`
6. Yeni event gelirse: tag'lerden hangi OTA'da olduğunu doğrula (eğer fix sonrası OTA'da event geliyorsa fix yetersiz, regression)

### Tag Bazlı Filtreleme (Sentry UI)

```
expo-update-id:019e20ed-3b89-...           → sadece OTA #17 event'leri
expo-update-embedded:true                  → OTA inmemiş, embedded JS
release:app.airspeak.mobile@1.0.0+29       → BUILD 29 native
```

### Resolved Issue Geçmişi (FAZ 7 sonrası)

| shortId | Cause | Resolved |
|---|---|---|
| RN-1 | register.tsx:68 handleRegister undefined (build 15 eski) | ✅ FAZ 7 |
| RN-2 | presence.ts:75 bumpLastActive undefined (cascading) | ✅ FAZ 7 |
| RN-3 | AvatarUploader.tsx:65 uploadToStorage (eski) | ✅ FAZ 7 |
| RN-4 | home.tsx postgres_changes (build 22, fix OTA #14+) | UNRESOLVED — OTA #15+ ile test |
| RN-5 | _layout.tsx postgres_changes (38 event, fix var) | UNRESOLVED |
| RN-6 | useUserDataSync run undefined (OTA #14 fix) | UNRESOLVED — OTA #16+ test |
| RN-7 | conversation infinite loop (OTA #14 fix) | UNRESOLVED — OTA #16+ test |
