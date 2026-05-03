-- Sprint 5.A — Notification log altyapı
-- Push delivery + general in-app notification kaydı
-- community_notifications korunur (Sprint 6.D), bu tablo paralel
-- ============================================================================

-- ============================================================================
-- 1) NOTIFICATION_LOG
-- ============================================================================
create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,  -- whitelist edilmedi (esnek): streak_danger, league_promotion, oral_evaluated, ...
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  channel text not null default 'push'
    check (channel in ('push', 'in_app', 'email')),
  sent_at timestamptz not null default now(),
  delivered_at timestamptz,
  read_at timestamptz,
  tapped_at timestamptz,
  error text
);

create index if not exists notification_log_user_recent_idx
  on public.notification_log (user_id, sent_at desc);

create index if not exists notification_log_user_unread_idx
  on public.notification_log (user_id, sent_at desc)
  where read_at is null;

create index if not exists notification_log_type_idx
  on public.notification_log (type, sent_at desc);

create index if not exists notification_log_recent_idx
  on public.notification_log (sent_at desc);

alter table public.notification_log enable row level security;

-- Kullanıcı kendi log'unu okur
drop policy if exists "notification_log_select_own" on public.notification_log;
create policy "notification_log_select_own"
  on public.notification_log for select
  using (auth.uid() = user_id);

-- Kullanıcı kendi log'unu update eder (read_at, tapped_at)
drop policy if exists "notification_log_update_own" on public.notification_log;
create policy "notification_log_update_own"
  on public.notification_log for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Kullanıcı kendi log'unu siler (swipe-to-delete)
drop policy if exists "notification_log_delete_own" on public.notification_log;
create policy "notification_log_delete_own"
  on public.notification_log for delete
  using (auth.uid() = user_id);

-- Insert: sadece service_role (Edge fn) — anon/authenticated insert engelli
drop policy if exists "notification_log_no_insert" on public.notification_log;
create policy "notification_log_no_insert"
  on public.notification_log for insert
  with check (false);

-- Realtime publication (postgres_changes için)
alter publication supabase_realtime add table public.notification_log;

-- ============================================================================
-- 2) RPC: mark_notifications_read
-- ============================================================================
create or replace function public.mark_notifications_read(
  p_ids uuid[] default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_count int;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  if p_ids is null or array_length(p_ids, 1) is null then
    update public.notification_log
       set read_at = now()
     where user_id = v_uid and read_at is null;
  else
    update public.notification_log
       set read_at = now()
     where user_id = v_uid and id = any(p_ids) and read_at is null;
  end if;

  get diagnostics v_count = row_count;
  return jsonb_build_object('ok', true, 'count', v_count);
end;
$$;

revoke all on function public.mark_notifications_read(uuid[]) from public;
grant execute on function public.mark_notifications_read(uuid[]) to authenticated;

-- ============================================================================
-- 3) RPC: get_unread_count
-- (notification_log + community_notifications birleşik — tek sayı UI için)
-- ============================================================================
create or replace function public.get_unread_count()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_log_count int;
  v_community_count int;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  select count(*)::int into v_log_count
  from public.notification_log
  where user_id = v_uid and read_at is null;

  select count(*)::int into v_community_count
  from public.community_notifications
  where user_id = v_uid and read_at is null;

  return jsonb_build_object(
    'ok', true,
    'total', v_log_count + v_community_count,
    'log', v_log_count,
    'community', v_community_count
  );
end;
$$;

revoke all on function public.get_unread_count() from public;
grant execute on function public.get_unread_count() to authenticated;

-- ============================================================================
-- 4) RPC: mark_notification_tapped (push notification tap deep link sonrası)
-- ============================================================================
create or replace function public.mark_notification_tapped(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  update public.notification_log
     set tapped_at = coalesce(tapped_at, now()),
         read_at = coalesce(read_at, now())
   where id = p_id and user_id = v_uid;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.mark_notification_tapped(uuid) from public;
grant execute on function public.mark_notification_tapped(uuid) to authenticated;
