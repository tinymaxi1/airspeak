-- Sprint 4.A — Settings Tam Kapsam: Backend altyapı
-- user_settings genişletme + soft account deletion + data export + notif tip-bazlı toggle
-- ============================================================================

-- ============================================================================
-- 1) USER_SETTINGS: tip-bazlı notif toggle + reminder + audio
-- ============================================================================
alter table public.user_settings
  add column if not exists notif_streak boolean not null default true,
  add column if not exists notif_league boolean not null default true,
  add column if not exists notif_community boolean not null default true,
  add column if not exists notif_offers boolean not null default true,
  add column if not exists notif_oral boolean not null default true,
  add column if not exists notif_placement boolean not null default true,
  add column if not exists study_reminder_hour smallint
    check (study_reminder_hour is null or (study_reminder_hour between 0 and 23)),
  add column if not exists quiet_hours_start smallint
    check (quiet_hours_start is null or (quiet_hours_start between 0 and 23)),
  add column if not exists quiet_hours_end smallint
    check (quiet_hours_end is null or (quiet_hours_end between 0 and 23)),
  add column if not exists tts_speed numeric(3,2) not null default 1.00
    check (tts_speed between 0.50 and 2.00),
  add column if not exists tts_auto_play boolean not null default true;

-- ============================================================================
-- 2) PROFILES: soft delete grace period
-- ============================================================================
alter table public.profiles
  add column if not exists deletion_requested_at timestamptz;

create index if not exists profiles_deletion_requested_idx
  on public.profiles (deletion_requested_at)
  where deletion_requested_at is not null;

-- admin_actions check constraint genişlet (Sprint 4.A user-driven aksiyonlar)
alter table public.admin_actions drop constraint if exists admin_actions_action_check;
alter table public.admin_actions add constraint admin_actions_action_check
  check (action in (
    'create', 'update', 'delete',
    'publish', 'unpublish', 'archive', 'restore',
    'set_premium', 'unset_premium',
    'ban_user', 'unban_user',
    'set_admin_role', 'unset_admin_role',
    'login', 'export', 'import', 'bulk_update',
    'account_deletion_requested', 'account_deletion_cancelled', 'account_hard_deleted',
    'data_export_requested'
  ));

-- ============================================================================
-- 3) DATA EXPORT REQUESTS (KVKK/GDPR — kullanıcı kendi verisini ister)
-- ============================================================================
create table if not exists public.data_export_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','processing','ready','sent','failed')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  file_url text,
  error text
);

create index if not exists data_export_requests_user_idx
  on public.data_export_requests (user_id, requested_at desc);

create index if not exists data_export_requests_status_idx
  on public.data_export_requests (status)
  where status in ('pending','processing');

alter table public.data_export_requests enable row level security;

drop policy if exists "data_export_select_own" on public.data_export_requests;
create policy "data_export_select_own"
  on public.data_export_requests for select
  using (auth.uid() = user_id);

drop policy if exists "data_export_insert_own" on public.data_export_requests;
create policy "data_export_insert_own"
  on public.data_export_requests for insert
  with check (auth.uid() = user_id);

-- ============================================================================
-- 4) RPC: should_send_notification (helper — Edge fn'den çağrılır)
-- ============================================================================
create or replace function public.should_send_notification(
  p_user_id uuid,
  p_category text
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_global boolean;
  v_typed boolean;
  v_quiet_start smallint;
  v_quiet_end smallint;
  v_now_hour smallint;
  v_tz text;
begin
  select us.notifications_enabled,
    case p_category
      when 'streak' then us.notif_streak
      when 'league' then us.notif_league
      when 'community' then us.notif_community
      when 'offers' then us.notif_offers
      when 'oral' then us.notif_oral
      when 'placement' then us.notif_placement
      else true
    end,
    us.quiet_hours_start,
    us.quiet_hours_end,
    coalesce(p.timezone, 'Europe/Istanbul')
  into v_global, v_typed, v_quiet_start, v_quiet_end, v_tz
  from public.user_settings us
  left join public.profiles p on p.id = us.user_id
  where us.user_id = p_user_id;

  if v_global is null or v_global = false then return false; end if;
  if v_typed = false then return false; end if;

  if v_quiet_start is not null and v_quiet_end is not null then
    v_now_hour := extract(hour from (now() at time zone v_tz))::smallint;
    if v_quiet_start < v_quiet_end then
      if v_now_hour >= v_quiet_start and v_now_hour < v_quiet_end then return false; end if;
    else
      if v_now_hour >= v_quiet_start or v_now_hour < v_quiet_end then return false; end if;
    end if;
  end if;

  return true;
end;
$$;

revoke all on function public.should_send_notification(uuid, text) from public;
grant execute on function public.should_send_notification(uuid, text) to authenticated, service_role;

-- ============================================================================
-- 5) RPC: request_account_deletion (soft delete — 30d grace)
-- ============================================================================
create or replace function public.request_account_deletion()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_grace_until timestamptz;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  v_grace_until := now() + interval '30 days';

  update public.profiles
  set deletion_requested_at = now()
  where id = v_uid;

  insert into public.admin_actions (actor_id, action, table_name, target_user_id, metadata)
  values (v_uid, 'account_deletion_requested', 'profiles', v_uid,
          jsonb_build_object('grace_until', v_grace_until));

  return jsonb_build_object(
    'ok', true,
    'grace_until', v_grace_until,
    'message', 'Hesabın 30 gün içinde kalıcı silinecek. Bu süre içinde giriş yaparak iptal edebilirsin.'
  );
end;
$$;

revoke all on function public.request_account_deletion() from public;
grant execute on function public.request_account_deletion() to authenticated;

-- ============================================================================
-- 6) RPC: cancel_account_deletion (kullanıcı pişmanlık)
-- ============================================================================
create or replace function public.cancel_account_deletion()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_was_set timestamptz;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  select deletion_requested_at into v_was_set
  from public.profiles where id = v_uid;

  if v_was_set is null then
    return jsonb_build_object('ok', false, 'error', 'no_pending_deletion');
  end if;

  update public.profiles
  set deletion_requested_at = null
  where id = v_uid;

  insert into public.admin_actions (actor_id, action, table_name, target_user_id, metadata)
  values (v_uid, 'account_deletion_cancelled', 'profiles', v_uid,
          jsonb_build_object('was_requested_at', v_was_set));

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.cancel_account_deletion() from public;
grant execute on function public.cancel_account_deletion() to authenticated;

-- ============================================================================
-- 7) RPC: request_data_export (KVKK/GDPR — kullanıcı kendi verisini ister)
-- ============================================================================
create or replace function public.request_data_export()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_existing uuid;
  v_id uuid;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  -- Son 24 saatte pending/processing varsa yeni istek açma (rate limit)
  select id into v_existing
  from public.data_export_requests
  where user_id = v_uid
    and status in ('pending','processing')
    and requested_at > now() - interval '24 hours'
  limit 1;

  if v_existing is not null then
    return jsonb_build_object(
      'ok', false,
      'error', 'already_pending',
      'message', 'Zaten son 24 saat içinde bir istek var. 24 saat içinde email ile gönderilecek.'
    );
  end if;

  insert into public.data_export_requests (user_id)
  values (v_uid)
  returning id into v_id;

  return jsonb_build_object(
    'ok', true,
    'id', v_id,
    'message', 'İstek alındı. Verilerin 24 saat içinde email ile gönderilecek.'
  );
end;
$$;

revoke all on function public.request_data_export() from public;
grant execute on function public.request_data_export() to authenticated;

-- ============================================================================
-- 8) RPC: get_settings_status (mobile sync — cancel buton için)
-- ============================================================================
create or replace function public.get_account_deletion_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_req timestamptz;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  select deletion_requested_at into v_req
  from public.profiles where id = v_uid;

  if v_req is null then
    return jsonb_build_object('ok', true, 'pending', false);
  end if;

  return jsonb_build_object(
    'ok', true,
    'pending', true,
    'requested_at', v_req,
    'grace_until', v_req + interval '30 days',
    'days_remaining', greatest(0, ceil(extract(epoch from (v_req + interval '30 days' - now())) / 86400)::int)
  );
end;
$$;

revoke all on function public.get_account_deletion_status() from public;
grant execute on function public.get_account_deletion_status() to authenticated;
