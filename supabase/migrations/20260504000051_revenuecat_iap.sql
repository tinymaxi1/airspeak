-- Sprint 13.A.1 — RevenueCat IAP backend hazırlığı
--
-- 1. profiles.revenuecat_app_user_id (idempotent — types.ts'de zaten var, drift kapatma)
-- 2. profiles.revenuecat_app_user_id index (webhook lookup için)
-- 3. app_config'e 3 RevenueCat anahtarı (boş; admin sonra doldurur — mock-first)
-- 4. app_config RLS: revenuecat.* admin-only read

-- 1+2. profiles kolonu
alter table public.profiles
  add column if not exists revenuecat_app_user_id text;

create index if not exists profiles_revenuecat_id_idx
  on public.profiles (revenuecat_app_user_id)
  where revenuecat_app_user_id is not null;

comment on column public.profiles.revenuecat_app_user_id is
  'RevenueCat App User ID — webhook event delivery için lookup; null ise hiç IAP yapılmamış.';

-- 3a. app_config category check'ini açık metin yap (yeni kategori eklemek için
-- her seferinde check güncellemek baş ağrısı — open text yeterli)
alter table public.app_config
  drop constraint if exists app_config_category_check;

-- 3b. app_config seed (boş; admin /admin/iap sayfasından doldurur)
insert into public.app_config (key, value, category, description, data_type) values
  ('revenuecat.ios_api_key', '""'::jsonb, 'iap',
   'RevenueCat iOS public SDK key. Boşsa paywall "yakında aktif" gösterir.', 'string'),
  ('revenuecat.android_api_key', '""'::jsonb, 'iap',
   'RevenueCat Android public SDK key. Boşsa paywall "yakında aktif" gösterir.', 'string'),
  ('revenuecat.webhook_secret', '""'::jsonb, 'iap',
   'RevenueCat webhook Authorization header secret. Edge fn signature verify için.', 'string'),
  ('iap.entitlement_id', '"pro"'::jsonb, 'iap',
   'RevenueCat entitlement identifier (premium gating için).', 'string'),
  ('iap.product_ids', '["airspeak_pro_annual","airspeak_pro_monthly","airspeak_pro_student"]'::jsonb,
   'iap', 'App Store Connect product ID listesi (paywall fetch için).', 'array')
on conflict (key) do nothing;

-- 4. RLS — revenuecat.* admin-only (mevcut _api_key + service_token pattern'ine ek)
drop policy if exists app_config_public_read on public.app_config;
create policy app_config_public_read
  on public.app_config
  for select
  using (
    key not like '%_api_key'
    and key not like '%service_token'
    and key not like 'revenuecat.%'
    or public.is_admin_user()
  );

do $$ begin
  raise notice 'Sprint 13.A.1 — RevenueCat IAP schema hazır (key boşsa mock-first)';
end $$;
