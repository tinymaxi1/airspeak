-- Sprint 7.C — Edge function rate limit altyapı
-- Per-user (auth varsa) + per-IP fallback, action-specific limits.
-- ============================================================================

create table if not exists public.rate_limit_log (
  id bigint primary key generated always as identity,
  bucket text not null,           -- 'broadcast' / 'oral-evaluate' / 'whisper' / 'notification-trigger' / ...
  identity text not null,         -- 'u:<uuid>' veya 'ip:<addr>'
  occurred_at timestamptz not null default now()
);

create index if not exists rate_limit_log_lookup_idx
  on public.rate_limit_log (bucket, identity, occurred_at desc);

create index if not exists rate_limit_log_cleanup_idx
  on public.rate_limit_log (occurred_at);

-- 24 saatten eski kayıtları silmek için cleanup fonksiyonu (cron'a takılır)
create or replace function public.purge_rate_limit_log()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
begin
  delete from public.rate_limit_log
  where occurred_at < now() - interval '24 hours';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- ============================================================================
-- check_rate_limit — atomik check + insert.
-- p_max: window içinde izin verilen max action sayısı
-- p_window_seconds: pencere genişliği saniye
-- Dönüş: { ok: true, remaining: int, retry_after_seconds?: int }
-- ============================================================================
create or replace function public.check_rate_limit(
  p_bucket text,
  p_identity text,
  p_max integer,
  p_window_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz := now() - make_interval(secs => p_window_seconds);
  v_count int;
  v_oldest timestamptz;
begin
  if p_bucket is null or p_identity is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_args');
  end if;

  select count(*), min(occurred_at)
    into v_count, v_oldest
    from public.rate_limit_log
   where bucket = p_bucket
     and identity = p_identity
     and occurred_at >= v_window_start;

  if v_count >= p_max then
    return jsonb_build_object(
      'ok', false,
      'error', 'rate_limit_exceeded',
      'limit', p_max,
      'window_seconds', p_window_seconds,
      'retry_after_seconds',
        greatest(1, ceil(extract(epoch from (v_oldest + make_interval(secs => p_window_seconds) - now())))::int)
    );
  end if;

  insert into public.rate_limit_log (bucket, identity)
  values (p_bucket, p_identity);

  return jsonb_build_object(
    'ok', true,
    'remaining', p_max - v_count - 1,
    'limit', p_max,
    'window_seconds', p_window_seconds
  );
end;
$$;

revoke all on function public.check_rate_limit(text, text, integer, integer) from public;
grant execute on function public.check_rate_limit(text, text, integer, integer) to authenticated, service_role;

-- RLS: kimse bu tabloyu okumasın. Sadece service_role yazar/okur.
alter table public.rate_limit_log enable row level security;
drop policy if exists "rate_limit_log_no_access" on public.rate_limit_log;
create policy "rate_limit_log_no_access" on public.rate_limit_log
  for select using (false);
