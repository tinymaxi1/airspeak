-- AirSpeak — push_tokens
-- Sprint 7 / Hafta 13-14
--
-- Expo Push Service token kayıt tablosu.
-- Edge Function'lar bu tabloyu okuyup belirli kullanıcılara push gönderir.

-- ============================================================================
-- PUSH TOKENS
-- ============================================================================
create table if not exists public.push_tokens (
  token text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null check (platform in ('ios','android','other')),
  device_name text,
  app_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_tokens_user_id_idx on public.push_tokens (user_id);
create index if not exists push_tokens_updated_at_idx on public.push_tokens (updated_at desc);

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.push_tokens enable row level security;

-- Kullanıcı sadece kendi token'larını görebilir / yönetebilir
drop policy if exists "push_tokens_select_own" on public.push_tokens;
create policy "push_tokens_select_own"
  on public.push_tokens for select
  using (auth.uid() = user_id);

drop policy if exists "push_tokens_insert_own" on public.push_tokens;
create policy "push_tokens_insert_own"
  on public.push_tokens for insert
  with check (auth.uid() = user_id);

drop policy if exists "push_tokens_update_own" on public.push_tokens;
create policy "push_tokens_update_own"
  on public.push_tokens for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "push_tokens_delete_own" on public.push_tokens;
create policy "push_tokens_delete_own"
  on public.push_tokens for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- 30 GÜN STALE CLEANUP
-- ============================================================================
-- Edge Function bu fonksiyonu cron ile günde 1 kez çağırır.
-- Updated_at > 30 gün öncesi olan tokenları sil (kullanılmayan cihaz).
create or replace function public.purge_stale_push_tokens()
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  removed integer;
begin
  with deleted as (
    delete from public.push_tokens
    where updated_at < now() - interval '30 days'
    returning 1
  )
  select count(*)::integer into removed from deleted;
  return removed;
end;
$$;
