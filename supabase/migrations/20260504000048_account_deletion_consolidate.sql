-- Sprint 8.A.1 düzeltme — 47'deki paralel sistemi rollback, 32'nin sistemine geri dön
--
-- Migration 32 (settings_expansion) zaten `profiles.deletion_requested_at`
-- ve request/cancel_account_deletion RPC'lerini kurmuştu.
-- Migration 33 cron schedule eder, Edge fn (process-account-deletions) hard delete eder.
--
-- Migration 47 yanlışlıkla:
--   1) `account_deletion_requests` ayrı tablo açtı (paralel sistem)
--   2) Migration 32'nin RPC'lerini drop ile sildi (signature farklı diye)
--   3) Yeni cron job (process-account-deletions-daily) ekledi
--
-- Bu migration 47'nin yan etkilerini geri alır + yeni get_account_deletion_status() ekler.

-- ============================================================================
-- 1) Migration 47'nin yan etkilerini temizle
-- ============================================================================

-- Yeni cron job'u kaldır
do $$
begin
  if exists(select 1 from pg_extension where extname = 'pg_cron') then
    if exists(select 1 from cron.job where jobname = 'process-account-deletions-daily') then
      perform cron.unschedule('process-account-deletions-daily');
    end if;
  end if;
end$$;

-- Paralel tabloyu kaldır
drop table if exists public.account_deletion_requests cascade;

-- 47'in eklediği fonksiyonları kaldır (32'nin signature'ı farklı, 32'i ayrıca recreate edeceğiz)
drop function if exists public.request_account_deletion(text);
drop function if exists public.cancel_account_deletion();
drop function if exists public.get_account_deletion_status();
drop function if exists public.process_pending_deletions();

-- 47'in eklediği app_config (artık kullanılmıyor — 32 hard-coded 30 gün)
delete from public.app_config where key = 'account.deletion_cooldown_days';

-- ============================================================================
-- 2) Migration 32'nin RPC'lerini geri kur
-- (47 drop ettiği için)
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
-- 3) Yeni: durum sorgu (UI privacy ekranında "X gün kaldı" göstermek için)
-- ============================================================================

create or replace function public.get_account_deletion_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p.deletion_requested_at is null then null
    else jsonb_build_object(
      'requested_at', p.deletion_requested_at,
      'scheduled_for', p.deletion_requested_at + interval '30 days',
      'days_remaining',
        greatest(
          0,
          ceil(
            extract(epoch from (p.deletion_requested_at + interval '30 days' - now())) / 86400
          )::int
        )
    )
  end
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

revoke all on function public.get_account_deletion_status() from public;
grant execute on function public.get_account_deletion_status() to authenticated;
