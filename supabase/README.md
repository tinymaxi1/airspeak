# Supabase — AirSpeak

## Yerel Geliştirme

### Kurulum
```bash
npm install -g supabase
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
```

### Migration uygulama
```bash
supabase db push           # tüm migrations'ı production'a uygula
supabase db reset          # local DB'yi sıfırla, migrations + seed çalıştır
```

### Type generation
```bash
SUPABASE_PROJECT_ID=xxx npm run supabase:gen-types
```

## Migration Sırası

| # | Sprint | Dosya | İçerik |
|---|---|---|---|
| 1 | Sprint 1 | `20260426000000_init_profiles.sql` | profiles + user_settings + RLS + auto-create trigger |
| 2 | Sprint 7 | `20260429100000_push_tokens.sql` | push_tokens + RLS + 30-gün stale cleanup |
| 3 | Sprint 7 | `20260429110000_content_flags.sql` | content_flags + 24h dup-guard + flag_counts view |
| 4 | Sprint 7 | `20260429120000_exam_simulations.sql` | exam_simulations + question_attempts + oral_exam_prompts + oral_attempts |
| 5 | Sprint 2 | (gelecek) | categories, courses, units, lessons, exercises |
| 4 | Sprint 3 | (gelecek) | xp_logs, streaks, hearts, coins, badges |
| 5 | Sprint 4 | (gelecek) | SRS, daily_quests, leagues |
| 6 | Sprint 5 | (gelecek) | conversation_scenarios, user_conversations |
| 7 | Sprint 6 | (gelecek) | subscriptions, ai_usage_logs, pronunciation_attempts |
| 8 | Sprint 7 | (gelecek) | exam_simulations, oral_exam_prompts, content_flags |
| 9 | Sprint 8 | (gelecek) | phraseology_entries, aviation_documents, exam_schedules, referrals, offline_downloads |

## Edge Functions

`functions/` altındaki klasörler ileride gelecek:
- `claude-proxy/` — Claude API key client'tan gizli, server proxy
- `whisper-stt/` — Speech-to-text
- `streak-cron/` — Günlük streak hesabı (pg_cron)
- `league-rotation/` — Pazartesi 00:00 lig sıfırlama
- `daily-quest-generator/` — Her gece 3 görev üret

## RLS Politikaları

Her tablo için varsayılan: kullanıcı sadece **kendi `user_id`'sine ait kayıtları** okur/yazar. İstisnalar:
- İçerik tabloları (categories, courses, units, lessons, exercises, vocabulary_terms): herkese **read-only**
- Admin tabloları: sadece `admin_users` rolüne sahip kullanıcılar
