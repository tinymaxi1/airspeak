-- Sprint 8.A.1 — Account deletion (Apple App Store Guideline 5.1.1(v) zorunlu)
-- Kullanıcı in-app olarak hesabını silebilmeli.
-- 30 gün cooldown — kullanıcı vazgeçebilir. Cron günlük çalışır, süresi gelenleri hard delete eder.

create table if not exists public.account_deletion_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  requested_at timestamptz not null default now(),
  scheduled_for timestamptz not null,
  reason text,
  status text not null default 'pending'
    check (status in ('pending', 'cancelled', 'processed', 'failed')),
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists account_deletion_pending_idx
  on public.account_deletion_requests (scheduled_for)
  where status = 'pending';

alter table public.account_deletion_requests enable row level security;

drop policy if exists "users see own deletion request" on public.account_deletion_requests;
create policy "users see own deletion request"
  on public.account_deletion_requests for select
  using (auth.uid() = user_id);

drop policy if exists "users insert own deletion request" on public.account_deletion_requests;
create policy "users insert own deletion request"
  on public.account_deletion_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "users update own deletion request" on public.account_deletion_requests;
create policy "users update own deletion request"
  on public.account_deletion_requests for update
  using (auth.uid() = user_id and status = 'pending');

-- ============================================================================
-- RPC: silme talebi (kullanıcı çağırır)
-- Eski signature (varsa) drop edilir
-- ============================================================================
drop function if exists public.request_account_deletion(text);
drop function if exists public.cancel_account_deletion();
drop function if exists public.get_account_deletion_status();
drop function if exists public.process_pending_deletions();

create or replace function public.request_account_deletion(p_reason text default null)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cooldown_days int;
  sched timestamptz;
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select coalesce((value)::text::int, 30) into cooldown_days
    from public.app_config where key = 'account.deletion_cooldown_days';
  if cooldown_days is null then cooldown_days := 30; end if;

  sched := now() + make_interval(days => cooldown_days);

  insert into public.account_deletion_requests
    (user_id, scheduled_for, reason, requested_at, status)
  values (uid, sched, p_reason, now(), 'pending')
  on conflict (user_id) do update
    set requested_at = excluded.requested_at,
        scheduled_for = excluded.scheduled_for,
        reason = excluded.reason,
        status = 'pending',
        processed_at = null,
        error = null;

  return sched;
end;
$$;

-- ============================================================================
-- RPC: vazgeç
-- ============================================================================
create or replace function public.cancel_account_deletion()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rows int;
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  update public.account_deletion_requests
    set status = 'cancelled'
    where user_id = uid and status = 'pending';
  get diagnostics rows = row_count;
  return rows > 0;
end;
$$;

-- ============================================================================
-- RPC: durum sorgu (UI privacy ekranında kullanır)
-- ============================================================================
create or replace function public.get_account_deletion_status()
returns table(
  status text,
  scheduled_for timestamptz,
  requested_at timestamptz,
  days_remaining int
)
language sql
security definer
set search_path = public
as $$
  select
    status,
    scheduled_for,
    requested_at,
    greatest(0, ceil(extract(epoch from (scheduled_for - now())) / 86400))::int as days_remaining
  from public.account_deletion_requests
  where user_id = auth.uid() and status = 'pending'
  limit 1;
$$;

-- ============================================================================
-- Cron: süresi gelenleri hard-delete eder (auth.users cascade ile tüm veri)
-- ============================================================================
create or replace function public.process_pending_deletions()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
  cnt int := 0;
begin
  for rec in
    select user_id from public.account_deletion_requests
    where status = 'pending' and scheduled_for <= now()
    order by scheduled_for
    limit 200
  loop
    begin
      delete from auth.users where id = rec.user_id;
      update public.account_deletion_requests
        set status = 'processed', processed_at = now()
        where user_id = rec.user_id;
      cnt := cnt + 1;
    exception when others then
      update public.account_deletion_requests
        set status = 'failed', error = sqlerrm, processed_at = now()
        where user_id = rec.user_id;
    end;
  end loop;
  return cnt;
end;
$$;

grant execute on function public.request_account_deletion(text) to authenticated;
grant execute on function public.cancel_account_deletion() to authenticated;
grant execute on function public.get_account_deletion_status() to authenticated;

-- ============================================================================
-- App config — 'account' kategorisini izin listesine ekle
-- ============================================================================
ALTER TABLE public.app_config DROP CONSTRAINT IF EXISTS app_config_category_check;
DO $cat$
DECLARE v_cats text;
BEGIN
  SELECT string_agg(DISTINCT quote_literal(c), ',') INTO v_cats
  FROM (
    SELECT category AS c FROM public.app_config
    UNION ALL
    SELECT unnest(ARRAY['ads', 'freemium', 'paywall', 'feature_flag', 'general', 'audio', 'legal', 'account'])
  ) sub
  WHERE c IS NOT NULL;
  EXECUTE format(
    'ALTER TABLE public.app_config ADD CONSTRAINT app_config_category_check CHECK (category IN (%s))',
    v_cats
  );
END$cat$;

insert into public.app_config (key, value, description, category, data_type) values
  ('account.deletion_cooldown_days', '30'::jsonb,
   'Hesap silme talebi sonrası kullanıcı vazgeçebilsin diye bekleme süresi (gün)',
   'account', 'number')
on conflict (key) do nothing;

-- ============================================================================
-- pg_cron: günlük 03:00 UTC bekleyenleri işle
-- ============================================================================
do $$
begin
  if exists(select 1 from pg_extension where extname = 'pg_cron') then
    if exists(select 1 from cron.job where jobname = 'process-account-deletions-daily') then
      perform cron.unschedule('process-account-deletions-daily');
    end if;
    perform cron.schedule(
      'process-account-deletions-daily',
      '0 3 * * *',
      'select public.process_pending_deletions();'
    );
  end if;
end$$;
