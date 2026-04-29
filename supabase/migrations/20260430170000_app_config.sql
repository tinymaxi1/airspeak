-- AirSpeak — App Config tablosu (reklam, freemium, paywall ayarları)
-- Faz 8: Admin'den değiştirilen tüm runtime config burada yaşar.

create table if not exists public.app_config (
  key text primary key,
  value jsonb not null,
  description text,
  category text not null check (category in ('ads', 'freemium', 'paywall', 'feature_flag', 'general')),
  data_type text not null check (data_type in ('boolean', 'number', 'string', 'json', 'array')),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create index if not exists app_config_category_idx on public.app_config (category);

alter table public.app_config enable row level security;

-- Mobile (anon) → tüm config'i okuyabilir
drop policy if exists app_config_public_read on public.app_config;
create policy app_config_public_read
  on public.app_config
  for select
  using (true);

-- Editor+ → güncelleyebilir
drop policy if exists app_config_editor_write on public.app_config;
create policy app_config_editor_write
  on public.app_config
  for update
  using (public.has_admin_role('editor'))
  with check (public.has_admin_role('editor'));

-- Super admin → ekleyebilir/silebilir
drop policy if exists app_config_super_insert on public.app_config;
create policy app_config_super_insert
  on public.app_config
  for insert
  with check (public.has_admin_role('super_admin'));

drop policy if exists app_config_super_delete on public.app_config;
create policy app_config_super_delete
  on public.app_config
  for delete
  using (public.has_admin_role('super_admin'));

-- updated_at trigger
drop trigger if exists app_config_set_updated_at on public.app_config;
create trigger app_config_set_updated_at
  before update on public.app_config
  for each row
  execute function public.set_updated_at();

-- Audit trigger
drop trigger if exists app_config_audit on public.app_config;
create trigger app_config_audit
  after insert or update or delete on public.app_config
  for each row
  execute function public.audit_content_change();

-- Realtime notify
drop trigger if exists app_config_notify on public.app_config;
create trigger app_config_notify
  after update on public.app_config
  for each row
  execute function public.notify_content_published();

-- ============================================================================
-- DEFAULT CONFIG SEED
-- ============================================================================

insert into public.app_config (key, value, description, category, data_type) values
  -- ─── REKLAMLAR ───
  ('ads.enabled',                   'true'::jsonb,    'Reklamlar aktif mi?', 'ads', 'boolean'),
  ('ads.banner_home',               'false'::jsonb,   'Ana sayfada banner reklam', 'ads', 'boolean'),
  ('ads.banner_lesson_complete',    'true'::jsonb,    'Ders sonunda banner reklam', 'ads', 'boolean'),
  ('ads.interstitial_every_n_lessons', '3'::jsonb,    'Kaç dersten sonra tam ekran reklam', 'ads', 'number'),
  ('ads.rewarded_heart_refill',     'true'::jsonb,    'Reklam izle → kalp dolsun', 'ads', 'boolean'),
  ('ads.admob_app_id_ios',          '""'::jsonb,      'AdMob iOS App ID', 'ads', 'string'),
  ('ads.admob_app_id_android',      '""'::jsonb,      'AdMob Android App ID', 'ads', 'string'),
  ('ads.admob_banner_unit_id',      '""'::jsonb,      'Banner reklam unit ID', 'ads', 'string'),
  ('ads.admob_interstitial_unit_id','""'::jsonb,      'Interstitial reklam unit ID', 'ads', 'string'),
  ('ads.cta_text_tr',               '"Reklamsız bir AirSpeak için Pro''ya geç"'::jsonb, 'Reklam yerine gösterilen CTA', 'ads', 'string'),

  -- ─── FREEMIUM LİMİTLER ───
  ('freemium.max_lessons_per_day',          '5'::jsonb,    'Free kullanıcı günde kaç ders', 'freemium', 'number'),
  ('freemium.max_ai_conversations_per_day', '1'::jsonb,    'Free kullanıcı günde kaç AI senaryo', 'freemium', 'number'),
  ('freemium.max_vocab_lookups_per_day',    '50'::jsonb,   'Free kullanıcı günde kaç vocab arama', 'freemium', 'number'),
  ('freemium.max_pronunciation_per_day',    '10'::jsonb,   'Free kullanıcı günde kaç telaffuz egzersizi', 'freemium', 'number'),
  ('freemium.placement_test_free',          'true'::jsonb, 'Placement test free kullanıcılara açık mı', 'freemium', 'boolean'),
  ('freemium.icao4_set1_free',              'true'::jsonb, 'ICAO 4 Set 1 free açık', 'freemium', 'boolean'),
  ('freemium.icao4_set2_free',              'false'::jsonb,'ICAO 4 Set 2 free açık (false=premium)', 'freemium', 'boolean'),
  ('freemium.icao4_set3_free',              'false'::jsonb,'ICAO 4 Set 3 free açık', 'freemium', 'boolean'),
  ('freemium.oral_exam_free_count',         '3'::jsonb,    'Free kullanıcı kaç oral prompt görür', 'freemium', 'number'),
  ('freemium.interview_questions_free_per_airline', '5'::jsonb, 'Havayolu başına free görünen mülakat sorusu', 'freemium', 'number'),
  ('freemium.bookmark_max',                 '20'::jsonb,   'Free yer imi limiti', 'freemium', 'number'),
  ('freemium.heart_max',                    '5'::jsonb,    'Free kalp havuzu', 'freemium', 'number'),
  ('freemium.heart_refill_hours',           '6'::jsonb,    'Free kalp yenileme süresi (saat)', 'freemium', 'number'),

  -- ─── PREMIUM AYRICALIKLARI ───
  ('premium.unlimited_lessons',     'true'::jsonb,  'Pro: sınırsız ders', 'feature_flag', 'boolean'),
  ('premium.unlimited_ai',          'true'::jsonb,  'Pro: sınırsız AI senaryo', 'feature_flag', 'boolean'),
  ('premium.icao4_full_access',     'true'::jsonb,  'Pro: tüm ICAO 4 setleri', 'feature_flag', 'boolean'),
  ('premium.detailed_explanations', 'true'::jsonb,  'Pro: 6-katmanlı detaylı açıklama', 'feature_flag', 'boolean'),
  ('premium.no_ads',                'true'::jsonb,  'Pro: reklam yok', 'feature_flag', 'boolean'),
  ('premium.audio_download',        'true'::jsonb,  'Pro: offline ses indirme', 'feature_flag', 'boolean'),
  ('premium.priority_support',      'true'::jsonb,  'Pro: öncelikli destek', 'feature_flag', 'boolean'),
  ('premium.advanced_analytics',    'true'::jsonb,  'Pro: gelişmiş istatistikler', 'feature_flag', 'boolean'),

  -- ─── PAYWALL FİYATLANDIRMA ───
  ('paywall.monthly_price_try',     '99'::jsonb,   'Aylık fiyat (TL)', 'paywall', 'number'),
  ('paywall.yearly_price_try',      '799'::jsonb,  'Yıllık fiyat (TL)', 'paywall', 'number'),
  ('paywall.lifetime_price_try',    '1999'::jsonb, 'Lifetime fiyat (TL)', 'paywall', 'number'),
  ('paywall.trial_days',            '7'::jsonb,    'Deneme süresi (gün)', 'paywall', 'number'),
  ('paywall.yearly_savings_percent','33'::jsonb,   'Yıllık tasarruf %', 'paywall', 'number'),
  ('paywall.headline_tr',           '"Tüm 30000 egzersiz, ICAO 4''ün tam içeriği, sınırsız AI"'::jsonb, 'Paywall ana metin', 'paywall', 'string'),
  ('paywall.subhead_tr',            '"7 gün ücretsiz dene. İstediğin zaman iptal et."'::jsonb, 'Paywall alt metin', 'paywall', 'string'),
  ('paywall.benefits_tr', '["Sınırsız ders", "Tüm ICAO 4 setleri", "Reklamsız", "AI ile sınırsız konuşma", "Offline ses indirme", "Öncelikli destek"]'::jsonb, 'Paywall avantaj listesi', 'paywall', 'array'),
  ('paywall.show_lifetime',         'true'::jsonb, 'Lifetime tier göster', 'paywall', 'boolean'),
  ('paywall.recommended_tier',      '"yearly"'::jsonb, 'Önerilen plan (monthly/yearly/lifetime)', 'paywall', 'string'),

  -- ─── GENEL ───
  ('app.maintenance_mode',          'false'::jsonb, 'Bakım modu — açıksa uygulama girişi engellenir', 'general', 'boolean'),
  ('app.maintenance_message_tr',    '"Bakım yapılıyor, kısa süre içinde döneceğiz."'::jsonb, 'Bakım mesajı', 'general', 'string'),
  ('app.min_supported_version_ios', '"1.0.0"'::jsonb, 'Min iOS sürümü', 'general', 'string'),
  ('app.min_supported_version_android', '"1.0.0"'::jsonb, 'Min Android sürümü', 'general', 'string'),
  ('app.force_update',              'false'::jsonb, 'Zorunlu güncelleme', 'general', 'boolean')
on conflict (key) do nothing;

comment on table public.app_config is 'Runtime config: ads, freemium, paywall, feature flags. Mobile her açılışta okur, admin değiştirir.';

-- ============================================================================
-- DAILY USAGE — kullanıcı bazlı günlük sayaç (limit kontrol için)
-- ============================================================================

create table if not exists public.daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  lessons_completed int not null default 0,
  ai_conversations int not null default 0,
  vocab_lookups int not null default 0,
  pronunciation_attempts int not null default 0,
  oral_attempts int not null default 0,
  ads_watched int not null default 0,
  hearts_refilled_via_ad int not null default 0,
  primary key (user_id, day)
);

create index if not exists daily_usage_day_idx on public.daily_usage (day);

alter table public.daily_usage enable row level security;

drop policy if exists daily_usage_own_read on public.daily_usage;
create policy daily_usage_own_read
  on public.daily_usage
  for select
  using (user_id = auth.uid() or public.is_admin_user());

drop policy if exists daily_usage_own_write on public.daily_usage;
create policy daily_usage_own_write
  on public.daily_usage
  for insert
  with check (user_id = auth.uid());

drop policy if exists daily_usage_own_update on public.daily_usage;
create policy daily_usage_own_update
  on public.daily_usage
  for update
  using (user_id = auth.uid());

-- Increment helper (mobile her aktivitede çağırır)
create or replace function public.bump_daily_usage(field text, amount int default 1)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then return; end if;

  insert into public.daily_usage (user_id, day) values (auth.uid(), current_date)
  on conflict (user_id, day) do nothing;

  if field = 'lessons_completed' then
    update public.daily_usage set lessons_completed = lessons_completed + amount where user_id = auth.uid() and day = current_date;
  elsif field = 'ai_conversations' then
    update public.daily_usage set ai_conversations = ai_conversations + amount where user_id = auth.uid() and day = current_date;
  elsif field = 'vocab_lookups' then
    update public.daily_usage set vocab_lookups = vocab_lookups + amount where user_id = auth.uid() and day = current_date;
  elsif field = 'pronunciation_attempts' then
    update public.daily_usage set pronunciation_attempts = pronunciation_attempts + amount where user_id = auth.uid() and day = current_date;
  elsif field = 'oral_attempts' then
    update public.daily_usage set oral_attempts = oral_attempts + amount where user_id = auth.uid() and day = current_date;
  elsif field = 'ads_watched' then
    update public.daily_usage set ads_watched = ads_watched + amount where user_id = auth.uid() and day = current_date;
  elsif field = 'hearts_refilled_via_ad' then
    update public.daily_usage set hearts_refilled_via_ad = hearts_refilled_via_ad + amount where user_id = auth.uid() and day = current_date;
  end if;
end;
$$;

comment on function public.bump_daily_usage(text, int) is 'Mobile aktivite sayaç artırma — RPC ile çağrılır';

-- ============================================================================
-- REVENUE EVENTS — premium subscription lifecycle (admin görür)
-- ============================================================================

create table if not exists public.revenue_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in (
    'trial_start', 'trial_end',
    'subscription_start', 'subscription_renew', 'subscription_cancel', 'subscription_expire',
    'purchase_lifetime',
    'admin_grant', 'admin_revoke',
    'refund'
  )),
  tier text check (tier in ('monthly', 'yearly', 'lifetime', 'admin')),
  amount_try numeric,
  source text check (source in ('apple', 'google', 'stripe', 'admin', 'promo')),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists revenue_events_user_idx on public.revenue_events (user_id, created_at desc);
create index if not exists revenue_events_type_idx on public.revenue_events (event_type, created_at desc);
create index if not exists revenue_events_created_idx on public.revenue_events (created_at desc);

alter table public.revenue_events enable row level security;

drop policy if exists revenue_events_admin_read on public.revenue_events;
create policy revenue_events_admin_read
  on public.revenue_events
  for select
  using (public.is_admin_user() or user_id = auth.uid());

drop policy if exists revenue_events_admin_insert on public.revenue_events;
create policy revenue_events_admin_insert
  on public.revenue_events
  for insert
  with check (public.is_admin_user() or user_id = auth.uid());

comment on table public.revenue_events is 'Premium subscription lifecycle event log — admin paneli MRR/ARR analitiği için';

-- ============================================================================
-- HELPER VIEW: Aktif premium kullanıcılar (revenue dashboard)
-- ============================================================================

create or replace view public.active_premium_users as
select
  p.id,
  p.username,
  p.full_name,
  p.premium_until,
  greatest(0, extract(epoch from (p.premium_until - now())) / 86400)::int as days_remaining,
  (select event_type from public.revenue_events re
    where re.user_id = p.id and re.event_type in ('subscription_start','subscription_renew','purchase_lifetime','admin_grant')
    order by re.created_at desc limit 1) as last_event,
  (select tier from public.revenue_events re
    where re.user_id = p.id and re.tier is not null
    order by re.created_at desc limit 1) as current_tier
from public.profiles p
where p.premium_until > now();

grant select on public.active_premium_users to authenticated;

comment on view public.active_premium_users is 'Aktif premium üyeler + kalan gün + son event';
